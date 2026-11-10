# 0002. Write the app in strict TypeScript, with React for the app chrome

- **Status:** Accepted
- **Date:** 2026-11-09
- **Source:** D2, Q1; MNT-01, PLT-02, PRF-03

## Context

One hobbyist developer has to understand and change every part of the codebase (G4). The UI and the core logic (scope, units, engine, file format) both run in the webview, and the core must also run on future mobile targets (PLT-02). Using one language for both avoids a language boundary inside the app.

ProseMirror needs a framework around it for menus, toolbars, side panels and dialogs. React, Svelte and Solid were considered (Q1).

## Decision

- All app code is TypeScript in strict mode. Any `any` needs a justification comment (MNT-01).
- React renders the app chrome: menus, toolbar, side panels, dialogs, and the host component that mounts the ProseMirror view.
- React never holds document state. UI-only state (panel open, zoom) lives in a small store (zustand, Section 7).

## Consequences

- One language and one toolchain for UI and core. Core is plain TypeScript with no React, DOM or Tauri imports, enforced by dependency-cruiser and `tsconfig.core.json`.
- React has the largest ecosystem and is the best documented of the three options, which matters for a single maintainer.
- Performance-critical editing does not go through React. Math fields are hosted directly by ProseMirror node views (Section 7) to keep typing latency ≤ 50 ms (PRF-03).
- Strict settings beyond `strict` (`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`) catch more bugs, at the cost of more explicit code.
