---
id: ACTS-205
title: Vessels page — alphabetical ordering for every filter (Home keeps content-first)
spine:
status: In Progress
origin: human-directed
approved_by: JC
depends_on: []
relates_to: [ACTS-186, ACTS-182]
started_at: 2026-09-15T00:00:00-0700
updated:    2026-09-15T00:00:00-0700
latest_handoff: null
sessions: 0
---

## Goal
As a user, I want the Vessels page ordered **alphabetically** in every filter — Vessels, the
content within each, and the flat lists — so it's predictable to scan. **Home keeps its
"Vessels with content first" ordering** (unchanged).

Origin: JC noticed the Vessels page sorted content-first (has-items before empty) then A–Z, and
items within a Vessel sorted completable-first then A–Z. JC wants plain alpha on this page only.

## What changed (`src/routes/formation.tsx`)
- **By Vessel** group order: was content-first (`byHas`) then name → now **pure `localeCompare`
  by name** (empty Vessels interleave alphabetically instead of sinking).
- **Books filter**: was `byStatusThenTitle` → now **alpha by book title**.
- **Items within every group / the flat lists**: new local `byTitle` comparator replaces
  `byStatusThenTitle` at all Vessels-page item sorts (visibleContent, per-Vessel items, book
  buckets, General, By-Channel items). Completable-first grouping is gone here.
- **By Channel**: already alphabetical by platform label — unchanged.
- **Home**: untouched — orders via `pinnedLinks` in `index.tsx`, still content-first.

## Verified (and how)
- `tsc --noEmit` clean.
- Live (dev server :8080, /formation): By-Vessel order = Ascension Press → Fr. Mike Schmitz →
  Fr. Venn → Hallow → St. Francis de Sales → St. Padre Pio → Trent Horn → USCCB → YouVersion
  (empty Vessels interleaved, not last). Flat "All" list alphabetical (a quote sorts first, then
  Bible…, Introduction…, Sunday Homilies…, Why We're Catholic) — no longer completable-first.

## Acceptance criteria
- [x] Vessels page orders alphabetically in every filter (Voices, Books, flat lists).
- [x] Items within a group order alphabetically by title.
- [x] Home retains "Vessels with content first".
- [x] No regressions (typecheck + live check).

## Tests
No runner yet (ACTS-92). Verify: Vessels list A–Z incl. empty Vessels; items A–Z within a group;
Home unchanged.
