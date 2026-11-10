# 0004. Use MathLive for math input and MathJSON as the interchange format

- **Status:** Accepted; storing and exchanging math as MathJSON superseded by [0017](0017-latex-storage.md)
- **Date:** 2026-11-09
- **Source:** D4; MTH-01, SEC-02, EDT-03, PRF-03

## Context

Engineers expect natural-notation entry: fractions, roots, powers, subscripted names, Greek letters, sums and integrals (MTH-01). Building a math editor is a large project. MathLive is a mature web component for this, and it outputs MathJSON, a JSON expression tree that the CortexJS Compute Engine also uses ([0005](0005-cortexjs-compute-backend.md)).

## Decision

- Use MathLive's `<math-field>` for math entry.
- Store and exchange math as MathJSON: in the document, in region inputs sent to the worker, and between validator and compute backend.
- A ProseMirror node view hosts the `<math-field>` directly, not through React. On change it writes the field's MathJSON into the node's attributes as one transaction.

## Consequences

- One tree format runs from editor to CAS, with no LaTeX parsing in the pipeline.
- MathJSON from the editor or a file is **untrusted** until `core/validate` accepts it against the operator allow-list (SEC-02). The type `MathJson = unknown` makes this explicit.
- Undo covers math edits (EDT-03), and typing stays fast because React is not in the loop (PRF-03).
- Quantities are stored as `["Quantity", value, unitExpr]` ([0012](0012-unit-slot.md)).
- MathLive may need `style-src 'unsafe-inline'` in the CSP. This is checked in M2 and recorded in a new ADR if required.
