---
story: ACTS-146
session: 01
wrapped_at: 2026-09-04T23:50:00-0700
status: Done
final: true
---

## What happened
The parked Archify install, unparked and finished in one session. All four acceptance
criteria are met. The skill is installed globally, the audit gap the story was filed with
is closed, and it has produced its first two real diagrams.

**Decisions taken with JC, before anything ran.**
- **Global** scope (`~/.claude/skills/archify`), not project-local.
- **Audit the installer CLI first** — the story's own open question, chosen over the
  faster paths.
- **Version-ping disabled.** JC initially chose to leave it enabled, then reversed before
  the install; the reversal is what shipped.

## The installer audit — the gap the story was filed with
The Archify bundle had been audited at filing; `npx skills add …` had not. Audited it
statically (tarball downloaded and read, never executed): **`skills@1.5.23`**, from
[`vercel-labs/skills`](https://github.com/vercel-labs/skills), MIT, published by
`rauchg`/`quuu`. 19 files, two runtime deps (`tar`, `yaml`).

Clean: no install lifecycle hooks (`prepare: husky` doesn't run from a registry tarball);
no `eval`/`new Function`/`vm`; subprocesses limited to `git`, `gh`, and `spawnSync` re-invoking
its own CLI; extraction hardened with `strict`, `preservePaths: false`, `noChmod`, a filter
rejecting `..`, entry/byte caps, and files+directories only; nothing touching `.ssh`,
`.aws`, `.netrc`, keychain, shell rc files, cron, or LaunchAgents.

**One finding that outlives this story: the CLI has telemetry on by default.** Install /
find / remove / update events go to `add-skill.vercel.sh` carrying CLI version, agent name,
source repo, skill names and the skill file list. No user id, machine id, paths or env
dump, and private repos are gated out — but it is opt-out, not opt-in. It honours
`DISABLE_TELEMETRY` and `DO_NOT_TRACK`; **both were set on every command run here**, so
nothing was reported. Any future use of this CLI, for any skill, should set them too.

## The install
```
DO_NOT_TRACK=1 DISABLE_TELEMETRY=1 npx -y skills@1.5.23 add tt-a1i/archify -g -s archify -a claude-code -y
```
Installer pinned to the audited build rather than floating `latest`. Copied, not symlinked,
to `~/.claude/skills/archify` — one copy on disk, no `~/.agents` duplicate. `doctor` reports
15/15 `[ok]`.

**The ping is disabled harder than the story proposed.** The documented toggle
(`ARCHIFY_UPDATE_CHECK_DISABLED=1`) only bites when that variable is actually set, which
won't reliably be true when Claude Code invokes the skill — so `runCli()` in
`scripts/check-update.mjs` now returns `silent('disabled')` unless the variable is
explicitly `'0'`. Pristine copy at `scripts/check-update.mjs.orig`. **The cost is real:
Archify will never announce a new release, and this patch needs re-applying after any
manual update.**

## What it produced
Two architecture diagrams, each passing all nine artifact checks with zero composition
issues.

- **Oravia** — `docs/diagrams/oravia-request-flow.architecture.json` + `.html`, committed
  in `f1ad82e`.
- **Crave** — `documents/diagrams/crave-recipe-flow.architecture.json` + `.html`, in the
  `crave` repo. **Uncommitted** — left for a Crave session so its own workflow applies.

**The Oravia diagram corrects this story's own premise.** ACTS-146 described the target as
"request flow Home → store → Supabase". That is not the architecture. The store is
localStorage only (`prayer-companion-db-v39`); Supabase is reached by exactly two paths — a
deliberate share (`saveShare`/`loadShare` via `supabaseAdmin`, because `shared_sessions` is
RLS-locked to the browser) and the server-side source fetch on import. Praying, journalling
and reflecting never leave the device. The local-first boundary is the fact worth drawing,
and the one that matters if sync or multi-device is ever offered.

**Crave's diagram went in the wrong folder first.** Written to `docs/`, which that repo's
`CLAUDE.md` declares a frozen archive; moved to `documents/` and re-rendered so the recorded
output path matches.

## Gotchas worth keeping
- **Archify's two validators pull against each other.** `deliver` refuses labels that
  collide with nodes, *and* enforces a 6px minimum projected font at a 1440px viewport.
  Widening the grid to clear collisions shrinks text below the readability floor. Keep the
  viewBox under ~1395 wide and edge labels to one or two words. Both failures hit the Oravia
  diagram on the first pass.
- View notes cap at 140 characters.
- The JSON spec is the artifact; the HTML is a ~700 KB build output. Re-render, never
  hand-edit the HTML.

## Acceptance criteria — all met
- [x] Installed globally at `~/.claude/skills/archify`, available to Claude Code.
- [x] `doctor` passes — 15/15 `[ok]`, "Archify is ready."
- [x] Listed among available skills; rendered demo diagrams, `check` reports `"issues": []`.
- [x] Update-ping decision taken and applied (disabled, at the source).

## Left open, deliberately
- **Version pinning.** Installed `2.17.0-dev.1` from the tip of `main` — a
  `development`-channel prerelease. Frozen on disk with no auto-update, so stable in
  practice; whether to re-pull at a tagged release once one exists is still open.
- **`--repo-root` evidence mode.** Archify can validate a diagram against real repository
  evidence so drift fails loudly. Not wired up — it wants a public GitHub URL in the spec.
  Worth doing if these diagrams are meant to stay true.
- **Crave's diagram is uncommitted** in the `crave` repo, on a tree that already had
  unrelated uncommitted work before this session touched it.

## Closing note (would be the tracker comment)
Done. Installer audited clean (`vercel-labs/skills`, MIT) with one carry-forward finding —
telemetry is opt-out, so set `DO_NOT_TRACK=1 DISABLE_TELEMETRY=1`. Archify `2.17.0-dev.1`
installed globally, ping disabled at the source, `doctor` 15/15. First two diagrams shipped;
the Oravia one corrected the story's stated premise (the app is local-first — Supabase is
reached only by share and import).
