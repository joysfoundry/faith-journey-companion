---
date: 2026-09-04
stories: [ACTS-144, ACTS-148, ACTS-149]
kind: session-summary
---

# Session — Oravia rebrand (name track) + brand collateral

## What happened (in order)
1. **Started ACTS-144** (Oravia rebrand epic). Split it: **ACTS-144 = name track only**;
   filed **ACTS-148** (Marian palette / design system, to mock in Claude Design first) and,
   after a naming discussion, **ACTS-149** (ACTS guided prayer framework — info button +
   open-prayer mode, so the ACTS acronym survives as a *feature*, not the app name).
2. **Locked the name with JC:** app name **Oravia** (*ora* "pray" + *via* "the way"),
   one word, or-AH-vee-ah, no US trademark. "MyOravia" is website/domain layer only.
3. **Tagline explored + decided:** **"Your devotional life, gathered."** — rejected
   "Your Catholic life, connected." ("connected" over-claims AI synthesis; "Catholic life"
   over-claims scope — no sacraments). Also developed a wider brand voice: blessing
   **"God is weaving something beautiful through your life."**, a search-vs-seek value line,
   the signature **"Keep your seeking for God."**, and "Follow the sacred thread" (interior).
4. **Executed the name sweep** (user-facing only, no `STORAGE_KEY` bump): `Brand.tsx` wordmark
   + tagline, beta gate, all route titles/meta, `manifest.webmanifest`, `FollowAlongView`,
   and `about.tsx` copy → Oravia. Reverted one over-eager sed hit on an internal `ACTS-119`
   comment.
5. **About page blessings placed:** opening blessing (weaving line) above the epigraph,
   a closing benediction ("Keep your seeking for God."), and warmed the epigraph
   ("record" → "meaningful woven threads").
6. **`/save`** → committed code (`e109c05`) + story docs (`2574a19`); later confirmed both
   are on `origin/main` (JC pushed).
7. **Brand collateral** (for sending to beta testers): a web brand/About page (published as a
   private Artifact), a portrait **flyer** PNG, and a compact one-page **About card** PNG with
   the beta link (`www.myoravia.lovable.app`). Iterated copy with JC (added resources/voices:
   Prayers · Customized devotions · Digital & physical resources · Voices; added the beta/local
   note; smaller body + border cropped to content). Preserved all of it in-repo at
   **`docs/brand/`** (PNGs + Pillow generators + html + README) so it survives the scratchpad.
8. **Brand lore captured + placed:** **Oravia** opens with **O** (Omega) and closes with **A**
   (Alpha) — "the End and the Beginning"; a Christ title (Rev 22:13). Added an **"A note on the
   name"** section to the About page (`about.tsx`) and the About card — Latin *ora*/*via* + the
   Omega/Alpha grace-note, ending "…we meet God at the end first … and find He was the beginning
   all along. He holds both ends of your thread."

## Verified (and how)
- `npx tsc --noEmit` clean after the sweep and each About edit.
- `grep` confirmed zero user-facing app-name "ACTS" remains (only `ACTS-<n>` ids + the internal
  `acts-beta-unlocked` key).
- Browser (own dev server, light theme): beta gate, side-rail wordmark, and `/about` all read
  **Oravia**; tab titles updated. (App is light-only today — dark theme deferred to ACTS-148.)
- Brand images rendered with Pillow and **viewed** to verify layout/legibility; fixed two glyph
  tofu-boxes (a `◆` and a `→`) and rebalanced the About card.

## Git state at handoff
- **Pushed to `origin/main`:** `e109c05` (rename code), `2574a19` (story docs).
- **Committed, NOT pushed:** `656da73` (docs/brand assets), plus this session's closing commits
  (About "note on the name" code + brand-card refresh + this summary). Push kept failing on a git
  credential error (`could not read Username`). **Push from a git client.**
- **Uncommitted (intentional):** `.env` (beta passcode — predates this session).

## Parked / next
- **Push `656da73`** from your git client.
- **Publish the beta** on Lovable at `www.myoravia.lovable.app` (the About card already prints
  that URL).
- **ACTS-148** — Marian palette / design system: mock in Claude Design → `styles.css` oklch
  tokens; adds dark theme + brand-mark art / favicon / `theme_color`.
- **ACTS-149** — ACTS guided prayer framework (info button + open-prayer mode).
- **ACTS-147** — PRD v3→v4 is now unblocked (was gated on the rebrand).
- Optional: revisit the wordmark display face with ACTS-148; the Omega/Alpha easter egg for
  onboarding/About.

## Next session — opener (paste to start)
> Continue the Oravia work. Rebrand name sweep (ACTS-144) is shipped, committed, and pushed
> (`e109c05`, `2574a19`); brand collateral is in `docs/brand/` (commit `656da73` — **verify it
> got pushed**). Next options: (a) **ACTS-148** — build the Marian palette/design system (mock
> in Claude Design first, then `src/styles.css` oklch tokens; adds dark theme + favicon/
> theme_color/brand-mark art); (b) **ACTS-149** — ACTS guided prayer framework (info button +
> open-prayer mode on ACTS-108); (c) **ACTS-147** — `/prd-sync` v3→v4 (now unblocked). Beta
> publishes at `www.myoravia.lovable.app`. `/start ACTS-148` (or 149 / 147) to begin.
