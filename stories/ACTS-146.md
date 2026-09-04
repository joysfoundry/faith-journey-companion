---
id: ACTS-146
title: Install the Archify skill (dev tooling) — audited safe
spine:
status: To Do
origin: human-directed
approved_by: JC
depends_on: []
relates_to: [ACTS-104, ACTS-105]
started_at: 2026-09-04T09:42:04-0700
updated:    2026-09-04T09:42:04-0700
latest_handoff: null
sessions: 0
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
- [ ] Archify installed and available to Claude Code (globally, or scoped to this repo —
      decide at install time).
- [ ] `node bin/archify.mjs doctor` (or the skill's self-check) passes.
- [ ] Confirm it's listed among available skills and can render one demo diagram.
- [ ] Decide + note whether the update-ping stays enabled or is disabled.

## Open questions (flag before installing)
- **Install scope:** global (`-g`, available in every project) vs. project-local. The
  original instruction used `npx skills add tt-a1i/archify -g` (global) — confirm with JC.
- The `npx skills add …` path runs a third-party `skills` **installer CLI** that was
  **not** part of this audit (only the Archify bundle was). Prefer a manual/vetted install
  path, or audit the installer too, before running it.
- Whether to pin a specific released version rather than tracking `main` (current is a
  `-dev.1` prerelease).

## Tests
_N/A — dev-tooling install, no app (`src/**`) code change. Verification is the doctor/demo
check in the acceptance criteria, not the app test suite (harness = ACTS-92)._
