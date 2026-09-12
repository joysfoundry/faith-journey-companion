---
id: ACTS-199
title: Devotion Builder — make "add a prayer" prominent in the empty state (no prayers yet)
spine:
status: To Do
origin: human-directed
approved_by: JC
depends_on: []
relates_to: [ACTS-198, ACTS-190]
started_at: 2026-09-12T10:07:20-0700
updated:    2026-09-12T10:07:20-0700
latest_handoff: null
sessions: 0
---

## Goal
As someone building a devotion by hand, when there are **no prayers in it yet**, I want the
**"add a prayer"** affordance to be clearly prominent — so it's obvious how to start. Today the add
control blends into the surrounding UI (a small subtle "+") and is easy to miss on an empty devotion.

JC (2026-09-12): "Need to make the add-a-prayer section more prominent when there are no prayers
yet. It disappears and blends into [so] much that it's not clear."

## Context (where it lands)
The by-hand devotion editor renders the small inline "Add item here" `+` control (see
[`DevotionItemsEditor.tsx`](../src/components/prayer/DevotionItemsEditor.tsx) ~L260-266, and the
plus at ~L225) inside the Devotion Builder ([`import.tsx`](../src/routes/import.tsx), by-hand path).
When the list is empty, that thin insert affordance is the only entry point and reads as chrome.

## Behavior (proposed — to design)
- When the devotion has **zero** prayers/steps, show a **clear empty-state call-to-action** ("Add
  your first prayer") — a real button, not just the hairline "+", ideally with a one-line hint.
- Once at least one prayer exists, revert to the existing compact inline "+" insert affordance.
- Keep it consistent with the single-prayer and song add flows.

## Open questions for JC
- Wording: "Add your first prayer" vs "Add a prayer" vs "Start with a prayer"?
- Should the empty state also surface "Paste text" / "From a link" shortcuts, or just the add?

## Tests
No runner yet (ACTS-92). **Integration:** an empty devotion renders the prominent CTA; adding one
prayer swaps it for the compact inline insert. **E2E:** open Devotion Builder → By hand → empty
state shows a clear "add first prayer" button → click adds a prayer → compact "+" returns. Planned.
