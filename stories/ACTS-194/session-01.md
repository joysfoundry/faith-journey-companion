---
story: ACTS-194
session: 01
wrapped_at: 2026-09-11T20:17:46-0700
status: Done
final: true
---

## What happened
Shipped the scripture citation typeahead. Built a shared `ScriptureCitationInput`
(`src/components/knowledge/`) and wired it into all **five** citation surfaces: ReflectionComposer
"Add a quote", Lectio passage reference (`session.$sessionId.tsx`), library quote editor
(`knowledge.$knowledgeId.tsx`), `DevotionItemsEditor`, and `VoiceEditor`.

In `src/lib/bible/apps.ts`: `BIBLE_CANON` (73 books, Catholic order, `deutero` flag; names derived
from `BOOK_NAME_BY_USFM`), `bookSuggestions(query,{version})` (name + abbreviation match,
version-aware — deuterocanon only for Catholic canon), and `normalizeReference(ref)` (folds
casing/abbreviations to canonical, leaves a genuine typo untouched).

JC-approved extension: **normalize on save** at the store chokepoints — `addKnowledgeItem` /
`updateKnowledgeItem` (`normalizeScriptureRef`) and `recordScripturePrayed`. **New entries only;
existing data left untouched** by decision.

## Decisions (JC)
- Book-name typeahead only (chapter-count validation deferred).
- Abbreviations expand ("Lk"→"Luke", "1 Cor"→"1 Corinthians").
- Deuterocanon hidden for Protestant versions.
- Explicit ordered `BIBLE_CANON` as source of truth.
- Typeahead + normalize-on-save; new entries only, no load-time migration.

## Verified (and how)
Exercised the real running module via Vite `import()`: `cor`→[1,2 Corinthians]; `lk`→[Luke]; `1 co`→
[1 Corinthians]; `tob`/`wisdom`→shown for NABRE, **empty for NIV/ESV**; `"1 cor 13:8"` & `"1 Cor
13:8"`→`"1 Corinthians 13:8"`; typo `"1 Corithians 13"` unchanged; `BIBLE_CANON.length === 73`.
`npx tsc --noEmit` clean; no console errors. Confirmed live that a quote WITH a reference groups
under its book (1 Corinthians) while a BLANK-reference quote falls to the generic "Scripture" bucket.

## Open item → spun off, not left in 194
A passage **pasted with the citation left blank** saves with no `scripture_ref` → no journal label
and lands in the "Scripture" bucket; the app can't infer a book that isn't in the pasted text. This
is **ACTS-196** (save-time capture: infer-and-recommend when confident, else prompt to confirm,
never block). 194's own ACs are all met; the remainder is tracked there.

## Correction log (this session)
A "/done" was first run against 194 by mistake (JC meant ACTS-195); it was reverted, 195 closed
correctly, then — with the open item spun to ACTS-196 — 194 was closed properly here.

## Git state at handoff
Committed & pushed (JC). Code: `9c01f42`, story: `8276166`. Follow-on ACTS-196 filed (`963ace3`).

## Next
None for 194. Follow-on: **ACTS-196** (new chat, `/start ACTS-196`), which will develop against the
blank-reference test fixture left in place (quote `know-gqo0yxheavgq`, citation removed on purpose).
