---
story: ACTS-144
session: 01
wrapped_at: 2026-09-04T11:24:18-0700
status: In Progress
final: false
---

## What happened
Decision session — no code yet. JC shared the naming exploration chat and the name landed:

- **Core brand / app name = Oravia** (*ora* "pray" + *via* "the way"), one word, **not**
  "OraVia"; pronounced **or-AH-vee-ah**. The in-app wordmark reads **"Oravia"**. No US trademark.
- **"MyOravia" = website/domain layer only** (Lovable site handle), **not** the app wordmark.
  Domain status: `oravia.lovable.app` taken; `oravia.com` maybe for sale; `myoravia.com` erroring
  (CF 1001). Domain choice is separate from this rename — don't put "MyOravia" in the UI.
- **Tagline = "Your Catholic life, connected."**
- **Recurring brand idea = "Follow the sacred thread"** (used in-experience, not as the fixed
  wordmark subtitle).
- **Brand mark** = continuous-thread "O" / "Guiding Flame" concept (asset work → ACTS-148).
- **ACTS acronym KEPT but repurposed:** retired as the app name, survives as a **prayer
  teaching aid** — JC's idea: an **info button** reminding users of Adoration · Contrition ·
  Thanksgiving · Supplication. That's a **follow-on feature**, not part of the name sweep.

Structural decisions:
- **Split the epic.** ACTS-144 is now the **name track only**. The **Marian palette / design
  system** became **ACTS-148** (to be mocked in Claude Design first, then translated to
  `styles.css` oklch tokens). Counter bumped 147 → 148.
- **Sweep is user-facing only** — internal `ACTS-` story prefix, repo, docs, and `STORAGE_KEY`
  stay as internal code; **no `STORAGE_KEY` bump**.
- Rewrote the ACTS-144 pointer to record all of the above; recorded the palette in ACTS-148.
- Filed **ACTS-149** — the ACTS guided prayer framework (info button + open-prayer mode, on
  ACTS-108), so the ACTS acronym is honored as a prayer feature, not the name. Counter → 149.

**Then executed the name sweep (user-facing only):**
- Wordmark [`Brand.tsx`](../../src/components/layout/Brand.tsx) — now renders **"Oravia"** +
  tagline **"Your devotional life, gathered."** (dropped the ACTS_WORDS acronym spell-out); same
  `{onClick, tagline}` API so call sites are untouched.
- Beta gate [`beta-gate.tsx`](../../src/components/beta-gate.tsx) — GateShell h1 → "Oravia",
  subtitle → the tagline. `UNLOCK_KEY` left as `acts-beta-unlocked-v1` (internal; changing it
  would log every tester out).
- Page titles / meta: [`__root.tsx`](../../src/routes/__root.tsx) (bare "ACTS" ×3 → "Oravia"),
  [`index.tsx`](../../src/routes/index.tsx) ("Oravia — Your daily prayer companion"), and all
  `"<Page> — ACTS"` route titles + `og:title` swept to `— Oravia` (sed, ~18 files).
- [`about.tsx`](../../src/routes/about.tsx) body copy (3 inline "ACTS" → "Oravia") + head desc.
- [`FollowAlongView.tsx`](../../src/components/prayer/FollowAlongView.tsx) "Shared from Oravia".
- [`manifest.webmanifest`](../../public/manifest.webmanifest) name → "Oravia — Your devotional
  life, gathered", short_name → "Oravia" (`theme_color`/icons left for ACTS-148).
- **No `STORAGE_KEY` bump** (cosmetic). Internal `ACTS-` story prefix / repo / docs untouched.

**Tagline explored + decided with JC.** Worked through several candidates and landed the
app-chrome tagline on **"Your devotional life, gathered."** — rejecting "Your Catholic life,
connected." because *connected* over-claims AI synthesis the app doesn't do yet, and *Catholic
life* over-claims scope (no sacraments). Also developed a wider **brand voice** for larger
surfaces (blessing/hero *"God is weaving something beautiful through your life."*; the
search-vs-seek value line; signature *"Keep your seeking for God."*) — see the pointer's "Brand
voice / tagline system" section.

**About page — brand blessings placed.** Added the weaving line *"God is weaving something
beautiful through your life."* as a centered opening blessing above the existing epigraph, and
*"Keep your seeking for God."* as a closing benediction at the foot of
[`about.tsx`](../../src/routes/about.tsx). Also warmed the epigraph — "become part of a meaningful
**record** of how I am trying to live my faith" → "become meaningful **woven threads** of how I
am trying to live my faith" (JC: "record" read too clinical; "woven threads" echoes the weaving
blessing right above). Left the rest of the body copy (already Oravia-named + honest) and the
expansive "the whole of your faith journey" line as-is per JC. Both render well (browser-
verified); `tsc` clean.

## Verified (and how)
- `grep` confirms **zero** user-facing app-name "ACTS" left in `src`/`public` (only `ACTS-<num>`
  story ids + the internal `acts-beta-unlocked` key remain). **`npx tsc --noEmit` clean.**
- Browser (own dev server, light theme): beta gate shows "Oravia" + tagline; passcode → name →
  app shell wordmark reads **"Oravia · YOUR CATHOLIC LIFE, CONNECTED."**; `/about` copy reads
  Oravia throughout; tab titles "Oravia — Your daily prayer companion" / "About — Oravia".
- **Dark mode:** the app currently renders **light-only** (no dark theme yet — that's ACTS-148),
  so there's no separate dark wordmark to verify; checked under `prefers-color-scheme: dark` and
  the app stays light as expected.

## Git state at handoff
Pending — code sweep + story docs written, **not committed**. Commit via `/save`. (`.claude/launch.json`
was temporarily repointed to a free port during verification, then reverted — no net change.)

## Next
`/save` the sweep. Remaining brand work is out of this story: **ACTS-148** (Marian palette +
dark theme + brand-mark art / favicon / `theme_color`) and **ACTS-149** (ACTS prayer framework).
Optional polish here: revisit the display face for the "Oravia" wordmark once the design system
lands. **ACTS-147** (PRD v3→v4) is gated on this rebrand being locked.
