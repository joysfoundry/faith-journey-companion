---
id: ACTS-131
title: Seed — Mater Dei Catholic Parish Prayer
spine:
status: Done
origin: human-directed
approved_by: JC
depends_on: []
relates_to: []
started_at: 2026-08-30T15:43:40-0700
updated:    2026-08-30T15:43:40-0700
latest_handoff: null
sessions: 0
---

## Goal
As a Mater Dei parishioner, I want the Parish Prayer in the library so I can pray it
in the app, transcribed faithfully from the parish prayer card.

## Acceptance criteria
- [x] `prayer("mater-dei-parish-prayer", "Mater Dei Parish Prayer", "devotional", …)`
      seeded in `src/lib/prayer/seed.ts` `base`, with the full body plus the closing
      responsory (Leader: "Mater Dei" / All: "Lead us to your son Jesus. Amen!").
- [x] New source `src-mater-dei` (source_type `manual`, "Mater Dei Catholic Parish —
      Parish Prayer card", attribution "Mater Dei Catholic Parish, Diocese of San
      Diego (established 2004)"); the prayer references it.
- [x] Tags `["parish", "community", "mater dei"]`.
- [x] `STORAGE_KEY` bumped v37 → v38 so existing users reseed and pick it up.
- [x] Browser-verified: appears in the Prayer Library (searchable), opens, and the
      full body + responsory render correctly.

## Tests
- **Unit** (Vitest — pure `src/lib/**`): _planned_ — assert the seed contains
      `mater-dei-parish-prayer` with its `src-mater-dei` source and non-empty body.
      Harness = ACTS-92.
- **Integration** (Testing Library): N/A — pure data seed; rendering path is the
      shared prayer-detail view already exercised by other seeded prayers.
- **E2E** (Playwright): N/A — data-only; no new flow.
