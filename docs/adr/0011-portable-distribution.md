# 0011. Distribute portable builds on all three operating systems

- **Status:** Accepted
- **Date:** 2026-11-09
- **Source:** PLT-03, A5; PLT-01

## Context

Engineers often work on managed machines without administrator rights. The app must run without installation or admin rights, and must open with no network access (PLT-03). Windows 10 does not reliably ship the WebView2 runtime that Tauri needs; Windows 11 does.

## Decision

Ship these release artifacts:

| OS                    | Artifact                                                          |
| --------------------- | ----------------------------------------------------------------- |
| macOS (Apple Silicon) | `Radium Math.app` in a `.dmg`                                     |
| Linux x64             | `Radium-Math-x86_64.AppImage`                                     |
| Windows 11            | `radium-math.exe`, portable                                       |
| Windows 10            | `radium-math-portable.zip`: the exe plus a fixed WebView2 runtime |

- Release builds run on Windows, macOS and Ubuntu 22.04 CI runners.
- The AppImage is built on the oldest supported base, so it runs on newer distributions.
- Builds are unsigned until there are outside users (A5).

## Consequences

- No installer, and no admin rights needed.
- The Windows 10 zip is large because it bundles the WebView2 runtime.
- Unsigned apps trigger macOS Gatekeeper and Windows SmartScreen warnings. Users must be told how to open them.
- The release checklist runs on Windows, macOS, Fedora (Wayland) and Ubuntu (X11).
- The Linux build base must move when Ubuntu 22.04 runners are retired.
