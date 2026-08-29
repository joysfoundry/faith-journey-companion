---
id: ACTS-102
title: Lectio Divina session — reflection as a first-class session step
spine:
status: Done
origin: human-directed
approved_by: JC
depends_on: []
relates_to: [ACTS-103]
sync: local
synced_at: null
started_at: 2026-08-29T13:38:48-0700
updated: 2026-08-29T15:03:49-0700
latest_handoff: stories/ACTS-102/session-01.md
sessions: 1
---

## Goal
As a person praying, I want a guided **4-movement Lectio Divina session** (Read →
Reflect → Respond → Rest) where each movement pairs a **scripture reading** with a
**journaling prompt**, so that I read Scripture for transformation and capture my
response inline — without leaving the session.

Source: unhurriedliving.com (Alan & Gem Fadling) — Lectio Divina instructions +
journal PDFs. The four movements and their journaling prompts:

| Movement | Read Scripture | Journal prompt |
|---|---|---|
| **Read (Lectio)** | Read aloud once; notice a phrase | Write a phrase or two from the passage |
| **Reflect (Meditatio)** | Read aloud again; what captures you | Write your feelings, thoughts, insights |
| **Respond (Oratio)** | Read aloud a third time; what's in your heart | Write your prayer response to the passage |
| **Rest (Contemplatio)** | Rest in God's presence; no agenda | After resting, write what you noticed / any invitations |

## Design — the core gap this closes
Lectio is a **session + prayer + reflection**. The Reflection *entity* already exists
and is rich enough (`mode`, `ReflectionLink` with targets `prayer_session` /
`session_item`, [`src/lib/prayer/types.ts:529`](../src/lib/prayer/types.ts)). What's
missing is that a **session step cannot *be* a journaling prompt** — there is no
`reflection` kind in `TemplateItemKind` / `SessionItemKind`
([`types.ts:196`](../src/lib/prayer/types.ts), [`types.ts:413`](../src/lib/prayer/types.ts)),
and the player never captures a written reflection mid-session.

**Approach (chosen by JC): add `reflection` as a first-class step kind.**

**Reflection architecture — how a Lectio session stores its journaling** (this is the
contract the reflection page + future AI work read from; see ACTS-103):
- **One `Reflection` per movement**, saved to the single `db.reflections` store — the
  *same* store as every other reflection ([`store.ts:1172`](../src/lib/prayer/store.ts)).
  A Lectio reflection is not a separate thing; it is a normal `Reflection` **tagged**
  by its links, and it flows into the newest-first journal list automatically
  ([`reflections.tsx:250`](../src/routes/reflections.tsx)).
- **Dual-link each entry** — `ReflectionLink[]` carries **both**
  `{ target_type: "session_item", target_id: <movement>, label: "Reflect (Meditatio)" }`
  **and** `{ target_type: "prayer_session", target_id: <session> }`. This gives
  **granularity** (which movement) *and* **grouping** (all 4 belong to one sitting)
  without choosing between them. The `label` is the semantic tag AI can slice by later.
- **No schema change to `Reflection` itself.** The only model change is adding the
  `reflection` step kind + carrying its prompt text on the step (reuse `body` / `label`).

**Passage selection** — the passage is chosen **per session at start** (not hard-coded
into the devotion); movements 1–3 re-read that *same* passage, movement 4 is rest. A
sensible default (e.g. a psalm or a gospel story) is fine, but the user must be able to
set the passage for the sitting.

## Acceptance criteria — all met (Done 2026-08-29, session-01)
- [x] A `reflection` step kind exists in `TemplateItemKind` **and** `SessionItemKind`;
      the compiler carries it from template → session (STORAGE_KEY bump per the
      versioning gotcha — now v29).
- [x] In the session player, a `reflection` step renders its **prompt + an inline
      written-response field**; saving creates a `Reflection` (`mode: "written"`)
      **dual-linked** to that `session_item` and the parent `prayer_session`, and the
      entry appears in the reflection journal.
- [x] A seeded **Lectio Divina** devotion with the 4 movements — each = a titled
      instruction card + scripture step (same passage, re-read) + a movement-specific
      journaling prompt matching the Fadling/unhurriedliving journal, ending with "Rest".
- [x] The passage is **chosen per session up front** (empty at open, not hard-coded);
      movements 1–3 re-read that same passage. Reference-only + "Open in your Bible"
      (no embedded text), with optional paste-the-text that propagates to all readings.
- [x] Additive only — existing non-reflection sessions and the standalone reflection
      journal are unaffected.
- [x] Verified in the browser preview end-to-end (write → journal entry with movement +
      session tags; passage change propagates).

**Refinements added on JC's direction (session-01):** empty-at-open passage + paste
propagation + Open-your-Bible; reading instructions moved to titled cards (like Rest);
redundant Rest heading removed; "How to Pray Lectio Divina" How To with 5 links;
"Source: …" line at the top of the session header, **read from the devotion's own
source record** (editable in the Devotion Builder → Source; defaults to Unhurried
Living). See [session-01](ACTS-102/session-01.md).

## Tests
_Convention (ACTS-91): document coverage; no runner yet (harness = ACTS-92) →
**planned**._
- **Unit** (Vitest — pure `src/lib/**`): compiler expands a template with a
  `reflection` item into a session `reflection` item (kind carried, prompt preserved);
  the Lectio seed produces 4 movements in order with correct prompts; the dual-link
  builder attaches both `session_item` + `prayer_session` links with the movement label.
- **Integration** (Testing Library): player renders a `reflection` step with prompt +
  textarea; saving calls `addReflection` with `mode: "written"` and both links; the
  reflection then renders in the journal list with its source tags.
- **E2E** (Playwright — see the plan): start the Lectio devotion → set a passage →
  step through the 4 movements writing a note in each → finish → open Reflection page
  and see 4 entries grouped to the session, each labeled by movement.
