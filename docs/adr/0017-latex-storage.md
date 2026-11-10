# 0017. Store math as LaTeX and parse it to MathJSON inside the worker

- **Status:** Accepted
- **Date:** 2026-11-09
- **Source:** D4, D5, M1-T1; SEC-02, SEC-03, SEC-04, SEC-05, FIL-03, MNT-03
- **Supersedes in part:** [0004](0004-mathlive-mathjson.md) (math stored and exchanged as MathJSON) and [0005](0005-cortexjs-compute-backend.md) (the adapter never parses LaTeX)

## Context

[0004](0004-mathlive-mathjson.md) assumed MathLive outputs MathJSON. The M1-T1 spike showed that it does not do so by itself:

- MathLive 0.104 produced `getValue("math-json")` by handing the field's LaTeX to a CortexJS Compute Engine registered on `globalThis[Symbol.for("io.cortexjs.compute-engine")]`. Without one, it returned nothing.
- MathLive 0.111.4, the current version, has removed `"math-json"` from its output formats. MathJSON is available only by passing the LaTeX to CortexJS's `ce.parse()`.

So any MathJSON from a `<math-field>` comes from CortexJS parsing LaTeX. That conflicts with the layer rule that only `core/compute/cortex` imports CortexJS, and with the rule that LaTeX strings never reach CortexJS. Three ways forward were considered:

- (a) Store LaTeX in the document and parse it with CortexJS inside the sandboxed worker.
- (b) Load CortexJS on the main thread so MathLive can produce MathJSON, as 0004 assumed.
- (c) Write our own serializer from MathLive's internal model, or our own parser for a subset of LaTeX.

Option (b) puts a large CAS parsing untrusted input outside the sandbox and breaks the layer rules. Option (c) is a lot of brittle code to maintain, which works against G4.

## Decision

Option (a).

- A math region stores the field's LaTeX exactly as MathLive serializes it, including unit slots (`\htmlData{unit}{…}`, [0016](0016-unit-slot-trigger.md)). The document never holds MathJSON produced from it.
- `RegionInput` carries LaTeX strings. The editor still splits `name := expr` into its parts, as before.
- In the worker, the CortexJS adapter parses LaTeX into MathJSON. This is the only place a LaTeX string reaches CortexJS. The parser's output is untrusted MathJSON. It then goes through `core/validate`, so nothing reaches compute except a `ValidExpr` (SEC-02 is unchanged).
- Before parsing, the engine rejects LaTeX longer than a fixed limit (SEC-05). Parsing runs under the same per-region timeout as evaluation (SEC-04).
- The adapter still never calls `compile()`.

## Consequences

- CortexJS stays inside the worker sandbox, and the layer rules are unchanged (MNT-03, SEC-03). A hostile or pathological LaTeX string can at worst hang the worker until the watchdog restarts it.
- The document stores what the user typed, and it reloads into MathLive exactly (shown by the spike's round trip). There is no lossy MathJSON-to-LaTeX conversion on open.
- The CortexJS parser becomes part of the attack surface, inside the sandbox. Malicious-file tests (`tests/malicious/`) must cover hostile LaTeX: deep nesting, huge numbers, unknown commands and very long strings.
- The parse has to map a number followed by a unit slot to `["Quantity", value, unitExpr]`. M1-T14 checks how CortexJS parses `\htmlData{unit}{…}`, and whether a custom LaTeX dictionary entry or a small step in the adapter is needed.
- CortexJS's LaTeX parser now affects correctness. If a CortexJS upgrade changes how it parses, golden tests will catch it.
- Files store LaTeX, so a later change of parser needs no file migration.
- The `ComputeBackend` interface gains a parse operation that returns untrusted MathJSON.
- Updated to match: requirements D4 rationale, the pipeline in Section 3, the math region definition and FIL-03; architecture Sections 4, 5, 7, 8 and 11; CLAUDE.md's security rules.
- Revisit if CortexJS cannot parse engineering notation reliably (M1-T14). The fallback is option (c), limited to the LaTeX MathLive produces.
