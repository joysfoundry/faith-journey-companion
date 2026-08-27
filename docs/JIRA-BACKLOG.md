# ACTS backlog — faith-journey-companion

The numbered story ledger for this repo. **One story per row**, numbered `ACTS-NN`
oldest-first by commit, with the commit(s) that delivered it logged in the last column.
The **EPIC** column is intentionally left blank for JC to fill in — group rows into
epics however you like (a suggested grouping is noted in the section headers).

- **IDs:** `ACTS-NN`, zero-padded, drawn from [`stories/.counter`](../stories/.counter)
  (holds the last-used number; next id = counter+1). This chat is the latest, **ACTS-75**.
- **Board (active view):** [`stories/README.md`](../stories/README.md) — the compact,
  newest-on-top board. This file is the full historical ledger behind it.
- **How this is maintained:** see [Process](#process) at the bottom.

_Statuses: **To Do** · **In Progress** · **Blocked** · **Done**. Commits are on branch
`prd-gap-merge` unless noted._

---

## Foundation — initial build & PRD implementation (Aug 16–17)

| # | EPIC | Type | Summary | Status | Commit(s) |
|---|------|------|---------|--------|-----------|
| ACTS-01 |  | Task  | Scaffold app from TanStack Start template | Done | `3190f79` |
| ACTS-02 |  | Task  | Create PRD implementation plan | Done | `f996d12` |
| ACTS-03 |  | Story | Photo gallery MVP | Done | `3aa9218` |
| ACTS-04 |  | Story | Rebuild landing page & nav | Done | `995eece` |
| ACTS-05 |  | Story | Restructure Home → Prayer | Done | `c362d36` |
| ACTS-06 |  | Story | Add reflections to library | Done | `8041a9d` |
| ACTS-07 |  | Task  | Wire app & rename Library | Done | `3d84f42` |
| ACTS-08 |  | Story | Add Reflect menu & Word section | Done | `b6c64eb`, `6b93c07` |

---

## PRD gap-merge (Aug 18–19) — suggested epic: "ACTS PRD gap-merge into Faith Journey"

| # | EPIC | Type | Summary | Status | Commit(s) |
|---|------|------|---------|--------|-----------|
| ACTS-09 |  | Task  | Merge Add Prayers into a tabbed route | Done | `ec2f379` |
| ACTS-10 |  | Story | Generic External Link component + "Pray with the Pope" preset | Done | `db2af68` |
| ACTS-11 |  | Story | Seed Chaplet of St. Michael | Done | `db2af68` |
| ACTS-12 |  | Story | Generic Scripture component (author-placeable, has citation) | Done | `e0c36fc` |
| ACTS-13 |  | Story | Seed Scriptural Rosary (Luminous) — Scripture before each Hail Mary | Done | `e0c36fc`, `8551e9d` |
| ACTS-14 |  | Story | Promote Reflection / Learning / Mass to persisted entities | Done | `bc3009d` |
| ACTS-15 |  | Task  | Rename "Formation" → "Learn"; collection = "Life Library" | Done | `ba8dcb3` |
| ACTS-16 |  | Task  | Remove home greeting (user replacing it) | Done | `0e7c4b6` |
| ACTS-17 |  | Story | Redesign "Add Prayer" — single vs devotion; manual / URL / photo intake | Done | `8bd66c3` |
| ACTS-18 |  | Story | PrayerMedia — audio/video links + short recorded/uploaded clips (≤1.5 MB) | Done | `8bd66c3` |
| ACTS-19 |  | Story | Add-Prayer review-before-save + URL fetch returns page title | Done | `8bd66c3` |
| ACTS-20 |  | Story | Prayer library — read-only details view + row actions (pray / edit / expand) | Done | `db345d2` |
| ACTS-21 |  | Bug   | Fix prayer editor hydration race on hard reload / deep-link | Done | `4ce5fb1` |
| ACTS-22 |  | Story | Redesign devotion builder — add+type, review, auto How-To | Done | `e79af8f` |
| ACTS-23 |  | Story | Builder: inline insert-between + fully-expanded Preview | Done | `fe11b22` |
| ACTS-24 |  | Story | Builder: hover-only "+" type dropdown; Source name + URL | Done | `1f0fba1` |
| ACTS-25 |  | Story | Fixed mystery set on templates (pin Luminous, etc.) | Done | `e79af8f` |
| ACTS-26 |  | Story | Petition + Meditation item kinds | Done | `e79af8f` |
| ACTS-27 |  | Story | Template-level audio links (uploads stubbed) | Done | `e79af8f` |
| ACTS-28 |  | Story | Auto-generate a numbered "How to pray …" guide on save | Done | `e79af8f` |
| ACTS-29 |  | Bug   | Mysteries show "First Luminous Mystery" + title + description everywhere | Done | `8551e9d` |
| ACTS-30 |  | Story | Rosary: label each decade ("1st decade" …) in Pray mode | Done | `f0ef646`, docs `7a419e3` |

---

## Prayer Sessions / Session Builder (Aug 20)

| # | EPIC | Type | Summary | Status | Commit(s) |
|---|------|------|---------|--------|-----------|
| ACTS-31 |  | Story | Session Builder: saved sessions, listen picker + scheduler fields | Done | `6ca5f42` |
| ACTS-32 |  | Task  | Extract shared DevotionItemsEditor; reuse in Template Builder | Done | `36c8ed2` |
| ACTS-33 |  | Story | Session Builder: editable items, optional template, save-as-template | Done | `13e3a7f` |
| ACTS-34 |  | Story | Session Builder ⋯ menu — rename, delete, clear, save | Done | `6ed65c9`, `f855431`, `dbc7640` |
| ACTS-35 |  | Story | Builder items: collapse by default, caret to expand | Done | `900bfb8` |
| ACTS-36 |  | Story | Session Builder: custom recurrence, Liturgy Hours, duration | Done | `9009194` |
| ACTS-37 |  | Story | Prayer Sessions: split into Session Builder + Sessions tabs | Done | `a03c333` |
| ACTS-38 |  | Task  | Naming: reconcile "template" → "devotion" across the UI | Done | `3fa2d45` |
| ACTS-39 |  | Story | Sessions: duplicate action + recurrence rolls forward on finish | Done | `6e2764f` |
| ACTS-40 |  | Story | Landing search: pray a prayer, and finishing saves it as a session | Done | `a6a4109`, docs `894d0ac`, `af79346` |

---

## Recurrence & library redesign (Aug 21)

| # | EPIC | Type | Summary | Status | Commit(s) |
|---|------|------|---------|--------|-----------|
| ACTS-41 |  | Story | Unified calendar recurrence (RRULE), novena removal, library redesign | Done | `528394f`, docs `8d84f37` |

---

## USCCB basic prayers seed (Aug 21)

| # | EPIC | Type | Summary | Status | Commit(s) |
|---|------|------|---------|--------|-----------|
| ACTS-42 |  | Story | Seed USCCB basic prayers; point USCCB source at basic-prayers; STORAGE_KEY v7→v8 | Done | `e2d834a`, `36a8596`, docs `f997ed4`/`749babe`/`dcb9afb`/`713c5b3` |

---

## Song / hymn prayer type (Aug 21)

| # | EPIC | Type | Summary | Status | Commit(s) |
|---|------|------|---------|--------|-----------|
| ACTS-43 |  | Story | Add Song prayer type with selectable verse/chorus segments | Done | `0684468` |
| ACTS-44 |  | Story | Seed Caro hymns + family prayers; rebuild Caro Family Rosary | Done | `f00ec43`, docs `2caa2cc` |

---

## Home redesign & session states (Aug 21–22)

| # | EPIC | Type | Summary | Status | Commit(s) |
|---|------|------|---------|--------|-----------|
| ACTS-45 |  | Story | Home redesign: section cards, editable daily devotion, today's sessions | Done | `0b4bff4` |
| ACTS-46 |  | Story | Reflection journal: single-entry view with edit/delete | Done | `0531613` |
| ACTS-47 |  | Story | Home: show completed sessions as Done (start / continue / done) | Done | `c614efc`, `2fffb85` |
| ACTS-48 |  | Bug   | Sessions: name a single ad-hoc prayer by its own name, not "Session" | Done | `4b3b58a` |
| ACTS-49 |  | Task  | Prayer picker: sort prayers/songs alphabetically by title | Done | `4ad7b57` |
| ACTS-50 |  | Task  | Nav: rename the Pray tab to Plan (route unchanged) | Done | `330e2ae` |
| ACTS-51 |  | Task  | Home: typography cohesion across the cards | Done | `0868d1c` |

---

## Knowledge library — unify (Aug 22)

| # | EPIC | Type | Summary | Status | Commit(s) |
|---|------|------|---------|--------|-----------|
| ACTS-52 |  | Story | Knowledge library: unify Learn, Programs, and Resources into one model | Done | `3ee7760` |
| ACTS-53 |  | Story | Seed "Why We Are Catholic" (Trent Horn); bump STORAGE_KEY v14 | Done | `31095f1` |

---

## Liturgical day titles (Aug 22)

| # | EPIC | Type | Summary | Status | Commit(s) |
|---|------|------|---------|--------|-----------|
| ACTS-54 |  | Story | Home Word card: name the liturgical day (season + saint/feast/solemnity) | Done | `86669ab`, TODO `dc1fc15` |

---

## Mystery-detail versions (Aug 22)

| # | EPIC | Type | Summary | Status | Commit(s) |
|---|------|------|---------|--------|-----------|
| ACTS-55 |  | Story | Mysteries: selectable body versions per mystery | Done | `68d9627` |
| ACTS-56 |  | Story | Mysteries: version authoring editor | Done | `fe1b7e9`, docs `33661af` |

---

## Litany devotions (Aug 22)

| # | EPIC | Type | Summary | Status | Commit(s) |
|---|------|------|---------|--------|-----------|
| ACTS-57 |  | Story | Litany: seed three public-domain litanies as devotions | Done | `7570737`, docs `2b2f7a8` |

---

## Knowledge → Vessels (Voice / Channel / Content) (Aug 23–24)

| # | EPIC | Type | Summary | Status | Commit(s) |
|---|------|------|---------|--------|-----------|
| ACTS-58 |  | Bug   | Fix: compute today's date in local time, not UTC | Done | `01b1ad8` |
| ACTS-59 |  | Story | Knowledge: Voice → Channel → Content model | Done | `fc3dc0c` |
| ACTS-60 |  | Story | Knowledge: seed author Voices; attribute books to them | Done | `ba2e444` |
| ACTS-61 |  | Story | Knowledge: unify add and edit onto one record page | Done | `2df7588`, `effc1c3` |
| ACTS-62 |  | Story | Word: show the author Voice in the reading-program subtitle | Done | `aa61f04`, `ce488e4`, docs `ca3ed61` |
| ACTS-63 |  | Story | Knowledge: surface content channel_id in the UI | Done | `6da5038` |
| ACTS-64 |  | Story | Knowledge: inline "By Voice" grouped Library view (+ expand/collapse) | Done | `7c34253`, `b540884`, `ee12285` |
| ACTS-65 |  | Task  | Knowledge: clearer content count on Voice rows | Done | `f51948d` |
| ACTS-66 |  | Bug   | Knowledge: stop empty draft Voices becoming "Untitled" ghosts | Done | `ae7024a` |
| ACTS-67 |  | Story | Knowledge: byline falls back to link platform for unattributed content | Done | `db17f3a`, docs `7c4f105` |
| ACTS-68 |  | Story | Knowledge: add Quote as a content type | Done | `6ec2742` |
| ACTS-69 |  | Story | Seed: St. Padre Pio Voice + a quote as the Quote-type example | Done | `e851154` |
| ACTS-70 |  | Story | Knowledge: add search to the Library, like the Prayers page | Done | `8c98d2f` |
| ACTS-71 |  | Task  | Rename: Voices → Vessels, and the section Knowledge → Vessels | Done | `6e607f2`, docs `2afc219` |

---

## Account Settings + Bible app (Aug 25)

| # | EPIC | Type | Summary | Status | Commit(s) |
|---|------|------|---------|--------|-----------|
| ACTS-72 |  | Story | Links: open all external links in a new tab (ExternalLink component) | Done | `9f94632`, `5a8b753` |
| ACTS-73 |  | Story | Settings: add Bible app, translation, and Online Bible link | Done | `1527cdd`, docs `b476fd0` |

---

## Workflow & tracking (Aug 25)

| # | EPIC | Type | Summary | Status | Commit(s) |
|---|------|------|---------|--------|-----------|
| ACTS-74 |  | Chore | Set up local ACTS story board (Git-tracked, no Jira) | Done | `b1d7e74` |
| [ACTS-75](../stories/ACTS-75.md) |  | Chore | Number the backlog into ACTS stories (oldest-first) + EPIC column + process docs | Done | `f33c564` … `2ab5d5f` (this chat) |

---

## 🔜 Open — backlog (numbered)

Every open story now carries an `ACTS-NN` id so you can reference it when starting a chat
(`/start ACTS-NN`). Not yet started — IDs are reserved; `.counter` is **92**, so brand-new
work beyond this list starts at ACTS-93. **An id links to its pointer file when one exists**
(created when the story is started); otherwise it's plain text.

| # | EPIC | Priority | Type | Status | Summary | Detail |
|---|---|---|---|---|---|---|
| [ACTS-76](../stories/ACTS-76.md) |  | P1 | Story | In Progress | **Pray-mode tracker (ACTS-style)** | Prominent current item, **completed prayers grayed out**, **auto-scroll** as you advance. Preview already emits the fully-expanded list. |
| ACTS-77 |  | P2 | Story | To Do | **Touch drag-and-drop in builder** | Current reorder uses HTML5 DnD (desktop only). Add a touch lib (e.g. dnd-kit). |
| ACTS-78 |  | P2 | Task | To Do | **Push `main` + Publish in Lovable** | Merge → `main` already done locally (fast-forward to `f9f51a0`); PR not needed. Remaining: `git push origin main`, then confirm Lovable sync + click **Publish** for the public `*.lovable.app` URL. |
| ACTS-79 |  | P2 | Story | To Do | **Mystery-detail variant picker (Scripture vs meditation)** | Partly delivered by ACTS-55/56 (selectable bodies + authoring editor). Remaining: let the Session/Template **choose which variant to present**. Examples: `~/Downloads/Mysteries 1.md` (Scripture), `Mysteries 2.md` (meditation). |
| ACTS-80 |  | P3 | Story | To Do | **Per-prayer media in devotion import** | Audio/video attaches to single prayers; bundle import currently doesn't — add media per detected prayer. |
| ACTS-81 |  | P3 | Story | To Do | **Real OCR for photo intake** | Photo intake is a manual-transcribe seam; wire client-side OCR (tesseract.js) or cloud. |
| ACTS-82 |  | P3 | Story | To Do | **Enable Supabase persistence** | fjc's snake_case model maps 1:1 to Postgres; move the localStorage store to Supabase. Unlocks real shared/persistent data for a public audience — and is the **backend for auth** (ACTS-87/88). |
| ACTS-83 |  | P3 | Bug | To Do | **Hydration race on remaining edit routes** | Fixed for prayer editor + template builder; audit other `useState`-from-store routes and gate on `ready`. |
| ACTS-84 |  | P3 | Task | To Do | **Repetition-count input design** | Current ×N control is a −/+ stepper — tedious for ×10/×53. Recommend tap-the-"×N"-to-type. |
| ACTS-85 |  | P4 | Story | To Do | **Restore "start from existing template" (Duplicate)** | Removed in the builder redesign; re-add as a Duplicate action if wanted. |
| ACTS-86 |  | P4 | Story | To Do | **ACTS framing** | Thread Adoration · Contrition · Thanksgiving · Supplication where it fits (branding / prayer categorization). |
| ACTS-87 |  | P2 | Story | To Do | **Auth — email login + session** | _New._ Email/password sign-in, session persistence, sign-out, protected/authed state in the app shell. Likely **Supabase Auth** → depends on / relates to ACTS-82. |
| ACTS-88 |  | P2 | Story | To Do | **Account creation — sign up with email** | _New._ Email sign-up + verification, create a profile/account record, then the localStorage data becomes per-account. Pairs with ACTS-87; relates to ACTS-82. |
| [ACTS-89](../stories/ACTS-89.md) |  | P2 | Story | To Do | **Guided-prayer expand/collapse + expand-all/collapse-all** | _New (spinoff)._ Per-prayer expand/collapse **and** an expand-all/collapse-all control in the **guided prayer (Pray mode)** view (`src/routes/pray.tsx`); test the usage/interaction in that view. |
| [ACTS-90](../stories/ACTS-90.md) |  | — | Decision | Decided | **Platform — mobile-first, mobile web, no app store** | _Recorded decision (not a build story)._ Mobile-first, delivered as **mobile web (web-view first), NOT the app store**. **Leaning PWA but parked** — don't build PWA plumbing until JC confirms. |
| [ACTS-91](../stories/ACTS-91.md) |  | P2 | Story | **Done** | **Testing convention — tests documented + tracked as a task** | Every code-change story documents tests (Tests section in [`_TEMPLATE.md`](../stories/_TEMPLATE.md)) and tracks the testing work; shared E2E flow catalog [`docs/E2E-TEST-PLAN.md`](E2E-TEST-PLAN.md); Process rule #7. Harness build split to ACTS-92. |
| [ACTS-92](../stories/ACTS-92.md) |  | P2 | Story | To Do | **Set up the test harness (deferred)** | _Spun off from ACTS-91._ Vitest + Testing Library (unit/integration) + Playwright (E2E); mock `scrollIntoView`/`matchMedia`/`localStorage`; `test` + `test:e2e` scripts; smoke test per layer; CI on push; backfill ACTS-76 tests. **Blocks executable tests for every story.** |

---

## Process

How the ACTS backlog is numbered and kept current — so this doesn't drift:

1. **Numbering.** Every completed unit of work gets one `ACTS-NN` row, numbered
   oldest-first by the commit that delivered it. Numbers are permanent — they never
   get renumbered when new rows are inserted; new work always takes the next number.
   Open/not-yet-started stories are also numbered so they're easy to reference when
   starting a chat (`/start ACTS-NN`); their id is reserved until the work is done.
2. **Commits.** Each row logs the commit hash(es) that delivered it. A row can carry
   several commits (implementation + fixups + its `docs:` handoff).
3. **EPIC column.** Left blank on purpose — JC fills it in to group rows into epics.
   The section headers above are a suggested grouping, not the epic assignment.
4. **The counter.** [`stories/.counter`](../stories/.counter) holds the last-used
   number (currently **92** — ACTS-01…75 done + ACTS-76…92 filed as stories). The
   next brand-new story beyond the current backlog is ACTS-93.
5. **One chat = one story.** Each working session is tied to a single ACTS story;
   its handoff lives at `stories/ACTS-NN/session-NN.md` (see
   [`stories/_TEMPLATE.md`](../stories/_TEMPLATE.md)). The compact active board is
   [`stories/README.md`](../stories/README.md); this file is the full ledger.
6. **No Jira.** Per [`.claude/workflow.json`](../.claude/workflow.json) the tracker is
   `none` — this repo is the tracker. Follow `~/.claude/commands/WORKFLOW.md` but skip
   every Jira/sync step.
7. **Testing — applies to every story** (convention: **ACTS-91**, Done). Each code-change
   pointer **documents** tests in a **Tests** section (unit · integration · E2E), enforced by
   [`stories/_TEMPLATE.md`](../stories/_TEMPLATE.md), **and** tracks the testing work as a task.
   The shared E2E flow catalog is [`docs/E2E-TEST-PLAN.md`](E2E-TEST-PLAN.md). No runner is
   wired yet — the harness build is deferred to **ACTS-92**, so coverage stays **planned**
   until it lands. **Historical Done rows (ACTS-01…75)** aren't retrofitted one-by-one; their
   shipped features are covered collectively by the E2E flow catalog (E1–E15). New/active
   stories fill in their own Tests section going forward.

_This ledger was generated 2026-08-25 from `git log` + the prior gap-merge backlog and
`HANDOFF.md`. See `HANDOFF.md` for run/architecture context._
