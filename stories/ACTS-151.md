---
id: ACTS-151
title: Ship the Illuminated palette (warm parchment, gold bands, burgundy)
spine: ACTS-144
status: To Do
origin: human-directed
approved_by: JC
depends_on: []
relates_to: [ACTS-148, ACTS-150, ACTS-144]
started_at: 2026-09-04T16:20:20-0700
updated:    2026-09-04T16:20:20-0700
latest_handoff: null
sessions: 0
---

## Goal
Ship the **Illuminated** palette — the warm Marian system chosen in
[ACTS-148](ACTS-148.md) — replacing the interim harmonised-blue palette in the beta.

Split out of ACTS-148 on 2026-09-04: JC chose Illuminated as the direction, then chose to
**launch on blue** for the beta. The work is done, verified and preserved; this story is
the decision to ship it.

## It is already built
Apply the preserved patch, which was verified to apply cleanly:

```bash
git apply stories/ACTS-148/illuminated-app.patch
```

It contains `src/styles.css` (Illuminated `:root` + `.dark`, three new `@theme inline`
colours, `--shadow-devotional` re-tuned), `SectionCard.tsx` (gold band + the opt-in
`crowned` prop for the gold top rule) and `routes/index.tsx` (duplicated header band,
`crowned` on Word).

⚠️ The patch predates the ACTS-148 harmonisation and the header-mark commit. Expect it to
need a rebase against current `main`, not a clean apply, by the time this is picked up.

## What changes visually
Paper moves from cool blue-grey to **warm parchment**; section-header bands become **gold**;
the Word card gains a **gold top rule**. Blues and golds do *not* change — those already
shipped with ACTS-148 and match Illuminated exactly.

## Decide before shipping
- **Burgundy has no home.** The line it was mocked against (`rankLabel · ferialTitle` in
  [`WordSection.tsx`](../src/components/home/WordSection.tsx)) only renders on a **named
  celebration**. `LiturgicalDay` computes `season` and `color` for every day — an always-on
  hook nothing currently uses.
- **Karla vs Mulish** — the app and the printed collateral disagree; the Type card recommends
  Mulish.
- Whether to fold in **dark mode** ([ACTS-150](ACTS-150.md)) or ship light-only first.

## Acceptance criteria
- [ ] Illuminated tokens live in `src/styles.css`; components inherit, no scattered literals.
- [ ] Gold section bands + the crowned Word card render correctly — **browser-verified**.
- [ ] AA contrast re-verified after any rebase drift.
- [ ] The design system's `published-palette` and `palette-states` cards updated so "live"
      points at Illuminated.
- [ ] No `STORAGE_KEY` bump.

## Tests
_Per convention ACTS-91; no runner yet (harness = ACTS-92)._
- **E2E** (Playwright): visual/contrast smoke on Home + a prayer session.
