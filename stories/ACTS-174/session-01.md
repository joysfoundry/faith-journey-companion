---
story: ACTS-174
session: 01
wrapped_at: 2026-09-08T04:05:00-0700
status: Done
final: true
---

## What happened
Filed and implemented in one go. Home's Prayer & Devotion now looks a week ahead: widened the
plan window in `src/routes/index.tsx` from `p.date === today` to `[today, today+7]`
(`HORIZON_DAYS`, `weekHorizon`), sorted soonest-first, and the "Today" row eyebrow renders a
`Sat, Sep 12`-style date for future rows (label-less "Today" for today's). Each plan shows
once at its stored next occurrence — recurrences are not expanded per day, so the ACTS-173
daily Open Prayer stays one "Today" row rather than filling the week. The done-today skip is
now gated on `plan.date === today`.

Filed with a note that git history does NOT show an inline week view on Home that regressed
(filter's been today-only since the Aug redesign `0b4bff4`; pre-redesign Home had no plans) —
so this reads as restore/build, cause-of-loss unknown.

## Verified (and how)
Port-8080 preview (v41): Home Prayer & Devotion shows "TODAY · Open Prayer" and, inline,
"SAT, SEP 12 · The Holy Rosary" (a plan dated within the week), with the daily rosary row
above — screenshot captured. `tsc --noEmit` clean.

## Git state at handoff
Committed to `main` (local; push blocked — env has no GitHub creds): `src/routes/index.tsx`,
story + handoff, backlog row. Unrelated pre-existing working-tree changes left untouched.

## Next
JC: `git push origin main`, then publish. Optional future tweaks (deferred, not needed):
make the 7-day horizon a setting; a subtle Today/Upcoming divider if the inline list grows.
