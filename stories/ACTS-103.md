---
id: ACTS-103
title: Reflection redesign — inspiration-in-view panel + voice note & OCR capture
spine:
status: In Progress
origin: human-directed
approved_by: JC
priority: low
depends_on: []
relates_to: [ACTS-102]
sync: local
synced_at: null
started_at: 2026-09-02T00:00:00-0700
updated: 2026-09-02T00:00:00-0700
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

## Scope decision (2026-09-02, session 01)
Split into (A) and (B), per the vetted note. **This story = (A) only.** Part (B)
(voice + OCR, blocked on the Cloud media phase) moved to **[ACTS-134](ACTS-134.md)**.
The organization layer JC raised in the design walkthrough (optional themes, no-AI tag
suggestions, group-by Date/Theme/Source) is **[ACTS-135](ACTS-135.md)**. A small
**asc/desc date sort** toggle was folded into this session (same page, no schema change).

## Acceptance criteria
- [x] Reflection tab shows the composer with an **inspiration panel** that resolves a
      linked entity's content, or renders a stored `excerpt` for pasted/book sources.
- [x] `ReflectionLink` gains an optional `excerpt` snapshot; composer can capture it for
      non-entity sources (paste a book passage) — additive, no break to existing links.
- [x] New `passage` link target for a pasted book/quote source (models it honestly
      instead of reusing `intention`).
- [x] Journal list has an **asc/desc date sort** toggle (folded in this session).
- [x] Existing reflections and links continue to render unchanged (all fields additive;
      no `STORAGE_KEY` bump needed).
- [→] **Voice capture** (`mode: "spoken"`) — moved to [ACTS-134](ACTS-134.md).
- [→] **Photo → OCR** — moved to [ACTS-134](ACTS-134.md).

## Tests
_Convention (ACTS-91): no runner wired (harness = ACTS-92)._
- **Unit** — `resolveInspiration` (`src/lib/prayer/inspiration.ts`): **verified** via a
  standalone Node `--experimental-strip-types` harness against the real code — 19
  assertions, all passing (passage excerpt trim; learning → voice-name detail + favorite
  href + quote/body text; missing id → label fallback; session; mass label/detail/notes;
  daily_reading = reference only, no text; intention excerpt). To be ported when ACTS-92
  lands a Vitest runner.
- **Integration** (planned): composer renders the inspiration panel per source type;
  passage add/remove; sort toggle flips order.
- **E2E** (planned): paste a book passage → excerpt persists and re-renders in the panel;
  link a session/knowledge item → reference card shows; flip asc/desc.
- **Browser verify** (done, session 01): added a `passage` ("Story of a Soul" + excerpt)
  → chip + live "What inspired this" panel appeared; saved with a body; reopened the
  entry → detail dialog resolved and rendered the panel (excerpt round-trips through the
  store); sort toggle flips "newest ↔ oldest first". Fixed a latent bug found in the
  process: `IconBtn` didn't forward its ref, so the Radix passage popover anchored
  off-canvas — now `forwardRef` + prop-spread (also fixes the pre-existing Link popover).
