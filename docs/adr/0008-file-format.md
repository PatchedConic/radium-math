# 0008. Save documents as a deterministic zip with content-addressed assets

- **Status:** Accepted
- **Date:** 2026-11-09
- **Source:** D8, Q4, A4; FIL-01 to FIL-05, SEC-10, SEC-11, REL-01

## Context

A document is one file containing JSON content and embedded images (FIL-01, IMG-04). The format must be safe to parse, migratable across schema versions (FIL-02), and deterministic so diffs are minimal (FIL-05). Three containers were considered (Q4): (a) a zip of JSON plus assets, (b) a single JSON file with base64 assets, and (c) a folder.

## Decision

Use (a): a zip with a fixed layout, using the `.rmath` extension (A4).

```text
example.rmath (zip)
  manifest.json     { "format": "radium-math", "schemaVersion": 1, "appVersion": "0.1.0" }
  document.json     { meta, settings, theme, pageSetup, content }   content = ProseMirror JSON
  assets/<sha256>.png
```

- **Determinism:** JSON is written with sorted keys and fixed indentation, and zip entries are written in a fixed order with fixed timestamps.
- **Assets:** each asset is named by its content hash, so a duplicate image is stored once.
- **Inputs only:** only inputs are saved, and results are recomputed on open ([0003](0003-prosemirror-source-of-truth.md)).
- **Migrations:** each schema change adds one pure `vN → vN+1` migration with its own golden test. A newer version than the app knows is refused with a message naming the required app version.
- **Load order:** unzip with limits (entry count, total and per-entry size, no path traversal) → validate the manifest → migrate → validate `document.json` with zod → build the ProseMirror doc. Any failure stops the load and leaves the editor unchanged.
- **Atomic save:** write a temp file, flush it, then rename it over the target (REL-01).

## Consequences

- The same document always produces the same bytes.
- Images stay binary (no base64 bloat), unlike option (b).
- A single file is easier to share than a folder (c).
- The zip parser is an attack surface. It needs the size and entry limits (SEC-11) and fuzz tests (SEC-14).
- zod and fflate become core dependencies when `core/format` is built. They must be added to the core npm allow-list in `.dependency-cruiser.cjs`.
- The zip stays the saved snapshot format even after Yjs collaboration arrives (D9).
