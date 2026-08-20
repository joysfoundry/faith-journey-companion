# Handoff — PRD gap-merge

_Last updated: 2026-08-19 · branch `prd-gap-merge` (13 commits, **not yet pushed**)_

## What this is
Merging the **ACTS PRD** capabilities into **faith-journey-companion** (the app whose UX we're keeping). The ACTS Next.js build in `../acts` is now just the reference/spec + test oracle. Decision: **gap-merge into fjc, keep the localStorage store** (no Supabase persistence yet).

## Run it
```bash
npm install          # bun.lock exists but npm works (package-lock is gitignored)
npm run dev          # http://localhost:8080
npx tsc --noEmit     # typecheck (ignore routeTree.gen / .tanstack noise)
npx tsx scripts/verify-merge.ts   # deterministic compiler/acceptance checks
npm run build        # full prod build (nitro)
```

## Architecture (fjc)
TanStack Start (SSR + server fns) · React · TS · shadcn/ui · Tailwind. Supabase is wired for **auth only** — the domain data lives in a **localStorage repository** (`src/lib/prayer/store.ts`). Pattern: pure reducers in `mutations`, wired via `setDb` in `src/components/app-store-provider.tsx`, typed in the `AppStore` interface. **`STORAGE_KEY` is `prayer-companion-db-v5`** — bump it whenever the seed changes so fixtures reload. Deterministic session compiler in `src/lib/prayer/compiler.ts`; seed in `src/lib/prayer/seed.ts`; types in `src/lib/prayer/types.ts`; taxonomy in `src/domain/taxonomy.ts` (3 axes: prayer_type / expression_type / devotion_type).

## Done (see JIRA backlog for the ticket list)
Generic **External Link** + Pray with the Pope · **Chaplet of St. Michael** · generic **Scripture** component + **Scriptural Rosary (Luminous)** · **Reflection / Learning (Life Library) / Mass** promoted to persisted store entities · **Learn** relabel · **Add Prayer** redesign (single vs devotion, manual/URL/photo intake, **PrayerMedia** links+clips, review-before-save) · **Prayer library** read-only details + row actions (pray/edit/expand) · editor **hydration-race fix** · **Devotion builder** redesign (JIRA add+type, hover "+" insert-between, searchable picker, DnD-only, template audio, **Source name+URL**, fixed mystery set, **review = fully expanded**, **auto How-To** on save) · **Mystery heading** everywhere ("First Luminous Mystery" + title + description) · **decade labels** ("1st decade …") in Pray mode.

## Next (highest value first)
1. **Pray-mode tracker** — bring fjc's praying view up to the ACTS style: prominent current item, **completed prayers grayed out**, and **auto-scroll** as you advance. (Preview already feeds the fully-expanded list.)
2. **Touch drag-and-drop** in the builder — current DnD is HTML5 (desktop only); phones need a lib (e.g. dnd-kit).
3. **Push the branch** (only the user can — sandbox has no GitHub auth): `git push -u origin prd-gap-merge`.

## Gotchas
- **Can't push** from the sandbox (no GitHub auth). Commits are local on `prd-gap-merge`.
- Browser-tool screenshots **desync** on this dev server; verify via `javascript_tool` (native-setter + input event for controlled fields) and read `localStorage['prayer-companion-db-v5']`.
- Hydration: components that seed `useState` from the store must gate on `ready` (localStorage loads after first render). Done for prayer editor + template builder; **other edit routes may still have the latent race**.
- Removed the builder's old "start from existing template" copy feature during the redesign (not restored).

## Reference
The ACTS spec/prompt: `~/Downloads/ACTS_MVP_Claude_Generic_Build_Prompt_v2.docx.md`. Fixtures in `~/Downloads/Faith Journey/`.
