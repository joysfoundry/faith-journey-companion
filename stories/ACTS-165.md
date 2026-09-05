---
id: ACTS-165
title: Swap the About sections — prayer/devotions under "More than a prayer app", learning + fellowship under "One place for your journey"
spine:
status: In Progress
origin: human-typed
approved_by: JC
depends_on: []
relates_to: [ACTS-164, ACTS-143, ACTS-160]
started_at: 2026-09-05T16:32:42-0700
updated:    2026-09-05T16:32:42-0700
latest_handoff: null
sessions: 0
---

## Goal
As a reader of the About page, I want each section to hold the content its heading
promises, so that the value proposition lands instead of the two sections arguing about
which is which.

## Context
The two middle sections had drifted into each other's territory: "More than a prayer app"
held the faith-*learning* paragraph, while "One place for your journey" held all three
prayer/devotion paragraphs. JC's call is to swap them.

- **More than a prayer app** — sets context that Oravia honors **both open and structured
  prayer**; the claim is not "it stores prayers" but that it **digitizes them into one
  place**, which is what makes building a devotion the way you pray it possible, and
  ultimately sharing it.
- **One place for your journey** — the faith-learning paragraphs, **elevated so that one
  place is not only for me**: it is easy to find and hand on, which encourages fellowship,
  because the people walking with you are part of your journey too.

⚠️ Same two mirrored surfaces as ACTS-164 — `src/routes/about.tsx` and
`public/invite.html` — edited together, contractions differing on purpose.

## Acceptance criteria
- [ ] "More than a prayer app" opens by honoring **both** open and structured prayer
- [ ] It states the value prop as a contrast (most prayer apps hand you a fixed text;
      this one lets you compose the devotion), not as a category label
- [ ] The scattered-sources list appears **once** — the ACTS-164 copy said
      "scattered places → gathered" twice, which is the redundancy JC flagged
- [ ] "One place for your journey" carries the learning + hub paragraphs and closes on
      **fellowship** — one place is easy to hand on, and others are part of your journey
- [ ] The devotion paragraphs keep the **guided-flow** clause and its closing line
      ("so the tool disappears and the prayer stays") — restored after the first pass
      dropped them with the redundancy trim
- [ ] The devotion is described as one you **customize the way you, your family, or your
      parish pray it** — the promise is communal, not only personal
- [ ] Both `about.tsx` and `invite.html` updated, each in its own voice
- [ ] `tsc` + `vite build` clean

## Decisions taken during the edit
- **Restored, after being cut:** the guided-flow clause ("the right day, the right
  mysteries and readings, reflection as a first-class step, and a way to sing") and
  "so the tool disappears and the prayer stays" — it existed only in `about.tsx` and was
  lost in the first pass. It now lives in **both** files, as its own paragraph.
- **Cut for good:** the scattered-sources list ("a Rosary pamphlet, a hymnal, a holy card,
  a family novena someone texted you") — JC's call; the sentence was tightened to "those
  prayers are scattered across paper and apps" rather than left as a stub.
- **"Build" → "customize", and personal → communal:** "customize a devotion the way you,
  your family, or your parish pray it". The first attempt named only family/parish, which
  left the following list ("your prayers, in your order, with your intentions") pulling
  the other way; naming all three resolves it.

## Tests
_Static copy change — no logic, no data shape, no `STORAGE_KEY` bump._
- **Unit** (Vitest): N/A — no `src/lib/**` code touched.
- **Integration** (Testing Library): N/A — presentational copy only.
- **E2E** (Playwright): N/A — copy only; verified by reading the rendered pages.
