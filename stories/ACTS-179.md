---
id: ACTS-179
title: Vessels library — add Voice and Channel as filters
spine:
status: To Do
origin: human-directed
approved_by: JC
depends_on: []
relates_to: [ACTS-137, ACTS-171, ACTS-177, ACTS-178]
started_at: 2026-09-09T12:42:04-0700
updated:    2026-09-09T12:42:04-0700
latest_handoff: null
sessions: 0
---

## Goal
As someone browsing my library, I want to filter by **Voice** (the person/org) and
by **Channel** (their platform account), so I can quickly narrow the list the same
way I already filter by content type.

## Context (why)
The Vessels library (`src/routes/formation.tsx`) has filter chips today:
**All · Programs · Books · Media · Quotes · By Vessel**. Those filter by content
category (plus the grouped "By Vessel" view). JC wants two more axes:
- **Voice** — filter/scope to a Voice (individual / organization / ministry), or by
  Voice kind; and
- **Channel** — filter by channel/platform (YouTube, Website, Podcast, Instagram…).

Pairs with ACTS-178 (consistent Voice/Channel shape) — cleaner filters depend on the
data being entered consistently.

## Acceptance criteria
- [ ] Library exposes a **Voice** filter and a **Channel** filter alongside the
      existing category chips.
- [ ] **Voice filter** narrows to a chosen Voice (and/or by kind — confirm the exact
      shape with JC: pick-a-voice vs. individual/org/ministry toggle).
- [ ] **Channel filter** narrows by platform/channel (YouTube, Website, Podcast, X,
      Instagram, …), driven by `LinkPlatform`.
- [ ] Filters compose sensibly with search and the existing category chips; empty
      states read clearly ("Nothing matches that filter").
- [ ] Works in both the flat list and the grouped "By Vessel" view.
- [ ] No data-shape change (read-side only); no `STORAGE_KEY` bump.

## Open questions for JC
- Voice filter = **pick a specific Voice**, or **filter by kind** (individual /
  organization / ministry), or both?
- Should Channel filter list only platforms present in the library, or all
  `LinkPlatform` values?

## Tests
- **Unit**: the filter predicate(s) over `voices` / `knowledge_items` — by voice id,
  by kind, by platform. Planned (ACTS-92).
- **Integration**: render the library, apply Voice then Channel filter, assert the
  visible set narrows correctly and composes with search. Planned.
- **E2E**: extends **flow E12** (Formation / Knowledge — add + library) in
  [`docs/E2E-TEST-PLAN.md`](../docs/E2E-TEST-PLAN.md): filter to a Voice, then to
  YouTube, assert only matching items show. Planned.
