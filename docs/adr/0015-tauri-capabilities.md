# 0015. Grant the UI an explicit list of Tauri core permissions, not `core:default`

- **Status:** Accepted
- **Date:** 2026-11-09
- **Source:** SEC-09; SEC-03, SEC-07, G3

## Context

SEC-09 says Tauri capabilities give the UI only file dialogs and read/write of user-chosen files, with no shell or process plugins. M0 ships `src-tauri/capabilities/default.json` with the single permission `core:default`. The M0 review found that this set is wider than SEC-09 allows.

In Tauri 2.12, `core:default` expands to nine default sets:

| Set                      | What it allows                                                                              | Needed?                                       |
| ------------------------ | ------------------------------------------------------------------------------------------- | --------------------------------------------- |
| `core:app:default`       | App name, version, identifier, bundle type                                                  | Yes (About box, `appVersion` in the manifest) |
| `core:event:default`     | Listen, unlisten, emit                                                                      | Yes (menu events, close-requested)            |
| `core:window:default`    | Read-only window state: size, position, monitor, theme                                      | Yes                                           |
| `core:webview:default`   | Read-only webview list, position, size; toggle devtools                                     | Yes (devtools only in debug builds)           |
| `core:path:default`      | Resolve and join paths; no file access                                                      | Probably (recovery folder name)               |
| `core:menu:default`      | Build and change menus                                                                      | Yes (app menu in M2)                          |
| `core:resources:default` | Close a resource handle                                                                     | Yes (used by menu and image)                  |
| `core:image:default`     | Includes **`allow-from-path`**: decode any image file on disk by path and return its pixels | **No**                                        |
| `core:tray:default`      | Create and change a system-tray icon, including `allow-set-temp-dir-path`                   | **No**                                        |

`core:image:allow-from-path` is a file read outside the per-session path allow-list (architecture Section 8). Any script running in the UI could read any image the user can read and see its pixels. That is the kind of path from content to file access that G3 rules out. The tray set isn't needed: the app has no tray icon.

## Decision

Replace `core:default` with an explicit list of the sets the app needs:

```json
"permissions": [
  "core:app:default",
  "core:event:default",
  "core:window:default",
  "core:webview:default",
  "core:path:default",
  "core:menu:default",
  "core:resources:default"
]
```

- No `core:image` or `core:tray` permissions. If image icons in menus are ever needed, grant only `core:image:allow-new` and `allow-from-bytes`, never `allow-from-path`.
- The dialog and file commands of architecture Section 8 are added to this list in M2 (M2-T10).
- Any new permission needs an ADR, as now.

## Consequences

- The capability file matches SEC-09: no file read outside the Rust allow-list.
- A Tauri upgrade that adds a new core set doesn't grant it silently. It has to be added here.
- Rejected alternative: keep `core:default` and document it. It's simpler, but it leaves a file-read path open.
- `capabilities/default.json` now has this list (approved by the user on 2026-11-09). `pnpm tauri dev` must still open the window.
