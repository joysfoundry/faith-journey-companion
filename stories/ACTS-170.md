---
id: ACTS-170
title: Release tracker — see which stories/commits are Published to production vs not
spine: ACTS-170
status: In Progress
origin: human-directed
approved_by: JC
depends_on: []
relates_to: [ACTS-168, ACTS-108]
started_at: 2026-09-07T16:31:08-0700
updated:    2026-09-07T16:31:08-0700
latest_handoff: null
sessions: 1
visibility: unreleased
---

## Goal
As JC, I want a command that shows which stories and commits have been **released
to production** (the Lovable **PUBLISH** action) and — more importantly — which have
**not**, so I can see at a glance what's sitting on `main` waiting to ship, and which
released stories are still hidden behind a feature flag.

## The model (why the obvious answer is wrong)
`origin/main` is **not** production. Pushing to `main` only updates Lovable's preview;
the app serves production users only after JC clicks **Publish** in Lovable. So today
**ACTS-108 is on `main` but unreleased** — it has not been Published. Git has no record
of the Publish click, so "released" cannot be derived from the branch alone.

Two independent axes — standard engineering vocabulary, where **deploy ≠ release**:

- **Location axis (git-derived), the pipeline:**
  `committed (local) → on a remote branch (not merged) → on main (pushed; Lovable
  preview/staging) → Published to production (Lovable PUBLISH)`. `stage_of()`
  classifies each commit against `prod` / `origin/main` / `refs/remotes/origin/*` /
  local. A commit is *Published* iff it is an ancestor of the movable **`prod` tag**;
  JC bumps it at Publish (`mark [<sha>]`) — the only honest way to mirror a Publish
  that leaves no git trace. Immediate need JC named: *is it released to the public —
  and if not, is it local, on a remote branch, or on main.*
- **Release axis (declared).** DEPLOY ≠ RELEASE: code can be *deployed to production*
  yet gated behind a feature flag (a "dark launch") — live in prod, invisible to
  users. There is **no per-feature flag infrastructure** in this
  codebase (only the whole-app beta passcode in `src/components/beta-gate.tsx`). So a
  released-but-hidden story is **declared** in its frontmatter:
  `visibility: unreleased | flagged | live` (+ optional `flag: <name>`). The live example
  is **ACTS-168** (the wordmark-as-O): Published to production, then switched **off**
  behind a flag — `visibility: flagged`, `flag: wordmark-as-o`.

Stories are matched to commits by the `ACTS-NN` token in the commit subject (the existing
convention), with a boundary guard so `ACTS-10` never swallows `ACTS-108`.

## What shipped this session
- [`scripts/published.sh`](../scripts/published.sh) — the command. Sections: unreleased
  commits (on HEAD, awaiting Publish), stories NOT released, released-behind-flag, and
  (with `--all` or a story filter) released & not-started. `mark [<sha>]` bumps `prod`.
- `npm run published` alias in `package.json` (`npm run published -- --all` / `-- ACTS-168`).
- Seeded `visibility: flagged` / `flag: wordmark-as-o` on `stories/ACTS-168.md`.

## Acceptance criteria
- [x] Command lists commits on HEAD not yet released (not under `prod`).
- [x] Command rolls up each story to released / unreleased / partially-released / flagged /
      not-started, matched by `ACTS-NN` with `ACTS-10`≠`ACTS-108` guard.
- [x] `mark [<sha>]` sets/moves the `prod` tag; default HEAD; reports old→new.
- [x] No `prod` tag → a clear message telling JC to set the production point, not a crash.
- [x] Released-behind-flag surfaces from `visibility: flagged` (ACTS-168 demonstrates it).
- [x] Pure bash + git, no `tsx`/build; macOS-safe (no `tac`); `--ref` seam for phase 2.
- [ ] One-time bootstrap: JC runs `mark <sha>` at the true last-Published commit (only JC
      knows it — not guessed here).

## Phase 2 (future)
Named release/version tags (e.g. `v0.3.0`) as the boundary and "each story tied to a
release." The `--ref <tag>` seam already exists: `scripts/published.sh --ref v0.3.0` reads
as "stories not yet in v0.3.0". Also consider pushing `prod`/tags to origin so Lovable and
other clones agree, and logging the release per story in `docs/JIRA-BACKLOG.md`.

## Tests
_No runner wired (convention ACTS-91; harness = ACTS-92). Verified by hand this session._
- **Unit** (Vitest — pure `src/lib/**`): N/A — this is an ops/CLI script, no `src/lib` code.
- **Integration**: N/A — shell script over git; not a component.
- **E2E** (manual, this session): ran against real repo state — (a) no `prod` tag → guidance
  + exit 3; (b) `--ref HEAD~8` → correct unreleased-commit list and story rollup; (c)
  `ACTS-168` filter → `released · behind flag (wordmark-as-o)`; (d) exit 0 on success.
  Re-run recipe: `scripts/published.sh --ref HEAD~8 --all`.
