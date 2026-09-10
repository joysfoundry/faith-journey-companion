---
id: ACTS-189
title: Vessels — Books filter groups quotes under each book
spine:
status: Done
origin: human-directed
approved_by: JC
depends_on: [ACTS-183]
relates_to: [ACTS-188, ACTS-181]
started_at: 2026-09-10T14:18:28-0700
updated:    2026-09-10T14:21:54-0700
latest_handoff: stories/ACTS-189/session-01.md
sessions: 1
---

## Goal
As a reader, in the Vessels **Books** filter I want each book to **nest the quotes drawn
from it** (collapsed by default) so I can see a book and, on demand, the passages I've kept
from it — and I don't want a Bible pre-marked "Not started," because a Bible is dipped into,
not read start-to-finish.

Split from ACTS-188 (JC): the Books-view work is its own story.

## Context
The Books filter (`/formation`, `KnowledgePage`) was a flat list of `category: "book"`
items. A quote names its book via `source_item_id` (ACTS-183; reverse = "Quotes from this").
This story turns the Books filter into collapsible book groups that nest those quotes, and
fixes two data issues surfaced while building it.

## Decisions (JC, 2026-09-10)
- **Books filter:** each book nests the quotes attributed to it (`source_item_id`),
  **collapsed by default**; the toggle label is **"N quotes from this"** (approved).
- **Bible reading status:** a Bible carries **no default status** — the stepper shows with
  nothing selected until the reader picks one (a reference, not read cover-to-cover).
- **Data fix:** the seeded St. Padre Pio saying ("Blessed is the crisis…") was mis-typed as
  the scripture **Lk 1:26-38** (linked to NABRE). It's his words — strip the scripture shape.

## Acceptance criteria
- [x] Books filter renders each book as a section: the book's own row (status, links, menu
      preserved) plus a collapsible **"N quotes from this"** list of the quotes whose
      `source_item_id` is that book. Collapsed by default; books with 0 quotes show no toggle.
- [x] A search expands any book with a matching quote so a hit isn't hidden behind a fold.
- [x] Hidden versions (ACTS-188) don't appear as book groups (built from the filtered list).
- [x] **Data-shape** (flag): `KnowledgeItem.status` is now **optional** (`undefined` = unset);
      Bible books start unset (`ensureBook` no longer defaults `not_started`, and existing
      Bible books are cleared to unset — a deliberately set status is left alone). No
      `STORAGE_KEY` bump. Non-Bible books (e.g. the "Bible in a Year" program) keep their status.
- [x] **Data fix:** the St. Padre Pio quote is repaired on load (idempotent, signature-guarded)
      — `quote_kind: open`, no `scripture_ref`/`source`/`source_item_id`; byline shows the Vessel.

## Implementation (2026-09-10)
`formation.tsx`: `bookGroups` memo (book + its `quotesFromItem`), a `filter === "book"`
render branch with a per-book `expandedBooks` toggle (collapsed default; force-open during
search), `ContentRow` status-setter prop pinned to `KnowledgeStatus`. `types.ts`:
`status?` optional. `store.ts` `loadDatabase` normalization: drop the `not_started` default in
`ensureBook`, clear `not_started` on existing Bible books (`isBibleBookId`), and repair
`know-pio-quote`. Verified in the dev app (screenshots): NABRE nests 2 quotes collapsed;
Bible books show no highlighted pill; real books keep theirs; the Padre Pio quote is de-scriptured.

## Tests
No runner yet (ACTS-92). **Unit:** `isBibleBookId`/status-clear + the pio repair are pure
normalization steps in `store.ts` — cover the repair signature guard and the "leave a set
status alone" branch. **Integration:** Books filter renders book groups, toggles quotes,
folds by default; Bible book shows no selected status. **E2E:** extends the Vessels library
flow. Planned.
