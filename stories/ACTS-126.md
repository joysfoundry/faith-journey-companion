---
id: ACTS-126
title: Seed — Novena: Lenten
spine:
status: To Do
origin: human-directed
approved_by: JC
depends_on: [ACTS-123]
relates_to: [ACTS-107, ACTS-122]
started_at: null
updated:    2026-08-30T15:27:00-0700
latest_handoff: null
sessions: 0
---

## Goal
As someone keeping Lent, I want a seeded **Lenten novena** — a day-by-day set of prayers /
meditations — so I can pray through it during the season.

## Structure (to confirm from sources)
Likely a **day-sequenced "Novena Prayers"** devotion (different prayer/meditation each day),
so it depends on the ACTS-123 pattern. Confirm the exact form (which Lenten novena) and
whether it also carries a fixed daily prayer.

## Acceptance criteria (draft)
- [ ] Day-indexed prayers surface the right day (via ACTS-123); "Novena:" naming.
- [ ] `default_recurrence` matches the source length; anchored to the season if applicable.
- [ ] Source/provenance recorded; STORAGE_KEY bumped; browser-verified.

## Tests
_Planned — no runner (ACTS-92)._ Unit/Integration per the seeded-devotion pattern; E2E N/A.

## Notes
- Pick the specific Lenten novena + gather public-domain wording. Depends on ACTS-123
  (day-sequenced prayers).
