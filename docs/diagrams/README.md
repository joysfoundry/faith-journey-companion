# Diagrams

Generated with the **Archify** skill (installed globally at `~/.claude/skills/archify`,
ACTS-146). Nothing here is auto-generated on build — each diagram is produced on request
and committed.

## What's here

| Diagram | What it shows |
|---|---|
| `oravia-request-flow` | Where a devotion's data actually lives: local-first store, and the only two paths that cross the network. |

## The convention

Each diagram is a pair:

- **`<name>.<type>.json`** — the source. Small, diffable, reviewable. **Always commit this.**
- **`<name>.html`** — the rendered output, ~700 KB standalone HTML (no server, no CDN;
  open it straight from disk). Regenerable from the JSON, so commit it only when the
  diagram is linked from the PRD or README.

`<type>` is one of `architecture`, `workflow`, `sequence`, `dataflow`, `lifecycle`.

## Regenerating

```bash
node ~/.claude/skills/archify/bin/archify.mjs deliver architecture \
  docs/diagrams/oravia-request-flow.architecture.json \
  docs/diagrams/oravia-request-flow.html --quality showcase --json
```

Then confirm the nine artifact checks still pass:

```bash
node ~/.claude/skills/archify/bin/archify.mjs check docs/diagrams/oravia-request-flow.html
```

Easier path: just ask in a session — "archify the export flow" — and the skill triggers on
its own. Edit the JSON for small corrections; re-render rather than hand-editing the HTML.

## Gotchas worth knowing

- **Validation is strict, and that's the point.** `deliver` refuses to emit a diagram whose
  labels collide with nodes, and it enforces a 6px minimum projected font at a 1440px
  viewport. Both bit this diagram on the first pass.
- **The two failures pull against each other.** Widening the grid to clear label collisions
  shrinks the text below the readability floor. Keep the viewBox under ~1395 wide and keep
  edge labels to one or two words.
- **View notes cap at 140 characters.**
- **The update ping is ON** (re-enabled 2026-09-05, ACTS-146). It is GET-only to a hardcoded
  GitHub Pages manifest, at most once per 72h, and never auto-installs. **But it is
  currently mute:** the installed build is `2.17.0-dev.1` and the stable channel is
  `2.16.0`, so anything released on the 2.16.x line — security fixes included — compares as
  *older* and stays silent. It only starts speaking at stable `2.17.0`.
