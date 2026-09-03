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
| [ACTS-134](ACTS-134.md) |  | Vessels — A–Z sort within tiers + reseed USCCB/Hallow/Why We're Catholic | Done | — | ✅ Built + `tsc` clean. `byStatusThenTitle` (replaces `byStatusThenRecent`): status vessels first, then references, A–Z by title within each tier; removed `STATUS_RANK`; 4 call sites updated. STORAGE_KEY v38→v39 to resurface seeded USCCB/Hallow/*Why We're Catholic*. Pending commit | 2026-09-02 |
| [ACTS-133](ACTS-133.md) |  | Daily Rosary — launch an external app (Hallow) instead of the in-app session | Done | — | ✅ All ACs met. Setting-driven external launch (flat picker: Hallow/Amen/Come Pray the Rosary/Universalis/iBreviary/custom URL) with auto-log-as-prayed; verified universal links; `tsc` + browser clean. Shipped `6328770`,`ca32634`,`0a7807f`,`28022f3`. Final handoff `session-01.md` | 2026-09-02 |
| [ACTS-132](ACTS-132.md) |  | Session "Day N of M" counts from the session's own date | Done | — | ✅ Built + `tsc` clean. `session.$sessionId.tsx` counts "Day N of M" from `session.context.date`, not the plan's rolled-forward `date` (which advances each finish). Shipped `d89727a` | 2026-08-30 |
| [ACTS-131](ACTS-131.md) |  | Seed — Mater Dei Catholic Parish Prayer | Done | — | ✅ Built + browser-verified. `mater-dei-parish-prayer` (devotional) + body w/ Leader/All responsory + `src-mater-dei` source; STORAGE_KEY v37→v38. Pending commit | 2026-08-30 |
| [ACTS-130](ACTS-130.md) |  | Vessel status — only completable works; sort above references | Done | — | ✅ Built + browser-verified. `hasStatus()` (book/program/video/podcast); status pills gated + `byStatusThenRecent` ranks status-bearing first. "General website" = article/post (JC). Pending commit | 2026-08-30 |
| [ACTS-129](ACTS-129.md) |  | Reflection icon on session rows, session detail, and vessel items | Done | — | ✅ Built + browser-verified. Reflect NotebookPen on Home Continue/Today/Done rows, session-detail header, and Formation `ContentRow`; `/reflections?link=<id>` prefill (+ knowledge-detail button). Pending commit | 2026-08-30 |
| [ACTS-128](ACTS-128.md) |  | Seed — Novena: St. Michael (chaplet-based) | To Do | ACTS-122 | _New (ACTS-107 follow-on)._ Novena built on the **Chaplet of St. Michael** (`tpl-chaplet-michael`) in the swappable chaplet slot — the "rosary **or** chaplet" case. Blocked on ACTS-122's chaplet option. Gather public-domain wording | 2026-08-30 |
| [ACTS-127](ACTS-127.md) |  | Seed — Novena: Christmas | To Do | ACTS-123 | _New (ACTS-107 follow-on)._ St. Andrew repeated-prayer novena (15×/day) **or** day-by-day — confirm form w/ JC. Uses the day-sequenced pattern (ACTS-123). Gather wording | 2026-08-30 |
| [ACTS-126](ACTS-126.md) |  | Seed — Novena: Lenten | To Do | ACTS-123 | _New (ACTS-107 follow-on)._ Day-by-day Lenten prayers/meditations → depends on the "Novena Prayers" day-sequence pattern (ACTS-123). Pick the specific novena + gather wording | 2026-08-30 |
| [ACTS-125](ACTS-125.md) |  | Seed — Novena: 9-Day Mother of Perpetual Help | To Do | — | _New (ACTS-107 follow-on)._ Redemptorist Marian novena; reuses Loreto litany (`tpl-litany-loreto`); scaffold (ACTS-122) or prayer-sequence (ACTS-123) per source. Gather wording | 2026-08-30 |
| [ACTS-124](ACTS-124.md) |  | Seed — Novena: 9-Day Sacred Heart of Jesus | To Do | — | _New (ACTS-107 follow-on)._ Reuses the seeded Litany of the Sacred Heart (`tpl-litany-sacred-heart`); scaffold (ACTS-122) or prayer-sequence (ACTS-123) per source. Gather wording | 2026-08-30 |
| [ACTS-123](ACTS-123.md) |  | "Novena Prayers" pattern — day-sequenced prayers over N days | To Do | — | _New (ACTS-107 follow-on, enabler)._ One prayer/day over a period, or a different prayer each day (day-indexed, "Day N of M"). Unblocks Lenten/Christmas novenas. Decide day-index data shape | 2026-08-30 |
| [ACTS-122](ACTS-122.md) |  | Novena scaffold — chaplet slot + daily offerings | To Do | ACTS-107 | _New (ACTS-107 follow-on, enabler)._ Generalize the "Choose the parts" picker: add **chaplet** as a swappable option (rosary + litany **or** chaplet), generic novena-builder naming, day-varying/rotating offering prayers. Unblocks ACTS-128 | 2026-08-30 |
| [ACTS-121](ACTS-121.md) |  | Name + pronoun layer — dedicate a session "for whom" | In Progress | — | **Built + verified** (session-01). `substituteDedication` tokens `{name}{subj}{obj}{poss}{us}` in compiler; optional `SessionContext.for_whom`; builder "Prayed for" field; read-sites strip to generic; seeds retrofitted (Decade/Eternal Rest/FD/Loreto); STORAGE_KEY v32→v33. Harness 21/21; tsc clean; 0 token leaks. Ready for `/save`+`/done` | 2026-08-30 |
| [ACTS-120](ACTS-120.md) |  | Seed — Litany of the Faithful Departed + Loreto/BVM + closing collects | In Progress | — | **Seeded + verified** (session-01). `tpl-litany-faithful-departed` (52 salutations, plural refrains) + `tpl-litany-loreto` (50 Marian invocations, "pray for us") + `collect-fidelium`/`collect-departed-kindred` standalone prayers; sources; STORAGE_KEY v31→v32. Harness + tsc clean; both render, no console errors. Name/pronoun → ACTS-121. Ready for `/save`+`/done` | 2026-08-30 |
| [ACTS-119](ACTS-119.md) |  | Seed — Decade of the Passion (Rosary for the Dead) + How-To | In Progress | — | **Seeded + verified** (session-01). `tpl-rosary-for-the-dead` (rosary, Sorrowful-pinned): prep + "Merciful Jesus" large bead + 10 sufferings ×5 decades + Eternal Rest; source + how-to; STORAGE_KEY v30→v31. Harness 14/14; tsc clean; browser-verified. Name/pronoun deferred to ACTS-121. Ready for `/save`+`/done` | 2026-08-30 |
| [ACTS-118](ACTS-118.md) |  | Decide whether Vessels needs v8's Resource fields + external-app seeds | To Do | — | _New (from ACTS-117 reconcile; JC to decide, low pri)._ v8 §25D Resource Directory is marked "complete via Vessels" — decide: keep Vessels as-is, extend it with v8 resource fields (`app_store_url`, `access_model`, `best_for`…), or seed external apps (Hallow, Laudate…). Then drop the §25D open-question note. Relates ACTS-117/104/52. | 2026-08-29 |
| [ACTS-117](ACTS-117.md) |  | Rebase ACTS-PRD onto v8 + apply reconcile checklist | Done | — | ✅ All ACs met. `docs/ACTS-PRD.md` rebased onto v8 → v3 (restored 1A/9A/10A/12-seeds/23A-B/25A-E/31A-C/Wisdom/50-item DoD); structure + inventory + shipped-notes re-applied; `V8-CODE-GAP.md` decisions folded in; `ACTS-PRD-v3.docx` exported. Handoff [session-02](ACTS-117/session-02.md) | 2026-08-29 |
| [ACTS-116](ACTS-116.md) |  | ACTS status dashboard + signal-ingestion workflow | To Do | — | _Idea, grown from gap review._ Tiles + buckets + editable save-back doc, fronting a signal-ingestion loop (ingest → compare to built → classify built/partial/none/**suggested** → act). Path to **CRAVE** signal intake. Relates ACTS-104/105 | 2026-08-29 |
| ACTS-115 |  | HowTo versioning + multi-source | To Do | — | _v8 gap._ Add HowToVersion + HowToSource + USCCB Rosary How-To seed. Auto How-To exists (ACTS-28) | 2026-08-29 |
| ACTS-114 |  | Full Audio domain | To Do | — | _v8 gap, future/large._ Multi-speaker, voice-follow, record-during-session, usage tracking. Fields stubbed only | 2026-08-29 |
| ACTS-113 |  | Insights + Wisdom (future longitudinal intelligence) | To Do | — | _v8 gap, future._ Grounded Insights → user-named Wisdom w/ evidence links. Never AI-as-God's-will | 2026-08-29 |
| ACTS-112 |  | Prayer metadata: five Prayer Forms + Traditional/My origin | To Do | — | _v8 gap, low pri — validate need._ `prayer_form` + `prayer_origin_type` grouping | 2026-08-29 |
| ACTS-111 |  | Explore: My Intention vs Devotion Intention split | To Do | — | _v8 gap, low pri._ Today intention+petition kinds; explore a UserIntention/DevotionIntention split | 2026-08-29 |
| [ACTS-110](ACTS-110.md) |  | Nested Templates / Template Block | In Progress | — | **Code-complete** (session-01). `template_block` kind + recursive `expandTemplate` (per-block mystery resolution) + cycle guard + `MAX_BLOCK_DEPTH` + `source_template_id` lineage + builder "Devotion block" picker. Unit harness 14/14; tsc clean. Only open AC = downstream realization in **ACTS-107**. Ready for `/save`+`/done` | 2026-08-29 |
| [ACTS-136](ACTS-136.md) |  | Reflection composer — persist in-progress draft + specific daily-readings tag | To Do | — | _Bug found testing ACTS-103._ Two separate composers (Home + `/reflections`) with no shared/persisted draft → a draft typed on Home is **lost** when you open the Reflect page (no "in progress"). Also: daily-readings reflect tag is generic "Daily Readings", not the computed liturgical day (rosary/sessions/knowledge are all specific). Includes Home reflect entry-point audit (accumulation + ACTS-129 `?link=` inconsistency). **High.** Relates ACTS-103/129 | 2026-09-02 |
| [ACTS-135](ACTS-135.md) |  | Reflection organization — optional themes, no-AI tag suggestions, group-by view | In Progress | — | **Built + browser-verified (pending commit).** Optional `themes: string[]`; **no-AI** suggestion engine (`themes.ts`: curated lexicon + own tag-history, dismissible chips — 15/15 harness); `ThemeEditor` in composer + edit dialog; one-page **Group by: Date/Theme/Source** (collapsible, counts, catch-all) + asc/desc. Also **manual web link** (URL+label → new `link` target + `ReflectionLink.url`, Open↗). AI semantic tagging = future opt-in (Cloud). Relates ACTS-103/102/136 | 2026-09-02 |
| [ACTS-134](ACTS-134.md) |  | Reflection capture by voice note + photo→OCR (media pipeline) | To Do | — | _Split from ACTS-103 (part B)._ Voice: record→transcribe→`body` (`mode:"spoken"`); Photo→OCR into editable `body`; both keep the attachment. Rides the deferred Cloud media phase (storage + transcription + OCR providers = external-contract decisions). Relates ACTS-103/102 | 2026-09-02 |
| [ACTS-109](ACTS-109.md) |  | Surface "Pray with the Pope" on Home as a daily session | To Do | — | _v8 gap._ Template **is** seeded (`tpl-pray-with-pope`); just surface on Home. Relates ACTS-10 | 2026-08-29 |
| [ACTS-108](ACTS-108.md) |  | Open Prayer — free-form "from the heart" component | To Do | — | _v8 gap; JC wants._ New `open_prayer` kind; write/speak/leave-open/no-capture; save-as-Personal-Prayer. Relates ACTS-102 | 2026-08-29 |
| [ACTS-107](ACTS-107.md) |  | Novena — 9-Day Rosary for the Faithful Departed (swappable rosary/litany) | Done | ACTS-106 | ✅ **Shipped + verified** ([session-01](ACTS-107/session-01.md)). `tpl-litany-for-the-dead` → "Novena: 9-Day Rosary for the Faithful Departed" (daily×9, Pasiyam notes). Opening/Closing = loose editable prayers under headings; Rosary + Litany = **swappable blocks** via new `TemplateItem.block_options` + Session-Builder "Choose the parts" picker (choice rides in `plan.items`). New `offering-for-the-soul`; dedication now requires a name (no more "her" over a nameless soul); STORAGE_KEY v33→v37. Harness + browser verified. Follow-ons → ACTS-122–128. **Push pending (auth).** | 2026-08-30 |
| [ACTS-106](ACTS-106.md) |  | Seed — Eternal Rest Prayer + surface "Why We're Catholic" (Trent Horn) on Home | Done | — | Shipped (`30aeddf`): Eternal Rest Prayer seeded (`src-eternal-rest`), book retitled "Why We're Catholic" + favorited → Home Vessels pin, STORAGE_KEY v29→v30. All ACs met + browser-verified. Final handoff [session-01](ACTS-106/session-01.md). **Push pending (auth).** Feeds ACTS-107 | 2026-08-29 |
| [ACTS-102](ACTS-102.md) |  | Lectio Divina session — reflection as a first-class session step | Done | — | Shipped (`0192c89`): `reflection` step kind + inline capture → `Reflection` **dual-linked** to movement + session; 4-movement Lectio seed (titled instruction cards), empty-at-open per-session passage (Open-your-Bible + paste-propagation, reference-only), How To (5 links) + Unhurried Living attribution. STORAGE_KEY→v29. All ACs met + browser-verified. Final handoff [session-01](ACTS-102/session-01.md). **Push pending (auth).** | 2026-08-29 |
| [ACTS-103](ACTS-103.md) |  | Reflection redesign — inspiration-in-view panel + voice note & OCR capture | In Progress | — | **Stub (vetted).** Reflection tab shows the inspiration below the box (resolve linked entity, or store an `excerpt` snapshot for pasted book passages); + voice note (transcribe → body, `mode:"spoken"`) and photo→OCR capture (Cloud media phase). Split candidate A/B. Relates ACTS-102 | 2026-08-29 |
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
