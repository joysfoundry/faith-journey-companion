# Session — Mysteries tab mislabeled the Mater Dei version

Date: 2026-09-09 (local). Story: **ACTS-176** (filed + fixed + Done, pushed). Prod bug
reported by JC.

## What happened (in order)
1. **ACTS-176 — Mysteries tab mislabels the Mater Dei version as "USCCB — Scripture".**
   JC (prod): the **Mater Dei Weekly Rosary**'s mystery version showed as "USCCB — Scripture"
   in Prayers → **Mysteries** — a duplicate of the real USCCB version — while the version
   inside the **devotion** read correctly. JC had only asked for the non-Glorious mysteries
   to be filled in; the source and title were to stay "Mater Dei Catholic Church".
   - **Diagnosed as display-only — data was NOT corrupted.** The Mater Dei body (`body_key:
     "mater-dei-catholic-church"`, ACTS-172) fills all 20 mysteries: the Glorious 5 carry the
     parish's own NABRE (`src-mater-dei-catholic-church`, "Mater Dei Catholic Church"), the
     other 15 reuse USCCB Scripture as a placeholder **deliberately attributed** to USCCB
     (`src-usccb-rosary`, "USCCB — Scripture"). [`mysteryVersions`](../../../src/lib/prayer/compiler.ts)
     named a version by the **source of the first mystery it encountered** for that
     `body_key`; sets iterate Joyful → Sorrowful → Glorious → Luminous, so the first Mater
     Dei content hit was a Joyful USCCB placeholder — mislabeling the whole version. The
     devotion picker was right because `allMysteryBodies` names by the version **label** first.
   - **Fix (one line):** `mysteryVersions` now prefers `c.label`, then source name — matching
     `allMysteryBodies` and the devotion picker. A version shows its consistent label
     regardless of which mystery lists first or where individual bodies borrow their text.
     No data shape change, **no `STORAGE_KEY` bump**; existing installs correct on next load.
   - Filed [`stories/ACTS-176.md`](../../../stories/ACTS-176.md) + [session-01](../../../stories/ACTS-176/session-01.md),
     added the backlog row in `docs/JIRA-BACKLOG.md`, board row in `stories/README.md`,
     bumped `stories/.counter` 175 → 176, and refreshed the stale counter note in the ledger
     ("currently 172" → 176).

## Verified (and how)
Local preview (v41 seed), Browser pane. Worked around the beta gate (`acts-beta-unlocked-v1`
+ seeding `settings.display_name` and `onboarding_completed_at` directly in the
`prayer-companion-db-v41` localStorage). Pane was hidden (0×0) so `computer` clicks failed;
switched the Radix tab by dispatching pointer events via `javascript_tool`, then read the
rendered version-card anchors. Result: Mysteries tab lists **four distinct versions** —
Reflection, USCCB — Scripture, Ascension — Meditation, **Mater Dei Catholic Church** (each 20
mysteries). Screenshot confirmed. Devotion picker name unchanged.

## Git state at handoff
**Committed & pushed** (JC pushed both; `main` in sync with `origin/main`):
- `3076b24` — code fix (`src/lib/prayer/compiler.ts`, 1 line).
- `59a39a8` — ACTS-176 docs (pointer, session-01, backlog row, board row, counter).

Left uncommitted **by design** (pre-existing ACTS-162 working tree, per JC's Sep-8 call —
not this session's work): `public/invite.html`, `src/routes/about.tsx`, `stories/ACTS-162.md`,
`supabase/migrations/0003_feedback.sql`.

## Parked / next
- Nothing open for ACTS-176 — ships on the next Lovable Publish from `main` (no migration).
- JC's standing ACTS-172 follow-ups still pending: fill the 4 Glorious prose reflections and
  swap the 15 USCCB placeholders for the parish's own text.

## Next session — opener (paste to start)
> Oravia (faith-journey-companion), local-first React app. Last session fixed ACTS-176 (Done,
> pushed): the Prayers → Mysteries tab was naming each version by its first mystery's source,
> so the Mater Dei body (which borrows USCCB Scripture for its 15 non-Glorious placeholders,
> attributed to USCCB by design) showed as a duplicate "USCCB — Scripture". Fixed in
> `mysteryVersions` (compiler.ts) to name by the version label first. Open threads: the
> pre-existing ACTS-162 feedback feature is still uncommitted in the working tree (invite.html,
> about.tsx, ACTS-162.md, 0003_feedback.sql — leave until that story is ready), and JC's
> ACTS-172 follow-ups (fill 4 Glorious prose reflections + swap 15 USCCB placeholders for the
> parish's own). Counter is at 176; next new story = ACTS-177.
