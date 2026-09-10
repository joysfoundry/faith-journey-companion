---
id: ACTS-187
title: Unify the content/vessel add form — one input everywhere, add-first, edit mirrors
spine:
status: To Do
origin: human-directed
approved_by: JC
depends_on: []
relates_to: [ACTS-185, ACTS-186, ACTS-183, ACTS-181, ACTS-179]
started_at: 2026-09-10T13:00:20-0700
updated:    2026-09-10T13:00:20-0700
latest_handoff: null
sessions: 0
---

## Goal
As someone saving content or a quote, I want **one consistent add form** — the same input
boxes and fields wherever content is captured (the Vessels **Add** page, the quote/content
**editor**, and **attaching content/a quote from a reflection**) — so I enter the full info
**at add time** (no add-then-edit friction) and everything ties into the existing graph.

JC's framing (2026-09-10, closing ACTS-185): *"I should have started with the vessel add box
so the info is there from the start and not having to edit it in. Edit should mirror the add
box … a few more details that can be added later. … The input box and field should be the
same. This maintains the thread. If a quote exists the app should know it exists; if an
author exists, tie it to the existing author (which we have on the home page add)."*

## Why (supersedes ACTS-185's approach)
ACTS-185 bolted entity-autocomplete onto scattered boxes and still leaned on add-then-edit.
The right shape is a **single shared capture component** — add-first, edit = the same form
(+ a few advanced fields revealed later) — reused across every surface, with entity-matching
built in so a name resolves to an existing Vessel and a work/quote to an existing item
(never a duplicate). This is what keeps the **threads** intact (see [[connected-entity-inputs]]).

## Acceptance criteria
- [ ] A single **shared add/edit form component** for content (and its Vessel + channel +
      links + quote fields), used by: the Vessels **Add** page (`VoiceEditor`/`QuickAddLink`),
      the content/quote **editor** (`knowledge.$knowledgeId`), and the **reflection**
      content/quote attach flow (`ReflectionComposer`).
- [ ] **Add captures the full record up front** — no "save a stub then edit to fill it in."
- [ ] **Edit mirrors Add** (identical fields); extra/advanced details are progressive
      (revealable), not a different form.
- [ ] **Entity-matching throughout** (from ACTS-185's `EntitySuggestInput`): an existing
      author ties to the existing Vessel; an existing work/quote is recognized and linked,
      not duplicated. Reuse the home-page paste/add attribution matching (`matchVoice`, etc.).
- [ ] Same **field set + input styling** on every surface (one component, one source of truth).
- [ ] No regression to existing capture entry points during the migration.

## Open questions for JC
- Scope of "content" the unified form covers: quotes only, or all `KnowledgeItem` kinds
  (book/article/video/podcast/post/program) + Vessel + channels?
- Which advanced fields are "later" (progressive) vs shown up front?
- Does this fold `QuickAddLink` (paste-a-link) in as one mode of the same form, or stay
  separate?

## Tests
No runner yet (ACTS-92). Per surface: add-first captures the full record; edit shows the
same fields; author/work matching links existing entities; no duplicate entities created.
Planned; extends flow **E12** (Formation / Knowledge) + the reflection compose flow.
