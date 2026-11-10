# Architecture decision records

Each file records one decision: its context, the decision itself, and its consequences (MNT-06). Records are never edited to change a decision. A new record supersedes the old one, and the old one's status is updated to point to it. Changing a baseline decision (requirements Section 2) requires a new record.

To add one, copy [template.md](template.md) to the next number.

| ADR                                         | Decision                                                                    | Source        | Status                                                             |
| ------------------------------------------- | --------------------------------------------------------------------------- | ------------- | ------------------------------------------------------------------ |
| [0001](0001-tauri-shell.md)                 | Tauri 2 shell; move to the CEF runtime in Tauri 3 when stable               | D1            | Accepted                                                           |
| [0002](0002-typescript-react.md)            | TypeScript strict, React for app chrome                                     | D2, Q1        | Accepted                                                           |
| [0003](0003-prosemirror-source-of-truth.md) | ProseMirror document is the source of truth; results are never stored in it | D3, FIL-03    | Accepted                                                           |
| [0004](0004-mathlive-mathjson.md)           | MathLive for math input, MathJSON as the interchange format                 | D4            | Accepted; storage superseded by [0017](0017-latex-storage.md)      |
| [0005](0005-cortexjs-compute-backend.md)    | CortexJS behind `ComputeBackend`; no `compile()`                            | D5, Q8        | Accepted; LaTeX clause superseded by [0017](0017-latex-storage.md) |
| [0006](0006-units-layer.md)                 | Own units layer: SI magnitude plus rational dimension vector                | D6            | Accepted                                                           |
| [0007](0007-worker-evaluation.md)           | Top-to-bottom evaluation in a sandboxed Web Worker                          | D7, SEC-03    | Accepted                                                           |
| [0008](0008-file-format.md)                 | Deterministic zip file format with content-addressed assets                 | D8, Q4        | Accepted                                                           |
| [0009](0009-mit-license.md)                 | MIT license; MIT-compatible dependencies only                               | Q7            | Accepted                                                           |
| [0010](0010-continuous-editing.md)          | Continuous editing with page-break markers                                  | Q2            | Accepted                                                           |
| [0011](0011-portable-distribution.md)       | Portable distribution on all three OSes                                     | PLT-03        | Accepted                                                           |
| [0012](0012-unit-slot.md)                   | Explicit unit slot; units and variables never share names                   | A3            | Accepted                                                           |
| [0013](0013-symbolic-substitution.md)       | Symbolic regions substitute values defined above                            | A2            | Accepted                                                           |
| [0014](0014-symbolic-units.md)              | Units carried through symbolic math as SI base-unit symbols                 | A1            | Accepted                                                           |
| [0015](0015-tauri-capabilities.md)          | Explicit list of Tauri core permissions, not `core:default`                 | SEC-09        | Accepted                                                           |
| [0016](0016-unit-slot-trigger.md)           | Space after a number opens the unit slot, marked `\htmlData{unit}`          | A3, M1-T1     | Accepted                                                           |
| [0017](0017-latex-storage.md)               | Store math as LaTeX; parse it to MathJSON in the worker                     | D4, D5, M1-T1 | Accepted                                                           |
