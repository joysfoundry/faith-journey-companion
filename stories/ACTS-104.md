---
id: ACTS-104
title: Vision PRD v2 — reconcile doc with reality + /prd-sync skill
spine: ACTS-104
status: Done
origin: human-directed
approved_by: JC
depends_on: []
relates_to: [ACTS-101, ACTS-102, ACTS-105]
started_at: 2026-08-29T18:33:38-0700
updated:    2026-08-29T18:33:38-0700
latest_handoff: null
sessions: 0
---

## Goal
As the product owner, I want the PRD/vision doc reconciled with what has actually
shipped — and a repeatable way to do it — so the doc stays trustworthy at each
resting point instead of silently drifting from the code.

## What shipped
- **`docs/ACTS-PRD.md` (v2)** — canonical, in-repo home for the combined
  **business + technical** PRD (was `~/Downloads/ACTS.md`). Non-destructive
  reconcile of the original "Faith Journey" PRD:
  - Reframed naming: **Faith Journey = umbrella vision**, **ACTS = prayer-first
    product shipping now** (ACTS = Adoration/Contrition/Thanksgiving/Supplication).
  - Added front matter that was missing: **What ACTS is · The problem · The
    solution (prayer as the wedge) · Where this came from · Market position**.
  - Added a **"What's shipped today"** inventory with `[Shipped]/[Partial]/[Future]`
    tags mapped to sections — the bridge between the business claims and technical
    reality.
  - Updated taxonomy (Song, Litany, Lectio) + shipped-notes in §22/§26/§27/§28.
  - New **§35 Share & Follow-Along** (group/guest prayer) — had no home in the doc.
  - Stamped `v2` + `last synced: 2026-08-29 · 6d5a13f`.
- **`docs/.prd-sync`** — pointer so the skill auto-finds the doc next time.
- **`~/.claude/skills/prd-sync/SKILL.md`** — new **global** skill (invokable
  `/prd-sync` in any repo) encoding the reconcile recipe. Lives outside the repo
  (user-global), so it is NOT tracked here by design.
- **`ACTS-PRD-v2.docx`** — generated for JC's Google copy (docx-js converter;
  JC places the Google copy manually, per decision).

## Acceptance criteria
- [x] PRD lives with the docs (in-repo) and is reconciled to shipped reality
- [x] Business + technical layers both represented; vision prose preserved (nothing deleted)
- [x] Repeatable process exists as an invokable skill (`/prd-sync`), global
- [x] `.docx` produced for the Google copy

## Tests
_Docs + external (user-global) skill; no app/`src` code changed._
- **Unit** (Vitest): N/A — no `src/lib/**` change.
- **Integration** (Testing Library): N/A — no component/store change.
- **E2E** (Playwright): N/A — documentation + tooling only.
- Skill verified by inaugural manual run on this doc; docx validated (structure +
  content: 35×H1 / 41×H2, no leaked markdown).

## Next
See **ACTS-105** — evolve `/prd-sync` toward a broader "canon / doc sync" (a
vision change cascades to related docs) and apply it to the **CRV** repo.
