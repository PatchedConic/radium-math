# 0001. Use Tauri 2 as the app shell; move to the CEF runtime in Tauri 3 when stable

- **Status:** Accepted
- **Date:** 2026-11-09
- **Source:** D1; PLT-01, PLT-02, PLT-03, SEC-09

## Context

Radium Math is a desktop app for Windows, macOS and Linux (PLT-01). It must run without installation or administrator rights (PLT-03), and it should keep a path open to iOS and Android (PLT-02). Nearly all logic is TypeScript, so the shell's job is narrow: a window, file dialogs, atomic file writes, and a strict security boundary.

Electron bundles Chromium, which gives large installs. Tauri uses the operating system's webview (WebView2, WKWebView, WebKitGTK), produces small installs, has a mobile path, and keeps native code in a thin Rust layer. Its weak spot is webview variation, especially WebKitGTK on Linux. Tauri 3 plans a CEF (Chromium) runtime that would remove that variation.

## Decision

Use Tauri 2 with the system webview. Move to the Tauri 3 CEF runtime once it is stable.

The Rust shell stays thin: window, CSP, capabilities, file dialogs and atomic file write, exposed as the five commands in architecture Section 8. It uses no shell, http, process or updater plugins (SEC-09).

## Consequences

- Installs are small, and the same TypeScript runs on every target. Mobile stays possible.
- Rendering and API differences between webviews are a risk. Linux WebKitGTK defects are the most likely, so UI features must be checked on each OS (the PLT release checklist).
- Windows 10 needs a fixed WebView2 runtime shipped alongside the app (see [0011](0011-portable-distribution.md)).
- The TypeScript side reaches Rust only through the `Platform` interface in `src/platform`, so core and editor tests run in Node with a fake platform.
- **Revisit if** Linux WebKitGTK defects block v1 before Tauri 3 is stable.
