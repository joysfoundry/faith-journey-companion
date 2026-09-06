---
id: ACTS-166
title: Make the Home daily-rosary switch actually switch — one picker for devotions and prayer apps
spine:
status: Done
origin: human-typed
approved_by: JC
depends_on: []
relates_to: [ACTS-153, ACTS-99]
started_at: 2026-09-05T17:05:00-0700
updated:    2026-09-05T17:14:05-0700
latest_handoff: ACTS-166/session-01.md
sessions: 1
---

## Goal
As someone whose Daily Rosary opens in Hallow, I want the switch icon on the Home prayer
block to actually change what the daily starts, so that picking a devotion does something
instead of silently doing nothing.

## Context
JC reported: from Home → Prayer block → Daily Rosary, the switch icon opens the "Daily
devotion" picker, but choosing a devotion leaves the row on Hallow.

**Cause.** The Daily Rosary row reads two settings, and one outranks the other:

- `daily_rosary_mode === "external"` → the row shows "Opens in Hallow" and renders the
  external launch link (`src/routes/index.tsx:345`, via `isExternalDailyRosary`)
- `daily_template_id` → which devotion an in-app session starts from

The picker only ever wrote `daily_template_id`. While external mode was on, **nothing on
that row read it** — so the write landed and the UI never moved. Settings has the same two
controls, but shows the devotion select *only* when not external, which is why the bug
never appeared there.

JC's first instinct was to link the picker out to Settings; the smaller fix is to let the
switch switch, and JC then asked for the prayer apps to be **in the list as well**, and to
**match what the Settings list has**.

## What changed (`src/routes/index.tsx` only)
- The picker is now two groups in one dialog — **Pray here** (Standard Holy Rosary + the
  user's devotions) and **Open in another app** (all of `PRAYER_APPS`, same names and
  blurbs Settings renders, `Another app or website` included).
- Choosing a devotion also sets `daily_rosary_mode: "app"` — the fix for the reported bug.
- Choosing an app sets `daily_rosary_mode: "external"` + `daily_rosary_app_id`.
- The checkmark tracks whatever is **live**: the app while external, the devotion otherwise.
- `Another app or website` needs a URL and there is nowhere in a dialog to type one, so it
  sets the mode and navigates to `/settings`, where the address field lives — JC's
  "link to settings" idea, kept for the one case that needs it. Once a custom URL exists
  the row shows its domain (`dailyRosaryAppLabel`) instead of the generic name.

## Acceptance criteria
- [x] With Hallow active, picking a devotion moves the Home row off Hallow
- [x] Picking an app from the same dialog moves the row onto that app
- [x] The row's action flips with it — external link vs. in-app play button
- [x] The app list matches Settings' list (order, names, blurbs, `other` included)
- [x] The checkmark shows the live choice in both modes
- [x] `Another app or website` lands on `/settings` when no URL is set yet
- [x] `tsc --noEmit` clean

## Tests
_UI wiring in one route component; no `src/lib/**` logic, no data shape, no
`STORAGE_KEY` bump (the settings keys already existed)._
- **Unit** (Vitest — pure `src/lib/**`): N/A — no lib code touched. The settings readers
  this depends on (`isExternalDailyRosary`, `effectivePrayerAppId`,
  `dailyRosaryAppLabel`) are unchanged.
- **Integration** (Testing Library — component + store): **planned** — render Home with
  `daily_rosary_mode: "external"`, open the picker, click a devotion, assert the row
  subtitle leaves "Opens in Hallow" and the play button replaces the external link; then
  the reverse. This is the regression that would have caught the bug.
- **E2E** (Playwright — see the plan): **planned** — extend the daily-rosary flow to cover
  the switch in both directions.
