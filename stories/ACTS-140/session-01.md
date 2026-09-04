---
story: ACTS-140
session: 01
wrapped_at: 2026-09-03T22:38:19-0700
status: Done
final: true
---

## What happened
The Journal now folds each Lectio sitting into one collapsible unit across **every**
grouping (Date, Theme, Source) — a session's per-movement reflections read as one
sitting, not loose entries. All in [`reflections.tsx`](../../src/routes/reflections.tsx);
no data-model change, no `STORAGE_KEY` bump.

- **Folding** — `buildJournalItems` groups a reflection's movements by its
  `prayer_session` link (confirmed Lectio by `template_id === LECTIO_TEMPLATE_ID`),
  ordered by `session_item` position (Read → Reflect → Respond → Rest). Non-Lectio
  reflections pass through as normal entries.
- **Grouping on folded items** — refactored the group-by to `groupJournalItems`
  (replacing `groupEntries`): a sitting groups under the single **"Lectio Divina"**
  source (fixing the old dual-link double-count) and, being themeless, under
  **"Untagged"**. A shared `renderItem` draws entries and sittings identically in the
  flat Date list and the grouped views.
- **`SittingGroup`** — quiet header (`Lectio Divina · <date>`, then
  `<passage> · N movements`) with a resume **Open** link to `/session/$sessionId`.
  Expanded: the pasted passage text at the top (when present — JC's ask), then the
  movements, each opening the existing single-entry dialog for edit/delete.
- Empty sittings never appear (no reflections to fold → naturally ACTS-141-safe).

## Verified (and how)
Own dev server (:8080), browser-driven — ran a real Lectio (passage Psalm 23, three
movements) plus an existing four-movement sitting (1 Corinthians 13, pasted text):
- Date view: sitting folds to one row; expand shows movements in step order; a movement
  opens the single-entry view.
- Source view: **"Lectio Divina" (2)** holds two distinct folded sittings (movements
  together, no break-out, no double-count); standalone note under **"No source"**.
- Passage-text block renders at the top of the expanded sitting when text was pasted;
  reference-only sittings omit it.
- Resume **Open** links to the session. `tsc` + `eslint` clean; module serves 200.

All acceptance criteria met.

## Git state at handoff
Committed to `main`, **push pending** (local pushes failing on auth — flush from JC's git
client). ACTS-140 commits: `4f1e4e9` (fold), `1a2fc5a` (docs) + this handoff. `.env` left
untracked-dirty (unrelated).

## Next
Story complete. Deferred follow-up surfaced while closing: **Lectio journaling carries no
themes** (capture never tags; the lexicon only *suggests* in free-write, never auto-assigns;
"Love" is a theme, "God's will" is not). Candidate new story ACTS-142 — tag a whole sitting
from the Journal and/or extend the lexicon — if JC wants it. To publish: `git push origin main`.
