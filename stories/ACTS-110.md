---
id: ACTS-110
title: Nested Templates / Template Block — reuse a Template inside a Session
spine: ACTS-110
status: In Progress
origin: human-directed
approved_by: JC
depends_on: []
relates_to: [ACTS-107]
started_at: 2026-08-29T21:25:05-0700
updated:    2026-08-29T22:50:59-0700
latest_handoff: ACTS-110/session-01.md
sessions: 1
---

## Goal
As a builder, I want to drop an existing **Template as a block** inside another
Session/Template, so composites (e.g. a Rosary **plus** a Litany) can reuse a whole
devotion instead of re-adding every item.

## Context
From the v8↔code gap review. PRD v8 §10A/§31C. **Not built:** no `template_block`
kind in `TemplateItemKind`. JC: "this is related to ACTS-107 (Rosary + Litany)…
new story or linked story? I defer to you." **Decision:** filed as its own
infra story and **linked to ACTS-107** — the Litany of the Departed is the first
concrete consumer, but Template Blocks are a general composition capability worth
building once, cleanly.

## Acceptance criteria
- [x] New `template_block` item kind referencing another `PrayerTemplate` by id — `TemplateItemKind`
      + `TemplateItem.block_template_id` in [types.ts](../src/lib/prayer/types.ts).
- [x] Compiler **recursively expands** the block into concrete SessionItems before Pray mode —
      `expandTemplate` recursion in [compiler.ts](../src/lib/prayer/compiler.ts); each nested
      rosary resolves its own mystery set + counts its own decades.
- [x] Reject circular nesting (A→B→A); bound recursion depth — `state.stack` cycle guard +
      `MAX_BLOCK_DEPTH = 4`. Verified: A→B→A stops after one A+B; a 8-deep chain stops at depth 4.
- [x] Compiled items retain lineage back to the source template for later editing —
      `SessionItem.source_template_id` set to the expanding template's id.
- [~] ACTS-107 can compose Rosary + Litany via blocks — **mechanism proven** by the scratch
      harness (composite root nesting a Rosary block + a Litany block expands in order with correct
      lineage); realized end-to-end when ACTS-107's seeds land.

Also: builder ([DevotionItemsEditor](../src/components/prayer/DevotionItemsEditor.tsx)) offers a
"Devotion block" add-type with a template picker (self excluded); `templateOutline` previews it.

## Tests
_No runner wired (harness = ACTS-92). **Unit coverage exercised** via a standalone Node harness
(`node --experimental-strip-types`) against the real compiler — 14/14 assertions:_
- **Unit** — expansion order (heading → block → rosary decades → litany), lineage
  (`source_template_id` per source template), contiguous positions across blocks, nested-rosary
  mystery resolution surfaced to `session.context`, cycle guard (A→B→A → finite), depth bound
  (`MAX_BLOCK_DEPTH`). Port to Vitest when the harness lands.
- **Integration** — builder renders the "Devotion block" add-type + template picker (browser-
  confirmed the option renders; no console errors). Full picker→preview click-through deferred to
  ACTS-107 when a real composite exists to compose.
- **E2E** — build Rosary + Litany composite via a block; pray through it in order. N/A until
  harness lands; realized in ACTS-107.
