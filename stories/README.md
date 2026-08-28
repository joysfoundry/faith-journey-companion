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

Newest / active on top. `active` view = hide `Done`. This table is the source of truth for
active work — keep it in sync when a pointer changes. The **full numbered ledger** of all
75 stories (oldest-first, commits logged, EPIC column) lives in
[`docs/JIRA-BACKLOG.md`](../docs/JIRA-BACKLOG.md).

| ID | EPIC | Title | Status | Depends on | Next step | Updated |
|----|------|-------|--------|-----------|-----------|---------|
| [ACTS-98](ACTS-98.md) |  | Month calendar in Plan > Sessions — color-coded day dots + upcoming list | To Do | — | **Low priority.** Month grid on the Sessions view (no new tab): per-day dots for sessions/planned/readings/programs/reflections + upcoming-next-month list; supersede orphaned `/calendar`. Confirm dot-color encoding w/ JC | 2026-08-28 |
| [ACTS-97](ACTS-97.md) |  | Land on the browse/list tab by default (Vessels + Plan), not the create tab | In Progress | — | Code done (tab order swapped, Plan defaults to Sessions + `?build`, Vessels defaults to Library); tsc clean; JC spot-checked. Browser preview unavailable this session → `/save` when ready | 2026-08-28 |
| [ACTS-96](ACTS-96.md) |  | Make the app mobile-web-first and responsive (wide-screen nav + PWA) | In Progress | — | Responsive shell: bottom-nav→side rail at md/lg, un-cap `max-w-2xl`, safe-area insets; then PWA manifest/install (un-parks ACTS-90) | 2026-08-28 |
| [ACTS-95](ACTS-95.md) |  | Pray a shared session in the app — adopt a `/follow` link into your sessions (+ sign in to save) | To Do | ACTS-94 | Add "Pray in the app" on `/follow`; adopt payload → stored session → Prayer Mode; sign-in saves to sessions list | 2026-08-28 |
| [ACTS-94](ACTS-94.md) |  | Guest "follow-along" share — read-only view + short titled backend links | Done | — | Shipped: `/follow` + `/follow/<slug>`, share dialog+QR, upcoming-row share, Supabase `shared_sessions`. App-user adopt → ACTS-95 | 2026-08-28 |
| [ACTS-93](ACTS-93.md) |  | Explore — share read-only "follow-along" prayer view for guests (no app) | Done | — | Spike done: fragment-link approach validated (rosary ~3 KB); impl → ACTS-94 | 2026-08-27 |
| [ACTS-92](ACTS-92.md) |  | Set up the test harness (Vitest + Testing Library + Playwright) — deferred | To Do | — | Install Vitest/Playwright; smoke test per layer; backfill ACTS-76 tests | 2026-08-27 |
| [ACTS-91](ACTS-91.md) |  | Testing convention — tests documented + tracked as a task | Done | — | Convention landed; harness build → ACTS-92 | 2026-08-27 |
| [ACTS-76](ACTS-76.md) |  | Pray-mode tracker — current item, grayed-out completed, auto-scroll | Done | — | Shipped + pushed; tests backfilled under ACTS-92 | 2026-08-27 |
| [ACTS-75](ACTS-75.md) |  | Number the backlog into ACTS stories + EPIC column + process docs | Done | — | Follow-ups (not blockers): push `main`; JC fills EPIC values | 2026-08-25 |
| ACTS-01…ACTS-74 |  | _Historical Done work_ | Done | — | See the [full ledger](../docs/JIRA-BACKLOG.md) | 2026-08-25 |

_Statuses: **To Do** · **In Progress** · **Blocked** · **Done**._

**Testing convention (ACTS-91, Done):** every code-change story **documents** its tests in a
**Tests** section (unit · integration · E2E) — enforced by [`_TEMPLATE.md`](_TEMPLATE.md) — and
its testing work is **tracked as a task**. The shared E2E flow catalog is
[`docs/E2E-TEST-PLAN.md`](../docs/E2E-TEST-PLAN.md). No runner is wired yet — the harness build
is deferred to **ACTS-92**, so coverage stays **planned** until then.

## How the backlog is numbered

- Every completed unit of work is one `ACTS-NN` row, numbered **oldest-first by commit**.
- Numbers are **permanent** — never renumbered; new work takes the next number.
- Each row **logs its commit(s)**; the **EPIC** column is left blank for JC to fill in.
- [`.counter`](.counter) holds the last-used number (**97**); brand-new work = ACTS-98.
- Full detail + the maintenance process: [`docs/JIRA-BACKLOG.md` → Process](../docs/JIRA-BACKLOG.md#process).

## Open (numbered — ready to `/start`)

Every open story now has an id so you can reference it when starting a chat — see the
[Open section of the ledger](../docs/JIRA-BACKLOG.md#-open--backlog-numbered), **ACTS-76…90**.
Highlights / recently added:

- **ACTS-92** — Set up the test harness (Vitest + Testing Library + Playwright), **deferred** → [`ACTS-92.md`](ACTS-92.md). **Blocks executable tests for every story.**
- **ACTS-91** — Testing convention (tests documented + tracked as a task) → [`ACTS-91.md`](ACTS-91.md) _(Done)_.
- **ACTS-76** — Pray-mode tracker: prominent current item, grayed-out completed, auto-scroll → [`ACTS-76.md`](ACTS-76.md) _(Done)_.
- **ACTS-78** — Push `main` + Publish in Lovable (merge already done locally; just push + Publish).
- **ACTS-82** — Enable Supabase persistence (backend for auth; parked as a future story).
- **ACTS-87 / ACTS-88** — Auth (email login + session) / Account creation (sign up with email).
- **ACTS-89** — Guided-prayer expand/collapse + expand-all/collapse-all → [`ACTS-89.md`](ACTS-89.md) _(Done)_.
- **ACTS-90** — Platform: mobile-first, mobile web, no app store — **recorded decision** (PWA leaning but parked) → [`ACTS-90.md`](ACTS-90.md).

To begin one in a clean chat: `/start ACTS-NN`.
