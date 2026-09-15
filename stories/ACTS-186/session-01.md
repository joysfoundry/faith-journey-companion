---
story: ACTS-186
session: 01
wrapped_at: 2026-09-15T13:19:31-0700
---

# ACTS-186 — session 01

## What happened
The connected-entity sweep: audited every text input in `src/`, then wired the stray/could-be
entity inputs to link instead of storing loose strings, and worked through the "one org, many
channels" problem live with JC (Ascension as the driving example).

**Audit (AC #1).** Inventory recorded in the pointer: 5 connected · 3 stray · ~7 could-be.
Excluded inputs that name the thing being created itself (a Voice's own name, a content title).

**Wired to `EntitySuggestInput` (link, don't duplicate):**
- knowledge-item "New Vessel by name" → suggests existing Vessels, links on accept; `+` still creates.
- QuickAddLink "From" new-name → suggests Vessels, switches to *match* on accept.
- mystery-version "Attribution" → real link via new `Source.attribution_voice_id` (JC-approved
  data-shape change): known name links + stores string; unknown = plain string, no forced Vessel.

**Could-be inputs (JC: "set up the could-bes"):**
- Tags (knowledge items + prayers) → new `TagSuggestInput`, soft autocomplete over `allTags`
  (still `string[]`; a real Tag entity is ACTS-203).
- Provenance "Source" (template + import single/devotion) → new `SourceAttributionInput`: autocompletes
  existing Source names AND links a publisher Voice (`attribution_voice_id`). ("Both", per JC.)
- Channel name → left as is (a channel is not 1:1 with a Vessel — ACTS-202). Hour "tags" were
  already `<select>`s over `PrayerHour` (no work).

**Org / channels (JC testing with Ascension URLs):**
- Org name prefill: an organization prefills its brand/site name, never an `@handle` from the URL
  path (`/products/…` was becoming `@product`). `@handle` reserved for individuals + handle platforms.
- `orgBrandName` + `ORG_BRANDS` map → any Ascension subdomain resolves to "Ascension Press";
  `hostBrand` strips `app.`/`m.` for the name (channel URLs keep the subdomain).
- QuickAddLink **match-by-name** (auto-attribute when derived name == an existing Vessel, since the
  suggest box hides exact matches) + **match-mode channel-add** ("Add this as a channel of X").
- `detectCategory` is now **path-aware** (podcast/video/program/book) instead of forcing every
  ascensionpress.com link to "program".

**Model design captured (spun into stories):** the Ascension walkthrough → Vessel → typed channels →
content; containers (channel/series/podcast) have no status, only content does; a channel can be
tied to an individual host (Fr. Mike); prayers thread to a Vessel via their Source. This became
**ACTS-204** (now In Progress, to be built in a new thread).

## Verified (and how)
- `tsc --noEmit` clean after every change.
- Live in the in-app browser (dev server :8080):
  - knowledge-item box: typing "Tren" suggested "Trent Horn"; accepting set `voice_id` to the
    existing `voice-trent-horn` with **no duplicate** (voices count unchanged).
  - Tag autocomplete renders + suggests (screenshot).
  - Org prefill: both Ascension URLs → "Ascension" (org), not `@product`/`@program`.
  - app-subdomain flow: pasting `app.ascensionpress.com/podcasts/homily` auto-attributed to the
    single "Ascension Press" (by name), added a "Homilies" channel, saved the item under it — **no
    duplicate Vessel** (checked localStorage: one Ascension Press with two channels).
  - `detectCategory` regex checked in Node for all path shapes (podcast/book/program/video/article).
- Persistence of `attribution_voice_id` confirmed safe: `upsertSource` stores whole; load path
  doesn't reconstruct sources (survives the `normalizeContent` field-drop gotcha).
- Caught + fixed in testing: a "rendered fewer hooks" error — the tag `useMemo` in
  `knowledge.$knowledgeId.tsx` was after the early returns; moved above them.

## Git state at handoff
All committed **and pushed** — `origin/main` at `904cd68` (confirmed in sync). No unsaved code.
This session's ACTS-186 commits: `ea89591`, `343dd3d`, `b499f07`, `2491443`, `ebddfcf`, `4525159`
(+ ACTS-204 doc commits `e11d254`, `904cd68`).

## Next
- **ACTS-186 remaining (only item to close the sweep):** Celebrant → Voice on the Mass capture
  (`WordSection.tsx:181`) — needs the homily→Voice decision. Everything else in the sweep is done.
- **ACTS-204 is In Progress** — start it in a **new thread** (`/start ACTS-204`): model + matching
  only (channel `kind`, content-under-channel by path, host Voice, no-status-on-containers, prayer
  Source→Voice). Leave the unified add/edit UI to **ACTS-187** (build 187 after 204's model settles).
- Follow-ons filed this session: **ACTS-201** (Parish/Church entity), **ACTS-202** (author vs
  publisher / channel↔Voice many-to-many), **ACTS-203** (real Tag entity), **ACTS-204** (typed channels).
