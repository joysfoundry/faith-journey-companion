---
id: ACTS-177
title: Unify "Pin to Home" — one verb, one icon, for content and channels
spine:
status: Done
origin: human-directed
approved_by: JC
depends_on: []
relates_to: [ACTS-137, ACTS-171, ACTS-178, ACTS-179]
started_at: 2026-09-09T12:42:04-0700
updated:    2026-09-09T16:45:32-0700
latest_handoff: ACTS-177/session-01.md
sessions: 1
---

## Goal
As someone building my library of Vessels, I want a single, obvious way to put
anything on my Home page — a piece of content OR a Vessel's channel — so that
"put this on Home" is one gesture with one meaning, not two competing controls.

## Context (why)
Two mechanisms currently land things on Home, and that split is the confusion JC
hit in the Vessels flow:

| Thing | Field | Control today |
|---|---|---|
| Content item (`KnowledgeItem`) | `pinned` | 📌 pushpin |
| A Vessel's channel (`Channel`) | `favorite` | ☆ star |
| A content link (per-link) | `favorite` | ☆ star |

Same intent ("show on Home"), two verbs ("pin" vs "favorite") and two icons
(pushpin vs star). Because a channel is put on Home with a subtle ☆ while content
uses a 📌, JC couldn't tell how to pin a channel ("I can only pin the imported
video not the channel"). Unify to **one** affordance.

Surfaces involved (verified this session):
- `src/routes/formation.tsx` — `ChannelChips` (☆ on channel chip), `ContentRow` (📌/☆ on links)
- `src/routes/voice.$voiceId.tsx` — channel ☆ under "Channels", content-link ☆
- `src/routes/index.tsx` — Home Vessels card via `pinnedLinks(...)`
- `src/components/app-store-provider.tsx` — `toggleChannelFavorite`, `toggleContentLinkFavorite`
- `src/lib/prayer/linkables.ts` / `knowledge.ts` — `pinnedLinks`, pin/favorite plumbing

## Decision (JC): TRUE unification — collapse the model, not just the icons
JC: "I want the code to be clean so if pinning and favoriting can be truly unified
then let's do that." So this is a **data-level** refactor, not UI-only: collapse
`favorite` (channel + content-link) and `pinned` (content item) into **one concept —
`pinned`** — end to end (types → store/mutations → `pinnedLinks` → UI), presented as
**"Pin to Home"** + the pushpin icon.

**Data-shape change — JC-approved.** Done **without a destructive reset**: migrate in
`loadDatabase` at load time (copy any legacy `favorite` → `pinned` when `pinned` is
unset), **not** by bumping `STORAGE_KEY` (a bump wipes installs — the seed gotcha).
Keep a back-compat read of `favorite` for one release so no pin is lost.

## Acceptance criteria
- [ ] **One field** — `pinned` — on content items, channels, and content-links;
      `favorite` removed from the active model (types, store, seed, UI).
- [ ] Mutations renamed to one verb: `toggleChannelFavorite`→`toggleChannelPin`,
      `toggleContentLinkFavorite`→`toggleContentLinkPin` (or a single shared toggle).
- [ ] One control everywhere — **"Pin to Home"** + **pushpin** — on channels,
      content-links, and content items alike; the ☆ star is gone.
- [ ] `pinnedLinks` and every Home surface read the unified `pinned`; nothing
      double-counts.
- [ ] **Load-time migration**: existing installs with legacy `favorite` still show
      those things as pinned after upgrade — **no pin lost, no reset**. `STORAGE_KEY`
      **not** bumped.
- [ ] The paste-a-link "Pin to Home" checkbox writes the same unified `pinned`.
- [ ] Copy/aria consistent: "Pin to Home" / "Unpin from Home".
- [ ] `tsc --noEmit` clean; browser-verified that legacy-pinned data survives.

## Tests
- **Unit** (Vitest — pure `src/lib/**`): the `favorite`→`pinned` load migration
  (legacy channel/link favorites become pinned; already-pinned untouched); `pinnedLinks`
  over the unified field. Planned (harness = ACTS-92).
- **Integration** (Testing Library): render a Vessel row + a content row, assert both
  expose one control labeled "Pin to Home"/"Unpin from Home" toggling the single
  `pinned` field. Planned.
- **E2E** (Playwright): **flow E17** in [`docs/E2E-TEST-PLAN.md`](../docs/E2E-TEST-PLAN.md)
  — pin a channel, a content item, and a content link; assert all reach Home; unpin,
  assert they leave. Migration: seed legacy `favorite`, load, assert pinned. Planned.
