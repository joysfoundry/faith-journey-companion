---
id: ACTS-140
title: Group the journal by Lectio sitting (fold a session's movements together)
spine:
status: Done
origin: human-directed
approved_by: JC
depends_on: []
relates_to: [ACTS-102, ACTS-103, ACTS-138, ACTS-139, ACTS-135]
started_at: 2026-09-03T16:13:11-0700
updated: 2026-09-03T22:38:19-0700
latest_handoff: stories/ACTS-140/session-01.md
sessions: 1
---

## Goal
As a person who prays Lectio Divina, I want each **Lectio sitting** to read as **one**
journal item — its four movements (Read / Reflect / Respond / Rest) folded together —
instead of four loose entries scattered through the journal, so a day's Lectio is one
reflective unit I can revisit whole. And since Lectio sessions no longer appear in the
free-write link picker (ACTS-138), the **Journal is now where I see and resume my Lectio
sittings** — including one I started but haven't finished.

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
- **Resume affordance (JC, 2026-09-03):** the sitting group links back to its session
  (`/session/$sessionId`) so an **in-progress** Lectio can be resumed from the Journal —
  this is the home for seeing/resuming sittings now that the link picker excludes them
  (ACTS-138). Interacts with ACTS-141 (don't list an *empty* sitting with no journaling).

## Open questions — resolved (JC, 2026-09-03)
- Grouping: **always-fold** (no new group-by pill), across Date + Theme + Source.
- Heading: `Lectio Divina · <date>` with the passage citation when set; and when the
  reader **pasted** the passage text, show it at the top of the expanded sitting.
- Collapsed: a movement-count summary (`N movements`) — kept "N movements" over "N of M".

## Acceptance criteria
- [x] A Lectio sitting renders as one collapsible group; its movements are nested, in step order.
- [x] No entry is double-counted (the Source double-push problem does not recur here).
- [x] Multiple sittings are distinct groups (keyed by session id, not shared title).
- [x] Non-Lectio reflections and existing Date / Theme / Source groupings still work.
- [x] A sitting group offers a way to reopen/resume its session (`/session/$sessionId`).
- [x] No data-model change (uses the existing `prayer_session` / `session_item` links); no
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
