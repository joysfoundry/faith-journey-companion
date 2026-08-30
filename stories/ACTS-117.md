---
id: ACTS-117
title: Rebase ACTS-PRD onto v8 + apply the gap-review reconcile checklist
spine: ACTS-117
status: In Progress
origin: human-directed
approved_by: JC
depends_on: []
relates_to: [ACTS-104, ACTS-108, ACTS-109, ACTS-110, ACTS-115]
started_at: 2026-08-29T21:32:33-0700
updated:    2026-08-29T21:32:33-0700
latest_handoff: stories/ACTS-117/session-01.md
sessions: 1
---

## Goal
As the product owner, I want the canonical PRD (`docs/ACTS-PRD.md`) **rebased onto
PRD v8** (the correct, fuller base) with my structural work re-applied and the code
reality reflected, so there is one trustworthy PRD that matches both v8 and the app.

## Context
The current `docs/ACTS-PRD.md` (v2) was built on an **old** PRD base. JC supplied the
real **v8** (`~/Downloads/ACTS_Final_Build_Ready_PRD_v8.docx.md`). The reconcile
checklist + JC's decisions live in [`docs/V8-CODE-GAP.md`](../docs/V8-CODE-GAP.md).

## Acceptance criteria (draft)
- [ ] v8 becomes the content base of `docs/ACTS-PRD.md` (single canonical `.md` — no `-vN.md` copies; git history holds prior; bump the in-doc stamp to v3)
- [ ] Re-apply the structural work: Mission (draft) · two-part Business/Technical flow · Solution-Idea/ACTS framing · the `[Shipped]/[Partial]/[Future]` "What's shipped today" inventory · shipped-notes
- [ ] Apply the reconcile notes from V8-CODE-GAP.md: **built features each get a PRD section (esp. where they augment/replace a v8 section)**; Vessels = label (Faith Learning/Life Library = description); Resource Directory = complete via Vessels; Session Purpose described as the name field that exists; Pope is seeded
- [ ] Add the shipped-but-absent-from-v8 sections: Share/Follow-along, Lectio Divina, Bible settings, selectable Mystery bodies, Song
- [ ] Branding stays: Faith Journey = umbrella placeholder, ACTS = app name (umbrella TBD)
- [ ] Export a fresh versioned `.docx` for the Google copy

## Tests
- N/A — documentation. Verify by cross-checking every v8 §, the code, and the gap table.
