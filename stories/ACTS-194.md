---
id: ACTS-194
title: Scripture citation typeahead — book suggestions (version-aware) for consistent references
spine:
status: To Do
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
- [ ] Typing in a citation field suggests matching **books** (prefix/substring on name + alias);
      choosing one inserts the **canonical full book name**, leaving the caret to add `chapter:verse`.
- [ ] Suggestions are **version-aware**: the list reflects the chosen version's canon (Catholic
      deuterocanon shown for NABRE; hidden for Protestant versions) — with the version resolved from
      the field's context (picker / `source_item_id` / Settings default).
- [ ] Free text is **never blocked** — a reference not matched still saves (typeahead assists, not
      gates).
- [ ] The input is a **shared component** used by all five citation fields, so entry is consistent
      everywhere (and dedup-friendly).
- [ ] Reference formatting stays consistent with ACTS-185 (full book name, not an abbreviation) so
      it normalizes into the ACTS-191 `scriptureQuoteKey` cleanly.

## Open questions for JC
- **Chapter/verse help:** book typeahead only (recommend first), or also validate/suggest chapter
  numbers? (Chapter counts per book = extra data; propose deferring.)
- **Abbreviation input:** accept "Lk" / "1 Cor" and expand to the full name? (Recommend yes — add a
  small alias table over the existing `USFM` keys.)
- **Deuterocanon for Protestant versions:** hide entirely, or show greyed with a note? (Recommend
  hide — matches that version's canon.)
- **Book list source of truth:** derive from `USFM`/`USFM_TO_NAME`, or introduce an explicit
  ordered canon list (with per-version membership)? (Likely the latter for correct ordering/canon.)

## Tests
No runner yet (ACTS-92). **Unit:** `bookSuggestions(query, version)` (matching, alias expansion,
canon filtering); citation normalization → canonical name. **Integration:** the shared input
suggests + inserts across the five fields; version switch changes the canon shown. **E2E:** type
"cor" → pick "1 Corinthians" → add ":13:4-13" → dedups with an existing quote (ACTS-191). Planned.
