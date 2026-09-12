---
story: ACTS-195
session: 01
wrapped_at: 2026-09-11T19:55:00-0700
status: Done
final: true
---

## What happened
Softened the **active** reading-status pill in the Vessels library. In `src/routes/formation.tsx`
(`ContentRow`, `STATUS_STEPS` map) the selected status (Not started / In progress / Finished) used
the same solid `bg-primary text-primary-foreground` as the filter pills and the Library/Add tabs, so
status shouted as loudly as the primary navigation. Dropped the active state to `bg-primary/15
text-primary` — a calm tint with primary-colored text — matching the codebase's existing
"selected but quiet" convention (`NavSections`). Filters, tabs, and the inactive steps are unchanged.

## Verified (and how)
- Computed styles in dev: active status pill = `oklab(... / 0.15)` background with primary-blue text;
  the "Voices" filter pill stays solid `oklch(0.455 0.135 264)` with white text. Screenshot confirmed
  the reduced intensity.
- No `tsc`/console impact (className-only change).

## Git state at handoff
Committed & pushed (JC pushed). Commits: `410bb26` (code), `1885ff5` (pointer + board + counter).
All acceptance criteria met.

## Next
None — styling-only story, complete.
