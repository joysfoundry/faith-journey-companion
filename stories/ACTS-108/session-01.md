---
story: ACTS-108
session: 01
wrapped_at: 2026-09-07T15:52:15-0700
---

# ACTS-108 — session-01

**Status: In Progress** — every acceptance criterion is met and verified in the browser;
left open only because JC may still want copy/placement tweaks. Nothing is blocked.

## What happened

Built **Open Prayer**: a first-class session component for praying in your own words,
where capturing the words is an offer rather than a toll.

### The clarifications that shaped it (all JC, this session)
1. **Dictation is the keyboard's job.** The old PRD requirement ("Transcribe Open Prayer
   On/Off") assumed the app owned the audio. It doesn't — the phone keyboard already
   dictates, and the user toggles it there. The requirement inverted into a *constraint on
   our field*: it must stay a real `<textarea>` that accepts dictated input. No app-side
   audio, no transcription service, no in-app toggle.
2. **An uncaptured prayer is still a completed prayer** — saved with an empty body and a
   complete status, never pruned, never counted unfinished. Deliberately *unlike* the
   empty-Reflection reaping (ACTS-138–141). I had it backwards in my first draft.
3. **Offer the ACTS shape** to anyone unsure what to pray, and say plainly that the app
   isn't the prayer: *"You can always talk and pray to God without this app, and without
   keeping any record."*
4. **Seed it as a daily-startable devotion.**
5. **Never timed** — free-form prayer takes as long as it takes.
6. **A lone open prayer finishes its own session** — "Prayed, not writing it down" next to
   a footer "Finish" read as two ways to end the same thing.
7. **Prefill the kept-prayer title** with the user's own name ("Joy's …").

### What shipped
| Area | File |
| :---- | :---- |
| `open_prayer` kind, both unions | `src/lib/prayer/types.ts` |
| Compiles to one step; counts toward progress; **excluded from `estimateMinutes`** | `src/lib/prayer/compiler.ts` |
| `saveSessionOpenPrayer` (completes even when empty), `reopenSessionOpenPrayer`, `saveOpenPrayerAsPrayer`, `startOpenPrayer` | `src/lib/prayer/store.ts` |
| `OpenPrayerCard` — ACTS header, field, helper text, "Prayed, not writing it down" / "Save" / "Re-open", keep-as-prayer with name prefill, self-finishing when it is the only step | `src/routes/session.$sessionId.tsx` |
| Read-only rendering (Prayer Mode + guest follow) | `src/components/prayer/ItemView.tsx` |
| Add-menu entry, defaults, prompt field, builder tip | `src/components/prayer/DevotionItemsEditor.tsx` |
| Seeded **Open Prayer** devotion (`tpl-open-prayer`); STORAGE_KEY v39 → v40 | `src/lib/prayer/seed.ts` |
| "Pray now" entry at the top of the **Prayers** tab | `src/routes/prayers.tsx` |
| Untimed plan rows show no duration | `src/routes/pray.tsx` |
| **Share privacy fix** — `configuration` allowlist | `src/lib/prayer/share.ts` |
| Reflection composer prompt widened ("…What did you learn?") | `src/components/home/ReflectionComposer.tsx` |

**Three surfaces, three roles:** Prayers tab = "I just want to talk to God"; Devotions =
schedulable / daily start; builder component = room inside a longer devotion. It is
deliberately **not** a Prayer record — a Prayer is a wording, and an open prayer has none
until it is prayed.

**The words live on the session item** (`configuration.open_prayer`), not in the
reflections journal: speech *to* God, not a journal entry about it.

### Bug found in passing (pre-existing, ACTS-94)
`toShareItem` claimed to keep "nothing session-local" but copied `configuration`
**wholesale** — so sharing a Lectio session you had journaled in published your written
reflection to anyone with the follow-along link. Open Prayer would have leaked the same
way. Now an **allowlist** of the keys the guest view renders. ⚠️ **Links already shared
still carry the old payload** — worth its own story.

### Docs
`docs/ACTS-PRD.md` → **v3.1**, with an *Amendments since v3* table at the top so the
change survives the next `/prd-sync`. §23A/§23B/§31A/§32 patched; §23A note now **[Shipped]**.

## Verified (and how)
No test runner yet (ACTS-92), so by hand in the running app plus static checks:

- `tsc --noEmit` clean; `vite build` succeeds; eslint clean on changed files.
- **Uncaptured path**: "Prayed, not writing it down" → step complete, `open_prayer: ""`
  persisted, session stamped `completed_at`, navigated home showing DONE.
- **Written path**: text persisted, badge SAVED, `db.reflections.length === 0` (no journal
  entry created), page stays so the keep offer survives.
- **Keep as prayer**: title field prefilled "Tester's "; saved "Tester's night prayer" as a
  first-class prayer (type other, tag Personal, version "As prayed", **no source_id**),
  opens at `/prayer/<id>` with Pray now / Edit / favorite.
- **Share stripping**: `toShareItem` on an item carrying `open_prayer`, `response` and
  `reflection_id` emits only `{ decade }`.
- **No estimate**: session header shows "1 STEPS · IN ORDER"; the scheduled row shows no
  duration even with a stale `duration_min`.
- No console errors (the `displayName` errors seen mid-session were a stale HMR state
  between two edits; the page renders correctly, which it could not if it still threw).

## Git state at handoff
**Committed and pushed** — `origin/main` at `6a7ce8c`. Eleven commits, all prefixed
`ACTS-108:` except two `docs:` ones.

Untouched in the working tree (belongs to **ACTS-162**, not this story):
`public/invite.html`, `src/routes/about.tsx`, `stories/ACTS-162.md`, and untracked
`supabase/migrations/0003_feedback.sql`.

## Next
1. **JC's call on copy/placement** — the button label, the helper text, and whether Open
   Prayer should stay in the Devotions list at all (dropping `tpl-open-prayer` would cost
   the daily-start path).
2. **File the share-leak follow-up** — already-published follow links still carry
   journaled reflections in their payload; decide whether to invalidate them.
3. **ACTS-149** can now start: it rides this kind (`spine: ACTS-108`) for the info button
   and the sequenced four-movement ACTS mode.
4. Close ACTS-108 with `/done` once 1 is settled.
