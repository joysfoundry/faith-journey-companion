---
id: ACTS-207
title: Update the seeded Caro Family Rosary from JC's in-app edit
spine:
status: Done
origin: human-directed
approved_by: JC
depends_on: [ACTS-206]
relates_to: [ACTS-44]
started_at: 2026-10-02T10:58:08-0700
updated:    2026-10-02T11:06:19-0700
latest_handoff: null
sessions: 1
---

## Goal
As the family praying it, I want the **seeded** Caro Family Rosary to match how we pray it now,
so new installs / reset users get the current version.

## Resolution (2026-10-02)
Pulled JC's edit from the local app (localhost:8080) into `caroRosaryItems()`. Changes vs. ACTS-44:
Sacred Heart consecration now before Immaculate Heart; Fatima Hymn sung chorus-then-verse
(`song_segments: [5, d]`); Family Prayer moved from opening to closing; closing is now Hail Holy
Queen → **Memorare** → Family Prayer → **Intentions** ("Grandma leads us through intentions
followed by Hail Mary's.") → Sign of the Cross. Template record unchanged.

**Existing installs (JC: update them too):** one-time `applySeedUpdates` in `loadDatabase`
(store.ts) replaces the stored Caro Rosary's items with the seed's, adds any missing seed prayers
(+ versions, deduped), then records `CARO_ROSARY_SEED_UPDATE` in the new
`settings.seed_updates_applied` so it never runs again over later edits. Fresh installs carry the
key in seed settings. A deleted Caro Rosary stays deleted. No STORAGE_KEY bump.

Verified in the browser: applied once on JC's install (other data kept, key recorded); simulated
old install (stale items, Memorare missing) → 46 new items, Memorare + 1 version restored; preview
renders 93 steps in the new order.

## Approach (JC, 2026-10-02)
JC edits the Caro Family Rosary **in the app**; we then pull that version into the seed.
Needs ACTS-206 first — save must persist or the edit is lost.

## Where
- Seed: `src/lib/prayer/seed.ts` — `caroRosaryItems()` (template `tpl-caro-rosary`, ~L1580)
  and the template record (~L2211: name, description, `source_id: "src-caro-booklet"`).
- Pull from: JC's local store (localStorage `prayer-companion-db-v41` → `templates` +
  `template_items` where `template_id === "tpl-caro-rosary"`). Oravia is local-first — get it via
  a console export from JC's browser (or the in-app export), not Supabase.
- Any new prayers the edit references must also be seeded (prayer ids must exist in seed).

## Acceptance criteria
- [x] `caroRosaryItems()` + template record reproduce JC's edited version exactly (items, order,
      repetitions, mysteries/body, description); header comment updated.
- [x] Decide existing installs: seed change alone doesn't reach users with stored data — STORAGE_KEY
      bump resets everyone (avoid), so prefer a targeted migration or leave existing installs as-is. Record the decision.
- [x] Preview of the seeded devotion matches what JC prays.

## Tests
- **Unit**: seed contains `tpl-caro-rosary` with the expected item sequence; all `prayer_id`s resolve.
- **Integration**: N/A beyond the preview check above.
- **E2E**: N/A — seed data change.
