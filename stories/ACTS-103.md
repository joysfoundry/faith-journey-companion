---
id: ACTS-103
title: Reflection redesign — inspiration-in-view panel + voice note & OCR capture
spine:
status: To Do
origin: human-directed
approved_by: JC
priority: low
depends_on: []
relates_to: [ACTS-102]
sync: local
synced_at: null
started_at: null
updated: 2026-08-29T13:38:48-0700
latest_handoff: null
sessions: 0
---

## Goal
As a journaler, I want the Reflection experience to **show the inspiration in plain
sight** while I write, and to let me **capture reflections by voice or by photographing
a paper journal** (OCR'd into text), so that reflecting is grounded in the source and
works however I prefer to journal.

_Stub — architecturally vetted (2026-08-29), not yet built. Split candidate: (A)
inspiration/view panel vs. (B) voice + OCR capture, since B depends on the media
pipeline. Likely **low priority / near-future**._

## Motivation & current state
- Home reflections are **timestamped precisely** (`created_at`) but the **source tag is
  only as specific as what you manually link** — with a weak generic fallback
  (`target_type: "intention"`) when nothing is linked
  ([`ReflectionComposer.tsx:91`](../src/components/home/ReflectionComposer.tsx)). Nothing
  auto-links a reflection to "today's reading."
- All reflections already live in **one store** (`db.reflections`) and the page already
  sorts newest-first and renders each entry's source links
  ([`reflections.tsx:250`](../src/routes/reflections.tsx),
  [`reflections.tsx:62`](../src/routes/reflections.tsx)). This redesign makes those
  entries **richer to view and to capture** — it does not fragment the store.

## Scope (three goals) + architectural check
1. **Inspiration-in-view panel.** A reflection tab with the text box plus a panel below
   that shows *what inspired the entry* — the daily reading text, the session, or a
   pasted book passage. Entities (daily reading, session, Mass) **resolve by
   `target_id`**. Non-entity sources (a **book passage** typed/pasted) have nothing to
   resolve → **add an optional `excerpt` (snapshot text) to `ReflectionLink`**; the
   panel renders the resolved entity *or* the stored excerpt, whichever is present.
   This is the one real schema decision (pointer vs. snapshot).
2. **Voice note.** `ReflectionMode` **already has `"spoken"`**
   ([`types.ts:526`](../src/lib/prayer/types.ts)). Missing = the **audio-attachment
   pipeline**: record → store audio → transcribe into `body`. Same deferred "Cloud
   media phase" the Camera button waits on
   ([`ReflectionComposer.tsx:147`](../src/components/home/ReflectionComposer.tsx)).
3. **OCR of a paper journal photo.** `body` is plain text, so OCR output slots straight
   in; keep the source image as a photo attachment (`photo_count` already reserved).
   Needs: image capture + OCR → prefill `body`. Rides the same media pipeline as voice.

## Relationship to ACTS-102
Independent and non-conflicting. ACTS-102 makes Lectio movements create ordinary
`Reflection`s via the **dual-link** model; this story then makes *all* reflections
(Lectio, daily-reading, book, standalone) richer to view and capture. The
inspiration panel reads from exactly the links ACTS-102 sets.

## Acceptance criteria (draft — refine when picked up)
- [ ] Reflection tab shows the composer with an **inspiration panel** that resolves a
      linked entity's content, or renders a stored `excerpt` for pasted/book sources.
- [ ] `ReflectionLink` gains an optional `excerpt` snapshot; composer can capture it for
      non-entity sources (paste a book passage) — additive, no break to existing links.
- [ ] **Voice capture** records a note, transcribes it into `body`, saves with
      `mode: "spoken"` (audio media handling per the Cloud media phase).
- [ ] **Photo → OCR** captures/attaches an image, OCRs it into `body`, keeps the image
      as an attachment.
- [ ] Existing reflections and links continue to render unchanged.

## Tests
_Convention (ACTS-91): document when picked up. Planned; harness = ACTS-92._
- **Unit**: link-resolution selector (entity id → content vs. `excerpt` fallback);
  OCR/transcription adapters map source → `body` (mockable boundary).
- **Integration**: composer renders the inspiration panel for each source type; voice
  and photo capture flows set the expected `mode` / attachment / `body`.
- **E2E**: link a daily reading → its text shows in the panel; paste a book passage →
  excerpt persists and re-renders; record a voice note → transcript saved; photograph a
  page → OCR text becomes the entry.
