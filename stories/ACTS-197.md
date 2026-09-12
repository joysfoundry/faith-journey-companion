---
id: ACTS-197
title: Allow multiple scripture citations on one quote (advanced journaling — compare passages)
spine:
status: To Do
origin: human-directed
approved_by: JC
depends_on: [ACTS-196]
relates_to: [ACTS-191, ACTS-193, ACTS-183, ACTS-181]
started_at: 2026-09-11T22:24:49-0700
updated:    2026-09-11T22:24:49-0700
latest_handoff: null
sessions: 0
---

## Goal
As someone journaling more deeply, I want a scripture quote to be able to carry **more than one
citation** — so I can hold a cross-reference or **compare two passages/books** side by side in one
kept quote, and have it file/surface under each. This is an **advanced journaling** capability, not
the everyday capture path.

JC (2026-09-11):
> Do prompt w/ found candidate [ACTS-196] and then write a story to enable "allow multiple
> citations" — this would be used by advanced journaling, comparing two books and citations. So
> this is eventual, not immediate.

## Why (what ACTS-196 deliberately leaves)
ACTS-196 keeps **one citation per quote**: on a multi-book paste it prompts with the found
candidates and files under the single one the user picks (or leaves it in the general Scripture
bucket). That's right for capture, but it can't represent a genuine cross-reference or a
compare-two-passages reflection. `scripture_ref` is a single string today, and the Vessels
by-book grouping (`bibleBookName(scripture_ref)`) assumes exactly one book.

## Behavior (proposed — to design)
- A quote may hold **N citations** (ordered; first = primary for label/dedup back-compat).
- Vessels by-book grouping surfaces the quote under **each** cited book (de;dup so one quote isn't
  double-counted within a book).
- Journal byline / deep-link handles multiple refs gracefully.
- Capture stays simple (ACTS-196's one-citation prompt); multiple is an **explicit add-another**
  action in the quote editor, for advanced use.

## Open questions for JC
- **Data-shape:** widen to `scripture_refs?: string[]` (keep `scripture_ref` as a derived/primary
  mirror for back-compat + no `STORAGE_KEY` bump), or a new structured list? (Flag first.)
- **Grouping/label:** show under every book vs a primary + "also cites…"? What does the byline read
  with 2+ refs?
- **Scope:** editor-only add-another, or also a "compare passages" journaling surface?

## Tests
No runner yet (ACTS-92). **Unit:** primary-ref derivation + multi-ref normalize/dedup. **Integration:**
a 2-citation quote groups under both books once each; byline renders. **E2E:** add a second citation
to a kept quote → appears under both books in Vessels. Planned.
