---
id: ACTS-134
title: Reflection capture by voice note + photo→OCR (media pipeline)
spine:
status: To Do
origin: human-directed
approved_by: JC
priority: low
depends_on: []
relates_to: [ACTS-103, ACTS-102]
sync: local
synced_at: null
started_at: null
updated: 2026-09-02T00:00:00-0700
latest_handoff: null
sessions: 0
---

## Goal
As a journaler, I want to **capture reflections by voice** (record → transcribe into
the entry) and by **photographing a paper journal** (OCR'd into text), so that I can
reflect however I prefer to journal, not just by typing.

_Split from ACTS-103 (2026-09-02). ACTS-103 delivered part (A), the inspiration-in-view
panel; this is part (B), the two media-capture paths. Both ride the deferred **Cloud
media phase** (audio/image storage + transcription + OCR), which is why they were
separated — they are blocked on that pipeline, whereas (A) was not._

## Motivation & current state
- `ReflectionMode` **already has `"spoken"`** ([`types.ts:581`](../src/lib/prayer/types.ts));
  what's missing is the audio-attachment pipeline behind it.
- The composer's **Camera button is already present but disabled** ("Photos land with the
  Cloud phase") ([`ReflectionComposer.tsx:147`](../src/components/home/ReflectionComposer.tsx));
  `photo_count` is reserved on `Reflection` ([`types.ts:607`](../src/lib/prayer/types.ts)).
- `body` is plain text, so both transcription and OCR output slot straight in with no
  schema change to the text itself — the schema work is attachment storage/metadata.

## Scope (two capture paths)
1. **Voice note.** Record → store audio → transcribe into `body`; save with
   `mode: "spoken"`; keep the audio as an attachment.
2. **Photo → OCR.** Capture/attach an image → OCR into `body` (prefill, editable); keep
   the source image as a photo attachment (`photo_count`).

Both need the media pipeline: where audio/image bytes live (Supabase storage vs. other),
the transcription provider, and the OCR provider. **These are external-contract decisions
— flag and confirm the provider/storage choices with JC before building.**

## Acceptance criteria (draft — refine when picked up)
- [ ] **Voice capture** records a note, transcribes it into `body`, saves with
      `mode: "spoken"`, and retains the audio attachment.
- [ ] **Photo → OCR** captures/attaches an image, OCRs it into an editable `body`, and
      keeps the image as an attachment (`photo_count` reflects it).
- [ ] Transcription/OCR failures degrade gracefully (entry still saveable by hand).
- [ ] Existing reflections and links continue to render unchanged.

## Open questions
- Storage location + retention for audio/images (privacy — this is personal journaling).
- Transcription + OCR provider(s); on-device vs. cloud; cost.
- Whether transcription toggle is distinct from Voice-Follow / Record elsewhere in the app.

## Tests
_Convention (ACTS-91): document when picked up. Planned; harness = ACTS-92._
- **Unit**: transcription/OCR adapters map source → `body` (mockable boundary).
- **Integration**: voice and photo capture flows set the expected `mode` / attachment /
  `body`; failure path leaves a hand-editable entry.
- **E2E**: record a voice note → transcript saved with `mode:"spoken"`; photograph a
  page → OCR text becomes the entry body, image retained.
