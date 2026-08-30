---
id: ACTS-128
title: Seed — Novena: St. Michael (chaplet-based)
spine:
status: To Do
origin: human-directed
approved_by: JC
depends_on: [ACTS-122]
relates_to: [ACTS-107, ACTS-123]
started_at: null
updated:    2026-08-30T15:27:00-0700
latest_handoff: null
sessions: 0
---

## Goal
As someone devoted to St. Michael, I want a seeded **St. Michael novena** built around the
**Chaplet of St. Michael** so I can pray it across its days.

## Structure (to confirm from sources)
This is the novena JC pointed to when noting *"a novena can have a litany or a chaplet
attached."* It uses the **Chaplet of St. Michael** (already seeded, `tpl-chaplet-michael`)
in the swappable **chaplet slot** — hence it depends on ACTS-122 (chaplet option in the
novena scaffold). Opening/closing + any daily prayers per the ACTS-107 pattern.

## Acceptance criteria (draft)
- [ ] Novena assembled with the Chaplet of St. Michael in the chaplet slot (ACTS-122).
- [ ] `default_recurrence` matches the source; "Novena:" naming.
- [ ] Reuses the seeded chaplet; new prayers only where needed (public domain).
- [ ] Source/provenance recorded; STORAGE_KEY bumped; browser-verified.

## Tests
_Planned — no runner (ACTS-92)._ Unit/Integration per the seeded-devotion pattern; E2E N/A.

## Notes
- **Blocked on ACTS-122** (the chaplet slot). Gather the St. Michael novena wording
  (public domain). Proves the rosary-**or**-chaplet flexibility JC described.
