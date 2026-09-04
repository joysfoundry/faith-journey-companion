---
id: ACTS-147
title: Resync PRD v3 → v4 (post-Oravia-rebrand) + fold in the About-page framing
spine: ACTS-147
status: To Do
origin: human-directed
approved_by: JC
depends_on: [ACTS-144]
relates_to: [ACTS-117, ACTS-104, ACTS-105, ACTS-143]
started_at: 2026-09-04T10:20:27-0700
updated:    2026-09-04T10:20:27-0700
latest_handoff: null
sessions: 0
---

## Goal
As the product owner, I want the canonical PRD (`docs/ACTS-PRD.md`) resynced from **v3 → v4**
once the **Oravia rebrand is complete**, folding in everything shipped since the v8 rebase
plus the About-page framing, so there is one current PRD that matches the rebranded app.

## Context / anchor
- **Anchor / base = v3**, the output of **ACTS-117** (the v8 rebase). Do not re-derive; v3 is
  the starting point for this resync.
- Since v3, `main` shipped: the **Reflection↔Lectio arc** (ACTS-138 Write/Journal tabs ·
  ACTS-140 journal grouped by sitting · ACTS-141 empty-session reaping · ACTS-142 themes
  filed), the **About page** (ACTS-143), **Home Vessels status + link** (ACTS-145).
- The **Oravia rebrand (ACTS-144, epic)** renames ACTS → Oravia + a Marian palette. v4 must
  carry the settled product name **doc-wide**, so this story is **gated on ACTS-144 being
  locked** (`depends_on: ACTS-144`). Until then, hold.
- Tool: the global `/prd-sync` skill (see [[prd-sync-workflow]]). Single canonical `.md`,
  prior versions via git (see [[docs-versioning-convention]]).

## Acceptance criteria
- [ ] **Gate:** run only after ACTS-144 (rebrand) is locked and the working tree is clean.
- [ ] Run `/prd-sync` against v3 → bump the in-doc stamp to **v4** (single canonical `.md`,
      no `-vN.md` copies).
- [ ] Refresh the **"What's shipped today"** inventory: Reflection↔Lectio arc (138–142),
      About page (143), Home Vessels status + link (145); update stale shipped-notes (esp. §28).
- [ ] Apply the **Oravia rebrand** throughout (product name + any palette/design references).
- [ ] Fold in the **About-page framing** (copy below) as the vision/problem anchor, with the
      product name reconciled to **Oravia**.
- [ ] Resolve or carry forward the **ACTS-117 §25D open question** (does Vessels need v8's
      Resource fields + external-app seeds?).
- [ ] Export a fresh versioned `.docx` (`Oravia-PRD-v4.docx`) for the Google copy.

## Reference — the shipped About page (JC: "this sort of sums up this MVP")
Anchor v4's vision/problem framing to this copy. **Note:** it still says "ACTS" — under the
Oravia rebrand (ACTS-144) the name carries into both the About page and v4; reconcile it
when the rebrand locks. Verbatim as shipped:

> **About — What this is, and why it's here**
>
> *A daily place where prayer, Scripture, learning, reflection, and lived experience become part of a meaningful record of how I am trying to live my faith, discern God's will, and live my purpose.*
>
> **The vision** — ACTS is a personal faith companion for the whole of your faith journey — helping you bring prayer, Scripture, learning, reflection, and lived experience into the rhythms and needs of everyday life. The heart of it is a question: How am I becoming the person God is calling me to be, and how am I living my purpose in alignment with God's will? It's meant to help you deepen your relationship with God — drawing on Scripture and the tradition of the Church — in a way that feels deeply personal and honors how you were formed. It may support discernment, but it never claims to know God's will for you; you discern the meaning.
>
> **More than a prayer app** — A person's faith journey is shaped not only by prayer, but by what they read, watch, hear, experience, question, and reflect on. ACTS captures that faith learning alongside prayer and lived experience so that, over time, you can make connections — turning what you encounter into reflection, and eventually recognizing insights and carrying forward wisdom that can support discernment and action.
>
> **One place for your journey** — Today the pieces of a faith life live in a dozen scattered places, on paper and across apps — a Rosary pamphlet, a hymnal, a Bible, a saint-of-the-day site, a family novena someone texted you. ACTS gathers them into one companion, compiling a devotion into a guided flow — the right day, the right mysteries and readings, reflection as a first-class step, a way to sing, and a follow link so others can pray along — so the tool disappears and the prayer stays.
>
> It's a hub, not a walled garden. Link out to how you already pray — Hallow, Bible in a Year, a catechism program — keep your journaling right alongside your prayer, and gather the resources that inspire you and shape your learning, whether they're digital or on paper.
>
> **Why a beta** — This is an early, private beta. It's still taking shape — things will change, and some may break. Your feedback is what shapes it. Thank you for praying with it while it grows.
>
> **Everything stays with you** — Your prayers, reflections, and settings live on this device, in this browser — there's no account, no email, and nothing is sent to a server. That also means they don't sync across devices yet, and clearing your browser data (or Settings → Start over) will erase them.

## Tests
- N/A — documentation. Verify by cross-checking shipped features (138–145), the code, and
  the completed rebrand, then confirm the exported `.docx` matches.
