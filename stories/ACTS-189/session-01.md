---
story: ACTS-189
session: 1
wrapped_at: 2026-09-10T14:21:54-0700
status: Done
final: true
---

## What happened
Split from ACTS-188 and completed in one session.

- **Books filter → grouped/collapsible** (`formation.tsx`): a `bookGroups` memo pairs each
  book with `quotesFromItem(book.id)`; a `filter === "book"` branch renders each book's own
  `ContentRow` (status/links/menu preserved) plus a collapsible **"N quotes from this"**
  list. Per-book `expandedBooks` state, **collapsed by default**; a search force-expands any
  book with a matching quote. Books with 0 quotes show no toggle. Built from the ACTS-188
  filtered `items`, so hidden versions don't appear as groups.
- **Bible books have no default reading status**: `KnowledgeItem.status` is now **optional**
  (`types.ts`); `ensureBook` no longer defaults `not_started`, and `loadDatabase` clears
  `not_started` on existing Bible books (`isBibleBookId`) — a deliberately set status is
  left alone. `ContentRow`'s status-setter prop pinned to `KnowledgeStatus` (it only ever
  sets a concrete step).
- **Data repair**: `know-pio-quote` (St. Padre Pio, "Blessed is the crisis…") was mis-typed
  as scripture Lk 1:26-38 linked to NABRE in persisted data — repaired on load (idempotent,
  signature-guarded) to `quote_kind: open` with the scripture shape stripped.

## Verified (and how)
Dev server (`/formation`):
- Books view: "Bible — NABRE" nests **2 quotes**, collapsed; expands on click; NASB/NIV and
  the other books show only their row. Bible books show all three status pills **unselected**;
  "Introduction to the Devout Life" = In progress and "Why We're Catholic" = Not started
  (real books keep their status). The "Bible in a Year" **program** kept its In-progress
  status (not a Bible book → `isBibleBookId` correctly skipped it).
- Data check: after reload, `know-pio-quote` = `quote_kind: open`, no `scripture_ref`/
  `source`/`source_item_id`; "1:26-38" appears nowhere; the quote shows under St. Padre Pio.
- Typecheck clean; zero new lint errors (repo has pre-existing prettier noise, untouched).

## Git state at handoff
Committed, **push pending** (local git auth unavailable this session — JC pushes):
`c81fc3b` (code). The docs closing ACTS-188 + filing ACTS-189 are in `74f452d`. This final
handoff + pointer/board → Done commit as docs (push separately).

## Next
Story complete — all acceptance criteria met.
