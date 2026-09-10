---
id: ACTS-190
title: Home Prayer & Devotion ⋯ menu — add "New prayer" item
spine:
status: To Do
origin: human-directed
approved_by: JC
depends_on: []
relates_to: [ACTS-182, ACTS-173]
started_at: 2026-09-10T14:29:48-0700
updated:    2026-09-10T14:29:48-0700
latest_handoff: null
sessions: 0
---

## Goal
As someone on Home, I want the **Prayer & Devotion** block's ellipsis (⋯) menu to also offer
**"New prayer"**, so I can create a prayer straight from Home — not only start a "New session".

JC (2026-09-10):
> For home prayer and devotion ellipse menu add item + new prayer.

## Context
The Home **Prayer & Devotion** card (block A, `src/routes/index.tsx` ~L627) has a header
`MoreVertical` (⋯) `DropdownMenu` whose only item today is **"New session"** (`Plus` →
`navigate({ to: "/pray", search: { build: true } })`, ~L656). This story adds a second item,
**"New prayer"**, that opens the create-a-prayer flow. (A prayer/devotion is a
`PrayerTemplate`; existing add surfaces include `/prayers` and `/import` "Add prayers".)

## Acceptance criteria
- [ ] The Prayer & Devotion ⋯ menu shows a **"New prayer"** item (with a `Plus` icon),
      alongside the existing "New session".
- [ ] Choosing it opens the create-a-prayer flow (destination TBD — see Qs) so a new prayer
      can be made without leaving via the drawer.
- [ ] "New session" is unchanged; ordering/labels read clearly (distinguish *session* vs
      *prayer*).

## Open questions for JC
- **Destination:** where does "New prayer" go — the `/prayers` add flow, `/import` ("Add
  prayers"), or a dedicated new-prayer form/dialog? Is there an existing add-prayer entry to
  reuse, or does this need one?
- **Scope:** just the menu item + wiring to an existing flow, or does a new-prayer
  form/dialog need building too (would grow the story)?

## Tests
No runner yet (ACTS-92). **Integration:** the ⋯ menu renders "New prayer"; clicking it routes
to the create flow. **E2E:** Home → New prayer. Planned.
