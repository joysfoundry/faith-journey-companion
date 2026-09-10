---
id: ACTS-186
title: Threads — app-wide connected-entity sweep (no stray text boxes)
spine:
status: To Do
origin: human-directed
approved_by: JC
depends_on: []
relates_to: [ACTS-185, ACTS-183, ACTS-181]
started_at: 2026-09-10T12:42:51-0700
updated:    2026-09-10T12:42:51-0700
latest_handoff: null
sessions: 0
---

## Goal
As a user, I want **every** place I name a person or a work to connect to the entity already
in the app — never a stray free-text box — so the whole app reflects the **threads** in my
life and how things connect. This is a **standing sweep** (leave open): audit the app for
entity-name inputs that store loose text, confirm the data model supports the link, and wire
each to the [[connected-entity-inputs]] pattern.

JC: *"there are stray text boxes throughout the app."*

## Scope / approach
- **Audit**: grep the app for free-text inputs that name a person/author, a work/content, a
  channel, a source, a tag, etc. — anywhere a value should resolve to a `Voice`,
  `KnowledgeItem`, `Channel`, or other entity rather than a string.
- **Model check**: for each, confirm the data model can hold the link (an id reference like
  `voice_id` / `source_item_id` / `channel_id`); file model gaps where it can't.
- **Wire**: replace with `EntitySuggestInput` (from ACTS-185) — autocomplete + link/create.
- Candidate surfaces to review: the quote editor (Vessel field, source), `VoiceEditor` add
  form, `QuickAddLink`, reflection linking, tags, Mass capture (church/celebrant), knowledge
  source/creator fields, program/plan attributions.

## Acceptance criteria
- [ ] An inventory of entity-name inputs across the app, each marked connected vs stray.
- [ ] Stray boxes wired to `EntitySuggestInput` (autocomplete against existing entities,
      link on accept, create when new) — or a model gap filed where the link can't be stored.
- [ ] No regressions to existing capture flows.
- [ ] (Open-ended — closed only when the sweep is judged complete by JC.)

## Tests
No runner yet (ACTS-92). Per-surface: verify autocomplete suggests existing entities, accept
links by id, and a new name creates the entity. Planned; documented as surfaces are wired.
