# Session — 2026-09-15 · connected-entity sweep closed, Ascension channel model, Vessels alpha

Stories touched: **ACTS-186** (Done), **ACTS-205** (Done, new), filed **ACTS-201/202/203/204**
(204 In Progress).

## What happened (in order)
1. **Reviewed status 185→current**, corrected the 186↔187 dependency (186 audit *feeds* 187, not
   blocked by it), and rendered the board.
2. **ACTS-186 connected-entity sweep** — audited every text input; wired the stray + could-be
   entity inputs to link instead of storing loose strings:
   - knowledge "New Vessel by name", QuickAddLink "From", mystery-version "Attribution"
     (new `Source.attribution_voice_id`), Tags (`TagSuggestInput` soft autocomplete), provenance
     "Source" (`SourceAttributionInput` = name autocomplete + publisher-Voice link).
   - Org/channel work driven by JC testing with Ascension: `orgBrandName`/`ORG_BRANDS` brand map
     (any Ascension subdomain → "Ascension Press"), `@handle` reserved for individuals,
     match-by-name, match-mode **channel-add** (one Vessel → many channels), path-aware
     `detectCategory` (podcast/video/program/book instead of everything→program).
   - **Celebrant → Voice** (`MassExperience.celebrant_voice_id`); a new celebrant name now creates
     an individual Vessel on save (JC caught that "Fr. Venn" wasn't showing up as a Voice).
   - Fixed a "rendered fewer hooks" bug (tag `useMemo` after early returns in `knowledge.$knowledgeId`).
   - **Closed ACTS-186** (handoffs session-01 + session-02, status Done).
3. **Ascension channel-model design** (walkthrough of ascensionpress.com Programs + App & Media):
   one Vessel → **typed channels** (podcast/video/program/shop) → content; a channel can be tied
   to an **individual host** (Fr. Mike hosts Ascension's Sunday Homilies — author≠publisher);
   **containers have no status, only content does** (Sunday Homilies mislabeled as a Program is the
   status bug); **prayers thread to a Vessel via their Source**. Captured as **ACTS-204** (In Progress).
   Rendered a visual model map for JC.
4. **ACTS-205 (new, Done)** — Vessels page ordered **alphabetically in every filter** (was
   content-first/status-first); **Home keeps "Vessels with content first"** (separate `pinnedLinks`
   path). Items within groups now alpha via a local `byTitle` comparator.

## Verified (and how)
- `tsc --noEmit` clean throughout.
- Live in the in-app browser (dev :8080), each with a localStorage/DOM check:
  - knowledge box: "Tren" → links existing Trent Horn, no duplicate.
  - Org prefill: both Ascension product/program URLs → "Ascension" (org), not `@product`/`@program`.
  - app-subdomain: `app.ascensionpress.com/podcasts/homily` auto-attributed to one "Ascension Press",
    added a "Homilies" channel, item filed under it — no duplicate Vessel.
  - `detectCategory` regex checked in Node for all path shapes.
  - Celebrant: "Fr. Mi" → links existing Fr. Mike; "Fr. Venn" (new) → creates + links an individual Vessel.
  - Vessels page: By-Vessel A–Z with empty Vessels interleaved; flat "All" list A–Z (quote first).

## Git state at handoff
Everything committed. **Committed-not-pushed** at session end (sandbox can't auth to GitHub) — the
latest commits (ACTS-205 code+story+done, plus the ACTS-186 celebrant follow-up and handoffs) need
a push from JC's client: `git push origin main`. Earlier commits were pushed by JC during the session.

## Parked / next
- **ACTS-204** (In Progress) — typed channels / content-under-channel model. **Do next in a new
  thread**; model + matching only (channel `kind`, content-under-channel by path, host Voice,
  no-status-on-containers, prayer Source→Voice). Then **ACTS-187** unifies the add/edit form.
- **ACTS-201** parish entity · **ACTS-202** author vs publisher / channel↔Voice many-to-many ·
  **ACTS-203** real Tag entity — filed, To Do.

## Next session — opener (paste to start)
> `/start ACTS-204` — build the typed-channel model on the Vessels page: give a Channel a `kind`
> (podcast/video/program/store), match pasted content to its channel by URL path (query stripped,
> most-specific wins), let a channel carry a host Voice distinct from the owning Vessel, ensure
> containers (channel/series) show no status while their content items do, and route a prayer's
> Source to its Vessel. Model + matching only — leave the unified add/edit UI to ACTS-187. Read
> `stories/ACTS-204.md` first. NOTE: push may still be pending — run `git push origin main` if so.
