# Session — Mater Dei seed, daily Open Prayer on Home, Home upcoming week

Date: 2026-09-08 (local). Stories: ACTS-172, ACTS-173, ACTS-174 (all closed Done). Plus a
scoped plan for ACTS-171 earlier in the arc (already Done separately).

## What happened (in order)
1. **ACTS-172 — Seed the Mater Dei parish Rosary.** Read JC's in-app data straight from the
   **Claude preview's localStorage** (port 8080, origin holds the data — had to free 8080 from
   a stale server so the preview bound it) rather than a hand export. Found the "Mater Dei
   Mystery" is a **mystery body** (`default_mystery_body: "mater-dei-catholic-church"`) over
   the Glorious set, not a mystery *set*. Seeded `tpl-mater-dei-weekly-rosary` (35 steps, incl.
   a nested Litany-of-Loreto block), a Mater Dei mystery body for **all 20** mysteries (5 with
   JC's NABRE, 15 USCCB placeholders per JC's call), and `src-mater-dei-catholic-church`.
   `STORAGE_KEY` **v40→v41**. Fixed the blank devotion-block step JC reported ("see 32"): the
   real culprit was the **devotion detail page** (`devotion.$devotionId.tsx:292`,
   `item.label ?? item.kind` — empty string survives `??`), a different view than the compiler
   fix `405f670` (session guide). Two transcription typos corrected.
2. **ACTS-173 — Standing daily Open Prayer on Home.** Modeled as a seeded `SessionPlan`
   (`plan-daily-open-prayer`, endless daily). Because the seed stamps `now = SEED_EPOCH` and a
   plan's `date` only advances on finish, added a **catch-up** in `loadDatabase`: an endless
   daily plan whose `date` is overdue rolls up to `todayISO()` (bounded/other-freq untouched).
3. **ACTS-174 — Home upcoming week inline.** Widened Home's Prayer & Devotion plan window from
   `date === today` to `[today, today+7]`; future rows render a `Sat, Sep 12`-style date
   inline (each plan once at its next occurrence, no per-day expansion); done-today skip gated
   on `date === today`. `index.tsx` only.

## Verified (and how)
- ACTS-172: fresh v41 in the preview seeded the devotion (35 steps) + 20 Mater Dei body rows
  (5 NABRE `src-mater-dei-catholic-church`, 15 USCCB `src-usccb-rosary`) + the source; the
  devotion-detail step 32 renders "Litany of the Blessed Virgin Mary (Loreto)" (screenshot).
- ACTS-173: the seeded plan's `date` rolled 2024-01-01 → today; Home shows **Prayer &
  Devotion → Today → Open Prayer** with a play button (screenshot).
- ACTS-174: Home shows **TODAY · Open Prayer** and inline **SAT, SEP 12 · The Holy Rosary**
  with the daily rosary row above (screenshot).
- `tsc --noEmit` clean after each change.

## Git state at handoff
On `main`. **Pushed by JC** through the ACTS-174 filing (`0e71933`). **Committed but NOT yet
pushed** (this env has no git creds; fetch confirmed origin is behind): `dac4456`
(ACTS-174 impl), `0d23ee0` (ACTS-174 done docs), `b3db122` (board rows for 172/173/174).
→ **JC: `git push origin main`.** All changes ride the unpublished **v41** seed — **publish
from `main`** (Lovable, manual) when ready. Unrelated pre-existing working-tree changes
(invite.html, about.tsx, ACTS-162.md, supabase/migrations/0003_feedback.sql) left untouched.

## Parked / next
- **JC follow-ups on ACTS-172:** fill the 4 Glorious prose reflections + swap the 15 USCCB
  placeholders for the parish's own Scripture (`materDeiGloriousBodies` + the loop in
  `seed.ts`).
- **ACTS-171** stayed the scoped Vessels quick-add; the "Send to Oravia" Phase B (Web Share
  Target + iOS Shortcut) and Phase C (photo storage) remain deferred, not filed.
- **v41 resets testers' local data** (no migration) — expected; publish is the moment it takes
  effect for installs.

## Next session — opener (paste to start)
> Continue Oravia. Last session (2026-09-08) closed ACTS-172 (Mater Dei devotion + mystery
> body + blank-step fix), ACTS-173 (daily Open Prayer on Home + endless-daily catch-up), and
> ACTS-174 (Home upcoming-week inline with dates) — all Done, on the unpublished **v41** seed.
> First: confirm `git push origin main` landed `dac4456`, `0d23ee0`, `b3db122` (I had no push
> creds), and that JC published v41 from `main`. Likely next: JC filling the Mater Dei prose /
> swapping the 15 USCCB placeholders in `seed.ts`, and any polish on the Home upcoming list
> (horizon-as-setting, a Today/Upcoming divider). Dev preview is port 8080; a `STORAGE_KEY`
> change needs the current key cleared to re-seed.
