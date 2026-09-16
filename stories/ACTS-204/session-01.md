---
story: ACTS-204
session: 01
wrapped_at: 2026-09-16T10:16:23-0700
status: In Progress
final: false
---

## What happened

A long model-design session that landed the **content/collection data model** and shipped
the first four slices. The model is now settled and matches JC's four-tier table.

**The settled model (each word on exactly one axis — no generic "item", nothing on two axes):**

| Axis | Field | Values |
|---|---|---|
| **Voice** (who) | `Voice.kind` | Individual · Organization · Ministry |
| **Source type** (level) | Collection vs Content entity | Collection · Content |
| **Collection** (container, the named show) | `Voice.collections[]` (was `channels`) | name + `kind` |
| **Collection kind** | `Collection.kind` | podcast · video · program · social · articles · store · other |
| **Platform(s)** (pipeline/distribution) | `Collection.platforms[]` | YouTube · Spotify · Apple · Instagram · website · app … (a show can be on several) |
| **Format** (how) | `KnowledgeItem.media` | text · audio · video · image (Book+format shown as ebook/audiobook; image as photo) |
| **Content form** (stored type) | `KnowledgeItem.category` | book · article · post · quote · program |
| **Tags** (cross-cutting) | `KnowledgeItem.tags[]` | Prayer (a tag, not a form) · Scripture · … |

**Key decisions (recorded so we don't re-litigate):**
- **Collection = the middle tier** (renamed from `Channel`). "Channel" (a pipe) collided with the named show; users say "collection". The word "channel" survives only as the *platform* sense.
- **Platform ≠ Collection kind ≠ Format** — three different questions: *where distributed* vs *what kind of series* vs *how consumed*. A show (kind=video) can be on app+YouTube+Spotify (platforms) in video (format). For a solo creator they coincide, which is why it *felt* like one thing.
- **Content is named by its Collection** (`contentNoun`): episode/video/lesson/post — derived, not stored. So `video`/`podcast` were retired as content categories — they're *formats* (`media`), and a video/episode's noun comes from its collection. **No generic "item"** — untyped content displays by its derived noun.
- **`media` is single** per item (one format = one engagement). A book+audio = audiobook. A program+audio = Bible in a Year. Mixed-format *series* are handled by the container (each part its own single format). "Mixed" is a Collection-level display label, not a stored media value.
- **Content parents to a Collection AND a Voice** (both optional, independent). If no collection → parent is the Voice directly (a standalone book/quote). If neither → General. The two Voices can **differ** = co-attribution (Ascension owns "Sunday Homilies"; Fr. Mike is the episode's `voice_id`) — handles owner-vs-host without a `host_voice_id`. JC wants an item to surface under **both** voices in the Voice view (arbitrary many-to-many = ACTS-202, later).
- **Prayer is a tag, not a content form** (it cuts across forms; a prayer can be a Hallow audio, an IG post, a video) — and Oravia already has a separate Devotion model for prayers you *pray*.
- **URL resolution rule (spec for the paste flow, not yet built):** the URL *shape* decides Collection vs Content — an account root (`@handle`, `/username`, a show page) → **Collection**; a specific item (`watch?v=`, `/reel/`, an episode) → **Content**. Account URLs carry identity → auto-resolve Voice+Collection; a bare item URL doesn't name its account → the user confirms Voice / "Part of" (autocomplete). Strip `utm_*`/`stkn`/`entryPoint` for a `canonical_url`, keep the pasted `original_url`. Stay **pattern-only** (no metadata fetch) — fetching thumbnails/titles would break Oravia's local-first, no-scrape principle.

**Slices shipped (4 commits, all ACTS-204):**
1. `d02dd60` — `Collection.kind` (typed), `Collection.platforms[]` (multi-platform, `collectionPrimary()` helper), container-has-no-status (status pills gated on `hasStatus` across all four render sites — editor + voice detail were ungated), `KnowledgeItem.media` axis + editor selector + migration backfill.
2. `aa3ef37` — retired `video`/`podcast` content categories → `media` owns format; `hasStatus` is media-aware (a video/episode stays completable); `media` detected from URL (`detectMedia`); dropped the "Media" catch-all filter.
3. `9a92af9` — **Channel → Collection** rename (type, fields `channels→collections`/`channel_id→collection_id`, functions, UI strings) with legacy-key fallback migration (`collections ?? channels`, `collection_id ?? channel_id`).
4. `a55699e` — the "Channel" library filter → **"Platform"** (it groups by platform; `ChannelGroup→PlatformGroup`).

**Also:** filed a background task chip for a "how Vessels work" info-sheet/visual on the Vessels page (→ next id ACTS-206 when picked up).

## Verified (and how)

- `tsc --noEmit` clean after every slice.
- **In the running app (dev preview, seed data):**
  - `Collection.kind` inference from URL, multi-platform add/remove (added Spotify to Hallow → detected `podcast`, persisted `[website, podcast]`, removed cleanly).
  - Status pills: Program keeps them, Quote no longer shows them (editor + voice detail).
  - Type picker shows only Book/Article/Post/Quote/Program; Media picker keeps Video; migration left seed categories = book/program/quote; Media filter gone from the bar.
  - After the rename: editor + voice detail read **"Collections"**, subtitle reads "1 collection", multi-platform intact, 14 content items present.
  - Filter bar reads **Voices · Platform · Programs · Books · Quotes · All**; Platform view groups (Podcast → Bible in a Year).
- **Migration caveat (dev-only):** my local seed's collections got wiped mid-rename (a save landed during a broken intermediate state before the fallback existed); I **reseeded**. The *shipped* migration is safe — a real user upgrades straight from `channels` to the final code (fallback reads it), never hitting that window.

## Git state at handoff

**Committed, NOT pushed** — `git push` fails here (`could not read Username`; JC pushes by hand). Four ACTS-204 code commits waiting:
`d02dd60`, `aa3ef37`, `9a92af9`, `a55699e` (+ this handoff commit). **JC: please push from your git client.**
No unsaved code (working tree clean before this handoff).

## Next

Model is done. Remaining work, in JC's target-view order:
1. **Platform → Collection → Content** — today it's Platform → Content (flat); add the Collection nesting.
2. **Collection → Content** — a new "Collections" view (the named show with its content nested). Not built.
3. **Voice → Collection and Content** — today's "Voices" view; largely there. Decide: an item whose `voice_id` (Fr. Mike) differs from its collection owner (Ascension) should surface under **both** (JC).
4. **URL resolver / paste flow** (slice d) — implement the URL-shape rule above: Collection-vs-Content detection, "Part of" autocomplete, canonical/original URL. Pattern-only.
5. **host/co-attribution many-to-many** = ACTS-202 (deferred).
6. **Reclassification** of any legacy "series-as-content" into Collections — deferred (none pressing; Bible in a Year is correctly a program+audio content item for now).
7. Then **ACTS-187** (unified add form) per the roadmap.
