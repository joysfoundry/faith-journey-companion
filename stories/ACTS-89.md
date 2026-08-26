---
id: ACTS-89
title: Guided-prayer expand/collapse + expand-all/collapse-all
spine:
status: To Do
origin: human-directed
approved_by: JC
depends_on: []
relates_to: [ACTS-76]
started_at:
updated: 2026-08-25T21:47:01-0700
latest_handoff: null
sessions: 0
---

## Goal
As someone praying, I want to expand/collapse each prayer — and expand-all / collapse-all —
in the **guided prayer (Pray mode)** view, so I can skim the flow or focus on one item.

## Acceptance criteria
- [ ] Each prayer/item in Pray mode can expand and collapse individually.
- [ ] An **expand-all / collapse-all** control acts on the whole guided view.
- [ ] Default collapsed/expanded state is sensible for praying (decide during build).
- [ ] Interaction/usage is tested **in that view** (Pray mode), not just the builder.

## Notes
- Pray mode lives in `src/routes/pray.tsx`. The builder already has a caret collapse
  pattern (ACTS-35, `DevotionItemsEditor`) — reuse the interaction where it fits.
- Spun off from the ACTS-75 workflow chat (2026-08-25). Related: ACTS-76 pray-mode tracker
  (grayed-out completed + auto-scroll) touches the same view — coordinate.
