---
id: ACTS-108
title: Open Prayer — free-form "from the heart" prayer component
spine: ACTS-108
status: In Progress
origin: human-directed
approved_by: JC
depends_on: []
relates_to: [ACTS-102, ACTS-104, ACTS-149, ACTS-156]
started_at: 2026-08-29T21:25:05-0700
updated:    2026-09-07T14:51:11-0700
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

**Open Prayer is a component for open dialogue.** The person prays whatever they want,
and capturing it is optional. If nothing is captured the prayer was between God and the
user alone — and the app still **saves the component as empty and completed**. Silence is
a finished prayer, not an abandoned step.

### Dictation — the requirement changed, it did not disappear (JC, 2026-09-07)
The old "Transcribe Open Prayer On/Off" (v8 §23A) assumed **we** controlled the audio —
our recording, our transcription, our toggle. On a phone none of that is ours to build:
the keyboard already dictates, and the user turns dictation on and off **at the keyboard**.

So the requirement becomes a constraint on our field rather than a feature we ship: the
capture field must be an ordinary text input that accepts keyboard dictation. Concretely —
keep it a real `<textarea>` (no `contentEditable`, no custom key handling that would swallow
dictated input), which is what `RichTextArea` already is (ACTS-156). No app-side audio,
no app-side transcription toggle, and nothing here touches Voice-Follow or Record-Session.

### Boundary with ACTS-149
ACTS-149 rides this kind (`spine: ACTS-108`). The **ACTS shape shown at the field** belongs
here. The **info button** and the **four-movement ACTS mode** (A·C·T·S as sequenced steps)
stay in ACTS-149.

## Acceptance criteria
- [ ] New `open_prayer` item kind (Template + Session), addable in the builder; compiler expands it to one session step
- [ ] Pray-mode step: pray freely, capture optional — type words, or move on having written nothing
- [ ] **An uncaptured open prayer is saved, not discarded**: the item persists with an empty body and `completion_status: "complete"`. Explicitly *unlike* the empty-Reflection reaping (ACTS-138–141) — do not prune it
- [ ] Field accepts keyboard dictation: a plain `<textarea>` (reuse `RichTextArea`), no app-side audio or transcription toggle
- [ ] The ACTS shape offered at the field for anyone unsure what to pray — header above the box (see Copy)
- [ ] Helper text says capture is optional and that the component is saved either way (see Copy)
- [ ] Optional "Save as reusable Personal Prayer" when words *were* captured
- [ ] STORAGE_KEY bump if the seed/model changes

## Decisions & doc changes (2026-09-07)

JC's clarifications this session, and where each one landed in the canonical doc. **The PRD
was patched directly** — `docs/ACTS-PRD.md` is now **v3.1**, with an *Amendments since v3*
table at the top of the doc (below the version line) recording this change so it survives
future syncs.

| Decision | PRD § patched |
| :---- | :---- |
| Dictation is the device keyboard's, toggled there — no app-side audio, transcription, or in-app toggle. The old "Transcribe Open Prayer On/Off" assumed we controlled the audio; it becomes a constraint that free-form fields accept keyboard dictation. | §23A (*Dictation — the Device Keyboard, Not an App Feature*, supersedes *Transcription Control During a Session*), §23B, §31A (dropped `transcription_enabled`, `allow_voice_input`, `default_transcription_enabled`, `transcribe_open_prayer_enabled`, `spoken_transcription`, and the `voice_transcription` capture method), §32 DoD 33 |
| An uncaptured Open Prayer saves as an empty **completed** component — never pruned, never counted unfinished. | §23A (*Open Prayer*), §23B, §32 DoD 31 |
| Offer the ACTS shape to anyone unsure what to pray; say capture is optional either way. | §23A (*Helping Someone Who Does Not Know What to Pray*) |
| The sequenced four-movement ACTS mode + info button stay out of scope here. | §23A (pointer to ACTS-149) |

Also updated: the board row ([stories/README.md](README.md)) and the backlog row
([docs/JIRA-BACKLOG.md](../docs/JIRA-BACKLOG.md)).

## Copy (draft — for JC)
Two jobs, so two places rather than one crowded one:

- **Header above the box** — the *shape*, for someone who doesn't know what to pray:
  > Adoration · Contrition · Thanksgiving · Supplication
- **Placeholder inside the box** — the *permission*, so no one feels owed a paragraph:
  > Pray in your own words. Writing them down is optional — this is saved either way.

## Tests
- **Unit** (Vitest): compiler expands an `open_prayer` item; an empty open prayer persists as an empty completed item (regression guard against the reflection prune path).
- **Integration**: add Open Prayer in the builder → renders in Pray mode with the ACTS header + placeholder; completing with no text saves an empty completed item; typing then saving offers "Save as Personal Prayer".
- **E2E**: build a session with a structured devotion + Open Prayer + Reflection; pray through it both ways — once writing a prayer and saving it as a Personal Prayer, once praying without capturing — and confirm the session history shows the open prayer as complete in both.
