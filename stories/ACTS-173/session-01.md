---
story: ACTS-173
session: 01
wrapped_at: 2026-09-08T03:46:38-0700
status: Done
final: true
---

## What happened
JC wanted the seeded **Open Prayer** on Home's Prayer & Devotion section as a daily, no-end
item (fine to also leave it in the Prayers list). Home's section shows `session_plans` where
`date === today`, so modeled it as a `SessionPlan`. The seed stamps `now = SEED_EPOCH`
(2024-01-01) and a plan's `date` only advances on finish, so a seeded plan would never equal
today. Added:
- `seed.ts`: `plan-daily-open-prayer` → `tpl-open-prayer`, endless daily, dated at the epoch.
- `store.ts` `loadDatabase`: catch-up that rolls an **endless-daily** plan's overdue `date`
  up to `todayISO()` (bounded/other-freq untouched) — so the seeded plan surfaces today and
  any endless daily stays due each day.
Folded into this session's unpublished v41 (no extra STORAGE_KEY bump).

## Verified (and how)
Port-8080 preview, cleared v41 to re-seed from the new code:
- `plan-daily-open-prayer` present; `date` rolled 2024-01-01 → 2026-09-08 (`dueToday: true`),
  `starts_on` stays 2024-01-01.
- Home → **Prayer & Devotion → Today → Open Prayer** with a play button (screenshot).
- `tsc --noEmit` clean.

## Git state at handoff
Committed to `main` (local; push blocked — env has no GitHub creds): `seed.ts`, `store.ts`,
story + handoff, backlog row. Unrelated pre-existing working-tree changes left untouched.

## Next
JC: `git push origin main`, then publish. Optional: sanity-check the endless-daily catch-up
against any daily plans testers already have.
