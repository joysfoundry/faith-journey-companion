---
id: ACTS-140
title: Group the journal by Lectio sitting (fold a session's movements together)
spine:
status: To Do
origin: human-directed
approved_by: JC
depends_on: []
relates_to: [ACTS-102, ACTS-103, ACTS-138, ACTS-139, ACTS-135]
started_at: 2026-09-03T12:33:01-0700
updated: 2026-09-03T12:33:01-0700
latest_handoff: null
sessions: 0
---

## Goal
As a person who prays Lectio Divina, I want each **Lectio sitting** to read as **one**
journal item — its four movements (Read / Reflect / Respond / Rest) folded together —
instead of four loose entries scattered through the journal, so a day's Lectio is one
reflective unit I can revisit whole.

## Why — the gap
A Lectio session (ACTS-102) writes **one `Reflection` per movement**, each dual-linked to
the **session** (`prayer_session`) and the **movement** (`session_item`). Today:
- In the flat/date view a single sitting appears as up to **four separate entries**.
- Under **Group by: Source** the entry is pushed under *every* link, so it lands under
  both **"Lectio Divina"** (session title, [`inspiration.ts:83`](../src/lib/prayer/inspiration.ts))
  **and** each movement label — double-counted and scattered — while every sitting shares
  the title "Lectio Divina," collapsing *all* sittings into one bucket.

So "Source" is the wrong axis for this. The natural unit is the **session instance**
(one sitting), a grouping the current [`groupEntries`](../src/routes/reflections.tsx) doesn't offer.

## Design
- Add a grouping that keys Lectio-linked reflections by their **`prayer_session` target_id**
  (the session instance), rendering the sitting as one collapsible group titled by date +
  "Lectio Divina", with the four movements in movement order inside.
- Likely surfaces as a new **"Lectio sitting"** option in the Journal group-by (pairs with
  ACTS-139's Journal tab), or as automatic folding within the Date view — decide w/ JC.
- Movement order should follow the session's step order, not `created_at`, so Read → Reflect
  → Respond → Rest always reads top-to-bottom.
- Non-Lectio entries are unaffected; a session with a single reflection still reads fine.

## Open questions (flag before building)
- New group-by option **vs.** always-fold Lectio sittings inside the existing Date view.
- Group heading: "Lectio Divina · Sep 3" — include the chosen passage/source label if set?
- What to show collapsed — first line of movement 1, or a movement-count summary?

## Acceptance criteria
- [ ] A Lectio sitting renders as one collapsible group; its movements are nested, in step order.
- [ ] No entry is double-counted (the Source double-push problem does not recur here).
- [ ] Multiple sittings are distinct groups (keyed by session id, not shared title).
- [ ] Non-Lectio reflections and existing Date / Theme / Source groupings still work.
- [ ] No data-model change (uses the existing `prayer_session` / `session_item` links); no
      `STORAGE_KEY` bump.

## Tests
_Planned — no runner wired yet (harness = ACTS-92); see
[`docs/E2E-TEST-PLAN.md`](../docs/E2E-TEST-PLAN.md). Convention ACTS-91._
- **Unit** (Vitest): a `groupBySitting` helper over `Reflection[]` — one sitting's four
  movement entries collapse to a single group keyed by session id, ordered by step; a
  non-Lectio entry stays ungrouped; two sittings stay separate.
- **Integration** (Testing Library): render the journal in sitting mode; assert one
  collapsible group per session, movements nested in order, toggle expands/collapses.
- **E2E** (Playwright): complete a Lectio session's four movements → open the journal →
  the sitting shows as one group containing the four movements in order.
