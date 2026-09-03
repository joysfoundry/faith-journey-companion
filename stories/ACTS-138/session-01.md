---
story: ACTS-138
session: 01
wrapped_at: 2026-09-03T15:16:51-0700
status: Done
final: true
---

## What happened
Shipped the guided-Lectio entry point on the Reflection surface, plus the polish that
came out of JC's review. All in the shared `ReflectionComposer`, so Home and
`/reflections` stay in parity.

- **Entry card** — a "Reflect with Scripture · Lectio Divina · read, reflect, respond,
  rest" card above the free-write composer. The whole card is the tap target; **Begin**
  calls `startSession(LECTIO_TEMPLATE_ID, { date, progress_mode: "scroll" })` and navigates
  to `/session/$sessionId`. Frictionless — one tap into a fresh session; the passage is
  chosen in-session (reuses the ACTS-102 Lectio end-to-end; no new model, no `STORAGE_KEY`
  bump).
- **Picker exclusion** — a launched Lectio creates a session, which was appearing in the
  free-write "Link an item" picker (and surfaced abandoned empties). Excluded Lectio
  sessions/plans from `buildReflectionLinkables` ([`linkables.ts`](../../src/lib/prayer/linkables.ts)):
  a Lectio is a *container* of journaling, not an inspiration to tag a note with.
- **Focus-on-write collapse** — once the body has text, the Lectio card + "or write freely
  below" divider collapse, leaving a clean journaling space.
- **Icon + copy** — icon book → **Flame**; divider "or jot a thought" → "or write freely
  below"; body placeholder → "What's on your heart today?"; title placeholder → "Title or
  Subject (optional)"; `/reflections` subtitle (was duplicative) →
  **"Scripture Guided Writing or Inspired Free Writing"** (parallel Title Case).

Two review threads were spun into follow-ups (not folded in): **ACTS-140** (Journal is the
home for seeing/resuming Lectio sittings, grouped by sitting) and **ACTS-141** (don't
leave empty Lectio sessions behind when Begin is abandoned). De-crowd tabs = **ACTS-139**.

## Verified (and how)
Own dev server (`preview_start` → :8080), browser-driven:
- Entry card renders on Home and `/reflections`; **Begin** opens Prayer Mode → "Lectio
  Divina", 0 / 4, all four movements, empty passage picker at open.
- Link picker under Prayer & devotion no longer lists Lectio (only the daily rosary).
- Typing in the body collapses the card + divider to a focused composer; theme
  suggestions still fire.
- All copy strings confirmed on screen (flame, divider, placeholders, subtitle).
- `tsc --noEmit` clean and `eslint` clean after every change.

All acceptance criteria met. Note: full Lectio journaling round-trip into the journal is
ACTS-102 behavior (already verified there); this story didn't change that path.

## Git state at handoff
Committed to `main`, **push pending** (local pushes failing on auth/network — flush from
JC's git client). ACTS-138 commits:
`752a4b8` (entry card), `b62164c` (picker exclusion), `67d3817` (flame + collapse + copy),
`08af614` (Title/Subject + subtitle), `721524e` (final subtitle wording); docs `bb04877`,
`5ee6020` + this handoff. `.env` left untracked-dirty (unrelated).

## Next
Story complete. Follow-ups live as ACTS-139 / 140 / 141. To publish: `git push origin main`.
