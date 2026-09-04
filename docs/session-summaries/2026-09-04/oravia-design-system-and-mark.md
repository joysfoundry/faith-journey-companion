---
date: 2026-09-04
stories: [ACTS-148, ACTS-150, ACTS-151]
---

# Oravia design system + the brand mark (ACTS-148 → Done)

## What happened, in order

1. **Opened ACTS-148.** Local-only tracking (no Jira). Pre-flight found the app already had a
   full oklch token layer *and* a complete `.dark` block — but nothing in `src/` ever adds the
   `.dark` class, so dark mode was unreachable dead code.
2. **Started in the `/design` canvas, then changed course.** JC asked for `/design-sync` instead.
   I had said the canvas could not reach claude.ai/design — **wrong**; the sync tool exists and
   needed a one-time `/design-login` from an interactive terminal. JC hit two blockers doing it:
   slash commands typed into bash, then `claude` not on PATH (it lives at `~/.local/bin/claude`).
3. **Created the "Oravia Design System" project** on claude.ai/design (a new one — JC's existing
   "Crave Design System" is a different product) and pushed the system to it.
4. **Settled the direction.** Restrained vs Illuminated → **Illuminated**. A richer variant,
   drawn from a Marian painting JC supplied, was built and kept but not adopted.
5. **Applied Illuminated to the app, verified it, then reverted it** — JC: *"don't make changes
   to app yet. I will launch with blue for now."* Preserved as a patch.
6. **Found JC's original logo.** A compass rose, sitting in `public/icon-512.png` the whole time.
   Also found `favicon.ico` was still **Lovable's default heart**, shipping in the beta.
7. **JC spotted the idea:** the compass's elongated south point was already doing the work of a
   cross. Six variants later → **5a, "the cross in the compass."**
8. **Shipped the mark**: icon set into `public/`, the live palette's blues and golds harmonised
   to the exact Marian values, and the mark into the app header.
9. **Fixed the design-system pane**, which was only showing 11 of 22 cards, and replaced a
   misleading "Before & after" card with a three-state one.
10. **Closed ACTS-148**; filed ACTS-150 (dark mode) and ACTS-151 (ship Illuminated).

## Verified, and how
- **Contrast** — computed in sRGB from oklch throughout (own converter, not eyeballed). Live
  palette after tuning: primary 7.05:1 on the page, 7.37:1 on a card, 6.60:1 on the header, ink
  14.26:1, muted ink 5.00:1. Illuminated: every pair AA, worst case 4.68:1.
- **Icons actually serving** — fetched each from the running dev server with `cache: 'reload'`;
  all 200, all matching the newly installed byte counts.
- **The app** — browser-verified on Home at mobile and desktop widths, after each change.
- **`tsc` clean** after every code change, including after the incoming merge.
- **The patch** — `git apply --check`'d against the reverted tree before being committed.
- **One measurement was junk and is retracted:** a live contrast probe reported 1.03 and 2.50.
  It parsed `oklab()` strings as RGB. The sRGB math above is the correct source.

## Git state at handoff
- **Pushed:** the first ten ACTS-148 commits (JC pushed; `origin/main` also took ten incoming
  commits — Lovable changes, TanStack security bumps, share-store work, two SQL migrations —
  which touched **no** file this session touched).
- **Committed, NOT pushed:** `3bcb05c` (the close-out) — every push from this session failed with
  `could not read Username for 'https://github.com': Device not configured`. No credential helper
  in this environment.
- **Working tree:** clean except `.env`, which was already modified before this session and holds
  `VITE_BETA_PASSCODE`. Deliberately never staged.

## Parked / next
- **ACTS-151 — ship Illuminated.** Built and verified; the patch **predates** the harmonisation
  and header-mark commits, so expect a rebase rather than a clean apply. Blues and golds already
  match; only **surfaces** change.
- **ACTS-150 — wire dark mode.** Values chosen and verified; nothing renders them.
- **Burgundy has no home.** `LiturgicalDay` computes `season` and `color` for every day — an
  always-on hook nothing uses.
- **Karla vs Mulish** — app and printed collateral still disagree. Type card recommends Mulish.
- **The pane's token panel reads `tokens.css`**, which is Illuminated (staged), not what's live.
  The "Three palettes" and "Published palette" cards are the accurate source.
- **Header mark colour** — gold on the cool header is deliberately soft; `text-primary` is a
  one-word change if it reads faint in use.

## Next session — opener (paste to start)

> Continuing Oravia. ACTS-148 (design system + brand mark) is **Done** — the mark ships in the
> app header and as the icon set (this replaced Lovable's default favicon), and the live palette
> is tuned to the Marian blues and golds. The design system is 22 cards in the "Oravia Design
> System" project on claude.ai/design, mirrored at `docs/brand/design-system/`.
>
> First: `git push origin main` — one commit (`3bcb05c`) is committed but unpushed; every push
> from the last session failed on missing GitHub credentials.
>
> Two follow-ons are open. **ACTS-151** ships the Illuminated palette (warm parchment, gold
> section bands, burgundy) — it is fully built as
> `stories/ACTS-148/illuminated-app.patch`, but that patch predates two later commits, so plan on
> rebasing it, not applying it clean. Only surfaces change; blues and golds already match.
> **ACTS-150** wires dark mode — the `.dark` tokens exist but nothing in `src/` ever adds the
> class, so it is unreachable today.
>
> Before shipping Illuminated, three things want deciding: where burgundy lives (nothing renders
> it; `LiturgicalDay` gives `season` and `color` every day), Karla vs Mulish for the UI face, and
> whether dark mode folds in or ships separately.
