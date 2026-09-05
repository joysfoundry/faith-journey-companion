---
story: ACTS-159
session: 01
wrapped_at: 2026-09-05T14:45:00-0700
status: Done
final: true
---

## What happened
Filed and closed in one session, alongside ACTS-158.

The story existed because the published brand artifact had drifted from the brand:
old flame-and-open-O mark, no beta link, copy predating the later About trims. JC's
call at filing was **capture, don't fix**.

Closed by **retiring rather than refreshing**. A replacement was built and published:

**<https://claude.ai/code/artifact/0a832e6c-efa7-4cea-91bb-5503fee85a41>**
— "Oravia Beta Invitation", source [`docs/brand/oravia-about.html`](../../docs/brand/oravia-about.html).

The web twin of `oravia-about.png`: current cross-in-compass, current copy, palette
lifted verbatim from `make_about.py`, beta link as a real tappable `<a>`. **HTML over
.docx** because the piece is sent to phones — it reflows where the 1600px PNG needs
pinch-zoom, the text is selectable and screen-reader accessible, the mark is inline SVG,
and `@media print` makes ⌘P → Save as PDF produce the file version, so the docx need
never exist.

Retiring beat refreshing in place: the old artifact was private and hand-shared only, so
no public link breaks, and refreshing would have meant hand-maintaining a second HTML
page with the same copy — the exact drift that created the story.

Then JC closed the last open question: **delete `docs/brand/oravia-brand.html`**, the
retired artifact's source. Done, with its two dangling references cleaned up.

## Verified (and how)
- Page rendered at 375×812 (mobile) before publishing — the card fits and reads without
  zoom, which was the whole argument for HTML.
- **JC caught the section labels ranged left.** `make_about.py` draws them with
  `tracked_center()` over left-ranged paragraphs; the first cut left-aligned them. Fixed
  and republished to the same URL. Note a centred tracked label sits visibly off axis
  because the trailing letter-spacing counts in the width — compensated with an equal
  `text-indent`.
- `og-cover.png` regenerates **byte-identical** after the `oravia-brand.html` comment
  edits in `make_og.py`, confirming only comments changed.
- No live code references to the deleted file remain. The one surviving mention, in
  `docs/brand/design-system/brand/mark-at-size.html`, is the analysis of *why* the flame
  was retired — left as the historical record, and the README says so.

## Git state at handoff
Committed, **NOT pushed** — `git push` fails in this environment with
`could not read Username for 'https://github.com'`. Commits for this story:
`9023026`, `503e3d3`, `7a24e12`, `dd6c398`. Push from a git client.

## Next
None — story closed. The published page is the thing to send with the beta link.

**Open question raised at close, not part of this story:** where a recipient actually
accesses a shared `claude.ai/code/artifact/...` link, and whether that requires a Claude
account. If it does, this is the wrong channel for beta testers and the page should be
served from the app's own origin instead (a static file in `public/`, which sits outside
the client-side beta gate). Worth its own story if JC wants it.
