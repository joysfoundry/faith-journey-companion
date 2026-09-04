---
id: ACTS-117
title: Rebase ACTS-PRD onto v8 + apply the gap-review reconcile checklist
spine: ACTS-117
status: Done
origin: human-directed
approved_by: JC
depends_on: []
relates_to: [ACTS-104, ACTS-108, ACTS-109, ACTS-110, ACTS-115]
started_at: 2026-08-29T21:32:33-0700
updated:    2026-08-29T21:58:47-0700
completed_at: 2026-08-29T21:58:47-0700
latest_handoff: stories/ACTS-117/session-02.md
sessions: 2
---

## Goal
As the product owner, I want the canonical PRD (`docs/ACTS-PRD.md`) **rebased onto
PRD v8** (the correct, fuller base) with my structural work re-applied and the code
reality reflected, so there is one trustworthy PRD that matches both v8 and the app.

## Context
The current `docs/ACTS-PRD.md` (v2) was built on an **old** PRD base. JC supplied the
real **v8** (`~/Downloads/ACTS_Final_Build_Ready_PRD_v8.docx.md`). The reconcile
checklist + JC's decisions live in [`docs/V8-CODE-GAP.md`](../docs/V8-CODE-GAP.md).

## Acceptance criteria
- [x] v8 becomes the content base of `docs/ACTS-PRD.md` (single canonical `.md` — no `-vN.md` copies; git history holds prior; bump the in-doc stamp to v3)
- [x] Re-apply the structural work: Mission (draft) · two-part Business/Technical flow · Solution-Idea/ACTS framing · the `[Shipped]/[Partial]/[Future]` "What's shipped today" inventory · shipped-notes
- [x] Apply the reconcile notes from V8-CODE-GAP.md: **built features each get a PRD section (esp. where they augment/replace a v8 section)**; Vessels = label (Faith Learning/Life Library = description); Resource Directory = complete via Vessels; Session Purpose described as the name field that exists; Pope is seeded
- [x] Add the shipped-but-absent-from-v8 sections: Share/Follow-along, Lectio Divina, Bible settings, selectable Mystery bodies, Song
- [x] Branding stays: Faith Journey = umbrella placeholder, ACTS = app name (umbrella TBD)
- [x] Export a fresh versioned `.docx` for the Google copy (`docs/ACTS-PRD-v3.docx`)

## Open (deferred to JC, non-blocking)
- Resource model (§25D): does Vessels need v8's resource fields (`app_store_url`, `access_model`, `best_for`) + external-app seeds (Hallow, Laudate…), or is the current Vessels model enough?

## v4 PRD sync — deferred (the next continuation of this doc)
**Hold until BOTH:** (1) the working tree is clean — another chat's in-flight work
(ACTS-138…146, incl. `.counter`/`README.md`/`JIRA-BACKLOG.md`) is committed + pushed, and
my `fe132e9` is pushed; (2) the **Oravia rebrand** (ACTS-144 — ACTS → Oravia + Marian
palette) is **locked**, so v4 can carry the settled product name doc-wide.

When both hold, run `/prd-sync` for **v4** and reconcile v3 against everything shipped
since the v8 rebase: the **Reflection↔Lectio arc** (ACTS-138 Write/Journal tabs · ACTS-140
journal grouped by sitting · ACTS-141 empty-session reaping · ACTS-142 themes filed),
**About page** (ACTS-143), **Home Vessels status + link** (ACTS-145); apply the **Oravia
rebrand** throughout; re-export the `.docx`. Promote this to its own story via `/start`
once the tree is clean (filing now would collide with the other chat's dirty `.counter`).

### Reference — the shipped About page (JC: "this sort of sums up this MVP")
Anchor the v4 vision/problem framing to this copy. Verbatim:

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

*Note: the About copy still says "ACTS" — under the Oravia rebrand (ACTS-144) the name
carries into both the About page and the v4 PRD. Reconcile the name when the rebrand locks.*

## Tests
- N/A — documentation. Verify by cross-checking every v8 §, the code, and the gap table.
