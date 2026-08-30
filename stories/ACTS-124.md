---
id: ACTS-124
title: Seed — Novena: 9-Day Sacred Heart of Jesus
spine:
status: To Do
origin: human-directed
approved_by: JC
depends_on: []
relates_to: [ACTS-107, ACTS-122, ACTS-123]
started_at: null
updated:    2026-08-30T15:27:00-0700
latest_handoff: null
sessions: 0
---

## Goal
As someone with a devotion to the Sacred Heart, I want a seeded **9-Day Sacred Heart of
Jesus novena** so I can pray it (or share a follow-along) across the nine days.

## Structure (to confirm from sources)
A 9-day novena. Likely the ACTS-107/122 scaffold: opening → rosary (or the daily Sacred
Heart novena prayer) → **Litany of the Sacred Heart of Jesus** (already seeded,
`tpl-litany-sacred-heart`) → closing. If it is prayer-based (one prayer/day), use the
"Novena Prayers" pattern (ACTS-123) instead.

## Acceptance criteria (draft)
- [ ] `default_recurrence` daily×9; "Novena:" naming convention.
- [ ] Reuses the seeded Litany of the Sacred Heart; new prayers only where needed (public domain).
- [ ] Source/provenance recorded; STORAGE_KEY bumped; browser-verified.

## Tests
_Planned — no runner (ACTS-92)._ Unit/Integration per the seeded-devotion pattern; E2E N/A.

## Notes
- Gather exact wording (public-domain source). Decide scaffold (ACTS-122) vs prayer-sequence
  (ACTS-123) once the source structure is seen.
