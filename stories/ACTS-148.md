---
id: ACTS-148
title: Oravia Marian design system + palette (mock in Claude Design → styles.css tokens)
spine: ACTS-144
status: In Progress
origin: human-directed
approved_by: JC
depends_on: []
relates_to: [ACTS-144, ACTS-90, ACTS-96]
started_at: 2026-09-04T14:06:23-0700
updated:    2026-09-04T14:06:23-0700
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

## Session-01 state (2026-09-04)
Palette + tokens + component looks are **drafted and rendered**, living as a design-system
bundle in [`docs/brand/design-system/`](../docs/brand/design-system/) (11 `@dsCard` preview
pages + [`tokens.css`](../docs/brand/design-system/tokens.css), the drop-in oklch block).

**Target changed mid-session:** JC wants this in **claude.ai/design** via `/design-sync`, not
as a Claude Design *canvas artifact*. The `DesignSync` tool is present but **blocked on a
one-time `/design-login`** run from an interactive `claude` terminal on this Mac. The
`/design-sync` skill is not in the enabled skill set; the tool can be driven directly
(list → `finalize_plan` → `write_files`).

### Values chosen (all verified in sRGB)
- **Marian blue** hue 264 · primary `oklch(0.455 0.135 264)` = `#2f51a1`, 7.05:1 on ivory.
- **Warm ivory** background `oklch(0.980 0.012 88)` = `#fcf8f0`; parchment `#f7f1e2`.
- **Antique gold** `oklch(0.715 0.088 82)` = `#bf9e61` — becomes `--accent` (ghost/hover fill),
  so gold finally appears in the UI instead of being a declared-but-unused token.
- **Burgundy** `oklch(0.420 0.125 16)` = `#832835` — **new token**, season marks only.

### Findings that change the work
- **`.dark` tokens already exist in `src/styles.css` but nothing ever adds the `.dark` class** —
  dark mode is unreachable dead code. Wiring a theme toggle is a real task, not a token edit.
- **`--gold` is currently referenced by zero components.**
- **Gold cannot carry body text**: `gold-600` on ivory is 3.46:1 (fails AA). It is a fill/rule/
  mark color; `gold-700` (5.23:1) is the text-safe step.
- **Burgundy vs destructive collide** as dark reds. Rule adopted: burgundy never fills a button.
- **Type is split**: app uses Karla, brand collateral uses Mulish. Recommendation in the Type
  card is to move the app to Mulish (x-height survives the 11–12px text this app leans on).

### Open decisions for JC
1. **Direction A (Restrained) vs B (Illuminated)** — how far the warm/gold shift goes.
2. **Karla vs Mulish.**
3. ~~Whether dark mode ships with this story or splits into its own.~~ **Decided 2026-09-04:
   ships later — split to [ACTS-150](ACTS-150.md).**

## Decisions locked (2026-09-04)
- **Direction: Illuminated.** The *richer* variant was explored and **kept as its own card**
  (`directions/illuminated-home-richer.html`) in case JC reverses; it is deliberately NOT
  reflected in `tokens.css`.
- **Dark mode: ships later** → [ACTS-150](ACTS-150.md).
- Illuminated puts the page on **parchment** (not ivory), so the whole warm ramp shifts one
  step deeper vs. the first palette draft.

## NOT applied to the app — deferred by JC (2026-09-04)
> **"Don't make changes to app yet. I will launch with blue for now."**

The Illuminated tokens + component edits were built, applied and **browser-verified**, then
**deliberately reverted**: beta launches on the existing blue palette. `src/` is untouched at
this commit.

The whole app-side change is preserved as a single patch —
[`stories/ACTS-148/illuminated-app.patch`](ACTS-148/illuminated-app.patch), verified to apply
cleanly against this tree:

```bash
git apply stories/ACTS-148/illuminated-app.patch
```

It contains, and nothing else:
- `src/styles.css` — the Illuminated `:root` + `.dark` token blocks, three new `@theme inline`
  colours (`--color-gold-ink`, `--color-burgundy`, `--color-burgundy-foreground`), and
  `--shadow-devotional` re-tuned hue 255 → 264.
- `src/components/home/SectionCard.tsx` — band `bg-muted/40` → `bg-accent/60`, plus an opt-in
  `crowned` prop that adds the gold top rule.
- `src/routes/index.tsx` — the duplicated Prayer &amp; Devotion header band, and `crowned` on the
  Word section.

Verified before reverting: `tsc` clean, Home rendered correctly at localhost, **no
`STORAGE_KEY` bump**. Two contrast fixes are baked into the patch and the token file:
- `--muted-foreground` darkened to `oklch(0.455 0.036 264)` — the old value failed AA on the
  gold band (4.50) and on `--secondary` (4.29); worst case is now 4.68 on `--accent`.
- New `--gold-ink` `oklch(0.475 0.072 78)` for gold that carries **words**; `--gold` itself is
  fill/rule/mark only.

## When the palette does ship
Apply the patch above, then settle:
1. ~~Gold section band~~ and ~~gold top rule~~ — both **done, in the patch**. (The other three
   `bg-muted/40` sites were deliberately left alone — ShareDialog, session, pray are unrelated.)
2. **Burgundy** still has *no* home on Home: the line I mocked as "Ordinary Time" is
   `rankLabel · ferialTitle` in [`WordSection.tsx:114`](../src/components/home/WordSection.tsx),
   which only renders on a **named celebration**. On an ordinary ferial day nothing shows.
   Decide whether burgundy attaches to that line, or waits for a surface that always exists.
   **Useful find:** `LiturgicalDay` already computes `season` (advent/christmas/ordinary/lent/
   triduum/easter) **and** `color` (green/violet/white/red/rose) for *every* day — an always-on
   hook for burgundy (or a full liturgical-colour system) that nothing currently renders.

## Acceptance criteria
- [x] Palette mocked (design-system project on claude.ai/design) and proven through **central
      tokens** (`src/styles.css`), not scattered literals — then reverted; ships via the patch.
- [x] Light + dark values both pass an **AA-contrast** check (verified in sRGB; dark values
      chosen here, but **wiring dark mode split to [ACTS-150](ACTS-150.md)** — JC, 2026-09-04).
- [x] Primary/secondary/accent/status pills, buttons, eyebrows and focus rings look correct —
      **browser-verified** on Home in the light theme (dark is unreachable → ACTS-150).
- [x] No `STORAGE_KEY` change required (cosmetic/brand only), unless a decision says otherwise.

## Tests
_Planned — no runner wired yet (harness = ACTS-92); see
[`docs/E2E-TEST-PLAN.md`](../docs/E2E-TEST-PLAN.md). Convention ACTS-91._
- **Unit** (Vitest): N/A (design tokens) — recorded decision.
- **Integration** (Testing Library): N/A — visual/token change.
- **E2E** (Playwright): visual/contrast smoke on Home + a prayer session, light and dark.
