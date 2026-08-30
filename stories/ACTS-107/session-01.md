# ACTS-107 — session-01 (final handoff)

**Status: Done.** Shipped the composite devotion for the dead and, at JC's direction,
grew it into a small **novena scaffold** with swappable parts.

## What shipped
- **`tpl-litany-for-the-dead` → "Novena: 9-Day Rosary for the Faithful Departed"** —
  a composite devotion, `default_recurrence` daily×9, notes carrying the **Pasiyam**
  (Filipino Catholic, nine nights of prayer) context.
- **Structure** (as loose, editable items + two swappable blocks):
  - `heading` **Opening** → `sign-of-the-cross` · `eternal-rest` · `offering-for-the-soul`
  - `template_block` **Rosary** (default `tpl-rosary-for-the-dead`)
  - `template_block` **Litany** (default `tpl-litany-faithful-departed`)
  - `heading` **Closing & Requiem Prayers** → `collect-fidelium` · `collect-departed-kindred`
    · `hail-holy-queen` (optional) · `eternal-rest` · `sign-of-the-cross`
- **New prayer** `offering-for-the-soul` ("O Jesus, who wast crowned with thorns… lead the
  soul of {name}…", src-olg-passion).
- **Swappable blocks (new infra):** added `TemplateItem.block_options?: ID[]`. When a
  `template_block` carries options, the Session Builder shows a **"Choose the parts"**
  picker; choosing rewrites that item's `block_template_id` in the session's own
  `plan.items` — no compiler/context plumbing (compilePlanSession already compiles
  plan.items). Rosary options: Decade of the Passion / Holy Rosary / Caro / Scriptural.
  Litany options: Faithful Departed / Loreto / Sacred Heart / Immaculate Heart.
- **Opening/Closing are loose prayers**, not bundled blocks (per JC) — the leader can
  rearrange/drop/add. Dropped the interim `tpl-vigil-opening` / `tpl-closing-requiem`
  block templates.
- **Dedication fix:** dedication now requires a **name**; a leftover pronoun no longer
  yields a mismatched "her" over a nameless soul — blank reads the generic "them".
- **Share dialog** intention placeholder made generic (was "For Grandma's health").
- **STORAGE_KEY v33 → v37** across the session's iterations.

## Verified
- Node harness (`--experimental-strip-types`): default compiles (133 items, 4 sections in
  order); litany→Loreto swap (faithful-departed gone); rosary→Holy Rosary swap (decade
  gone); blank dedication → "grant unto **them**", **no "her" anywhere**; 0 leftover tokens.
- Browser (v37): both novena names in the picker; "Choose the parts" shows Rosary + Litany
  dropdowns with the right options; a Loreto swap persisted through save + edit-reload and
  Pray mode rendered Loreto with "pray for **her**" for a dedicated soul; blank name + she
  → session saved with **no** `for_whom` (generic). Build list shows the loose
  Opening/Closing prayers as editable rows.

## Follow-ons (filed as new stories — see the board)
- **Novena scaffold generalization** — chaplet as a third swappable option (rosary +
  litany **or** chaplet), a generic name for the "Choose the parts" box, and daily
  offering prayers that vary/rotate by novena day.
- **"Novena Prayers" pattern** — a single prayer (or day-varying prayers) said once a day
  over N days, day-indexed.
- **Five novena content seeds:** Sacred Heart (9-day), Mother of Perpetual Help (9-day),
  Lenten, Christmas, St. Michael.

## Git
- `b52885b` ACTS-107 code · `ff61599` docs. **PUSH FAILED (auth)** — push from the git
  client: `git push origin main`.
