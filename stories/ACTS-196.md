---
id: ACTS-196
title: Capture a scripture citation at save time — infer-and-recommend, else prompt to confirm (never block)
spine:
status: In Progress
origin: human-directed
approved_by: JC
depends_on: [ACTS-194]
relates_to: [ACTS-191, ACTS-193, ACTS-183, ACTS-185]
started_at: 2026-09-11T20:10:13-0700
updated:    2026-09-11T20:10:13-0700
latest_handoff: null
sessions: 0
---

## Goal
As someone pasting a scripture passage, I want the app to **capture the book/chapter at save
time** — recommending a citation when it can confidently read one from the text, and otherwise
**asking me to confirm/add one** — so my scripture lands labeled and correctly grouped without me
having to notice a bad grouping and hand-fix it afterward. I can always **choose to update or
not** — the nudge assists, it never blocks the save.

JC (2026-09-11):
> Save-time nudge if it includes what the app can confidently recommend, and if it can't they
> should confirm — and they still can choose to update or not.

## Why (the gap ACTS-194 leaves)
ACTS-194 makes citations consistent **when the user types into the citation field**. But a passage
**pasted with the reference left blank** saves with `scripture_ref: undefined`: no journal label
(`quoteByline` shows only `scripture_ref`) and it falls into the generic **"Scripture"** bucket in
Vessels → Voices (grouping keys on `bibleBookName(scripture_ref)`), while a passage that *did* get a
reference groups correctly under its book. Today the only remedy is the user spotting it and editing
the quote. The app also **cannot invent a book that isn't in the data** — so inference is
best-effort, and the fallback must be a confirm prompt, not a guess.

## Behavior (proposed)
On saving/finishing a scripture passage (Lectio finish → `recordScripturePrayed`; composer/editor
scripture quote) **with an empty citation**:
1. **Try to infer** a reference from the pasted text — scan the body for a parseable citation
   (reuse `parseReference` / `bibleBookName`), e.g. USCCB commentary pastes that carry "1 Cor 13:8".
   - **Confident** (a single, unambiguous book/citation found) → **recommend** it, pre-filled in the
     citation field (with the ACTS-194 typeahead), for a one-tap accept.
   - **Not confident / nothing found** → **prompt** the user to add a citation (typeahead), rather
     than silently saving blank.
2. **Never block:** the user can accept, edit, or dismiss and save without a citation. A dismissed
   nudge should not nag on every keystroke.
3. Anything captured flows through the ACTS-194 normalizer so it groups + dedups cleanly.

## Decisions (JC, 2026-09-11) — resolved
- **Confidence bar:** one distinct **book of the Bible** found (Luke, 1 Corinthians — not the
  whole Bible, not the "Books" Vessel type) → **recommend**. **2+ books** (cross-reference) →
  **prompt with the found candidates** as quick-pick chips; user picks one, types their own, or
  dismisses (leaves it in the general Scripture bucket). **One citation per quote** — multiple
  citations (comparing passages) is deferred to **ACTS-197** (advanced journaling).
- **Placement:** inline, beneath the citation field.
- **Retroactive:** deferred (no one-time sweep of existing blank-ref quotes in this story).
- **Confident inference requires a `chapter:verse`** (a bare "Psalm 23" without a verse falls to
  the prompt) — a colon is the strong signal that kills prose false-positives ("this is 3", time
  strings, short book abbrevs like "is"/"am").

## Progress (session-01, 2026-09-11)
- **Built + verified in dev.** `inferReference(text)` in `src/lib/bible/apps.ts`
  (confident / ambiguous / none, all normalized via ACTS-194). New inline wrapper
  `ScriptureCitationField.tsx` composes `ScriptureCitationInput` + the nudge (recommend / candidate
  chips / prompt / dismiss-sticky). Wired into all 3 blank-citation surfaces: ReflectionComposer,
  VoiceEditor add-form, and the quote detail editor. No data-shape change, no `STORAGE_KEY` bump.
- Verified all four states live (composer → Add a quote → Scripture): confident one-tap accept fills
  the field; two-book cross-ref shows candidate chips; bookless passage shows the prompt; dismiss
  clears and does not re-nag on a new inferable passage; Save never blocked. `tsc --noEmit` clean.

## Progress (session-02, 2026-09-12) — save-time confirm added
Root cause a tester hit: a scripture quote typed by hand then switched to Scripture saved with **no
citation** because the inline hint was too easy to miss and nothing gated the save. Added a
**save-time citation check** (JC decisions: **amber** warning; buttons **[Add citation]** ·
**[Save without citation]**; confident case offers **[Add <ref> & save]**):
- New `ScriptureCitationSaveDialog.tsx` (reads the passage via `inferReference`): confident →
  one-tap **Add <ref> & save**; cross-reference → candidate buttons; none → amber warning + **Add
  citation** (returns to form) / **Save without citation** (saves uncited). Never hard-blocks;
  pasted text never changed.
- Wired into the two explicit-save surfaces: `ReflectionComposer.addQuote` and
  `VoiceEditor.addContent` (both gained a `refOverride`/`skipGuard` param + a guard). The detail
  editor auto-saves (no button) so it keeps the inline hint, now **amber** for the none case.
- Decision recorded (JC): "true version" handling = **always deep-link to official** (no embedded
  scripture text — licensing); a cited quote already shows "Open in your Bible". Surfacing that link
  on more screens (journal/inspiration/Vessels) is a separate optional story.
- Verified live in the composer (type-by-hand→Scripture→Save): none-dialog, Add-citation-returns,
  confident Add-&-save (saved `scripture_ref` "Matthew 5:9"), Save-without (saved uncited). `tsc` clean.
- **"Open in your Bible" surfaced everywhere a cited scripture quote renders** (JC: precise quotes +
  one-tap access beats accepting anything that sounds like scripture). New reusable
  `OpenInBibleLink.tsx` (reads `db.settings` + `buildPassageUrl`); added to InspirationPanel (composer
  cards + journal), Vessels quote rows (`formation.tsx`), and the "Quotes from this" sublist
  (`knowledge.$knowledgeId.tsx`); resolver now carries `scriptureRef` (`inspiration.ts`). Detail +
  session views already had it. Verified the link renders on the Home inspiration card and the Vessels
  row (→ `Matthew 5:9 · NABRE`), and is absent on an uncited quote. This folds in the deep-link-reach
  idea (the previously-mooted separate story); no scripture text embedded (licensing).

## Open questions for JC (resolved above)
- **"Confident" bar:** exactly one distinct book found in the text = confident? What if the text
  names two books (a cross-reference)? (Propose: recommend only when a single dominant book/citation
  is unambiguous; otherwise prompt.)
- **Where the nudge lives:** inline under the passage/quote field, or a small confirm step on
  finish/save? (Propose inline, so the typeahead is right there.)
- **Retroactive:** offer a one-time "these N scripture quotes have no citation — add one?" review of
  existing blank-ref quotes? (Separate from the save-time nudge; propose deferring.)

## Tests
No runner yet (ACTS-92). **Unit:** an `inferReference(text)` helper (finds a confident citation;
returns none on ambiguous/absent). **Integration:** saving a blank-citation scripture passage
recommends when inferable, prompts when not, and never blocks. **E2E:** paste USCCB commentary with
"1 Cor 13:8" → recommended "1 Corinthians 13:8" → accept → groups under 1 Corinthians; paste a
bare-verse passage (no book) → prompt → user can save without one. Planned.
