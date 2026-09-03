---
story: ACTS-136
session: 01
wrapped_at: 2026-09-03T00:00:00-0700
status: Done
final: true
---

## What happened
Fixed the reflection composer's lost-work bug and the generic daily-readings tag,
unified the two composers' source picker, and folded in two Home-Vessels fixes found
during the reflect-entry-point audit. All acceptance criteria met and browser-verified.

**Item 1 — one shared, persisted draft.** New
[`reflectionDraft.ts`](../../src/lib/prayer/reflectionDraft.ts): a versioned
localStorage buffer (`prayer-companion-reflection-draft-v1`) holding
`{title, body, mode, themes, linked[], manualLinks[]}`. Both `ReflectionComposer`
instances load it post-mount (behind a `hydrated` **state** gate so the empty SSR/first
commit can't clobber it), persist on change, and clear on Save + a new explicit
**Discard** control. Deliberately kept **out of `Database`** so it never leaks into share
links / exports and needs no `STORAGE_KEY` bump.

**Item 3 — daily readings → liturgical day.** Home + `/reflections` label the daily-
readings linkable with `getLiturgicalDay(today).title` (computed client-side, like
WordSection, to dodge an SSR hydration mismatch) instead of the generic "Daily Readings";
snapshotted onto the saved link.

**Item 5 — source parity.** New shared builder
[`linkables.ts`](../../src/lib/prayer/linkables.ts) `buildReflectionLinkables(db, …)`
feeds **both** pickers so they can't drift: pinned daily devotion, every session (by
plan/title), plans not yet prayed, today's readings, the whole Knowledge library, and
captured Masses. Added `Mass → mass` to `GROUP_TARGET`.

**Item 2 — in-progress affordance.** `/reflections` composer shows a subtle
"Draft in progress — saved automatically" line when the shared draft has content
(opt-in `showDraftStatus`; Home stays clean).

**Item 4 — accumulation / entry-point behavior.** Resolved by the architecture, not a
flag: both composers now read/write **one** draft and build the picker from **one**
builder, so behavior is identical regardless of entry point. Chips still accumulate on
one sticky draft (kept as intended; cleared by Save/Discard).

**Folded-in Home Vessels fixes** (found during the entry-point audit):
- `pinnedLinks()` now sorts status-first (book/program/video/podcast owners above
  reference websites, A–Z within tier) — the ACTS-134 sort had only reached the
  `/formation` library + voice pages, never the Home pins path.
- Reflect icon added to Home Vessels **content** pins (JC decision: voices/websites
  aren't reflection subjects); prefills via the existing knowledge-item linkable.

## Verified (and how)
- **Browser** (Thu Sep 3): typed on Home → `/reflections` shows the draft (and reverse);
  Save persists the entry + clears the draft everywhere; Discard clears; daily-readings
  reflect prefilled "Saint Gregory the Great…" (not generic). Both pickers rendered the
  identical comprehensive set; captured a Mass → new **Mass** group → link resolved to a
  Mass card. Vessels card reordered (book on top); reflect icon on the book only, prefill
  → clean chip. In-progress indicator showed on Reflect only, not Home.
- `tsc --noEmit` clean; eslint clean; no console errors / hydration warnings.
- Tests: documented as planned (harness = ACTS-92); no runner yet.

## Git state at handoff
Committed to local `main`. `origin/main` is at `3a8d400` (pushed). **Unpushed (git auth
not configured here — `could not read Username for github.com`):** `6c67519`
(Vessels sort + reflect icon), `535c05c` (item 2). Earlier ACTS-136 commits already up:
`a1125cc`, `cdd5fd6`, `3a8d400`. **User must push from their own git client.** `.env`
intentionally left uncommitted (beta-gate config, unrelated).

## Next
- Push local `main` (auth).
- **Follow-up filed → ACTS-137:** Home pinning is link-only. "Pin to Home" lives on each
  content **link** (`toggleContentLinkFavorite(itemId, index)`), so an item with no
  favorited URL can't reach Home Vessels. Need an **item-level** pin so a book/program is
  pinnable without a URL. (JC, 2026-09-03.)
