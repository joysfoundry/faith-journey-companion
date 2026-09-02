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
| [ACTS-76](../stories/ACTS-76.md) |  | P1 | Story | **Done** | **Pray-mode tracker (ACTS-style)** | Prominent current item (NOW badge + ring), **completed prayers grayed out**, **auto-scroll** as you advance + on tab-switch. Shipped `ee726b3`/`61cf1ca`; tests planned under ACTS-92. |
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
| [ACTS-98](../stories/ACTS-98.md) |  | P4 | Story | To Do | **Month calendar in Plan > Sessions — color-coded dots + upcoming list** | _New._ **Low priority.** Month grid on the **Sessions** view (no new tab/route): each day shows color-coded dots for prayer sessions / planned sessions / daily readings / programs / past reflections; below it, a list of upcoming sessions for the next month. Supersede the orphaned `/calendar` route. Dot-color encoding TBD w/ JC. Relates ACTS-96/97. |
| [ACTS-102](../stories/ACTS-102.md) |  | P3 | Story | **Done** | **Lectio Divina session — reflection as a first-class session step** | Shipped (`0192c89`). 4-movement Lectio (Read/Reflect/Respond/Rest) = session + prayer + reflection. `reflection` step kind (`TemplateItemKind`+`SessionItemKind`) + inline capture → `Reflection` (`mode:"written"`) **dual-linked** to movement (`session_item`) + session (`prayer_session`); one `db.reflections` store. Titled instruction cards; empty-at-open per-session passage (reference-only + Open-in-Bible + paste-propagation); How To with 5 links + Unhurried Living (Fadling) attribution. STORAGE_KEY→v29. All ACs met + browser-verified; handoff `stories/ACTS-102/session-01.md`. Relates ACTS-103. |
| [ACTS-103](../stories/ACTS-103.md) |  | P4 | Story | To Do | **Reflection redesign — inspiration-in-view panel + voice note & OCR capture** | _New (stub, vetted)._ Reflection tab shows the inspiration in plain sight (resolve linked entity, or store an `excerpt` snapshot on `ReflectionLink` for pasted book passages) + capture by **voice note** (transcribe → `body`, `mode:"spoken"`) and **photo→OCR** of a paper journal (Cloud media phase; `photo_count` reserved). Split candidate: (A) view panel vs. (B) voice+OCR. Relates ACTS-102. |
| [ACTS-104](../stories/ACTS-104.md) |  | P2 | Story | **Done** | **Vision PRD v2 — reconcile doc with reality + /prd-sync skill** | Moved the combined business+technical PRD in-repo as [`docs/ACTS-PRD.md`](ACTS-PRD.md) (v2): Faith Journey=umbrella / **ACTS**=prayer-first product; added the missing front matter (What it is · Problem · Solution/wedge · Origin · Position) + a `[Shipped]/[Partial]/[Future]` "What's shipped today" inventory; taxonomy + shipped-notes updated; new §35 Share & Follow-Along. Built the **global** `/prd-sync` skill (`~/.claude/skills/prd-sync`, not repo-tracked) + `docs/.prd-sync` pointer + `.docx` for Google. Relates ACTS-101/102/105. |
| [ACTS-105](../stories/ACTS-105.md) |  | P3 | Story | To Do | **Evolve /prd-sync → "canon / doc sync" + apply to CRV** | _New._ Grow `/prd-sync` from single-PRD reconcile into a **canon/doc sync**: change the canonical source (e.g. the vision) → cascade proposed updates to all related/derived docs (non-destructive, review-first). Generalize `docs/.prd-sync` into a canon+derived manifest; protect hand-edited docs; validate on **CRV** too. Depends ACTS-104. |
| [ACTS-108](../stories/ACTS-108.md) |  | P2 | Story | To Do | **Open Prayer — free-form "from the heart" component** | _New (v8 gap review; JC wants)._ PRD v8 §23A/23B. No `open_prayer` item kind today. Words *to God* (distinct from intention/petition and from Reflection). Capture: write / speak→transcribe / leave-open / pray-without-capture; optional save-as-Personal-Prayer; transcription toggle distinct from Voice-Follow & Record. Relates ACTS-102. |
| [ACTS-109](../stories/ACTS-109.md) |  | P3 | Story | To Do | **Surface "Pray with the Pope" on Home as a daily session** | _New (v8 gap review)._ Correction: template **is** seeded (`tpl-pray-with-pope`, vaticannews). Not a reseed — just surface it on Home / Today's Devotions as an optional startable daily session. Relates ACTS-10. |
| [ACTS-110](../stories/ACTS-110.md) |  | P3 | Story | To Do | **Nested Templates / Template Block** | _New (v8 gap review)._ PRD v8 §10A/31C. No `template_block` kind. Reuse a whole Template inside a Session; compiler recursively expands, rejects circular nesting, bounds depth, keeps lineage. First consumer = the Rosary+Litany composite. Relates **ACTS-107**. |
| ACTS-111 |  | P4 | Story | To Do | **Explore: My Intention vs Devotion Intention split** | _New (v8 gap review; JC low pri, "not sure we need")._ PRD v8 §25A. Today `intention`+`petition` kinds; no UserIntention/DevotionIntention domain split. Explore whether the split earns its keep. |
| ACTS-112 |  | P4 | Story | To Do | **Prayer metadata: five Prayer Forms + Traditional/My origin** | _New (v8 gap review; JC low pri, "not sure needed")._ PRD v8 §25B (five forms) + §6/31A (`prayer_origin_type`, "Traditional Prayers" vs "My Prayers"). Grouped as one metadata exploration; validate the need before building. |
| ACTS-113 |  | P4 | Story | To Do | **Insights + Wisdom — future longitudinal intelligence** | _New (v8 gap review; JC "create story")._ PRD v8 §1A/3/28/32. Grounded pattern-recognition (Insights) → user-owned, user-named **Wisdom** with evidence links. Never AI-as-God's-will. Future; groups the two designed-as-a-pair concepts. |
| ACTS-114 |  | P4 | Story | To Do | **Full Audio domain** | _New (v8 gap review; JC "create story")._ PRD v8 §15–21. Multi-speaker recordings, template/session/item audio, voice-follow, full-session vs assembled, record-during-session, usage tracking. Fields stubbed only today. Future / large. |
| ACTS-115 |  | P4 | Story | To Do | **HowTo versioning + multi-source** | _New (v8 gap review; JC "keep open")._ PRD v8 §12. Auto How-To exists (ACTS-28); missing `HowToVersion` (edit imported without destroying source) + `HowToSource` (many-to-many, primary flag) + a USCCB-sourced Rosary How-To seed. |
| [ACTS-116](../stories/ACTS-116.md) |  | P3 | Story | To Do | **ACTS status dashboard + signal-ingestion workflow** | _New (JC idea, grown from the gap review)._ Living dashboard reusing the gap-artifact components JC liked — **status stat tiles** (built/partial/none/total) + **status buckets** + a **link to an editable save-back doc** — fronting a **signal-ingestion workflow**: ingest new signals → compare to what's built → classify (built/partial/not-built/**suggested**) → surface + act. Same engine as **ACTS-105** (`/prd-sync`→canon sync), generalized to a continuous feed; the path to **CRAVE** signal intake. Relates ACTS-104/105. |
| [ACTS-117](../stories/ACTS-117.md) |  | P2 | Story | **Done** | **Rebase ACTS-PRD onto v8 + apply reconcile checklist** | Shipped (`4250a1d`, `872872c`, `416a9a6`). Made **v8** the content base of `docs/ACTS-PRD.md` → **v3** (restored 1A/9A/10A, §12 seeds, 23A-B, 25A-E, 31A-C, Wisdom, clean 50-item DoD); re-applied Mission + two-part flow + Solution-Idea + "What's shipped" inventory + shipped-notes; folded in [`V8-CODE-GAP.md`](V8-CODE-GAP.md) decisions (Vessels=label, Resource Dir via Vessels, Session Purpose=free-text name, Pope IS seeded); added shipped-but-absent sections; exported `ACTS-PRD-v3.docx`. All ACs met; handoff [session-02](../stories/ACTS-117/session-02.md). Spun off ACTS-118. Relates ACTS-104. |
| [ACTS-118](../stories/ACTS-118.md) |  | P4 | Story | To Do | **Decide whether Vessels needs v8's Resource fields + external-app seeds** | _New (from ACTS-117 reconcile; JC to decide, low pri)._ PRD v8 §25D/§31A. Resource Directory is marked "complete via Vessels" — decide: keep Vessels as-is, extend with v8 resource fields (`app_store_url`, `access_model`, `best_for`…), or add a distinct Resource concept + external-app seeds (Hallow, Laudate…). Then drop the §25D open-question note. Relates ACTS-117/104/52/59/71. |
| [ACTS-129](../stories/ACTS-129.md) |  | P2 | Bug | **Done** | **Reflection icon on session rows, session detail, and vessel items** | Reflect NotebookPen was only on the Home Daily-Rosary + Word rows. Added it to Home **Continue/Today/Done** session rows (pre-links the session in Home `linkables`), the **session-detail** header (next to Share), and every **Formation `ContentRow`**. New `/reflections?link=<id>` search → `prefillLinkId`; knowledge-detail "Reflect on this" now passes it too. Browser-verified. Pending commit. Relates ACTS-102/103. |
| [ACTS-130](../stories/ACTS-130.md) |  | P3 | Bug | **Done** | **Vessel status — only completable works; sort above references** | Every non-quote item showed status pills. New `hasStatus(category)` (book/program/video/podcast) gates the pills in `ContentRow` + knowledge detail; `byStatusThenRecent` now ranks status-bearing items first, then references (article/post/quote) by recency. "General website" = article + post (JC decision). Browser-verified. Pending commit. Relates ACTS-129. |
| [ACTS-131](../stories/ACTS-131.md) |  | P2 | Task | **Done** | **Seed — Mater Dei Catholic Parish Prayer** | Seeded `mater-dei-parish-prayer` (devotional) with the full parish-card body + closing responsory (Leader "Mater Dei" / All "Lead us to your son Jesus. Amen!"); new `src-mater-dei` manual source (Diocese of San Diego, est. 2004); tags parish/community/mater dei; STORAGE_KEY v37→v38. Appears + renders in the Prayer Library. Browser-verified. Pending commit. |
| [ACTS-132](../stories/ACTS-132.md) |  | P2 | Bug | **Done** | **Session "Day N of M" counts from the session's own date** | A recurring plan's `date` rolls forward to its next occurrence as sessions finish (`finishSession`), so deriving "Day N of M" from `plan.date` showed the plan's *current* day on every session (past/future). `src/routes/session.$sessionId.tsx` now counts from `session.context.date` (the day the session was prayed), falling back to `plan.date`/`starts_on`. `tsc` clean. Shipped `d89727a`. Relates ACTS-107/99. |
| [ACTS-134](../stories/ACTS-134.md) |  | P3 | Bug | **Done** | **Vessels — A–Z sort within tiers + reseed USCCB/Hallow/Why We're Catholic** | Two Vessels-section bugs. (1) `byStatusThenRecent` (ACTS-130) buried a not-started book with old/empty `created_at` at the bottom of the status tier → replaced with `byStatusThenTitle`: status-bearing items first, then references, **A–Z by title** within each tier; removed unused `STATUS_RANK`; updated all 4 call sites. (2) USCCB/Hallow/*Why We're Catholic* are seeded but `loadDatabase()` shallow-merge lets divergent local data hide them → bumped `STORAGE_KEY` v38→v39 to force a reseed. `tsc` clean. Pending commit. Relates ACTS-130/133. |

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
