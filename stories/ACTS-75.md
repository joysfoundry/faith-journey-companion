---
id: ACTS-75
title: Number the backlog into ACTS stories + EPIC column + process docs
spine:
status: Done
origin: human-directed
approved_by: JC
depends_on: []
relates_to: [ACTS-74]
started_at: 2026-08-25T20:22:11-0700
updated:    2026-08-25T21:58:25-0700
latest_handoff: ACTS-75/session-02.md
sessions: 2
---

## Goal
As the project owner, I want the whole history filed as one numbered ACTS backlog
(oldest-first, one story per row, commits logged, an EPIC column I fill in) so that
the story workflow has a real ledger and each chat maps to a numbered story.

## Acceptance criteria
- [x] Every completed unit of work is a numbered `ACTS-NN` row, oldest-first by commit.
- [x] Each row logs the commit(s) that delivered it.
- [x] An **EPIC** column exists, left blank for JC to fill in.
- [x] This chat is filed as the latest story (**ACTS-75**).
- [x] The numbering **process is documented** (ledger "Process" section + board "How the
      backlog is numbered" + this pointer).
- [x] `.counter` bumped to 75; board updated to point at the full ledger.
- [ ] JC fills in the EPIC column.
- [ ] Commit + push the docs (`docs:` type).

## Notes
- Ledger: [`docs/JIRA-BACKLOG.md`](../docs/JIRA-BACKLOG.md) (ACTS-01 … ACTS-75 + Open).
- Board: [`README.md`](README.md).
- Format decisions this session: IDs are `ACTS-NN` (zero-padded + hyphen);
  granularity is one story per backlog row.
