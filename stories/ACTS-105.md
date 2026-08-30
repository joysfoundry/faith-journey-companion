---
id: ACTS-105
title: Evolve /prd-sync → "canon / doc sync" + apply to CRV
spine: ACTS-105
status: To Do
origin: human-directed
approved_by: JC
depends_on: [ACTS-104]
relates_to: [ACTS-104]
started_at: 2026-08-29T18:33:38-0700
updated:    2026-08-29T18:33:38-0700
latest_handoff: null
sessions: 0
---

## Goal
As the product owner, I want the `/prd-sync` skill to grow from "sync one PRD"
into a **canon / doc sync** — where changing one source of truth (e.g. the
**vision**) cascades updates to *all* related docs and project information — and
I want to run it on the **CRV** repo too, so my documentation stays coherent
across a whole project, not just a single file.

## Context
Spun off from ACTS-104 (which shipped `/prd-sync` v1: reconcile a single PRD with
the code, non-destructively). JC's note: "it may evolve to a canon or doc sync
where if I change — say the vision — then it will update any related docs and
information about the project." Also: "I'd like to apply this to CRV."

## Sketch / open questions (to refine with JC)
- **Canon model** — treat the vision as the *canonical* source; define which docs
  are *derived* (README, PRD sections, onboarding, marketing one-pagers, etc.) and
  the propagation rules between them.
- **Cascade** — when canon changes, detect affected derived docs and propose
  updates (diff + review, never silent overwrite — same non-destructive rule as v1).
- **Multi-doc discovery** — generalize `docs/.prd-sync` (one path) into a small
  manifest listing canon + derived docs and their relationships.
- **Cross-repo** — the skill is already global; applying to **CRV** mainly needs
  CRV's canon/derived manifest. Do a first `/prd-sync` pass on CRV as-is to
  validate the single-doc flow there before building the cascade.
- **Conflict / staleness** — how to flag a derived doc a human edited by hand so
  the cascade doesn't clobber intentional divergence.

## Acceptance criteria (draft)
- [ ] Manifest format for canon + derived docs
- [ ] Cascade proposes (not applies) updates to derived docs on a canon change
- [ ] Validated on both ACTS and CRV repos
- [ ] Hand-edited/diverged docs are detected and protected

## Tests
_Tooling/skill story; document coverage when the shape is decided._
- **Unit / Integration / E2E**: N/A for now (skill authoring) — revisit if any
  in-repo scripts are added to support the manifest/cascade.
