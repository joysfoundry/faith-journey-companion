---
id: ACTS-194
title: Scripture citation typeahead — book suggestions (version-aware) for consistent references
spine:
status: In Progress
origin: human-directed
approved_by: JC
depends_on: []
relates_to: [ACTS-185, ACTS-191, ACTS-183, ACTS-188]
started_at: 2026-09-11T11:14:41-0700
updated:    2026-09-11T11:14:41-0700
latest_handoff: null
sessions: 0
---

## Goal
As someone entering a Bible reference, I want the app to **suggest the book as I start typing**
(from the canon of the Bible version I've chosen), so citations are entered **consistently** —
which keeps them tidy and makes the ACTS-191 one-quote-per-passage dedup reliable.

JC (2026-09-11):
> Help with books when a scripture book and chapter are being entered. We should keep entries of
> these consistent, so helping the user — based on the Bible version — when they start typing
> should be an option.

## Context
- **The book dataset already exists** in `src/lib/bible/apps.ts`: `USFM` (lowercase full book name
  + a few aliases → USFM code, deuterocanon included) and `USFM_TO_NAME` (code → canonical display
  name). Version canon is known too (a translation is flagged Catholic/deuterocanon vs Protestant).
- **The typeahead UX already exists**: `EntitySuggestInput` (ACTS-185, Tab/Enter/click/arrows) —
  the same interaction, but suggesting from a **static book list** instead of store entities.
- **Why it matters for ACTS-191:** the dedup key is the normalized citation + version. Free-typed
  "1 Cor" vs "1 Corinthians" vs "1 corinthians" fragments the key; a picker that lands the
  **canonical full book name** (ACTS-185 already spells out "Luke") keeps a passage's quotes/touches
  unified.
- **Five citation fields to serve** (build once, reuse — a `ScriptureCitationInput`):
  - `src/components/home/ReflectionComposer.tsx:554` — "Add a quote" citation
  - `src/routes/session.$sessionId.tsx:646` — Lectio passage reference
  - `src/routes/knowledge.$knowledgeId.tsx:304` — library quote editor citation
  - `src/components/prayer/DevotionItemsEditor.tsx:406` — devotion-builder scripture item
  - `src/components/knowledge/VoiceEditor.tsx:418` — voice editor citation
  - Version context is already at hand in most (composer `quoteVersion`, quote `source_item_id`,
    Settings translation).

## Acceptance criteria
- [x] Typing in a citation field suggests matching **books** (prefix/substring on name + alias);
      choosing one inserts the **canonical full book name**, leaving the caret to add `chapter:verse`.
      → `ScriptureCitationInput` + `bookSuggestions()`; accept inserts "1 Corinthians " + trailing space.
- [x] Suggestions are **version-aware**: deuterocanon shown for Catholic canon (NABRE/RSV-CE/DRA),
      hidden for Protestant versions; version resolved from a translation id or `know-bible-*` id.
- [x] Free text is **never blocked** — an unrecognized book (a real typo) saves exactly as typed.
- [x] The input is a **shared component** used by all five citation fields.
- [x] Reference formatting normalizes to the ACTS-185 canonical full name so it feeds the ACTS-191
      `scriptureQuoteKey` cleanly. **Extended (JC-approved):** normalize **on save** at the store
      chokepoints too (`addKnowledgeItem`/`updateKnowledgeItem` + `recordScripturePrayed`), so even a
      value committed without going through the picker canonicalizes.

## Decisions (JC, 2026-09-11)
- Book-name typeahead **only** (chapter-count validation deferred).
- Abbreviations **expand** ("Lk"→"Luke", "1 Cor"→"1 Corinthians") — reuses `USFM` alias keys.
- Deuterocanon **hidden** for Protestant versions.
- Source of truth = explicit ordered **`BIBLE_CANON`** (73 books, Catholic order, `deutero` flag),
  names derived from `BOOK_NAME_BY_USFM` (one source of truth for display names).
- **Typeahead + normalize-on-save**, **new entries only** — no load-time migration of existing data.

## Root-cause note (the repro that informed this)
JC's observation ("pasted scripture with no verse: Books view knows 1 Corinthians but the journal
entry has no label") reproduced against real data. A Lectio quote saved with a **blank reference**
gets `scripture_ref: undefined` (→ `quoteByline` shows nothing) yet keeps `source_item_id` (→ still
files under the Bible book). Compounded by free-typed refs fragmenting one passage three ways in the
Voices view: **1 Corinthians** (3), **1 Corithians** (typo → own bogus book, 1), **Scripture**
(blank ref, 1). The picker + normalize-on-save prevents new fragmentation. NOTE: existing split data
is left as-is per the decision — JC can re-edit those quotes to canonicalize.

## Tests
No runner yet (ACTS-92). **Unit:** `bookSuggestions(query, version)` (matching, alias expansion,
canon filtering); citation normalization → canonical name. **Integration:** the shared input
suggests + inserts across the five fields; version switch changes the canon shown. **E2E:** type
"cor" → pick "1 Corinthians" → add ":13:4-13" → dedups with an existing quote (ACTS-191). Planned.
