---
id: ACTS-152
title: Swap the Word and Vessels nav icons (open book, amphora)
spine: ACTS-144
status: Done
origin: human-typed
depends_on: []
relates_to: [ACTS-148, ACTS-144]
started_at: 2026-09-04T16:30:00-0700
updated:    2026-09-04T16:36:17-0700
latest_handoff: null
sessions: 1
---

## Goal
As someone scanning the nav, I want the **Word** and **Vessels** icons to picture what
they are so the menu reads without a second thought.

## Acceptance criteria
- [x] **Word** uses an open book (`BookOpen`) instead of `Sun`.
- [x] **Vessels** uses a jug/oil-vessel (`Amphora`) instead of `Lightbulb`.
- [x] Both change in one place — `src/components/layout/nav-links.ts` is the single
      definition read by the side rail, mobile drawer and bottom bar.
- [x] `tsc --noEmit` clean.

## Notes
`Amphora` (lucide 0.575) is the ancient two-handled jar — reads as both water jug and
oil vessel, and carries the "Vessels" name better than a lamp would. No `STORAGE_KEY`
bump; no copy changes.

## Tests
- **Unit** (Vitest): N/A — no logic, a constant table of icon components.
- **Integration** (Testing Library): N/A — same reason; covered by the browser check below.
- **E2E** (Playwright): N/A — no runner yet (ACTS-92). Verified in the running dev server
  instead: the rendered nav `<svg>` carries `lucide-book-open` for Word and
  `lucide-amphora` for Vessels, in both `NavSections` and `BottomNav`.
