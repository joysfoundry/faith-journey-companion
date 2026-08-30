---
id: ACTS-116
title: ACTS status dashboard + signal-ingestion workflow (built vs. suggested)
spine: ACTS-116
status: To Do
origin: human-directed
approved_by: JC
depends_on: []
relates_to: [ACTS-104, ACTS-105]
started_at: 2026-08-29T21:40:00-0700
updated:    2026-08-29T21:40:00-0700
latest_handoff: null
sessions: 0
---

## Goal
As the product owner, I want a **living status dashboard** for the project — and a
**workflow that ingests new signals** and places them against what's built — so at a
glance I can see what's shipped, what's partial, what's missing, and what's *suggested*
to build next, and act on it.

## Origin
JC, reacting to the v8↔code gap-review artifact (`52984cdd`): *"I like these components
for the ACTS dashboard, and then maybe a link to an editable doc. For CRAVE we'll have
new signals coming in, so this is a great start to incorporate a workflow to ingest new
signals, compare to what is built, what is suggested to be built, etc."*

## Components JC liked (reuse from the gap-review artifact)
- **Status stat tiles** — Built / Partial / Not-built / Total counts across the surface.
- **Status buckets** — e.g. *Missing & no story* · *Shipped, absent from the PRD* · *Naming / drift*.
- **A link to an editable doc** — the worksheet pattern: edit comments in the pane, it
  saves back (the `artifact` runtime capability), so notes become actions.

## The bigger idea — a signal-ingestion workflow
The dashboard is the **front-end**; behind it is a repeatable loop:
1. **Ingest new signals** — incoming ideas, PRD/vision changes, feature requests, research,
   user feedback (for **CRAVE**, these arrive continuously).
2. **Compare to what's built** — reconcile each signal against the code surface + backlog
   (this is exactly the `/prd-sync` "what's shipped" inventory + the v8↔code gap method).
3. **Classify** — Built · Partial · Not built · **Suggested to build** (new), with a story link
   or a "no story → candidate to file" flag.
4. **Surface + act** — render the dashboard; let JC comment/decide in-place; spin decisions
   into stories.

This is the same engine as **ACTS-105** (`/prd-sync` → "canon / doc sync") generalized to a
**continuous signal feed**, and it's how the workflow reaches **CRAVE**. Keep the two aligned:
ACTS-105 = the doc/canon reconcile; ACTS-116 = the dashboard + signal intake on top of it.

## Acceptance criteria (draft — refine with JC)
- [ ] Dashboard renders live status (tiles + buckets) from a project's build ledger + code map
- [ ] An editable, save-back worksheet layer for JC's decisions
- [ ] A defined "ingest a new signal → classify vs. built → suggest" step
- [ ] Works for a second project (CRAVE) with its own signals
- [ ] Suggested-to-build items can be turned into stories

## Tests
- N/A for now (shape exploration). Revisit once the data source + render surface are chosen.
