---
id: ACTS-185
title: Connected entity inputs in quote capture (autocomplete + auto-Vessel + version picker)
spine:
status: In Progress
origin: human-directed
approved_by: JC
depends_on: [ACTS-183]
relates_to: [ACTS-181, ACTS-186]
started_at: 2026-09-10T12:42:51-0700
updated:    2026-09-10T12:42:51-0700
latest_handoff: null
sessions: 0
---

## Goal
As someone capturing a quote, I want the boxes where I name a person or a work to
**autocomplete against what's already in the app and link to it**, and attributing to a
person to **create a Vessel**, so my quotes connect into the graph instead of piling up as
disconnected free text. (First slice of the [[connected-entity-inputs]] principle; the
app-wide sweep is ACTS-186.)

## Acceptance criteria
- [x] Reusable **`EntitySuggestInput`** typeahead (`src/components/knowledge/`) — suggests
      matching entities as you type; **Tab / Enter / click** accepts the highlighted one,
      arrows move it, Esc dismisses; the list clears on an exact match.
- [x] Composer "Add a quote" **"From"** autocompletes existing **Vessels**; on save it
      **find-or-creates a Vessel** by that name (reuse if it exists) and sets `voice_id` —
      attribution always yields a Vessel, not a free-text `creator`.
- [x] Composer **book/article "source"** autocompletes existing **content** ("bi" → Bible)
      and **links** the quote (`source_item_id`) when the name matches one.
- [x] The unclear **"Make a Vessel"** button was removed from the quote editor (redundant now
      that attribution auto-creates a Vessel).
- [x] **"What inspired this"** quote cards drop the redundant bold title — they show the
      **Vessel + the quote body** only.
- [x] Composer scripture branch has a **Version picker** (the 9 translations + Unknown)
      defaulting to the reader's **Settings** translation; the picked "Bible — X" book is the
      quote's `source_item_id`. Citation placeholders **spell out "Luke"** (not "Lk").

## Tests
No runner yet (ACTS-92). Verified live in the running app (background tabs, no data saved to
JC's store): From "an" → Ana Munley/St. Francis de Sales, Tab accepted; a saved quote
find-or-created its Vessel (voice_id set, no creator) then cleaned up; book source "bi" →
Bible + versions; inspiration cards showed voice + body, no bold title. Composer version
picker + "Luke" placeholders pending JC's own verification before Done.
- **Unit**: `EntitySuggestInput` filtering (substring, exclude exact); the find-or-create
  helpers. Planned.
- **Integration**: composer add-quote → Vessel created/reused + `source_item_id` linked;
  scripture version → correct Bible book. Planned.
- **E2E**: extends flow **E12** (Formation / Knowledge) + the reflection compose flow. Planned.
