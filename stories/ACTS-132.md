---
id: ACTS-132
title: Session "Day N of M" counts from the session's own date, not the plan's rolling date
spine:
status: Done
origin: human-directed
approved_by: JC
depends_on: []
relates_to: [ACTS-107, ACTS-99]
started_at: 2026-08-30T16:20:00-0700
updated:    2026-08-30T16:20:00-0700
latest_handoff: null
sessions: 0
---

## Goal
As someone praying a multi-day devotion (novena), when I open a session for a
given date I want to see the day that belongs to *that* date — "Day 3 of 9" for
the third day — not whatever day the plan is currently on.

## Bug
A recurring plan's `date` field **rolls forward** to its next occurrence every
time a session finishes (`finishSession`, `src/lib/prayer/store.ts`). The session
route derived the "Day N of M" label from `plan.date`, so it always reflected the
plan's *current* occurrence — showing today's day number on every session,
including past (and future) ones, instead of the day each session represents.

## Fix
`src/routes/session.$sessionId.tsx` — the `occurrenceInfo` call now counts from
`session.context.date` (the date the session was actually prayed, captured at
creation), falling back to `plan.date` / `plan.starts_on`. The plan anchor
(`starts_on`) and recurrence are unchanged.

## Acceptance criteria
- [x] "Day N of M" on a session matches that session's own date, not the plan's
      rolled-forward `date`.
- [x] A novena whose plan has already advanced (e.g. now on Day 6) still shows
      "Day 3 of 9" when you open the session prayed on Day 3.
- [x] `plan.date` / `plan.starts_on` remain as fallbacks when a session has no
      context date.
- [x] `npx tsc --noEmit` clean.

## Tests
- **Unit** (Vitest — pure `src/lib/**`): _planned_ — `occurrenceInfo(startsOn, r,
      onDate)` returns index 3 for the third daily occurrence regardless of where
      `plan.date` sits. Harness = ACTS-92.
- **Integration** (Testing Library): _planned_ — session route renders "Day 3 of
      9" from `session.context.date` while the plan's `date` points at a later day.
- **E2E** (Playwright): N/A — covered by the unit/integration layers; no new flow.

## Commit(s)
- `d89727a` — fix: session Day N of M counts from the session's own date
