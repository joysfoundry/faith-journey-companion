---
id: ACTS-192
title: Show a session's "completed on" date, distinct from its scheduled date
spine:
status: Done
origin: human-directed
approved_by: JC
depends_on: []
relates_to: [ACTS-173, ACTS-191]
started_at: 2026-09-11T00:13:06-0700
updated:    2026-09-12T13:20:00-0700
latest_handoff: stories/ACTS-192/session-01.md
sessions: 1
sync: local
---

## Goal
As someone who prays a scheduled session **early or late**, I want the record to keep its
**scheduled date** *and also* show **when I actually completed it**, so a completed session
doesn't vanish from Home or look like it's still to‑do, and history reads honestly.

JC (2026-09-11):
> When I complete a future session and save it, it disappears on the Home page. The date of
> entry remains with what was scheduled. Keep the scheduled date, but there should be a date
> that shows when it was actually done.

## Context
- The data already exists — no migration needed. `PrayerSession` stores:
  - `context.date` — the **scheduled** day (yyyy-mm-dd)
  - `completed_at` — **when it was actually finished** (full ISO timestamp)
  - `created_at` — when it was started
- **Home surfacing gap:** Home's upcoming/"Today" rows key off a plan's `date`
  (`src/routes/index.tsx` ~541, 7‑day horizon); "Done today" keys off `isToday(completed_at)`
  (~568). When completion happens off the scheduled day the two diverge — a once‑plan can
  re‑appear as a future to‑do while its completion lands in Done under today; a recurring plan
  rolls its `date` forward on finish (`finishSession`, `store.ts`). Net effect = the
  "disappeared / wrong place" JC sees.
- **Display gap:** no view pairs the two dates. The journal's folded sitting uses
  `session.created_at` (`src/routes/reflections.tsx` ~159); the calendar/history use
  `completed_at`. None show *"scheduled for X · done on Y"*.

## Acceptance criteria
- [ ] A session completed on a day other than its scheduled date **stays visible and correctly
      placed** on Home — it doesn't vanish, and it doesn't re‑appear as a startable to‑do once done.
- [ ] Completed sessions show **both** dates where they're listed (journal sitting, history,
      calendar, Home "Done"): the scheduled date is kept, plus "done on `<completed_at>`" when the
      two differ (collapse to one when scheduled == completed day, to avoid noise).
- [ ] The scheduled date on the plan/record is **never overwritten** by the completion date.
- [ ] Date formatting avoids the yyyy-mm-dd UTC-midnight off-by-one (reuse the local-midnight
      pattern, cf. ACTS-191 `formatDayLabel`).

## Open questions for JC
- **"Future session":** reached via the Plan tab (a scheduled once/recurring plan) — confirm the
  exact path you took, so the repro is exact.
- **Both-dates display:** show "done on Y" only when it differs from the scheduled day, or always?
- **Recurring plans:** on early completion, should the plan still roll to its next occurrence
  (current behavior), or is that part of what feels wrong?

## Tests
No runner yet (ACTS-92). **Unit:** any date-pairing/format helper (scheduled vs completed).
**Integration:** Home places a completed-off-schedule session in Done (not Today); journal/history
render both dates. **E2E:** schedule → complete early → appears done, both dates shown. Planned.
