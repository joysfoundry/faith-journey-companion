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

### Alternatives considered — and why Amphora stayed (JC, 2026-09-04)
Vessels holds **three media: audio, books, video.** No icon in lucide draws all three,
so anything that pictures a format silently drops the other two — a promise the section
doesn't keep. That ruled out every literal option:

- **`Library` / `LibraryBig` / `BookCopy`** — shelved or stacked books. Paper only, and
  `Library`'s spines sit next to the `BookOpen` now on Word, putting two book shapes in
  one menu.
- **`BookHeadphones`** — the one glyph carrying two formats at once (book + headphone
  band); the closest fit, but covers 2 of 3 and drops video.
- **`MonitorPlay` / `Laptop` / `Computer`** — the same failure inverted: video only.
  A **two-glyph pair** (shelf + screen) is the only way to say "paper and digital"
  outright, and costs visual noise in a nav row.
- **`Brain`** — knowledge, but eight paths that turn to mush at 20px.
- **`GraduationCap`** — the one swap that would have *added* meaning (names the purpose,
  not the contents; on the nose for the `/formation` route), but reads schoolish for a
  devotional app.

**Kept `Amphora`:** it names no medium, so all three live inside it; it echoes the
section's own name; and it's the most distinct silhouette in the nav.

## Tests
- **Unit** (Vitest): N/A — no logic, a constant table of icon components.
- **Integration** (Testing Library): N/A — same reason; covered by the browser check below.
- **E2E** (Playwright): N/A — no runner yet (ACTS-92). Verified in the running dev server
  instead: the rendered nav `<svg>` carries `lucide-book-open` for Word and
  `lucide-amphora` for Vessels, in both `NavSections` and `BottomNav`.
