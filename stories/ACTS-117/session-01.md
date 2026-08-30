---
story: ACTS-117
session: 01
wrapped_at: 2026-08-29T21:32:33-0700
status: In Progress
final: false
---

## What happened
Opening handoff — this is the **starting context** for the v8 rebase; the next chat
begins here (`/continue ACTS-117`).

Prior arc this session (context for the rebase):
- Reconciled the PRD to reality and shipped the global **`/prd-sync`** skill; canonical
  PRD moved in-repo to `docs/ACTS-PRD.md` (v2), restructured to a two-part flow
  (Mission → Part 1 Business → Solution-Idea/ACTS → Part 2 Technical → §6+). *(ACTS-104)*
- JC then supplied the **real v8** PRD (`~/Downloads/ACTS_Final_Build_Ready_PRD_v8.docx.md`)
  — the doc I'd built on was an **old base**. Ran a **v8 ↔ code gap review** →
  [`docs/V8-CODE-GAP.md`](../../docs/V8-CODE-GAP.md) (table + 3 buckets + **JC's decisions**).
- Filed **ACTS-108…116** from JC's worksheet comments (Open Prayer, Pray-with-the-Pope-on-Home,
  Nested Templates→ACTS-107, Intention split, Prayer Forms/origin, Insights+Wisdom, Audio,
  HowTo versioning, status dashboard/brief).

### The rebase task (what this story does)
Make **v8 the content base** of `docs/ACTS-PRD.md`, then re-apply and reconcile:
1. Re-apply the structural work: **Mission (draft)**, two-part **Business/Technical** flow,
   **Solution-Idea/ACTS** framing (incl. the personal "Where this came from" story),
   the **`[Shipped]/[Partial]/[Future]` "What's shipped today"** inventory, and shipped-notes.
2. Apply the **reconcile decisions** in `V8-CODE-GAP.md`:
   - **Every built feature must have a real PRD section — especially where it augments/replaces a v8 section** (JC's rule).
   - **Vessels** = the product label (Faith Learning / Life Library = the description).
   - **Resource Directory = complete via Vessels** — match code.
   - **Session Purpose (§9A):** describe the free-text name that exists (`SessionPlan.purpose`); structured Purpose picker = optional/future.
   - **Pray with the Pope IS seeded** (`tpl-pray-with-pope`) — correct the old "dropped" note.
3. **Add the shipped-but-absent-from-v8 sections:** Share/Follow-along, Lectio Divina,
   Bible settings, selectable Mystery bodies, Song.
4. **Branding:** Faith Journey = umbrella *placeholder*, ACTS = app name; umbrella TBD (Via Devota…).
5. **Convention:** single canonical `.md` — **bump the in-doc stamp to v3**, NO `-vN.md` copies
   (prior versions via git). Then **export a fresh versioned `.docx`** (`ACTS-PRD-v3.docx`) for the Google copy.

## Verified (and how)
- Gap table verified against code: read `src/lib/prayer/types.ts` (item kinds, ReflectionMode,
  AppSettings), `taxonomy.ts`, `seed.ts` (USCCB, `tpl-pray-with-pope`), routes, backlog — see
  `V8-CODE-GAP.md`. Corrected the Pope row after finding `popeItems`/`tpl-pray-with-pope` in seed.
- No app code changed this session (docs + tracker only). No tests to run.

## Git state at handoff
- Session code/docs committed earlier: `4dc9f0b`, `5609837`, `11d40ec`, `d70cd3a`, `e8d9e89`.
- Handoff docs (this file + ACTS-117 pointer + counter + backlog/board rows) committed here.
- **Push has been failing on auth all session** (`could not read Username`) — **JC pushes from their client.** Confirm `origin/main` is caught up at session start.
- Memory (outside repo): added `docs-versioning-convention` + updated `prd-sync-workflow`; `/prd-sync` skill updated with the single-`.md` rule.

## Next
`/continue ACTS-117` → do the rebase per the task above. Inputs: v8 md (in `~/Downloads/`),
`docs/ACTS-PRD.md` (v2, to become v3), `docs/V8-CODE-GAP.md` (checklist + decisions).
Start by diffing v8's section list against the current doc; bring v8 in as the base, then
layer the structure + inventory + shipped-notes back on.
