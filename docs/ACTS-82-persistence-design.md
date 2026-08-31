# ACTS-82 — Persistence design: shared canon vs. per-user data

Decision note for **ACTS-82 (Enable Supabase persistence)**, the backend that also
unblocks auth (ACTS-87/88). It answers the one question that has to be settled
*before* any schema is written:

> When we move off localStorage, does every account get its **own copy** of the
> seeded prayers/devotions, or is there **one shared library** everyone reads?

Status: **DECIDED — Option C (2026-08-30).** Sign-off answers recorded under
[Resolved decisions](#resolved-decisions). Written against `main`; the source of
truth for entities is `src/lib/prayer/types.ts` (`Database` interface) and the
seed in `src/lib/prayer/seed.ts`.

**Decisions in one line:** curation must reach existing users (→ C, not A); users
**cannot edit canon in place** — only **fork/duplicate** (to an owned copy) or
**delete** (a per-user hide); shared/curated content (parish prayer of the week,
shared family library) is a planned future, which C reaches without a second
migration.

---

## TL;DR — recommendation

**Hybrid (Option C): a single shared, read-only canon + per-user data + a thin
per-user overlay for flags.**

- The **seeded library** (prayers, devotions, mysteries, litanies, vessels,
  how-tos) lives once, owned by no one, readable by all. Fixes and additions you
  make propagate to everyone automatically.
- Everything a person **creates or does** (sessions, reflections, intentions,
  plans, custom prayers/templates, settings) is owned by them and private.
- Per-user **flags on canon items** (favorites, "learning" status, mystery-body
  choice, **hidden/deleted**) move off the shared rows into small **overlay
  tables** keyed by `(user_id, item_id)`.
- Users **never mutate a canon row.** "Edit" = **fork** (copy-on-write to a
  private, user-owned copy). "Delete" = a **per-user hide** — the shared row is
  untouched; it just stops showing for that user.

This is more schema than "just copy everything per user," but it's the only model
where **your curation reaches existing users** and storage doesn't balloon. The
extra work is real and is called out under [Migration impact](#migration-impact).

---

## The core complication

The instinct is "some tables are shared, some are per-user." That's **not** how
this data splits. Most library tables today hold **both** seeded canon rows *and*
user-created rows, because the app already lets users add to the library:

| Entity (`Database` key) | Seeded canon? | User can create/edit? | How today |
|---|---|---|---|
| `sources` | ✅ | ✅ | `addSource`, `upsertSource` |
| `prayers` / `prayer_versions` | ✅ | ✅ | `upsertPrayer`, `addPrayerVariant` |
| `mystery_sets` / `mysteries` | ✅ | — | seed only |
| `mystery_contents` | ✅ | ✅ | `upsertMysteryContent` |
| `templates` / `template_items` (devotions) | ✅ | ✅ | `saveTemplate`, `duplicateTemplate` |
| `how_tos` | ✅ | ✅ | `saveHowTo` |
| `voices` (vessels) | ✅ | ✅ | `upsertVoice` |
| `knowledge_items` | ✅ | ✅ | `addKnowledgeItem` |
| `sessions` / `session_items` | — | ✅ | a prayer someone actually prayed |
| `session_plans` | — | ✅ | scheduled sessions |
| `intentions` | — | ✅ | prayer intentions |
| `reflections` | — | ✅ | **journal — sensitive** |
| `mass_experiences` | — | ✅ | Mass notes |
| `import_drafts` | — | ✅ | transient import staging |
| `settings` | — | ✅ | prefs + `display_name` (from the beta name prompt) |

So the discriminator is **the row's origin, not its table.** Seed rows have
stable, known IDs (`our-father`, `hail-mary`, `tpl-rosary`, `src-usccb`, …);
user rows get generated IDs. That single fact makes both the RLS model and the
beta-data migration tractable.

A second complication: **per-user flags currently live *on* canon rows.**
`toggleFavorite` mutates `prayer.favorite`; `toggleTemplateFavorite`,
`toggleChannelFavorite`, `toggleContentLinkFavorite`, and `setKnowledgeStatus`
do the same on their rows. You cannot store "Joy favorited the Rosary" on a row
that Maria also reads. These flags have to move to overlay tables — see Option C.

---

## Options

### Option A — Per-user copy of everything

On sign-up, clone the entire seed into the new account. Every row (canon or not)
carries `user_id = auth.uid()`.

- ➕ **Simplest RLS:** one rule everywhere — `user_id = auth.uid()`.
- ➕ Favorites/status stay on the row; no overlay tables; **no refactor** of the
  current mutation code.
- ➕ Migration of beta data is a dumb bulk upload (no filtering).
- ➖ **Your fixes never reach existing users.** Correct a typo in a seeded prayer
  and only new sign-ups get it; everyone else keeps the stale copy.
- ➖ Storage bloat: N users × the full canon. Grows with every seed addition.
- ➖ No path to "featured this week" / shared parish content later.

**Good only if** the canon is meant to be a *starter kit* users then own and
diverge from, and you never need to push updates centrally.

### Option B — Shared canon + per-user data

Canon rows are owner-less (`user_id IS NULL`), world-readable, admin-writable.
User rows carry `user_id = auth.uid()`.

- ➕ One canon; **your edits propagate instantly**; minimal storage.
- ➕ Clean foundation for future shared/curated content (parish prayers, etc.).
- ➖ Every mixed table needs a nullable `user_id` and a two-clause read policy.
- ➖ Editing a canon item can't mutate the shared row → needs **copy-on-write**.
- ➖ Favorites/status **can't** sit on shared rows → still need overlay tables.

Option B is correct but incomplete on its own — the flag problem forces the
overlay, which is what makes it Option C.

### Option C — Hybrid (recommended)

Option B **plus** per-user overlay tables for state-on-canon:

- `user_favorites (user_id, item_type, item_id)` — replaces the four `favorite`
  booleans currently on rows.
- `user_knowledge_state (user_id, knowledge_id, status)` — replaces
  `setKnowledgeStatus` mutating the row.
- `user_hidden_items (user_id, item_type, item_id)` — the per-user "delete" of a
  canon item (a hide/dismiss; the shared row is never removed).
- `user_prefs` — the mystery-body choice and other per-item selections that today
  ride on canon/session rows.

Reads become "canon row + my overlay, minus my hidden." Because users can't edit
canon in place (decision Q2), the only write to a canon item is a **fork**
(copy-on-write to an owned row). Everything genuinely mine is a plain owned row.

---

## Proposed model (Option C)

**Ownership rule per row:** `user_id IS NULL` = shared canon (read-all,
admin-write). `user_id = <uuid>` = private to that user.

**Table split:**

- **Shared canon (read-only to users):** `sources`, `prayers`,
  `prayer_versions`, `mystery_sets`, `mysteries`, `mystery_contents`,
  `templates`, `template_items`, `how_tos`, `voices`, `knowledge_items` — the
  seeded rows. Same tables also hold user-owned rows (their custom additions).
- **Per-user only:** `sessions`, `session_items`, `session_plans`, `intentions`,
  `reflections`, `mass_experiences`, `import_drafts`, `settings`.
- **New overlay tables (per-user):** `user_favorites`, `user_knowledge_state`,
  `user_hidden_items`, `user_prefs`.

**RLS sketch** (illustrative, not final SQL):

```sql
-- Mixed library table: everyone reads canon + their own; writes only their own.
create policy read  on prayers for select
  using (user_id is null or user_id = auth.uid());
create policy write on prayers for insert with check (user_id = auth.uid());
create policy edit  on prayers for update using (user_id = auth.uid());
-- (no user UPDATE/DELETE reaches user_id IS NULL canon rows)

-- Pure per-user table (e.g. reflections): owner-only, all verbs.
create policy owner on reflections for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
```

Canon writes (seed loads, your curation) run through the service role / an admin
path, never the anon or authed client — see the security note below.

**Fork, not edit (decision Q2):** users can't change a canon prayer/template in
place. To customize one, they **fork** — insert a new user-owned row (new
generated ID, `user_id = auth.uid()`, optionally `forked_from = <canon_id>`) and
point their session/favorite at the fork. The shared row is never mutated. This
is simpler than in-place copy-on-write: there's no "did they mean to edit the
shared one?" ambiguity.

**Delete = per-user hide (decision Q2):** a user can't remove a row everyone
reads. "Delete this from my library" writes a `user_hidden_items` row; reads
filter it out. (Deleting an *owned* row — their own fork or custom item — is a
real delete.)

---

## Migration impact

**Beta → accounts (the easy part).** Because a tester's whole dataset is one
localStorage blob (`prayer-companion-db-v38`) shaped 1:1 to these tables, and the
owner label (`settings.display_name`, set by the beta name prompt) rides *inside*
that blob, first-login migration is roughly:

1. Read the local `Database`.
2. **Skip seed rows** — filter by known canon IDs (`our-father`, `tpl-rosary`,
   `src-*`, etc.); those already exist server-side as canon.
3. Upload the remaining **user rows** (sessions, reflections, plans, intentions,
   custom prayers/templates, settings) stamped with `user_id`.
4. Translate on-row favorites/status into `user_favorites` /
   `user_knowledge_state` overlay rows.
5. Switch the app to read/write Supabase; keep the local blob as a one-time
   fallback until confirmed.

Note: a tester who cleared their data pre-migration (see the reset instructions
for beta users) simply arrives with a fresh seed and nothing to migrate — the
skip-seed filter in step 2 handles that case for free.

Step 4 is the only fiddly bit, and it exists precisely because of the overlay
refactor below.

**The refactor this decision requires (the real cost):**

- Move four `favorite` booleans and `knowledge status` off rows into overlay
  tables; rewrite `toggleFavorite`, `toggleTemplateFavorite`,
  `toggleChannelFavorite`, `toggleContentLinkFavorite`, `setKnowledgeStatus`.
- Add nullable `user_id` to every mixed library table + the two-clause RLS.
- Implement **fork** (canon → owned copy) and **hide** (`user_hidden_items`) for
  canon items; users never mutate or truly delete a shared row.
- Build the admin/seed-load path that writes canon via the service role.

(Option A would have avoided all of this, but Q1/Q3 rule it out — see below.)

---

## Security notes (carry into ACTS-82 build)

- **RLS on every table, no exceptions** — the #1 Supabase footgun. Add explicit
  "user A cannot read user B" tests, especially for `reflections` (journal).
- **Never ship the service-role key to the client.** Canon writes and seed loads
  go through a server/admin path only; the client uses the publishable key.
- `reflections` and `mass_experiences` are the most sensitive rows — treat them
  as private-by-default and cover them first in RLS tests.
- Revisit the existing `shared_sessions` public-insert policy (ACTS-94) for
  abuse limits (size cap / TTL) before real traffic — tracked separately.

---

## Resolved decisions

Signed off 2026-08-30:

1. **"My curation reaches existing users" a hard requirement?** → **Yes.** Locks
   Option C; Option A is off the table.
2. **Can users edit canon items, or only fork/duplicate?** → **Delete or
   fork/duplicate — no in-place edits.** Edit = fork (owned copy); delete =
   per-user hide (`user_hidden_items`). Simpler than in-place copy-on-write.
3. **Future shared/curated content** (parish prayer of the week, shared family
   library)? → **Yes.** Reinforces C — it reaches that without a second
   migration.

## Decision restated

Build **Option C**. Scope for ACTS-82 includes the favorites/status → overlay
refactor **plus** the fork + `user_hidden_items` (hide) mechanics that Q2
requires. It's the model where the seeded canon stays yours to maintain and push
updates through, users' private data (especially `reflections`) is cleanly
isolated, and beta data migrates in one pass.
