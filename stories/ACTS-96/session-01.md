---
story: ACTS-96
session: 01
wrapped_at: 2026-08-28T17:17:17-0700
status: Done
final: true
---

## What happened
Delivered the full mobile-web-first + responsive migration and the PWA.

**Responsive shell + nav IA**
- Un-capped the fixed `max-w-2xl` phone column; shells (`AppShell`, `PageShell`)
  clear a left rail on md+ (`md:pl-60`), drop bottom padding on desktop, widen at lg.
- One menu, two surfaces sharing `NavSections`: fixed left rail (`SideNav`) on md+;
  mobile bottom bar (`BottomNav`) with a Menu button opening a left drawer
  (`MobileNavDrawer`, backdrop/Escape close, closes on route change) via `AppNav`.
- Nav split: primary (Today, Plan, Prayers, Word, Reflect) + secondary (Vessels,
  Add prayers, Settings). Plan's icon → calendar; no separate Calendar item;
  "Sources" removed. **Removed the `/more` page/route** (repointed the formation
  back-link to Today; router regenerated).

**PWA (hand-rolled, no deps — avoids the TanStack Start/nitro/Lovable build chain)**
- `public/manifest.webmanifest`, compass-star icons (192/512/maskable + apple-touch),
  `public/sw.js` runtime-caching offline shell, and head wiring in `__root.tsx`
  (viewport-fit=cover, theme-color, apple metas, manifest/apple-touch links,
  prod-only SW registration). Un-parks the ACTS-90 PWA decision.

## Verified (and how)
- `tsc --noEmit` clean throughout.
- Browser preview: shell correct at 375 / 768 / 1280; mobile drawer open/close +
  off-screen geometry checked via scripted DOM; More page removed; no console errors.
- PWA: manifest valid + served, all icons + `sw.js` served; SW manually
  registered in dev → **activated**, shell precached (`fj-shell-fj-v1`), then
  cleaned up. Auto-registration is prod-gated (activates on the deployed build).

## Git state at handoff
Committed & pushed pending: `e68939b` (shell), `7d0f041` (pointer), `c599bb8` (PWA
code+assets). Docs commit for this handoff + status flip follows, then push.
(Note: this repo's pushes have needed the user's git client — see report.)

## Next
Story complete — all 6 acceptance criteria met. Follow-ups live in their own
stories: ACTS-97 (default browse tab), and future auth (ACTS-87/88) will move
Settings under the account menu. Icon is a placeholder pending real branding.
