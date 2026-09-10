---
id: ACTS-181
title: Keepable quotes — person quote vs Scripture (with citation chooser)
spine:
status: To Do
origin: human-directed
approved_by: JC
depends_on: []
relates_to: [ACTS-108, ACTS-156, ACTS-176, ACTS-179]
started_at: 2026-09-09T17:13:36-0700
updated:    2026-09-09T17:13:36-0700
latest_handoff: null
sessions: 0
---

## Goal
As someone saving a quote worth keeping, I want to say whether it's a **person quote**
(words attributed to someone) or **Scripture** (a passage with a book/chapter/verse
citation), so each is stored and displayed with the right attribution — and I can build
a small collection of the quotes I want to hold onto.

## Context (why)
`quote` already exists as a `KnowledgeCategory` (`src/lib/prayer/types.ts`), added via
the content editor (`VoiceEditor.tsx` ~L347) and rendered by `isQuote`/`quoteBody`
(`knowledge.ts`, `knowledge.$knowledgeId.tsx`). But a quote today is only **body text +
an attributed Voice/creator** — there's no way to mark one as **Scripture** or to give it
a **book/chapter/verse citation**. JC wants a chooser at add-time:
- **Person** — text attributed to a person (Voice or free-text creator), as today; and
- **Scripture** — the passage text plus a **structured citation** (book → chapter →
  verse[s]), so it reads "— Lk 1:26–38" and can deep-link to the reader's Bible.

"These are the ones we want to keep" — quotes are the keepsakes of the library.

## Acceptance criteria
- [ ] Adding/editing a quote offers a **Person vs Scripture** chooser.
- [ ] **Person quote**: body text + who (Voice or free-text creator) — current behavior,
      unchanged.
- [ ] **Scripture quote**: passage text + a **citation** chosen with a book picker +
      chapter/verse fields (not just free text — confirm exact control with JC).
- [ ] Quotes display the right attribution byline: "— St. Padre Pio" (person) vs
      "— Lk 1:26–38" (Scripture).
- [ ] A Scripture quote's citation can deep-link to the reader's Bible app — reuse
      `buildPassageUrl(settings, ref)` from `src/lib/bible/apps.ts` (confirm w/ JC).
- [ ] Composes with the library (search, By Vessel / By Channel, category chips).

## Open questions for JC
- Citation control: a **book dropdown + chapter/verse inputs**, or a single free-text
  field we parse ("Lk 1:26-38")? Which books list — the app already has one for the
  liturgical/Bible features?
- Should a Scripture quote **deep-link** to the reader's Bible (like the Word card), or
  stay plain text?
- Is "quotes we keep" just the existing quote category, or a **separate keep/collection**
  flag distinct from other saved content?
- **Data-shape** (flag before building): new fields on `KnowledgeItem` — e.g.
  `quote_kind: "person" | "scripture"` + a scripture ref (book/chapter/verse or a
  `scripture_ref` string). Migrate with **no `STORAGE_KEY` bump / no reset** (ACTS-177
  pattern) — existing quotes default to `person`.

## Tests
- **Unit**: quote-kind predicate + citation format/parse helpers (person vs scripture
  byline; "Lk 1:26-38" ↔ structured ref). Planned (ACTS-92).
- **Integration**: add a Scripture quote via the editor, assert the citation renders as
  the byline and (if wired) the deep-link resolves; add a person quote, assert unchanged.
  Planned.
- **E2E**: extends **flow E12** (Formation / Knowledge) — add a Scripture quote, confirm
  it shows with its citation in the library. Planned.
