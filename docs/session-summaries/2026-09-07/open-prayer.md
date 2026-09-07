# 2026-09-07 — Open Prayer, start to Done

One story, opened and closed in a single sitting: **ACTS-108 — Open Prayer**, the
free-form "pray in your own words" component. Plus one pre-existing privacy bug found on
the way, and a small change to the reflection composer.

## What happened, in order

1. **"Did we work on the open prayers?"** — no. ACTS-108 had been filed on 2026-08-29 from
   the v8 gap review and never started: `sessions: 0`, no `open_prayer` kind in the code.
2. **`/start ACTS-108`** — dependency pre-flight clean (ACTS-102, ACTS-104 both Done);
   flagged the dirty tree as ACTS-162's work and left it alone all session.
3. **JC's clarifications reshaped the spec** before any code was written:
   - **Dictation is the keyboard's job.** The PRD's "Transcribe Open Prayer On/Off"
     assumed the app owned the audio. It doesn't — the phone keyboard already dictates and
     the user toggles it there. The requirement *inverted* into a constraint on our field:
     it must stay a real `<textarea>` that accepts dictated text. No app-side audio, no
     transcription service, no in-app toggle.
   - **An uncaptured prayer is still a completed prayer** — saved empty, marked complete,
     never pruned. (My first draft had this backwards, copying the empty-Reflection
     reaping; corrected before it reached code.)
   - **Offer the ACTS shape** to anyone unsure what to pray, and say plainly that the app
     is not the prayer.
   - **Seed it as a daily-startable devotion**, **never time it**, **let a lone open
     prayer finish its own session**, and **prefill the kept-prayer title** with the
     user's name.
4. **PRD patched directly** → `docs/ACTS-PRD.md` **v3.1**, with an *Amendments since v3*
   table at the top so the change survives the next `/prd-sync`. §23A/§23B/§31A/§32
   touched; §23A note now **[Shipped]**.
5. **Built the component** — the kind, the compiler expansion, the store mutations, the
   Prayer-Mode card, the builder entry, the seeded devotion (STORAGE_KEY v39 → v40).
6. **Found a pre-existing share leak (ACTS-94)** while designing for privacy:
   `toShareItem` copied the session item's `configuration` **wholesale**, so sharing a
   Lectio session you had journaled in published your written reflection to anyone with
   the link. Replaced with an allowlist of the keys the guest view renders.
7. **Iterated on JC's feedback** in the running app: keep-as-Personal-Prayer, the Prayer
   Library entry point ("shouldn't this be in Prayers?"), removing the time estimate in
   two places, the self-finishing session, "Prayed, not writing it down", the name prefill,
   and "Add title (optional)".
8. **Non-story:** widened the reflection composer's prompt to *"What's on your heart today?
   What did you learn?"*
9. **`/handoff`, then `/done`** — ACTS-108 closed with every AC met.

## Verified (and how)
No test runner yet (ACTS-92), so static checks plus hands-on in the running dev server:

- `tsc --noEmit` clean, `vite build` succeeds, eslint clean on changed files.
- **Uncaptured path**: one tap → step complete with `open_prayer: ""`, session stamped
  `completed_at`, landed home showing DONE.
- **Written path**: text persisted, badge SAVED, **`db.reflections.length === 0`** (the
  words stay off the journal), page stays so the keep offer survives.
- **Keep as prayer**: prefilled "Tester's "; saved a first-class prayer (type other, tag
  Personal, version "As prayed", **no `source_id`**) that opens at `/prayer/<id>`.
  Clearing the title falls back to the opening words — "optional" is honest.
- **Share stripping**: an item carrying `open_prayer`, `response` and `reflection_id`
  emits only `{ decade }`.
- **Not timed**: session header shows no duration; the scheduled row hides it even with a
  stale `duration_min`.
- No live console errors. (A batch of `displayName is not defined` errors sat in the
  buffer from a mid-edit HMR state; the component renders and handles clicks, so they are
  stale — worth a fresh look if they ever reappear after a hard reload.)

## Git state at handoff
**Committed; all but the last pushed.** `origin/main` at `c772db8` (JC pushed several
times during the session — this environment has no git credentials). Outstanding:

- `af7d6ee` — *docs: close ACTS-108 (Done)*

Untouched all session, belongs to **ACTS-162**: `public/invite.html`,
`src/routes/about.tsx`, `stories/ACTS-162.md`, untracked
`supabase/migrations/0003_feedback.sql`.

## Parked / next
1. **Push `af7d6ee`.**
2. **File the share-leak follow-up.** The allowlist stops new leaks, but follow-along links
   published *before* today still carry journaled reflections in their payload. Decide
   whether to invalidate them. Not folded into ACTS-108's close.
3. **ACTS-149 is unblocked** — it rides `open_prayer` (`spine: ACTS-108`) for the info
   button and the sequenced four-movement ACTS mode.
4. **ACTS-162** (Send feedback from the menu) is still In Progress with uncommitted work.
5. Open question JC may revisit: whether Open Prayer should stay in the **Devotions** list.
   Dropping `tpl-open-prayer` would cost the daily-start path, so it stays for now.

## Next session — opener (paste to start)

> Last session shipped **ACTS-108 (Open Prayer)** end to end and closed it — the
> `open_prayer` kind, a seeded `tpl-open-prayer` devotion, a "Pray now" card in the Prayers
> tab, keep-as-Personal-Prayer, and a PRD amendment (v3.1) recording that dictation is the
> device keyboard's job, not ours. Final handoff: `stories/ACTS-108/session-01.md`.
>
> Two things want attention. First, **one unpushed commit** (`af7d6ee`, the ACTS-108
> close) — push from a git client. Second, a **privacy follow-up worth its own story**:
> `toShareItem` used to copy a session item's whole `configuration` into a follow-along
> link, which published journaled reflections; that is fixed going forward, but links
> shared before 2026-09-07 still carry the old payload — decide whether to invalidate them.
>
> **ACTS-162** (Send feedback from the menu) is In Progress with uncommitted work in the
> tree (`public/invite.html`, `src/routes/about.tsx`, `stories/ACTS-162.md`, and an
> untracked `supabase/migrations/0003_feedback.sql`). **ACTS-149** is now unblocked and
> rides the new `open_prayer` kind.
>
> Start with `/stories` to see the board, or `/start ACTS-162` to resume the feedback work.
