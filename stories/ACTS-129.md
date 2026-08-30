---
id: ACTS-129
title: Reflection icon on session rows, session detail, and vessel items
spine:
status: Done
origin: human-directed
approved_by: JC
depends_on: []
relates_to: [ACTS-102, ACTS-103]
started_at: 2026-08-30T15:43:40-0700
updated:    2026-08-30T15:43:40-0700
latest_handoff: null
sessions: 0
---

## Goal
As someone journaling my faith, I want the reflection (notebook) icon everywhere I
might want to reflect — on Home session rows, on the open session screen, and on
each vessel/library item — so provenance carries into the journal from any surface,
not just the Daily Rosary and Word rows.

## Acceptance criteria
- [x] Home "Prayer" card: Continue / Today / Done session rows each show a
      NotebookPen reflect icon (matching the Daily Rosary row); tapping it opens the
      Reflection composer with that session pre-linked.
- [x] Those session rows are added to the Home `linkables` so the pre-linked badge
      shows a readable title, not a raw id.
- [x] Session detail (`/session/$sessionId`) header shows a reflect icon next to
      Share; it links to `/reflections?link=<sessionId>`.
- [x] Formation library rows (`ContentRow`, quote + non-quote) show a reflect icon
      next to the row menu; it links to `/reflections?link=<itemId>`.
- [x] `/reflections` accepts `?link=<id>` (`validateSearch`) and pre-links the
      composer via `prefillLinkId`; the knowledge detail "Reflect on this" button
      now passes `?link=<itemId>` too (previously prefilled nothing).
- [x] Browser-verified: book reflect icon → composer pre-linked to the book;
      session-detail reflect icon → composer pre-linked to "The Holy Rosary".

## Tests
- **Unit** (Vitest — pure `src/lib/**`): N/A — change is UI wiring + a route search
  schema; no new pure logic. Existing `knowledge.ts` helpers unchanged by this story.
- **Integration** (Testing Library): _planned_ — render `ContentRow` and assert the
  reflect link href is `/reflections?link=<id>`; render `/reflections?link=X` and
  assert the composer badge shows the linked label. Harness = ACTS-92.
- **E2E** (Playwright — see the plan): _planned_ — extends the reflection flow: from
  a library row and from the open session, tap reflect → composer opens pre-linked.
