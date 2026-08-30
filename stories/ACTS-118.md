---
id: ACTS-118
title: Decide whether Vessels needs v8's Resource fields + external-app seeds
spine: ACTS-118
status: To Do
origin: human-directed
approved_by: JC
depends_on: []
relates_to: [ACTS-117, ACTS-104, ACTS-52, ACTS-59, ACTS-71]
started_at: 2026-08-29T22:05:06-0700
updated:    2026-08-29T22:05:06-0700
latest_handoff: null
sessions: 0
---

## Goal
As the product owner, I want to decide whether the **Vessels** model should adopt PRD
v8's **Resource Directory** fields (§25D / §31A) and seed external Catholic apps, so the
Resource Directory is either **confirmed complete-via-Vessels** as-is or **extended** —
and the §25D shipped-note in `docs/ACTS-PRD.md` stops carrying an open question.

## Context
Surfaced during the v8 rebase (ACTS-117). v8 §25D specifies a curated **Resource
Directory** of external apps/ministries (Hallow, Laudate, Amen, iBreviary, Pray As You
Go, Ascension) with fields: `name, description, best_for, resource_type, organization,
url, app_store_url, play_store_url, access_model, cost_notes, tags, is_featured,
is_seeded, created_by, …`. Today the app ships **Vessels** (Vessel → Channel → Content),
and the PRD reconcile marked the Resource Directory "**complete via Vessels**." Open
question: is the current Vessels model enough, or does it need v8's resource fields +
external-app seeds?

## Acceptance criteria
- [ ] Decision recorded (one of): (a) keep Vessels as-is — Resource Directory is complete;
      (b) extend Vessels with a subset of v8 Resource fields; (c) add a distinct
      Resource/external-app concept + seeds.
- [ ] If (b)/(c): enumerate which v8 fields map onto existing Vessels fields and which are
      genuinely new; note whether external-app seeds (Hallow, Laudate, …) are wanted.
- [ ] `docs/ACTS-PRD.md` §25D shipped-note updated to reflect the decision (drop the
      "Open question for JC" line).
- [ ] If the decision implies build work, file the follow-on story/stories.

## Tests
- N/A — decision / documentation. If (b)/(c) leads to code, the resulting build story
  documents its own tests.
