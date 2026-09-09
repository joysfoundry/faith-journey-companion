---
id: ACTS-180
title: Content links by format — paper book vs audio book (typed links)
spine:
status: To Do
origin: human-directed
approved_by: JC
depends_on: []
relates_to: [ACTS-137, ACTS-178, ACTS-171]
started_at: 2026-09-09T13:30:00-0700
updated:    2026-09-09T13:30:00-0700
latest_handoff: null
sessions: 0
---

## Goal
As someone saving a book (or other multi-format content), I want its links divided
by **format** — e.g. **paper book** vs **audio book** — so a content item can carry
both "where to read it" and "where to listen to it", each shown with its own label
and icon.

## Context (why)
JC, 2026-09-09, looking at the Home Vessels card: "Why We're Catholic" is a **book**;
Amazon is only **where to buy it**. JC: "I can remove link and put audio link… there
is an audio book and paper book, that is how I would divide it." So a book's links are
really **formats/editions**: a paperback link (Amazon), an audiobook link (Audible /
Apple Books / Spotify), maybe an ebook link.

Today a `KnowledgeLink` has `platform` + `url` + `label` + `pinned`. Platform captures
*where* (store/podcast/website), not the **format** (paper vs audio). This story adds
that dimension.

## Acceptance criteria
- [ ] A content item's links carry a **format** distinction (at least **paper** vs
      **audio**; consider **ebook**/**video**). Decide the shape with JC: a new
      `format` field on `KnowledgeLink`, vs. leaning on `platform` (e.g. store=paper,
      an audiobook platform=audio) — **data-shape change, flag first**.
- [ ] The editor (`knowledge.$knowledgeId.tsx` / `VoiceEditor`) lets you add/remove a
      link and set its format; a book can hold both a paper and an audio link.
- [ ] Links render with a **format-aware label/icon** (a book icon for paper, a
      headphones/audio icon for audio) across the library rows and the Home pins.
- [ ] Reuses the shared `PLATFORM_ICON` map / a new format-icon map (`platform-icon.tsx`).
- [ ] If a `format` field is added: migrate existing links (default paper/unknown) in
      `loadDatabase` **without** a destructive `STORAGE_KEY` bump (per the seed gotcha),
      like the ACTS-177 `favorite→pinned` migration.

## Open questions for JC
- New `format` field, or infer from `platform`? (Audible/Apple Podcasts/Spotify = audio.)
- Which formats to support: paper, audio, ebook, video?

## Tests
- **Unit**: format inference/migration over `KnowledgeLink`. Planned (ACTS-92).
- **Integration**: add a paper + an audio link to a book; assert both render with the
  right icon/label. Planned.
- **E2E**: extends E12 / E17 — a book pinned with an audio link shows the audio icon
  on Home. Planned.
