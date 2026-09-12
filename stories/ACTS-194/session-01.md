---
story: ACTS-194
session: 01
wrapped_at: 2026-09-11T19:50:21-0700
status: Done
final: true
---

## What happened
Shipped the scripture citation typeahead and closed the "unlabeled pasted quote" gap JC
reported. Built a shared `ScriptureCitationInput` (`src/components/knowledge/`) and wired it
into all **five** citation surfaces:
- `ReflectionComposer` "Add a quote" citation
- Lectio passage reference (`session.$sessionId.tsx`)
- library quote editor (`knowledge.$knowledgeId.tsx`)
- devotion builder scripture item (`DevotionItemsEditor.tsx`)
- voice editor citation (`VoiceEditor.tsx`)

In `src/lib/bible/apps.ts` added the source-of-truth pieces: `BIBLE_CANON` (73 books,
Catholic order, `deutero` flag; names derived from `BOOK_NAME_BY_USFM`), `bookSuggestions(query,
{version})` (name + abbreviation match, version-aware — deuterocanon only for Catholic canon),
and `normalizeReference(ref)` (folds casing/abbreviations to the canonical book name, leaves a
genuine typo untouched).

**JC-approved extension:** normalize scripture refs **on save** at the store chokepoints —
`addKnowledgeItem` / `updateKnowledgeItem` (via a new `normalizeScriptureRef` helper) and
`recordScripturePrayed` — so a passage lands the same citation however it was entered.
**New entries only; existing data intentionally left untouched.**

### Root cause (reproduced against real data)
A Lectio quote saved with a **blank reference** gets `scripture_ref: undefined` (→ `quoteByline`
renders no citation) yet keeps `source_item_id` (→ still files under the Bible book). Compounded
by free-typed refs fragmenting one passage three ways in the Voices view: **1 Corinthians** (3),
**1 Corithians** (typo → its own bogus book, 1), **Scripture** (blank ref, 1). The picker +
normalize-on-save prevents new fragmentation.

## Decisions (JC)
- Book-name typeahead only (chapter-count validation deferred).
- Abbreviations expand ("Lk"→"Luke", "1 Cor"→"1 Corinthians").
- Deuterocanon hidden for Protestant versions.
- Explicit ordered `BIBLE_CANON` as source of truth.
- Typeahead + normalize-on-save; new entries only, no load-time migration.

## Verified (and how)
- Exercised the **real running module** via Vite `import()` in the browser:
  `cor`→[1,2 Corinthians]; `lk`→[Luke]; `1 co`→[1 Corinthians]; `tob`/`wisdom`→shown for NABRE,
  **empty for NIV/ESV**; `"1 cor 13:8"` & `"1 Cor 13:8"`→`"1 Corinthians 13:8"`; typo
  `"1 Corithians 13"` unchanged; `BIBLE_CANON.length === 73`.
- `npx tsc --noEmit` clean; no console errors on the Vessels/Reflect pages.
- (Dropdown visuals not screenshotted — the app's Browser pane was hidden — but the component is
  a thin wrapper over the proven `EntitySuggestInput` pattern and its engine is confirmed.)

## Git state at handoff
Committed & pushed (JC pushed; env push has no creds). Commits: `9c01f42` (code),
`8276166` (story pointer). All acceptance criteria met.

## Next
None for this story. Deferred / possible follow-ons:
- Chapter/verse validation (per-book chapter counts) if desired later.
- Optional one-time repair of the existing 3-way split (typo bucket + blank-ref quote) — left
  out by decision; JC can re-edit those quotes to canonicalize.
- Note: canonical Psalms name is "Psalms" (so "Psalm 23" → "Psalms 23") — flagged to JC, left as-is.
