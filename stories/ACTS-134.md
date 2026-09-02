---
id: ACTS-134
title: Vessels section — not-started status items sink; seeded USCCB/Hallow/Why We're Catholic don't resurface
spine:
status: Done
origin: human-directed
approved_by: JC
depends_on: []
relates_to: [ACTS-130, ACTS-133]
started_at: 2026-09-02T00:00:00-0700
updated:    2026-09-02T00:00:00-0700
latest_handoff: null
sessions: 0
---

## Goal
As someone browsing my Vessels library, I want the works I'm meant to read/watch
(books, programs, media) to sit at the top in a predictable A–Z order — a
not-started book like *Why We're Catholic* included — and I want the vessels that
ship in the seed (USCCB, Hallow, that book) to actually be present.

## Bug
Two issues in the Vessels section:

1. **Ordering.** `byStatusThenRecent` (from ACTS-130) floated status-bearing
   items to the top but sub-ordered them by status rank (in-progress →
   not-started → finished) and then by `created_at`. A not-started book with an
   old/empty `created_at` sank to the bottom of its tier — *Why We're Catholic*
   showed up last instead of at the top with the other status items.

2. **Missing seed vessels.** USCCB, Hallow, and *Why We're Catholic* are all in
   `createSeedDatabase()`, but `loadDatabase()` shallow-merges
   (`{ ...seed, ...parsed }`), so a saved `voices` / `knowledge_items` array
   fully replaces the seed's. Existing installs whose local data had diverged
   never saw the three, and new seed additions only reach them on a STORAGE_KEY
   bump.

## Fix
- `src/lib/prayer/knowledge.ts` — replaced `byStatusThenRecent` with
  `byStatusThenTitle`: status-bearing items (book/program/video/podcast) first
  regardless of started-state, then references, **alphabetical by title** within
  each tier (case-insensitive). Removed the now-unused `STATUS_RANK`. Updated all
  four call sites (formation flat + grouped, Word section, voice page/editor).
- `src/lib/prayer/store.ts` — bumped `STORAGE_KEY` v38→v39 to force a reseed so
  USCCB / Hallow / *Why We're Catholic* (already in the seed) resurface. (Accepted
  trade-off: this replaces divergent local test data on first v39 load.)

## Acceptance criteria
- [x] Status-bearing vessels sort above references; a not-started book appears in
      the top tier, not last.
- [x] Within each tier, items sort A–Z by title (case-insensitive).
- [x] USCCB, Hallow, and *Why We're Catholic* are present after a fresh load
      (STORAGE_KEY bumped to v39).
- [x] `npx tsc --noEmit` clean.

## Tests
- **Unit** (Vitest — pure `src/lib/**`): _planned_ — `byStatusThenTitle` puts a
      not-started book above a reference, and two books in A–Z order. Harness = ACTS-92.
- **Integration** (Testing Library): _planned_ — formation list renders status
      vessels first, alphabetized.
- **E2E** (Playwright): N/A — covered by unit/integration; no new flow.

## Commit(s)
- _pending_ — fix: Vessels sort A–Z within tiers (byStatusThenTitle) + reseed vessels (STORAGE_KEY v39)
