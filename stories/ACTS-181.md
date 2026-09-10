---
id: ACTS-181
title: Keepable quotes — person quote vs Scripture (with citation chooser)
spine:
status: In Progress
origin: human-directed
approved_by: JC
depends_on: []
relates_to: [ACTS-108, ACTS-156, ACTS-176, ACTS-179]
started_at: 2026-09-09T17:13:36-0700
updated:    2026-09-09T17:19:00-0700
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

## Scope (decided 2026-09-09 w/ JC)
A keepable quote is a **typed passage**, and quotes ↔ reflections point at each other.

**A. Typed passage kinds** (`quote_kind`), each surfacing its own fields:
- **open** — text + *from* (who/where you heard it); the current person/free-text quote.
- **scripture** — text + structured ref (book + chapter/verse); byline "— Lk 1:26–38"
  **and deep-links** to the reader's Bible via `buildPassageUrl` (like the Word card).
- **book** — text + title + author (later: OCR a photo → text).
- **article / media** — text + media name **or** website link.
- (room for more later.)

**B. Reflection ↔ quote linkage** (reuses `ReflectionLink target_type:"learning"`):
- **Save → keep:** turn a reflection's inspiring `passage`/`link` (incl. the Scripture
  from a Lectio Divina session) into a saved `quote` KnowledgeItem in the library.
- **Keep → reflect:** "Reflect from this quote" opens a new reflection with that quote as
  the inspiration panel on the writing page.

## Acceptance criteria
- [ ] Adding/editing a quote offers a **kind chooser** (open / scripture / book / article).
- [ ] Each kind shows only its relevant fields; **existing quotes default to `open`**,
      behavior unchanged.
- [ ] **Scripture quote**: passage text + a **citation** (book + chapter/verse); byline
      renders "— Lk 1:26–38".
- [ ] A Scripture quote **deep-links** to the reader's Bible — reuse
      `buildPassageUrl(settings, ref)` from `src/lib/bible/apps.ts`.
- [ ] From a Reflection's inspiring passage, **Save as quote** creates the KnowledgeItem
      (Lectio Divina Scripture included).
- [ ] From a saved quote, **Reflect from this quote** opens the writing page with that
      quote in the inspiration panel.
- [ ] Composes with the library (search, By Vessel / By Channel, category chips).

## Attribution model (decided 2026-09-09, mid-build)
- On the **Vessels** add/edit surfaces the *who* is always the **Vessel** (the Name
  field / picker), never a free-text "From" — a quote added by hand attaches to the
  Vessel only when it's been named (no ghost unnamed Vessel; unnamed → standalone).
- What a quote adds beyond the Vessel is the **work**, not the person: a **book title**
  or a **publication/show** name → `source` (shown only for book/article, as helper
  placeholder). Scripture uses its **citation**; "heard/read" needs neither.
- The free-text **"From"** field belongs on the **future "Save from Reflections"**
  flow (step 4), which has **no Vessel picker** — carry it there, not here.

## Decisions (resolves the earlier open questions)
- **Kind control** → typed chooser with per-kind fields (above), not a single parsed
  free-text field. Scripture ref stored as a parseable string (`"Lk 1:26-38"`), same
  shape as the mystery-body `scripture_ref`.
- **Deep-link** → YES, like the Word card (`buildPassageUrl`).
- **Keep model** → NO separate flag; every saved quote *is* a keeper, lives in the
  existing `quote` category, findable via search / By Vessel / By Channel.
- **Data-shape** (🚩 flagged, approved): add to `KnowledgeItem` —
  `quote_kind: "open" | "scripture" | "book" | "article"` (default `"open"`) and
  `scripture_ref?: string`. Reuse existing `body` / `creator` / `voice_id` / `source` /
  `links`. Migrate with **no `STORAGE_KEY` bump / no reset** (ACTS-177 pattern).

## Tests
- **Unit**: quote-kind predicate + citation format/parse helpers (person vs scripture
  byline; "Lk 1:26-38" ↔ structured ref). Planned (ACTS-92).
- **Integration**: add a Scripture quote via the editor, assert the citation renders as
  the byline and (if wired) the deep-link resolves; add a person quote, assert unchanged.
  Planned.
- **E2E**: extends **flow E12** (Formation / Knowledge) — add a Scripture quote, confirm
  it shows with its citation in the library. Planned.
