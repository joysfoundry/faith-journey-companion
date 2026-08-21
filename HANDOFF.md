# Handoff — PRD gap-merge

_Last updated: 2026-08-21T15:12-07:00 · branch `prd-gap-merge` (**not yet pushed** — sandbox has no GitHub auth; latest `e2d834a`)_

## What this is
Merging the **ACTS PRD** capabilities into **faith-journey-companion** (the app whose UX we're keeping). The ACTS Next.js build in `../acts` is now just the reference/spec + test oracle. Decision: **gap-merge into fjc, keep the localStorage store** (no Supabase persistence yet).

## Done this session — USCCB basic prayers seed (2026-08-21, `e2d834a`)
Seeded the basic prayers from the [USCCB basic-prayers list](https://www.usccb.org/prayer-and-worship/prayers-and-devotions/prayers/basic-prayers) into `src/lib/prayer/seed.ts`.
- **Added 13 prayers** not already in the seed, each with **traditional public-domain text** and `source_id: "src-usccb"`: Guardian Angel, Morning Offering, Nicene Creed, Act of Contrition, Act of Faith/Hope/Love, Angelus, Regina Caeli, Anima Christi, Divine Praises, Memorare, O Sacrum Convivium, Tantum Ergo, Prayer to Our Lord Jesus Christ Crucified.
- **Chaplet of Divine Mercy omitted** — it's on the USCCB list but is a multi-part *devotion* (like the St. Michael Chaplet), not a flat prayer. Left out deliberately; build as a template later if wanted.
- **Copyright care:** did NOT copy USCCB's page text (the modern ICEL translations are copyrighted — e.g. Nicene Creed uses "being of one substance with the Father", not the 2011 "consubstantial"). Only the *provenance URL* points at USCCB. The web-fetch "content filtering" blocks were tripping on large verbatim liturgical blocks; worked around by writing traditional public-domain text directly, one prayer per edit.
- **Repointed** the `src-usccb` source record at the basic-prayers URL.
- **Reverted** an interim change: the 5 shared universal prayers (Our Father, Hail Mary, Glory Be, Apostles' Creed, Hail Holy Queen) were briefly stamped `src-usccb`, then **rolled back to their default `src-tradition`** — they're shared across every rosary devotion, so USCCB *alignment* on them is the later icon job, not a source rewrite.
- **Verified:** `npx tsc --noEmit` clean on `seed.ts`; grep confirms `src-usccb` = source def + pre-existing Scriptural-Rosary template + 13 new prayers (15 total), and 0 shared prayers left on `src-usccb`. **NOT verified in-browser** (see the STORAGE_KEY gotcha below — new prayers won't render until the key bumps).

### Sourcing model — decisions settled this session (fix later, not blocking)
- **Source = how a devotion/prayer was imported** (URL for video/website/audio, or text typed in from a document/card — already implemented). `src-tradition` is the pre-existing generic default for un-sourced built-ins (via the `prayer()` helper's `sourceId = "src-tradition"` default), not a Caro-specific thing.
- **Built-in prayers & devotions SHOULD have a real source** — cleanup deferred.
- **Non-USCCB seeded prayers should carry the source they were originally seeded from** — e.g. the 54-Day Rosary content → `54dayrosary.org` (currently `src-54-day-pdf`). Revisit per-prayer/per-devotion origins on the same pass.
- **Caro Family Rosary is fine as its own source** — this ships **to family now**. Wider distribution will revisit sourcing/copyright.
- **"Matches USCCB" is a later, two-level job:** devotion carries the source; individual prayers inherit the devotion-level source and get a small **icon/badge when the text matches USCCB**. Not built yet.

## Terminology (settled — memory: `devotion-session-terminology`)
Three layers: **Prayer** (one prayer's text) → **Devotion** (a reusable bundle of prayers — Rosary, Chaplet; the code type `PrayerTemplate`; housed in the Prayers library "Devotions" tab; prayers-only, no schedule) → **Session** (a plan to pray a devotion or ad-hoc prayers, with schedule + per-session edits; `SessionPlan`; lives in Prayer Sessions `/pray`). **User-facing text says "Devotion", never "template"** — but code identifiers keep `template` (`PrayerTemplate`, `db.templates`, `/template/$templateId`, `pickTemplate`). Directions: Devotion → seeds a Session; Session → "Save as devotion" (prayers-only). You build a session *from* a devotion; you don't save a devotion *as* a session.

## Run it
```bash
npm install          # bun.lock exists but npm works (package-lock is gitignored)
npm run dev          # http://localhost:8080
npx tsc --noEmit     # typecheck (ignore routeTree.gen / .tanstack noise)
npx tsx scripts/verify-merge.ts   # deterministic compiler/acceptance checks
npm run build        # full prod build (nitro)
```

## Architecture (fjc)
TanStack Start (SSR + server fns) · React · TS · shadcn/ui · Tailwind. Supabase is wired for **auth only** — the domain data lives in a **localStorage repository** (`src/lib/prayer/store.ts`). Pattern: pure reducers in `mutations`, wired via `setDb` in `src/components/app-store-provider.tsx`, typed in the `AppStore` interface. **`STORAGE_KEY` is `prayer-companion-db-v5`** — bump it whenever the seed changes so fixtures reload. Deterministic session compiler in `src/lib/prayer/compiler.ts`; seed in `src/lib/prayer/seed.ts`; types in `src/lib/prayer/types.ts`; taxonomy in `src/domain/taxonomy.ts` (3 axes: prayer_type / expression_type / devotion_type).

## Done (see JIRA backlog for the ticket list)
Generic **External Link** + Pray with the Pope · **Chaplet of St. Michael** · generic **Scripture** component + **Scriptural Rosary (Luminous)** · **Reflection / Learning (Life Library) / Mass** promoted to persisted store entities · **Learn** relabel · **Add Prayer** redesign (single vs devotion, manual/URL/photo intake, **PrayerMedia** links+clips, review-before-save) · **Prayer library** read-only details + row actions (pray/edit/expand) · editor **hydration-race fix** · **Devotion builder** redesign (JIRA add+type, hover "+" insert-between, searchable picker, DnD-only, template audio, **Source name+URL**, fixed mystery set, **review = fully expanded**, **auto How-To** on save) · **Mystery heading** everywhere ("First Luminous Mystery" + title + description) · **decade labels** ("1st decade …") in Pray mode.

## Done (prior session) — Prayer Sessions / Session Builder epic (`6ca5f42`…`a6a4109`)
The Pray tab is now **"Prayer Sessions"** with two tabs — **Session Builder** and **Sessions** (In progress · Upcoming · Completed).
- **`SessionPlan`** entity (`types.ts`) + store CRUD (`saveSessionPlan`/`deleteSessionPlan`/`startBuiltSession`) + provider wiring; seeded `session_plans: []` (auto-migrates, no STORAGE_KEY bump).
- **Session Builder** (`src/routes/pray.tsx`): Purpose · Start date (defaults today) · Recurrence (once/daily/weekly/monthly/**custom**+note) · **Hour** (Liturgy of the Hours) · **Est. time (min)** · optional devotion ("Start from a devotion?") · Progress · **"How do you want to listen?"** media picker · editable item list.
- **Shared editor** extracted to `src/components/prayer/DevotionItemsEditor.tsx` — used by BOTH the Session Builder and the Devotion (template) builder. Items **collapse by default with a caret** (expand shows prayer text / edit fields); session add-ons get an accent border + "Added this session" tag; **X (not trash)** delete; Optional toggle removed.
- **Save as devotion** (⋯ menu) promotes a session's prayers-only items into a new devotion. **Save session** also in the ⋯ menu (with Clear · Delete session).
- **Listen sources / player**: `ExternalLinkOption.media_kind` (web/audio/video) authored in the devotion builder; `listenSourcesFromItems` in compiler; session view has a basic audio / YouTube-embed player (`session.$sessionId.tsx`). No autoscroll yet.
- **Recurrence now works**: finishing a daily/weekly/monthly session rolls the plan's date to the next occurrence (`PrayerSession.plan_id` links session→plan; `advanceDate` in store).
- **Duplicate** a saved session ("Copy of …" to rename).
- **Landing search**: added a **Pray** button (`PrayerSearch.tsx`); finishing an ad-hoc single prayer (template_id "", no plan) **auto-saves it as a session** (today, once).
- Fixed bug: "Today's mysteries" dropdown no longer appends the resolved set name.

## Next (highest value first)
- ✅ **`STORAGE_KEY` bumped v7 → v8** (`36a8596`) and **verified in-browser**: all 13 new prayers render in the Prayer Library, and the Divine Praises detail page shows full text + Source "USCCB — Basic Prayers" linking the basic-prayers URL. (Ran on a self-assigned port — vite bound 8081 since another chat held 8080; set `.claude/launch.json` `autoPort: true` to coexist.)
- **Sourcing-model cleanup** (decisions in the "Sourcing model" block above): built-ins should carry a real source; non-USCCB seeded prayers should point at their true origin (54-Day → `54dayrosary.org`, etc.); then the two-level "matches USCCB" alignment icon (devotion source + per-prayer badge). Do it as one pass; not blocking the family ship.
- **Import → editable devotion template** — booklet (paste) & link import should end by generating the **editable by-hand template** (drop into `/template/$id` pre-populated with detected prayers/name/description/source/recurrence, DnD-editable) instead of committing straight to the library. Text sources need **no AI** (heuristics already parse into `TemplateItem[]`); AI is only an optional quality upgrade. **Photo import is on hold** — it needs OCR/vision AI to read the image first; deferred until a connector exists.
0. **Unified calendar recurrence (RRULE)** — DONE (Phases A/B/import + novena removal). `Recurrence` is a structured object (`freq`/`interval`/`count`/`until`, `types.ts`); a novena is just `daily, count N`. Helpers `recurrenceLabel`/`occurrenceInfo`/`nextOccurrence` in `compiler.ts`; string→object migration in `store.ts normalizeVariants`. Session Builder ("**Pray Plan**") has Google-Calendar-style controls + optional `start_time`; devotions carry `default_recurrence`/`default_hour`/`default_start_time` and pre-fill the builder; import `detectRecurrence` (heuristic, no AI) pre-fills an editable recurrence on the review screen; a running session shows a **"Day N of M"** chip on both tabs, and the **Prayers/Guide tabs freeze at the top** while scrolling. Shared field helpers in `src/lib/prayer/recurrence.ts`. Plan: `~/.claude/plans/greedy-sparking-kernighan.md`.
   - **Novena code removed:** deleted the parallel novena-day subsystem — `NovenaConfig`/`NovenaPhase`/`NovenaInstance`, `resolveNovenaDay`, `novena_instances`, `SessionContext.novena_*`, `TemplateKind "novena"`, the `/novenas` route + its More-nav entry + calendar day panel, the novena selector in the builder. The seeded "54-Day Rosary Novena" is now a plain `rosary` devotion carrying `default_recurrence: { daily, count 54 }` (verified: shows "Day 1 of 54"). **`STORAGE_KEY` bumped v5 → v6** (local fixtures reset). Kept: the harmless `devotion_type: "novena"` taxonomy label, the "novena" name/How-To content, and `detectRecurrence`'s novena heuristic.
1. **Make schedules active** — recurrence/date/hour are stored & advance on finish, but **nothing surfaces a due session on Today or sends a reminder** yet. This is the natural next piece.
2. **Mystery-detail versions** (backlog P2) — same mystery, multiple bodies (USCCB Scripture vs Ascension meditation); model already supports it via `MysteryContent.variant`. Needs an editor + a "which body" picker in the mysteries presentation. Examples: `~/Downloads/Mysteries 1.md` (Scripture), `Mysteries 2.md` (meditation).
3. **Tap-to-type repetition count** (backlog P3) — the ×N stepper is tedious for ×10/×53.
4. **Pray-mode tracker** — completed prayers grayed out + **auto-scroll** as you advance (also unlocks audio-follow).
5. **Touch drag-and-drop** in the editor — current DnD is HTML5 (desktop only); phones need dnd-kit.
6. **Nav label** — user flagged "Pray" may be wrong for this tab now; deferred, they're deciding.
7. **Push the branch** (only the user can): `git push -u origin prd-gap-merge`.

## Gotchas
- **Can't push** from the sandbox (no GitHub auth). Commits are local on `prd-gap-merge`.
- Browser-tool screenshots **desync** on this dev server; verify via `javascript_tool` (native-setter + input event for controlled fields) and read `localStorage['prayer-companion-db-v5']`.
- Hydration: components that seed `useState` from the store must gate on `ready` (localStorage loads after first render). Done for prayer editor + template builder; **other edit routes may still have the latent race**.
- Removed the builder's old "start from existing template" copy feature during the redesign (not restored).

## Reference
The ACTS spec/prompt: `~/Downloads/ACTS_MVP_Claude_Generic_Build_Prompt_v2.docx.md`. Fixtures in `~/Downloads/Faith Journey/`.
