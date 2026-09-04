---
id: ACTS-142
title: Themes for Lectio journaling (tag a sitting) + lexicon gaps
spine:
status: To Do
origin: human-directed
approved_by: JC
depends_on: []
relates_to: [ACTS-135, ACTS-140, ACTS-102, ACTS-103]
started_at: 2026-09-03T22:40:35-0700
updated: 2026-09-03T22:40:35-0700
latest_handoff: null
sessions: 0
---

## Goal
As someone who prays Lectio, I want my Lectio journaling to be **taggable with themes**,
so a sitting shows up in the Journal's "Group by: Theme" view (and in theme search)
instead of always falling under **Untagged**.

## Why — the gap (found closing ACTS-140)
Lectio movement reflections are created by `saveSessionReflection`
([`store.ts`](../src/lib/prayer/store.ts)) with **no themes**, and the in-session capture
has no theme UI. Themes are also **never auto-assigned**: the ~34-theme lexicon in
[`themes.ts`](../src/lib/prayer/themes.ts) only *suggests* in the free-write composer
(ACTS-135, via `ThemeEditor`) and the user must tap to apply. So every Lectio sitting is
themeless → "Untagged" (as ACTS-140 renders it). Two sub-gaps:

1. **No place to theme a Lectio.** Free-write has the `ThemeEditor`; Lectio has nothing.
2. **Lexicon gaps.** "Love" is a theme; **"God's will"** is not (nearest: `trust` =
   surrender/providence/let go, and `discernment`). "Obedience" is also absent.

## Design — options to weigh with JC
- **Where to tag** — likely tag the **whole sitting** from its expanded view in the
  Journal (ACTS-140's `SittingGroup`): one `ThemeEditor` whose themes apply to the
  sitting. Storage TBD — put the themes on a representative movement, on every movement,
  or introduce a sitting-level tag. (Per-movement theming in the session player is the
  heavier alternative.)
- **Suggestions** — reuse `suggestThemes` over the combined movement text so the
  sitting gets relevant, still user-confirmed suggestions (no auto-assign — keep ACTS-135's
  rule).
- **Lexicon** — add `god's will` (obedience, surrender to God, thy will be done, fiat)
  and consider `obedience`; decide whether these fold into `trust`/`discernment` or stand
  alone.

## Open questions (flag before building)
- Sitting-level themes vs. per-movement; and how they're stored without a schema churn.
- Do sitting themes also surface on the collapsed Journal row, or only when expanded?
- Lexicon: new standalone themes vs. synonyms under existing ones.

## Acceptance criteria
- [ ] A Lectio sitting can be given themes from the Journal (not only via free-write).
- [ ] A themed sitting appears under its theme(s) in "Group by: Theme", not "Untagged".
- [ ] Suggestions come from the sitting's own text; nothing is auto-applied (ACTS-135 rule).
- [ ] Lexicon covers "God's will" (and obedience) so that language is suggestable.
- [ ] Decision recorded: theme storage shape; whether a `STORAGE_KEY` bump is needed.

## Tests
_Planned — no runner wired yet (harness = ACTS-92); see
[`docs/E2E-TEST-PLAN.md`](../docs/E2E-TEST-PLAN.md). Convention ACTS-91._
- **Unit** (Vitest): `suggestThemes` returns `god's will` for "thy will be done" / surrender
  text; theme read/write for a sitting round-trips.
- **Integration** (Testing Library): open a sitting → add a theme → it persists and the
  sitting moves out of "Untagged" under Group-by-Theme.
- **E2E** (Playwright): pray a Lectio, tag the sitting in the Journal, group by theme →
  the sitting shows under the tag.
