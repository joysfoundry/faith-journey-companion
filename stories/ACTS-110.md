---
id: ACTS-110
title: Nested Templates / Template Block — reuse a Template inside a Session
spine: ACTS-110
status: To Do
origin: human-directed
approved_by: JC
depends_on: []
relates_to: [ACTS-107]
started_at: 2026-08-29T21:25:05-0700
updated:    2026-08-29T21:25:05-0700
latest_handoff: null
sessions: 0
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

## Acceptance criteria (draft)
- [ ] New `template_block` item kind referencing another `PrayerTemplate` by id
- [ ] Compiler **recursively expands** the block into concrete SessionItems before Pray mode
- [ ] Reject circular nesting (A→B→A); bound recursion depth
- [ ] Compiled items retain lineage back to the source template for later editing
- [ ] ACTS-107 can compose Rosary + Litany via blocks

## Tests
- **Unit** (Vitest): compiler expands nested block; circular-reference guard; depth bound.
- **Integration**: builder adds a Template Block; preview shows the expanded items.
- **E2E**: build Rosary + Litany composite via a block; pray through it in order.
