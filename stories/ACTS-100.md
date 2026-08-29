---
id: ACTS-100
title: Explore — daily rosary "choose session" (point the daily at an already-scheduled session)
spine:
status: To Do
origin: human-directed
approved_by: JC
priority: low
depends_on: [ACTS-99]
relates_to: [ACTS-99, ACTS-98]
started_at: null
updated: 2026-08-29T01:28:17-0700
latest_handoff: null
sessions: 0
---

## Goal
As someone praying a daily rosary, alongside **"switch template"** (use a devotion's
prayers as my endless everyday rosary) I want a **"choose session"** option on the daily
rosary that points it at an **already-scheduled session** — so *that* session becomes my
Daily Rosary and I get its **countdown** ("Day X of N") and, for a 54-day novena, its
**petition (days 1–27) / thanksgiving (days 28–54)** tracking.

_Exploration story — the current template-switch behavior is fine as-is (JC 2026-08-29);
this parks the idea for later. See [[daily-rosary-defer-model]]._

## Context / current state
- **Switch template** = endless daily prayers, **no countdown**, no phases — **by design**
  (its purpose is "use these prayers as my standard daily"). Leave as-is.
- **ACTS-99** already gives the countdown path: a scheduled novena `SessionPlan`
  (rosary + bounded recurrence) with `fulfills_daily_rosary` → DAILY ROSARY row shows
  "Day X of N" and reverts when done.

## What to explore
1. **"Choose session" entry point** on the daily rosary control (Home card + the pinned
   DAILY ROSARY row on Pray → Sessions): pick an **existing scheduled session** to fulfill
   the Daily Rosary — i.e. surface ACTS-99's deferral as a picker, not only the builder
   toggle. (Should it just *set* `fulfills_daily_rosary` on the chosen plan? Reuse the
   overlap warn/block.)
2. **Petition / thanksgiving phase model** (genuinely new — nothing models 27+27 or a
   day-index-driven mystery sequence today). Options to weigh:
   - **General multi-phase novena:** template carries optional
     `phases: [{label, days}]` + a "mysteries follow day-index, not weekday" flag →
     row reads "Petition · Day 12 of 27". Reusable for other structured novenas.
   - **54-day specific:** hardcode 27 petition + 27 thanksgiving for `tpl-54-novena` only.
3. How this interacts with the existing template-switch (two modes on one control) and
   whether "choose session" and the ACTS-99 builder toggle should stay two doors to the
   same state.

## Acceptance criteria
_TBD on start — this is an exploration/spike. Likely splits into: (A) "choose session"
entry point + countdown surfacing, and (B) petition/thanksgiving phase model._

## Tests
_N/A until scoped — exploration story. Any code that lands documents tests per the
convention ([[testing-convention]])._
