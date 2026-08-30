# v8 PRD ↔ Code gap analysis

Compares **PRD v8** (`ACTS_Final_Build_Ready_PRD_v8`) against what the **code actually
implements**, with story coverage. Purpose: the reconcile checklist for rebasing the
PRD onto v8, and a backlog-filing worklist.

Generated 2026-08-29 against `main` @ `11d40ec`. Legend: ✅ built · 🟡 partial · ⬜ not built.
**The _JC comment_ column is for your notes / decisions — fill it in.**

## Difference table

| v8 concept (§) | Code | What exists / gap | Story | JC comment |
|---|---|---|---|---|
| Prayer/Devotion/Expression taxonomy (§6) | ✅ | `taxonomy.ts` — all 3 axes kept separate | core | |
| Song expression (§6, *v8 omits*) | ✅ | `song` kind, verse/chorus segments | ACTS-43 | |
| Rosary + **selectable Mystery bodies** (§22, *v8 omits*) | ✅ | `mystery_body` in `SessionContext` | ACTS-55/56 | |
| Litany / Dialogue / Salutation (§25B) | ✅ | `salutation` item kind | ACTS-57 | |
| Scripture / executable Text-Context (§25B) | ✅ | `scripture`, `heading`, `custom` kinds | ACTS-12/13 | |
| **External Link** component (§10A/25E/31C) | ✅ | `external_link` kind + `ExternalLinkOption` | ACTS-10/72 | |
| Scriptural Rosary seed (§12) | ✅ | seeded | ACTS-13 | |
| USCCB Basic Prayers seed (§23A) | ✅ | `src-usccb` sources | ACTS-42 | |
| Reflection + **Open Dialogue** mode (§28/31B) | ✅ | `ReflectionMode: open_dialogue` | ACTS-102 | |
| **Lectio Divina** (*v8 has no section*) | ✅ | reflection step, 4 movements | ACTS-102 | |
| **Share / Follow-along** (*v8 has no section*) | ✅ | `/follow`, `shareStore` | ACTS-93/94 | |
| **Bible app + translation Settings** (*v8 omits*) | ✅ | `AppSettings.bible_*`, `settings.tsx` | ACTS-73 | |
| Accounts / persistence (§29–31) | ✅ | Supabase auth + backend | ACTS-82/87/88 | |
| Faith Learning / Life Library (§27) | 🟡 | shipped as **Vessels** (naming differs) | ACTS-52/59/71 | |
| **Resource Directory** (§25D) | 🟡 | merged into Vessels; Hallow/Laudate seeds + resource fields absent | ACTS-52 | |
| Session **Name & Purpose** (§9A) | 🟡 | `SessionPlan.purpose` = a name only; no Purpose taxonomy (In Memoriam, etc.) | — | |
| **Meditation** component (§23B) | 🟡 | `meditation` kind exists; overlaps Lectio; no prompt/duration/response model | ACTS-26 | |
| My Intention vs **Devotion Intention** (§25A) | 🟡 | `intention` + `petition` kinds; no UserIntention/DevotionIntention split | ACTS-26 | |
| Import **MATCH** step + pasted text (§25C) | 🟡 | importer *proposes* (ANALYZE→PROPOSE); no library-dedupe MATCH | ACTS-17/19 | |
| USCCB *How to Pray the Rosary* seed + multi-source (§12) | 🟡 | auto How-To exists; no `HowToVersion`/`HowToSource` | ACTS-28 | |
| **Pray with the Pope** seed (§25E) | ✅ | **seeded** (`tpl-pray-with-pope`, vaticannews link) — correction to earlier note; action = surface on Home | ACTS-10/109 | |
| **Open Prayer** (free-form) (§23A/23B) | ⬜ | no `open_prayer` kind — **not built** | **none** | |
| **Nested Templates / Template Block** (§10A/31C) | ⬜ | no `template_block` kind | **none** | |
| **Prayer Forms** (five forms) (§25B) | ⬜ | no `prayer_form` field | **none** | |
| **Traditional Prayer** origin_type grouping (§6/31A) | ⬜ | no `prayer_origin_type`; no "Traditional vs My Prayers" | **none** | |
| **Wisdom** (§1A/28/32) | ⬜ | not built (future) | **none** | |
| **Insights** (§3/32) | ⬜ | not built (future) | **none** | |
| Full **Audio domain** (§15–21) | ⬜ | fields stubbed only | **none** | |

## The three buckets

### ① In v8, missing from code, NO story yet — candidates to file
- **Open Prayer** (free-form prayer) — *JC wants this; confirmed not built*
- **Nested Templates / Template Block**
- **Prayer Forms** (five forms) + **Traditional Prayer** origin grouping
- **Session Purpose** taxonomy (only a name field exists today)
- **HowTo versioning / multi-source**
- *(Wisdom, Insights, full Audio domain = intentionally future)*

### ② Shipped but MISSING FROM v8 — add to the PRD when we reconcile
- **Share / Follow-along**, **Lectio Divina**, **Bible settings**, **selectable Mystery bodies**, **Song** type

### ③ Naming / drift to reconcile
- v8 "**Faith Learning**" + "**Resource Directory**" → both shipped as **Vessels**
- **Pray with the Pope** preset was built (ACTS-10) but **fell out of the current seed** — reseed or note
- **Meditation** (v8) vs **Lectio Divina** (shipped) overlap — decide: own component, or folded into Lectio

## JC review — decisions & filed stories (2026-08-29)

Comments captured in the interactive worksheet (artifact `52984cdd`). Actions taken:

**Stories filed (ACTS-108 → ACTS-116):**
- **ACTS-108** — Open Prayer, free-form (JC: "create story"; wants it). *[pointer]*
- **ACTS-109** — Pray with the Pope → surface on Home as a daily session. Template **is** seeded; this is not a reseed. *[pointer]*
- **ACTS-110** — Nested Templates / Template Block. JC deferred the link decision to me → filed as infra, **linked to ACTS-107** (Rosary+Litany is first consumer). *[pointer]*
- **ACTS-111** — Explore My Intention vs Devotion Intention split (low pri).
- **ACTS-112** — Prayer Forms (five forms) + Traditional/My origin metadata (low pri, validate need).
- **ACTS-113** — Insights + Wisdom (future longitudinal intelligence; grouped, they're a designed pair).
- **ACTS-114** — Full Audio domain (future/large).
- **ACTS-115** — HowTo versioning + multi-source (JC: "keep open").
- **ACTS-116** — Project status dashboard / daily-weekly brief (JC idea from this review).

**Resolved without a new story:**
- **Meditation (§23B):** covered by the `meditation` item kind + Lectio Divina; the fuller v8 Meditation (prompt / duration / response-links) is not built. Treating the need as **met for now**; fold the richer spec into a future Lectio/meditation enhancement if wanted. (JC: "is this complete? if yes, close.")
- **Import MATCH (§25C):** JC "keep" → left partial/open, no new story.

**PRD-reconcile notes (apply when rebasing onto v8):**
- **Global rule (JC):** every *built* feature must have real content/a section in the PRD — **especially where it replaces or augments an existing v8 section.**
- **Faith Learning / Life Library (§27):** **Vessels** is the chosen product label; "Faith Learning / Life Library" describes what it is.
- **Resource Directory (§25D):** **complete via Vessels** — update the PRD to match code.
- **Session Name & Purpose (§9A):** code today has one free-text name (`SessionPlan.purpose`), not v8's structured Purpose picker (In Memoriam, Discernment…). Update the PRD to describe what exists; the structured Purpose taxonomy is optional/future.
- **Pray with the Pope (§25E):** correct the "dropped" note — it **is** seeded.

## Open decisions (for JC)
- **Branding:** keep *Faith Journey* as umbrella placeholder + *ACTS* as the app name; top-level umbrella name TBD (candidates: Faith Journey, *Via Devota*, …). Revisit later.
- **Meditation vs Lectio:** see bucket ③.
- **Resource model:** does Vessels need the v8 resource fields (`app_store_url`, `access_model`, `best_for`) + external-app seeds, or is the current Vessels model enough?
