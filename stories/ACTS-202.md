---
id: ACTS-202
title: Author vs publisher — model a Voice↔Voice / Voice↔Channel relationship
spine:
status: To Do
origin: human-directed
approved_by: JC
depends_on: []
relates_to: [ACTS-186, ACTS-187, ACTS-185]
started_at: 2026-09-14T00:00:00-0700
updated:    2026-09-14T00:00:00-0700
latest_handoff: null
sessions: 0
---

## Goal
As a user, I want a piece of content to connect **both** the person who made it **and** the
organization that published it — so my threads reflect reality, where an author's work is
often published through someone else's channels. Today the model credits only **one** Vessel
per item (one `voice_id`, one `channel_id`, and after ACTS-186 one `attribution_voice_id` on a
`Source`), so it can't express "authored by X, published by Y."

## The motivating case (JC, 2026-09-14)
**Fr. Mike Schmitz** has his **own Instagram channel** under his name — but a lot of his work
is **published through Ascension's YouTube and Instagram** channels. So:
- The **author** is Fr. Mike (a `Voice`, individual).
- The **publisher** is Ascension (a `Voice`, organization) — and the content actually lives on
  **Ascension's channel**, not Fr. Mike's.
- The current model forces a choice: set `voice_id` to Fr. Mike **or** to Ascension. If you
  pick Fr. Mike, his Ascension-published video can't sit on Ascension's channel; if you pick
  Ascension, you lose that Fr. Mike authored it. His personal channel and his Ascension work
  never thread together.

**Same pattern — the Pope (JC, 2026-09-14).** His homilies, encyclicals, audiences and posts
are authored by the person but published through **Vatican** channels (Vatican News, the
Dicastery for Communication, @Pontifex). Same author≠publisher split. The Pope also surfaces a
**further wrinkle to consider** (not necessarily solve here): the papacy is an **office** held
by different people over time — an encyclical may be credited to "the Pope" (the office) and to
"Pope Francis" (the person). So a full model might need author (person) + publisher (org) **+**
optionally a role/office the person holds. Capture as a nuance; don't let it block the core
author/publisher decision.

## The modeling question (to decide here)
Options (not mutually exclusive):
1. **Two links on content** — `author_voice_id` + `publisher_voice_id` (and let `channel_id`
   point at a channel owned by the *publisher* even when the author is someone else).
2. **Voice↔Voice edge** — an "affiliated with / publishes through" relationship between Fr.
   Mike and Ascension, so their work cross-threads without duplicating per item.
3. **Channel↔Voice flexibility** — allow a channel to credit a guest/author distinct from the
   channel's owning Voice (a per-item "featuring" author), since the real unit is often "this
   video, on Ascension's channel, by Fr. Mike."
4. Some combination — likely (1) for the per-item truth + (2) for the standing relationship.

Cascades into: QuickAddLink (paste-a-link attribution), knowledge item editor (author/channel),
the `Source.attribution_voice_id` field (ACTS-186), and the unified add/edit form (ACTS-187).

## Interim decision (JC, 2026-09-14)
**Keep the single link for now.** The ACTS-186 wiring stands: the user attributes the **source**
(one Vessel) on the attribution field; author-vs-publisher pairing is deferred to this story.

## Acceptance criteria
- [ ] Decide the model (options above) and file the data-shape change(s).
- [ ] Content can express author **and** publisher where they differ (e.g. Fr. Mike on
      Ascension's channel).
- [ ] Existing single-link data migrates cleanly (no reset; back-compat with `voice_id` /
      `attribution_voice_id`).
- [ ] Capture surfaces (QuickAddLink, knowledge editor, ACTS-187 form) updated to match.

## Tests
No runner yet (ACTS-92). Verify author≠publisher round-trips; a video on the publisher's
channel still threads to the author; old single-link items keep working.
