---
story: ACTS-110
session: 01
wrapped_at: 2026-08-29T22:50:59-0700
status: In Progress
final: false
---

## What happened
Built the **Template Block / nested-template** capability (the "nested devotion" infra), the
first consumer of which is the Litany for the Faithful Departed composite (ACTS-107).

- **types.ts** — added `template_block` to `TemplateItemKind`; `TemplateItem.block_template_id`
  (target `PrayerTemplate.id`); `SessionItem.source_template_id` (lineage).
- **compiler.ts** — refactored `generatePrayerSession`: extracted per-template expansion into a
  recursive `expandTemplate(state, template, depth)`. Each template resolves its **own** mystery
  config (`resolveMysteryConfig`) — so a nested rosary block picks its own set and counts its own
  decades. `CompileState` threads items/position/sessionId + a `stack` of template ids on the
  current path. `template_block` handling: skip if missing / **circular** (id already in stack) /
  past `MAX_BLOCK_DEPTH` (=4); optional block `label` becomes a section heading. Every pushed item
  carries `source_template_id`. A composite whose root has no mysteries but nests a rosary surfaces
  that set on `session.context`. `templateOutline` previews a block by its target name.
- **DevotionItemsEditor.tsx** — "Devotion block" add-type; expanded editor shows a template picker
  (self excluded) + optional section label; collapsed header shows the target devotion's name.

Also filed the sibling stories this composite needs: **ACTS-119** (Decade of the Passion / Rosary
for the Dead seed + How-To), **ACTS-120** (Litany of the Faithful Departed + Loreto/BVM + closing
collects), **ACTS-121** (name + pronoun layer). Counter → 121. ACTS-107 spec updated with the
settled structure + captured OLG Decade-of-the-Passion wording.

## Verified (and how)
- `tsc --noEmit` clean.
- **Compiler unit harness** (`node --experimental-strip-types` against the real compiler,
  scratchpad `block-test.ts`) — **14/14 PASS**: expansion order (Opening heading → "The Rosary"
  block heading → 2 decades → 2 litany salutations), lineage per source template, contiguous
  positions 0..n, nested-rosary set surfaced to context, **cycle** A→B→A terminates (A+B once
  each), **depth bound** stops a deep chain at Level 0–4.
- **Browser** (localhost:8080, `/template/tpl-litany-humility`) — builder loads, no console
  errors; the "Devotion block" add-type option renders in the add menu. (Pane screenshot capture
  came back blank + the Radix menu is portal-rendered, so full picker→preview click-through is
  deferred to ACTS-107 when a real composite exists; the logic is covered by the unit harness.)

## Git state at handoff
Uncommitted — not yet `/save`d. Changed: `src/lib/prayer/types.ts`, `src/lib/prayer/compiler.ts`,
`src/components/prayer/DevotionItemsEditor.tsx`; docs: `stories/ACTS-107.md`, `ACTS-110.md`,
new `ACTS-119/120/121.md`, `stories/README.md`, `stories/.counter`.

## Next
- ACTS-110 is **code-complete**; the only open AC is its downstream realization in ACTS-107.
  Ready for `/save` then `/done` (or keep open until 107 proves the composite end-to-end).
- Build order from here: **ACTS-119** (Decade of the Passion seed — content already captured in
  ACTS-107) → **ACTS-120** (litany seeds) → **ACTS-121** (name/pronoun) → **ACTS-107** (assemble +
  browser-verify the full prayable, shareable composite).
- STORAGE_KEY bumps belong to the seed stories (119/120), not 110 (no seed data changed here).
