---
story: ACTS-145
session: 01
wrapped_at: 2026-09-04T11:14:19-0700
status: In Progress
---

## What happened
Built the **Home Vessels status eyebrow**. A content pin on Home's Vessels card now
surfaces the owning item's progress status as a compact, tappable **eyebrow** rendered
inline with the link/chevron — so a status-bearing pin shows its status **and** the link
when a link exists, and status alone when it doesn't. Per JC: a small eyebrow (not the
three-pill row Formation uses), on the same line so the row height doesn't grow, and
**tap-to-cycle** with only the current status showing.

- [`PinnedLink`](../../src/lib/prayer/knowledge.ts) gained optional `category`/`status`
  (content pins only), populated at both content push-sites (favorited-link rows +
  URL-less item pins, ACTS-137). Voice pins leave them undefined.
- Two helpers in the same file: `statusLabel()` and `nextStatus()` — the latter **wraps**
  Finished → Not started (JC confirmed the wrap, so a mis-tap corrects without a menu).
- [`PinnedLinkRow`](../../src/routes/index.tsx) renders the eyebrow gated on
  `hasStatus(pin.category)`; a tap calls the store's `setKnowledgeStatus` (the same
  mutation Formation's `ContentRow` uses), so Home and Formation stay in sync. The eyebrow
  sits **outside** the link element so tapping it changes status rather than opening the
  link. Styled read-only-looking but tappable, tinted by state (muted / foreground /
  primary-for-finished).

Status shown for book/program/video/podcast only; voice pins and reference content
(article/post/quote) are unchanged.

## Verified (and how)
Browser-verified in the dev preview (localhost:8080), **desktop + mobile (375px)**:
- Content pin **with** a link ("Why We're Catholic", Amazon) shows the eyebrow **and** the
  link-out, same row height as the voice pins.
- Tap **cycles** Not started → In progress → Finished → **wraps** back to Not started
  (confirmed each step via the button's aria-label).
- Voice pins (Hallow, USCCB) show **no** status. Status-bearing categories only.
- Setting status on Home reflected immediately in Formation's `ContentRow` (same item
  showed **Finished** highlighted) — sync confirmed.
- `read_console_messages` clean; `npx tsc --noEmit` + `eslint` clean.

**Not directly exercised:** the "**no** external link → shows status" case — the seed has
no URL-less content pin in Vessels. The render gates on `category` outside the link element
and the item-pin push-site sets `category`/`status` identically, so the path is covered by
construction, but it wasn't clicked live. Worth a quick manual confirm when a link-less book
is pinned.

## Acceptance criteria
- [x] Home Vessels content pin with **no** external link shows its status *(by construction;
  not clicked live — see above)*.
- [x] Home Vessels content pin **with** an external link shows the status **and** the link.
- [x] Status shown for status-bearing categories only; voice + reference content unchanged.
- [x] Status matches Formation's `ContentRow` (reuses `hasStatus` + `setKnowledgeStatus`).
- [x] Browser-verified on mobile + desktop; no regression to link-out / chevron / reflect.

## Git state at handoff
Committed **and pushed** (JC pushed from their client after an env auth failure here):
- `e9ad2b2` — `ACTS-145: Home Vessels status eyebrow (…)` (code)
- `25735f7` — `ACTS-145: mark story In Progress` (pointer)
This handoff commit follows. Working tree clean except `.env` (local env, intentionally
uncommitted).

## Next
Story is functionally complete and verified. To close it out:
- Optionally do the one live confirm of the **no-link content pin** case (pin a book with
  no favorited link → eyebrow shows without a link-out).
- Then `/done` (mark Done). Tests remain planned (harness = ACTS-92; see
  `docs/E2E-TEST-PLAN.md`).
- Cosmetic-only open item if JC wants it: eyebrow color/wording tweak — currently
  muted/foreground/primary by state.
