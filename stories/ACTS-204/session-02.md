---
story: ACTS-204
session: 02
wrapped_at: 2026-11-08T15:40:00-0800
status: In Progress
final: false
---

## Read this first: what to expect (target tables vs. what's built today)

These are JC's target tables (from the design conversation), each with a **Status** column
showing where the shipped app stands as of this handoff (`main` @ `5f314a9`, Published to
production 2026-11-08). "Today" values come from running the real resolver
(`src/lib/prayer/knowledge.ts`) on the example URLs. They aren't guesses.

**Status legend:** ✅ built as planned · 🔀 built, but differs from the plan · 🟡 partly built · ⬜ not built yet

### Table 1: Manual-entry form (fields & options a user sees)

The unified form itself is **ACTS-187** (not built). Today the closest thing is the
**Paste a link** card on Vessels › Add (slice d), plus the older by-hand form below it.

| Field | Planned input / options | Today | Status |
|---|---|---|---|
| Link | paste any URL; auto-fills the rest | Paste card: Look up → editable card. Tracking params stripped, pasted link kept as `original_url` | ✅ |
| Title | auto-suggested, editable | Prefilled from the page title, editable | ✅ |
| Voice | search + "＋ New" → Individual / Organization; blank = unattributed | "From": autocomplete over your Vessels, or new → Individual / Organization chips; "Save to General" for content. The model also has **Ministry** | ✅ (🔀 Ministry exists) |
| What is it? | ONE dropdown: Sources (Website · Podcast · Video Series · YouTube Channel · Social Profile · Program · Store) + Pieces (Video · Episode · Article · Reel · Post · Book · Quote) | **Two steps:** a *One item / Collection* toggle, then **Type** (Book · Article · Post · Quote · Program) for an item or **Kind** (Show · Podcast · Program · Social · Articles · Store · Collection) for a collection | 🔀 / single picker ⬜ (ACTS-187) |
| Part of | search your Collections; pieces only | Built in slice d: autocomplete across all collections (picking one sets From to its owner); a new name creates a collection (link + kind editable). Pre-filled when the URL sits under a saved collection | ✅ |
| Format | pre-filled from "What is it?": Watch · Listen · Read · Look; Book → Ebook / Audiobook | `media` is stored and editable in the item editor, auto-set from the URL or the collection's kind. **Not shown on the paste card**; labels are Text · Audio · Video · Image; no Ebook / Audiobook | 🟡 |
| Platform(s) | auto + "＋ add" (YouTube · Spotify · Apple · Instagram · Website · App) | Auto-detects one platform on paste; add more in the Vessel editor (`Collection.platforms[]`). Values: Instagram · TikTok · YouTube · X · Facebook · Podcast · Website · Store. **Spotify and Apple are both "Podcast"; no "App"** | 🟡 / 🔀 values |
| Tags | chips: Prayer, Scripture, Marian, Advent… | Free-form `tags[]` exists on content (item editor). Not on the paste card; no starter vocabulary | 🟡 |

### Smart-default map ("What is it?" → Format)

| Planned "What is it?" | Planned Format | Source type | Today | Status |
|---|---|---|---|---|
| Podcast · Episode | Listen (audio) | Collection · Content | Podcast kind → audio for its items | ✅ (no picker) |
| Video Series · YouTube Channel · Video · Reel | Watch (video) | Collection · Content | YouTube / reel URL → video; Show kind → video | ✅ (no picker) |
| Article · Quote | Read (text) | Content | text | ✅ |
| Social Profile · Website · Program · Store | Mixed (you set it) | Collection | Social → **image**, **Program → video**, others → text. No "Mixed" | 🔀 |
| Book | Ebook or Audiobook | Content | text only | ⬜ |

### Table 2: The import examples, planned vs. today

✏️ = JC's edits · ✍️ = the user confirms Voice / Part of (a bare item URL doesn't name its account)

| Pasted URL | Planned (Voice · What is it? · Part of · Format) | Today (tier · type/kind · Part of · media) | Status |
|---|---|---|---|
| ascensionpress.com | Ascension (Org) · Website · — · — | Collection · kind "Collection" (no Website kind) · From **Ascension Press** (brand map) | 🔀 kind |
| app…/podcasts/bible | Ascension · Podcast · — · Listen | Collection · **Podcast** · Ascension Press | ✅ |
| app…/podcasts/homily | Ascension · **Video Series** · — · Watch | Collection · **Podcast** (path says podcasts; kind editable) | 🔀 edit kind |
| app…/study-plans/0dc5… ✏️ | Ascension · **Program** · — · Mixed | **One item · Article · text**, Part of new "Study plans" (`study-plans` isn't a recognized series path) | ⬜ gap |
| youtube.com/@AscensionPresents | Ascension (**Org**) · YouTube Channel · — · Watch | Collection · **Show** · From a new **individual** "@AscensionPresents" (YouTube isn't brand-mapped; pick Ascension Press in From) | 🔀 Voice |
| watch?v=6108EZAt-FA ✍️ | Ascension · Video · Ascension Presents · Watch | One item · **Post** · video · Part of auto-matched **if** the channel is saved (via the page's author link), else a new collection at the @handle | 🔀 type "Post" |
| youtube.com/@anamunley | Ana Munley (Ind.) · YouTube Channel · — · Watch | Collection · **Show** · new individual @anamunley | ✅ (label "Show") |
| watch?v=Q-D3YLXg710 ✍️ | Ana · Video · Ana's YouTube · Watch | One item · **Post** · video · Part of as above | 🔀 type "Post" |
| instagram.com/anamunley | Ana · Social Profile · — · Mixed | Collection · **Social** · new individual @anamunley | ✅ (label "Social") |
| instagram.com/reel/DdCu… ✍️ | Ana · Reel · Ana's Instagram · Watch | One item · **Post** · video · Part of: you pick (Instagram hides the author) | 🔀 type "Post" |
| hallow.com | Hallow (Org) · Website · — · — | Collection · kind "Collection" · From **Hallow** (brand map) | 🔀 kind |
| hallow.com/prayers/1019175 | Hallow · **Episode** · Minute Homilies · Listen · tag **Prayer** ✏️ | One item · **Article · text** · Part of new "Prayers" (hallow.com/prayers); no tag | ⬜ gap |

Open display question carried over: should a tagged item read as its tag ("a prayer") instead
of its noun ("an episode")? Undecided.

### Axis → field map

| Axis | Field | Planned values | Today | Status |
|---|---|---|---|---|
| Voice (who) | `Voice.kind` | Individual · Organization | Individual · Organization · **Ministry** | 🔀 |
| Source type (level) | Collection vs Content entity | Collection · Content | Same; inferred from URL shape on paste (`detectSourceType`) | ✅ |
| Collection (container) | Channel → **Collection** | name + type: Website · Podcast · YouTube Channel · Video Series · Program · Social Profile · Store | Renamed ✅. `kind`: Show (video) · Podcast · Program · Social · Articles · Store · Collection (other) | ✅ rename / 🔀 values |
| Platform(s) | `platforms[]` | YouTube · Spotify · Apple · Instagram · website · app … | List ✅. Values lack Spotify / Apple (both "Podcast") and App | 🔀 values |
| Format (how) | `media` | video · audio · text · image, shown Watch / Listen / Read / Look; Book → ebook / audiobook | Stored + editable; shown Video / Audio / Text / Image; no ebook / audiobook | 🟡 |
| Content form | `category` | Book · Quote (else derived) | Book · Article · Post · Quote · Program (video / podcast retired in session 01) | 🔀 |
| Tags | `tags[]` | Prayer · Scripture · Marian · Advent … | Free-form field exists; Prayer-as-tag decided; not on the paste card | 🟡 |

## What happened

- **Session 2 (2026-10-02):** shipped **slice d, the paste-flow resolver** (commit `69f0472`, docs `c05d738`):
  - `detectSourceType` decides Collection vs Content from the URL shape, pattern-only (no new fetch).
  - `resolveCollection` files an item under the collection with the most specific matching path on the same host, falling back to account identity for social and YouTube links. A bare-site collection only identifies the Vessel.
  - `collectionKindFromUrl` / `collectionRootOf` supply the collection kind and the "Part of" prefill.
  - `canonicalUrl` strips tracking params. **New optional field** `KnowledgeLink.original_url`; the store normalizer keeps it, and nothing resets.
  - QuickAddLink was rebuilt as an editable card:
    - a One item / Collection toggle
    - "Part of" autocomplete
    - a new-collection link and kind
    - a duplicate guard
    - a plain web link inherits its format from its collection's kind
- **2026-11-08 (JC back after ~5 weeks):** JC published `main` in Lovable. The `prod` tag was moved to `5f314a9` (local tag; the push to GitHub needs JC's credentials and is optional). The release tracker reports everything Published.
- A mistaken session-02 handoff written from an *old* chat (`d255b1d`) was reverted by JC (`5f314a9`); this file replaces it.
- No code changed today. This handoff is the audit of JC's target tables against what's built (above).

## Verified (and how)

- **Slice d (Oct 2), in the dev preview (localhost:8080) and with a tsx script:**
  - A show URL with `utm_*` became a Podcast collection under a new Ascension Press org.
  - An episode with `stkn` / `entryPoint` params filed as an episode of Sunday Homilies; `original_url` survived a reload.
  - Re-pasting the show showed "Already saved" with save disabled.
  - `/podcasts` (the session-01 bug) became a collection matched to Ascension Press.
  - The "Part of" autocomplete re-points From to the collection's owner.
  - `tsc --noEmit` passed clean.
- **Today:** re-ran the resolver against JC's 12 example URLs (Table 2's "Today" column is that output). `scripts/published.sh` confirms 0 commits short of production.

## Git state at handoff

All code is committed **and pushed** (`origin/main` = `5f314a9`) and Published to production.
This handoff (docs only) is committed locally. The push from this environment fails on auth,
so **JC pushes from their git client**. The `prod` tag is local only (optional to push).

## Next

**START HERE:** decide which planned values to adopt where today differs (the 🔀 / ⬜ rows above), then:

1. **Close the paste gaps (small, resolver-only):**
   - recognize `study-plans` (and similar) as a program series
   - brand-map YouTube handles to orgs (`@AscensionPresents` → Ascension Press), or at least suggest it
   - give pieces a better type than "Post": add Video / Episode / Reel nouns, or show the collection's noun
   - Hallow `/prayers/<id>` → audio + a Prayer tag?
2. **Label alignment (needs JC's call):**
   - collection kinds to the planned names (Website · Video Series · YouTube Channel · Social Profile)
   - Format shown as Watch / Listen / Read / Look
   - Spotify / Apple / App as distinct platforms
   - Book → Ebook / Audiobook
   - "Mixed" for social / program
3. **The three library views** (unchanged from session 01):
   - Platform → Collection → Content
   - a new Collections view (each show with its items)
   - Voice → Collections + Content (an item whose Voice differs from its collection's owner should show under both, ACTS-202)
4. **Prayer routing:** a pasted novena / litany becomes a Devotion with its Source linked to the Vessel (USCCB case). Auto, or offered on the card? JC to decide.
5. **No-reset check**, then close ACTS-204, then **ACTS-187**: one unified form with the single "What is it?" picker (Table 1).
