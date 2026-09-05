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
- **Archify is pinned to stable `2.16.0`** (2026-09-05), verified by matching the release
  manifest's `treeSha` (`a198a3e0…`) against the `archify/` subtree at tag `v2.16.0`.
- **The update ping is on and now on the right channel** — installed matches stable, so a
  future `2.16.1` or `2.17.0` *would* notify. **But it cannot actually complete on this
  machine:** the first network call in a fresh Node process costs ~4.5s here (curl does the
  same request in 0.1s; not IPv6, not a proxy — a second call in the same process is 28ms),
  and the checker's timeout is a hardcoded 1s with no env override. It fails silently and
  backs off, exactly as designed, so nothing breaks — just don't rely on it. Check by hand:

  ```bash
  curl -s https://tt-a1i.github.io/archify/skill-updates/archify/stable.json | python3 -c "import json,sys; d=json.load(sys.stdin); print(d['version'], d['publishedAt'])"
  ```
