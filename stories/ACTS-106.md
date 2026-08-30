---
id: ACTS-106
title: Seed — Eternal Rest Prayer + surface "Why We're Catholic" (Trent Horn) on Home
spine:
status: To Do
origin: human-directed
approved_by: JC
depends_on: []
relates_to: [ACTS-107]
started_at: null
updated:    2026-08-29T18:44:53-0700
latest_handoff: null
sessions: 0
---

## Goal
As someone who prays for the dead and reads to form my faith, I want the **Eternal Rest
Prayer** seeded as a reusable prayer and **"Why We're Catholic" (Trent Horn)** surfaced on
the **Home** page, so the content I actually use is in the app and ready — not scattered
across the web.

## Scope (new seed / DB update)
1. **Eternal Rest Prayer** — seed a reusable `Prayer` in `src/lib/prayer/seed.ts`.
   - Source: <https://mycatholicprayers.com/prayers/eternal-rest-prayer/> (record as a
     `Source` with URL + provenance `known`).
   - Text (traditional wording): "Eternal rest grant unto them, O Lord, and let perpetual
     light shine upon them. May they rest in peace. Amen." (V./R. form:
     "Eternal rest grant unto them, O Lord. / And let perpetual light shine upon them.")
     — confirm exact wording/versions against the source when building.
   - Taxonomy: `prayer_type: devotional` (or `traditional_expression`), `expression_type: vocal`.
   - This prayer is a **component** of the future Litany of the Departed (ACTS-107).
2. **"Why We're Catholic" on Home** — the book is **already seeded** (ACTS-53) but under the
   title **"Why We Are Catholic"** at `src/lib/prayer/seed.ts:1850` (Vessel: Trent Horn,
   `seed.ts:1821`).
   - **Reconcile the title** to the real book title: **"Why We're Catholic"** (Trent Horn,
     2017 — *Our Reasons for Faith, Hope, and Love*).
   - **Surface it on Home** (the Learn/Vessels slot on `src/routes/index.tsx`) so it appears
     as an in-progress / featured formation item, per JC's request. Confirm the exact Home
     placement mechanism (existing "Learn" home card vs. a featured pick).
3. **STORAGE_KEY bump** — seed changes require bumping `STORAGE_KEY` in
   `src/lib/prayer/store.ts` (currently `prayer-companion-db-v29` → `v30`) so existing local
   DBs pick up the new seed. See [[prayer-sourcing-model]] STORAGE_KEY gotcha.

## Acceptance criteria
- [ ] Eternal Rest Prayer exists as a reusable seeded `Prayer` with a `Source` (URL + `known` provenance) and correct taxonomy; visible/searchable in the Prayers library.
- [ ] The Trent Horn book title reads **"Why We're Catholic"** everywhere it renders (seed + any UI).
- [ ] "Why We're Catholic" is visible on the **Home** page (not only in the Vessels library).
- [ ] `STORAGE_KEY` bumped; a fresh load seeds both without wiping unrelated user data unexpectedly (documented one-time reseed behavior).
- [ ] Browser-verified (Prayers library shows the prayer; Home shows the book).

## Tests
_Planned — no runner wired (harness = ACTS-92); document per ACTS-91._
- **Unit** (Vitest — `src/lib/prayer/seed.ts`): assert the Eternal Rest `Prayer` + `Source` are present with expected fields; assert the book title string is "Why We're Catholic".
- **Integration** (Testing Library): Home renders the book card; Prayers page lists/searches the new prayer.
- **E2E** (Playwright): open Home → see the book; open Prayers → find "Eternal Rest". N/A until harness lands.

## Notes
- Filed via `/spinoff` from a forked chat (the ACTS-104/PRD-v2 discussion). Parked `To Do` —
  clean to `/start ACTS-106`.
- Relates to **ACTS-107** (Litany of the Departed devotion) which reuses this prayer.
