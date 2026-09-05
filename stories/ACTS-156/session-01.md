---
story: ACTS-156
session: 01
wrapped_at: 2026-09-04T22:06:43-0700
status: Done
final: true
---

## What happened
Filed and shipped in one session: **bold / italic / underline in the reflection box, with
controls that can be hidden.** All eight acceptance criteria are met.

**The shape of it.** Formatting is **markdown-lite written into the text itself**
(`**bold**`, `*italic*`, `<u>underline</u>`), so a reflection's `body` stays a plain
string. That was chosen over a rich-text/HTML field at filing, and it paid off exactly as
hoped: **no data-shape change, no `STORAGE_KEY` bump** (the store stayed on
`prayer-companion-db-v39`), and the ACTS-94 share codec and ACTS-136 shared draft carry
formatted text without knowing anything about it.

**New code.**
- `src/lib/prayer/richText.ts` — the parser (`tokenizeMarks`, `stripMarks`) and the
  selection helper (`applyMark`), both pure and harness-covered.
- `src/components/reflections/FormattedText.tsx` — renders marks as **React text nodes,
  never an HTML string**, so there is no `dangerouslySetInnerHTML` and nothing to
  sanitize.
- `src/components/reflections/RichTextArea.tsx` — controls + textarea + ⌘/Ctrl+B/I/U +
  the hide toggle, in one shared component.
- `settings.reflection_toolbar_hidden?: boolean` — additive; absent/`false` = shown.
- `scripts/verify-richtext.ts` — new unit harness (plain `npx tsx`, the ACTS-155
  convention).

**Reach.** Because it is one shared component, the toolbar covers **three** writing
surfaces rather than the two the story scoped — the Home + `/reflections` composer, the
journal entry's **edit** view, and the **in-session Lectio card** — and one
`<FormattedText>` renders marks on the journal list, the sitting-group preview, the
single-entry dialog and `ItemView`.

**Design iteration (JC).** The first cut put a bar of 32px buttons *above* the field; JC
read it as too much chrome for a page meant for writing. The controls moved **inside** the
textarea along its bottom edge at `size-7`/`size-3.5`, with `pointer-events-none` on the
strip so only the buttons take clicks and a tap beside them still reaches the text, and
`pb-9` so a scrolled entry never runs underneath. Hidden, only a faint corner toggle
remains. Padding is held **constant** across the toggle so switching never resizes the
field — the accepted cost is a small empty band in the hidden state.

## ⚠️ Worth keeping — the harness caught two shipping bugs
The first parser was naive (find the next matching delimiter) and got two things wrong
that would have reached the journal:
1. **"2 * 3 and 4 * 5" became italics.** Stray asterisks are ordinary in prose.
2. **`***x***` was mangled** — and the toolbar *itself* produces that string whenever you
   bold something and then italicise it.

Fixed by matching asterisk **runs by exact length** (so `*`, `**`, `***` never poach each
other's delimiters) plus CommonMark's **flanking rule** — an opener must be followed by a
non-space, a closer preceded by one. The governing principle, now written into the
module's doc comment: **nothing a person writes may silently change meaning**; an
unmatched or ambiguous marker is always left literal rather than guessed at. A consequence
worth remembering: an abandoned empty pair (`****`, from clicking **B** and typing
nothing) renders literally rather than vanishing — deliberate, not a bug.

## Verified (and how)
- **Unit** — `npx tsx scripts/verify-richtext.ts` → **33/33**, against the real module.
- **Browser** (dev server, mobile viewport) — toolbar clicks and ⌘B/⌘I/⌘U on real
  selections; shortcuts still firing with the toolbar hidden; a second click unwrapping;
  the hide preference surviving a full reload; a formatted draft persisting through
  `prayer-companion-reflection-draft-v1`; save storing the body **verbatim**; marks
  rendering in the journal list, the sitting-group preview and the single-entry dialog;
  `<script>alert(1)</script>` escaped to visible text. After the redesign: hit-testing the
  blank stretch of the strip returns the TEXTAREA, and a scrolled overflowing entry stops
  above the buttons.
- **Not browser-verified:** `ItemView`'s saved-response render, which surfaces in the
  read-only `/follow` guest view. Same `<FormattedText>` proven on three other surfaces and
  covered by `tsc`, but no guest link was opened.
- **Gates:** `tsc --noEmit` clean · `vite build` clean · liturgical 19/19 · verify-merge
  PASS · **zero new lint errors** (repo's 316 pre-existing problems unchanged).
- Test data was cleaned out of the preview browser afterwards.

## Decision recorded — voice capture is NOT happening (JC)
Raised while closing: dictation into the reflection box, transcribed to text with **no
audio kept**. Investigated — it needs **no cloud service**: the browser's Web Speech API
returns text, never an audio blob, so ACTS-103's "Cloud media phase" was not actually a
blocker for this half. But **JC's call: no story — rely on the system keyboard's mic**,
which already dictates into the reflection box today (on-device on iOS) with no code from
us. Also weighed: Chrome/Safari stream audio to their own servers for recognition, which
sits awkwardly beside the About page's "live on this device, in this browser"; and Firefox
has no support at all. **Do not re-file this** without JC reopening it. ACTS-103 keeps its
voice+OCR scope as written; nothing was split out.

## Git state at handoff
**Committed, NOT pushed** *(at handoff time)*. `6ff9f71` (code) + `e4d317a` (docs) sat on
local `main`, plus `d9abe31` closing this story. `git push origin main` failed with
`could not read Username for 'https://github.com': Device not configured` — the same
git-auth condition that hit ACTS-153.

**Resolved 2026-09-04:** JC pushed from their own git client. All three commits verified
on `origin/main` (`git ls-remote` head = `d9abe319…`, local level with remote). The same
sweep found that **every** earlier "push pending (auth)" commit had also landed, so those
stale markers were cleared from the board and the ledger; past handoffs keep their
point-in-time wording.

## Next
Nothing — story closed. Two threads left open elsewhere, neither blocking:
- `ItemView` / `/follow` render is unverified in a browser (low risk, shared component).
- The hidden-state bottom band could be tightened if JC ever wants it, at the cost of the
  field resizing on toggle.
