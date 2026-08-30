---
id: ACTS-130
title: Vessel items — only completable works carry status; sort them above references
spine:
status: Done
origin: human-directed
approved_by: JC
depends_on: []
relates_to: [ACTS-129]
started_at: 2026-08-30T15:43:40-0700
updated:    2026-08-30T15:43:40-0700
latest_handoff: null
sessions: 0
---

## Goal
As someone browsing my library, I want the things I actually work through (books,
programs, video, podcast) to show progress status and sit at the top — above
"general website" references (articles/posts) I only keep a link to — so the list
leads with what I'm reading, not a flat wall of "Not started".

## Acceptance criteria
- [x] New `hasStatus(category)` in `src/lib/prayer/knowledge.ts`: true for
      `book | program | video | podcast`; false for `article | post | quote`.
- [x] Status pills (Not started / In progress / Finished) render only when
      `hasStatus(item.category)` — in the Formation `ContentRow` and on the
      knowledge detail page (previously shown for every non-quote item).
- [x] `byStatusThenRecent` now ranks status-bearing items first (by progress:
      in-progress → not-started → finished), then status-less references, newest
      within each tier. Applies everywhere the library sorts (flat, By-Voice,
      General bucket).
- [x] Decision (JC): "general website" = `article` + `post`. `book`, `program`,
      `video`, `podcast` keep status.
- [x] Browser-verified: seeded books show status pills and lead the Books list.

## Tests
- **Unit** (Vitest — pure `src/lib/**`): _planned_ — `hasStatus` per category;
      `byStatusThenRecent` orders a book (in-progress) above a book (finished) above
      an article, and articles/posts by recency. Harness = ACTS-92.
- **Integration** (Testing Library): _planned_ — `ContentRow` renders status pills
      for a book, none for an article.
- **E2E** (Playwright): N/A — covered by the unit + integration layers; no new flow.
