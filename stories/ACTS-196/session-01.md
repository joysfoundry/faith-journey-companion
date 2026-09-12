---
story: ACTS-196
session: 01
wrapped_at: 2026-09-12T11:10:11-0700
status: Done
final: true
---

## What happened
Shipped ACTS-196 end to end — capturing a scripture citation at save time (infer/recommend, else
prompt, never block) **and** giving every cited passage one-tap access to the exact text.

**Capture**
- `inferReference(text)` in `src/lib/bible/apps.ts` — scans pasted passage text for a `Book
  chapter:verse` (colon required, so prose numbers / time strings / short abbrevs don't false-fire);
  returns `confident` (one book), `ambiguous` (2+ books → candidates), or `none`. Everything
  normalized through the ACTS-194 canon. **Cannot invent a book absent from the text** (by design).
- Inline nudge `ScriptureCitationField.tsx` (wraps the ACTS-194 typeahead): recommend chip
  (one-tap), candidate chips for a cross-reference, or an **amber** "add a citation" hint; dismissible
  and sticky (no re-nag).
- Save-time confirm `ScriptureCitationSaveDialog.tsx` (amber): on saving a scripture quote with a
  blank citation — **[Add <ref> & save]** when inferable, candidate buttons for a cross-reference,
  else an amber warning + **[Add citation]** / **[Save without citation]**. Never hard-blocks; the
  pasted text is never modified. Wired into `ReflectionComposer.addQuote` and `VoiceEditor.addContent`
  (both gained `refOverride`/`skipGuard`).

**Access**
- Reusable `OpenInBibleLink.tsx` (text link or compact book-icon) built from the citation via
  `buildPassageUrl`. Surfaced wherever a cited scripture quote renders: inspiration cards (composer +
  journal, via `InspirationPanel` + a new `scriptureRef` on the resolver in `inspiration.ts`), Vessels
  rows (icon, `formation.tsx`), and the "quotes from this" list (icon, `knowledge.$knowledgeId.tsx`).
  Detail + session views already had it. **No scripture text embedded** (translation licensing) —
  deep-link only.

## Decisions (JC)
- Confidence bar: one book → recommend; 2+ → prompt with candidates; **one citation per quote**
  (multiple deferred to [[ACTS-197]]). Inline placement. Retroactive sweep deferred.
- "True version" handling = **always deep-link to official** (no embedded text — licensing).
- Save-time escape wording = **"Save without citation"**; emphasis = **amber**.
- **No verse-by-wording recognition** — recommend only when the reference is present in the text
  (recognizing a verse from its wording would need a Bible-text corpus; **deferred to [[ACTS-200]]**,
  a future feature, especially if we obtain licensing).

## Verified (and how)
Dev (localhost:8080), composer flow "type by hand → Scripture → Save":
- none → "Save without a citation?" amber dialog; **Add citation** returns to the form (passage
  intact); **Save without citation** saved uncited (`scripture_ref: null`).
- inferable → "Add Matthew 5:9 & save" saved with `scripture_ref: "Matthew 5:9"`.
- inline recommend/ambiguous/none + dismiss (no re-nag) all confirmed earlier.
- "Open in your Bible" renders on the Home inspiration card and the Vessels row (→ Matthew 5:9 ·
  NABRE), compact icon beside the citation in Vessels; absent on an uncited quote.
- `tsc --noEmit` clean. Test quotes cleaned from the preview afterward (Padre Pio seed left intact).

## Acceptance criteria
All met — recommends when inferable, prompts when not, never blocks, groups/dedups via the ACTS-194
normalizer, and cited quotes deep-link to the exact passage everywhere they appear.

## Git state at handoff
Committed & pushed. ACTS-196 commits: `2943127`, `8fcdd9d` (session 1) and `2be3c37`, `8edeb81`
(session 2). Working tree clean; `origin/main..main` empty.

## Next
Story Done. Open backlog follow-ons (not blocking): [[ACTS-197]] (multiple citations per quote),
[[ACTS-198]] (Devotion Builder "from existing devotion"), [[ACTS-199]] (add-a-prayer empty state),
[[ACTS-200]] (recognize a verse by its wording — future, licensing-dependent).
