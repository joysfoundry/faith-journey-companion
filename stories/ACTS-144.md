---
id: ACTS-144
title: Rebrand to "Oravia" + Marian palette (name + design system) — EPIC
spine: ACTS-144
status: To Do
origin: human-typed
depends_on: []
relates_to: [ACTS-86, ACTS-143, ACTS-90]
started_at: 2026-09-03T23:42:36-0700
updated:    2026-09-03T23:42:36-0700
latest_handoff: null
sessions: 0
---

## Goal
As the product owner, I want to explore/adopt a new brand — name **Oravia** and a Marian
color palette — so the app reads as a trustworthy, contemplative Catholic prayer companion,
with the color system centralized enough that a reskin is a token change, not a hunt.

## ⚠️ Naming tension (decide first)
Today "ACTS" is a **meaningful acronym** — Adoration · Contrition · Thanksgiving ·
Supplication, the four movements of prayer — baked into [`Brand.tsx`](../src/components/layout/Brand.tsx)
(the wordmark spells the acronym in its tagline) and into product framing (see **ACTS-86**
"ACTS framing"). Renaming to **Oravia** (from Latin *ora* — "pray") drops that acronym.
Decision for JC: does ACTS survive as a tagline/section concept under the Oravia name, or is
it retired? This also ripples into the story-id prefix (`ACTS-NN`) and repo/docs naming —
those can stay as an internal code, but flag it.

## Scope — two separable tracks (split candidates)
**A. Name: ACTS → Oravia.** Surfaces to change:
- Wordmark [`Brand.tsx`](../src/components/layout/Brand.tsx) (+ the acronym tagline decision).
- Beta gate title ("ACTS") + subtitle.
- `index.html` `<title>` / meta, [`public/manifest.webmanifest`](../public/manifest.webmanifest)
  (name, short_name), any favicon/app icons.
- User-facing copy that names the app; About page (ACTS-143).
- (Internal, optional/deferred) docs, `ACTS-` story prefix, `STORAGE_KEY` string — keep as
  internal code unless JC wants a clean sweep.

**B. Palette: Marian design system.** **JC will build the design system in Claude Design**
(the `/design` canvas) — mock the palette + component looks there first, then translate the
chosen values into code. JC's direction:
- **Deep Marian blue** — trust, contemplation, Catholic identity (primary).
- **Warm ivory** — calm, readability (background/surface).
- **Restrained antique gold** — sacred light, continuity (accent; *antique*, not bright
  yellow).
- **Restrained burgundy / oxblood** — devotion, depth, humanity (secondary accent).
- Warm parchment — memory, Scripture, journals (surface variant).
- **Preferred combo:** deep Marian blue + warm ivory + restrained antique gold, with
  burgundy as a deeper accent. "A more concentrated, digitally usable version" of Marian
  art colors.
- Implement via the existing token layer in [`src/styles.css`](../src/styles.css)
  (⚠️ tokens are **oklch**, not hsl — see the knowledge-model gotcha). Map to semantic
  tokens (`--primary`, `--secondary`, `--accent`, `--background`, `--card`, `--muted`,
  `--border`, ring, etc.) so components inherit. Verify **light and dark**, AA contrast,
  the "Now"/status pills, primary buttons, eyebrows (`text-primary`), and focus rings.

## Open questions (flag before building)
- Keep or retire the ACTS acronym under the Oravia name (see tension above).
- Do A and B ship together or separately? (Palette can land first; name later.)
- Exact hex/oklch values + typography (current display face) — mocked in **Claude Design**
  first, then translated to `styles.css` tokens.
- Icon/favicon + manifest theme_color updates.

## Acceptance criteria
- [ ] Decision recorded: Oravia name go/no-go, and whether ACTS survives as a tagline.
- [ ] (If name track) Every user-facing "ACTS" surface reads "Oravia" (wordmark, gate,
      title, manifest, About); no stray "ACTS" left in the UI.
- [ ] (If palette track) The Marian palette is applied through central tokens
      (`src/styles.css`), not scattered literals; components inherit it.
- [ ] Light + dark both pass an AA-contrast check; primary/secondary/accent/status pills,
      buttons, eyebrows, and focus rings look correct — browser-verified.
- [ ] No `STORAGE_KEY` change required (cosmetic/brand only), unless a decision says otherwise.

## Tests
_Planned — no runner wired yet (harness = ACTS-92); see
[`docs/E2E-TEST-PLAN.md`](../docs/E2E-TEST-PLAN.md). Convention ACTS-91._
- **Unit** (Vitest): N/A (design tokens / copy) — or assert no hard-coded "ACTS" remains in
  a wordmark constant if the name is data-driven.
- **Integration** (Testing Library): Brand/wordmark renders the new name; About shows it.
- **E2E** (Playwright): the app title/wordmark reads "Oravia"; a visual/contrast smoke on
  the home + a prayer session in light and dark.
