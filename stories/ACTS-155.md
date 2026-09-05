---
id: ACTS-155
title: Repair the stale verify-merge.ts harness script (dead Learn API)
spine:
status: Done
origin: human-directed
approved_by: JC
depends_on: []
relates_to: [ACTS-92, ACTS-91, ACTS-154]
started_at: 2026-09-04T20:53:17-0700
updated:    2026-09-04T21:14:40-0700
latest_handoff: ACTS-155/session-01.md
sessions: 1
---

## Goal
As whoever runs the harness before a commit, I want `scripts/verify-merge.ts` to actually
run, so that the two `tsx` scripts we have are a usable regression check instead of one
healthy script and one that dies on import.

## The problem (found 2026-09-04, verifying ACTS-154)
`npx tsx scripts/verify-merge.ts` crashes immediately:

    TypeError: mutations.addLearningItem is not a function
        at scripts/verify-merge.ts:76:15

The script's **Journey layer** block (lines 65–97) still calls the pre-unification Learn
API. When Learn / Programs / Resources were folded into the single `KnowledgeItem` entity
(category discriminator — see [`knowledge.ts`](../src/lib/prayer/knowledge.ts) and
[`store.ts`](../src/lib/prayer/store.ts)), the script was never updated. Nothing else in
the repo calls the old names: `learning_items` and `content_type` survive **only** as
legacy-migration fallbacks inside `store.ts` (`normalizeDatabase`, `normalizeContent`),
so this script is the last real caller of a dead API.

Pre-existing and unrelated to ACTS-154 — confirmed by stashing `src/` and re-running
against HEAD, where it fails identically. The sibling `verify-liturgical.ts` is healthy
(19 passed, 0 failed).

## Not ACTS-92
**ACTS-92** is *installing* a real runner (Vitest + Testing Library + Playwright) and is
deliberately deferred. This is a repair of the harness we already have, and must stay
runnable with plain `npx tsx` — no runner dependency, so it does not block on ACTS-92.

## Decided
- **Preserve the assertions, don't rewrite them.** The block's intent is that the store
  reducers persist the journey layer — a reflection (with its link), a knowledge item plus
  a status transition, and a Mass. Port the API calls; leave what is being checked alone.
- Leave the script's `ok` / PASS condition (line 101) as-is. It covers the Pope-link and
  Hail-Mary counts only, and the journey block has always been printed rather than
  asserted; widening it is a separate change.

## API mapping
| Old (dead) | Current |
| --- | --- |
| `mutations.addLearningItem(db, item)` | `mutations.addKnowledgeItem(db, item)` |
| `mutations.setLearningStatus(db, id, s)` | `mutations.setKnowledgeStatus(db, id, s)` |
| `db.learning_items` | `db.knowledge_items` |
| item field `content_type` | `category` (`KnowledgeCategory`) |

## Acceptance criteria
- [x] `npx tsx scripts/verify-merge.ts` runs to completion and prints `PASS`.
- [x] The Journey-layer line reports real values: seeded knowledge count, the added
      fixture present, and its status `finished` after the transition.
- [x] No remaining reference to `addLearningItem`, `setLearningStatus`,
      `learning_items`, or `content_type` in `scripts/`.
- [x] The other five checks (Rosary, Pope, Chaplet, Scriptural Rosary, fixed mystery set,
      54-day novena) are untouched and still report the same numbers as before.
- [x] Runs under plain `npx tsx` — no new dependency, no `package.json` script needed.
- [x] `tsc --noEmit` clean. **eslint: no new errors** — the file carries 9 pre-existing
      prettier errors, all outside the touched block and identical on HEAD; repo-wide
      `eslint .` already reports 317 pre-existing problems, so a clean repo lint is a
      separate concern, not this story's bar.

## Root cause — and the fix that stops the recurrence
`tsconfig.json` `include` covered only `src/**`, `vite.config.ts` and `eslint.config.js`.
**`scripts/` was never type-checked**, which is exactly why the rename rotted silently:
`tsc --noEmit` passed all along while `mutations.addLearningItem` had not existed for
months. Added `"scripts/**/*.ts"` to `include`, so this class of drift now fails the
typecheck instead of waiting to be discovered at runtime.

That surfaced one genuine latent hole under `noUncheckedIndexedAccess` —
`j.reflections[0].links[0]?.target_type` guarded the *link* but not the *reflection*; now
`j.reflections[0]?.links[0]?.target_type`. `verify-liturgical.ts` type-checked clean with
no changes. `vite build` is unaffected (it runs Vite, not `tsc`).

⚠️ This tsconfig change is **beyond the literal ask** (port the script) — recorded here
because it is the actual reason the script was allowed to rot.

## Verification
- Baseline captured by running a copy of the script with the crashing block removed, so
  the six pre-existing checks could be compared before/after. `diff` shows the **only**
  change is the added Journey-layer line — the other six are byte-identical.
- `npx tsx scripts/verify-merge.ts` → **PASS**, journey line
  `reflections=1 (link prayer_session), knowledge=5 (seeded 4, know-x=finished), mass=1`.
- `npx tsx scripts/verify-liturgical.ts` → 19 passed, 0 failed.
- `npx tsc --noEmit` clean (now including `scripts/`); `npm run build` clean.

## Notes
Tooling only — no app code, no model change, **no `STORAGE_KEY` bump**.

## Tests
- **Unit** (Vitest): N/A — this *is* harness code; it has no separate coverage of its own,
  and the runner that would host it is ACTS-92.
- **Integration** (Testing Library): N/A — same reason.
- **E2E** (Playwright): N/A — no user-facing surface.
- **Self-check:** the script's own run is the test. Both harness scripts must pass:
  `npx tsx scripts/verify-liturgical.ts` (19/19) and `npx tsx scripts/verify-merge.ts`.
