---
id: ACTS-174
title: "Home: show upcoming sessions (next 7 days) inline with their date, not just today"
spine: ACTS-174
status: Done
origin: human-directed
approved_by: JC
depends_on: []
relates_to: [ACTS-173, ACTS-99]
started_at: 2026-09-08T03:53:49-0700
updated:    2026-09-08T04:05:00-0700
latest_handoff: ACTS-174/session-01.md
sessions: 1
---

## Goal
As someone planning my week, I want Home's **Prayer & Devotion** list to show sessions
scheduled in the **next 7 days**, each labeled with its date, **inline** with today's rows
(not a separate section), so I can see what's coming without opening the Plan tab — the way
it used to.

## Context
JC reports Home used to surface upcoming sessions (next 7 days) inline, each with its date,
and now shows only today's. Note for the implementer: git history doesn't corroborate an
inline week view on Home — the plan filter has been `db.session_plans.filter(p => p.date === today)`
since the Aug redesign (`0b4bff4`), and the pre-redesign Home listed no plans at all. So treat
this as **restore/build** the behavior, cause-of-loss unknown; the Plan tab (`/pray`) already
has a working "Upcoming" list to mirror.

**Where it lives:** `src/routes/index.tsx`, section A "Prayer & Devotion" (~line 515). The
today loop is ~line 430:
```ts
for (const plan of db.session_plans.filter((p) => p.date === today)) { … todayList.push(…) }
```
`todayList` rows render without a date (they're "today"). The Plan tab's Upcoming
(`src/routes/pray.tsx` ~1023) shows all plans sorted by `date` with a `dateLabel`
(`Sep 8` etc.) — the pattern to reuse.

## Plan
1. Widen the Home plan window from `p.date === today` to **`today <= p.date <= today+7`**
   (a `HORIZON_DAYS = 7` constant; compute the end with a small date helper). Keep the daily
   rosary row + continue/done logic as-is.
2. Render each row with its date the way the Plan tab does — **today** rows stay label-less
   (or "Today"); **future** rows show `Sep 8`-style `dateLabel`. Sort by date ascending.
3. Show each plan **once at its stored `date`** (the next occurrence) — do **not** expand a
   recurrence into one row per day, or a daily plan (e.g. the ACTS-173 Open Prayer, whose
   date is rolled to today) would flood the week. This matches the Plan tab.
4. Tapping a future row begins/opens that plan (same as a today row).

## Open questions
- **Recurring plans:** show only the single next occurrence within the window (recommended,
  matches the Plan tab and step 3), or every occurrence in the 7 days? Recommend: next only.
- **Horizon:** 7 days — fixed, or a setting? Recommend: fixed 7 for now.
- **Grouping:** purely inline sorted by date (JC: "not a separate section"), or a subtle
  "Today" vs later divider? Recommend: inline, date badge carries the distinction.

## Acceptance criteria
- [x] Home's Prayer & Devotion lists plans with `date` in `[today, today+7]`, inline, sorted
      by date, each future row showing its date. _Verified: "SAT, SEP 12 · The Holy Rosary"
      shows under "TODAY · Open Prayer"._
- [x] A plan later this week appears on Home before its day (with the date); today's rows are
      unchanged in behavior (start/continue/done).
- [x] Recurring plans appear once (next occurrence), not expanded per day. _The daily Open
      Prayer shows once, at today._
- [x] The daily rosary row and Done-today handling are unaffected (the done-today skip is now
      gated on `plan.date === today`).
- [x] `tsc --noEmit` clean.

## Outcome — DONE 2026-09-08
Implemented in `src/routes/index.tsx` only. Widened the plan window from `p.date === today`
to `[today, today+HORIZON_DAYS]` (`HORIZON_DAYS = 7`, `weekHorizon` computed from `today`),
sorted soonest-first, and the "Today" row's eyebrow now renders a `Sat, Sep 12`-style date for
future rows (label-less "Today" for today). Each plan shows once at its stored next occurrence
— no per-day expansion — so the ACTS-173 daily Open Prayer stays a single "Today" row. The
done-today skip is gated on `plan.date === today` so a future row is never mistaken for a
finished one. Browser-verified (screenshot); `tsc` clean. Decisions taken (were open Qs):
recurrence = next-only, horizon = fixed 7, inline with a date badge (no divider).

## Tests
_Convention ACTS-91._
- **Unit** (Vitest — `src/lib/**`): the window predicate (inclusive `[today, today+7]`, date
  string compare; excludes past + day 8) if extracted to a helper.
- **Integration** (Testing Library): render Home with plans dated today, +3, +7, +8 → the
  first three show (with dates on the future two), the +8 does not; a recurring plan shows once.
- **E2E**: N/A until a runner exists.
