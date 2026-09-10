---
id: ACTS-190
title: Home page redesign — collapsible "Vessels of Knowledge", nav-bar reshuffle
spine:
status: To Do
origin: human-directed
approved_by: JC
depends_on: []
relates_to: [ACTS-182, ACTS-137, ACTS-177, ACTS-179, ACTS-189]
started_at: 2026-09-10T14:29:48-0700
updated:    2026-09-10T14:29:48-0700
latest_handoff: null
sessions: 0
---

## Goal
As someone on the Home page, I want Home to lead with prayer / Word / reflection and keep
the Vessels library **available but out of the way** — collapsed, renamed to make its
purpose obvious, and reachable straight from the main navigation.

JC (2026-09-10), three parts:
> a. make vessels collapsible, move block under reflections.
> b. title of Vessels is "Vessels of Knowledge".
> c. Move Vessels onto main bar and switch out Word to settings. All of its functionality
> can be accessed on other blocks.

## Context
- **Home** (`src/routes/index.tsx`) stacks cards Prayer/Devotion → **Word** (C) →
  **Vessels** (D, ~L872, `SectionCard title={SECTION_LABEL}`) → **Reflection**. `SectionCard`
  (`src/components/home/SectionCard.tsx`) has **no collapse** today; a `Collapsible` primitive
  is already available in `index.tsx`.
- **Nav** (`src/components/layout/nav-links.ts`): primary bottom bar = Today · Plan · Prayers ·
  **Word** · Reflect. Secondary drawer = **Vessels** (`/formation`, `SECTION_LABEL`) · Add
  prayers · Export · **Settings** · About.
- **Section label**: `SECTION_LABEL = "Vessels"` in `src/lib/prayer/knowledge.ts` (used by the
  Home card, the `/formation` page, and nav).
- **Part a duplicates ACTS-182** (collapse + move Vessels card below Reflection). This story
  **supersedes ACTS-182**; fold its scope in and close 182 when this ships.

## Acceptance criteria
- [ ] **(a)** The Home Vessels card is **collapsible** (header chevron) and **collapsed by
      default**, rendered **last** in the Home stack — below the Reflection composer (confirm
      exact placement). Card contents (pinned rows) and empty state unchanged.
- [ ] **(b)** The card's title reads **"Vessels of Knowledge"** (decide with JC: rename the
      shared `SECTION_LABEL` app-wide — Home card + `/formation` + nav — or only the Home card).
- [ ] **(c)** **Vessels** appears on the primary nav bar and **Word is removed from it** — Word
      stays reachable via Home blocks (the Word card) and any other surface, not a nav slot.
      **Settings** becomes more reachable from the bar. Exact 5-slot arrangement TBD (see Qs).
- [ ] Collapse/expand persists across sessions (localStorage) — confirm with JC.
- [ ] No functionality lost: everything previously reached via the Word nav entry is still
      reachable (Home Word card, `/word` route).

## Open questions for JC
- **(c) exact bar:** the bar has 5 slots (Today · Plan · Prayers · Word · Reflect). Desired
  end state? e.g. **Today · Plan · Prayers · Vessels · Reflect** with Word dropped — and where
  does **Settings** land (replace another slot, or is "switch out Word to settings" = Word's
  slot becomes Settings and Vessels takes a different slot)? Confirm the final five.
- **(b) rename scope:** "Vessels of Knowledge" everywhere (`SECTION_LABEL`) or just the Home
  card title? (Nav space is tight for the longer label.)
- **(a) placement:** strictly last (below the Reflection composer), or last among the content
  cards but above Reflection?
- Persist collapse state, or always start collapsed each visit?

## Tests
No runner yet (ACTS-92). **Integration:** Home renders the Vessels card collapsed + last;
nav bar shows Vessels, not Word. **Unit:** nav-links composition. **E2E:** Home layout +
nav flow. Planned.
