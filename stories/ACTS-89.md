---
id: ACTS-89
title: Guided-prayer expand/collapse + expand-all/collapse-all
spine:
status: Done
origin: human-directed
approved_by: JC
depends_on: []
relates_to: [ACTS-76]
started_at: 2026-08-27T11:04:39-0700
updated: 2026-08-27T11:06:30-0700
latest_handoff: stories/ACTS-89/session-01.md
sessions: 1
---

## Goal
As someone praying, I want to expand/collapse each prayer — and expand-all / collapse-all —
in the **guided prayer (Pray mode)** view, so I can skim the flow or focus on one item.

## Acceptance criteria
- [x] Each prayer/item in Pray mode can expand and collapse individually. _(Guide tab, per-line tap.)_
- [x] An **expand-all / collapse-all** control acts on the whole guided view. _(Delivered as a 4-way mode incl. "Expand all" + "Keep collapsed".)_
- [x] Default collapsed/expanded state is sensible for praying (decide during build). _(Default: "Expand current only".)_
- [x] Interaction/usage is tested **in that view** (Pray mode), not just the builder. _(Manually verified live in the running Guide view; automated tests planned → ACTS-92.)_

## Tests
_No runner wired yet — **planned** (harness = ACTS-92). See
[`docs/E2E-TEST-PLAN.md`](../docs/E2E-TEST-PLAN.md)._
- **Unit** (Vitest): expand/collapse state reducer (per-item + all) if extracted to a helper;
  otherwise N/A (presentational).
- **Integration** (Testing Library — running session view): toggling one item expands/collapses
  only it; expand-all / collapse-all act on every item; default state is sensible; `aria-expanded`
  reflects state. Coordinate with the ACTS-76 tracker (current-item highlight must survive collapse).
- **E2E** (Playwright): feeds flow **E3** (guided-prayer expand/collapse).

## Notes
- **Location correction (session-01):** the guided prayer view is the running
  `src/routes/session.$sessionId.tsx`, NOT `pray.tsx` (that's the Session Builder).
  ACTS-76's current-highlight + autoscroll live in `session.$sessionId.tsx`.
- **Built as (session-01):** targets the **Guide tab**. The "expand-all / collapse-all"
  AC became a 4-way expansion mode (follow current / trail / all / none) + per-line
  manual override. Prayers tab kept as the full-text read-through (both tabs kept to A/B).
- Reused the caret idiom from ACTS-35 (`DevotionItemsEditor`). Mode logic is a pure
  helper: `src/lib/prayer/guideExpansion.ts`.
- Spun off from the ACTS-75 workflow chat (2026-08-25). Related: ACTS-76 pray-mode tracker
  (grayed-out completed + auto-scroll) touches the same view — coordinate.
