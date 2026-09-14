---
id: ACTS-201
title: Parish/Church as a connected entity (Mass capture — Church + Celebrant)
spine:
status: To Do
origin: human-directed
approved_by: JC
depends_on: []
relates_to: [ACTS-186, ACTS-185]
started_at: 2026-09-14T00:00:00-0700
updated:    2026-09-14T00:00:00-0700
latest_handoff: null
sessions: 0
---

## Goal
As a user logging a Mass, I want the **Church** (and eventually the **Celebrant**) to resolve
to a **connected entity** — not a stray free-text box — so my Mass log threads together across
visits (all the times I attended St. X, all the homilies by Fr. Y). Split out of the ACTS-186
connected-entity sweep because it needs a **new entity in the data model** (there is no
Parish/place entity today) — a decision, not just a wiring swap.

Origin: ACTS-186 audit — `WordSection.tsx:166` ("Church") and `:181` ("Celebrant") are stray
free-text. Celebrant is a person (candidate Voice); Church is a place with **no model**.

## Open questions to figure out
1. **Model:** add a `Parish` (place/organization) entity? Or reuse `Voice` (kind:
   organization)? A parish is a place *and* an org — likely its own light entity
   (`{ id, name, city?, diocese?, url? }`) linked from a Mass log.
2. **Celebrant:** link to a `Voice` (so homilies thread to the priest) or keep light? (Note:
   ACTS-186 left Celebrant deferred pending this.)
3. **Autocomplete source** — see the public-list finding below.

## Is there a public list of all parishes? (research, 2026-09-14)
Short answer: **no clean, official, free/open API of all Catholic parishes.** Options:
- **The Official Catholic Directory** (P.J. Kenedy & Sons) — authoritative but **commercial /
  licensed**, not an open dataset.
- **GCatholic.org** and **Catholic-Hierarchy.org** — comprehensive-ish web directories
  (dioceses; GCatholic lists many churches) but **scraped HTML, no open API**, terms unclear.
- **TheCatholicDirectory.com** — crowd/aggregated web directory, not an API.
- **Google Places / Maps API** — reliable "Catholic church near {place}" lookup, **paid per
  query**, needs a key + network (conflicts with local-first / offline).
- **OpenStreetMap** (`amenity=place_of_worship`, `religion=christian`,
  `denomination=catholic`) — **free & open**, queryable via Overpass, but **incomplete and
  uneven** in coverage/naming.

**Recommendation:** don't ship a bundled global parish list. Go **local-first**: a `Parish`
entity that **autocompletes against parishes the user has already entered** (same
`EntitySuggestInput` pattern as the rest of ACTS-186), growing per user. Optionally, *later*,
an opt-in Google Places or OSM lookup to seed a new parish's details — behind the existing
Bible-app-style "deep link out" posture, not a hard dependency.

## Acceptance criteria
- [ ] Decide the model (Parish entity vs Voice-org) and file the data-shape change.
- [ ] Mass **Church** field → `EntitySuggestInput` linking to the chosen entity (create-on-new).
- [ ] Decide + (if yes) wire **Celebrant** → Voice.
- [ ] No regressions to Mass capture.

## Tests
No runner yet (ACTS-92). Verify: Church autocompletes against prior parishes, links by id,
new name creates the entity; Mass log round-trips the link.
