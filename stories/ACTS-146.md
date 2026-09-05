---
id: ACTS-146
title: Install the Archify skill (dev tooling) — audited safe
spine:
status: Done
origin: human-directed
approved_by: JC
depends_on: []
relates_to: [ACTS-104, ACTS-105]
started_at: 2026-09-04T09:42:04-0700
updated:    2026-09-04T23:49:05-0700
latest_handoff: ACTS-146/session-01.md
sessions: 1
---

## Goal
As the developer, I want the **Archify** skill installed so I can generate polished,
validated architecture / workflow / sequence / data-flow / lifecycle diagrams of the
faith-journey-companion system (e.g. to document how a request flows Home → store →
Supabase and back, and to export share-card images for the PRD / README).

## Why now — parked, not urgent
JC asked to file this as a story and **do it later** — the install is deferred, not
part of an active session. A dev-tooling install, **not** an app code change.

## Security review (done 2026-09-04) — ✅ safe to install
Source: [`github.com/tt-a1i/archify`](https://github.com/tt-a1i/archify) (MIT). Audited
with the `skill-auditor` skill (static review — nothing executed). Verdict **Looks clean**:
- **No install hooks** — `package.json` has no `pre/postinstall`; deps are dev-only.
- **One network call**, disclosed: a **GET** to a hardcoded manifest URL
  `https://tt-a1i.github.io/archify/skill-updates/archify/stable.json` (headers
  `{accept: application/json}` only — no auth, no body, no fingerprint). The fetcher
  **throws** on any other URL, and the checker **never** downloads/installs/executes an
  update. Writes only to a standard cache dir with path-escape guards.
- **No exfiltration channel** — zero `POST`/`PUT`/`FormData`/uploads in the code.
- **No malware markers** — no `eval`, no `curl | bash`, no shell-rc/cron persistence, no
  "don't tell the user" prompt injection. `spawn` uses are legit (its own node CLI, `git`
  for repo evidence, headless Chrome for `visual-check`, OS "open" for the browser).
- One **Low** finding only: the disclosed version-ping (removable by deleting
  `scripts/check-update.mjs` or via its env toggle if zero network activity is wanted).

## Acceptance criteria
- [x] Archify installed and available to Claude Code — **globally** at
      `~/.claude/skills/archify` (only copy on disk; no `~/.agents` duplicate).
- [x] `node bin/archify.mjs doctor` passes — **15/15 `[ok]`, "Archify is ready."**
- [x] Listed among available skills (the `archify` skill registered immediately after
      install) and rendered a demo diagram: `render architecture examples/web-app.architecture.json`
      → 715 KB standalone HTML, and `archify check` on it reports `"issues": []`.
- [x] Update-ping **disabled** (see Decisions + Installer audit below).

## Decisions (JC, 2026-09-04 — session 1)
- **Install scope: GLOBAL** — `~/.claude/skills`, available in every project.
- **Install path: audit the installer CLI first.** The `skills` CLI behind
  `npx skills add …` was not covered by the Archify audit; statically review it, then use
  it only if it comes back clean. (Fallback: manual clone of the audited bundle.)
- **Version-ping: DISABLED.** Remove `scripts/check-update.mjs` (or set its env toggle)
  so the install has zero network activity. Trade-off accepted: new Archify releases
  won't surface on their own — re-check manually.

## Open questions (still open)
- **Version pinning.** The installer itself was pinned (`skills@1.5.23`), but Archify came
  from the tip of `main`: installed **`2.17.0-dev.1`**, channel `development` — still a
  prerelease. It's frozen on disk (no auto-update, ping disabled), so this is stable in
  practice; the open call is whether to re-pull at a tagged release once one exists.

## Installer audit — the `skills` CLI (done 2026-09-04, session 1) — ✅ clean
The gap flagged at filing time. Audited **statically** (tarball downloaded and read; the
CLI was never executed during the audit): `skills@1.5.23`, from
[`vercel-labs/skills`](https://github.com/vercel-labs/skills) (MIT), published by
`rauchg`/`quuu`. Only 19 files, 2 runtime deps (`tar`, `yaml`).
- **No install lifecycle hooks** — no `preinstall`/`postinstall`. (`prepare: husky` is a
  repo-checkout script and does not run from a registry tarball.) `bin/cli.mjs` is a
  4-line shim into `dist/cli.mjs`.
- **No dynamic code execution** — zero `eval` / `new Function` / `vm`.
- **Subprocesses all legit** — `git` and `gh` for cloning/auth, and `spawnSync(process.execPath, …)`
  re-invoking its own CLI for updates. `spawn` with `stdio: inherit` only launches the
  agent *you* pick via `skills use --agent`.
- **Archive extraction is hardened** — `tar.x` with `strict: true`, `preservePaths: false`,
  `noChmod: true`, a path-validation filter rejecting `..`, an entry/byte cap, and
  files+directories only (no symlink/hardlink/device entries). ~15 separate
  "potential path traversal detected" guards across the install paths.
- **No credential or persistence access** — nothing touches `.ssh`, `.aws`, `.netrc`,
  `.npmrc`, keychain, shell rc files, cron, or LaunchAgents; no token harvesting.
- **One Medium finding: telemetry is on by default.** `https://add-skill.vercel.sh/t`
  (plus an `/audit` lookup) receives, per install/find/remove/update: CLI version, a CI
  flag, detected agent name, source repo, skill names, target agents, and the skill file
  list. No user id, machine id, paths, or env dump; private repos are gated out. Honours
  **`DISABLE_TELEMETRY`** and **`DO_NOT_TRACK`** — **both were set for every command run
  here**, so nothing was reported.

## Install record (2026-09-04, session 1)
```
DO_NOT_TRACK=1 DISABLE_TELEMETRY=1 npx -y skills@1.5.23 add tt-a1i/archify -g -s archify -a claude-code -y
```
- Version pinned to `skills@1.5.23` (the audited build), not floating `latest`.
- Installed **copied**, not symlinked → `~/.claude/skills/archify`.
- **Ping hard-disabled at the source:** `scripts/check-update.mjs` `runCli()` now returns
  `silent('disabled')` unless `ARCHIFY_UPDATE_CHECK_DISABLED=0` is set explicitly — a
  stronger guard than the env toggle alone, which would leave the ping live whenever the
  var happened to be unset. Verified: `node scripts/check-update.mjs` →
  `{"status":"silent","reason":"disabled"}`. Pristine file kept at
  `scripts/check-update.mjs.orig`.
- **Consequence to remember:** Archify will never announce new releases. Re-check
  [`github.com/tt-a1i/archify`](https://github.com/tt-a1i/archify) by hand, and re-apply
  this patch after any manual update.

## Tests
_N/A — dev-tooling install, no app (`src/**`) code change. Verification is the doctor/demo
check in the acceptance criteria, not the app test suite (harness = ACTS-92)._
