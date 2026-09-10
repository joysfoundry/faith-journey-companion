---
id: ACTS-183
title: Tie a quote to its source content (any content — book, podcast, article…)
spine:
status: Done
origin: human-directed
approved_by: JC
depends_on: [ACTS-181]
relates_to: [ACTS-176, ACTS-180, ACTS-179, ACTS-171, ACTS-178, ACTS-185, ACTS-186, ACTS-187, ACTS-188]
started_at: 2026-09-09T18:24:28-0700
updated:    2026-09-10T13:03:55-0700
latest_handoff: ACTS-183/session-01.md
sessions: 1
---

> **Done 2026-09-10.** All acceptance criteria met and verified live (session-01). Core
> shipped: `source_item_id` linking + `QuoteSourcePicker` + reverse "Quotes from this";
> Bible modeled as one book per translation (linked book = version) + scripture-by-book
> grouping. Follow-on UX/redesign split out: **ACTS-185** (Done), **ACTS-186** (sweep, open),
> **ACTS-187** (unified add form), **ACTS-188** (Settings version toggles). Deferred and not
> yet filed: paste-a-link from a quote's source ("icon next to the others"). Committed,
> unpushed — JC to `git push`.

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
- [x] A quote can be linked to **any content `KnowledgeItem`** (new generic
      `source_item_id?: ID`) — book, article, video, podcast, post. Added to the type,
      normalized in `store.ts`, migrated with **no `STORAGE_KEY` bump** (existing quotes
      simply have none).
- [x] Add/edit a quote offers a **content picker** (`QuoteSourcePicker`, on the quote's
      detail/edit page) — one searchable list across all non-quote content; choosing one
      links it and **fills** title (`source`) + author (Vessel/`creator`) **only if empty**.
- [x] When no matching item exists, **"Add as content"** mints the item in the right
      category (defaulted from `quote_kind`, editable), carries the quote's author, and
      links the quote to it.
- [x] **Any** content's detail page shows **"Quotes from this"** — every quote whose
      `source_item_id` is that item — each linking to the quote. (The quote's own page also
      shows a forward "From …" link to its source.)
- [x] Unlinking / deleting the source item leaves the quote intact — `deleteKnowledgeItem`
      clears any dangling `source_item_id`; the quote keeps its free-text `source`.
- [x] Composes with the ACTS-181 kinds (link is orthogonal to `quote_kind` — a book quote
      stayed kind `book` through link/unlink/mint/delete in the live check).

## Folded in (JC, this session) — reflection ↔ content connection
JC: launching a reflection from a **quote** attached it under the generic **Link an item**
icon, not the **quote** icon. Root cause: a `?link=<id>` prefill drops the id into the
composer's `linked` set, which lit the Link2 affordance regardless of kind.
- [x] `ReflectionComposer` icon states are now **kind-aware**: a quote inspiration (minted
      inline *or* reflected-from an existing quote record — any `learning` link whose target
      is a `quote` item) lights the **Add a quote** icon; **Link an item** lights only for
      non-quote entities. Verified live (`aria-pressed`: Add-a-quote `true`, Link-an-item
      `false`).

## Folded in (JC, this session) — attribution surfacing
- [x] **Promote a free-text author to a Vessel.** A quote attributed only by free-text
      `creator` sat in the **General** (unattributed) bucket, invisible to By-Vessel. The
      editor now shows **"Make '<name>' a Vessel"** (`promoteCreatorToVoice` in
      `knowledge.$knowledgeId.tsx`) — reuses an existing Vessel of the same name (no dupes)
      or mints one, sets `voice_id`, clears the now-redundant `creator`. Verified live: the
      Vessel appeared under the grouped view. (Seed note: "YOUCAT, Benedict XVI" conflates a
      book + a person — worth fixing the author to "Benedict XVI" before promoting for real.)
- [x] **Scripture quotes group by book of the Bible.** *Unattributed* `scripture` quotes
      form **virtual per-book buckets** (e.g. "Luke", subtitle "Book of the Bible") in the
      grouped view — JC's model: *"each book's author is the book's name itself"* (don't
      claim human authors — Psalms/Gospels/Hebrews are multiple/anonymous). New
      `bibleBookName()` in `bible/apps.ts` resolves full names **and common abbreviations**
      ("Lk 2:10" → "Luke") and improves the Bible deep-link too. A quote with a **real**
      Voice keeps it (a quote never leaves its Vessel); only a quote with no real Voice (incl.
      one tied to an empty "Untitled" Voice) buckets by book. Verified live.
- [x] **The Bible is a book in the library — modeled one book per translation** (JC:
      *"put the version of the bible as the bible … an entry for NAB, one for NIV"*). Seeded
      in `normalizeVariants` (idempotent, no reset): **"Bible — NABRE / NIV / ESV / NLT /
      NKJV / KJV / NASB / RSVCE / DRA"**, each with its reader link (NABRE→USCCB, else Bible
      Gateway), plus a version-less **"Bible"** (`BIBLE_BOOK_ID`) for **Unknown**. `store`
      helpers: `bibleVersionBookId`, `isBibleBookId`. **The book a scripture quote links to
      IS its version** (`source_item_id`) — no separate field. Every unlinked scripture quote
      auto-links to the reader's **Settings translation** (default). Each version's page lists
      its verses ("Quotes from this"). Verified live (Bible — NABRE page showed Lk 2:10).
- [x] **Version picker on scripture quotes** (JC) — the editor shows a **Version** dropdown
      for `scripture` kind: the 9 translations + **Unknown**, defaulting to the Settings
      translation; picking one sets `source_item_id` to that "Bible — X" book. The generic
      source picker is hidden for scripture (their source is always the Bible). The view
      byline shows the version ("— Lk 2:10 · NABRE"). Verified live (10 options; changing to
      NABRE re-linked the quote and the NABRE page listed it).
- [x] **Bible books kept out of the General bucket** (JC: *"why is bible under general?"*) —
      reference works, not stray unattributed content, so all Bible books are excluded from
      the Voices-view General bucket (`isBibleBookId`). They still list under **Books**; their
      verses live in the per-book buckets. Verified (General back to the 8 pre-Bible items).
- [x] **Empty-name Voices no longer render as groups** — an "Untitled" Voice with nothing
      under it (e.g. after its only scripture quote moved to a book bucket) is now hidden
      from the grouped view.
- [x] **By Channel drops the "No channel" bucket** (JC): the channel view shows only content
      that lives on a channel, the way the Books filter shows only books. Content with no
      channel (quotes, linkless saves) is simply omitted there.
- [x] **Filter pills relabeled** (JC): dropped the "By" prefix — **By Vessel → "Voices"**,
      **By Channel → "Channel"**. Section umbrella "Vessels" left unchanged.

## Open (JC is thinking about it) — Vessel vs Voice concept
JC: *"vessels and voices are mixed up. Voices are people and organizations. Vessels… more
general — a book is a vessel, programs… vessels of God's messages."* The umbrella term and
model are **still being worked out** — deferred. Live tension to resolve then: the
scripture **book** buckets and the promoted authors both surface under the **Voices** pill,
which now reads as people/orgs; a book-as-vessel may want a different home.

## Decisions (were open questions)
- **Picker scope:** one searchable picker across all content. ✅
- **Author inheritance:** fill-if-empty, never clobber — *"empty"* means **neither**
  `voice_id` **nor** `creator` set (the live check caught a first cut that only looked at
  `voice_id` and so overrode a free-text author). ✅
- **Data-shape:** generic `source_item_id?: ID`, no `STORAGE_KEY` bump. ✅

## Deferred → spinoff (JC)
"Add a link to a post that operates like the Add-Vessels **paste-a-link** flow, launched
from a quote's source" — JC: *"was planning that next … probably an icon next to the
others."* Not built here; file as its own story (enrich a minted/linked source via the
`QuickAddLink` paste-a-link path, surfaced as an extra affordance in `QuoteSourcePicker`).

## Tests
No automated runner yet (ACTS-92 deferred) — verified live in the running app instead
(port 8081; used the seeded "The world offers you comfort…" book quote + "Why We're
Catholic", restored to seed state after):
- **Link existing** → `source` filled (was empty), `source_item_id` set, author **not**
  overridden (kept `creator` "YOUCAT, Benedict XVI"; `voice_id` stayed unset). ✓
- **Reverse** → "Why We're Catholic" page showed **Quotes from this** with the quote,
  linking back. ✓
- **Add as content** → minted a `book` (category defaulted from kind), carried the author,
  linked the quote. ✓
- **Delete source** → minted item deleted; quote's `source_item_id` auto-cleared, `source`
  text survived. ✓
- **Reflection icon** → reflect-from-quote: `aria-pressed` Add-a-quote `true`, Link-an-item
  `false`. ✓
- No console errors throughout.
- **Planned (when ACTS-92 lands):** unit `quotesFromItem` / `sourceItemOf` /
  `defaultSourceCategory`; the fill-if-empty guard; `deleteKnowledgeItem` dangling-clear.
  E2E extends **flow E12** (Formation / Knowledge).
