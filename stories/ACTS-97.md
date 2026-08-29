---
id: ACTS-97
title: Land on the browse/list tab by default (Vessels + Plan), not the create tab
spine:
status: Done
origin: human-directed
approved_by: JC
depends_on: []
relates_to: [ACTS-96]
sync: local
synced_at: null
started_at: 2026-08-28T14:00:00-0700
updated: 2026-08-28T17:25:59-0700
latest_handoff: ACTS-97/session-01.md
sessions: 1
---

## Goal
As a returning user, when I open Vessels or Plan I want to land on the tab that
shows what I already have (browse/list), not the create form — so the app opens
where I most often want to be. Creating stays one tap away, and the explicit
"create" entry points still jump straight to the create tab.

## Design (worked out in the ACTS-96 chat, 2026-08-28)
Two parallel pages, each with a create tab and a browse tab. Make **browse the
default and the first (left) tab**, keeping an explicit exception that lands on
create when the user came to create.

**Formation / Vessels — [`src/routes/formation.tsx`](../src/routes/formation.tsx)**
- Tabs: `add` (create) + `library` (browse).
- Default is **already** `library` (line ~115: `add ? "add" : "library"`), so only
  the **visual order** changes: swap the two `<TabsTrigger>`s so **Library is first,
  Add second** (TabsList ~line 238).
- Exception already wired: `?add=true` (validateSearch ~line 52) → lands on Add.
  Entry points that must keep landing on Add: the home Vessels card "+" and
  "Add & browse your library" links ([`src/routes/index.tsx`](../src/routes/index.tsx) ~520,
  [`src/components/home/WordSection.tsx`](../src/components/home/WordSection.tsx) ~241) — both already pass `search={{ add: true }}`.

**Plan — [`src/routes/pray.tsx`](../src/routes/pray.tsx)**
- Tabs: `builder` (create) + `sessions` (browse). Currently always defaults to
  `builder` (line ~172 `useState("builder")`) and Builder is the first tab.
- Mirror Formation:
  - Swap `<TabsTrigger>`s so **Sessions is first, Session Builder second**
    (TabsList ~line 427).
  - Add a `validateSearch` accepting a `build` flag (mirror Formation's `add`):
    `search.build === "1" || search.build === true ? { build: true } : {}`.
  - `const { build } = Route.useSearch();` and default the tab:
    `useState<"builder" | "sessions">(build ? "builder" : "sessions")`.
  - The home "New session" action ([`src/routes/index.tsx`](../src/routes/index.tsx) ~372,
    `navigate({ to: "/pray" })`) must pass `search: { build: true }` so it still
    opens the builder.
- Sanity: `action={tab === "builder" ? pageMenu : undefined}` still holds (no page
  menu on the Sessions tab); in-page "Edit session" still `setTab("builder")`.

## Acceptance criteria
- [x] Vessels: tab order is Library then Add; plain `/formation` opens Library;
      `/formation?add=true` and the home add entry points still open Add.
- [x] Plan: tab order is Sessions then Session Builder; plain `/pray` opens
      Sessions; the home "New session" action opens the Session Builder.
- [x] No regression to session build/save/edit or vessel add/edit flows.
- [x] Verified in the browser preview (both pages, both entry paths) — JC spot-check
      (in-app preview unavailable this session; infra glitch, not the code).

## Tests
_Convention (ACTS-91): document coverage; no runner yet (harness = ACTS-92) →
planned._
- **Unit** (Vitest — pure `src/lib/**`): N/A — routing/UI default only, no pure
  helper extracted.
- **Integration** (Testing Library): Plan renders Sessions tab by default and
  Builder when `build` search is set; Formation renders Library by default and Add
  when `add` is set.
- **E2E** (Playwright — see the plan): open `/pray` → Sessions active; "New
  session" → Builder active; open `/formation` → Library active; add-vessel entry
  → Add active.
