---
id: ACTS-159
title: Refresh or retire the published Oravia brand artifact
spine:
status: To Do
origin: human-directed
approved_by: JC
depends_on: []
relates_to: [ACTS-144, ACTS-148, ACTS-158]
started_at:
updated: 2026-09-05T13:05:00-0700
latest_handoff: null
sessions: 0
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

## Open
- **Refresh or retire?** The PNG collateral (`oravia-about.png`, `oravia-flyer.png`) and
  the ACTS-158 share card now cover the same job. If the artifact is not pulling weight,
  retiring it beats maintaining a fourth surface with the same copy on it.
- If refreshed, decide whether it regenerates from a single source alongside the PNGs
  rather than being hand-maintained HTML that drifts again.

## Acceptance criteria
- [ ] Decide refresh vs. retire.
- [ ] If refreshed: current mark, current About copy, and a working beta link, published
      to the **same URL** so links already sent keep resolving.
- [ ] If retired: note where testers should be pointed instead.

## Tests
- **Unit / Integration / E2E:** N/A — brand collateral outside the app bundle; nothing
  imports it and no app behaviour changes. Verified by eye against
  `src/routes/about.tsx` and `public/oravia-mark.svg`.
