---
id: ACTS-188
title: Settings — choose which Bible versions appear in book resources
spine:
status: To Do
origin: human-directed
approved_by: JC
depends_on: [ACTS-183]
relates_to: [ACTS-185, ACTS-187]
started_at: 2026-09-10T13:03:55-0700
updated:    2026-09-10T13:03:55-0700
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
- [ ] Settings has a **"Bible versions"** section listing every seeded version with a
      **checkbox**, plus a one-line note that all are seeded and these toggles pick which
      appear in book resources.
- [ ] Only checked versions' **"Bible — X"** books appear in the Library / **Books** filter
      (and, sensibly, as options in the scripture **Version picker**); unchecked are hidden,
      not deleted.
- [ ] The reader's **Settings default translation** (`bible_translation`) stays available /
      checked (can't hide the one you deep-link to); at least one version remains shown.
- [ ] A scripture quote linked to a now-hidden version keeps its link (no data loss); its
      version book is still reachable from the quote.
- [ ] **Data-shape** (flag): new `settings.bible_versions_shown?: string[]` (translation
      ids); absent = a sensible default (all, or the Catholic core — decide with JC). No
      `STORAGE_KEY` bump.

## Open questions for JC
- Default when unset: show **all** seeded, or just the **Catholic core** (NABRE/RSVCE/DRA)?
- Should the toggles also filter the scripture **Version picker** options, or only the
  Library display?
- Show the version-less "Bible" (Unknown) as a togglable row, or always keep it?

## Tests
No runner yet (ACTS-92). Unit: the filter that maps `bible_versions_shown` → visible Bible
books (default handling; default translation always included). Integration: toggling a
version hides/shows its book in the library without deleting it or breaking a linked quote.
E2E: extends flow **E12** + a Settings flow. Planned.
