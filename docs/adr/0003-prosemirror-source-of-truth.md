# 0003. Make the ProseMirror document the source of truth; never store results in it

- **Status:** Accepted
- **Date:** 2026-11-09
- **Source:** D3, FIL-03; D9, EDT-03, FIL-04

## Context

A calc document is a structured list of blocks: headings, paragraphs, lists, math regions, images and page breaks. Math regions and images are custom embedded blocks, and every block needs a stable ID (FIL-04). Undo and redo must cover every block type, including edits inside math regions (EDT-03). Collaboration is not in v1, but the model must stay Yjs-compatible (D9).

Computed results come from the inputs. If they were stored alongside the inputs, they could go stale or disagree with them.

## Decision

- Use ProseMirror as the document editor. Its document is the single source of truth for content.
- Only user input is authoritative: text, MathJSON, styles and assets.
- Computed results are a disposable cache. They live in ProseMirror plugin state, are drawn as decorations, and are never written into the document or the saved file (FIL-03).

## Consequences

- Every result is recomputed when a file is opened. There are no stale cached values, and the file format stays smaller and deterministic.
- Undo and redo come from ProseMirror transactions. Math edits are written to node attributes as single transactions, so they are covered too.
- Stable block IDs plus ProseMirror JSON let `y-prosemirror` bind a Yjs document later (D9).
- React draws around the editor but never owns document content ([0002](0002-typescript-react.md)).
- Open time includes a full recalculation, which is bounded by PRF-02 (200 regions in ≤ 500 ms).
