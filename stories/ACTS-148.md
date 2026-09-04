---
id: ACTS-148
title: Oravia Marian design system + palette (mock in Claude Design → styles.css tokens)
spine: ACTS-144
status: To Do
origin: human-directed
approved_by: JC
depends_on: []
relates_to: [ACTS-144, ACTS-90, ACTS-96]
started_at: 2026-09-04T11:24:18-0700
updated:    2026-09-04T11:24:18-0700
latest_handoff: null
sessions: 0
---

## Goal
As the product owner, I want a **Marian design system** for Oravia — mocked first in the
`/design` (Claude Design) canvas, then translated into the app's central token layer — so a
reskin is a token change, not a hunt, and the app reads as a trustworthy, contemplative
Catholic prayer companion.

Split from the ACTS-144 rebrand epic: **ACTS-144 = name (ACTS → Oravia)**, **this story =
palette/design system**. The two can ship independently; the name track is not blocked on
this one.

## Approach
1. **Mock in Claude Design first** (the `/design` canvas): palette swatches + component looks
   (cards, buttons, pills, eyebrows, focus rings) in light and dark. Pick exact values there.
2. **Translate to code** via the existing token layer in [`src/styles.css`](../src/styles.css)
   (⚠️ tokens are **oklch**, not hsl — knowledge-model gotcha). Map to semantic tokens
   (`--primary`, `--secondary`, `--accent`, `--background`, `--card`, `--muted`, `--border`,
   ring, etc.) so components inherit.

## Palette direction (JC)
"A more concentrated, digitally usable version" of Marian-art colors:
- **Deep Marian blue** — trust, contemplation, Catholic identity (**primary**).
- **Warm ivory** — calm, readability (**background/surface**).
- **Restrained antique gold** — sacred light, continuity (**accent**; *antique*, not bright yellow).
- **Restrained burgundy / oxblood** — devotion, depth, humanity (**secondary accent**).
- Warm parchment — memory, Scripture, journals (surface variant).
- **Preferred combo:** deep Marian blue + warm ivory + restrained antique gold, with burgundy
  as the deeper accent.

## Brand mark (informs, doesn't block tokens)
- **"Guiding Flame" / continuous-thread O** — an open gold line forms the O of Oravia and rises
  into a flame; the curve inside reads as a path (the faith journey); ivory + burgundy center;
  the open circle = a journey still unfolding. Simplify for crispness at app-icon sizes.
- Ripples into `manifest.webmanifest` `theme_color` / favicon / app icons (coordinate with the
  name sweep in ACTS-144).

## Open questions (flag before building)
- Exact hex/oklch values (from the Claude Design mock).
- Typography — current display face vs. a new one.
- `theme_color` + favicon/app-icon assets.

## Acceptance criteria
- [ ] Palette mocked in Claude Design (values chosen), then applied through **central tokens**
      (`src/styles.css`), not scattered literals; components inherit it.
- [ ] Light + dark both pass an **AA-contrast** check.
- [ ] Primary/secondary/accent/status ("Now") pills, buttons, eyebrows (`text-primary`), and
      focus rings look correct — **browser-verified** in both themes.
- [ ] No `STORAGE_KEY` change required (cosmetic/brand only), unless a decision says otherwise.

## Tests
_Planned — no runner wired yet (harness = ACTS-92); see
[`docs/E2E-TEST-PLAN.md`](../docs/E2E-TEST-PLAN.md). Convention ACTS-91._
- **Unit** (Vitest): N/A (design tokens) — recorded decision.
- **Integration** (Testing Library): N/A — visual/token change.
- **E2E** (Playwright): visual/contrast smoke on Home + a prayer session, light and dark.
