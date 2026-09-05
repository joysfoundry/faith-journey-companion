---
story: ACTS-161
session: 01
wrapped_at: 2026-09-05T15:16:41-0700
status: Done
final: true
---

## What happened
Filed and closed in one sitting. "Remove the gate for now" turned out to need almost no
code, because the passcode step was **already conditional**: `beta-gate.tsx` reads
`VITE_BETA_PASSCODE` at build time and skips step 1 entirely when it is empty — which is
how we run locally every day. So the stand-down is one empty field in Lovable's env, and
the work here was making that field legible rather than writing anything new.

**Decisions (JC):**
- **Unarm now, delete with real accounts.** The passcode branch stays in the component;
  it comes out as part of ACTS-82/87/88, when accounts make it genuinely dead. Standing
  down is a pause, and keeping the branch is exactly what made it reversible in one field
  rather than a rewrite.
- **The name prompt stays.** It personalises greetings and the export header, it is one
  field, and it turns nobody away — it was never the gate. The scope checkbox in the
  pointer is answered *no*.

**Shipped** — two notes, placed where someone would actually land:
- `.env.example` — the blank value is a **decision, not an accident**; don't "fix" it by
  setting a code; and **your own `.env` is separate**, so a local code keeps prompting on
  the dev server long after production stopped asking.
- `src/components/beta-gate.tsx` — a `STATUS` block: the branch below is kept **on
  purpose**, delete it with ACTS-82/87/88 "and not before."

Commits `bdae185` (code notes) + `908a3ac` (story docs).

## Verified (and how)
Locally, against a dev server run with `VITE_BETA_PASSCODE` blanked, storage cleared before
each run. **`.env` was restored byte-identical afterwards** (md5 `ad58d06652e7a6686eae28bcc21b607e`).

- **No gate.** First screen is the name prompt; no "Access code" field anywhere in the
  accessibility tree.
- **Full first run.** Name → Bible app (YouVersion + NABRE) → daily rosary → Today, with
  `display_name` and `onboarding_completed_at` both stamped.
- **The unlock flag is never touched.** After a complete first run localStorage held only
  `prayer-companion-db-v39` — `acts-beta-unlocked-v1` was neither written nor read. So a
  stale flag on a tester's browser is **inert**; there is nothing to clean up. Stronger
  than the acceptance criterion assumed.
- **`/follow/*` unaffected.** A cleared browser at a bogus slug gets the share view's
  "This link isn't available", not the name prompt. The ACTS-94 exemption never depended
  on the gate being armed.
- **`/invite.html`** still serves ungated.
- **Re-arming works.** Restored the value, restarted, cleared storage → the code field came
  straight back. Not in the original criteria, but it is the claim the whole route rests
  on, so it was tested rather than asserted.

**Worth carrying forward:** an armed gate costs a **blank frame**. `BetaGate` holds on
`<Splash />` while `passcodeArmed && !checkedStorage`, so an armed first load paints blank
until localStorage is read; unarmed, that condition is false and the hold disappears.
Standing down makes first paint *faster*, not merely shorter.

Note the preview browser's localStorage was cleared several times during this, so the dev
app there has re-seeded. That is the in-app browser, not a device with real data.

## Git state at handoff
**Committed and pushed.** `bdae185` + `908a3ac` + `1ae212e` (this close) — the in-sandbox
push failed on the usual git-auth error and **JC pushed from their own client**, confirmed
2026-09-05: `origin/main` == `1ae212e`, nothing ahead.

## Next
**The one thing left is JC's, and it is the actual stand-down:** clear
`VITE_BETA_PASSCODE` in Lovable's env and redeploy. Everything committed here only
*explains* that field. The last acceptance box — "a visitor with no code lands on the app
**on the deployed host**" — stays open until then; the story is closed on the strength of
the local run, deliberately, because the remaining step is a dashboard action rather than
work.

Two follow-throughs the story recorded, neither blocking:
- The **tester reset guide** (private artifact) tells testers a full browser-data reset
  will re-ask for the code. Once production is unarmed that line is wrong — harmlessly,
  but it is the only tester-facing document that mentions the code, so check it before
  sending the guide again.
- The local `.env` still carries the test code `acts2026`, by design. Clearing it locally
  is how you see what a tester now sees.

Sibling stories filed alongside this one and still open: **ACTS-162** (send feedback from
the menu) and **ACTS-163** (guided tour).
