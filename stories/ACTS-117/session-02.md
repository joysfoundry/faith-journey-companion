---
story: ACTS-117
session: 02
wrapped_at: 2026-08-29T21:58:47-0700
status: Done
final: true
---

## What happened
Did the **v8 rebase** of the canonical PRD, end to end. `docs/ACTS-PRD.md` is now **v3**,
rebased onto the fuller **PRD v8** base (the v2 doc had been built on an old, thinner
base), with all the ACTS structural work re-applied and every `V8-CODE-GAP.md` decision
folded in. **All acceptance criteria met.**

### What the rebase moved
- **Brought v8 in as the content base** — restored every section v2 was missing:
  §1A, §9A, §10A, the full §12 seed subsections (Multiple Sources, Imported-editable,
  USCCB Rosary How-To, Scriptural Rosary), §23A/§23B, §25A–E, §31A/B/C, the **Wisdom**
  section/row (§4, §32), the clean **50-item Definition of Done** (v2 had a broken 13–39),
  and the 12-step compiler numbering.
- **Re-applied the structure:** front matter (Faith Journey umbrella / ACTS product,
  umbrella TBD), Mission draft, two-part **Business/Technical** split, the **Solution-Idea**
  narrowing (incl. "Where this came from"), the **What's-shipped** [Shipped]/[Partial]/[Future]
  inventory, per-section **Shipped notes**, and §35 Share/Follow-along.
- **Reconcile decisions folded in** as Shipped notes: Vessels = the label (Faith
  Learning/Life Library = description, §27); Resource Directory = complete via Vessels
  (§25D); Session Purpose = the free-text name that exists today (§9A/§31B); **Pray with
  the Pope IS seeded** (`tpl-pray-with-pope`) — corrected the "dropped" note (§25E); the
  shipped-but-absent-from-v8 features (Share, Lectio, Bible settings, selectable Mystery
  bodies, Song, External Link, Open Dialogue, USCCB/Scriptural-Rosary seeds) all now
  carry real content. Backlog IDs (ACTS-108…116) threaded through.
- **Exported `docs/ACTS-PRD-v3.docx`** for the Google copy (single canonical `.md` per
  convention; prior versions live in git).

## Verified (and how)
- Section headings enumerated in order: 1 → 1A → 2–9 → 9A → 10 → 10A → 11–23 → 23A/B →
  24–25 → 25A–E → 26–31 → 31A/B/C → 32–35. DoD confirmed **exactly 1–50**; compiler **1–12**;
  stamp reads **v3**.
- docx export validated structurally: unzipped OK, `word/document.xml` present, content
  probes ("MVP Definition of Done", "Pray with the Pope", "Faith Learning / Life Library",
  "Dialogue / Salutation components", "rebased onto") all found. Could **not** render to
  PDF (no pandoc / LibreOffice on this box; Python 3.9 too old for the skill's soffice
  helper) — export built via a Node `docx` (docx-js) converter instead.
- Docs-only change; no app code touched, no tests to run.

## Git state at handoff
- Committed: `4250a1d` (PRD v3 md + docx) · `872872c` (pointer criteria) — plus the
  handoff/pointer/board commit made at close.
- **Push FAILED on auth again** (`could not read Username`) — **JC pushes from their
  client.** Confirm `origin/main` catches up at next session start.
- No pending tracker syncs (local-only project, `tracker: none`).

## Next
Story is **Done**. No follow-up required to close it. One thing left **for JC to decide**
(non-blocking, noted in §25D + the pointer): does Vessels need v8's resource fields
(`app_store_url`, `access_model`, `best_for`) + external-app seeds (Hallow, Laudate…),
or is the current Vessels model enough? If yes, that's a new story.
