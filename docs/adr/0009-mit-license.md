# 0009. License the app under MIT and accept only MIT-compatible dependencies

- **Status:** Accepted
- **Date:** 2026-11-09
- **Source:** Q7

## Context

The app needs a license (Q7: open source under MIT, Apache-2.0 or GPL, or closed). The choice also limits which dependencies can be used. Copyleft licenses such as GPL would impose their terms on the whole app.

## Decision

- License Radium Math under MIT (`LICENSE`).
- Every dependency must be MIT-compatible. GPL, LGPL and AGPL packages are rejected.
- CI enforces this with allow-lists of permissive licenses:
  - `scripts/check-licenses.mjs` covers npm packages, dev tooling included;
  - `src-tauri/deny.toml` (cargo-deny) covers Rust crates.
- Any other license fails the build, including unknown ones.
- A package under weak, file-level copyleft (MPL-2.0) or a data license (CC-BY-4.0) is accepted only as a **reviewed, per-package exception** recorded with its reason. In M0 that is:
  - npm: build-time-only tools (`lightningcss`, `caniuse-lite`);
  - Rust: five MPL-2.0 crates that Tauri requires (`cssparser`, `cssparser-macros`, `selectors` and `dtoa-short` at build time only; `option-ext` at runtime).

## Consequences

- Anyone may use, modify and redistribute the app.
- A new dependency may be rejected by CI on license grounds. The fix is to choose another package or to review it and record an exception. Weak-copyleft licenses are never allowed globally.
- MPL-2.0 files must stay under MPL. Modifying one of those crates would mean publishing the change.
- Dual-licensed packages are used under their permissive option (e.g. DOMPurify under Apache-2.0).
