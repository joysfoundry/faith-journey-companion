---
story: ACTS-143
session: 01
wrapped_at: 2026-09-04T10:39:26-0700
status: Done
final: true
---

## What happened
Shipped the **About** page as a route. Added an `About` entry (Info icon) to
`secondaryNavLinks` ([`nav-links.ts`](../../src/components/layout/nav-links.ts)) — it renders
in both the desktop side rail and the mobile drawer (below Settings) via `NavSections`. Created
[`/about`](../../src/routes/about.tsx) (AppShell), with copy drawn from the vision PRD
(`docs/ACTS-PRD.md`, v3.1 export) and iterated with JC on framing:

- **Epigraph** — "A daily place where prayer, Scripture, learning, reflection, and lived
  experience become part of a meaningful record…".
- **The vision** (high level) — the whole faith journey; *"How am I becoming the person God is
  calling me to be…"*; Scripture + tradition as the focus; the AI/discernment boundary (never
  claims to know God's will — you discern the meaning).
- **More than a prayer app** — faith learning → reflection → insights → wisdom.
- **One place for your journey** (the narrow: the scattered-content problem) — gather scattered
  paper/digital resources into a guided flow; **a hub, not a walled garden** that links out to
  how you already pray (Hallow, Bible in a Year, catechism), holds journaling, and gathers the
  resources that inspire your learning. (Dropped the "effort hurts most" line per JC.)
- **Why a beta** + **Everything stays with you** (local-only; links to Settings → Start over).

App name is "ACTS" inline for now; it'll be swept by the Oravia rebrand (**ACTS-144**).

## Verified (and how)
Browser-verified in the dev preview: `/about` renders on **desktop** and **mobile** (375px);
the **About** link appears in the side rail (active state) and in the mobile Menu drawer's
secondary section. `read_console_messages` clean (no errors); `npx tsc --noEmit` clean.

## Acceptance criteria — all met
- [x] About entry in the menu (side rail + mobile drawer).
- [x] Opens a surface describing what the app is, the vision, why it's a beta, and that all
  data stays local (no account/server today).
- [x] Copy is warm, brief, accurate to the current local-only reality.
- [x] Reachable on mobile + desktop; matches the app's visual style.
- Decision: built as a **route** (not a dialog), per JC.

## Git state at handoff
Committed **and pushed** (JC pushed from their client after an env auth failure here):
- `e29cf9c` — `ACTS-143: add About page (route + menu entry)` (code)
- `346831f` — `docs: ACTS-143 → In Progress; file ACTS-146 (…)`
Working tree clean except `.env` (local env, intentionally uncommitted).

## Next
None for ACTS-143 (Done). Copy will be revisited only as part of the **Oravia rebrand
(ACTS-144)** name sweep. Tests remain planned (harness = ACTS-92).
