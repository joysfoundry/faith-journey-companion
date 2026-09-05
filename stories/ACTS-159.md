---
id: ACTS-159
title: Refresh or retire the published Oravia brand artifact
spine:
status: Done
origin: human-directed
approved_by: JC
depends_on: []
relates_to: [ACTS-144, ACTS-148, ACTS-158]
started_at: 2026-09-05T14:20:00-0700
updated: 2026-09-05T14:45:00-0700
latest_handoff: ACTS-159/session-01.md
sessions: 1
---

## Goal
As the person sending Oravia to beta testers, I want the published brand artifact to
match the current brand, so that a link I have already shared does not keep showing an
older identity.

## The artifact
**<https://claude.ai/code/artifact/03d0869e-d9ac-40a3-b7ba-ce903b54de62>** — titled
"Oravia", favicon 🕯️, private, last updated 2026-09-04. The web version of the brand /
About page, published during ACTS-144. Source in the repo is
[`docs/brand/oravia-brand.html`](../docs/brand/oravia-brand.html).

## Context
Found while shipping ACTS-158, not as part of it. **JC's call: do not update it now —
capture it.** It is private and was only ever shared by hand, so nothing is publicly
wrong; the risk is that a link already sent to a tester still resolves to the old
identity.

Three drifts from the current brand:
1. **Wrong mark.** It draws the old flame-and-open-O (`viewBox="0 0 100 122"`, an
   animated `.flame` path). The mark shipped in ACTS-148 is the **cross-in-compass**
   ([`public/oravia-mark.svg`](../public/oravia-mark.svg)) — square 100×100, no flame.
2. **No beta link.** The card ends at "a work in progress" with no URL, so a reader has
   no way to reach the app. Note this also means it never carried the dead
   `www.myoravia.lovable.app` host that ACTS-158 fixed elsewhere — nothing to correct.
3. **Copy predates the trims.** Its body was shortened for the web before the later
   About edits landed, so it no longer tracks `src/routes/about.tsx` (the canonical copy)
   or the About card.

## Decision — RETIRE (JC, 2026-09-05)
Not refreshed. A **replacement was built and published** while closing ACTS-158, so the
old artifact has nothing left to do:

**<https://claude.ai/code/artifact/0a832e6c-efa7-4cea-91bb-5503fee85a41>**
— "Oravia Beta Invitation", 🧭. Source in the repo at
[`docs/brand/oravia-about.html`](../docs/brand/oravia-about.html).

It is the web twin of `oravia-about.png`: current cross-in-compass mark, current About
copy, the palette lifted verbatim from `make_about.py`, and the beta link as a real
tappable `<a>` rather than a string to retype. Chosen over a .docx because the piece is
sent to phones — it reflows, the text is selectable and screen-reader accessible, and the
mark is inline SVG. A `@media print` block makes ⌘P → Save as PDF produce the file
version, so the docx need never exist.

**Why retire rather than refresh the old URL:** it was private and only ever hand-shared,
so no public link breaks. Refreshing in place would have meant hand-maintaining a second
HTML page with the same copy — the exact drift that created this story.

## Acceptance criteria
- [x] Decide refresh vs. retire. → **Retire.**
- [x] ~~If refreshed: same URL~~ — N/A, not refreshed.
- [x] If retired: note where testers should be pointed instead. → the artifact above.

## Settled at close
`docs/brand/oravia-brand.html` — the retired artifact's source — **deleted** (JC,
2026-09-05), recoverable from git history. Two dangling references cleaned up:
`make_og.py`'s palette comments (comments only; `og-cover.png` regenerates
byte-identical) and the README entry. `design-system/brand/mark-at-size.html` still
cites the path as the source of the retired mark and is **left alone deliberately** —
that page is the analysis of why the flame was retired, so rewriting it would edit the
record rather than fix a reference.

## Tests
- **Unit / Integration / E2E:** N/A — brand collateral outside the app bundle; nothing
  imports it and no app behaviour changes. Verified by eye against
  `src/routes/about.tsx` and `public/oravia-mark.svg`.
