---
id: ACTS-137
title: Item-level "Pin to Home" for Vessels (no favorited URL required)
spine:
status: In Progress
origin: human-directed
approved_by: JC
priority: high
depends_on: []
relates_to: [ACTS-136, ACTS-134, ACTS-130, ACTS-129]
started_at: 2026-09-03T00:00:00-0700
updated: 2026-09-03T00:00:00-0700
latest_handoff: null
sessions: 0
---

## Goal
As someone building my library, I want to **pin a Vessel item (a book, program, video,
podcast) to the Home page directly**, without having to add and favorite a URL for it, so
the things I'm working through show up on Home even when I never saved a link.

_Found finishing [ACTS-136](ACTS-136.md) (2026-09-03). JC added an Amazon link for a book
and starred it to pin it — but realized most people won't add a URL, yet still want the
item on Home._

## The gap (confirmed in the code)
Home "Vessels" is built by `pinnedLinks(voices, items)`
([`knowledge.ts`](../src/lib/prayer/knowledge.ts)) which surfaces **only favorited
links** — favorited voice channels and favorited content links
(`KnowledgeLink.favorite`). "Pin to Home" is a **per-link** star:
`toggleContentLinkFavorite(itemId, linkIndex)` (used in
[`formation.tsx`](../src/routes/formation.tsx),
[`knowledge.$knowledgeId.tsx`](../src/routes/knowledge.$knowledgeId.tsx),
[`VoiceEditor.tsx`](../src/components/knowledge/VoiceEditor.tsx)). Consequences:
- A `KnowledgeItem` has **no item-level pin** field — only its links carry `favorite`.
- An item with **no link**, or whose link the user never stars, **cannot reach Home**.
- So "Why We're Catholic" only shows because its Amazon link was favorited.

## Scope (sketch — refine when picked up)
1. **Item-level pin.** Add `pinned?: boolean` to `KnowledgeItem`
   ([`types.ts`](../src/lib/prayer/types.ts)) — additive, so **no `STORAGE_KEY` bump**
   (loadDatabase shallow-merges). Store action `toggleItemPinned(id)`. **DATA-SHAPE — flag.**
2. **Pin control on the item**, not just its links: a "Pin to Home" star at the item level
   in the Library (`formation.tsx` `ContentRow`) and the knowledge detail
   (`knowledge.$knowledgeId.tsx`). Keep the existing per-link favorites working.
3. **Home surfaces item-pins even with no favorited link.** Extend the Home-pins builder
   (`pinnedLinks`, or a new `homePins`) to include `pinned` items; a URL-less pin's row
   links to the item **detail page** (or its `primaryUrl` if it has one). `PinnedLinkRow`
   ([`index.tsx`](../src/routes/index.tsx)) must handle "no external URL" (render an
   internal `Link` instead of `ExtLink`).
4. **Ordering.** Keep the ACTS-134/136 status-first, A–Z-within-tier order across the
   merged set (favorited links + item pins), de-duped so an item pinned *and* link-
   favorited shows once.
5. **Decide** the interaction between an item pin and its link favorites (independent
   toggles vs. item-pin implies "show on Home"). Document the choice.

## Decisions (item 5) + implementation log
_Session 01 (2026-09-03). Confirmed with JC before coding._
- **Item pin ↔ link favorites = independent toggles.** Pinning the item and starring a
  link are separate. Home merges both sets **de-duped**: if an item already contributes a
  favorited-link row, its item-pin is suppressed so it shows once.
- **URL-less pin row target:** opens the item **detail page** when the item has no link at
  all; if it has a link, the row opens its `primaryUrl` (the first/favorited link).
- **Built:**
  - `KnowledgeItem.pinned?: boolean` (additive, **no `STORAGE_KEY` bump**) +
    `toggleItemPinned(id)` mutation, store interface, provider wiring.
  - `PinnedLink` extended (`url?`/`platform?` optional, added `subtitle?`); `pinnedLinks`
    now appends item pins (de-duped, status-first + A–Z preserved across the merged set).
  - `PinnedLinkRow` renders an internal `<Link>` to the detail page for URL-less pins.
  - Item-level pin control: a `Pin` icon-button in the Library `ContentRow` (both the
    quote and standard rows) and a "Pin to Home" toggle in the knowledge detail VIEW.
- **Verified:** `tsc --noEmit` clean; ESLint clean; a focused unit check of `pinnedLinks`
  (de-dupe of pinned + link-favorited, URL-less → detail, primaryUrl fallback, exclusion of
  unpinned, status-first + A–Z order) — all pass. **Browser/E2E pending:** the preview
  browser was permission-blocked this session, so the on-screen flow is unverified.

## Non-goals
- Reflection composer / draft work (ACTS-136, done).
- Re-theming the Vessels section; voice-level item pins beyond what already exists.

## Acceptance criteria (draft — refine when picked up)
- [ ] A book/program with **no links at all** can be pinned to Home and appears in the
      Home Vessels card.
- [ ] Pinning an item with no favorited URL surfaces it on Home; its Home row opens the
      item (detail page or its primary link).
- [ ] Existing per-link "Pin to Home" favorites still work and still appear.
- [ ] The Home Vessels order stays status-first, A–Z within tier, with no duplicate rows
      for an item that is both pinned and link-favorited.
- [ ] No `STORAGE_KEY` bump; existing saved data unaffected.

## Tests
_Convention (ACTS-91): document when picked up. Planned; harness = ACTS-92._
- **Unit** (`src/lib/**`): the Home-pins builder includes `pinned` items with no
  favorited link; de-dupe of pinned + link-favorited; status-first + A–Z ordering holds
  across the merged set.
- **Integration**: toggle item pin in the Library → item appears in the Home Vessels
  list; URL-less pin row navigates to the item detail.
- **E2E**: add a book with no link → pin it → it shows on Home → open it from Home.
