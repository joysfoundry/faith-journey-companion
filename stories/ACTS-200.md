---
id: ACTS-200
title: Schedule belongs to session building, not devotion creation
spine:
status: To Do
origin: human-directed
approved_by: JC
depends_on: []
relates_to: [ACTS-198, ACTS-173, ACTS-166, ACTS-107]
started_at: 2026-09-12T10:07:20-0700
updated:    2026-09-12T10:07:20-0700
latest_handoff: null
sessions: 0
---

## Goal
As someone creating a devotion, I should **not** be asked to set a schedule as part of building the
devotion itself — a devotion is a reusable template of prayers, and *when* to pray it is a property
of a **session/plan**, not the devotion. The schedule UI should appear **when building a session
from a devotion**, not during devotion creation.

JC (2026-09-12): "For devotion building, schedule should not be a part of the devotion creation —
only session building. It should appear however if you are building a session from a certain
devotion, but not to create the devotion."

## Context (where it lands)
The Devotion Builder ([`import.tsx`](../src/routes/import.tsx)) currently detects and shows a
**"Default schedule"** on the devotion draft: `detectRecurrence(...)` (~L304) writes
`importDraft.devotion.recurrence`, and the review step renders a Default-schedule editor
(`recurrenceFields` / `buildRecurrence`, ~L452-465). That puts a schedule on the **devotion**.
The session-building path (Home "New session" / `session_plans`, see ACTS-173/166) is where a
`date`/recurrence should actually be chosen.

## Behavior (proposed — to design)
1. **Remove** the schedule/recurrence step from devotion **creation** (don't collect or persist a
   recurrence on the devotion draft during the builder flow).
2. **Show** the schedule when **building a session from a devotion** (the plan/scheduling step),
   pre-fillable from any detected default.
3. **Migration/decision:** what happens to `recurrence` already stored on existing devotions/
   templates? (Keep as a *suggested default* surfaced only at session time, vs drop.) Flag before
   changing the data model.

## Open questions for JC
- Keep `detectRecurrence` as a **suggested default** offered at session-build time (nice), or drop
  schedule detection entirely from the builder?
- Do any existing flows rely on a devotion carrying its own recurrence (e.g. the daily-rosary/novena
  paths, ACTS-166/173/99)? Audit before removing.
- Single-prayer add flow: same treatment (no schedule at creation)?

## Tests
No runner yet (ACTS-92). **Unit:** builder draft no longer carries a recurrence after create.
**Integration:** devotion creation shows no schedule step; building a session from that devotion
shows the schedule (optionally pre-filled). **E2E:** create a devotion (no schedule asked) → start a
session from it → schedule step appears → plan saved with the chosen date. Planned.
