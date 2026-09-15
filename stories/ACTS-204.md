---
id: ACTS-204
title: One org, many typed channels — content files under its channel/series (the Ascension model)
spine:
status: In Progress
origin: human-directed
approved_by: JC
depends_on: []
relates_to: [ACTS-186, ACTS-202]
started_at: 2026-09-15T00:00:00-0700
updated:    2026-09-15T00:00:00-0700
latest_handoff: null
sessions: 0
---

## Goal
As a user pasting links from a big publisher, I want everything to thread under **one Vessel**
with its **shows/series as channels** and each item filed **under the right channel** — without
me having to decide "is this a channel or content?" each time. The nomenclature is confusing
today (JC: *"this is confusing… and it will be for customers"*), so the paste flow must infer it.

## The Ascension model (JC walkthrough, 2026-09-15)
Ascension Press is one org with many properties under `ascensionpress.com` / `app.ascensionpress.com`:
- **Shop** → books (store)
- **Programs** (Bible Timeline, Genesis, Great Adventure, Bible in a Year) → structured study series
- **App & Media → Podcasts** (Bible in a Year, Catechism in a Year, Rosary in a Year, Catholic Classics)
- **App & Media → Videos** (The Bible Timeline Show, Sunday Homilies with Fr. Mike Schmitz)
- **App & Media → Articles**
- **App & Media → Prayers** (Novena to St. Joseph, Litany of Humility, …)

Three tiers, **all under Ascension Press**:
`Vessel (org) → Channel (a typed series/show) → Content (the items)`.
A video series is like a YouTube channel + its videos; a podcast series like a podcast + episodes;
a program is a structured study series + its lessons.

## Maps to the app's existing model
The tiers already exist: `KnowledgeItem.voice_id` (Vessel) → `channel_id` (Channel) → the item +
its `category`. **Gaps:**
1. **Channel has no `kind`** — it's `{platform, url, label}`. Add a type (podcast / video / program /
   store / articles) so a Vessel's channels are meaningful. *(Data-shape change — flag.)*
2. **Content doesn't auto-file under its channel by URL.** An episode
   `…/podcasts/homily?episodeId=…` should match the "Sunday Homilies" channel (query stripped,
   most-specific path prefix wins) and save as content there — not as a loose item. Distinguish a
   channel/section root (`/podcasts/homily`) from an item (has `?episodeId=` / a deeper path).
3. **Category by path** — DONE (ACTS-186 session 02): path-aware `detectCategory`
   (podcast/video/program/book), replacing the blanket `ascensionpress.com → program`. (Note:
   video-vs-podcast can't always be inferred from a `/podcasts/` URL — Ascension's homilies are
   video under a "podcasts" path — so leave the category editable.)
4. **Prayers route to the Prayer/Devotion model**, not the library — a novena/litany paste should
   become a devotion, not an "article". (Cross-model routing — its own decision.)
5. **Author ≠ publisher, and a channel can be tied to an individual** — "Sunday Homilies with Fr.
   Mike Schmitz": the channel is published by Ascension (org) but **hosted/recorded by Fr. Mike**
   (individual). So a channel may carry its own **host/author Voice** distinct from the Vessel that
   owns it — an org can host many people's shows, and one person (Fr. Mike) appears across an org
   channel *and* his own. Ties to [[ACTS-202]] (channel↔Voice many-to-many). Likely a
   `channel.host_voice_id` (or per-item author) alongside the owning Vessel.

7. **Containers have no status; only content does (JC, 2026-09-15).** A channel/series is a
   **container**, so it must **not** show Not started / In progress / Finished; a **content item**
   *within* it is completable (viewed/not) and carries status. This is uniform across kinds:
   - **Video** — Sunday Homilies (the show) = container, no status; one homily video = content,
     has status. Like a YouTube channel vs a video on it.
   - **Podcast** — the podcast (Spotify / Apple / Ascension) = container, no status; an episode =
     content, has status.
   - **Program** — the program/series = container; a lesson/part = content with status.

   **Root cause of the screenshot bug (JC):** "Sunday Homilies" is **mislabeled as a Program** —
   a *completable content category* — so it inherited status pills. It should be a **channel
   (container)**, which has none. So the fix is the model itself (a series is a channel, not a
   KnowledgeItem with a completable category), not a per-item pill toggle. `hasStatus` (see
   `knowledge.ts`) applies to content items, never to a channel/series.

6. **Prayers thread to a Vessel via their Source (JC, 2026-09-15).** A prayer/devotion already has
   a **Source**, and ACTS-186 gave `Source.attribution_voice_id`. So USCCB — which has **both**
   programs (library content under the USCCB Vessel) **and** prayers (devotions) — threads both to
   the one USCCB Vessel: the prayer's Source links to the USCCB Voice. Prayer routing should set
   that link so a novena/litany from USCCB (or Ascension) shows under the same Vessel as its
   content.

## Make it easier (paste-flow UX)
Infer, don't interrogate: paste → recognize the **org** (brand map, done) → recognize the **type**
(path, done) → if the URL lives under a channel you already have, **file it as content there**;
if it's a new section root, offer it as a **channel**. The user shouldn't have to name the tier.

## Acceptance criteria
- [ ] Channel gains a `kind`; a Vessel's channels render by type.
- [ ] A channel/series shows **no status**; only content items are completable (viewed/not).
- [ ] A channel can carry a **host/author Voice** distinct from the owning Vessel (Fr. Mike).
- [ ] Pasting an item under an existing channel files it as content of that channel (path match).
- [ ] Channel-vs-content is inferred in the paste flow (minimal decisions).
- [ ] Prayer/novena/litany routing decided; prayer Source links to its Vessel (USCCB case).
- [ ] No reset; existing channels/content migrate cleanly.

## Tests
No runner yet (ACTS-92). Verify: an episode URL files under its show; a section root becomes a
channel; category by path; a shop link → book; existing data still loads.
