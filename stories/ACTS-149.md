---
id: ACTS-149
title: ACTS guided prayer framework — open-prayer mode + info button (Adoration·Contrition·Thanksgiving·Supplication)
spine: ACTS-108
status: To Do
origin: human-directed
approved_by: JC
depends_on: []
relates_to: [ACTS-144, ACTS-108, ACTS-86, ACTS-102]
started_at: 2026-09-04T11:24:18-0700
updated:    2026-09-04T11:24:18-0700
latest_handoff: null
sessions: 0
---

## Goal
As someone praying, I want an **ACTS-structured prayer** — the four movements Adoration ·
Contrition · Thanksgiving · Supplication — offered inside the app, so the ACTS framework JC
loves is honored as a **prayer teaching aid and guided experience**, not as the app's name.

This is the follow-on from the **ACTS-144** rebrand decision: the name becomes **Oravia**, and
the **ACTS acronym is preserved here**, where it's actually true — structuring a prayer session.
JC's steer: **build it on the open-prayer framework** (see ACTS-108, the free-form "from the
heart" prayer kind), so ACTS becomes a *feature you offer*, arguably more prominent and useful
than it ever was as a wordmark.

## Shape (two parts, either can land first)
**A. Info button (light).** A small "?" / info affordance on prayer surfaces that unfolds the
four movements with a one-line gloss each (Adoration — praise God for who He is; Contrition —
sorrow for sin; Thanksgiving — gratitude for His gifts; Supplication — asking for needs, ours
and others'). Teaches the framework in context. Low effort, no model change.

**B. ACTS open-prayer mode (richer).** A guided prayer that walks the four movements as phases,
each an open/free-form prompt (write, speak, or sit) — riding the **`open_prayer`** kind from
**ACTS-108**. Likely an **ACTS prayer template** (four sequenced open-prayer steps with the
movement as the heading + gloss). Reuses reflection/open-prayer capture; no bespoke engine.

## Open questions (flag before building)
- Does B depend on ACTS-108 landing first, or do we seed a minimal 4-step template now?
- Where does the info button live — Home prayer entry, the open-prayer composer, the ACTS
  template's own intro card, or all?
- Any capture — is an ACTS session saved like a Lectio sitting / reflection, or ephemeral?
- Copy for each movement's gloss (public-domain / original wording).

## Acceptance criteria
- [ ] The ACTS four movements are explained in-app via an info affordance (part A).
- [ ] (If part B) An ACTS-structured guided prayer exists — four movements as sequenced
      open-prayer steps — reachable from a prayer surface; browser-verified.
- [ ] ACTS appears only as a **prayer framework**, never as the product name (aligns ACTS-144).
- [ ] `STORAGE_KEY` bumped only if a seed/template is added (note the version if so).

## Tests
_Planned — no runner wired yet (harness = ACTS-92); see
[`docs/E2E-TEST-PLAN.md`](../docs/E2E-TEST-PLAN.md). Convention ACTS-91._
- **Unit** (Vitest): if a template is seeded, assert it compiles to four movement steps in order.
- **Integration** (Testing Library): info affordance renders the four movements; ACTS template
  starts a session with the four phases.
- **E2E** (Playwright): start an ACTS prayer, walk the four movements, capture (if modeled).
