---
story: ACTS-204
session: 02
wrapped_at: 2026-11-08T15:16:06-0800
status: In Progress
final: false
---

## What happened

Short orientation session (no code). Confirmed the September ACTS-204 work is **all
pushed and synced** — a stale session-start snapshot had made it look like commits were
waiting; live git shows HEAD `c05d738`, working tree clean, `main` **0 ahead / 0 behind**
`origin/main`.

Re-oriented on where ACTS-204 actually stands: the model is done AND **slice (d) — the
paste-flow resolver — was already built** in a later session (`69f0472`, `c05d738`,
2026-10-02): `detectSourceType` + `resolveCollection`, an editable staged card (One item /
Collection toggle, "Part of" autocomplete, canonical/original URL). Two ACs ticked. No
handoff was written for that session (pointer still said sessions: 1), so this one records
it and sets up the **audit** JC wants next.

**JC's intent for the fresh chat:** continue slice (d) by **auditing the built resolver
against the target design** (the tables below) and fixing where current behavior diverges.
JC wants the next chat to **open by rendering these tables** (downloadable) as the spec to
check against.

## The target spec (JC's tables — audit current behavior against these)

### Table 1 — Manual-entry form: fields & options the user sees

| Field the user sees | Input | Options they pick from | Notes |
|---|---|---|---|
| **Link** | text | *(paste any URL)* | optional — if given, everything below auto-fills |
| **Title** | text | — | auto-suggested from the link, editable |
| **Voice** | search + "＋ New" | your existing Voices; a new one → Individual / Organization | optional (blank = unattributed) |
| **What is it?** | one dropdown | *Sources:* Website · Podcast · Video Series · YouTube Channel · Social Profile · Program · Store — *Pieces:* Video · Episode · Article · Reel · Post · Book · Quote | the single type pick — it auto-sets Format, so no second "video" list |
| **Part of** | search | your existing Collections | shown only for a *piece*; builds the hierarchy |
| **Format** | dropdown (pre-filled) | Watch (video) · Listen (audio) · Read (text) · Look (photo); Book → Ebook / Audiobook | auto-set by "What is it?", editable |
| **Platform(s)** | auto + "＋ add" | YouTube · Spotify · Apple · Instagram · Website · App … | auto-detected from the link; add more for a Collection |
| **Tags** | chips | free — Prayer, Scripture, Marian, Advent… | where Prayer lives |

**The "video / video" fix:** one picker ("What is it?"). Picking Podcast auto-sets Format =
Listen; Video Series auto-sets Watch. Format shows the result and stays editable — the user
never picks "video" twice. Smart-default map:

| "What is it?" | auto-sets Format | Source type |
|---|---|---|
| Podcast · Episode | Listen (audio) | Collection · Content |
| Video Series · YouTube Channel · Video · Reel | Watch (video) | Collection · Content |
| Article · Quote | Read (text) | Content |
| Social Profile · Website · Program · Store | *(Mixed — you set it)* | Collection |
| Book | Read → Ebook, or Listen → Audiobook | Content |

### Table 2 — Import resolution: each URL → field → chosen option

| Pasted URL | Voice | What is it? | Part of | Platform(s) | Format | Tags | User sees |
|---|---|---|---|---|---|---|---|
| `ascensionpress.com` | Ascension *(Org)* | **Website** | — | website | — | — | a website |
| `app…/podcasts/bible` | Ascension *(Org)* | **Podcast** | — | app (+Apple, Spotify, YT) | Listen | — | a podcast |
| `app…/podcasts/homily` | Ascension *(Org)* | **Video Series** | — | app (+YouTube, Spotify) | Watch | — | a video series |
| `app…/study-plans/0dc5…` | Ascension *(Org)* | **Program** ✏️ | — | app | Mixed | — | a program |
| `youtube.com/@AscensionPresents` | Ascension *(Org)* | **YouTube Channel** | — | YouTube | Watch | — | a YouTube channel |
| `watch?v=6108EZAt-FA` | Ascension *(Org)* ✍️ | **Video** | Ascension Presents | YouTube | Watch | — | a video |
| `youtube.com/@anamunley` | Ana Munley *(Ind.)* | **YouTube Channel** | — | YouTube | Watch | — | a YouTube channel |
| `watch?v=Q-D3YLXg710` | Ana Munley *(Ind.)* ✍️ | **Video** | Ana's YouTube | YouTube | Watch | — | a video |
| `instagram.com/anamunley` | Ana Munley *(Ind.)* | **Social Profile** | — | Instagram | Mixed | — | a profile |
| `instagram.com/reel/DdCu…` | Ana Munley *(Ind.)* ✍️ | **Reel** | Ana's Instagram | Instagram | Watch | — | a reel |
| `hallow.com` | Hallow *(Org)* | **Website** | — | website (+app) | — | — | a website |
| `hallow.com/prayers/1019175` | Hallow *(Org)* | **Episode** | Minute Homilies | website/app | Listen | Prayer ✏️ | an episode (Prayer) |

✏️ = JC's two edits (study-plan → Program; the Hallow prayer tagged Prayer). ✍️ = the
Voice / Part-of the user confirms (a bare item URL doesn't name its account).

### The axes (field mapping — the settled model)

| Axis | = our field | Values |
|---|---|---|
| **Voice** (who) | `Voice.kind` | Individual · Organization |
| **Source type** (level) | Collection vs Content entity | Collection · Content |
| **Collection** (container) | `Voice.collections[]` | name + type (Website · Podcast · YouTube Channel · Video Series · Program · Social Profile · Store) |
| **Platform(s)** (pipeline/distribution) | `platforms[]` | YouTube · Spotify · Apple · Instagram · website · app … |
| **Format** (how) | `media` | video · audio · text · image (shown Watch/Listen/Read/Look; Book → ebook/audiobook) |
| **Content form** (stored type) | `category` | Book · Quote (else derived) |
| **Tags** (cross-cutting) | `tags[]` | Prayer · Scripture · Marian · Advent … |

## Verified (and how)

- Live git: HEAD `c05d738`; `git fetch` then `rev-list` → **0 ahead, 0 behind** origin/main; working tree clean. (The session-start snapshot showing `9270359` was stale.)
- Slice-d code present: `detectSourceType` / `resolveCollection` in `src/components/knowledge/QuickAddLink.tsx` and `src/lib/prayer/knowledge.ts`.
- No app verification this session (orientation only).

## Git state at handoff

**All committed & pushed** — nothing waiting (0 ahead / 0 behind origin/main). This handoff
commit is the only new change; it will be pushed too.

## Next

**Fresh chat = audit & finish slice (d).** Open by rendering the three tables above (JC wants
them downloadable), then compare the **built resolver** against them:

1. **Manual "What is it?" picker** — does the Add form have the SINGLE picker (Sources +
   Pieces) that auto-sets Format per the smart-default map? Or does it still show a separate
   category + format (the "video twice" problem)? Wire the picker + smart defaults if not.
2. **Paste resolution** — run each URL in Table 2 through the live paste flow; confirm
   Collection-vs-Content, the inferred type, Part-of, Platform(s), Format, and "User sees"
   match. Known earlier bug: `app.ascensionpress.com/podcasts` saved as a *Post* — verify
   slice d fixed it (should now be a Collection · Podcast).
3. **Gaps to check:** `/podcasts/homily` is a *Video Series* (video) even though the path
   says "podcasts" — type must stay editable; `study-plans` → **Program** (JC's edit);
   `hallow.com/prayers/…` → **Episode** tagged **Prayer** (Part of "Minute Homilies");
   multi-platform "＋ add" on a Collection; canonical URL strips `utm_*`/`stkn`/`entryPoint`.
4. Pattern-only (no metadata fetch — local-first).

Other open ACTS-204 ACs (lower priority, not slice d): a Collection carrying a **host/author
Voice** distinct from its owner (→ ACTS-202), **prayer/novena/litany routing** (Source →
Vessel, USCCB case), and the nested **views** (Platform→Collection→Content, a Collections
view). Then ACTS-187 (unified add form).

## Next session — opener (paste to start)

> Continue **ACTS-204, slice (d)** — audit & finish the paste-flow resolver. First render the
> three tables from `stories/ACTS-204/session-02.md` (manual-entry form + smart-default map,
> the import resolution table, the axes) so I can download them. Then walk the **built**
> resolver (`detectSourceType`/`resolveCollection` in `QuickAddLink.tsx` + `knowledge.ts`)
> against those tables: (1) does the Add form use ONE "What is it?" picker that auto-sets
> Format? (2) does each URL in Table 2 resolve to the right Collection-vs-Content / type /
> Part-of / Format / "User sees"? Flag divergences and fix. Everything's pushed (0 ahead);
> model + slice-d scaffolding already shipped — this is verification + gap-fill, not a
> rebuild.
