---
id: ACTS-179
title: Vessels library — add Voice and Channel as filters
spine:
status: Done
origin: human-directed
approved_by: JC
depends_on: []
relates_to: [ACTS-137, ACTS-171, ACTS-177, ACTS-178]
started_at: 2026-09-09T12:42:04-0700
updated:    2026-09-09T17:05:00-0700
latest_handoff: ACTS-179/session-01.md
sessions: 1
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
- [x] Library exposes a **By Channel** chip alongside the existing chips; Voice is
      already served by **By Vessel**.
- [x] **By Channel** groups content into **platform** sections, alphabetical by
      platform label (all Instagrams together, …), driven by `LinkPlatform`.
- [x] An item's platform resolves from its `channel_id` channel, else its
      pinned/first link; items with none fall to a trailing **No channel** bucket.
- [x] Composes with search; empty state reads clearly ("Nothing matches that search").
- [x] Chip row reordered: `By Vessel · By Channel · Programs · Books · Media ·
      Quotes · All`.
- [x] No data-shape change (read-side only); no `STORAGE_KEY` bump.

## Decisions (JC, 2026-09-09)
- **Voice** is already served by the existing **By Vessel** grouped chip — no new
  voice-kind filter. ("It's just a chip in the library.")
- **Channel** = a new **By Channel** grouped view (mirrors By Vessel): content
  grouped into **platform** sections, **alphabetical by platform** so all Instagrams
  cluster, all YouTubes cluster, etc. Items with no resolvable platform fall to a
  trailing **No channel** bucket. Each item shows its Voice (grouping is by platform,
  not who).
- **Single-select** chip row (not stacked axes) — one active chip at a time, like today.
- **Chip order reordered:** `By Vessel · By Channel · Programs · Books · Media ·
  Quotes · All` (Vessel in front, All last).
- An item's platform = its `channel_id` channel's platform, else its pinned/first
  link's platform, else none.

## Tests
- **Unit**: the filter predicate(s) over `voices` / `knowledge_items` — by voice id,
  by kind, by platform. Planned (ACTS-92).
- **Integration**: render the library, apply Voice then Channel filter, assert the
  visible set narrows correctly and composes with search. Planned.
- **E2E**: extends **flow E12** (Formation / Knowledge — add + library) in
  [`docs/E2E-TEST-PLAN.md`](../docs/E2E-TEST-PLAN.md): filter to a Voice, then to
  YouTube, assert only matching items show. Planned.
