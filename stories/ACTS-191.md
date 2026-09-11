---
id: ACTS-191
title: Word expanded page redesign + Lectio Divina block
spine:
status: In Progress
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

## Session 1 progress (2026-09-10) — all three shipped, verified in-app
- [x] **Pinned scripture** at the top of the Lectio block — the collapsed "Your passage" card
      now renders the chosen reference **and** the pasted passage text + "Open in your Bible", so
      it stays as reference context across the movements. `src/routes/session.$sessionId.tsx`
      (`PassageEditor` collapsed branch).
- [x] **Lectio entry on `/word`** — a "Begin Lectio Divina" block that starts the seeded Lectio
      session (reuses `startSession(LECTIO_TEMPLATE_ID)`). `src/routes/word.tsx` (`LectioEntry`).
- [x] **Scripture-quote-with-provenance** — finishing a session with a chosen passage mints a
      typed `scripture` quote (`source:"Bible"`, `source_item_id`=version book) with the new
      **`KnowledgeItem.source_session_id`** → the Lectio. Surfaces in the existing quote views;
      the quote detail page shows a **"From this Lectio · <date>"** link back to the session.
      `store.ts` (`scriptureQuoteFromSession` + `finishSession` mint, dedup via `alreadyKept`),
      `types.ts` (field), `knowledge.$knowledgeId.tsx` (render).
- **Two bugs caught in verification & fixed:**
  1. `normalizeContent` (load-time normalizer) rebuilt knowledge items field-by-field and
     **dropped `source_session_id` on every load** → added it (no STORAGE_KEY bump).
  2. Provenance date showed the **wrong day** (UTC-midnight parse of `yyyy-mm-dd`, the ACTS-157
     gotcha) → `formatDayLabel` pins to local midnight.
- [x] **Journal date-consistency (JC review):** the folded Lectio sitting row led with the title
      (`Lectio Divina · <date>`) while single-entry rows led with the date — inconsistent in the
      date list. Flipped the sitting to **date-first** (`<date> · 🔥 Lectio Divina`) to match.
      `src/routes/reflections.tsx` (`SittingGroup`). (Belongs to the ACTS-140 sitting card; folded
      into this review.)
- **Deferred (as agreed):** backfill of past Lectios' scripture into quotes; the broader `/word`
  expanded-page redesign (readings/homilies/programs layout). Not committed yet (use `/save`).

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

## JC direction (2026-09-10, session 1)
- **Pinned scripture = user-CHOSEN passage**, not "today's" Mass reading. Same purpose as
  reflection: keep the thing you're writing about visible at the top for context/reference
  across the movements.
- Confirmed working already: finishing Lectio saves a **session** + a collapsible **journal
  entry**.
- **Connect the thread — scripture-as-quote.** A Lectio *is* "a scripture quote, viewed and
  reflected upon", provenance = the Lectio (from Word / session / reflection). Wire the chosen
  passage into the **typed keepable-quote model** (`quote_kind: scripture` + `scripture_ref`,
  Bible deep-link) with `source_item_id` → its origin.
  - **Mechanism (generic rule):** a finished reflection carrying a `scripture_ref` becomes a
    scripture quote linked by `source_item_id`. Lectio always has a passage → always fires;
    sessions/free reflections fire only when they reference scripture. (This is "auto on
    finish" + the forward half of "every reflected passage".)
  - **Backfill** of already-reflected scripture = isolated last step or follow-on.
- **View = REUSE existing quote surface** (quotes list / By-Vessel, ACTS-181/189) typed as
  scripture with a "from this Lectio" provenance link. No new screen.
- **Provenance storage (CORRECTED — `links[]` was wrong):** `KnowledgeItem.links` is
  `KnowledgeLink[]` (`{platform,url}`), NOT `ReflectionLink[]` — it can't hold a `prayer_session`
  ref. JC confirmed **Option A**: add one optional field **`KnowledgeItem.source_session_id?: ID`**
  (parallel to `source_item_id`). Keep `source_item_id` = Bible-version book. Additive/optional →
  **no STORAGE_KEY bump, no install reset**. Quote renders "From this Lectio" directly.
- **Session scope (JC confirmed): all three** — (1) pin chosen scripture header on the Lectio
  block, (2) Lectio entry block on `/word`, (3) mint scripture-quote-with-provenance on finish.
  Backfill of past Lectios = deferred follow-on. Broader `/word` expanded-page redesign (readings
  /homilies/programs layout) also later.
- **Gap is narrow:** free-text reflections that cite scripture already mint quotes via the
  composer's `addQuote()`. The missing link is the **Lectio's chosen passage** never becoming a
  keepable quote — that's what #3 closes.

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
