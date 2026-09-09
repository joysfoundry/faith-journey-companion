# E2E test plan — component & flow catalog

_Living planning doc. Started 2026-08-27 (ACTS-76 session). Not yet executable —
see "Prerequisite" below._

This is the catalog of **candidate components and user flows** we'll build larger
end-to-end (E2E) tests against later. It is the shared target that every story's
per-story test notes feed into: a story documents its own **unit** + **integration**
tests in its pointer, and points here for the **E2E** flow(s) it participates in.

## Current state (read this first)

**There is no test runner in the repo yet** — no Vitest, Jest, Playwright, or Cypress,
no test files, no `test` script. So every entry below is **Planned**, not passing. The
per-story "Tests" sections likewise describe tests to be written, not tests that run.

### Prerequisite — stand up the test harness (proposed story)
Before any of this executes, one enabling story sets up tooling:

- **Unit + integration:** [Vitest](https://vitest.dev) + `@testing-library/react` +
  `@testing-library/user-event` + `jsdom` (or `happy-dom`). Vite-native, minimal config.
- **E2E:** [Playwright](https://playwright.dev) driving the dev server (the flows below).
- **Scripts:** `test` (unit/integration, watch + run), `test:e2e` (Playwright).
- **CI hook** so the suite runs on push (ties into ACTS-78 publish flow).

_Filed as **ACTS-92** (deferred harness build; see the ledger). The **convention** that
makes testing documented + tracked for every code change is **ACTS-91** (Done). Until
ACTS-92 lands, treat this doc as the backlog of what to write._

## The test pyramid we're aiming for

| Layer | Tooling | What it covers | Where documented |
|-------|---------|----------------|------------------|
| **Unit** | Vitest | Pure logic in `src/lib/**` — the compiler, recurrence, importer, liturgical calendar, bible-url builder. Fast, no DOM. | Each story's pointer → **Tests › Unit** |
| **Integration** | Vitest + Testing Library | A component + its store/logic wired together — render, interact, assert. Mock `scrollIntoView`, `matchMedia`, `localStorage`. | Each story's pointer → **Tests › Integration** |
| **E2E** | Playwright | Whole user journeys across routes against the running app, using seeded localStorage. | **This doc** (table below) |

## Candidate E2E flows (build later)

Priority: **P1** = core prayer loop, **P2** = authoring, **P3** = supporting.

| # | Flow (E2E journey) | Route(s) | Key components exercised | Core units behind it | Priority | Related stories |
|---|--------------------|----------|--------------------------|----------------------|----------|-----------------|
| E1 | **Build → begin → pray → finish a session** | `/pray` → `/session/$sessionId` | Session Builder form, `DevotionItemsEditor`, PrayerMode (Prayers + Guide tabs), `ListenPlayer`, progress header, Finish | `generatePrayerSession`, `sessionProgress`, `estimateMinutes`, `toggleItemDone`, `finishSession` | P1 | ACTS-76 |
| E2 | **Pray-mode tracker** — current item prominent, completed gray out, auto-scroll as you advance | `/session/$sessionId` | PrayerMode `PrayersTab` / `GuideTab`, "NOW" badge, ring, `useAutoScrollToCurrent` | first-incomplete derivation, `completeSessionItem`, `sessionProgress` | P1 | **ACTS-76** |
| E3 | **Guided-prayer expand/collapse + expand-all/collapse-all** | `/session/$sessionId` | PrayerMode item cards, expand/collapse control | (presentational) | P2 | ACTS-89 |
| E4 | **Recurring session / "Day N of M"** | `/pray` → `/session/$sessionId` | Recurrence fields, occurrence label | `buildRecurrence`, `recurrenceFields`, `occurrenceInfo`, `nextOccurrence` | P2 | — |
| E5 | **Author a devotion (template) and reuse it** | `/pray`, `/template/$templateId` | Builder, "Save as devotion", `DevotionItemsEditor`, `PrayerFields` | `saveTemplate`, `duplicateTemplate`, `templateOutline` | P2 | ACTS-85 |
| E6 | **Import a written prayer / bundle → devotion** | `/import` | Import screen, taxonomy proposal, media attach | `analyzeText`, `splitBlocks`, `detectRecurrence`, `detectRepetitionCount`, `proposeTaxonomy`, `applyImportDraft` | P2 | ACTS-80, ACTS-81 |
| E7 | **Rosary with mysteries — set + variant selection** | `/pray` → `/session/$sessionId`, `/mystery-version/$bodyKey` | Mystery pickers (set / presentation / body), decade rendering | `resolveMysterySet`, `mysteriesForSet`, `mysteryContentFor`, `mysteryVersions`, `allMysteryBodies` | P2 | ACTS-79 |
| E8 | **Litany flow** (salutation call/refrain items) | `/pray` → `/session/$sessionId` | Salutation item rendering, tracker | `generatePrayerSession` (salutation kind) | P3 | — |
| E9 | **Song / hymn placement** (verse/chorus segments) | `/pray` → `/session/$sessionId` | Song item rendering, segment labels | `resolveSong`, `songSegmentLabel` | P3 | — |
| E10 | **Prayers library — browse, favorite, variants** | `/prayers`, `/prayer/$prayerId` | Prayer list, detail, variant switcher | `variantsOf`, `normalizeVariants`, `setDefaultVariant`, `toggleFavorite` | P3 | ACTS-83 |
| E11 | **Home / Today — liturgical Word card + upcoming** | `/` (index), `/word` | Home cards, Word card | `getLiturgicalDay`, `nextOccurrence` | P3 | — |
| E12 | **Formation / Knowledge — add + library** | `/formation`, `/knowledge/$knowledgeId` | Formation tabs, knowledge detail | `src/lib/prayer/knowledge.ts` | P3 | — |
| E13 | **Bible deep-link out** | `/settings`, session scripture items | Bible app settings, external link | `buildPassageUrl`, `effectiveBibleAppId`, `bibleAppById` | P3 | — |
| E14 | **Reflections capture** | `/reflections` | Reflection form/list | store reflection actions | P3 | — |
| E15 | **Settings & persistence** — change settings, reload, state survives | `/settings`, all | Settings, app store provider | `loadDatabase`, `saveDatabase`, `STORAGE_KEY` migration | P3 | ACTS-82 |
| E16 | **Paste-a-link import matrix** — YouTube / Instagram content, individual & organization, with & without an existing Vessel (see scenario table below) | `/formation` (Add) | `QuickAddLink` staged card, Vessel/Channel/kind fields, "Pin to Home" | `matchVoice`, `detectPlatform`, `detectCategory`, `detectVoiceKind`, `voiceFromLink`, `vesselNamePrefill`, `channelLabelFor`, `identityFromUrl`, `upsertVoice`, `addKnowledgeItem` | P2 | **ACTS-178**, ACTS-171 |
| E17 | **Unified Pin to Home** — one control pins a channel, a content item, and a content link; all reach Home; unpin removes them; legacy `favorite` migrates on load | `/formation`, `/voice/$voiceId`, `/` (index) | `ChannelChips`/`ContentRow` pin control, Home Vessels card | `pinnedLinks`, `toggleChannelPin`, `toggleContentLinkPin`, item `pinned`, `loadDatabase` (`favorite`→`pinned` migration) | P2 | **ACTS-177**, ACTS-137 |

## E16 — Paste-a-link import matrix (ACTS-178)

The scenarios JC asked to cover. Each pastes a **content** URL (a specific video/post,
not a channel home) and asserts what lands in the library: the **content item**, its
**attribution** (Vessel + channel), the Vessel's **kind**, and that no duplicate Vessel
is created when one already exists.

**Domain rule to encode (JC):** attribution follows **who published it**, not who is
on screen. A video *about* an individual can be published by an organization, so it
becomes a piece of content under **that organization's** Vessel. And an individual
(e.g. Fr. Mike Schmitz) can carry content that came **from an organization's page**
(e.g. Ascension) under **his** record when he is the publisher/host. So "individual vs
organization" is decided by the **publishing account** of the pasted link, and a video
can legitimately sit under either depending on whose channel posted it.

| # | Link platform | Attribution target | Existing Vessel? | Expected result |
|---|---------------|--------------------|------------------|-----------------|
| E16a | YouTube (video) | Individual | **No** | New **individual** Vessel; a YouTube **channel** on it (the publisher's account, not the video URL); the video saved as content under it |
| E16b | Instagram (post) | Individual | **No** | New **individual** Vessel; Instagram **channel**; the post saved as content under it |
| E16c | YouTube (video) | Individual | **Yes** | `matchVoice` finds the existing individual → **no new Vessel**; video added under the matched Vessel/channel |
| E16d | Instagram (post) | Individual | **Yes** | Matches existing individual → **no duplicate**; post added under it |
| E16e | YouTube (video) | Organization (e.g. Ascension) | **No** | New **organization** Vessel (kind = organization, not silently "individual"); YouTube channel; video as content under the org |
| E16f | Instagram (post) | Organization | **No** | New **organization** Vessel; Instagram channel; post as content |
| E16g | YouTube (video) | Organization | **Yes** | Matches existing org → **no duplicate**; video added under the org's record |
| E16h | Instagram (post) | Organization | **Yes** | Matches existing org → **no duplicate**; post added under it |

Cross-checks for every row: the **person's name** is distinct from the **channel/show
name** (not both set to the show title); **kind** is correct and, if wrong, editable and
persisted (E16 pairs with ACTS-178's individual↔organization fix); the channel URL is the
**account**, not the pasted content URL; and one paste creates exactly **one** content item
(no accidental duplicate — the double "9 Things…" JC saw).

## Cross-cutting things every E2E flow should assert
- **Persistence:** reload mid-flow; localStorage (`STORAGE_KEY`) restores state (hydration — see ACTS-83).
- **Mobile-first viewport:** run the core flows at a phone width (platform decision ACTS-90).
- **Reduced motion:** auto-scroll / animations degrade gracefully (`prefers-reduced-motion`).
- **A11y smoke:** `aria-current`, `aria-pressed`, focus order on the interactive prayer surfaces.

## How this ties to per-story docs
Every story pointer carries a **Tests** section (see `stories/_TEMPLATE.md`) with:
- **Unit** — the pure functions it touches (link the `src/lib/**` symbols).
- **Integration** — the component-level render/interact tests.
- **E2E** — the flow number(s) above it participates in (e.g. "E2, E1").

Keep this table in sync when a story adds a new user-facing flow.
