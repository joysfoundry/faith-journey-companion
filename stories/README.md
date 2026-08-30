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
| [ACTS-117](ACTS-117.md) |  | Rebase ACTS-PRD onto v8 + apply reconcile checklist | In Progress | — | **Next chat starts here.** v8 = content base (canonical `.md`→v3); re-apply structure + inventory; apply `V8-CODE-GAP.md` decisions; add shipped-but-absent sections; re-export .docx. Handoff [session-01](ACTS-117/session-01.md) | 2026-08-29 |
| [ACTS-116](ACTS-116.md) |  | ACTS status dashboard + signal-ingestion workflow | To Do | — | _Idea, grown from gap review._ Tiles + buckets + editable save-back doc, fronting a signal-ingestion loop (ingest → compare to built → classify built/partial/none/**suggested** → act). Path to **CRAVE** signal intake. Relates ACTS-104/105 | 2026-08-29 |
| ACTS-115 |  | HowTo versioning + multi-source | To Do | — | _v8 gap._ Add HowToVersion + HowToSource + USCCB Rosary How-To seed. Auto How-To exists (ACTS-28) | 2026-08-29 |
| ACTS-114 |  | Full Audio domain | To Do | — | _v8 gap, future/large._ Multi-speaker, voice-follow, record-during-session, usage tracking. Fields stubbed only | 2026-08-29 |
| ACTS-113 |  | Insights + Wisdom (future longitudinal intelligence) | To Do | — | _v8 gap, future._ Grounded Insights → user-named Wisdom w/ evidence links. Never AI-as-God's-will | 2026-08-29 |
| ACTS-112 |  | Prayer metadata: five Prayer Forms + Traditional/My origin | To Do | — | _v8 gap, low pri — validate need._ `prayer_form` + `prayer_origin_type` grouping | 2026-08-29 |
| ACTS-111 |  | Explore: My Intention vs Devotion Intention split | To Do | — | _v8 gap, low pri._ Today intention+petition kinds; explore a UserIntention/DevotionIntention split | 2026-08-29 |
| [ACTS-110](ACTS-110.md) |  | Nested Templates / Template Block | To Do | — | _v8 gap._ Reusable Template-as-block; compiler expands, guards circular nesting. First consumer = Rosary+Litany. Relates **ACTS-107** | 2026-08-29 |
| [ACTS-109](ACTS-109.md) |  | Surface "Pray with the Pope" on Home as a daily session | To Do | — | _v8 gap._ Template **is** seeded (`tpl-pray-with-pope`); just surface on Home. Relates ACTS-10 | 2026-08-29 |
| [ACTS-108](ACTS-108.md) |  | Open Prayer — free-form "from the heart" component | To Do | — | _v8 gap; JC wants._ New `open_prayer` kind; write/speak/leave-open/no-capture; save-as-Personal-Prayer. Relates ACTS-102 | 2026-08-29 |
| [ACTS-107](ACTS-107.md) |  | Litany of the Departed devotion (Rosary + Litany structure) | To Do | ACTS-106 | **Parked stub (spinoff).** Composite Rosary+Litany for the dead: offering/invitation → litany sequence → closing/requiem → Eternal Rest Prayer → Sign of the Cross. Exact wording + composite-devotion modeling = next chat. Reuses litany model (ACTS-57) + Eternal Rest seed (ACTS-106) | 2026-08-29 |
| [ACTS-106](ACTS-106.md) |  | Seed — Eternal Rest Prayer + surface "Why We're Catholic" (Trent Horn) on Home | Done | — | Shipped (`30aeddf`): Eternal Rest Prayer seeded (`src-eternal-rest`), book retitled "Why We're Catholic" + favorited → Home Vessels pin, STORAGE_KEY v29→v30. All ACs met + browser-verified. Final handoff [session-01](ACTS-106/session-01.md). **Push pending (auth).** Feeds ACTS-107 | 2026-08-29 |
| [ACTS-102](ACTS-102.md) |  | Lectio Divina session — reflection as a first-class session step | Done | — | Shipped (`0192c89`): `reflection` step kind + inline capture → `Reflection` **dual-linked** to movement + session; 4-movement Lectio seed (titled instruction cards), empty-at-open per-session passage (Open-your-Bible + paste-propagation, reference-only), How To (5 links) + Unhurried Living attribution. STORAGE_KEY→v29. All ACs met + browser-verified. Final handoff [session-01](ACTS-102/session-01.md). **Push pending (auth).** | 2026-08-29 |
| [ACTS-103](ACTS-103.md) |  | Reflection redesign — inspiration-in-view panel + voice note & OCR capture | To Do | — | **Stub (vetted).** Reflection tab shows the inspiration below the box (resolve linked entity, or store an `excerpt` snapshot for pasted book passages); + voice note (transcribe → body, `mode:"spoken"`) and photo→OCR capture (Cloud media phase). Split candidate A/B. Relates ACTS-102 | 2026-08-29 |
| [ACTS-101](ACTS-101.md) |  | Rebrand "Faith Journey" → "ACTS" (acronym in header) | Done | — | Shipped (`efd316e`): ACTS wordmark + tagline (small letter-spaced caps, enlarged initials) across all headers + all titles/manifest. All ACs met. Final handoff [session-01](ACTS-101/session-01.md) | 2026-08-29 |
| [ACTS-100](ACTS-100.md) |  | Explore — daily rosary "choose session" (point daily at an already-scheduled session) | To Do | ACTS-99 | **Exploration/parked.** Add a "choose session" option beside "switch template" → point the Daily Rosary at an existing scheduled session (countdown surfacing) + model petition/thanksgiving phases (27+27). Current behavior fine as-is | 2026-08-29 |
| [ACTS-99](ACTS-99.md) |  | Daily rosary defers to a scheduled novena rosary | Done | — | Shipped (`209a5f8`): defer toggle in builder (rosary+bounded), pinned DAILY ROSARY row, "Day X of N" (start-date-aware), overlap warn/block, Home mirrors it. All 8 ACs met + browser-verified. Final handoff [session-01](ACTS-99/session-01.md). Follow-up: ACTS-100 | 2026-08-29 |
| [ACTS-98](ACTS-98.md) |  | Month calendar in Plan > Sessions — color-coded day dots + upcoming list | To Do | — | **Low priority.** Month grid on the Sessions view (no new tab): per-day dots for sessions/planned/readings/programs/reflections + upcoming-next-month list; supersede orphaned `/calendar`. Confirm dot-color encoding w/ JC | 2026-08-28 |
| [ACTS-97](ACTS-97.md) |  | Land on the browse/list tab by default (Vessels + Plan), not the create tab | Done | — | Shipped (`fda1934`): Vessels→Library, Plan→Sessions + `?build` for New session. All ACs met (JC spot-checked). Final handoff [session-01](ACTS-97/session-01.md) | 2026-08-28 |
| [ACTS-96](ACTS-96.md) |  | Make the app mobile-web-first and responsive (wide-screen nav + PWA) | Done | — | Shipped: responsive shell (side rail md+, mobile menu drawer, removed More), Plan=calendar icon, + PWA (manifest/icons/offline SW, hand-rolled). All 6 ACs met; un-parks ACTS-90 | 2026-08-28 |
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

- **ACTS-104** — Vision PRD v2: reconcile doc with reality + the global `/prd-sync` skill; PRD now in-repo at [`docs/ACTS-PRD.md`](../docs/ACTS-PRD.md) → [`ACTS-104.md`](ACTS-104.md) _(Done)_.
- **ACTS-105** — Evolve `/prd-sync` → a "canon / doc sync" (vision change cascades to related docs) + apply to CRV → [`ACTS-105.md`](ACTS-105.md) _(To Do)_.
- **ACTS-92** — Set up the test harness (Vitest + Testing Library + Playwright), **deferred** → [`ACTS-92.md`](ACTS-92.md). **Blocks executable tests for every story.**
- **ACTS-91** — Testing convention (tests documented + tracked as a task) → [`ACTS-91.md`](ACTS-91.md) _(Done)_.
- **ACTS-76** — Pray-mode tracker: prominent current item, grayed-out completed, auto-scroll → [`ACTS-76.md`](ACTS-76.md) _(Done)_.
- **ACTS-78** — Push `main` + Publish in Lovable (merge already done locally; just push + Publish).
- **ACTS-82** — Enable Supabase persistence (backend for auth; parked as a future story).
- **ACTS-87 / ACTS-88** — Auth (email login + session) / Account creation (sign up with email).
- **ACTS-89** — Guided-prayer expand/collapse + expand-all/collapse-all → [`ACTS-89.md`](ACTS-89.md) _(Done)_.
- **ACTS-90** — Platform: mobile-first, mobile web, no app store — **recorded decision** (PWA leaning but parked) → [`ACTS-90.md`](ACTS-90.md).

To begin one in a clean chat: `/start ACTS-NN`.
