---
id: ACTS-99
title: Daily rosary defers to a scheduled novena rosary
spine:
status: In Progress
origin: human-directed
approved_by: JC
depends_on: []
relates_to: [ACTS-98, ACTS-97, ACTS-96]
started_at: 2026-08-29T00:38:49-0700
updated:    2026-08-29T01:04:05-0700
latest_handoff: null
sessions: 0
---

## Goal
As someone praying a daily rosary, when I schedule a **novena** (or any rosary-bearing
devotion), I want the option to say *"I'm doing my daily rosary via the novena"* for its
duration — so the **DAILY ROSARY** slot is fulfilled by the novena instead of showing a
second rosary, and the standalone daily rosary returns automatically when the novena ends.

## Acceptance criteria
- [x] The **daily rosary always appears** in the sessions list — it is not dropped when
      other sessions exist.
- [x] When a **novena / rosary-bearing devotion** is scheduled, a **toggle** is offered on
      that session — *"defer daily rosary to this novena" / "I'm doing my daily rosary via
      the novena."*
- [x] While deferred: the **DAILY ROSARY** label is **retained** on the row, but it is
      fulfilled by the novena rosary — **no duplicate** standalone daily rosary appears.
- [x] The deferred/novena row shows **"Day X of N."**
- [x] Deferral lasts for the novena's **N days**; when the novena **completes**, the
      standalone daily rosary **reappears** automatically.
- [x] **Start-date-aware counter:** if the novena's `starts_on` predates the day it was
      created, "Day X" reflects elapsed days from `starts_on` (as if created on/before the
      start date), not from creation.
- [x] Deferral is **distinct** from the daily rosary merely *using* a template rosary —
      it is an explicit, time-boxed handoff to the novena.
- [x] The user can **still schedule multiple rosary sessions** even while the daily is
      deferred to a novena — deferral only replaces the DAILY ROSARY slot, not other
      scheduled rosaries.

## Design decisions (confirmed w/ JC)
- **Daily rosary = a setting, not stored data.** Today it is derived from
  `settings.daily_template_id` (default `tpl-rosary`) + weekday mystery rotation; no
  daily `PrayerSession`/`SessionPlan` exists until the user prays. **Keep it setting-driven**
  and render a **pinned, first-class virtual "DAILY ROSARY" row** at the top of Pray →
  Sessions (begin + edit-daily actions) — no stored daily plan, no migration.
- **Defer field:** new optional `fulfills_daily_rosary?: boolean` on `SessionPlan`
  (additive/optional → no storage-key bump).
- **Defer toggle** lives in the **session builder** ([pray.tsx](../src/routes/pray.tsx)),
  shown only when the session **involves a rosary** (`mysteryCount > 0`) **and** the
  recurrence is **bounded** (novena-shaped). Label ~ "I'm praying my Daily Rosary through
  this novena."
- **N & window derived** from `starts_on` + `recurrence.count` via existing
  `occurrenceInfo` — no separate day counter. Earlier `starts_on` already yields the correct
  "Day X" (uses `daysBetween`); **no back-dated completions** (prior days show un-prayed).
- **Deferral active** = a `fulfills_daily_rosary` plan whose series window contains `today`
  → that plan's row wears the DAILY ROSARY label + "Day X of N"; the virtual daily row is
  suppressed (no duplicate). Past the last occurrence → auto-reverts (pure date math).
- **Overlap rule: warn/block** — turning on a second deferral whose window overlaps an
  already-active one is prevented with a warning (at most one active fulfiller per day).
- **Other rosary plans are unaffected** — always list; deferral governs only the virtual
  daily slot.

## Implementation
- `src/lib/prayer/types.ts` — `SessionPlan.fulfills_daily_rosary?: boolean` (optional/additive).
- `src/lib/prayer/compiler.ts` — `seriesEndDate`, `fulfillsDailyRosaryOn`,
  `activeDailyRosaryFulfiller`, `deferralWindowsOverlap` (window/anchor math on top of the
  existing `occurrenceInfo`).
- `src/routes/pray.tsx` — defer toggle in the builder (rosary + bounded only) with a live
  window/"Day X of N" preview; overlap warn/block on save; pinned virtual DAILY ROSARY row
  in Sessions; fulfiller row wears the DAILY ROSARY badge + "Day X of N".
- `src/routes/index.tsx` — Home Daily card defers to the active fulfiller (label kept, Day
  X of N, routes to the novena) and de-dupes it from the today/continue/done lists.

## Verified (browser, dev server)
- Pinned **DAILY ROSARY** row shows with no sessions. ✓
- Toggle appears only for a rosary on a bounded series; preview showed back-dated start
  `2026-08-27 → 2026-09-04 · today is Day 3 of 9` (today 2026-08-29). ✓ (start-date-aware)
- After save: Sessions row = **DAILY ROSARY · The Holy Rosary · Day 3 of 9**, pinned row
  suppressed (no duplicate); Home card mirrors it. ✓
- Second overlapping deferral **blocked** (count stayed 1). ✓
- A second (non-deferred) rosary saved fine alongside the deferred daily (Sessions = 2). ✓
- No console errors.
- _Reappearance after the window ends is pure date math (`fulfillsDailyRosaryOn` → false
  once `today > end`), i.e. the same predicate observed in both states above; not separately
  time-traveled._

## Tests
_Document coverage for EVERY story. No runner is wired yet — see
[`docs/E2E-TEST-PLAN.md`](../docs/E2E-TEST-PLAN.md) (harness = ACTS-92); until then these
are **planned**._
- **Unit** (Vitest — pure `src/lib/**`): start-date-aware "Day X of N" counter when
      `starts_on` predates creation; deferral-window active/expired predicate; daily-rosary
      resolution (standalone vs. fulfilled-by-novena).
- **Integration** (Testing Library — component + store): sessions list renders DAILY
      ROSARY row while deferred (label retained, no duplicate); toggle on/off flips the
      row source; multiple additional rosary sessions still schedulable during deferral.
- **E2E** (Playwright — see the plan): schedule a novena → defer daily rosary → verify
      DAILY ROSARY row = novena "Day X of N" → complete novena → standalone daily rosary
      reappears.
