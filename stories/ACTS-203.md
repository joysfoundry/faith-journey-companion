---
id: ACTS-203
title: Tags as a real entity (ids + rename-propagation + merge)
spine:
status: To Do
origin: human-directed
approved_by: JC
depends_on: []
relates_to: [ACTS-186]
started_at: 2026-09-14T00:00:00-0700
updated:    2026-09-14T00:00:00-0700
latest_handoff: null
sessions: 0
---

## Goal
As a user, I want tags to be **real connected things** — so renaming a tag updates it everywhere,
near-duplicates can be merged, and a tag can be browsed like an entity — instead of loose strings
copied onto each item. Split from the ACTS-186 connected-entity sweep: that shipped **soft
autocomplete** (`TagSuggestInput` suggesting existing tags via `allTags`), which keeps the
vocabulary consistent but tags are still `string[]` on `KnowledgeItem` and `Prayer`.

## Why more than autocomplete
Autocomplete stops *new* fragmentation but can't:
- **Rename** a tag across every item that already uses it.
- **Merge** "praying" / "prayers" / "prayer" that already exist.
- **Browse** a tag as a first-class page (everything tagged X), or rank/curate tags.

## The modeling question
- A `Tag` entity (`{ id, name, ... }`) with items referencing `tag_ids`, vs. keep `string[]` but
  add rename/merge operations that rewrite all items. (Local-first: a lightweight rename/merge
  over the existing string arrays may be enough before a full entity.)
- Migration from existing `string[]` (no reset — [[prayer-sourcing-model]] STORAGE_KEY-bump gotcha).
- Surfaces: the `TagSuggestInput` (ACTS-186), a tag browse/manage view, item editors.

## Acceptance criteria
- [ ] Decide entity vs. string+operations; file the data-shape change.
- [ ] Rename a tag → propagates to all items; merge two tags → combines.
- [ ] Existing tags migrate cleanly (no reset).
- [ ] `TagSuggestInput` still works (suggests from the canonical set).

## Tests
No runner yet (ACTS-92). Verify rename/merge propagation; migration preserves existing tags.
