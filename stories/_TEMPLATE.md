# Templates (copy — do not edit in place)

Local ACTS pattern (no Jira). Copy the blocks below when filing a story or writing a
handoff. Timestamps are ISO 8601 **with offset** (run `date "+%Y-%m-%dT%H:%M:%S%z"`).

---

## Story pointer → `stories/ACTS-<n>.md`

```markdown
---
id: ACTS-<n>
title: Short imperative title
spine: ACTS-<n>              # parent epic (optional)
status: To Do | In Progress | Blocked | Done
origin: human-typed | human-directed
approved_by: JC             # required when origin != human-typed
depends_on: []              # story ids that must be Done first
relates_to: []              # non-blocking links
started_at: <ISO8601+offset>
updated:    <ISO8601+offset>
latest_handoff: null        # path to newest session-NN.md
sessions: 0
---

## Goal
As <role>, I want <capability> so that <value>.

## Acceptance criteria
- [ ] …
```

---

## Session handoff → `stories/ACTS-<n>/session-NN.md`

```markdown
---
story: ACTS-<n>
session: <NN>
wrapped_at: <ISO8601+offset>   # the sort key for /continue
status: In Progress | Blocked | Done
final: false                   # true on the closing handoff (/done)
---

## What happened
## Verified (and how)
## Git state at handoff         # committed & pushed / committed-not-pushed / pending
## Next
```

---

## When you file or advance a story
1. Increment `.counter` (its value is the last-used number).
2. Create/update the pointer and (on a working session) the `session-NN.md` handoff.
3. **Update the board row in `README.md`** — it's the source of truth.
4. Commit story docs to `main` with a plain `docs:` type (code uses the `ACTS-<n>:` prefix), ending with the `Co-Authored-By` trailer. Push separately.
