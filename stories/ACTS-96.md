---
id: ACTS-96
title: Make the app mobile-web-first and responsive (wide-screen nav + PWA)
spine:
status: Done
origin: human-typed
depends_on: []
relates_to: [ACTS-90, ACTS-82, ACTS-87, ACTS-88]
started_at: 2026-08-28T12:52:24-0700
updated:    2026-08-28T17:17:17-0700
latest_handoff: stories/ACTS-96/session-01.md
sessions: 1
---

## Goal
As a user on any device, I want the app to feel like a proper responsive
mobile-web app — polished on a phone, and adapting gracefully to tablet and
desktop — instead of a fixed narrow phone column. This **executes** the platform
direction recorded in [ACTS-90](ACTS-90.md).

## Scope (confirmed by JC, 2026-08-28)
- **Wide-screen nav:** on `md`/`lg`, switch the bottom tab bar to a side/rail nav
  and widen content — not just fluid padding.
- **PWA in scope:** add manifest + install UX (installable / offline plumbing).
  **This un-parks the ACTS-90 parked sub-question** ("PWA vs plain responsive
  web") — JC confirmed PWA on 2026-08-28.

## Navigation IA (decided with JC, 2026-08-28)
One menu, two surfaces (shared body = `NavSections`):
- **Primary:** Today · Plan · Prayers · Word · Reflect. Plan's icon is now the
  calendar (`CalendarDays`) — **there is no separate Calendar item; the calendar
  lives inside Plan** (`/pray`). (`/calendar` route left in place, unlinked, to be
  folded into Plan later.)
- **Secondary (lower menu section):** Vessels (`/formation`) · Add prayers
  (`/import`) · Settings. "Sources" removed entirely.
- **Desktop (md+):** fixed left rail shows primary + secondary.
- **Mobile:** bottom bar = 5 primary tabs + a **Menu** button that opens the full
  menu as a left slide-in drawer (backdrop + Escape close; closes on navigate).
  The old **More page (`/more`) is removed.**
- **Future (ties to ACTS-87/88 auth):** once accounts land, **Settings moves under
  the account/profile menu item** rather than sitting loose in the secondary list.

## Acceptance criteria
- [x] Mobile (≤640px) stays the primary, polished experience — bottom nav,
      comfortable tap targets, no horizontal scroll.
- [x] `md`/`lg`: bottom tab bar becomes a side/rail nav; content column widens
      sensibly (shell + pages stop being hard-capped at `max-w-2xl` everywhere).
- [x] Shell + page containers (`AppShell`, `PageShell`, `BottomNav`) use
      responsive width/padding/nav rather than one fixed phone layout.
- [x] Mobile menu drawer (Menu button → left drawer; backdrop/Escape close;
      closes on route change), replacing the More page.
- [x] Safe-area insets respected (notch / home indicator) on mobile web —
      `viewport-fit=cover` added; bottom nav already pads `env(safe-area-inset-bottom)`.
- [x] PWA: web app manifest + icons; installable; basic offline shell.
- [x] No regression to existing routes; verified in the browser preview at
      phone / tablet / desktop widths.

## PWA implementation (2026-08-28)
Hand-rolled, **no new deps** — deliberately avoids `vite-plugin-pwa` so it never
touches the TanStack Start + nitro + `@lovable.dev/vite-tanstack-config` build
chain (the config warns against adding plugins; ties to the open Lovable/publish
question). Un-parks the ACTS-90 PWA decision.
- **Icons** ([`public/`](../public/)): a minimal compass-star mark (thin 4-point
  star + diagonal accents, gold center) on the slate gradient — cream on
  `#1e3f7f`→`#4673ae`. Placeholder, generated programmatically (script in the
  session scratchpad, not committed). Sizes: `icon-192`, `icon-512`,
  `icon-maskable-512` (safe-zone checked), `apple-touch-icon` (opaque 180).
- **Manifest** [`public/manifest.webmanifest`](../public/manifest.webmanifest):
  standalone, `theme_color`/`background_color` `#f4f9ff`, the three icons
  (any + maskable).
- **Service worker** [`public/sw.js`](../public/sw.js): runtime-caching only (no
  build manifest) — navigations network-first→cached shell, static assets
  stale-while-revalidate, cross-origin passthrough. Fits the localStorage
  offline-first model (data already offline; SW just makes the shell load).
  **Registered PROD-only** from [`__root.tsx`](../src/routes/__root.tsx) (avoids
  dev-caching headaches) — so it activates on the deployed build, not the dev
  preview. Verified by manual registration in dev: install → **activated**,
  shell precached (`fj-shell-fj-v1`), then cleaned up.
- **Head** ([`__root.tsx`](../src/routes/__root.tsx)): `viewport-fit=cover`,
  `theme-color`, `apple-mobile-web-app-*` metas, manifest + apple-touch links.

## Tests
_Convention (ACTS-91): document coverage for every code-change story. No runner
wired yet (harness = ACTS-92) → these are **planned**._
- **Unit** (Vitest — pure `src/lib/**`): N/A for pure layout/CSS; any new pure
  helper (e.g. breakpoint/nav-mode logic) gets a case if extracted.
- **Integration** (Testing Library): AppShell/BottomNav render the correct nav
  variant per viewport (mobile bottom-bar vs. wide rail); no route regressions.
- **E2E** (Playwright — see the plan): smoke each top-level route at mobile +
  desktop widths (no horizontal overflow, nav reachable); PWA install/manifest
  smoke where feasible.
