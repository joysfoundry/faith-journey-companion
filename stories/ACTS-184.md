---
id: ACTS-184
title: Reflection composer — save/reflect quotes + layout reshape
spine:
status: Done
origin: human-directed
approved_by: JC
depends_on: [ACTS-181]
relates_to: [ACTS-103, ACTS-108, ACTS-135, ACTS-136, ACTS-138, ACTS-156]
started_at: 2026-09-09T22:40:05-0700
updated:    2026-09-09T22:40:05-0700
latest_handoff: null
sessions: 1
---

## Goal
As someone writing a reflection, I want the composer to let me **save the quote that
inspired me** straight into my library and **reflect from a saved quote**, with a clean,
predictable layout — so the reflection surface and the keepable-quotes library are one
connected flow.

## Context (why)
Split out of **ACTS-181** (typed keepable quotes): 181 owns the quote *entity* (kinds +
Scripture citation + Bible deep-link); this story owns the **reflection-composer** side
of the ACTS-181 "reflection ↔ quote" arc, which grew into a full composer reshape through
JC's live iteration. The code shipped under ACTS-181 commits (`415250f`, `ee23eab`); this
pointer is the writeup + record.

## What shipped
- **Add a quote (was "Add a passage"):** the composer's book-icon passage popover became a
  `MessageSquareQuote` **"Add a quote"** popover that **mirrors the library quote-add**
  (kind chooser: Heard / Scripture / Book / Article, + the free-text **From**) and **saves
  a real library quote**, linking the reflection to it via a `learning` link — no
  throwaway `passage`. Closes on save.
- **Reflect from a quote (bug fix):** the "Reflect on this" icon deep-links to
  `/reflections?link=<id>`, but the path was silently broken — `linkables` grouped the
  library as `"Knowledge"` while `GROUP_TARGET` only knew `"Learn"`, so a reflected-from
  quote resolved as a generic `intention` (no body). Mapped `Knowledge`→`learning`, gave
  quotes a `contentTitle` snippet label, and made a Scripture quote's `scripture_ref` its
  inspiration detail.
- **Save → keep:** `InspirationPanel` passage cards offer **"Save as quote"** (mints an
  `open` library quote) — the fallback for any legacy `passage` links.
- **"Open dialogue" mode removed:** the toggle only tagged the entry with a badge and its
  name clashed with the separate **Open Prayer** devotion (ACTS-108). Dropped from the
  composer (new reflections are always `"written"`); `ReflectionMode` type + the legacy
  badge render stay.
- **Layout reshape (JC):** **title → text box → add-icons → "What inspired this" cards →
  themes → save/discard.** Add-icons group with the cards they produce.
- **No inspiration chips:** the redundant badge chips are gone — the inspiration **cards**
  are the single view, each with its own **✕ remove** (`InspirationPanel.onRemove`;
  composer maps it to `toggleLink`/`removeManualLink`). Dead `Badge`/`labelFor`/`BookOpen`
  pruned.
- **ThemeEditor order:** applied theme chips moved below the add-input, beside Suggested.

## Acceptance criteria
- [x] Composer "Add a quote" saves a typed library quote and links the reflection to it.
- [x] Reflecting from a saved quote shows the quote body + attribution in the panel.
- [x] Inspiration shown once (cards), each removable; no duplicate chips.
- [x] Composer layout matches the agreed order; themes at the bottom by Suggested.
- [x] "Open dialogue" removed without breaking legacy entries or draft persistence.

## Follow-on
- **Lectio Scripture → quote:** saving the Scripture *read inside a Lectio session* as a
  quote belongs on `session.$sessionId` (the scripture lives on the session, not a
  reflection link) — not built here.

## Tests
- **Unit**: `GROUP_TARGET`/linkables resolve a quote as `learning` with a body; the
  compose-quote builder (kind + fields → a valid quote + `learning` link). Planned (ACTS-92).
- **Integration**: add-a-quote (each kind) saves to the library and links; reflect-from-quote
  shows the body; remove ✕ un-links. Planned.
- **E2E**: extends the Reflection flow (write → add quote → save; reflect-from-quote). Planned.
- **Manual (this session):** all of the above verified in the preview.
