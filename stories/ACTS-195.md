---
id: ACTS-195
title: Vessels — tone down the active reading-status pill so it doesn't compete with the header controls
spine:
status: Done
origin: human-directed
approved_by: JC
depends_on: []
relates_to: [ACTS-189, ACTS-182, ACTS-179]
started_at: 2026-09-11T19:48:27-0700
updated:    2026-09-11T19:55:00-0700
latest_handoff: stories/ACTS-195/session-01.md
sessions: 1
---

## Goal
As someone scanning the Vessels library, I want the reading-status pill (Not started /
In progress / Finished) to read at a lower visual intensity than the section/filter pills,
so status is legible but doesn't dominate the page.

JC (2026-09-11):
> Can you make the in progress a different intensity than the header pills? The status
> shouldn't be so prevalent.

## Context
- In `src/routes/formation.tsx`, the **active** status pill (`ContentRow`, `STATUS_STEPS`
  map) used the exact same style as the **filter** pills (Voices/Channel/Books/…) and the
  Library/Add tabs: `bg-primary text-primary-foreground` (solid strong blue). So an "In
  progress" status shouted as loudly as the primary navigation controls.
- The codebase already has a "selected but calm" convention — `NavSections.tsx`
  (`bg-primary/10 text-primary`) and several `bg-primary/15 text-primary` badges — and oklch
  opacity utilities render fine here.

## Acceptance criteria
- [x] The **active** status pill uses a lower-intensity treatment (`bg-primary/15 text-primary`)
      — a soft primary tint with primary-colored text, clearly calmer than the solid filter
      pills / tabs.
- [x] The three-way status is still legible and the selected step is obvious against the grey
      inactive steps (`bg-secondary text-muted-foreground`).
- [x] Filter pills and Library/Add tabs are unchanged (they stay the strong primary).

## Tests
No runner yet (ACTS-92). Pure CSS/className change. **Verified in dev:** the active status
pill computes to `oklab(... / 0.15)` background with primary-blue text, while the "Voices"
filter pill stays solid `oklch(0.455 0.135 264)` with white text — confirmed via computed
styles + screenshot. Unit/Integration/E2E: N/A (styling-only).
