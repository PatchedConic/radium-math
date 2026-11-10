# 0007. Evaluate strictly top to bottom, in a sandboxed Web Worker

- **Status:** Accepted
- **Date:** 2026-11-09
- **Source:** D7, SEC-03; MTH-04, MTH-06, MTH-07, MTH-12, SEC-04, PRF-04

## Context

A calc document should read like a report: a name is defined before it is used, and the reader can follow the work from top to bottom (D7). Computation also has to be safe and must never freeze the UI. A hostile or runaway expression must not reach the DOM, files, network or Tauri IPC (SEC-03), and it must not hang the app (SEC-04, PRF-04).

## Decision

- **Order:** evaluation runs strictly top to bottom. Using a name that is defined only below is a `defined-below` error at the use site (MTH-04). A redefinition shadows from that point down.
- **Sandbox:** the engine runs in a dedicated Web Worker (`src/worker`) with no DOM, file system, network or Tauri IPC access.
- **Protocol:** the UI sends the full region list with a document revision number. The worker diffs it against its cache and returns results, and the UI drops results for stale revisions.
- **Incremental recalculation:** each region's cache key is its input hash plus the output hashes of the definitions it read. Only regions whose key changed are recomputed (MTH-06, MTH-07).
- **Failures:** a failed definition enters the scope marked as failed. Regions that read it return `blocked`, never stale values (MTH-12).
- **Timeouts:** the worker posts "starting region X" before each region. If the time limit passes, the UI-side host terminates the worker, marks region X `timeout`, starts a fresh worker and resends with X skipped (SEC-04).

## Consequences

- One mechanism gives both correct ordering and incremental recalculation.
- The UI thread never blocks on computation (PRF-04).
- The worker's isolation must be tested. A test in M1 checks that it has no Tauri IPC handle.
- The worker may import only `core`, which dependency-cruiser enforces.
- Forward references are impossible by design. Solve blocks for equation systems come in v2.
