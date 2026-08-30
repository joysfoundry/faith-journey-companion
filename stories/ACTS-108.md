---
id: ACTS-108
title: Open Prayer — free-form "from the heart" prayer component
spine: ACTS-108
status: To Do
origin: human-directed
approved_by: JC
depends_on: []
relates_to: [ACTS-102, ACTS-104]
started_at: 2026-08-29T21:25:05-0700
updated:    2026-08-29T21:25:05-0700
latest_handoff: null
sessions: 0
---

## Goal
As someone praying, I want an **Open Prayer** component — my own words addressed to
God — so a Session can hold spontaneous prayer alongside structured prayer, always
with the option to keep Scripture in the flow.

## Context
From the v8↔code gap review (JC: "create story"). PRD v8 §23A/§23B. **Not built:**
there is no `open_prayer` kind in `TemplateItemKind` / `SessionItemKind`
(`src/lib/prayer/types.ts`). Distinct from `intention`/`petition` and from
Reflection (Open Prayer = words *to God*; Reflection = my own words *about* what I
noticed). Overlaps the Meditate → Open Prayer → Reflect flow that Lectio (ACTS-102)
already gestures at.

## Acceptance criteria (draft)
- [ ] New `open_prayer` item kind (Template + Session), addable in the builder
- [ ] Capture moments: write now · speak→transcribe · leave open until prayer time · pray without capture
- [ ] Optional "Save as reusable Personal Prayer" after praying
- [ ] Transcription toggle kept distinct from Voice-Follow / Record-Session (v8 §23A)
- [ ] STORAGE_KEY bump if seed/model changes

## Tests
- **Unit** (Vitest): compiler expands an `open_prayer` item; capture-method transitions.
- **Integration**: add Open Prayer in builder → renders in Pray mode with capture options.
- **E2E**: build a session with a structured devotion + Open Prayer + Reflection; pray through it.
