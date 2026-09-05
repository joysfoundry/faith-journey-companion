---
id: ACTS-163
title: Guided tour — numbered hotspots that explain the screen
spine:
status: To Do
origin: human-typed
approved_by: JC
depends_on: []
relates_to: [ACTS-153, ACTS-160, ACTS-162]
started_at: 2026-09-05T13:15:11-0700
updated:    2026-09-05T13:15:11-0700
latest_handoff: null
sessions: 0
---

## Goal
As a first-time tester looking at a screen of unfamiliar icons, I want to tap one and be
told what it does, so that I can find my way around without being walked through a tour I
didn't ask for and can't skip.

## Shape
An overlay the person turns **on**, not a modal that fires at them. While it is on, each
explainable control wears a small numbered dot; tapping a dot opens a short description
anchored to that control. Tapping anywhere else, or the same dot again, closes it. One
"Done" control turns the whole overlay off.

Why this over a step-by-step carousel: the numbered-dot form lets someone read only the
two things they were actually confused about and leave. A carousel makes them sit through
nine. The ask ("icons or number... they can get a description about it") is already the
better design — this story just builds it.

**Mechanics**
- Targets opt in with `data-tour="<id>"` on the real element. The overlay measures live
  elements, so a control that moves or is renamed cannot drift out of sync with its
  description the way a screenshot would.
- Copy lives in one data file (`src/lib/tour/steps.ts`): `{ id, n, title, body }` per
  target, ordered by `n`. Adding a hotspot = adding one attribute and one entry.
- Numbering is per screen, starting at 1 — the dots explain *this* view, they are not a
  global sequence.
- Entry points: a menu item ("How it works") and a one-time offer right after onboarding,
  stamped like ACTS-153 (`settings.tour_seen_at`) so it is offered once and never nags.
- Start with **Today**, the screen everyone lands on. Other screens reuse the same
  overlay by declaring their own targets — do not build a second mechanism for them.

⚠️ **The ACTS-153 gotcha applies here.** When consecutive steps render the same component
shape, React reuses the instance and state leaks between them. Key each popover by step
id.

Accessibility is not optional on this one: dots must be real buttons, reachable by
keyboard and labelled, and the overlay must respect `prefers-reduced-motion`.

## "Can Claude create a video tutorial?"
Partly — and the honest answer changes the recommendation.

- **Narrated screen-recorded video: no.** There is no screen-capture or voice tool here.
- **A silent animated GIF walkthrough: yes.** The app can be driven in the in-app browser
  and recorded to a GIF — real UI, real interactions, no narration.
- **An MP4 from a scripted screenshot sequence: possible, with a caveat.** Screenshots can
  be scripted at each step and stitched into a video, but `ffmpeg` is **not installed on
  this machine** and would have to be added first.

**Recommendation: build the overlay, and treat a short GIF as a possible follow-on for
one or two flows.** Not because video is hard, but because of what it costs afterwards: a
recording is a photograph of a moment in the UI, and this UI is changing weekly — every
rename, every moved button silently makes it wrong, and nothing fails to tell you. The
overlay points at whatever the element *is* today. A GIF is also a heavy download for
someone opening a prayer app on cellular, and it cannot be read in a quiet room without
sound or in a screen reader.

Where a GIF genuinely wins is *outside* the app — showing someone what Oravia is before
they have it. That belongs on the invitation page (`public/invite.html`, ACTS-160), and
it is a different piece of work than teaching the screen someone is already looking at.

## Acceptance criteria
- [ ] The tour is off by default and never opens without being asked for — except the
      single post-onboarding offer, which can be declined and does not return.
- [ ] With it on, every primary control on Today carries a numbered dot.
- [ ] Tapping a dot shows a description anchored to its control; tapping elsewhere or the
      dot again dismisses it.
- [ ] The app underneath stays usable — this is an overlay, not a lightbox that blocks
      the screen.
- [ ] Reachable any time from the menu.
- [ ] Dots are keyboard-reachable and screen-reader labelled; motion respects
      `prefers-reduced-motion`.
- [ ] A target that is absent or hidden on a given render is skipped silently — no
      orphan dot floating at 0,0.
- [ ] Adding a hotspot needs exactly two edits: the `data-tour` attribute and the entry.
- [ ] Verified at 375×812 (phone) as well as desktop — dot placement is the thing most
      likely to break between the two.

## Tests
- **Unit** (Vitest — pure `src/lib/**`): step-list integrity — ids unique, `n` contiguous
  from 1 per screen, every entry has non-empty title and body.
- **Integration** (Testing Library — component + store): overlay off by default; turning
  it on renders one dot per present target; clicking a dot opens that description and
  only that one; a missing target renders no dot; the post-onboarding offer sets the
  stamp and does not reappear.
- **E2E** (Playwright — see the plan): new flow — open menu → How it works → tap dot 1 →
  read → dismiss → Done. Add to `docs/E2E-TEST-PLAN.md`; planned until ACTS-92.
