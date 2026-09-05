# Session — first-launch onboarding (ACTS-153) + completing the story ledger

**Date:** 2026-09-04 (evening) · **Stories touched:** ACTS-153 (filed → Done),
ACTS-154 (filed) · **Non-story:** `docs/JIRA-BACKLOG.md` back-fill

---

## What happened (in order)

### 1. Filed ACTS-153 — first-launch onboarding
JC asked for two questions on first launch: which Bible app (default NIV, changeable
later) and whether the daily rosary is prayed in-app or in another app like Hallow.

Both settings **already existed and worked** — `bible_app_id` / `bible_translation`
(`src/lib/bible/apps.ts`) and the `daily_rosary_*` trio (`src/lib/prayer/apps.ts`,
shipped in **ACTS-133**). So the story was scoped to the *asking*, not new capability.
Pointer + board row + counter → 153, commit `e1e4140`.

### 2. Back-filled the whole numbered ledger (non-story)
Flagged that `docs/JIRA-BACKLOG.md` had no rows for ACTS-148–152. JC asked for the
back-fill; a proper audit then showed the gap was **much larger than first reported** —
the initial check used a bare `grep "ACTS-NN"`, which matches ids sitting inside *other*
rows' "Relates" text, so eight stories looked present when they had no row.

**29 rows added** across two commits (`c7a0fde`, `9f1d3e9`): 93–97, 99–101, 106–107,
119–128, 133, 135–142, 148–153 — each with its delivering commits and handoff linked.
Also sorted the open table numerically (134 and 146 had drifted) and corrected two stale
"`.counter` is 92 / next is ACTS-93" notes. **Every story with a pointer file now has a
ledger row.** JC pushed those three commits mid-session.

### 3. Built ACTS-153
Started the story, and JC settled two decisions that changed the build:

1. **Everyone is asked once** — current testers included, not just brand-new installs.
   That rules out inferring "already asked" from existing data, so completion had to be a
   real field: `settings.onboarding_completed_at`, written on finish **and** on skip
   (skipping deliberately writes no preference, so an absent `bible_app_id` means both
   "skipped" and "never asked"). Additive → **no `STORAGE_KEY` bump**, still v39.
2. **`DEFAULT_TRANSLATION` NIV → NABRE.** Raised as a domain concern rather than taken as
   given: Oravia is Catholic, NIV omits the deuterocanon, and the USCCB daily readings the
   Word page already links to *are* the NABRE — the old default disagreed with the app's
   own readings. ⚠️ Reaches past onboarding: anyone who never picked a translation now
   resolves to NABRE. Committed separately (`ea441e2`) so it can be reverted alone.

Shipped: `src/lib/prayer/onboarding.ts` (pure), `src/components/onboarding.tsx`, and
`src/components/gate-shell.tsx` — the arrival frame extracted out of `beta-gate.tsx`,
which stays about *access* while onboarding owns *preferences*.

**Copy:** the ACTS-144 brand-voice lines parked "for hero/onboarding" are finally placed —
the search/seek split in Q1's blurb, and **"Keep your seeking for God."** under the final
**Begin** button. JC then asked for two edits: Q2 reads *"How would you **like to** pray
your daily rosary?"*, and picking an external app warns *"You may need to sign in to
Hallow the first time — Oravia opens the app, it doesn't sign you in."*

### 4. The bug the browser found
Both steps render the same shapes (`GateShell → form → div → Select`). As two branches of
one component, React **reconciled instead of remounting**: the Radix `Select` carried over
from the Bible step with a stale item collection and an **empty value**. Visibly the
dropdown was blank; invisibly, pressing **Begin** wrote `daily_rosary_mode: "external"`
with a blank `daily_rosary_app_id` — the opposite of the "In this app" on screen, and a
state that would have sent the Daily Rosary row to Hallow's home page.

Fix: **each step is its own component** (`BibleStep` / `RosaryStep`), forcing the
unmount/mount. Generalizable: any wizard that swaps same-shaped steps in place is exposed
to this.

### 5. Closed ACTS-153, filed ACTS-154
JC raised a Home-card confusion: **"Online Bible"** renders *inside* the Daily Readings
block, smaller and beneath it, so it reads as a child of the readings when it's really a
permanent link to the reader's own Bible. JC floated renaming the section **Word → Bible**;
recommended against it and JC agreed — the card also holds the **Mass capture** (church,
celebrant, homily) and **reading programs**, so naming the container after one of its
contents would misfile the rest (the **ACTS-152** `Amphora` reasoning), and "Word" carries
the Liturgy-of-the-Word sense. Keep the label "Online Bible" too; the fix is placement and
weight. Filed as **ACTS-154**, counter → 154.

---

## Verified (and how)
- **Unit** — Node `--experimental-strip-types` harness against the real module (the
  ACTS-135 pattern; no runner yet, harness = ACTS-92): `onboarding.ts` **11/11**,
  including "an existing tester with answers but no stamp *is* asked".
- **Browser** (dev server, four paths + guest): answer both → NABRE +
  `daily_rosary_mode: "app"` + stamp, lands on Home; reload → not asked again and
  `/settings` shows all three; skip both → **only** the stamp written, effective defaults
  still YouVersion · NABRE · In this app; choose Hallow → `external` + `hallow`, and Home's
  row becomes "DAILY ROSARY — Opens in Hallow" with a real link; `/follow` with no stamp →
  guest view, onboarding never appears, stamp stays unwritten.
- `tsc --noEmit` clean throughout; no console errors.
- **Ledger** — verified no missing rows, no duplicates, 8 columns each, and the open table
  running 76 → 154 unbroken.
- ⚠️ **Not verified:** the two late copy edits (Q2 heading + sign-in reminder). They
  typecheck, but the dev server was stopped before they could be re-checked. **JC is
  verifying.**

## Git state at handoff
**Committed, NOT pushed** — `d926b94` (flow), `ea441e2` (NABRE default), `ceed2e6` (story
docs), `28d67cb` (close-out + ACTS-154). `git push origin main` fails with
`could not read Username for 'https://github.com'` — the recurring env git-auth issue.
**JC must push from their own client.** (Earlier in the session JC successfully pushed
`e1e4140`, `c7a0fde`, `9f1d3e9`.) `.env` is modified and deliberately untouched.

## Parked / next
- **ACTS-154** — the Online Bible placement, To Do with its decisions already recorded.
  ⚠️ Don't add a second `BookOpen` to a header that already has one; `WordSection` is
  shared, so Home and `/word` change together.
- **Optional follow-up:** the same sign-in reminder in **Settings**, where an external
  rosary app can also be chosen — onboarding warns, Settings doesn't.
- **Ledger gaps are closed**, but the maintenance habit is what let them open: the board
  and pointers were kept current while `docs/JIRA-BACKLOG.md` silently fell behind.

---

## Next session — opener (paste to start)

> `/start ACTS-154` — move the **"Online Bible"** link out of the Daily Readings block in
> `src/components/home/WordSection.tsx` and onto the Word card header, via `SectionCard`'s
> `actions` slot. Already decided (don't relitigate): the section keeps the name **Word**,
> the link keeps the label **"Online Bible"**, and the header must **not** gain a second
> `BookOpen` — it already has one for "open the full Word page". Keep the existing
> conditional so the link disappears when `resolveBibleHomeUrl` returns "". `WordSection`
> is shared, so check Home **and** `/word` (which has an `AppShell` heading, not a
> `SectionCard`). Presentation only — no `STORAGE_KEY` bump.
>
> Before anything else: **is `main` pushed?** Four commits from the ACTS-153 session
> (`d926b94`, `ea441e2`, `ceed2e6`, `28d67cb`) were committed but blocked by the env git
> auth failure. And confirm ACTS-153's two late copy edits look right in the browser —
> the Q2 heading ("How would you like to pray your daily rosary?") and the sign-in
> reminder shown when an external app is picked.
