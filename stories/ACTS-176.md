---
id: ACTS-176
title: Mysteries tab mislabels the Mater Dei version as "USCCB — Scripture"
status: Done
origin: human-directed
approved_by: JC
depends_on: []
relates_to: [ACTS-172]
started_at: 2026-09-09T00:36:20-0700
updated:    2026-09-09T00:36:20-0700
latest_handoff: stories/ACTS-176/session-01.md
sessions: 1
---

## Goal
As a user managing mystery versions, I want each version card in the **Mysteries** tab to
carry the version's own name, so the Mater Dei Catholic Church version reads correctly and
isn't shown as a second "USCCB — Scripture".

## Bug (as reported by JC, prod)
The Mater Dei Weekly Rosary's mystery version appeared **renamed** to "USCCB — Scripture" in
the Prayers → **Mysteries** tab (a duplicate of the real USCCB version). The version inside
the **devotion** looked correct. JC had only asked for the non-Glorious mysteries to be
filled in; the version's source and title were to stay "Mater Dei Catholic Church".

## Root cause
Data was **not** corrupted — display-only. The Mater Dei body (`body_key:
"mater-dei-catholic-church"`, ACTS-172) fills all 20 mysteries: the Glorious 5 carry the
parish's own NABRE (`src-mater-dei-catholic-church`, name "Mater Dei Catholic Church") and
the other 15 reuse USCCB Scripture as a placeholder, deliberately **attributed** to USCCB
(`src-usccb-rosary`, name "USCCB — Scripture"). `mysteryVersions()` named each version by the
**source of the first mystery it encountered** for that `body_key`. Sets iterate Joyful →
Sorrowful → Glorious → Luminous, so the first Mater Dei content hit was a Joyful placeholder
attributed to USCCB — mislabeling the whole version. The devotion picker was right because
`allMysteryBodies()` names a version by its **label** first.

## Fix
One line in [`mysteryVersions`](../src/lib/prayer/compiler.ts) — name a version by its own
`label` first, then fall back to source name, matching `allMysteryBodies` and the devotion
picker. A version now shows its consistent label regardless of which mystery lists first or
where individual bodies borrow their text. No data shape change, **no `STORAGE_KEY` bump**;
existing installs correct on next load.

## Acceptance criteria
- [x] Mysteries tab lists four distinct versions: Reflection, USCCB — Scripture,
      Ascension — Meditation, **Mater Dei Catholic Church**.
- [x] Devotion picker name unchanged (still correct).
- [x] No data migration; no `STORAGE_KEY` bump.

## Tests
- **Unit** (Vitest — pure `src/lib/**`): `mysteryVersions(db)` returns a card named by the
  version label — a body assembled from multiple differently-attributed sources
  (Mater Dei = 5 NABRE + 15 USCCB) still yields one "Mater Dei Catholic Church" entry, not a
  duplicate of the borrowed source. **Planned** (no runner yet — ACTS-92).
- **Integration** (Testing Library): Prayers → Mysteries renders one card per body_key with
  the label as its title. **Planned.**
- **E2E** (Playwright): N/A — covered by the manual browser check below until the harness
  lands.
- **Manual (this session):** browser-verified in the local preview — the Mysteries tab shows
  the four distinct versions with "Mater Dei Catholic Church" as the fourth; `git` in sync.
