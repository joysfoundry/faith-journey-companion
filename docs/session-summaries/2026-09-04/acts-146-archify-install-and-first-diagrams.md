# 2026-09-04 — ACTS-146: Archify installed, audited, and producing diagrams

One story, start to Done, plus its first real output in two repos.

## What happened, in order

1. **`/start ACTS-146`** — opened the parked Archify install. Pre-flight clean: no
   `depends_on`, no pending syncs, clean tree, no prior handoff. Local-only tracking
   (`tracker: "none"`), so no Jira step anywhere in this session.
2. **Three decisions taken before anything ran** — global scope, audit the installer CLI
   first, and the version-ping. JC first chose to leave the ping enabled, then reversed to
   disabled before the install; the reversal is what shipped.
3. **Audited the `skills` installer CLI** — the open question the story was filed with.
   Statically, never executed.
4. **Installed Archify** globally with telemetry suppressed, then hard-disabled its
   version ping at the source.
5. **Verified** — `doctor` 15/15, a demo render, nine artifact checks.
6. **Answered "how do I generate, and where is it stored?"** — which turned into building
   the first two real diagrams, for Oravia and for Crave, and writing the storage
   convention down in both repos.
7. **`/save`, `/done`, `/wrap`.**

## The installer audit — the finding that outlives this story

`npx skills add …` turned out to be [`vercel-labs/skills`](https://github.com/vercel-labs/skills)
(MIT, published by `rauchg`/`quuu`) — 19 files, two runtime deps. No install hooks, no
`eval`, subprocesses limited to `git`/`gh`/self-reinvocation, genuinely hardened archive
extraction, nothing touching credentials or persistence.

**But its telemetry is on by default.** Install / find / remove / update events go to
`add-skill.vercel.sh` with CLI version, agent name, source repo, skill names and file list.
No user id, machine id or paths, and private repos are gated out — but opt-out, not opt-in.
It honours `DISABLE_TELEMETRY` and `DO_NOT_TRACK`; both were set on every command here.
**Set them for any future `skills` use, for any skill.**

## Verified, and how

| Claim | How |
|---|---|
| Installer is clean | Tarball downloaded and read file by file; never executed during the audit |
| Archify installed and healthy | `node bin/archify.mjs doctor` → 15/15 `[ok]`, "Archify is ready." |
| Ping actually dead | `node scripts/check-update.mjs` → `{"status":"silent","reason":"disabled"}` |
| One copy on disk | `find ~/.agents` empty; only `~/.claude/skills/archify` exists |
| Both diagrams sound | `archify check` on each → 9/9 checks, `issues: []` |
| Diagrams reflect real code | Read `store.ts`, `share.functions.ts`, `start.ts` in Oravia; `db.ts`, `lib/import/`, `app/api/` in Crave |

## What the code actually said

**Oravia is local-first, and the story's premise was wrong.** ACTS-146 described the target
as "Home → store → Supabase". The store is localStorage only
(`prayer-companion-db-v39`); Supabase is reached by exactly two paths — a deliberate share
(RLS-locked table, so it goes through a service-role server function) and the server-side
source fetch on import. Praying, journalling and reflecting never leave the device. The
diagram draws that boundary rather than the premise.

**Crave's spine is the repository seam** — route handlers never touch SQL dialect, which is
what makes the later Supabase swap tractable. Its importer escalates JSON-LD → Claude (when
keyed) → heuristic, and reports honest failure rather than fabricating.

## Git state at handoff

**Committed, NOT pushed** — `git push origin main` failed with
`could not read Username for 'https://github.com': Device not configured`. A credential
problem, not a conflict. Not retried blindly. **Push from your git client.**

- `f1ad82e` — ACTS-146: Oravia architecture diagram + generation convention
- `f62eb12` — docs: the install record + installer audit
- plus this session's close (final handoff, pointer/board/ledger → Done, this summary)

**Uncommitted, in another repo:** `crave/documents/diagrams/` (spec + HTML + README), left
for a Crave session so that repo's own workflow applies. That tree already had unrelated
uncommitted work before this session touched it.

## Parked / next

- **Push these commits** — the only genuinely blocking item.
- **Commit Crave's diagram** in a Crave session.
- ~~Version pinning~~ — **done 2026-09-05**: pinned to stable `2.16.0`.
- **`--repo-root` evidence mode** — would make diagrams fail loudly when the code drifts.
  Not wired up; wants a public GitHub URL in the spec.
- **Pinned to stable 2.16.0, ping on** (2026-09-05) — but the check times out on this
  machine; use the manual `curl`. See the ACTS-146 addenda.
- Still open from before: **ACTS-105** (canon/doc sync + CRV), **ACTS-113** (in-app Insights
  → Wisdom).

## Next session — opener (paste to start)

> Archify is installed globally at `~/.claude/skills/archify` and ACTS-146 is Done. Two
> commits from that session (`f1ad82e`, `f62eb12`) plus the close were committed but
> **never pushed** — the push failed on GitHub credentials, so check `git log origin/main..main`
> first and push before anything else.
>
> Diagrams live in `docs/diagrams/` here (JSON spec is the source of truth, HTML is a
> ~700 KB build output) and in `documents/diagrams/` in the `crave` repo — the Crave pair is
> still uncommitted there.
>
> To make more, just ask in plain language ("archify the export flow") — the skill triggers
> on its own. Two constraints that pull against each other: labels must not collide with
> nodes, and text must stay ≥6px projected at a 1440px viewport, so keep the viewBox under
> ~1395 wide and edge labels to one or two words.
>
> Archify is pinned to **stable `2.16.0`** (2026-09-05, verified by tree SHA) with the update
> ping **on** and stock. Two caveats: the check cannot complete on this machine (first Node
> network call ~4.5s vs a hardcoded 1s timeout), so check for updates with a one-line `curl`
> instead — see the ACTS-146 addenda. Do not re-patch the timeout.
> When using the `skills` CLI again, set `DO_NOT_TRACK=1 DISABLE_TELEMETRY=1`: its telemetry
> is opt-out.
