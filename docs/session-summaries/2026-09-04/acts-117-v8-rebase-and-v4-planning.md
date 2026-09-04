# Session — ACTS-117 v8 rebase → PRD v3, then v4 planning

_Wrapped 2026-09-04. Stories touched: **ACTS-117** (Done), **ACTS-118** (filed), **ACTS-147**
(filed). Spans two sittings (2026-08-29 the rebase; 2026-09-04 the seam-sharpen + v4 story)._

## What happened (in order)

1. **ACTS-117 — rebased the canonical PRD onto v8 → v3.** The prior `docs/ACTS-PRD.md`
   (v2) had been built on an **old, thinner base**; brought **PRD v8** in as the content
   base and restored every section v2 was missing (§1A, §9A, §10A, the full §12 seed
   subsections, §23A/B, §25A–E, §31A/B/C, the **Wisdom** section, the clean **50-item DoD**,
   the 12-step compiler). Re-applied the ACTS structural work (front matter, Mission draft,
   two-part **Business/Technical** split, **Solution-Idea** narrowing, **What's-shipped**
   inventory, per-section **Shipped notes**, §35 Share). Folded in every `V8-CODE-GAP.md`
   reconcile decision (Vessels = label; Resource Directory via Vessels; Session Purpose =
   free-text name today; **Pope IS seeded** — corrected the "dropped" note) and threaded
   backlog IDs. Bumped the in-doc stamp to **v3**; exported `docs/ACTS-PRD-v3.docx`.
   `/save` + `/done`.
2. **Filed ACTS-118** — decision story: does **Vessels** need v8's §25D Resource fields
   (`app_store_url`, `access_model`, `best_for`…) + external-app seeds, or is the current
   model enough? (Surfaced by the 117 reconcile; P4, To Do.)
3. **Sharpened the v3 vision/problem seam** (JC: "the vision is larger than the current
   problem solving"). Three edits: a **bridge sentence** at the top of the Solution-Idea
   block (vision = horizon; ACTS attacks the customized-prayer slice first), a **§1A tense
   hedge** (Insights/Wisdom are the horizon, not built), and a **one-line wedge scope**
   leading "The problem I'm solving." Re-exported `ACTS-PRD-v3.docx`.
4. **Decided v4 timing** — hold `/prd-sync` for v4 until **(1)** the tree is clean and
   **(2)** the **Oravia rebrand (ACTS-144)** is locked, so v4 carries the settled name.
5. **Filed ACTS-147** — the **v3 → v4 resync** story (post-rebrand), gated `depends_on:
   ACTS-144`. Moved the shipped **About-page copy** (JC: "sums up this MVP") + the full v4
   worklist into 147 as the vision/problem anchor; **ACTS-117 (v3) stays the anchor/base**
   and now just cross-references 147.

**Non-story / ops:** this folder is **shared with another active chat** — during the
session `main` advanced under us from `ba18ff0` → the ACTS-138–141 Lectio arc → the Oravia
rebrand commit (`939cfae`) → About-page work (`e29cf9c`, `346831f`). Verified my commits
stayed a clean linear lineage on top; staged **per-path** throughout so none of the other
chat's in-flight work was ever absorbed. `.env` has a pre-existing 3-line local change —
**left untouched** (tracked; likely local config/secrets).

## Verified (and how)
- v3 structure: section headings enumerated in order (1 → 1A → … → 35); **DoD = exactly
  1–50**; compiler 1–12; stamp reads **v3**. Both docx exports validated (unzipped, content
  probes for the new seam edits + key sections all present). No pandoc/LibreOffice on the
  box → docx built via a Node `docx` (docx-js) converter.
- Docs-only across the session — no app code touched, no tests to run.
- Final git state confirmed: `origin/main` == local at **`e0c43d5`**, no drift.

## Git state at handoff
- **All committed and PUSHED.** origin/main = `e0c43d5`. This session's commits:
  `4250a1d` `872872c` `416a9a6` (ACTS-117 rebase/close) · `ec134b8` (ACTS-118) ·
  `fe132e9` `a97caf8` (v3 seam + v4 note) · `e0c43d5` (ACTS-147). Push repeatedly failed on
  env auth (`could not read Username`) — **JC pushed from their client each time.**
- `.env` remains locally modified (pre-existing, untouched).

## Parked / next
- **ACTS-147 (To Do, gated):** the v3 → v4 PRD resync — start **after ACTS-144 (Oravia
  rebrand) is locked** and the tree is clean. Run `/prd-sync`, refresh the shipped inventory
  (Lectio/Reflection arc 138–142, About 143, Home Vessels 145), apply Oravia doc-wide, fold
  in the About copy, export `Oravia-PRD-v4.docx`.
- **ACTS-118 (To Do, P4):** JC to decide the Vessels resource-fields question (§25D).
- Ordering: **ACTS-144 → ACTS-147.**

## Next session — opener (paste to start)
> Faith Journey / ACTS (Oravia) — PRD is at **v3** (`docs/ACTS-PRD.md`, rebased onto v8 in
> ACTS-117, Done + pushed). Next PRD work is **ACTS-147** — resync **v3 → v4**, but it's
> **gated on the Oravia rebrand ACTS-144 being locked** + a clean tree. If the rebrand is
> done: `/start ACTS-147` and run `/prd-sync` (refresh shipped inventory 138–145, apply
> Oravia doc-wide, fold in the About copy already parked in the ACTS-147 pointer, export
> `Oravia-PRD-v4.docx`). If the rebrand isn't done yet, work **ACTS-144** first. Also open:
> **ACTS-118** (P4) — JC to decide whether Vessels needs v8's §25D Resource fields.
> ⚠️ This repo folder is shared with other chats and env git push fails on auth — commit
> per-path, and JC pushes from their client.
