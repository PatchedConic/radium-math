# Radium Math — Milestone Plan

Status: M0 in progress · Last updated 2026-11-09

This file defines the milestones and tasks for Radium Math v1. It sits alongside
`docs/requirements.md` (what to build) and `docs/architecture.md` (how it is built).
Requirement IDs such as UNT-10 refer to `requirements.md`; decision IDs such as A3
refer to `architecture.md` Section 11.

## Rules for every session

1. Read `CLAUDE.md`, then this file. Read the requirements and architecture sections
   named by the tasks you are working on.
2. Work on one milestone at a time, and only on tasks listed under it. Task IDs are
   stable: refer to them as `M1-T4`, and so on.
3. Before starting a task, propose how you will do it and wait for approval.
4. When a task is done (code, tests and docs, all passing CI), tick its box here in
   the same commit.
5. Ideas outside the current milestone go in the Backlog section at the bottom, not
   into the code.
6. A milestone is finished only when its exit criteria are met and a fresh-session
   review against the requirements and architecture finds no open gaps.

## Milestone overview

| Milestone | Goal | Exit criteria |
| --- | --- | --- |
| M0 Foundation | Repo, toolchain, CI, standards | `pnpm tauri dev` opens an empty window; CI passes |
| M1 Math engine | Calculation pipeline with units, no UI | Golden reference calcs pass in Node; worker tests pass |
| M2 Editor and files | Usable editor with live math; save and open | Create, edit, save, reopen a document with live math; recover after a forced crash |
| M3 Engineering completeness | Full unit, symbolic and show-work features | One of your past analyses rewritten in Radium Math and added to the golden suite |
| M4 Report quality | Images, layout, styling, PDF export | That analysis exports to a PDF fit to hand to a checker |
| M5 Release | Hardening, performance, portable builds | Release checklist passes on Windows, macOS, Fedora (Wayland) and Ubuntu (X11) |

## M0 Foundation

- [ ] M0-T1 Check prerequisites: Node 22 LTS, pnpm, Rust via rustup, Tauri 2 system packages. List sudo commands for the user; do not run them.
- [ ] M0-T2 Scaffold Tauri 2 + React + strict TypeScript + Vite with the folder layout in architecture Section 3.
- [ ] M0-T3 Tooling: ESLint + typescript-eslint, Prettier, Vitest, fast-check, dependency-cruiser layer rules (architecture Section 2), license check (MIT-compatible only).
- [ ] M0-T4 GitHub Actions CI: typecheck, lint, layer rules, license check, tests, `pnpm audit`, `cargo audit` (MNT-05 lint enforced in CI; SEC-15 audits in CI).
- [ ] M0-T5 Write `CLAUDE.md`: conventions, layer rules, security rules (no `eval`, `Function`, or CortexJS `compile()`), commands, definition of done, pointer to this file.
- [ ] M0-T6 Write `docs/adr/0001` to `0014` from architecture Section 11 (MNT-06 decision records in repo).
- [ ] M0-T7 Replace the diagram placeholder in `architecture.md` with a Mermaid diagram.
- [ ] M0-T8 Add the MIT `LICENSE`.

## M1 Math engine (no UI)

- [ ] M1-T1 MathLive spike: confirm the space-after-number unit slot (A3), or fall back to a dedicated key. Record the result as ADR 0015.
- [ ] M1-T2 Core types: `RegionInput`, `RegionResult`, `Quantity`, `Dimension`, `Rational`, `ValidExpr` (architecture Section 4).
- [ ] M1-T3 Rational and dimension arithmetic, with property-based tests (MNT-04 property tests for units).
- [ ] M1-T4 Unit registry, core set: SI base and derived units with prefixes, main US customary units, exact factors (UNT-05 unit library; UNT-08 exact rational factors).
- [ ] M1-T5 Dimension inference rules, including angles (UNT-02 dimension checking; UNT-07 radians dimensionless, degrees a unit).
- [ ] M1-T6 Offset temperatures (UNT-06 absolute vs. difference for °C and °F).
- [ ] M1-T7 Validator: operator allow-list, `Quantity` node, size and depth limits (SEC-02 only validated math reaches the engine; SEC-05 parse limits).
- [ ] M1-T8 Scope resolver (MTH-02 definitions bind below; MTH-04 strictly top to bottom; MTH-05 redefinition shadows).
- [ ] M1-T9 CortexJS adapter behind `ComputeBackend`; never calls `compile()` (MNT-03 CAS only via the interface; SEC-01 nothing executed).
- [ ] M1-T10 Engine: pipeline, change detection, blocked results (MTH-06 automatic recompute; MTH-07 incremental; MTH-12 errors shown, never stale values).
- [ ] M1-T11 Display conversion, default unit system, number formatting (UNT-03 display unit; UNT-04 SI or US default; UNT-10 mixed compatible units convert automatically; MTH-11 number format).
- [ ] M1-T12 Worker host: protocol, revision handling, timeout watchdog, test proving no Tauri IPC in the worker (SEC-03 sandboxed worker; SEC-04 time limit; PRF-04 UI never blocked).
- [ ] M1-T13 Golden test harness and first reference calcs, including 2 m × 3.4 in = 0.17272 m² (MNT-07 golden files; ACC-02 verification suite).

## M2 Editor and files

- [ ] M2-T1 ProseMirror schema with stable block IDs (architecture Section 7; FIL-04 persistent block IDs).
- [ ] M2-T2 Text formatting, headings, lists (TXT-01 headings and marks; TXT-02 nestable lists).
- [ ] M2-T3 Markdown input rules and Markdown paste (TXT-05 Markdown as you type; SEC-12 paste reduced to the schema).
- [ ] M2-T4 Math region node view: MathLive field, unit slot from M1-T1 (MTH-01 natural-notation entry).
- [ ] M2-T5 Engine link plugin: send regions to the worker, draw results, errors and blocked states (MTH-03 result beside expression; MTH-12).
- [ ] M2-T6 Insert, delete and reorder blocks by mouse and keyboard; copy and paste blocks (EDT-02 reorder; EDT-04 copy/paste; EDT-06 keyboard reachable).
- [ ] M2-T7 Undo and redo across all blocks, including math (EDT-03).
- [ ] M2-T8 Confirm MathLive works under the CSP; ADR if `style-src 'unsafe-inline'` is needed (SEC-08 bundle-only scripts).
- [ ] M2-T9 File format: zip container, manifest, zod-validated `document.json`, deterministic writes, unzip limits, migration scaffold (FIL-01 to FIL-05 file format; SEC-10 validate before use; SEC-11 zip-bomb and path-traversal limits).
- [ ] M2-T10 Rust commands: open/save dialogs, path allow-list, read, atomic write (EDT-01 open/save; REL-01 atomic saves; SEC-09 minimal capabilities).
- [ ] M2-T11 Autosave and crash recovery (EDT-05). Needs Q9 autosave interval; proposed 30 s.

## M3 Engineering completeness

- [ ] M3-T1 Complete the unit library and add user-defined units (UNT-05; UNT-09 user units).
- [ ] M3-T2 Per-result display unit in the UI (UNT-03).
- [ ] M3-T3 Settle Q6 (show-work convention), then implement show-work (MTH-10 formula, substituted values, result).
- [ ] M3-T4 User-defined functions (MTH-08).
- [ ] M3-T5 Built-in constants and standard functions (MTH-13).
- [ ] M3-T6 A1 test: CortexJS symbolic operations with SI base-unit symbols substituted. ADR if the approach changes.
- [ ] M3-T7 Symbolic operations: simplify, expand, factor, differentiate, integrate, solve (MTH-09; A2 values substituted).
- [ ] M3-T8 Check regions and the checks summary panel (MTH-14 pass/fail with summary).
- [ ] M3-T9 Visual marking of redefined names (MTH-05).
- [ ] M3-T10 Inline math and live value references in text (TXT-03 inline math; TXT-04 live values in text).
- [ ] M3-T11 Vectors and matrices, unit-aware (MTH-15, Should).

## M4 Report quality

- [ ] M4-T1 Images: insert, caption, resize, align, embed; SVG shown via `<img>` and sanitized; paste images (IMG-01 to IMG-04; SEC-06 SVG sanitizing; EDT-04 image paste).
- [ ] M4-T2 Themes (STY-02 document-wide styles).
- [ ] M4-T3 Page setup (STY-01 Letter/A4, orientation, margins).
- [ ] M4-T4 Headers, footers and title block (STY-03 header/footer fields; STY-06 title block).
- [ ] M4-T5 Auto-numbering and cross-references for equations, figures and sections (STY-04; IMG-02 figure numbers).
- [ ] M4-T6 Page-break markers and paged preview (STY-07 continuous editing with page markers).
- [ ] M4-T7 Collapse regions and exclude them from export (STY-05).
- [ ] M4-T8 PDF engine prototype, Typst vs. webview print; record the choice as an ADR (A6, Q3).
- [ ] M4-T9 PDF export (EXP-01 vector, searchable PDF; EXP-02 matches screen layout).
- [ ] M4-T10 HTML export with no scripts (EXP-03, Could; SEC-13 no scripts in export).

## M5 Release

- [ ] M5-T1 Fuzz tests and malicious-file corpus (SEC-14 fuzzing of parser, validator, SVG sanitizer).
- [ ] M5-T2 Fix the reference machine (Q9), then benchmark and tune (PRF-01 start ≤ 2 s; PRF-02 recalculation ≤ 500 ms; PRF-03 typing latency ≤ 50 ms).
- [ ] M5-T3 Security review against SEC-01 to SEC-15, including dependency audits.
- [ ] M5-T4 Reach the coverage target (MNT-04 ≥ 90% core coverage).
- [ ] M5-T5 Settle Q10 (macOS versions); portable builds in CI for every OS, including the Windows 10 zip with fixed WebView2 (PLT-01 platforms; PLT-03 no install or admin rights).
- [ ] M5-T6 Release checklist on Windows, macOS, Fedora (Wayland) and Ubuntu (X11).
- [ ] M5-T7 Tag v1.0.0.

## Pending decisions

| ID | Decision | Needed by |
| --- | --- | --- |
| Q6 | Show-work convention: which values are substituted, units at each step | M3-T3 |
| Q9 | Autosave interval, evaluation timeout, reference machine (proposed 30 s, 5 s) | M1-T12 (timeout), M2-T11 (autosave), M5-T2 (machine) |
| Q10 | macOS coverage and minimum version (proposed Apple Silicon, current plus previous two) | M5-T5 |
| A6 | PDF engine | M4-T8 |

## Change log

- 2026-11-09: Plan created. File save, open and autosave moved from M5 to M2 so the app is usable from M2 on.

## Backlog

Ideas raised during work that are outside the current milestone. Triage at each milestone boundary.

- (empty)
