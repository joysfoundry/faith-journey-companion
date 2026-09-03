---
id: ACTS-135
title: Reflection organization — optional themes, no-AI tag suggestions, group-by view
spine:
status: To Do
origin: human-directed
approved_by: JC
priority: medium
depends_on: []
relates_to: [ACTS-103, ACTS-102]
sync: local
synced_at: null
started_at: null
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

## Non-goals (this story)
- AI/semantic tagging (future opt-in, Cloud phase).
- The insights/patterns feature itself (this story only lays the structure it needs).
- Voice/OCR capture (ACTS-134).

## Acceptance criteria (draft — refine when picked up)
- [ ] An entry can be saved with **no themes** and reads/edits normally.
- [ ] `Reflection` gains optional `themes: string[]`; composer + edit dialog can add /
      remove theme chips (autocomplete from prior tags); additive, no break to existing
      entries or links.
- [ ] After writing, the user sees **dismissible suggested-theme chips** derived with no
      AI (lexicon + own history); accepting one adds it, ignoring is frictionless.
- [ ] `/reflections` offers **Group by: Date / Theme / Source** with **asc/desc** sort;
      Theme and Source render collapsible, date-sorted sections; Date is the flat list.
- [ ] Untagged entries appear under an "Untagged" group in Theme view.
- [ ] Existing reflections and links continue to render unchanged.

## Tests
_Convention (ACTS-91): document when picked up. Planned; harness = ACTS-92._
- **Unit** (pure `src/lib/**`): suggestion engine — lexicon match + history ranking is
  deterministic; grouping selector buckets entries by date/theme/source correctly;
  asc/desc ordering.
- **Integration**: composer adds/removes theme chips and persists `themes`; suggestion
  chips accept/dismiss; group-by control switches lenses and sort.
- **E2E**: write an entry with no tags (saves fine) → accept a suggested theme → switch
  Group by: Theme and see it under that section; group by Source; flip asc/desc.
