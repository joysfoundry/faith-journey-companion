---
id: ACTS-188
title: Settings — choose which Bible versions appear in book resources
spine:
status: In Progress
origin: human-directed
approved_by: JC
depends_on: [ACTS-183]
relates_to: [ACTS-185, ACTS-187]
started_at: 2026-09-10T13:03:55-0700
updated:    2026-09-10T14:00:00-0700
latest_handoff: null
sessions: 0
---

## Goal
As a reader, I want to **choose which Bible versions show up** in my library (book
resources) via checkboxes in Settings — all versions are seeded, but I only want the ones I
use to appear — so my Bible resources aren't cluttered with translations I don't read.

JC: *"checkboxes on which bible versions to show. Let user know these versions [are] seeded
but they can select ones that appear in book resources."*

## Context
ACTS-183 seeds one "Bible — <translation>" book per entry in `BIBLE_TRANSLATIONS`
(NABRE/NIV/ESV/NLT/NKJV/KJV/NASB/RSVCE/DRA) plus a version-less "Bible" (Unknown), all in the
store (`bibleVersionBookId`, `isBibleBookId`). Today all of them show under the **Books**
filter — ~10 Bible entries. This story adds a Settings control so only the chosen versions
**display** (the books stay seeded; a scripture quote already linked to a hidden version is
not broken).

## Acceptance criteria
- [x] Settings has a **"Bible versions in your library"** section listing every seeded
      version with a **checkbox**, plus a one-line note that all are seeded and these toggles
      pick which appear in book resources.
- [x] Only checked versions' **"Bible — X"** books appear in the Library / **Books** filter
      (and as options in the scripture **Version picker**); unchecked are hidden, not deleted.
- [x] The reader's **Settings default translation** (`bible_translation`) stays available /
      checked (disabled checkbox, "always shown"); it's always added back, so at least one
      version remains shown.
- [x] A scripture quote linked to a now-hidden version keeps its link (no data loss); its
      version stays selectable in the picker (appended when hidden) — verified with a NIV
      quote while NIV was off.
- [x] **Data-shape** (flag): new `settings.bible_versions_shown?: string[]` (translation
      ids); **absent = all shown** (JC). No `STORAGE_KEY` bump.

## Decisions (JC, 2026-09-10)
- **Default when unset:** show **all** seeded versions.
- **Scope:** toggles filter **both** the Library display **and** the scripture **Version
  picker** options.
- **Unknown ("Bible", version-less):** **always shown** — not a togglable row.

## Implementation (2026-09-10)
Two shared helpers in `src/lib/bible/apps.ts`: `shownBibleVersionIds(settings)` (unset =
all; default translation always added) and `shownTranslations(settings)` (filtered list in
seed order). `src/lib/prayer/store.ts` adds `isBibleBookVisible(id, settings)` (non-version
ids + the version-less "Bible" always true). Consumers: Settings checkbox section
(`settings.tsx`), Library `items` filter (`formation.tsx`), both scripture Version pickers
(`ReflectionComposer.tsx`, `knowledge.$knowledgeId.tsx` — each appends an already-chosen but
now-hidden version so a link is never dropped). Field added to `AppSettings` in `types.ts`.

**Bug caught in verify:** wrapping the Radix `Checkbox` in a `<label>` double-fired the
toggle (label forwards a click to the button, which is a labelable control) → store/DOM
desync. Fixed to Checkbox + sibling `<Label htmlFor>`.

## Tests
No runner yet (ACTS-92). Unit: the filter that maps `bible_versions_shown` → visible Bible
books (default handling; default translation always included). Integration: toggling a
version hides/shows its book in the library without deleting it or breaking a linked quote.
E2E: extends flow **E12** + a Settings flow. Planned. Manual verify (dev server) done: default
all-checked with NABRE disabled; unchecking NIV materializes the list and hides "Bible — NIV"
in the Library (Unknown "Bible" stays); picker filters yet keeps a hidden linked version.
