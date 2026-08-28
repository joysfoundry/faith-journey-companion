---
id: ACTS-98
title: Month calendar in Plan > Sessions — color-coded day dots + upcoming list
spine:
status: To Do
origin: human-directed
approved_by: JC
priority: low
depends_on: []
relates_to: [ACTS-96, ACTS-97]
sync: local
synced_at: null
started_at: null
updated: 2026-08-28T13:56:49-0700
latest_handoff: null
sessions: 0
---

## Goal
As a user planning my prayer life, I want a **month calendar** at the top of
**Plan > Sessions** where each day shows small **color-coded dots** for what falls
on it — prayer sessions, planned/upcoming sessions, daily readings, programs, and
past reflections — with a **list of upcoming prayer sessions for the next month**
underneath the grid, so I can see the rhythm of my month at a glance and jump into
what's next.

Low priority.

## Design
Lives **inside Plan (`/pray`) on the Sessions view — NOT a separate tab** and not a
separate route. The Sessions view gets a month-grid calendar above its existing
list (or the calendar replaces/leads the current Sessions content). The orphaned
[`/calendar` route](../src/routes/calendar.tsx) (date-picker + mysteries-for-date +
flat "Prayed" list, unlinked since ACTS-96) is superseded — repurpose its useful bits
or remove it as part of this story.

**Month grid**
- Standard month view (weeks as rows), with prev/next month navigation and a "today"
  affordance. Tapping a day focuses it (drives the list below, or shows that day's
  items).
- Each day cell shows up to a few **color-coded dots**, one color per category:
  - **Prayer sessions** — completed/prayed `Session` (has `completed_at`) on that date.
  - **Planned sessions** — `SessionPlan` occurrences scheduled on that date (expand
    recurrence; ACTS-41 RRULE model). These also feed the list below.
  - **Daily readings** — the liturgical reading for the day
    (`src/lib/liturgical/calendar.ts`; the Home "Word" day).
  - **Programs** — active `KnowledgeItem` programs (category `program`) whose
    `start_date`/`target_date` window covers the day (e.g. Bible in a Year).
  - **Past reflections** — `Reflection` entries recorded on that date.
- Dot colors are a small fixed legend (5 categories). **Encoding TBD with JC** — see
  Open questions. A legend/key is shown near the grid.

**Upcoming list (under the grid)**
- A list of **upcoming prayer sessions for the next ~month** (planned `SessionPlan`
  occurrences from today forward, soonest first), each linking into
  build/start/edit as the Sessions tab already does. Empty state when nothing is
  scheduled.

**Open questions (confirm with JC before/at build)**
- Exact **dot color** per category (and dot cap / overflow "+N" behavior per day).
- Does the day-tap **filter the list to that day**, or is the list always "next
  month" regardless of selection?
- Do we keep the standalone `/calendar` route (repurposed) or delete it?
- Time zone / date-boundary handling for what counts as "on" a day.

## Acceptance criteria
- [ ] Plan > Sessions shows a month-grid calendar above the session content, with
      prev/next month nav and a today affordance — **no new tab/route**.
- [ ] Each day renders color-coded dots for, at minimum: prayer sessions, planned
      sessions, daily readings, programs, and past reflections that fall on it, with
      a visible legend.
- [ ] Below the grid: a list of upcoming prayer sessions for the next month
      (soonest first), with a sensible empty state; entries link into the existing
      session flows.
- [ ] Recurrence is honored (planned occurrences expand correctly per ACTS-41).
- [ ] The orphaned `/calendar` route is repurposed or removed (no dead, unlinked
      route left behind).
- [ ] No regression to the Sessions list, builder, or session start/edit flows.
- [ ] Verified in the browser preview (dots appear on the right days; upcoming list
      correct; month nav works).

## Tests
_Convention (ACTS-91): document coverage; no runner yet (harness = ACTS-92) →
planned._
- **Unit** (Vitest — pure `src/lib/**`): the date→dots aggregation — given a date
  (or month range) + db, return the set of categories present per day; and the
  "upcoming sessions for next month" selector (recurrence expansion, ordering,
  window bounds, month-boundary/leap cases).
- **Integration** (Testing Library): Sessions view renders the month grid; a day
  with a completed session / planned occurrence / reading / program / reflection
  shows the corresponding dot(s); prev/next changes the month; the upcoming list
  renders expected entries and empty state.
- **E2E** (Playwright — see the plan): open `/pray` (Sessions) → calendar visible →
  navigate months → a scheduled session shows a dot and appears in the upcoming
  list → tapping it enters the session flow.
