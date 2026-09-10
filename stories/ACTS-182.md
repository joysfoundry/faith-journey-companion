---
id: ACTS-182
title: Home page redesign — collapsible "Vessels of Knowledge" + nav-bar reshuffle
spine:
status: To Do
origin: human-directed
approved_by: JC
depends_on: []
relates_to: [ACTS-137, ACTS-177, ACTS-179, ACTS-189]
started_at: 2026-09-09T17:13:36-0700
updated:    2026-09-10T14:29:48-0700
latest_handoff: null
sessions: 0
---

## Goal
As someone on the Home page, I want Home to lead with prayer / Word / reflection and keep
the Vessels library **available but out of the way** — collapsed, renamed to make its
purpose obvious, and reachable straight from the main navigation.

Originally just the collapse/move (filed 2026-09-09); JC expanded it 2026-09-10 into the
full Home redesign (the later "ACTS-190 Home redesign" was folded back here — always keep the
work on the **earlier** story):
> a. make vessels collapsible, move block under reflections.
> b. title of Vessels is "Vessels of Knowledge".
> c. Move Vessels onto main bar and switch out Word to settings. All of its functionality
> can be accessed on other blocks.

## Context
- **Home** (`src/routes/index.tsx`) stacks cards Prayer/Devotion → **Word** (C) →
  **Vessels** (D, ~L872, `SectionCard title={SECTION_LABEL}`) → **Reflection**. The Vessels
  card is always expanded and sits above Reflection. `SectionCard`
  (`src/components/home/SectionCard.tsx`) has **no collapse** today; a `Collapsible` primitive
  is already available in `index.tsx`.
- **Nav** (`src/components/layout/nav-links.ts`): primary bottom bar = Today · Plan · Prayers ·
  **Word** · Reflect. Secondary drawer = **Vessels** (`/formation`, `SECTION_LABEL`) · Add
  prayers · Export · **Settings** · About.
- **Section label**: `SECTION_LABEL = "Vessels"` in `src/lib/prayer/knowledge.ts` (used by the
  Home card, the `/formation` page, and nav).

## Acceptance criteria
- [ ] **(a)** The Home Vessels card is **collapsible** (header chevron) and **collapsed by
      default**, rendered **last** in the Home stack — below the Reflection composer (confirm
      exact placement). Card contents (pinned rows) and empty state unchanged.
- [ ] **(b)** The card's title reads **"Vessels of Knowledge"** (decide with JC: rename the
      shared `SECTION_LABEL` app-wide — Home card + `/formation` + nav — or only the Home card).
- [ ] **(c)** **Swap Word ↔ Vessels** in the nav (JC 2026-09-10): **Vessels** moves into the
      primary bottom bar (Word's slot → **Today · Plan · Prayers · Vessels · Reflect**), and
      **Word** moves into the secondary drawer (where Vessels was). **Settings stays** in the
      drawer — no change. Word remains reachable via the drawer, the Home Word card, and `/word`.
- [ ] Collapse/expand persists across sessions (localStorage) — confirm with JC.
- [ ] No functionality lost: everything previously reached via the Word nav entry is still
      reachable (Home Word card, `/word` route).

## Open questions for JC
- **(b) rename scope:** "Vessels of Knowledge" everywhere (`SECTION_LABEL`) or just the Home
  card title? (Nav space is tight for the longer label.)
- **(a) placement:** strictly last (below the Reflection composer), or last among the content
  cards but above Reflection? Add collapse as a reusable `SectionCard` option, or one-off?
- Persist collapse state, or always start collapsed each visit?

## Tests
No runner yet (ACTS-92). **Integration:** Home renders the Vessels card collapsed + last;
nav bar shows Vessels, not Word; card title reads "Vessels of Knowledge". **Unit:** nav-links
composition. **E2E:** Home layout + nav flow. Planned.
