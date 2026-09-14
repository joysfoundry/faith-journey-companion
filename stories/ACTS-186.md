---
id: ACTS-186
title: Threads — app-wide connected-entity sweep (no stray text boxes)
spine:
status: In Progress
origin: human-directed
approved_by: JC
depends_on: []
relates_to: [ACTS-185, ACTS-183, ACTS-181]
started_at: 2026-09-10T12:42:51-0700
updated:    2026-09-14T00:00:00-0700
latest_handoff: null
sessions: 0
---

## Goal
As a user, I want **every** place I name a person or a work to connect to the entity already
in the app — never a stray free-text box — so the whole app reflects the **threads** in my
life and how things connect. This is a **standing sweep** (leave open): audit the app for
entity-name inputs that store loose text, confirm the data model supports the link, and wire
each to the [[connected-entity-inputs]] pattern.

JC: *"there are stray text boxes throughout the app."*

## Scope / approach
- **Audit**: grep the app for free-text inputs that name a person/author, a work/content, a
  channel, a source, a tag, etc. — anywhere a value should resolve to a `Voice`,
  `KnowledgeItem`, `Channel`, or other entity rather than a string.
- **Model check**: for each, confirm the data model can hold the link (an id reference like
  `voice_id` / `source_item_id` / `channel_id`); file model gaps where it can't.
- **Wire**: replace with `EntitySuggestInput` (from ACTS-185) — autocomplete + link/create.
- Candidate surfaces to review: the quote editor (Vessel field, source), `VoiceEditor` add
  form, `QuickAddLink`, reflection linking, tags, Mass capture (church/celebrant), knowledge
  source/creator fields, program/plan attributions.

## Acceptance criteria
- [ ] An inventory of entity-name inputs across the app, each marked connected vs stray.
- [ ] Stray boxes wired to `EntitySuggestInput` (autocomplete against existing entities,
      link on accept, create when new) — or a model gap filed where the link can't be stored.
- [ ] No regressions to existing capture flows.
- [ ] (Open-ended — closed only when the sweep is judged complete by JC.)

## Audit — entity-input inventory (session 01, 2026-09-14)
Swept every text input in `src/`; classified the ones that **name an entity** (person/Vessel,
work/content, channel, place, tag). Inputs that name the *thing being created itself* (a Voice's
own name, a content/prayer/devotion title) are correctly free text and excluded.

**Buckets:** connected = autocompletes + links by id · stray = definite entity, free text, no
link · could-be = related but a model gap or genuinely optional.

### ✅ Connected (target pattern — leave)
- `ReflectionComposer.tsx:600` — "From / author" → `EntitySuggestInput(voiceSuggestions)`
- `ReflectionComposer.tsx:591` — "Source work" (book/article) → `EntitySuggestInput(contentSuggestions)`
- `QuoteSourcePicker.tsx:126` — quote source → search library, links `source_item_id` (or mints) ← gold standard
- `knowledge.$knowledgeId.tsx:412` — Vessel/author → `<select>` of voices (`voice_id`) + URL-match link
- `knowledge.$knowledgeId.tsx:432` — channel → `<select>` (`channel_id`)

### 🔴 Stray (must fix)
- `QuickAddLink.tsx:290` — "From" **new-name** box. Auto-matches a Vessel from the pasted URL,
  but "Attribute to someone" → plain `<Input>`, no autocomplete → duplicate Vessel risk. **[wiring — this session]**
- `knowledge.$knowledgeId.tsx:470` — "New Vessel by name" add box → `createVoiceByName` always
  creates, no dedupe. (Connected `<select>` sits beside it; the box is the stray part.) **[wiring — this session]**
- `WordSection.tsx:181` — Mass **"Celebrant"** (priest) stored as loose text; should resolve to a
  Voice. **[deferred — needs a homily→Voice decision]**

### 🟡 Could be connected — dispositions (JC, 2026-09-14)
- `mystery-version.$bodyKey.tsx:229` — **"Attribution — author/publisher/book"** → **WIRED
  (real link, JC-approved data-shape change).** Added `Source.attribution_voice_id?` to the
  shared `Source` type; the field is now `EntitySuggestInput` over Voices. **Storage rule:**
  accepting a suggested Vessel stores `attribution_voice_id` **+** the `attribution` string;
  typing free text with **no match** stores just the `attribution` string (id undefined) — no
  forced Vessel creation for one-off publishers. Editing the text clears the link so it can't
  drift. Persistence verified safe (`upsertSource` stores whole; load path doesn't reconstruct
  sources → survives the `normalizeContent` field-drop gotcha). **Single link only for now**
  — author-vs-publisher pairing (e.g. Fr. Mike Schmitz authored, Ascension published) is a
  model question split to [[ACTS-202]].
- `WordSection.tsx:166` — Mass **"Church"** (parish/place) — **no Parish/org entity exists.**
  **→ split to its own story [[ACTS-201]]** (model + whether a public parish dataset exists).
- `pray.tsx:576` — **"Prayed for"** (person) — **leave as is** (JC: do not track as a Voice; often a
  departed loved one, not an app entity).
- `VoiceEditor.tsx:205` / `QuickAddLink.tsx:359` — **channel name** (naming the channel sub-entity;
  canonical, no cross-channel dedupe) — **deferred** (minor).
- **Tags** — `knowledge.$knowledgeId.tsx:521`, `PrayerFields.tsx:145`, hour-tags `import.tsx:529` /
  `pray.tsx:713` — free-typed, no suggestions → taxonomy fragments. **Deferred — separate "tag
  entity" question** (own story later).
- **Provenance "Source"** (USCCB, a booklet…) — `template.$templateId.tsx:344`, `import.tsx:688` —
  provenance string; **deferred — low value to link.**

**Tally:** 5 connected · 3 stray · ~7 could-be. This-session wiring = 3 boxes (2 Vessel-name +
mystery attribution). Deferred: Celebrant, channel-name dedupe, tags, provenance Source. Split
out: Church/parish → ACTS-201. Closed: Prayed-for (leave).

## Tests
No runner yet (ACTS-92). Per-surface: verify autocomplete suggests existing entities, accept
links by id, and a new name creates the entity. Planned; documented as surfaces are wired.
