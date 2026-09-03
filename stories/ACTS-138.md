---
id: ACTS-138
title: Start a guided Lectio Divina from the Reflection surface
spine:
status: In Progress
origin: human-directed
approved_by: JC
depends_on: [ACTS-102]
relates_to: [ACTS-102, ACTS-103, ACTS-129]
started_at: 2026-09-03T12:16:43-0700
updated: 2026-09-03T12:16:43-0700
latest_handoff: null
sessions: 0
---

## Goal
As a person praying, I want to launch a **guided Lectio Divina** directly from the
**Reflection** surface (the Home reflection card and the `/reflections` page), so that
when I sit down "to reflect" I can choose a *Scripture-guided* path (Read → Reflect →
Respond → Rest) instead of only a free-write note — without having to know that a Lectio
lives under Prayers/Devotions as a "session."

## Design — entry-point bridge only
This is a **navigation / entry-point** story. The Lectio itself already exists and is
fully built — [ACTS-102](ACTS-102.md) shipped the seeded devotion
`LECTIO_TEMPLATE_ID = "tpl-lectio-divina"` ([`seed.ts:1809`](../src/lib/prayer/seed.ts)),
the first-class `reflection` step kind, and the Lectio-aware Prayer Mode
([`session.$sessionId.tsx:197`](../src/routes/session.$sessionId.tsx) `isLectio`). The
journaling captured in each movement is already saved as a **`Reflection`** entity,
dual-linked to the session + the step, and already surfaces in the Reflection journal.

**What's missing is purely the entry point:** the Reflection surface only offers "write a
free note," never "do a guided Lectio." Reuse everything from ACTS-102 — do **not** add a
new data model, step kind, or storage bump.

**Mechanism** (same pattern as [`index.tsx:402`](../src/routes/index.tsx) and
[`calendar.tsx:63`](../src/routes/calendar.tsx)):

```ts
const session = startSession(LECTIO_TEMPLATE_ID, { date: todayISO(), progress_mode: "scroll" });
if (session) navigate({ to: "/session/$sessionId", params: { sessionId: session.id } });
```

**Surfaces to add the CTA:**
- Home "Reflection" section card (alongside the free-write composer).
- `/reflections` page header (alongside the composer).

**Follow-on from review (JC, 2026-09-03):** a launched Lectio creates a session, which
was then appearing in the free-write "Link an item" picker under Prayer & devotion. A
Lectio is a *container* of journaling, not an inspiration to tag a separate note with, so
Lectio sessions/plans are now **excluded** from `buildReflectionLinkables`
([`linkables.ts`](../src/lib/prayer/linkables.ts)). Seeing/resuming Lectio sittings is the
Journal's job → ACTS-140; the abandoned-empty-session litter this exposed → ACTS-141.

**Open questions for JC (flag before building):**
- Label/copy for the CTA (e.g. "Reflect with Scripture (Lectio Divina)").
- Should the current `?link=<id>` provenance carry into the launched Lectio session?
- Placement/prominence: secondary button vs. a small "two ways to reflect" chooser.

## Acceptance criteria
- [ ] A visible control on the Home Reflection card launches the seeded Lectio session
      and navigates to `/session/$sessionId`.
- [ ] The same control exists on the `/reflections` page.
- [ ] The free-write composer path is unchanged (no regression).
- [ ] No new `TemplateItemKind` / `SessionItemKind`, no `STORAGE_KEY` bump, no schema change.
- [ ] Journaling from the launched Lectio still lands in the Reflection journal (existing
      ACTS-102 behavior, verified end-to-end).
- [x] Lectio sessions/plans excluded from the reflection "Link an item" picker
      (`buildReflectionLinkables`) — browser-verified, `tsc`/`eslint` clean.
- [ ] Final copy/placement confirmed with JC.

## Tests
_Planned — no runner wired yet (harness = ACTS-92); see
[`docs/E2E-TEST-PLAN.md`](../docs/E2E-TEST-PLAN.md). Convention ACTS-91: document coverage
for every code-change story._
- **Unit** (Vitest): N/A — no new pure `src/lib/**` logic; reuses `startSession` + existing
  `LECTIO_TEMPLATE_ID`. (Revisit if a link-provenance helper is added.)
- **Integration** (Testing Library): render the Home Reflection card and `/reflections`;
  assert the Lectio CTA is present and, on click, calls `startSession(LECTIO_TEMPLATE_ID, …)`
  and navigates to `/session/$sessionId`.
- **E2E** (Playwright): from Reflection → start Lectio → complete a movement's journaling →
  confirm the entry appears in the Reflection journal (extends the ACTS-102 Lectio flow).
