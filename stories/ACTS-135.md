---
id: ACTS-135
title: Reflection organization — optional themes, no-AI tag suggestions, group-by view
spine:
status: In Progress
origin: human-directed
approved_by: JC
priority: medium
depends_on: []
relates_to: [ACTS-103, ACTS-102]
sync: local
synced_at: null
started_at: 2026-09-02T00:00:00-0700
updated: 2026-09-02T00:00:00-0700
latest_handoff: null
sessions: 0
---

## Goal
As a journaler, I want to **write or talk freely with zero organizing effort**, yet be
able to **organize afterward** — optional themes (with helpful, non-forced suggestions),
and browse my journal grouped **by theme, by source, or by date** (each sortable
ascending/descending) — so my reflections stay effortless to capture but easy to revisit,
and so a future insights/patterns feature has clean structure to work with.

_Design walkthrough with JC (2026-09-02). Split from ACTS-103: the inspiration panel +
date sort ship in ACTS-103; this story owns the organization layer (tags + grouped
views). Deliberately **no required organizing at capture time**._

## Key design decisions (from the walkthrough)
- **Tags are always optional.** Writing/talking never requires organizing. An entry with
  no theme is first-class.
- **Themes are structured** (`themes: string[]`) so the app can *list by category* —
  free text in `title` cannot support that. **DATA-SHAPE CHANGE — flag/confirm.**
- **Suggestions, not AI (for now).** Suggested themes come from (1) a curated **lexicon**
  of spiritual themes matched against the entry text, and (2) **the user's own prior
  tags** (recency/frequency). Deterministic, private, offline. Shown as **dismissible
  chips** (tap to accept) after save / below the box — never blocking.
  - **AI-suggested themes are a future opt-in** (semantic, richer) that rides the Cloud
    phase alongside ACTS-134; not in this story.
- **Source-links are a separate grouping axis** (JC: "source links… as a separate
  filter. group by source and by date"). The existing `Reflection.links` already carry
  provenance — group by them with no schema change.
- **One page, three lenses.** A single **"Group by: Date / Theme / Source"** control plus
  an asc/desc sort. `Theme`/`Source` render collapsible sections, each internally
  date-sorted. Rejected: sidebar sub-list (fights the ACTS-96 mobile drawer) and a
  notebook-tabs surface (cramped past ~5 categories on a phone; viable later as a skin).

## Scope
1. **`themes: string[]`** added to `Reflection` (optional; additive — existing entries
   render unchanged). Composer + edit dialog gain a chip/autocomplete input.
2. **No-AI suggestion engine** (pure `src/lib/**`): lexicon match + tag-history →
   ranked suggestions; surfaced as dismissible chips. Curated seed lexicon lives in a
   data module (reviewable / editable).
3. **Group-by view** on `/reflections`: `Group by: Date | Theme | Source`, asc/desc sort,
   collapsible sections for Theme/Source (reuse existing collapse machinery).
4. Untagged entries collect under a clear **"Untagged"** section in Theme view.
5. **Manual web link (URL + label)** in the composer (JC, 2026-09-02): the "Link an item"
   picker only offers a fixed internal list; add an **"Add a link"** affordance to attach
   any web URL with an optional label. **DATA-SHAPE CHANGE — flag:** `ReflectionLink`
   gains an optional `url`, plus a new `"link"` target type; the inspiration panel renders
   it as a reference card with an **Open ↗** out-link. (Source *parity* with Home — making
   the internal picker list every source you can tag from Home — is tracked in
   **[ACTS-136](ACTS-136.md)**, not here.)

## Non-goals (this story)
- AI/semantic tagging (future opt-in, Cloud phase).
- The insights/patterns feature itself (this story only lays the structure it needs).
- Voice/OCR capture (ACTS-134).

## Acceptance criteria
- [x] An entry can be saved with **no themes** and reads/edits normally.
- [x] `Reflection` gains optional `themes: string[]`; composer + edit dialog can add /
      remove theme chips (autocomplete from prior tags via a `<datalist>`); additive, no
      break to existing entries or links.
- [x] After writing, the user sees **dismissible suggested-theme chips** derived with no
      AI (lexicon + own history); accepting one adds it, ignoring is frictionless.
- [x] `/reflections` offers **Group by: Date / Theme / Source** with **asc/desc** sort;
      Theme and Source render collapsible, date-sorted sections (with counts); Date is
      the flat list.
- [x] Untagged entries appear under an "Untagged" group in Theme view ("No source" in
      Source view); the catch-all sorts last.
- [x] Composer can attach a **manual web link** (URL + optional label); it saves as a
      `"link"` `ReflectionLink` with a `url` (scheme auto-prepended), and the inspiration
      panel shows it with host detail + an Open ↗ out-link. Invalid/empty URL is rejected
      (Add button disabled).
- [x] Existing reflections and links continue to render unchanged (all fields additive;
      no `STORAGE_KEY` bump).

## Tests
_Convention (ACTS-91): no runner wired (harness = ACTS-92)._
- **Unit** — **verified** via standalone Node `--experimental-strip-types` harnesses
  against the real code:
  - `themes.ts` (suggest/normalize/history): **15/15** — lexicon match + stem inflection,
    applied-exclusion, limit, word-boundary (no "sin" in "using"), history ranking after
    lexicon + dedupe, `themeHistory` count/recency/case-fold.
  - `inspiration.ts` (incl. new `link` target): **25/25** — link label/host-detail/href,
    url-fallback label, `www.` stripped.
- **Integration** (planned): composer adds/removes theme chips + persists; suggestion
  chips accept/dismiss; group-by switches lenses.
- **E2E** (planned): write untagged (saves) → accept a suggestion → Group by Theme.
- **Browser verify** (done, session 01): typed an entry → SUGGESTED chips
  (Gratitude/Trust/Peace/Suffering) appeared from the text with no AI → accepted two →
  saved → **Group by Theme** showed it under Gratitude + Trust with an Untagged catch-all;
  **Group by Source** grouped by resolved link labels (Bible in a Year / Story of a Soul /
  No source); **Add a link** attached a scheme-less URL, normalized to https, panel showed
  host + Open ↗. (Gotcha: the Vite dev server needed a restart after new module files were
  added — a stale transform, not a code issue.)
