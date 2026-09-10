---
story: ACTS-182
session: 01
wrapped_at: 2026-09-10T15:54:24-0700
status: Done
final: true
---

## What happened
Home page redesign — the Vessels library is now available but out of the way, and the
nav leads with the daily surfaces.

**Home (`src/routes/index.tsx`)**
- The **Vessels** card moved to the **bottom of the Home stack, below the Reflection
  composer** (was between Word and Reflection).
- It's now **collapsible** and **collapsed by default**. Open/closed state is remembered
  per-browser in `localStorage` under `oravia:home:vessels-open` (JC chose *remember* over
  *always-collapsed*, as a trial — flip is a one-line change: drop the read-back effect).
- Card title reads **"Vessels of Knowledge"**.

**Reusable collapse (`src/components/home/SectionCard.tsx`)**
- Added `collapsible` / `open` / `onOpenChange` props (Radix `Collapsible`, animated
  chevron). Header hairline only drawn when open, so a collapsed card doesn't stack two
  rules at its foot. Any Home card can opt in later.

**Label (`src/lib/prayer/knowledge.ts`)**
- New `SECTION_LABEL_LONG = "Vessels of Knowledge"` for the display surfaces that have room
  (Home card + `/formation` page header). Tight spots — nav, back-buttons, meta/tab titles
  — keep the short `SECTION_LABEL = "Vessels"`.

**`/formation` (`src/routes/formation.tsx`)**
- Page header uses the long label.
- Landing filter default changed from **All → Voices** (the by-Vessel grouping) — JC follow-up.

**Nav (`src/components/layout/nav-links.ts`)**
- Swapped **Word ↔ Vessels**: Vessels into the primary bar (Word's slot →
  Today · Plan · Prayers · **Vessels** · Reflect), Word into the secondary drawer (where
  Vessels was). Settings unchanged. Word still reachable via drawer + Home Word card + `/word`.

## Verified (and how)
Live in the in-app browser (dev server on 8080), inspected via DOM (pane was hidden):
- **Placement/order:** Home h2s = Prayer & Devotion → Word → Reflection → **Vessels of
  Knowledge** (last).
- **Collapsed by default:** trigger `data-state: closed`, `localStorage` unset on first load.
- **Persistence round-trip:** click opens → `data-state: open`, `ls="1"`; reload → still
  open; click collapses → `closed`, `ls="0"`.
- **Nav swap:** bottom bar + side rail show **Vessels** in the primary group, **Word** in the
  drawer.
- **Long label:** `/formation` header = "Vessels of Knowledge"; browser tab title stays
  "Vessels — Oravia" (meta kept short).
- **Voices default:** fresh land on `/formation` → active pill = **Voices**.
- **`npx tsc --noEmit`:** clean. No console errors.

## Acceptance criteria — all met
- [x] **(a)** Vessels card collapsible (header chevron), collapsed by default, rendered last —
      below the Reflection composer. Contents + empty state unchanged.
- [x] **(b)** Title "Vessels of Knowledge" on Home card + `/formation` header; nav/back/meta
      keep short "Vessels".
- [x] **(c)** Nav swap Word ↔ Vessels; Settings unchanged; Word still reachable.
- [x] Collapse/expand persists across sessions (localStorage `oravia:home:vessels-open`).
- [x] No functionality lost — Word reachable via drawer, Home Word card, `/word`.
- [x] Follow-up: `/formation` lands on **Voices**, not All.

## Git state at handoff
Committed & pushed to `origin/main` (JC pushed — creds unavailable in-session):
- `53dfb8c` — ACTS-182: collapsible Vessels card last on Home + nav swap + land Vessels on Voices
- `17e09a9` — docs: ACTS-182 — acceptance criteria met, decisions recorded

(This final handoff + board/pointer update committed by `/wrap`.)

## Next
Story complete. Open siblings in this Home/nav arc: **ACTS-186** (app-wide sweep for stray
free-text entity boxes), **ACTS-187** (unified add/edit form), **ACTS-191** (`/word` expanded
page). No follow-ons opened by this work.
