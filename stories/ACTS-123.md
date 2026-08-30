---
id: ACTS-123
title: "Novena Prayers" pattern — day-sequenced prayers over N days
spine:
status: To Do
origin: human-directed
approved_by: JC
depends_on: []
relates_to: [ACTS-107, ACTS-122, ACTS-126, ACTS-127]
started_at: null
updated:    2026-08-30T15:27:00-0700
latest_handoff: null
sessions: 0
---

## Goal
As someone praying a novena that is **prayer-based** (not a rosary sitting), I want a novena
that is either **one prayer said once a day over a period**, or **a different prayer each
day** — so the day-by-day novenas (Lenten, Christmas, and many saint novenas) fit the model.

## Context (from JC, the ACTS-107 chat)
JC drew the distinction between two novena shapes:
1. **Rosary/chaplet + litany** sitting, prayed the same each day (ACTS-107 / ACTS-122).
2. **"Novena Prayers"** — *"a single prayer said once a day over a period of time, OR
   different single prayers said over a period of time."*

For shape #2, JC left the modeling to us: *"we probably should allow the prayer to be lumped
into one indicating the day."* I.e. rather than 9 separate devotions, one novena devotion
that surfaces **the right day's prayer** (Day N of 9) when you pray it on that day.

## Acceptance criteria (draft — refine once the structure is seen)
- [ ] A novena devotion can hold an **ordered set of per-day prayers**; praying it on day N
      surfaces day N's prayer (+ any shared/fixed prayers).
- [ ] The single-prayer-repeated case works too (same prayer every day).
- [ ] Reuses the running series' **"Day N of M"** so the day resolves automatically.
- [ ] Renders + prays cleanly; STORAGE_KEY bumped; browser-verified.

## Open question (decide in the chat)
How to model "day-indexed prayers": a new item field (e.g. `novena_day`), a day-keyed
variant group, or a template that reads the session's Day N. Pick as the structure firms up.

## Tests
_Planned — no runner (ACTS-92)._
- **Unit**: day-N resolution picks the right prayer; single-prayer case repeats.
- **Integration**: Pray mode on Day 3 shows the Day 3 prayer.
- **E2E**: N/A until harness.

## Notes
- Unblocks the day-by-day novenas (Lenten ACTS-126, Christmas ACTS-127). Relates to the
  day-varying **offering** in ACTS-122 (same "Day N" plumbing).
