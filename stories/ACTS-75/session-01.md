---
story: ACTS-75
session: 01
wrapped_at: 2026-08-25T21:27:18-0700
status: In Progress
final: false
---

## What happened
Turned the whole repo history into one numbered ACTS story ledger.

- Reconstructed every unit of work from `git log` (Aug 16 → Aug 25) and filed it as
  `docs/JIRA-BACKLOG.md` — **ACTS-01 … ACTS-75**, one story per row, **oldest-first by
  commit**, with the delivering commit hash(es) logged in each row. Grouped into sections
  by working session (Foundation, PRD gap-merge, Session Builder, Recurrence, USCCB, Songs,
  Home redesign, Knowledge unify, Liturgical, Mysteries, Litany, Vessels, Settings/Bible,
  Workflow).
- Added an **EPIC** column (left blank for JC) to both the numbered tables **and** the
  Open backlog table.
- Filed **this chat as ACTS-75** (its own pointer `stories/ACTS-75.md`, status In Progress).
- Bumped `stories/.counter` to **75** (next started story = ACTS-76).
- Updated `stories/README.md` board to point at the ledger + a "how numbering works" note.
- Documented the numbering **Process** (ledger Process section + board note + pointer).
- Decision: keep done work as **ledger rows only** — no backfilled per-story files for
  ACTS-01..74; new pointer files start going forward at ACTS-76.
- Demoted the old open "Mystery-detail versions" item to just the **variant-picker**
  remainder (ACTS-55/56 already delivered selectable bodies + the authoring editor).
- Saved memory note `acts-backlog-numbering.md` + indexed it in MEMORY.md.

## Verified (and how)
- All referenced commit hashes confirmed to exist via `git log -1 <hash>` (e.g. `db2af68`,
  `e0c36fc`, `bc3009d`, `8bd66c3`, `e79af8f`).
- Chronological order + session boundaries derived from `git log --reverse` and the
  `docs: handoff` commits.
- `.counter` = 75; only `stories/ACTS-75.md` exists as a pointer (ledger rows for the rest,
  confirmed via `ls stories/*.md`).

## Git state at handoff
**committed-not-pushed** — push failed (`could not read Username for github.com`; no
credentials in this sandbox). Branch `prd-gap-merge` is ahead 3: `f33c564` (ledger),
`5b6c8a6` (Open EPIC col), `f56b12c` (this handoff). **Push from your git client:**
`git push origin prd-gap-merge`. No unsaved code. Untracked `.claude/launch.json`
intentionally left out (unrelated local scratch).

## Next
- **JC fills in the EPIC column** across the ledger + Open table, then commit (`docs:`).
- Optionally push `prd-gap-merge` + open the PR into `main` (open backlog item).
- Next story starts at **ACTS-76** in a clean chat via `/start`.
