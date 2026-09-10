---
id: ACTS-191
title: Word expanded page redesign + Lectio Divina block
spine:
status: To Do
origin: human-directed
approved_by: JC
depends_on: []
relates_to: [ACTS-138, ACTS-139, ACTS-140, ACTS-141, ACTS-142, ACTS-190]
started_at: 2026-09-10T14:29:48-0700
updated:    2026-09-10T14:29:48-0700
latest_handoff: null
sessions: 0
---

## Goal
As a reader, I want the **Word** page (`/word`) to be a fuller, expanded experience — not
just the Home Word card repeated — including a **Lectio Divina** block that guides prayerful
reading of today's Scripture.

JC (2026-09-10):
> Word Expanded page redesign. Add the Lectio Divina block in Word.

## Context
- `/word` (`src/routes/word.tsx`, 37 lines) today just wraps `WordSection`
  (`src/components/home/WordSection.tsx`) — the **same** component as the Home Word card —
  plus `OnlineBibleLink`. So the "expanded" page is currently identical to the Home block.
- Lectio Divina already has surfaces in the reflection arc (ACTS-138–141; themes ACTS-142).
  This story surfaces a **Lectio block in Word**, on today's Mass readings.
- **Interplay with ACTS-190:** that story removes **Word** from the primary nav bar. `/word`
  **remains a real page** (reached via the Home Word card / links) — this redesign is what
  makes the fuller page worth keeping even without a nav slot.

## Acceptance criteria
- [ ] `/word` is redesigned as an **expanded** page that goes beyond the Home Word card
      (today's Mass readings, the Mass attended, reading programs) — exact layout TBD with JC.
- [ ] A **Lectio Divina block** appears in Word: a guided path over today's reading
      (the classic movements — Lectio / Meditatio / Oratio / Contemplatio — confirm scope),
      wired to the existing Lectio/reflection surfaces where possible (reuse, don't rebuild).
- [ ] Entering Lectio from Word carries today's passage/context through to the reflection/
      Lectio surface (no re-selecting the reading).
- [ ] The Home Word **card** stays lean (unchanged, or a trimmed subset) — the expanded
      content lives on `/word`, not duplicated onto Home.

## Open questions for JC
- **Lectio scope:** full four-movement guided flow, or a lighter "begin Lectio on today's
  reading" entry that hands off to the existing reflection/Lectio surface?
- **Expanded layout:** what does the fuller Word page include beyond the current card
  (readings, saved homilies, reading programs, a Lectio block) and in what order?
- Does Lectio in Word produce a saved reflection (journal entry), or is it a guided prayer
  that only optionally captures?
- Should the Lectio block also appear on the Home Word card, or live only on `/word`?

## Tests
No runner yet (ACTS-92). **Integration:** `/word` renders the expanded layout + Lectio block;
starting Lectio carries the day's passage through. **Unit:** any new pure helpers (passage →
Lectio context). **E2E:** Word → Lectio → reflection flow. Planned.
