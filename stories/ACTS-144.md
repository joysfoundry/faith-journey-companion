---
id: ACTS-144
title: Rebrand name ACTS → Oravia
spine: ACTS-144
status: In Progress
origin: human-typed
depends_on: []
relates_to: [ACTS-86, ACTS-143, ACTS-90, ACTS-101, ACTS-148, ACTS-149]
started_at: 2026-09-03T23:42:36-0700
updated:    2026-09-04T11:24:18-0700
latest_handoff: stories/ACTS-144/session-01.md
sessions: 1
---

## Goal
As the product owner, I want the app's **name** changed from **ACTS** to **Oravia** across
every user-facing surface, so the product reads as a trustworthy, contemplative Catholic
prayer companion. ("MyOravia" is a website/domain-layer handle only — not the app wordmark.)

> **Scope note.** This story is the **name track only**. The Marian **palette / design system**
> was split into **[ACTS-148](ACTS-148.md)** (mocked in Claude Design first). The two ship
> independently — the name is not blocked on the palette. This is the inverse of **ACTS-101**
> (which rebranded "Faith Journey" → "ACTS").

## Decisions (locked with JC — 2026-09-04)
- **Core brand (the app name) = Oravia** — inspired by *ora* ("pray") + *via* ("the way"). One
  elegant word, **not** "OraVia" (which exposes the seams / reads like a travel brand).
  Pronounced **or-AH-vee-ah**. **The in-app wordmark reads "Oravia"** (not "MyOravia").
  No US trademark.
- **"MyOravia" is website/domain layer only**, not the app wordmark — a candidate handle for the
  Lovable-hosted site. Domain status (2026-09-04): `oravia.lovable.app` **taken**; `oravia.com`
  **maybe for sale**; `myoravia.com` **erroring (Cloudflare 1001)**. Domain/site naming is a
  separate concern from the app rename in this story; don't put "MyOravia" in the UI.
- **Primary tagline (wordmark + gate + PWA name):** **"Your devotional life, gathered."**
  Chosen for honesty of scope + register: "gathered" describes what the app actually does today
  (a place to bring your materials together — no AI-synthesis claim, unlike "connected"), and
  "devotional life" names the real slice (prayer, readings, devotions, novenas) without claiming
  the whole "Catholic life" (no sacraments/Mass). *Earlier candidate "Your Catholic life,
  connected." retired for over-claiming on both counts.* Sentence case, comma form.

## Brand voice / tagline system (in progress — larger surfaces)
The short line above is the app-chrome tagline. Longer, more emotional lines are being developed
for the **gate splash / Lovable hero / onboarding / About** (room to breathe there):
- **Blessing / hero:** *"God is weaving something beautiful through your life."* — says "thread"
  without saying it; grounded in Eph 2:10 (*we are God's handiwork*) + Ps 139:13 (*knit me
  together*). Use standalone; do **not** bolt "sacred thread" onto it. **PLACED** as the centered
  opening blessing on the About page (above the existing epigraph).
- **Value + turn (the core pitch):** the app spares you the *mundane searching* for your
  materials so your *seeking* is for God — split the two words on purpose (search = your stuff,
  seek = God). Grounded in Mt 7:7 / Mt 6:33 / Jer 29:13. Draft: *"Your prayers and resources,
  gathered — so you can keep your seeking for God."*
- **Signature sign-off:** *"Keep your seeking for God."* **PLACED** as the closing benediction at
  the foot of the About page (also a candidate for under a Begin button / end of onboarding).
- **Interior motif:** *"Follow the sacred thread."* (journal / insights language — keep it
  interior, given the cross-faith association of "sacred thread" as a front-door term).
The weaving blessing + seek sign-off are now **placed on the About page**; the value line and
"Follow the sacred thread" remain captured for the design/marketing work (gate splash / Lovable
hero / onboarding / journal), not yet placed.
- **Recurring brand idea (not a fixed subtitle):** **"Follow the sacred thread"** — language that
  recurs through the experience (onboarding "Begin your sacred thread," journal "Add this
  reflection to your sacred thread," insights "A pattern is emerging in your sacred thread").
  *Do not hard-wire it as the wordmark subtitle; the tagline above is the lockup line.*
- **Brand mark idea:** a **continuous-thread "O"** / **"Guiding Flame"** (an open gold line forms
  the O and rises into a flame; a path curves inside). Asset work rides with **ACTS-148**.
- **ACTS acronym — KEPT, repurposed.** JC loves ACTS (Adoration · Contrition · Thanksgiving ·
  Supplication). It is **retired as the app name** but **survives as a prayer teaching aid** —
  direction: an **info button on prayer** that reminds the user of the four components. That
  small feature is a **follow-on** (see below), not part of this name sweep. It no longer lives
  in the wordmark/tagline.
- **Scope of sweep: user-facing only.** Internal `ACTS-` story-id prefix, repo name, docs
  filenames, and `STORAGE_KEY` **stay as-is** (internal code) — **no `STORAGE_KEY` bump**.

## Scope — user-facing name surfaces to change
- Wordmark [`Brand.tsx`](../src/components/layout/Brand.tsx) — currently spells the ACTS acronym
  in its tagline (from ACTS-101). Replace with the **Oravia** wordmark + "Your Catholic life,
  connected." Remove the acronym-as-tagline treatment.
- Beta gate title ("ACTS") + subtitle (see beta-gate-setup).
- [`index.html`](../index.html) `<title>` / meta description.
- [`public/manifest.webmanifest`](../public/manifest.webmanifest) — `name`, `short_name`
  (`theme_color` / icons → coordinate with ACTS-148, but the string rename lands here).
- Any other user-facing copy that names the app (About page, ACTS-143, already anticipates this).

## Out of scope (this story)
- Palette / tokens / design system → **[ACTS-148](ACTS-148.md)**.
- Favicon / app-icon **art** → ACTS-148 (string/name changes here; art there).
- The **ACTS-prayer-components info button** → **new follow-on** (file when starting it).
- Internal `ACTS-` prefix / repo / docs / `STORAGE_KEY` rename → explicitly **not** done.

## Acceptance criteria
- [x] Decisions recorded: Oravia is the app name (MyOravia = website/domain layer only) + tagline;
      ACTS retired-as-name but kept as a prayer teaching concept; sweep is user-facing only, no
      `STORAGE_KEY` bump.
- [x] Every user-facing "ACTS" **app-name** surface reads "Oravia" (wordmark, beta gate, route
      titles/meta, manifest name/short_name, About) — grep-confirmed no stray app-name "ACTS".
- [x] The ACTS **acronym** no longer appears as the product name; preserved as a prayer feature
      via the follow-on **[ACTS-149](ACTS-149.md)** (info button + open-prayer mode).
- [x] Wordmark shows "Oravia" + "Your Catholic life, connected." — browser-verified (light; app
      is light-only today, dark theme deferred to ACTS-148).
- [x] No `STORAGE_KEY` change (cosmetic/brand only).

## Tests
_Planned — no runner wired yet (harness = ACTS-92); see
[`docs/E2E-TEST-PLAN.md`](../docs/E2E-TEST-PLAN.md). Convention ACTS-91._
- **Unit** (Vitest): if the name is data-driven, assert the wordmark constant = "Oravia"/"MyOravia"
  and no hard-coded "ACTS" app-name remains; else N/A (copy).
- **Integration** (Testing Library): Brand/wordmark renders the new name + tagline; About shows it.
- **E2E** (Playwright): app title/wordmark reads "Oravia"; smoke that no user-facing app-name
  "ACTS" remains on Home + a prayer session.
