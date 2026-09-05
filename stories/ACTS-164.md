---
id: ACTS-164
title: Say the "build it once, share it, pray alongside" promise on the About page
spine:
status: In Progress
origin: human-typed
approved_by: JC
depends_on: []
relates_to: [ACTS-143, ACTS-160, ACTS-94]
started_at: 2026-09-05T15:39:48-0700
updated:    2026-09-05T15:39:48-0700
latest_handoff: null
sessions: 0
---

## Goal
As someone deciding whether Oravia is for them, I want the About copy to name the
flipping-through-booklets problem and the pray-alongside answer, so that I recognize my
own experience in it.

## Context
The About copy already gestures at this — "compiling a devotion into a guided flow …
and a follow link so others can pray along" — but it's buried mid-sentence in a list of
capabilities. JC asked for it said plainly: build a devotion **as you have learned to
pray it**, without flipping through booklets and papers, and **share it** so others can
pray alongside you — so someone still learning isn't lost and can stay focused on the
prayer.

⚠️ **This copy lives in two mirrored places** and they must not drift:
- `src/routes/about.tsx` — the in-app About page (ACTS-143)
- `public/invite.html` — the public beta invitation, outside the gate (ACTS-160)

Both carry a "One place for your journey" section; that's where it belongs.

## Acceptance criteria
- [x] The "One place for your journey" section names building a devotion the way you
      have learned to pray it, without flipping between booklet, holy card and printout
- [x] It names sharing so others pray it alongside you, and that someone still learning
      has the words in front of them and can stay in the prayer
- [x] The same copy lands in **both** `about.tsx` and `public/invite.html`
- [x] Tight — two sentences, in the page's existing voice; no new section heading
- [x] `tsc` + `vite build` clean

## Verified
- Rendered `/about` in the browser at 375×812 — the new paragraph reads correctly between
  the scattered-places paragraph and the "hub, not a walled garden" one; no wrap issues.
- Rendered `/invite.html` at 375×812 — same paragraph, contraction-free to match that
  page's voice ("and it is there every time").
- `tsc --noEmit` clean; `vite build` clean.
- ⚠️ Prettier reports pre-existing style warnings in **both** files — confirmed present on
  a clean tree before this edit, so left untouched (ACTS-155 precedent).

## Tests
_Static copy change — no logic, no data shape, no `STORAGE_KEY` bump._
- **Unit** (Vitest): N/A — no `src/lib/**` code touched.
- **Integration** (Testing Library): N/A — presentational copy only.
- **E2E** (Playwright): N/A — copy only; verified by reading the rendered page.
