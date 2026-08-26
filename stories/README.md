# ACTS stories — board

Local, Git-tracked story board for **faith-journey-companion**. Not wired to Jira —
this table (plus the per-story files) **is** the tracker. Each chat is tied to one
story. Pattern follows `~/.claude/commands/WORKFLOW.md` with every Jira step skipped
and `ACTS` used wherever the kit says `{{PROJECT_KEY}}`.

- **IDs:** `ACTS-<n>`, next number from [`.counter`](.counter) (last-used number; increment on use).
- **Pointer:** `stories/ACTS-<n>.md` — one per story (goal, status, acceptance criteria).
- **Session handoffs:** `stories/ACTS-<n>/session-NN.md` — one per working session.
- **Template:** [`_TEMPLATE.md`](_TEMPLATE.md).
- **Config:** [`.claude/workflow.json`](../.claude/workflow.json).

## Board

Newest / active on top. `active` view = hide `Done`. This table is the source of truth — keep it in sync when a pointer changes.

| ID | Title | Status | Depends on | Next step | Updated |
|----|-------|--------|-----------|-----------|---------|
| — | _No stories filed yet — see "Recreate next session" below._ | — | — | — | — |

_Statuses: **To Do** · **In Progress** · **Blocked** · **Done**._

## Recreate next session

The completed and open work to file as `ACTS-<n>` stories already exists in prose —
convert it into numbered stories next chat, bumping `.counter` as you go:

- [`docs/JIRA-BACKLOG.md`](../docs/JIRA-BACKLOG.md) — the ACTS PRD gap-merge ticket list (Done + Open), the best starting point.
- [`HANDOFF.md`](../HANDOFF.md) — running session log, newest first.

Work streams seen so far (not exhaustive; group as you prefer):

- Prayer Sessions / Session Builder epic
- USCCB basic prayers seed
- Song / hymn prayer type + Caro family prayers
- Litany devotions
- Knowledge → Vessels (Voice / Channel / Content model)
- Mystery-detail versions (selectable bodies)
- Unified calendar recurrence (RRULE) + novena removal
- Liturgical day titles on the Word card
- **Account Settings + Bible app + open-links-in-new-tab** (2026-08-25 — this session; commits `9f94632`, `1527cdd`, `5a8b753`)
- Open backlog items (pray-mode tracker, touch DnD, Supabase persistence, etc. — see JIRA-BACKLOG.md)
