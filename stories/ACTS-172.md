---
id: ACTS-172
title: "Seed the Mater Dei parish Rosary — custom Mystery + Weekly Rosary devotion"
spine: ACTS-172
status: Blocked
origin: human-directed
approved_by: JC
depends_on: []
relates_to: []
started_at: 2026-09-07T18:20:22-0700
updated:    2026-09-07T18:20:22-0700
latest_handoff: null
sessions: 0
---

## Goal
As the app owner, I want the two Mater Dei items I built in the app — the **"Mater Dei
Catholic Church Mystery"** (a custom mystery) and the **"Mater Dei Catholic Church Weekly
Rosary"** (a devotion/template) — baked into `src/lib/prayer/seed.ts`, so they ship to every
user instead of living only in my browser's localStorage.

## Context
The app is local-first: user-built content lives only in `localStorage`
(`prayer-companion-db-v40`), so these two items exist on JC's device but not in the repo.
`seed.ts` already carries the **"Mater Dei Parish Prayer"** (`seed.ts:578`) and a Mater Dei
parish `Source` (`seed.ts:2048`) — so the parish prayer is done; what's new is the **Mystery
cluster** and the **Rosary template**.

Seeding these means adding, in `createSeedDatabase()`:
- `templates` + `template_items` for the Weekly Rosary (following any nested
  `template_block` items back to their block templates).
- referenced `prayers` (+ `prayer_versions`) not already seeded.
- `mystery_sets` + `mysteries` + `mystery_contents` for the custom Mystery.
- any new `Source`.

**Blocked on:** the actual records, which only JC can export from the device that built them
(see the export snippet handed over in chat). Once the JSON bundle is in hand, convert it to
deterministic seed entries (stable ids, `SEED_EPOCH` timestamps, `built_in: true`) and add to
`seed.ts`. A new seed content bump means `STORAGE_KEY` v40 → v41 so existing users pick it up.

## Acceptance criteria
- [ ] The Weekly Rosary devotion appears in the seeded Prayers → Devotions list on a fresh DB.
- [ ] The custom Mater Dei Mystery is selectable and prays with its content.
- [ ] All referenced prayers/versions/sources exist in seed (no dangling ids).
- [ ] Ids are stable + `SEED_EPOCH`-dated; `built_in: true`.
- [ ] `STORAGE_KEY` bumped v40 → v41 (new seed content) with a note.
- [ ] `tsc --noEmit` clean.

## Tests
_Convention ACTS-91._
- **Unit** (Vitest — `src/lib/**`): a `createSeedDatabase()` integrity check — the new
  template's `template_items` resolve to existing prayers/mysteries; the mystery set's
  `mystery_contents` resolve; no dangling foreign ids.
- **Integration**: N/A (seed data; covered by the integrity unit test) — or render the
  devotion detail on a fresh seeded DB.
- **E2E**: N/A until a runner exists.

## Notes
- Watch the **`template_block` title bug** (reported alongside this, step 32 renders blank) —
  if the Weekly Rosary uses a nested devotion block, seeding it will reproduce that bug until
  the block-title fix lands. Track/fix separately.
