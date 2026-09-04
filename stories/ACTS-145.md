---
id: ACTS-145
title: Home Vessels pins — show status and link together (books, podcasts, programs)
spine:
status: In Progress
origin: human-typed
depends_on: []
relates_to: [ACTS-130, ACTS-137, ACTS-129]
started_at: 2026-09-03T23:42:36-0700
updated:    2026-09-04T00:00:00-0700
latest_handoff: null
sessions: 0
---

## Goal
As someone on the Home page, I want a **Vessels** content pin (a book, podcast, program,
video) to show its **status** even when it also has an external **link** — showing **both**
when a link exists, and just the **status** when there isn't one — so I can see where I am
with the work whether or not it opens out to an app/site.

## Scope
**Only Vessels content pins on Home** — i.e. `PinnedLinkRow`
([`index.tsx`](../src/routes/index.tsx) ~L84–159) where `pin.ownerType === "content"` and the
category is status-bearing (`hasStatus`: **book / program / video / podcast**, per ACTS-130).
- **Not** the Daily Rosary row, and **not** voice/website channels (`ownerType === "voice"`,
  article/post/quote references — they don't carry a completion status).

## Why — the gap
`PinnedLinkRow` shows the pin's label/subtitle plus either an **external link-out** (when
`pin.url` is set) or an in-app link to the detail page (URL-less pins, ACTS-137) — but it
**never shows the item's status** (the not-started/in-progress/finished pill that
`ContentRow` renders in Formation via `hasStatus`, ACTS-130). JC's preference for Home
Vessels pins:
- **No link →** show the status.
- **Has a link →** show **both** the status **and** the link.

## Design — to weigh
- Surface the same status the Formation `ContentRow` uses (reuse `hasStatus` + the existing
  status pill/label so Home and Formation read consistently) inside `PinnedLinkRow`, for
  content pins only.
- Confirm placement on the row: status pill alongside the title/subtitle, with the link-out
  (or detail chevron) still present — so status is additive to, not swapped for, the link.
- Non-status content (article/post/quote) and voice pins render unchanged.

## Open questions (flag before building)
- Exact status affordance on the compact Home row — pill vs. small eyebrow — and where it
  sits relative to the external-link icon and the reflect/chevron actions.
- Should tapping the status do anything (e.g. cycle it) on Home, or is it read-only here?

## Acceptance criteria
- [ ] A Home Vessels content pin with **no** external link shows its status.
- [ ] A Home Vessels content pin **with** an external link shows the status **and** the link.
- [ ] Status shown for status-bearing categories only (book/program/video/podcast); voice
      channels and reference content (article/post/quote) are unchanged.
- [ ] Status matches what Formation's `ContentRow` shows for the same item (reuse `hasStatus`).
- [ ] Browser-verified on mobile + desktop; no regression to existing pin behavior
      (link-out, detail chevron, reflect icon).

## Tests
_Planned — no runner wired yet (harness = ACTS-92); see
[`docs/E2E-TEST-PLAN.md`](../docs/E2E-TEST-PLAN.md). Convention ACTS-91._
- **Unit** (Vitest): `hasStatus` gating for the Home-pin case returns status for
  book/program/video/podcast and not for article/post/quote/voice.
- **Integration** (Testing Library): render a content pin with a URL → status **and**
  link-out present; without a URL → status present + detail link; a voice pin → no status.
- **E2E** (Playwright): a pinned book on Home shows its status next to its link; status
  matches the same book's status in Formation.
