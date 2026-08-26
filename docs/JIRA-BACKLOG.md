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
| ACTS-75 |  | Chore | Number the backlog into ACTS stories (oldest-first) + EPIC column + process docs | In Progress | _this chat — pending commit_ |

---

## 🔜 Open — not yet started

Future work, un-numbered until picked up. When you start one, it takes the next
`ACTS-NN` from [`.counter`](../stories/.counter) (so the next started story is ACTS-76).

| Priority | Type | Summary | Detail |
|---|---|---|---|
| P1 | Story | **Pray-mode tracker (ACTS-style)** | Prominent current item, **completed prayers grayed out**, **auto-scroll** as you advance. Preview already emits the fully-expanded list. |
| P2 | Story | **Touch drag-and-drop in builder** | Current reorder uses HTML5 DnD (desktop only). Add a touch lib (e.g. dnd-kit). |
| P2 | Task | **Push `prd-gap-merge` + open PR** | Sandbox can't push. `git push -u origin prd-gap-merge`, then PR into main. |
| P2 | Story | **Mystery-detail versions (Scripture vs meditation)** | Partly delivered by ACTS-55/56 (selectable bodies + authoring editor). Remaining: let the Session/Template **choose which variant to present**. Examples: `~/Downloads/Mysteries 1.md` (Scripture), `Mysteries 2.md` (meditation). |
| P3 | Story | **Per-prayer media in devotion import** | Audio/video attaches to single prayers; bundle import currently doesn't — add media per detected prayer. |
| P3 | Story | **Real OCR for photo intake** | Photo intake is a manual-transcribe seam; wire client-side OCR (tesseract.js) or cloud. |
| P3 | Story | **Enable Supabase persistence** | fjc's snake_case model maps 1:1 to Postgres; move the localStorage store to Supabase. |
| P3 | Bug | **Hydration race on remaining edit routes** | Fixed for prayer editor + template builder; audit other `useState`-from-store routes and gate on `ready`. |
| P3 | Task | **Repetition-count input design** | Current ×N control is a −/+ stepper — tedious for ×10/×53. Recommend tap-the-"×N"-to-type. |
| P4 | Story | **Restore "start from existing template" (Duplicate)** | Removed in the builder redesign; re-add as a Duplicate action if wanted. |
| P4 | Story | **ACTS framing** | Thread Adoration · Contrition · Thanksgiving · Supplication where it fits (branding / prayer categorization). |

---

## Process

How the ACTS backlog is numbered and kept current — so this doesn't drift:

1. **Numbering.** Every completed unit of work gets one `ACTS-NN` row, numbered
   oldest-first by the commit that delivered it. Numbers are permanent — they never
   get renumbered when new rows are inserted; new work always takes the next number.
2. **Commits.** Each row logs the commit hash(es) that delivered it. A row can carry
   several commits (implementation + fixups + its `docs:` handoff).
3. **EPIC column.** Left blank on purpose — JC fills it in to group rows into epics.
   The section headers above are a suggested grouping, not the epic assignment.
4. **The counter.** [`stories/.counter`](../stories/.counter) holds the last-used
   number (currently **75**). The next started story is ACTS-76.
5. **One chat = one story.** Each working session is tied to a single ACTS story;
   its handoff lives at `stories/ACTS-NN/session-NN.md` (see
   [`stories/_TEMPLATE.md`](../stories/_TEMPLATE.md)). The compact active board is
   [`stories/README.md`](../stories/README.md); this file is the full ledger.
6. **No Jira.** Per [`.claude/workflow.json`](../.claude/workflow.json) the tracker is
   `none` — this repo is the tracker. Follow `~/.claude/commands/WORKFLOW.md` but skip
   every Jira/sync step.

_This ledger was generated 2026-08-25 from `git log` + the prior gap-merge backlog and
`HANDOFF.md`. See `HANDOFF.md` for run/architecture context._
