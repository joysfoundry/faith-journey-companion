---
id: ACTS-181
title: Keepable quotes — person quote vs Scripture (with citation chooser)
spine:
status: Done
origin: human-directed
approved_by: JC
depends_on: []
relates_to: [ACTS-108, ACTS-156, ACTS-176, ACTS-179, ACTS-183, ACTS-184]
started_at: 2026-09-09T17:13:36-0700
updated:    2026-09-09T22:40:05-0700
latest_handoff: null
sessions: 1
---

> **Done 2026-09-09.** Core = typed keepable quotes (kind chooser, Scripture citation +
> Bible deep-link) across add + edit + display, migrated with no `STORAGE_KEY` bump. The
> **reflection-composer** side of the arc (Add-a-quote, reflect-from-quote, layout
> reshape) was split to **[[ACTS-184]]**; the book-quote↔book linking to **[[ACTS-183]]**.
> Commits `8bf79ff`, `89ed4c4`, `415250f`, `ee23eab` (unpushed at close — see wrap).

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
- [x] From a Reflection's inspiring passage, **Save as quote** creates the KnowledgeItem.
      (Pasted `passage` inspirations → an `open` library quote, via `InspirationPanel`.
      **Follow-on:** saving the Scripture *read inside a Lectio session* lives on the
      session surface, not the reflection panel — filed as a note below.)
- [x] From a saved quote, **Reflect from this quote** opens the writing page with that
      quote in the inspiration panel. (Reflect icon → `?link=<id>`; fixed the latent
      `Knowledge`→`learning` mapping + empty-quote-label bug so the body actually shows.)
- [ ] Composes with the library (search, By Vessel / By Channel, category chips).

## Build log — steps 4–5 (2026-09-09)
- **Save → keep:** `InspirationPanel` passage cards now offer **"Save as quote"** →
  mints an `open` quote (`body` = excerpt, `source` = the passage's Source label). Only
  `passage` cards (which carry their own text); `learning`/entity cards don't.
- **Reflect → keep (bug fix):** the reflect-from-quote path was silently broken —
  `linkables` grouped the library as `"Knowledge"` but `GROUP_TARGET` only knew `"Learn"`,
  so a reflected-from quote resolved as a generic `intention` (no body). Mapped
  `Knowledge`→`learning`, gave quotes a `contentTitle` label, and made a scripture quote's
  `scripture_ref` its inspiration detail.
- **Lectio Scripture follow-on:** "save the passage I read in a Lectio session as a quote"
  belongs on `session.$sessionId` (the scripture lives on the session, not a reflection
  link) — not built here.
- **"Add a passage" → "Add a quote"** (JC, same session): the composer's book-icon
  passage popover is replaced by a `MessageSquareQuote` **"Add a quote"** popover that
  **mirrors the library quote-add** (kind chooser + fields + the free-text **From**) and
  **saves a real library quote**, linking the reflection via a `learning` link — no
  throwaway `passage`. Closes on save. (The `passage` link type + the InspirationPanel
  "Save as quote" button stay for any legacy passage links, but are no longer the path.)
- **"Open dialogue" mode removed:** the toggle only tagged the entry with a badge and its
  name clashed with the separate **Open Prayer** devotion (ACTS-108) — JC couldn't recall
  what it did, so it's dropped from the composer (new reflections are always `"written"`).
  The `ReflectionMode` type + the badge render stay for any legacy entries.
- **Composer layout reorder (JC):** now **title → text box → add-icons → "What inspired
  this" cards → themes → save/discard**. The add-icons group with the cards they produce
  (right under the text box); Themes moved down to just above Save.
- **"What inspired this" chips removed (JC):** the redundant badge chips are gone — the
  inspiration **cards** are the single view, each carrying its own **✕ remove**
  (`InspirationPanel` gained an `onRemove`; the composer maps it to
  `toggleLink`/`removeManualLink`). Dead `Badge`/`labelFor`/`BookOpen`/`X` pruned.
- **ThemeEditor order:** applied theme chips moved below the add-input, beside the
  Suggested row (JC).

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
