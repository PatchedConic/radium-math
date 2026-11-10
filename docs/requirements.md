# Radium Math — v1 Requirements

Nov 9, 2026 · @Isaiah Ware · Draft rev A

## 1. Purpose and scope

Radium Math v1 is a cross-platform desktop app for writing engineering calculation documents: formatted text, captioned images, and live natural-notation math with units, evaluated top to bottom, with show-work display and PDF export. Plots and spreadsheet tables follow in v2 (Section 7).

**Goals**

1. **G1 Report-ready:** a calc document reads as a finished report with no reformatting step.
2. **G2 Dimensionally sound:** every numeric result is unit-checked; inconsistent units are errors, never silent.
3. **G3 Safe to open:** opening an untrusted document cannot execute code or touch files or network.
4. **G4 Maintainable:** one hobbyist developer can understand, test and change any part of the codebase.

**Users:** the author (engineer writing an analysis) and the checker (engineer reviewing it).

**Priority key:** Must = v1 release blocker. Should = v1 target, may slip. Could = only if cheap.

## 2. Baseline decisions

These decisions are fixed for v1; changing one requires a logged decision record (MNT-06).

| ID | Decision | Choice | Rationale | Revisit if |
| --- | --- | --- | --- | --- |
| D1 | App shell | Tauri 2 with system webview; move to Tauri 3 CEF (Chromium) runtime once stable | Small install, iOS/Android path, Rust layer stays thin | Linux WebKitGTK defects block v1 before Tauri 3 is stable |
| D2 | UI language | TypeScript, strict mode | One language for UI and core logic; runs on every target | — |
| D3 | Document editor | ProseMirror | Structured documents with custom embedded blocks; Yjs collaboration path | — |
| D4 | Math input | MathLive | Mature natural-notation editing; outputs MathJSON | — |
| D5 | CAS | CortexJS Compute Engine, behind a `ComputeBackend` interface | Native TypeScript, shares MathJSON with MathLive, instant start | Capability spike (Q8) fails required symbolic cases |
| D6 | Units | Own TypeScript units layer over the MathJSON tree | Core engineering function; keeps CAS swappable | — |
| D7 | Evaluation order | Strictly top to bottom | Reads like a report; simple to reason about | — |
| D8 | File format | JSON with versioned schema, assets embedded | Safe to parse, diffable, migratable | — |
| D9 | Collaboration | Not in v1; model must stay Yjs-compatible | Retrofitting collaboration is very costly | — |

## 3. Document model and terms

A document is an ordered list of blocks plus metadata and a theme; user input is the source of truth and every computed result is a disposable cache.

| Term | Definition |
| --- | --- |
| Document | Metadata (title, number, revision, author, checker), theme, page setup, and an ordered list of blocks |
| Block | One unit of content with a stable unique ID. v1 types: heading, paragraph, list, math region, image, page break |
| Math region | A block holding one MathJSON expression of a given kind: definition, evaluation, symbolic, or check |
| Definition | `name := expr` — binds `name` for every block below it |
| Evaluation | `expr =` — displays the computed result |
| Symbolic | `expr →` — displays a symbolic result (simplify, solve, differentiate, etc.) |
| Check | A boolean condition (e.g. MS ≥ 0) displayed as pass or fail |
| Scope | Symbols visible at a block: all definitions above it, latest definition wins |
| Theme | Named styles (fonts, sizes, colors, spacing, numbering) applied document-wide |

**Evaluation pipeline** (one direction, each stage testable alone):

1. MathLive editor produces MathJSON.
2. Validator checks the tree against the allowed operator list (SEC-02).
3. Scope resolver walks blocks top to bottom and builds the symbol table.
4. Units layer checks dimensions and normalizes quantities.
5. `ComputeBackend` evaluates in a sandboxed worker (SEC-03).
6. Formatter applies display units and number format; renderer shows result or error.

## 4. Functional requirements

The app shall meet the following requirements, grouped by area.

### 4.1 Editing (EDT)

| ID | Requirement | Pri |
| --- | --- | --- |
| EDT-01 | Create, open, save, save-as and close documents. | Must |
| EDT-02 | Insert, delete and reorder blocks by mouse drag and by keyboard. | Must |
| EDT-03 | Undo and redo cover all block types, including edits inside math regions. | Must |
| EDT-04 | Copy and paste blocks within and between documents; paste plain text and images from the clipboard. | Must |
| EDT-05 | Autosave to a recovery file at a fixed interval (Q9); offer recovery on next launch after a crash. | Must |
| EDT-06 | Every insert and navigation action is reachable from the keyboard. | Should |

### 4.2 Text (TXT)

| ID | Requirement | Pri |
| --- | --- | --- |
| TXT-01 | Headings levels 1–4; paragraphs with bold, italic, underline, subscript, superscript, inline code and links. | Must |
| TXT-02 | Bulleted and numbered lists, nestable. | Must |
| TXT-03 | Inline display-only math inside text. | Should |
| TXT-04 | Inline live reference to a computed value inside text (e.g. "margin is {MS}"), updating on recalculation. | Should |
| TXT-05 | Markdown syntax typed in text converts to formatting as you type (WYSIWYG): # to #### headings, \*\*bold\*\*, \*italic\*, \`code\`, - and 1. lists, \[text\](url) links. Pasted Markdown converts the same way. | Must |

### 4.3 Math entry and evaluation (MTH)

| ID | Requirement | Pri |
| --- | --- | --- |
| MTH-01 | Natural-notation entry via MathLive: fractions, roots, powers, subscripted names, Greek letters, sums, integrals. | Must |
| MTH-02 | A definition binds a name for all blocks below it. | Must |
| MTH-03 | An evaluation displays its result beside the expression. | Must |
| MTH-04 | Evaluation is strictly top to bottom; using a name defined only below is an error at the use site. | Must |
| MTH-05 | Redefinition is allowed and shadows from that point down; the app marks redefined names visually. | Should |
| MTH-06 | Results recompute automatically after any edit, with no manual step. | Must |
| MTH-07 | Recalculation is incremental: only regions downstream of and dependent on the edit recompute. | Should |
| MTH-08 | User-defined functions with one or more arguments, e.g. f(x, y) := expr. | Must |
| MTH-09 | Symbolic operations: simplify, expand, factor, differentiate, integrate, solve. A case the backend cannot do is reported as an error, never a silent wrong answer. | Must |
| MTH-10 | Show-work display, toggled per region: formula, then substituted values with units, then result. | Must |
| MTH-11 | Number format per document, overridable per region: significant figures or decimals, fixed, scientific or engineering notation. | Must |
| MTH-12 | Errors appear at the failing region in plain language; dependent regions below show as blocked, never with stale values. | Must |
| MTH-13 | Built-in constants (π, e, g₀) and standard functions (trig, inverse trig, hyperbolic, exp, ln, log, abs, min, max). | Must |
| MTH-14 | Check regions show pass or fail; a document summary lists every check and its state. | Should |
| MTH-15 | Vector and matrix entry and arithmetic, unit-aware. | Should |

### 4.4 Units (UNT)

| ID | Requirement | Pri |
| --- | --- | --- |
| UNT-01 | Any numeric quantity may carry units, entered inline (e.g. 12 kN, 3.5 in). | Must |
| UNT-02 | Dimensions are checked on addition, subtraction, comparison and function arguments; trig, exp and log require dimensionless arguments. A mismatch is an error. | Must |
| UNT-03 | The author may set the display unit of any result (e.g. show σ in MPa); incompatible display units are an error. | Must |
| UNT-04 | A document default unit system (SI or US customary) applies to results with no display unit set. | Must |
| UNT-05 | Unit library: SI base and derived units with all SI prefixes; US customary (in, ft, lbf, lbm, slug, psi, ksi, BTU, °F, °R); common others (bar, atm, kgf, rpm). | Must |
| UNT-06 | Offset temperatures (°C, °F) distinguish absolute temperature from temperature difference. | Must |
| UNT-07 | Angles: radian is dimensionless; degree is a unit converting to radians. | Must |
| UNT-08 | Unit conversion factors are stored as exact rationals where the definition is exact. | Should |
| UNT-09 | Users can define new units in a document. | Should |
| UNT-10 | Arithmetic on quantities in different but compatible units converts automatically, with no manual step: e.g. 2 m × 3.4 in = 0.17272 m², and 2 m + 3.4 in = 2.08636 m. The result shows in its display unit (UNT-03) or the document default (UNT-04). | Must |

### 4.5 Images (IMG)

| ID | Requirement | Pri |
| --- | --- | --- |
| IMG-01 | Insert PNG, JPEG, WebP and SVG from file dialog, drag-and-drop or clipboard. | Must |
| IMG-02 | Each image has an optional caption, auto-numbered "Figure n". | Must |
| IMG-03 | Resize with locked aspect ratio; align left, center or right. | Must |
| IMG-04 | Images are embedded in the document file; no external links. | Must |

### 4.6 Layout and styling (STY)

| ID | Requirement | Pri |
| --- | --- | --- |
| STY-01 | Page setup: Letter and A4, portrait and landscape, margins. | Must |
| STY-02 | A theme sets fonts, sizes, colors and heading styles; changing it restyles the whole document. | Must |
| STY-03 | Headers and footers with fields: title, document number, revision, date, page n of N. | Must |
| STY-04 | Auto-numbered equations and sections, with cross-references that update. | Should |
| STY-05 | Regions can be collapsed in the editor and excluded from export. | Should |
| STY-06 | Title block from document metadata: title, number, revision, author, checker, date. | Should |
| STY-07 | Editing is continuous, with page-break markers showing where pages end; a paged preview matches export. | Should |

### 4.7 Export (EXP)

| ID | Requirement | Pri |
| --- | --- | --- |
| EXP-01 | Export to PDF with vector text and math; text is selectable and searchable. | Must |
| EXP-02 | Exported PDF matches the on-screen layout: same page breaks and numbering. | Should |
| EXP-03 | Export to self-contained HTML with no scripts. | Could |

### 4.8 File format (FIL)

| ID | Requirement | Pri |
| --- | --- | --- |
| FIL-01 | A document is one file containing JSON content and embedded assets (container format: Q4). | Must |
| FIL-02 | The schema carries a version. The app opens every older version through migrations, and refuses newer versions with a clear message. | Must |
| FIL-03 | Only user input (text, MathJSON, styles, assets) is authoritative; cached results are recomputed on open. | Must |
| FIL-04 | Every block persists its stable unique ID. | Must |
| FIL-05 | Serialization is deterministic (stable key order and formatting) so diffs are minimal. | Should |

## 5. Security requirements (SEC)

Documents are data, never code: no path may exist from document content to code execution, file access or network access.

| ID | Requirement | Pri |
| --- | --- | --- |
| SEC-01 | No document content is ever executed: no `eval`, `new Function`, dynamic `import`, or injected `<script>`, anywhere in the codebase. | Must |
| SEC-02 | Math reaches the compute backend only as a validated MathJSON tree; operators and functions not on an allow-list are rejected as errors. | Must |
| SEC-03 | Computation runs in a dedicated Web Worker with no DOM, file system, network or Tauri IPC access. | Must |
| SEC-04 | Each evaluation has a time limit (Q9); on breach the worker is terminated and restarted, and the region shows a timeout error. | Must |
| SEC-05 | Parse-time limits on expression size and nesting depth. | Should |
| SEC-06 | SVG is sanitized on import: scripts, event handlers, `foreignObject` and external references removed. | Must |
| SEC-07 | Opening or rendering a document triggers no network request. | Must |
| SEC-08 | Content Security Policy allows scripts from the app bundle only: no inline scripts, no remote origins. | Must |
| SEC-09 | Tauri capabilities grant the UI only file dialogs and read/write of user-chosen files; no shell or process plugins. | Must |
| SEC-10 | Files are validated against the schema before use; invalid input is rejected with an error, never partially loaded. | Must |
| SEC-11 | The file container is protected against path traversal and decompression bombs (size and entry-count limits). | Must |
| SEC-12 | Pasted text and HTML are reduced to the editor's allowed node types; everything else is dropped. | Must |
| SEC-13 | Exported HTML contains no scripts. | Must |
| SEC-14 | Fuzz tests cover the file parser, math validator and SVG sanitizer. | Should |
| SEC-15 | Lockfiles are committed; `pnpm audit` and `cargo audit` run in CI. | Should |

## 6. Non-functional requirements

Performance numbers below are provisional until the reference machine is fixed (Q9).

### 6.1 Platforms (PLT)

| ID | Requirement | Pri |
| --- | --- | --- |
| PLT-01 | Runs on Windows 10 and 11 (x64), macOS on Apple Silicon (versions: Q10), and Linux x64 (Fedora and Ubuntu LTS, Wayland and X11). | Must |
| PLT-02 | Core logic (model, scope, units, compute adapter) has no desktop-only dependency, so iOS and Android remain possible. | Should |
| PLT-03 | Runs without installation or administrator rights: macOS .app, Linux AppImage; on Windows a portable .exe (Windows 11, which ships WebView2) and a portable zip bundling a fixed WebView2 runtime (Windows 10). Opening it needs no network access. | Must |

### 6.2 Performance (PRF)

| ID | Requirement | Pri |
| --- | --- | --- |
| PRF-01 | Cold start to an editable document in ≤ 2 s. | Should |
| PRF-02 | Full recalculation of a 200-region document in ≤ 500 ms. | Should |
| PRF-03 | Keystroke-to-screen latency ≤ 50 ms in a 50-page document. | Must |
| PRF-04 | Computation never blocks the UI thread. | Must |

### 6.3 Reliability (REL)

| ID | Requirement | Pri |
| --- | --- | --- |
| REL-01 | Saves are atomic (write temp file, then rename); a crash mid-save never corrupts the existing file. | Must |
| REL-02 | A failure in any one region never crashes the app or blocks editing. | Must |

### 6.4 Accuracy (ACC)

| ID | Requirement | Pri |
| --- | --- | --- |
| ACC-01 | Numbers are stored at full double precision; display rounding never changes stored values. | Must |
| ACC-02 | A verification suite of hand-checked engineering problems passes, each to relative error ≤ 1e-12 or exactly. | Must |

### 6.5 Maintainability (MNT)

| ID | Requirement | Pri |
| --- | --- | --- |
| MNT-01 | TypeScript strict mode; any `any` carries a justification comment. | Must |
| MNT-02 | Layers depend inward only: UI → editor → core (model, scope, units) ← compute adapter. Core imports no UI, editor or Tauri code. | Must |
| MNT-03 | The CAS is reached only through `ComputeBackend`; a second backend needs no change outside its adapter. | Must |
| MNT-04 | Core code has ≥ 90% line coverage; the units layer has property-based tests. | Should |
| MNT-05 | Linting and formatting are enforced in CI. | Must |
| MNT-06 | Architecture decisions are recorded as decision records in the repo. | Must |
| MNT-07 | Golden-file tests: reference documents whose computed output must match stored expected results. | Must |

## 7. Out of scope for v1

These features are deferred; v1 architecture must not preclude the ones with a target release.

| Feature | Target |
| --- | --- |
| Editable plots with unit-aware axes | v2 |
| Tables as mini spreadsheets, unit-aware | v2 |
| Solve blocks: equation systems, root finding, optimization | v2 |
| Parameter sweeps | v2 |
| Reusable libraries imported from other documents | v2 |
| CSV and Excel import | v2 |
| DOCX export | v2 |
| Revision history, diff between revisions, checker sign-off | v2–v3 |
| Real-time multi-user collaboration (Yjs) | v3 |
| Uncertainty propagation | v3 |
| iOS and Android apps | v3+ |
| General scripting language | Not planned |
| MathCAD file import | Not planned |

## 8. Open questions

Q1, Q2, Q4, Q5, Q7 and Q8 are closed; the rest close during design.

| ID | Question | Options | Recommendation |
| --- | --- | --- | --- |
| Q1 | UI framework around ProseMirror | React, Svelte, Solid | Decided 2026-11-09: React |
| Q2 | Page model while editing | (a) True paged editing, text reflows across pages; (b) continuous editing with page-break markers and a paged preview | Decided 2026-11-09: (b), continuous editing (see STY-07) |
| Q3 | PDF engine | (a) Typst, converting the model to Typst markup; (b) webview print-to-PDF | Prototype both; (b) is simpler, (a) gives better typesetting and does not depend on the webview |
| Q4 | File container | (a) Zip of JSON plus assets; (b) single JSON with base64 assets; (c) folder | Decided 2026-11-09: (a), zip of JSON plus assets |
| Q5 | Math syntax | `:=` to define and `=` to evaluate (MathCAD style), or `=` to define and `=?` to evaluate | `Decided 2026-11-09: := to define, = to evaluate` |
| Q6 | Show-work convention | Which values get substituted (inputs only, or intermediates too), and whether units show at each step | Decide with example reports from your own work |
| Q7 | App license | Open source (MIT, Apache-2.0, GPL) or closed | Decided 2026-11-09: MIT; dependencies must be MIT-compatible (no GPL) |
| Q8 | CortexJS capability | Run 15–20 representative calcs through the Compute Engine | Decided 2026-11-09: keep CortexJS; spike deferred, revisit per D5 if a needed case fails |
| Q9 | Numeric parameters | Autosave interval, evaluation timeout, reference machine for PRF targets | Suggested: 30 s autosave, 5 s timeout |
| Q10 | macOS coverage | Apple Silicon only, or Intel too; minimum macOS version | Apple Silicon, current plus previous two versions |

## 9. Verification

Every requirement is verified by Test (T), Demonstration (D), Inspection (I) or Analysis (A); every automated test is tagged with the requirement ID it verifies, which gives traceability.

| Area | Primary method | How |
| --- | --- | --- |
| MTH, UNT, ACC | T | Unit tests on core; golden-file reference documents; property-based unit tests (e.g. convert A→B→A returns A) |
| SEC | T, I | Fuzzing; a corpus of malicious documents (oversized, deeply nested, script-bearing SVG, zip bombs); code search proving no `eval` or `Function` (SEC-01) |
| EDT, TXT, IMG, STY | T, D | Editor tests in a headless browser; release demo checklist |
| EXP | D, I | PDF of each reference document reviewed against the screen |
| PLT | D | Release checklist run on Windows, macOS, Fedora (Wayland) and Ubuntu (X11) |
| PRF | T | Benchmarks in CI on a large reference document |
| MNT | I, T | Lint and dependency-direction checks in CI; coverage report |

The verification suite (ACC-02) should begin with 20 problems from your own past analyses with known answers, covering both SI and US customary units.
