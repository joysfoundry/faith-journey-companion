---
id: ACTS-183
title: Tie a quote to its source content (any content — book, podcast, article…)
spine:
status: To Do
origin: human-directed
approved_by: JC
depends_on: [ACTS-181]
relates_to: [ACTS-176, ACTS-180, ACTS-179, ACTS-171, ACTS-178]
started_at: 2026-09-09T18:24:28-0700
updated:    2026-09-09T18:24:28-0700
latest_handoff: null
sessions: 0
---

## Goal
As someone saving a quote **from something I've saved** — a book, a podcast, a video, an
article, a post — I want that quote tied to that content in my library, picking it if
it's already there or creating it from the quote if it isn't, so any piece of content
and its saved quotes are connected in both directions.

## Context (why)
ACTS-181 added typed quotes: a `book`/`article` quote names the **work** in `source` as
**free text** — it isn't linked to the `KnowledgeItem` the person may already have. JC
wants this generalized to **any content category**, not just books: *"this quote would
apply to any content — for instance a podcast can have saved quotes from that podcast."*
- **Content exists → quote from it:** pick the content item; the quote inherits its
  title (`source`) and author (Vessel), and the two are linked.
- **Quote first, no item yet:** an **"Add as content"** action mints the item (of the
  right category) from what was typed, then links the quote to it.
- **Reverse view:** any content's detail page lists **"Quotes from this"** — the book,
  the podcast, the video — each linking to its quotes.

The link is a single generic reference (`source_item_id`), so it composes across every
content category rather than being book-only. Reuses the existing entity graph (the same
idea as `KnowledgeItem.voice_id` and the reflection→`learning` `ReflectionLink`) — a
reference field plus two affordances, not a new subsystem.

How it sits with ACTS-181's `quote_kind`: the kind (open / scripture / book / article)
still drives the **fields shown**; the `source_item_id` link is **orthogonal** and works
regardless of kind. A podcast quote is kind `open` ("heard/read") **plus** a link to the
podcast item — no new quote kind needed.

## Acceptance criteria
- [ ] A quote can be linked to **any content `KnowledgeItem`** (new generic
      `source_item_id?: ID`, flagged data-shape below) — book, article, video, podcast,
      post.
- [ ] Add/edit a quote offers a **content picker** (the person's existing items, sensibly
      scoped/searchable); choosing one links it and fills title (`source`) + author
      (Vessel).
- [ ] When no matching item exists, **"Add as content"** creates the item in the right
      category from what was typed and links the quote to it.
- [ ] **Any** content's detail page shows **"Quotes from this"** — every quote whose
      `source_item_id` is that item — each linking to the quote.
- [ ] Unlinking / deleting the source item leaves the quote intact (link optional; the
      quote keeps its `source` text).
- [ ] Composes with the library (search, By Vessel / By Channel, category chips) and the
      ACTS-181 kinds (the link is orthogonal to `quote_kind`).

## Open questions for JC
- **Picker scope:** offer *all* content in the picker, or scope by a chosen category
  first (pick "podcast" → list podcasts)? Lean: one searchable picker across all content.
- **Author inheritance:** overwrite the quote's Vessel with the source item's, or only
  fill if empty? (Lean: fill if empty, never clobber.)
- **Two-way create:** should a content item's page also have "Add a quote from this"
  (the reverse of "Add as content")? Nice-to-have; can be a follow-on.
- **Data-shape** (flag before building): new generic `source_item_id?: ID` on
  `KnowledgeItem`. Migrate with **no `STORAGE_KEY` bump / no reset** (ACTS-177 pattern) —
  existing quotes simply have none.

## Tests
- **Unit**: resolver for "quotes of an item" (filter by `source_item_id`, any category);
  the create-from-quote builder (typed title/author → a valid item of the right category
  + linked quote). Planned.
- **Integration**: add a quote, link it to an existing item (test a book AND a podcast),
  assert inherited title/author + the reverse "Quotes from this" listing on each; add a
  quote with no item, "Add as content", assert both exist and are linked. Planned.
- **E2E**: extends **flow E12** (Formation / Knowledge). Planned.
