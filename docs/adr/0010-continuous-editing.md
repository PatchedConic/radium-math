# 0010. Edit continuously, with page-break markers and a paged preview

- **Status:** Accepted
- **Date:** 2026-11-09
- **Source:** Q2; STY-07, EXP-02, PRF-03

## Context

Calc documents end up as paged PDFs. Two editing models were considered (Q2): (a) true paged editing, where text reflows across page boundaries as you type, or (b) continuous editing with page-break markers plus a paged preview. True paged editing on top of ProseMirror and a webview is complex and risks the keystroke latency target (PRF-03).

## Decision

Use (b). The editor is one continuous surface, with markers showing where pages will end. A paged preview shows the document exactly as it will export (STY-07).

## Consequences

- The editor stays simple and fast. Pagination is computed for the markers and the preview, not on every keystroke.
- The preview and the PDF export must use the same pagination so page breaks and numbering match (EXP-02). The PDF engine choice (Q3/A6, Typst or webview print) is settled by prototype in M4.
- Authors see exact page layout only in the preview, not while typing.
