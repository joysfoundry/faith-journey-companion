---
id: ACTS-186
title: Threads — app-wide connected-entity sweep (no stray text boxes)
spine:
status: Done
origin: human-directed
approved_by: JC
depends_on: []
relates_to: [ACTS-185, ACTS-183, ACTS-181, ACTS-201, ACTS-202, ACTS-203, ACTS-204]
started_at: 2026-09-10T12:42:51-0700
updated:    2026-09-15T13:31:56-0700
latest_handoff: stories/ACTS-186/session-02.md
sessions: 2
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
- `WordSection.tsx:181` — Mass **"Celebrant"** (priest) → **WIRED.** `EntitySuggestInput` over
  Voices; accepting links via new `MassExperience.celebrant_voice_id` (additive, back-compat) so a
  priest's homilies thread to them; a new name stays plain text. Verified: "Fr. Mi" → "Fr. Mike
  Schmitz" → saved Mass has `celebrant_voice_id: voice-fr-mike`.

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
- `VoiceEditor.tsx:205` / `QuickAddLink.tsx:359` — **channel name** — **left as is (JC).** A
  channel name is a canonical sub-entity label with nothing to link to; and a channel is **not
  one-to-one with a Voice** — a podcast guest is a different Vessel than the channel owner, so a
  piece can live on one channel but be authored by another. That many-to-many is [[ACTS-202]].
- **Tags** — `knowledge.$knowledgeId.tsx:525` (`TagSuggestInput`), `PrayerFields.tsx:146`
  (`TagSuggestInput`) — **WIRED (soft autocomplete).** New `TagSuggestInput` suggests tags you've
  already used (per comma-token) via `allTags(items, prayers)`; still stored as `string[]` (no
  schema change). A **real Tag entity** (ids + rename-propagation) is split to [[ACTS-203]].
  *Correction:* the "Hour (tag)" fields (`import.tsx:529`, `pray.tsx:713`) are `<select>`s over
  the `PrayerHour` enum — a controlled vocabulary, already connected; no work needed.
- **Provenance "Source"** (USCCB, a booklet…) — `template.$templateId.tsx`, `import.tsx` (single +
  devotion) — **WIRED (Both).** New `SourceAttributionInput` autocompletes existing Source names
  **and** links to a publisher Voice via `Source.attribution_voice_id` (reuses the ACTS-186
  field); a linked chip shows/unlinks the Vessel; editing the text clears the link.

**Tally:** 5 connected · 3 stray · ~7 could-be.
**Session 01 wiring:** 2 Vessel-name boxes + mystery attribution.
**Session 02 wiring (JC "set up the could-bes"):** tags (soft autocomplete) + provenance Source
(name autocomplete **+** Voice link). Channel left as is. Hour-tags were already `<select>`s.
**Session 02 fix (JC testing):** QuickAddLink Vessel-name prefill — an **organization** now
prefills its brand/site name, never an `@handle` scraped from the URL path
(`ascensionpress.com/products/…` was becoming `@product` / `@program`). `@handle` is reserved for
individuals + true handle platforms.

**Session 02 — one org, many channels (JC testing, the app-subdomain case).** JC's model: **one
Vessel (Ascension Press) that owns multiple channels** — its website + `app.ascensionpress.com/…`
homilies + catechism — not a Vessel per subdomain, and **no merge** (test data). Shipped:
- `orgBrandName(url)` — a known-org **brand map** (`ORG_BRANDS`, registrable-domain / substring
  match) resolves any Ascension URL/subdomain to "Ascension Press"; `detectVoiceKind` derives from
  it. Replaced the old `ORG_HOSTS` list.
- `hostBrand` now strips `app.`/`m.` (not just `www.`) for the **name** fallback (channel URLs keep
  their full subdomain — subdomains matter there).
- QuickAddLink **match-by-name**: when a paste doesn't URL-match but the derived name equals an
  existing Vessel, auto-attribute to it (an exact name is hidden by the suggest box, so this
  prevents a silent duplicate).
- QuickAddLink **match-mode channel add**: attributing to an existing Vessel now shows "Add this as
  a channel of X" (editable label + URL, prefilled from the link), appended on save unless that
  channel identity already exists. Verified: pasting `app.ascensionpress.com/podcasts/homily` →
  attributes to the single "Ascension Press", adds a "Homilies" channel, no duplicate Vessel.
- **Bug caught + fixed in testing:** the tag-suggestions `useMemo` in `knowledge.$knowledgeId.tsx`
  was after the `ready`/`!item` early returns → "rendered fewer hooks"; moved above the returns.
**Split out:** Church/parish → ACTS-201; author-vs-publisher (Fr. Mike/Ascension, Pope/Vatican,
channel↔Voice many-to-many) → ACTS-202; real Tag entity → ACTS-203.
**Closed:** Prayed-for (leave). **Celebrant → Voice: DONE** (session 02, `MassExperience.celebrant_voice_id`).
**Sweep complete** — every stray box wired and every could-be dispositioned; deeper model work
lives in the spun-out stories (201/202/203/204). Ready to close.

## Tests
No runner yet (ACTS-92). Per-surface: verify autocomplete suggests existing entities, accept
links by id, and a new name creates the entity. Planned; documented as surfaces are wired.
