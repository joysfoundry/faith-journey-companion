---
story: ACTS-139
session: 01
wrapped_at: 2026-09-03T22:40:35-0700
status: Done
final: true
---

## What happened
Split `/reflections` into **Write** and **Journal** tabs so capturing and revisiting
stop competing on one long scroll. Layout-only, in
[`reflections.tsx`](../../src/routes/reflections.tsx); no new route, no data-model change.

- Uses the app's shared shadcn `Tabs` component (matching Formation/Pray/Prayers) — a
  full-width two-column segmented control, active tab as a white pill — after first
  shipping a custom pill control and swapping it on JC's "make tabs like the other pages".
- **Write** is the default (the composer greets you); **Journal** mirrors the existing
  entries view (sort, expand/collapse, group by Date/Theme/Source). Dropped the now-
  duplicative "Journal" heading (the tab names it).
- Radix unmounts the inactive tab, but no state is lost: the journal's group/sort/expand
  state lives in the page component and the composer persists to the shared draft.
- A `?link=` deep-link (ACTS-129) lands on Write with the item pre-linked, because Write
  is the default.

## Verified (and how)
Own dev server (:8080), browser-driven:
- Write default active; switching to Journal shows entries + controls; group-by state
  carries across switches.
- Saved an entry on Write → it appears on Journal (state preserved).
- `?link=tpl-rosary` lands on Write with "The Holy Rosary · Luminous Mysteries" pre-linked.
- Tabs render in the shared style on both panels. `tsc` + `eslint` clean; all modules
  serve 200 (an earlier console 500 was a buffered mid-edit HMR state, confirmed gone on
  a fresh server).

All acceptance criteria met.

## Git state at handoff
Committed to `main`, **push pending** (local pushes failing on auth — flush from JC's git
client). ACTS-139 commits: `005ce82` (tabs), `73049ac` (docs) + the shared-Tabs restyle
folded into the ACTS-140 working session, and this handoff. `.env` left untracked-dirty.

## Next
Story complete. The Journal tab is the home ACTS-140 built its sitting-fold into.
To publish: `git push origin main`.
