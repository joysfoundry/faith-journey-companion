---
id: ACTS-136
title: Reflection composer — persist the in-progress draft + specific daily-readings tag
spine:
status: To Do
origin: human-directed
approved_by: JC
priority: high
depends_on: []
relates_to: [ACTS-103, ACTS-129, ACTS-102]
sync: local
synced_at: null
started_at: null
updated: 2026-09-02T00:00:00-0700
latest_handoff: null
sessions: 0
---

## Goal
As a journaler, I want the reflection I'm **in the middle of writing to survive moving
between Home and the Reflect page** (and to carry its links/passages with it), and I want
a reflection started from the **daily readings to be tagged with the actual liturgical
day**, so I never lose work and the source tag is meaningful.

_Found while browser-testing ACTS-103 (2026-09-02). JC asked to file this and audit the
other Home reflect entry points (below)._

## The bug (confirmed in the browser)
There are **two separate `ReflectionComposer` instances**, each with its own local React
state and no shared/persisted draft:
- Home — [`index.tsx:674`](../src/routes/index.tsx)
- `/reflections` — [`reflections.tsx:281`](../src/routes/reflections.tsx)

A reflection only persists on an **explicit Save**. So:
1. Type a draft in the Home composer (optionally via a "Reflect" icon that pre-links a
   source) → click **"Open your journal"** → the `/reflections` composer opens **empty**.
   The draft body/title/links/passages are **gone**, nothing shows as "in progress", and
   nothing was saved.
2. Same loss in reverse (Reflect page → Home).

## Home reflect entry-point audit (JC asked)
Clicking a Home "Reflect" icon calls `openJournal(linkId)` ([`index.tsx:345`](../src/routes/index.tsx))
— it sets `journalLinkId` and **scrolls to the Home composer**; the composer's effect
**appends** that link. Observed:
- **Daily readings** → tag is generic **"Daily Readings"** (hardcoded label at
  [`index.tsx:395`](../src/routes/index.tsx)), NOT the liturgical day shown right above it
  ("Wednesday of the Twenty-second Week in Ordinary Time"). **This is the only generic
  tag.** The day is already computed via `getLiturgicalDay`
  ([`src/lib/liturgical/calendar.ts`], used by [`WordSection.tsx:29`](../src/components/home/WordSection.tsx)).
- **Rosary** → specific ("The Holy Rosary · Glorious Mysteries"). ✅
- **Bible in a Year / programs / knowledge** → specific (item title). ✅
- **Session rows** (Continue/Today/Done) & plans → specific (`r.title`). ✅
- **Accumulation**: the Home composer is a **single sticky draft** — clicking several
  reflect icons **appends multiple link chips** to the same draft; nothing clears them
  but Save. (Behavior to keep or bound — decide.)
- **Entry-point inconsistency**: Home reflect icons scroll to the **Home** composer,
  while the Formation / session-detail reflect icons added in **ACTS-129** navigate to
  **`/reflections?link=<id>`** (the Reflect-page composer). Because the two composers are
  different drafts, *which one holds your work depends on where you started*.

## Scope
1. **One persisted "current draft"** shared by both composer instances (store or
   localStorage): title, body, mode, links, passages. Survives navigation Home ↔ Reflect;
   cleared on Save (or explicit discard). **DATA-SHAPE / persistence decision — flag.**
2. Optional **"In progress"** affordance on the Reflect page when a draft exists.
3. **Daily-readings tag = liturgical day**: linkable label uses `getLiturgicalDay(...)`
   (and snapshot it as the link `excerpt`/label so it stays meaningful over time).
4. **Decide** the accumulation + entry-point-inconsistency behaviors (unify, or document
   as intended). At minimum, both composers should read/write the same draft so behavior
   is consistent regardless of entry point.
5. **Source parity with Home** (JC, 2026-09-02): the `/reflections` "Link an item" picker
   should list *every* source you can tag from Home (all sessions, programs/plans, Mass
   entries), not just the current subset. (Manual web-URL links are a different capability
   — tracked in [ACTS-135](ACTS-135.md).)

## Non-goals
- Themes/tagging + group-by views (ACTS-135); voice/OCR (ACTS-134); the inspiration
  panel + excerpt + sort already shipped in ACTS-103.

## Acceptance criteria (draft — refine when picked up)
- [ ] A draft typed on Home (with any links/passages) is present when you open the
      Reflect page, and vice versa — no lost work.
- [ ] Saving clears the shared draft everywhere; an explicit discard also clears it.
- [ ] A reflection started from the daily readings is tagged with the **liturgical day**,
      not generic "Daily Readings".
- [ ] The accumulation + Home-vs-`/reflections?link=` entry points behave consistently
      against the one shared draft.
- [ ] Existing saved reflections and links are unaffected.

## Tests
_Convention (ACTS-91): document when picked up. Planned; harness = ACTS-92._
- **Unit** (`src/lib/**`): draft persistence read/write/clear; daily-readings label
  resolves to the liturgical day.
- **Integration**: type on Home → navigate → Reflect composer shows the same draft;
  Save clears it; daily-readings reflect prefills the specific day tag.
- **E2E**: start a reflection from daily readings on Home, add a passage, open the Reflect
  page mid-write → draft + passage + specific day tag are intact → save → journal shows it.
