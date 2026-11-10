# 0005. Use CortexJS behind a `ComputeBackend` interface, and never call `compile()`

- **Status:** Accepted
- **Date:** 2026-11-09
- **Source:** D5, Q8; MNT-03, MTH-09, SEC-01, SEC-02

## Context

Evaluation and symbolic operations (simplify, expand, factor, differentiate, integrate, solve; MTH-09) need a computer algebra system. The CortexJS Compute Engine is native TypeScript, shares MathJSON with MathLive, and starts instantly. Its full capability on engineering calculations is not yet proven: the capability spike (Q8) was deferred.

CortexJS can also `compile()` expressions into JavaScript, and it has program operators (assignment, loops, declarations). Either would give document content a path to code execution.

## Decision

- Use the CortexJS Compute Engine as the v1 CAS.
- Reach it only through the `ComputeBackend` interface (`src/core/compute/backend.ts`). The interface takes only validated trees (`ValidExpr`) and plain SI numbers, and knows nothing about units.
- Only `src/core/compute/cortex` imports CortexJS.
- The adapter never calls `compile()` and never parses LaTeX strings. Cortex program operators are not on the validator's allow-list.

## Consequences

- A second backend needs no change outside its adapter (MNT-03). dependency-cruiser enforces the import boundary.
- ESLint and `scripts/check-forbidden.mjs` ban `.compile(` calls (SEC-01).
- A case the backend cannot handle must surface as an `unsupported` error, never a silent wrong answer (MTH-09).
- Units stay out of the CAS ([0006](0006-units-layer.md)). Symbolic results carry units as base-unit symbols ([0014](0014-symbolic-units.md)).
- **Revisit if** a required symbolic case fails. The Q8 spike (15–20 representative calcs) runs when symbolic work starts.
