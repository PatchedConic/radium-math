# Radium Math

Desktop app for engineering calculation documents: formatted text, images, and live math with units, evaluated top to bottom, exported to PDF. Tauri 2 shell, React + ProseMirror editor, all computation in a sandboxed Web Worker.

- Requirements: [docs/requirements.md](docs/requirements.md). IDs such as `SEC-03` or `D5` refer to it.
- Architecture: [docs/architecture.md](docs/architecture.md). "Section n" below means a section of that doc.
- Milestone plan: [docs/plan.md](docs/plan.md). Its milestones, task IDs (e.g. `M1-T4`) and "Rules for every session" govern what to work on. Read it after this file.
- Decisions: [docs/adr/](docs/adr/). A baseline decision (requirements Section 2) changes only through a new ADR (MNT-06).

Goal G4 governs everything: one hobbyist developer must be able to understand, test and change any part. Prefer the plain, explicit solution.

## Working agreement

- Work only on tasks in the current milestone of [docs/plan.md](docs/plan.md). Propose how you will do a task and wait for approval before starting it. Ideas outside the milestone go in its Backlog.
- Work one task at a time. Show what changed, then **wait for an explicit OK before each commit**.
- **Ask before adding any dependency** not listed in architecture Section 10, npm or Rust. Every dependency must be MIT-compatible (no GPL, LGPL or AGPL).
- Choose package versions that are past pnpm's minimum release age. Never add `minimumReleaseAge` exemptions or edit `pnpm-workspace.yaml` to get around the policy.
- Never push, and never change Tauri capabilities or the CSP, without asking.

## Commands

| Command                                       | What it does                                                                       |
| --------------------------------------------- | ---------------------------------------------------------------------------------- |
| `pnpm install`                                | Install dependencies from `pnpm-lock.yaml`                                         |
| `pnpm tauri dev`                              | Run the desktop app with hot reload                                                |
| `pnpm dev`                                    | Run only the Vite dev server (browser at http://localhost:1420, no Tauri APIs)     |
| `pnpm check`                                  | **Every gate:** typecheck, lint, format, layer rules, licenses, SEC-01 scan, tests |
| `pnpm test` / `pnpm test:watch`               | Vitest, once or on save                                                            |
| `pnpm exec vitest run src/core/units`         | Tests for one folder                                                               |
| `pnpm typecheck`                              | `tsc` for the app, for core with no DOM or Node types, and for config files        |
| `pnpm lint` / `pnpm format`                   | ESLint / Prettier (format rewrites files)                                          |
| `pnpm deps:check`                             | dependency-cruiser layer rules                                                     |
| `pnpm licenses:check` / `pnpm security:check` | npm license allow-list / SEC-01 code search                                        |
| `pnpm build` / `pnpm tauri build`             | Frontend bundle / desktop bundle                                                   |

Rust commands run from `src-tauri/`:

| Command                                     | What it does                                        |
| ------------------------------------------- | --------------------------------------------------- |
| `cargo fmt --check`                         | Rust formatting                                     |
| `cargo clippy --all-targets -- -D warnings` | Rust lint                                           |
| `cargo deny check licenses bans sources`    | Crate license allow-list and crates.io-only sources |
| `cargo audit`                               | Rust security advisories                            |

CI (`.github/workflows/ci.yml`) runs all of the above on every push.

CI also runs `vite build` (the bundle Tauri ships).

Local setup: Node 22 (`.nvmrc`), pnpm pinned by `packageManager` in `package.json`, and Rust stable via rustup. `~/.cargo/env` must be sourced for `cargo` to be on PATH.

## Layers (Section 2, MNT-02)

Dependencies point only toward `core`. `pnpm deps:check` (`.dependency-cruiser.cjs`) enforces this, and so does `tsconfig.core.json`, which typechecks core with no DOM or Node types.

| Layer             | Folder                    | May import                                                                                                                                                     |
| ----------------- | ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Core              | `src/core`                | Only core, plus npm packages on `coreAllowedPackages` in `.dependency-cruiser.cjs` (currently none). No DOM, no Node built-ins, no React, ProseMirror or Tauri |
| Core: CAS adapter | `src/core/compute/cortex` | The only place CortexJS may be imported (MNT-03)                                                                                                               |
| Worker            | `src/worker`              | `core`                                                                                                                                                         |
| Editor            | `src/editor`              | `core`, except `core/engine` and `core/compute` (evaluation runs in the worker)                                                                                |
| UI                | `src/ui`                  | `editor`, `platform`, and core **types only** (`import type`)                                                                                                  |
| Platform          | `src/platform`            | `@tauri-apps/api` only. The only layer that may import `@tauri-apps/*`                                                                                         |
| Shell             | `src-tauri`               | Tauri crates. Kept to the five commands in Section 8                                                                                                           |

If a feature seems to need a forbidden import, the design is wrong. Move the code to the right layer or pass the data through an interface. Never weaken a rule to make an import pass: changing a rule needs an ADR and the user's approval.

## Security rules (requirements Section 5)

Documents are data, never code.

- **No code from strings, anywhere (SEC-01):** no `eval`, `new Function` / `Function()`, dynamic `import()`, string `setTimeout` or `setInterval`, `innerHTML` / `outerHTML` assignment, `insertAdjacentHTML`, `dangerouslySetInnerHTML`, or `document.write`. ESLint and `scripts/check-forbidden.mjs` both enforce this.
- **Never call CortexJS `compile()`:** it generates JavaScript. Never pass LaTeX strings to CortexJS. Evaluate only validated MathJSON through `ComputeBackend`.
- **Math crosses into compute only as `ValidExpr` (SEC-02):** `ValidExpr` is a branded type that only `core/validate` can produce. Never cast to it.
- **The worker gets no DOM, file, network or Tauri IPC access (SEC-03).** Every evaluation has a timeout, enforced by terminate and restart (SEC-04).
- **Untrusted bytes enter at three points only:** file open, paste and image import. Each goes through its single validator (Section 8), and nothing downstream trusts raw input.
- **No network:** opening or rendering a document makes no request (SEC-07). The CSP lives in `src-tauri/tauri.conf.json` (SEC-08).
- **Tauri capabilities stay at `core:default` plus the dialog and file commands of Section 8 (SEC-09):** no shell, http, process or updater plugins. A new permission needs an ADR.
- **`any` is banned (MNT-01).** The rare justified exception uses `// eslint-disable-next-line @typescript-eslint/no-explicit-any -- <reason>`. Every disable comment needs a `-- reason`.

## Conventions

- **TypeScript:** strict mode with `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes` (`tsconfig.base.json`). Use `import type` for types. Make `switch` statements over unions exhaustive.
- **Tests:**
  - Test files live next to the code as `*.test.ts(x)`. Golden documents go in `tests/golden/` (MNT-07, ACC-02), hostile files in `tests/malicious/`, and Playwright tests in `tests/e2e/`.
  - Start each test name with the requirement IDs it verifies, e.g. `it("[UNT-10] adds m and in", …)`, which gives traceability (requirements Section 9). `[placeholder]` marks a test that verifies nothing yet.
  - Use fast-check property tests for the units layer (MNT-04).
- **Core purity:** core is pure functions over plain data. The editor owns document state, and React holds only UI state (Section 7). Never store computed results in the document (FIL-03).
- **Errors:** a failing region reports an `ErrorCode` and a plain-language message. It never throws past the engine, and it never shows stale values (MTH-12, REL-02).
- **Rust:** keep the shell thin. All logic belongs in TypeScript core.
- **Formatting:** Prettier owns it. Don't hand-format, and don't reformat `docs/requirements.md` or `docs/architecture.md` (they're maintained elsewhere).
- **Commits:** use Conventional Commit prefixes (`feat:`, `fix:`, `test:`, `chore:`, `ci:`, `docs:`). Keep one task per commit.

## Definition of done

A change is done when all of these hold:

1. `pnpm check` passes.
2. If `src-tauri/` changed, `cargo fmt --check`, `cargo clippy --all-targets -- -D warnings` and `cargo deny check licenses bans sources` pass.
3. New behaviour has tests, tagged with requirement IDs. Core changes keep core line coverage at ≥ 90% once the coverage gate exists (MNT-04, from M1).
4. No new dependency, Tauri permission, CSP change or layer-rule change went in without the user's approval. Any baseline change has an ADR.
5. Docs match the code: architecture, the ADRs, and this file's commands and rules.
6. The task's box in [docs/plan.md](docs/plan.md) is ticked in the same commit.
7. The user has reviewed the diff and said OK to commit.
