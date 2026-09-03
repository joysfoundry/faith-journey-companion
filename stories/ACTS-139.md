---
id: ACTS-139
title: Reflections page — split into Write / Journal tabs
spine:
status: To Do
origin: human-directed
approved_by: JC
depends_on: []
relates_to: [ACTS-103, ACTS-138, ACTS-140, ACTS-135, ACTS-136]
started_at: 2026-09-03T12:33:01-0700
updated: 2026-09-03T12:33:01-0700
latest_handoff: null
sessions: 0
---

## Goal
As a person journaling, I want the `/reflections` page split into two tabs — **Write**
and **Journal** — so the page isn't one long scroll that mixes *capturing* a reflection
with *revisiting* past ones.

## Why
`/reflections` now stacks the Lectio entry card (ACTS-138) + the free-write composer +
themes + group/sort controls + the full journal list — a lot of vertical scroll, and it
blends two distinct mental modes: **capture** vs. **browse/revisit**.

## Design
- Two tabs on the page (no new route):
  - **Write** — the shared `ReflectionComposer` (Lectio card + free-write). Mirrors Home's
    compose-only surface.
  - **Journal** — the entries + existing group-by (Date / Theme / Source) + sort controls.
- Reuse the existing composer and journal blocks from
  [`src/routes/reflections.tsx`](../src/routes/reflections.tsx) — this is a layout split,
  not a rewrite.
- `?link=<id>` provenance (the "Reflect" icon deep-link, ACTS-129) must land on the
  **Write** tab so the composer pre-links as it does today.
- Home is unaffected (composer-only there already).

## Open questions (flag before building)
- Default tab on open — **Write**, or **Journal** when entries exist?
- Tab affordance: shadcn `Tabs`, or a lighter segmented control matching the group-by pills?
- Does the `showDraftStatus` "draft in progress" affordance move onto the Write tab header?

## Acceptance criteria
- [ ] `/reflections` shows Write / Journal tabs; no new route added.
- [ ] Write tab = composer (Lectio card + free-write); Journal tab = entries + group/sort.
- [ ] `?link=<id>` opens on Write with the composer pre-linked (no regression to ACTS-129).
- [ ] Group-by / sort / expand-collapse still work under the Journal tab.
- [ ] Home reflection surface unchanged.
- [ ] No data-model change, no `STORAGE_KEY` bump.

## Tests
_Planned — no runner wired yet (harness = ACTS-92); see
[`docs/E2E-TEST-PLAN.md`](../docs/E2E-TEST-PLAN.md). Convention ACTS-91._
- **Unit** (Vitest): N/A — layout-only; no new pure `src/lib/**` logic.
- **Integration** (Testing Library): render `/reflections`; assert both tabs; switching
  tabs shows composer vs. journal; `?link=` lands on Write with the item pre-linked.
- **E2E** (Playwright): open Reflection → Write tab → save an entry → switch to Journal →
  the entry appears; group-by controls operate on the Journal tab.
