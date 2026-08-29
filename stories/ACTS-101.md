---
id: ACTS-101
title: Rebrand app "Faith Journey" → "ACTS" (with acronym in the header)
spine:
status: Done
origin: human-directed
approved_by: JC
depends_on: []
relates_to: []
started_at: 2026-08-29T01:41:28-0700
updated:    2026-08-29T01:50:13-0700
latest_handoff: ACTS-101/session-01.md
sessions: 1
---

## Goal
As the app owner, I want the app renamed from **Faith Journey** to **ACTS** — which stands
for **Adoration, Contrition, Thanksgiving, Supplication** — with the acronym meaning shown
in the header, so the name carries its own catechesis.

## Acceptance criteria
- [x] Header wordmark reads **ACTS** across all three surfaces (desktop rail, mobile top
      bar, mobile drawer).
- [x] The acronym is **spelled out beneath** the wordmark; each word's **initial stays
      upright and tinted** (echoing A·C·T·S), the rest flows in a **script** face.
- [x] App name updated everywhere user-visible: page/OG titles (`— ACTS`), home title,
      root + PWA title, `apple-mobile-web-app-title`, shared-view label, and the PWA
      manifest (`name`, `short_name`).
- [x] **Typographic direction chosen** — after comparing six scripts, JC chose
      **non-script**: small letter-spaced uppercase caps with each initial set larger
      (same muted tone, no tint). Script font removed.

## Design notes
- Reusable `src/components/layout/Brand.tsx` renders the wordmark + illuminated tagline;
  `--font-script` theme var in `styles.css`; font loaded in `__root.tsx` (Google Fonts —
  the one CSP-allowed external host).
- ACTS also happens to be the local story-tracker project key — pleasant coincidence, not
  related.

## Tests
- **Unit:** N/A (presentational rename, no logic).
- **Integration:** N/A (a `Brand` render test could be added once the harness lands, ACTS-92).
- **E2E:** N/A. Verified manually in-browser (desktop rail + mobile top bar) — wordmark,
  tagline, and updated document title all render; tsc + eslint clean.
