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
- [x] New `open_prayer` item kind (Template + Session), addable in the builder; compiler expands it to one session step
- [x] Pray-mode step: pray freely, capture optional — type words, or move on having written nothing
- [x] **An uncaptured open prayer is saved, not discarded**: the item persists with an empty body and `completion_status: "complete"`. Explicitly *unlike* the empty-Reflection reaping (ACTS-138–141) — do not prune it
- [x] Field accepts keyboard dictation: a plain `<textarea>` (reuse `RichTextArea`), no app-side audio or transcription toggle
- [x] The ACTS shape offered at the field for anyone unsure what to pray — header above the box (see Copy)
- [x] Helper text says capture is optional and that the component is saved either way (see Copy)
- [x] **Seeded as a daily-startable devotion** — "Open Prayer" (`tpl-open-prayer`), one component, choosable like any other devotion (JC, 2026-09-07)
- [x] STORAGE_KEY bump — v39 → v40 (new seeded devotion)
- [ ] Optional "Save as reusable Personal Prayer" when words *were* captured — **not built yet**

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

## Copy (shipped — refine freely)
Three jobs, three places, so none of them is crowded:

- **Header above the box** — the *shape*, for someone who doesn't know what to pray:
  > Adoration · Contrition · Thanksgiving · Supplication
- **Placeholder inside the box** — short, so the field still reads as somewhere to write:
  > Pray in your own words…
- **Helper text under the box** — the *permission*, including JC's point that the app is
  not the prayer (2026-09-07):
  > Writing it down is optional — either way this is saved when you finish. You can always
  > talk and pray to God without this app, and without keeping any record. Capturing here is
  > just one way to be intentional about it.
- **Builder tip** (shown under an Open prayer component in the Session/Devotion builder):
  > Makes room for unstructured prayer inside the devotion — the person prays in their own
  > words, and writing it down is always optional. Anyone can talk and pray to God without
  > this app or any record; this is only here for someone who wants to be more intentional
  > about their devotion.
- **Seeded devotion note** (`tpl-open-prayer`), same idea at devotion scale:
  > You can always talk and pray to God — you need no app, and nothing needs to be written
  > down or tracked. This devotion simply sets aside the space…

## What shipped (session 1)

| Area | File |
| :---- | :---- |
| `open_prayer` kind, both unions | `src/lib/prayer/types.ts` |
| Compiles to one step; counts toward progress | `src/lib/prayer/compiler.ts` |
| `saveSessionOpenPrayer` (completes even when empty) + `reopenSessionOpenPrayer` | `src/lib/prayer/store.ts` |
| `OpenPrayerCard` — ACTS header, field, helper text, "I prayed this" / "Save" / "Re-open" | `src/routes/session.$sessionId.tsx` |
| Read-only rendering (Prayer Mode + guest follow) | `src/components/prayer/ItemView.tsx` |
| Add-menu entry, defaults, prompt field, builder tip | `src/components/prayer/DevotionItemsEditor.tsx` |
| Seeded "Open Prayer" devotion (`tpl-open-prayer`) | `src/lib/prayer/seed.ts` |
| **Share privacy fix** — `configuration` allowlist | `src/lib/prayer/share.ts` |

**The words live on the session item** (`configuration.open_prayer`), not in the reflections
journal: an open prayer is speech *to* God, not a journal entry about it. Verified in the
browser that saving one creates **zero** Reflection records.

### Share leak found and fixed (pre-existing, ACTS-94)
`toShareItem` claimed to keep "nothing session-local or identifying" but copied
`configuration` **wholesale** — so sharing a Lectio session you had journaled in published
your written reflection to anyone with the link. Open Prayer would have leaked the same way,
so `toShareItem` now uses an **allowlist** of the keys the guest view needs to render the
devotion (`decade`, `heading`, `presentation`, `fruit`, `scripture_text`, `external_options`,
`segment_labels`). A new private key is now private by default rather than by remembering.
Worth its own backlog row for the reflection half of the fix (shipped links already sent).

## Verified (browser, dev server)
No test runner yet (ACTS-92), so this was checked by hand in Prayer Mode:

- `tsc --noEmit` clean; `vite build` succeeds; eslint clean on changed files (two pre-existing
  prettier errors in `DevotionItemsEditor.tsx` were fixed incidentally by formatting).
- Seeded **Open Prayer** appears in the devotion picker; building from it yields one step.
- **Uncaptured path**: "I prayed this" on an empty field → badge reads **PRAYED**, progress
  **1 / 1**, and localStorage holds `{ open_prayer: "", completion_status: "complete" }` —
  saved, not pruned.
- **Written path**: typing + Save → badge **SAVED**, text persisted, `db.reflections.length === 0`.
- **Re-open** returns the step to pending, keeping the text.
- **Share stripping**: `toShareItem` on an item carrying `open_prayer`, `response` and
  `reflection_id` emits only `{ decade }` — the private keys are gone.
- No console errors.

## Tests
- **Unit** (Vitest): compiler expands an `open_prayer` item; an empty open prayer persists as an empty completed item (regression guard against the reflection prune path).
- **Integration**: add Open Prayer in the builder → renders in Pray mode with the ACTS header + placeholder; completing with no text saves an empty completed item; typing then saving offers "Save as Personal Prayer".
- **E2E**: build a session with a structured devotion + Open Prayer + Reflection; pray through it both ways — once writing a prayer and saving it as a Personal Prayer, once praying without capturing — and confirm the session history shows the open prayer as complete in both.
