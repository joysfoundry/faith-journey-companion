---
id: ACTS-172
title: "Seed the Mater Dei parish Rosary — Weekly Rosary devotion + parish mystery body"
spine: ACTS-172
status: Done
origin: human-directed
approved_by: JC
depends_on: []
relates_to: [ACTS-107, ACTS-110]
started_at: 2026-09-07T18:20:22-0700
updated:    2026-09-08T00:00:00-0700
latest_handoff: ACTS-172/session-01.md
sessions: 1
---

## Goal
As the app owner, I want the Mater Dei items I built in the app — the **"Mater Dei Catholic
Church Weekly Rosary"** (a devotion) and its **custom mystery body** — baked into
`src/lib/prayer/seed.ts`, so they ship to every user instead of living only in my browser's
localStorage.

## Context
The app is local-first: user-built content lives only in `localStorage`
(`prayer-companion-db-v40`), so these existed on JC's device but not in the repo. Data was
extracted directly from the **Claude preview's** localStorage (JC's working browser), which
clarified two shapes the original story guessed wrong:

- The **"Mater Dei Mystery"** is **not** a mystery *set*. It's a custom **mystery body**
  (`default_mystery_body: "mater-dei-catholic-church"`) layered over the existing **Glorious**
  mysteries — 5 `MysteryContent` rows carrying the parish's own **NABRE** Scripture.
- The parish **Prayer** and its `Source` (`src-mater-dei`) were already seeded; only the
  devotion, the new source (`src-mater-dei-catholic-church`), and the mystery body were new.

`loadDatabase()` merges `{ ...createSeedDatabase(), ...stored }` — each stored collection
**wholesale-overrides** the seed, so existing installs only pick up new seed content on a
`STORAGE_KEY` bump (no migration; the old DB is discarded). JC confirmed the tester reset is
acceptable. Commits do **not** auto-deploy — JC publishes from `main` manually.

## What shipped
**Seed (`seed.ts`)** — deterministic, `built_in`, `SEED_EPOCH`-dated:
- Devotion `tpl-mater-dei-weekly-rosary` (`materDeiRosaryItems()`, 35 steps): Sign of the
  Cross → intention → Apostles' Creed → Our Father → 3 Hail Marys → Glory Be → 5 decades
  (each w/ Fatima Prayer) → **Litany of Loreto** (nested `template_block`) → Hail Holy Queen
  → Mater Dei Parish Prayer → Sign of the Cross. `default_mystery_body:
  "mater-dei-catholic-church"`, weekly recurrence. `favorite` **omitted** (per-user choice).
- **Parish mystery body for ALL 20 mysteries** so `default_mystery_body` resolves on any day:
  the **Glorious** 5 carry JC's own NABRE Scripture (`src-mater-dei-catholic-church`); the
  other 15 (Joyful/Sorrowful/Luminous) reuse the **USCCB** Scripture as a placeholder
  (`src-usccb-rosary`) until JC supplies the parish's own (JC's call).
- New `Source` `src-mater-dei-catholic-church`.
- `STORAGE_KEY` bumped **v40 → v41** (`store.ts`).

**Bug fix — the blank devotion-block step (JC's "see 32").** Two renderers showed a nested
`template_block` step wrong when its label is empty:
- Session guide (compiled): `compiler.ts` `expandTemplate` emitted no title → blank.
  Fixed to `item.label?.trim() || block.name` (commit `405f670`).
- **Devotion detail page** (`devotion.$devotionId.tsx:292`) — the view JC screenshotted —
  did `item.label ?? item.kind`; an empty-string label survives `??` → blank (and a missing
  label showed the raw `"template_block"`). Added a `template_block` case resolving the
  referenced devotion's name. **Verified in the preview**: step 32 now reads "Litany of the
  Blessed Virgin Mary (Loreto)".

**Content:** JC's text preserved verbatim except two clear typos (`Iknow`→`I know`,
`Revalation`→`Revelation`), one reference tidy (`1 Thessalonians 4: 14&17`→`4:14, 17`) and a
double space. Four Glorious prose reflections remain intentionally blank — the transcribed
Scripture is what prays; JC fills the prose over time.

## Acceptance criteria
- [x] The Weekly Rosary devotion appears in the seeded Prayers → Devotions list on a fresh DB.
- [x] The Mater Dei mystery body is present and resolves for every day (20/20 mysteries;
      5 parish NABRE + 15 USCCB placeholders).
- [x] All referenced prayers/versions/sources exist in seed (no dangling ids) — `tsc` clean.
- [x] Ids stable + `SEED_EPOCH`-dated; `built_in: true`.
- [x] `STORAGE_KEY` bumped v40 → v41.
- [x] Blank devotion-block step titled by the block's name (both views). Verified in browser.
- [x] `tsc --noEmit` clean.

## Follow-ups (JC, not blocking)
- Fill the four Glorious prose reflections + replace the 15 USCCB placeholders with the
  parish's own Scripture when available (edit `materDeiGloriousBodies` / the loop in `seed.ts`).
- Publish from `main` (manual).

## Tests
_Convention ACTS-91._
- **Unit** (Vitest — `src/lib/**`): a `createSeedDatabase()` integrity check — the new
  template's `template_items` resolve to existing prayers/mysteries; the
  `mater-dei-catholic-church` body has one row per mystery (20) with no dangling ids.
- **Integration**: N/A (seed data; covered by the integrity unit test).
- **E2E**: N/A until a runner exists.
