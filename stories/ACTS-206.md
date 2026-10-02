---
id: ACTS-206
title: Devotion editor — "Review & save" doesn't persist devotion edits
spine:
status: Done
origin: human-directed
approved_by: JC
depends_on: []
relates_to: [ACTS-207]
started_at: 2026-10-02T10:58:08-0700
updated:    2026-10-02T11:00:55-0700
latest_handoff: null
sessions: 0
---

## Goal
As someone editing a devotion (including a seeded one like the Caro Family Rosary), I want
**Review & save → Save devotion** to actually keep my changes, so edits made in the app stick.

## Resolution
Closed 2026-10-02 — **not a bug / not reproducible.** JC re-tested: Review & save → Save
devotion persists edits (used it to finish the ACTS-207 Caro Rosary edit). The earlier "skip"
was a one-off, cause unknown. Reopen with repro steps if it recurs. No code change.

## Report
JC, 2026-10-02: "review and save is broken — we need a way to save devotion updates."
Blocks ACTS-207 (JC is editing the Caro Rosary in-app so the seed can be pulled from it).

## Where to look (not yet diagnosed)
- Editor: `src/routes/template.$templateId.tsx` — "Review & save" sets `reviewing` → preview
  screen → "Save devotion" calls `save()` → `saveTemplate(template, orderedItems)` + `saveHowTo`.
- Store: `saveTemplate` in `src/lib/prayer/store.ts` (~L1051) replaces the template + its items.
- Suspects: preview render throwing (`generatePrayerSession(previewDb, …)`) so Save is never
  reachable; `buildTemplate` hard-codes `built_in: false` (editing a seeded devotion silently
  un-built-ins it — intended?); `loadDatabase` / seed merge re-applying the seeded template over
  the saved one on reload ([[prayer-sourcing-model]] `{...seed,...parsed}` gotcha).
- Reproduce first: edit a seeded devotion and a user devotion, save, reload, compare.

## Acceptance criteria
- [ ] Edits to a devotion (name, items, order, notes) survive Save **and** a page reload.
- [ ] Works for a seeded (`built_in`) devotion and a user-created one.
- [ ] Decide + document what editing a seeded devotion does to `built_in` (and Delete visibility).
- [ ] Clear feedback on success; no silent failure path.

## Tests
- **Unit**: `saveTemplate` replaces items + survives a `loadDatabase` round-trip.
- **Integration**: edit → Review & save → Save devotion → reload → edits present.
- **E2E**: devotion-edit flow in `docs/E2E-TEST-PLAN.md`.
