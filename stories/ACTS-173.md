---
id: ACTS-173
title: "Seed a standing daily Open Prayer on Home's Prayer & Devotion section"
spine: ACTS-173
status: Done
origin: human-directed
approved_by: JC
depends_on: []
relates_to: [ACTS-108, ACTS-99]
started_at: 2026-09-08T03:46:38-0700
updated:    2026-09-08T03:46:38-0700
latest_handoff: ACTS-173/session-01.md
sessions: 1
---

## Goal
As someone who prays freely every day, I want **Open Prayer** to sit on Home's
**Prayer & Devotion** section as a standing **daily, no-end-date** item, so it's one tap from
Home each day instead of only living in the Prayers list.

## Context
JC had Open Prayer showing at the top of the **Prayers** page (it's a seeded devotion, so it
lists there) but wanted it on **Home** as a daily recurrence. Leaving it in the Prayers list
is fine — this just adds the Home presence.

Home's "Prayer & Devotion" section (`src/routes/index.tsx:515`) shows the settings-driven
**Daily Rosary** row plus **today's plans** — `db.session_plans.filter(p => p.date === today)`
(index.tsx:430). So a standing daily item is modeled as a `SessionPlan`, not a special case.

**The seed/date problem.** The seed stamps everything with `now = SEED_EPOCH` (2024-01-01,
`seed.ts:21`), and a plan's `date` only advances on **finish** (`store.ts` `finishSession`,
one step at a time). So a seeded plan dated 2024-01-01 would never equal `today`, and even a
user's own endless-daily plan silently falls off Home the first day it's missed. Fix: a
**catch-up** in `loadDatabase` normalization — an endless daily plan (`freq:"daily"`,
`interval:1`, no `count`/`until`) whose `date` is before today rolls up to today. Bounded
series (novenas) and other frequencies are untouched, so "Day N of M" and
`fulfills_daily_rosary` are unaffected.

## What shipped
- **Seed** (`seed.ts`): one `SessionPlan` `plan-daily-open-prayer` → `tpl-open-prayer`,
  `recurrence: { freq:"daily", interval:1 }` (no end), `date`/`starts_on` at the SEED_EPOCH
  day, `context:{}`, no `purpose` (planTitle uses the template name "Open Prayer").
- **Catch-up** (`store.ts` `loadDatabase`): roll an overdue endless-daily plan's `date` up to
  `todayISO()`. Idempotent; runs alongside the existing recurrence migration.
- No new `STORAGE_KEY` bump — folded into this session's unpublished **v41**.

## Acceptance criteria
- [x] The seeded Open Prayer plan's `date` resolves to **today** on load (catch-up), from the
      2024-01-01 anchor. _Verified: `date` → 2026-09-08, `dueToday: true`._
- [x] Open Prayer shows on Home under **Prayer & Devotion → Today** with a play button.
      _Verified in browser (screenshot)._
- [x] It stays in the Prayers → Devotions list too (unchanged).
- [x] Bounded/other-frequency plans are not rolled forward. _Condition gates on endless daily._
- [x] `tsc --noEmit` clean.

## Follow-ups (JC, not blocking)
- Publish from `main` (manual).
- If an endless daily should also "catch up" for user-created plans in general, this now does
  — worth a glance that it reads right for any daily plans testers already have.

## Tests
_Convention ACTS-91._
- **Unit** (Vitest — `src/lib/**`): `loadDatabase` catch-up — an endless-daily plan dated in
  the past → `date === todayISO()`; a bounded daily (count/until) and a weekly plan are left
  unchanged; a plan already dated today/future is untouched.
- **Integration** (Testing Library): render Home on a fresh seed → the Open Prayer plan shows
  under Prayer & Devotion "Today"; starting it opens an Open Prayer session.
- **E2E**: N/A until a runner exists.
