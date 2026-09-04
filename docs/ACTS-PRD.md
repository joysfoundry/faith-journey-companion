**FAITH JOURNEY** — *the long-term vision*
**Now shipping: ACTS** — *the prayer-first product*

**Product Vision & Requirements Document**
v3 · updated 2026-08-29 · rebased onto the "Final Build-Ready MVP PRD v8" base
last synced: 2026-08-29 · ba18ff0

Umbrella vision: **Faith Journey** — the longitudinal experience/model that brings prayer, Scripture, learning, reflection, and lived experience together in service of discerning God's will and living one's purpose. *(Umbrella name is a working placeholder — TBD.)*
Shipping now: **ACTS** — a guided Catholic prayer companion. *(ACTS = **A**doration, **C**ontrition, **T**hanksgiving, **S**upplication — the traditional shape of prayer.)*
Primary MVP wedge: **Prayer** (Catholic devotional prayer)
Experience: **Mobile-first** — mobile web, no app store (see ACTS-90)
Revision lineage: this doc is rebased onto PRD **v8** (External Links, Pray with the Pope, and nested Template composition) — the fuller, correct base — with the ACTS structural framing and shipped-status reconcile re-applied.

*A daily place where prayer, Scripture, learning, reflection, and lived experience become part of a meaningful record of how I am trying to live my faith, discern God's will, and live my purpose.*

---

## **Mission** *(draft — to refine)*

Across my whole faith journey, **prayer has been the constant.** This mission grows out of that: **to help people deepen their relationship with God by building something that feels deeply personal, yet doesn't ignore the wealth of resources — Scripture, the saints, teaching, and tradition — already out there.** Something that meets a person where they actually pray, honors how they were formed, and makes the practice of faith less scattered and more whole.

*(Working draft — the exact wording still needs refining.)*

---

# **Part 1 · Business**

*Start high — the vision, the purpose, and the boundaries — then narrow to the specific product (ACTS) and why it's the first thing being built.*

# **1\. Product Vision**

Faith Journey is a personal faith application designed to help people bring prayer, Scripture, learning, reflection, and lived experience into the rhythms and needs of everyday life.

*Help people deepen their relationship with God and bring prayer, Scripture, learning, reflection, and lived experience together in service of discerning God's will and living the purpose to which they are called.*

The MVP — **ACTS** — is centered on prayer, especially Catholic devotional prayer. The product is not simply a prayer library, Rosary app, prayer tracker, Bible-reading app, journal, reading tracker, or AI spiritual director.

# **1A. Why ACTS Captures More Than Prayer**

A person's faith journey is shaped not only by prayer, but also by what they read, watch, hear, experience, question, and reflect on. ACTS is *designed* to capture Faith Learning alongside prayer and lived experience so that, over time, users can make connections — turning what they encounter into Reflection, and eventually recognizing Insights and carrying forward Wisdom that can support discernment and action. *These later layers (Insights, Wisdom) are the vision's horizon, not the MVP — see the narrowing below.*

Prayer remains the MVP wedge and the deepest interaction to solve first. Word, Faith Learning, and Reflection are included because they provide the surrounding context of the user's faith journey; they should remain intentionally lighter-weight than the Prayer experience in the MVP.

*Life Experience → Need / Intention → Prayer → Word → Faith Learning → Reflect → Insights → Wisdom → Discern → Act*

Wisdom is not an AI verdict or theological conclusion. It is something the user recognizes, names, or chooses to carry forward from their own learning, prayer, reflection, and lived experience. Future AI may surface a possible connection or recurring idea and ask whether the user wants to save it as Wisdom, but the user owns that decision.

# **2\. Purpose, God's Will, and the AI Boundary**

*How am I becoming the person God is calling me to be, and how am I living my purpose in alignment with God's will?*

Faith Journey may support discernment, but it must never claim to know God's will for the user. It must never present AI-generated interpretation as divine instruction, prophecy, God's voice, supernatural certainty, or proof that a particular decision is God's will.

**Foundational rule**  
The system surfaces patterns. The user discerns meaning. The application may help a user notice recurring themes, repeated questions, changes over time, connections between prayer and life, recurring intentions, Scripture themes, learning themes, decisions being discerned, and actions already taken.

# **3\. Reflection vs. Insights**

## **Reflection — the user's own words**

Reflection captures what the user thought, felt, noticed, questioned, remembered, prayed about, felt challenged by, felt grateful for, wants to revisit, or believes may require action. Optional prompts are allowed, but the Reflection itself should remain the user's own words.

AI should not automatically rewrite, summarize, polish, reinterpret, or improve a Reflection unless the user explicitly asks.

## **Insights — future pattern recognition**

Insights are a future layer that may identify patterns across Prayer, Prayer Plans, Intentions, Daily Word, Mass, Homilies, Life Library, Reflections, discernment questions, decisions, and actions.

**Example — grounded pattern recognition**  
A theme you've returned to:  
You've written about meaningful work six times in the past two months, including during your St. Joseph Novena and after two reflections connected to Scripture about service.

Would you like to revisit those reflections?

**What the system must not say**  
"God is telling you to change jobs."

The first example is grounded in the user's own record. The second would be an inappropriate interpretation of God's will.

Future Insights may also offer grounded encouragement or cheerleading based on the user's own evidence. Example: "You've continued to bring this intention into prayer and reflection even though the answer has not been clear."

# **4\. Purpose as a Longitudinal Layer**

The longer-term model should preserve the evidence of the user's lived faith without forcing a rigid workflow:

| Life Experience |
| :---: |
| ↓ |
| **Need / Intention** |
| ↓ |
| **Prayer** |
| ↓ |
| **Word** |
| ↓ |
| Faith Learning |
| ↓ |
| **Reflect — my own words** |
| ↓ |
| **Insights — patterns across my Journey** |
| ↓ |
| Wisdom — what I choose to carry forward |
| ↓ |
| **Discern — what might I need to consider?** |
| ↓ |
| **Act — how did I respond?** |
| ↓ |
| **Life Experience continues** |

*How have I been trying to live in service of my purpose and God's will?*

The system can help the user see this evidence more clearly. It does not decide the user's purpose or God's will for them.

# **5\. Core Daily Experience**

* DEVOTION — What am I faithfully practicing?  
* NEED — What am I bringing to God right now?  
* WORD — What Scripture am I encountering today?  
* FAITH LEARNING — What am I learning from right now?  
* REFLECT — What is staying with me?

Home should feel like a personal daily faith space, not a feature dashboard.

---

# **Solution Idea — narrowing to ACTS**

*The vision above is the whole horizon. This is the specific product I am building **first**, the problem it attacks, and why it's the right wedge.*

**The vision is deliberately larger than what ACTS solves today.** Part 1 describes the full faith journey — all the way to Insights, Wisdom, and longitudinal discernment. ACTS attacks **one slice of it first: the customized-prayer problem.** The Insights/Wisdom/longitudinal-intelligence layers are the horizon we're building *toward*, not the MVP — so the specific problem below is intentionally scoped narrower than the vision, and the two should not be read as the same size.

## **What ACTS is**

ACTS is a guided Catholic prayer companion — it turns devotions (the Rosary and its mysteries, Lectio Divina, litanies, novenas, chaplets, hymns) into structured, step-by-step **sessions you actually pray through**, anchored to the liturgical day and shareable so a group can follow along in real time.

## **The problem I'm solving**

*The problem ACTS solves **today** is prayer composition — praying the way your family and your church actually pray, with Scripture woven in — not longitudinal insight. That larger problem is real, but it's later.*

Catholic prayer practice is **scattered and effortful.** The "content" lives in a dozen places — a physical Rosary pamphlet, a hymnal, a Bible, a saint-of-the-day site, a novena PDF someone texted you — and holding a devotion together (which mystery today? which Scripture? whose turn to lead?) takes mental overhead that pulls you *out* of prayer. ACTS collapses that into one companion that **compiles a devotion into a guided flow** — the right day, the right mysteries and readings, reflection as a first-class step, a way to sing, a way to pray *together* via a follow link — so the tool disappears and the prayer stays.

The design instinct behind every decision is the same: deep-link out to the user's *own* Bible rather than embed one, seed only public-domain texts, mark unknown provenance honestly, exclude copyrighted prayers. This is a **respectful orchestration layer over faith practice, not a walled content silo.**

## **The solution I'm starting with — prayer as the wedge**

I am not building the whole of Faith Journey at once. Prayer is the wedge because it is the daily, repeated act — and because it is where the scattering hurts most. The starting solution is:

* **Compose the way people actually pray** — mix *structured* prayer (a fixed devotion) with *open / spontaneous* prayer, and make sure **Scripture is woven in**, not bolted on.
* **Pray how my family prays and how my church prays** — reusable, customizable templates (e.g. the Caro Family Rosary) so a household's own wording, hymns, and additions are first-class, not exceptions.
* **Reflection as prayer, not admin** — my daughters love journaling; Lectio Divina and a first-class Reflect step let prayer and journaling be the same motion.
* **Learn from what inspires me** — the books, voices, homilies, and articles that form my faith live alongside prayer (the Vessels library), instead of in scattered tabs.
* **Pray together, even with guests** — a follow-along link lets anyone, *especially someone who isn't Catholic,* pray along without flipping pages or knowing what comes next.

## **Where this came from**

Across my whole faith journey, **prayer has been the constant.** I was born Catholic; in college I explored secular works, philosophy, and other faiths — and I remained Catholic. I've spent years raising my children and raising them in the faith, and our family has gathered for a **monthly Rosary since 2000.** That long path is what led me here: this app is my way to help share God's love and the sacrifice of Jesus.

The moment feels significant, too. The Catholic Church is seeing **its highest conversion numbers in decades, with young people a large share of that growth.** I attribute that to God — and I also know that behind it, everyone has a *journey*: prayer, upbringing, research, honest questions, even setting out to disprove the Church and finding the opposite. ACTS is meant to meet people somewhere on that journey.

A few concrete moments made it real:

* I wanted **my daughters to have structured prayer** — and they already love **journaling**, so prayer and reflection belong together.
* I wanted to **pray the way my family and my church actually pray**, and to **customize sessions** — open prayer *and* structure, always with Scripture.
* After someone passed away, our family prayed a **9-day novena** — and we spent real time **making a paper pamphlet and copies** by hand. ACTS puts that novena **in the platform, ready** — no pamphlet. It is more than "go pray the 54-day novena"; the day-by-day flow is built and waiting.
* As a parent praying a novena, I can **share it with my kids** so they can pray along.

## **What position it has**

If ACTS were an app on the market, it would sit between two things that already exist:

* **Static reference apps** (Bible apps, prayer-text repositories) — comprehensive but passive; you assemble the experience yourself.
* **Devotional-of-the-day apps** (Hallow, Laudate, iBreviary) — polished but largely a linear feed *you consume*; they deliver *a* prayer, they don't let you compose, adapt, and *lead* one.

The distinct wedge is **composability + shared, real-time practice**: a Prayer → Devotion → Session model where you build and customize the flow, it adapts to the liturgical calendar automatically, and a follow link makes it communal. Composability matters because it mirrors **how people actually learn to pray** and honors **cultural and doctrinal nuance** (e.g. anchoring to USCCB). ACTS is closer to a **conductor's score for Catholic prayer than a jukebox** — the thing the big incumbents don't do.

---

# **Part 2 · Technical**

*First, what's actually built today; then the full technical PRD — the domain model, the deterministic compiler, the data model, and the definition of done. Part 1 is the "why"; this is the "how" and "how far." Sections §6–§34 are the PRD of record, rebased onto v8; §35 covers a shipped capability v8 predates.*

# **What's shipped today (and what's still ahead)**

Much of the **prayer wedge is now built**; the deeper longitudinal layers (Audio, Insights, Wisdom, Purpose) are still **future**. This inventory says where reality currently stands against the v8 sections; the numbered sections that follow (§6 onward) are the technical PRD of record, with per-section *Shipped notes* where reality augments or replaces v8.

*Status legend:* **[Shipped]** live in the app · **[Partial]** partly built · **[Future]** designed here, not yet built. Live build ledger: `docs/JIRA-BACKLOG.md`.

**Shipped**

* Prayer taxonomy — Prayer / Devotion / Expression axes kept strictly separate (§6) — **[Shipped]**
* Core domain — Prayer → Devotion → Template → Plan → Session → SessionItem + deterministic session compiler (§7, §13) — **[Shipped]**
* Guided "Pray mode" — current-item tracking, completed prayers grayed, auto-scroll (§14) — **[Shipped]**
* Rosary + mysteries, with **selectable mystery bodies** (Scripture vs. meditation variants) (§22) — **[Shipped]**
* **Litanies** — three public-domain litanies seeded as devotions, via a `salutation` item kind (§6, §25B) — **[Shipped]**
* **Songs / hymns** — a sung prayer type with selectable verse/chorus segments (§6) — **[Shipped]**
* **Executable Text / Context** — `scripture`, `heading`, `custom` item kinds render non-Prayer text inline (§25B) — **[Shipped]**
* **External Link** component + link options, with a default (§10A, §25B, §25E) — **[Shipped]**
* **Scriptural Rosary** seed template (§12) — **[Shipped]**
* **USCCB Basic Prayers** seed library, with source/provenance (§23A) — **[Shipped]**
* **Lectio Divina** — four movements, with **reflection as a first-class session step**; **Open Dialogue** reflection mode (§28, §23B, §31B) — **[Shipped]**
* **Vessels** (v8's "Faith Learning" / "Life Library" / "Resource Directory") — Vessel → Channel → Content knowledge model (§27, §25D) — **[Shipped]**
* **Daily Word** naming the **liturgical day** (season + saint/feast) and reading-program voices (§26) — **[Shipped]**
* **Bible deep-linking** — open the user's own Bible app + translation from Settings (§26) — **[Shipped]**
* **Pray with the Pope** — seeded Template (`tpl-pray-with-pope`) whose content is an External Link (§25E) — **[Shipped]** *(surfacing it on Home = ACTS-109)*
* **Share / follow-along** — read-only guest view via a short titled link (the "pray together" piece) (§35) — **[Shipped]**
* **Accounts & persistence** — Supabase auth + backend (was future in §29–31) — **[Shipped]**
* Templates from scratch / from existing; session-only overrides that don't mutate the source (§10) — **[Shipped]**

**Partial**

* Import → Analyze → Propose → Review → Save seam (§25C, §30) — **[Partial]** (proposes structure; manual transcribe today, real OCR is ACTS-81; no library-dedupe MATCH step)
* PrayerPlan scheduling / calendar (§9, §29) — **[Partial]** (RRULE recurrence live; month calendar is ACTS-98)
* Session Name & Purpose (§9A) — **[Partial]** (free-text session name exists as `SessionPlan.purpose`; the structured Purpose taxonomy is future)
* Meditation (§23B) — **[Partial]** (`meditation` item kind exists; the fuller prompt/duration/response model overlaps Lectio and is future)

**Future (kept in full in the sections below)**

* Full **audio domain** — multi-speaker recordings, voice-follow, full-session audio (§15–§21) — **[Future]** *(ACTS-114)*
* **Open Prayer** free-form component (§23A/§23B) — **[Future]** *(ACTS-108)*
* **Nested Templates / Template Block** (§10A, §31C) — **[Future]** *(ACTS-110, first consumer ACTS-107)*
* **UserIntention vs. DevotionIntention** split (§25A) — **[Future]** *(ACTS-111)*
* **Prayer Forms** (five forms) + Traditional/My origin metadata (§25B, §6, §31A) — **[Future]** *(ACTS-112)*
* **HowTo versioning + multi-source** (§12, §31A) — **[Future]** *(ACTS-115)*
* **Insights** + **Wisdom** — grounded pattern recognition and user-owned carry-forward across the Journey (§3, §32) — **[Future]** *(ACTS-113)*
* **Purpose / discernment** longitudinal layer (§4, §32) — **[Future]**
* **Future Learning Companion** (§32) — **[Future]**

# **6\. Prayer Taxonomy Is First-Class**

Do not model every prayer experience as a Devotion. The application must distinguish Prayer Type, Devotion Type, and Expression Type.

## **Prayer Types**

* Liturgical Prayer — Mass, Liturgy of the Hours, Sacramental rites  
* Devotional Prayer — Rosary, Novena, Chaplet, Stations, Litany, Consecration, Custom Devotion  
* Expressions of Prayer — Vocal Prayer, Meditation, Contemplation

## **Devotion Types**

* Rosary  
* Novena  
* Chaplet  
* Stations  
* Litany  
* Consecration  
* Custom

### What a novena is *(domain reference — grounds the novena roadmap, ACTS-107 → ACTS-122–128)*

A **novena** is a traditional Christian — most commonly Catholic — devotion of **prayer repeated over nine consecutive days**. The name comes from the Latin *novem* ("nine"), and the practice is inspired by the nine days the Apostles, Mary, and the disciples spent in constant prayer in the Upper Room between the Ascension and Pentecost. This is why a novena in ACTS is modeled as a **day-sequenced flow ("Day N of M")**, not a single session — the countdown *is* the devotion.

People pray a novena for one of four purposes, which the app should be able to frame around a session:

* **Petition** — to ask God for a specific favor, healing, or grace.
* **Intercession** — to ask a saint or the Blessed Virgin Mary to pray on one's behalf.
* **Preparation** — to spiritually prepare for a major feast (Christmas, Divine Mercy Sunday, a patronal feast).
* **Perseverance** — to build patience, humility, and persistence through repeated prayer.

A novena's daily content may be the **same prayer each day** (e.g. the St. Andrew Christmas novena, prayed repeatedly) or a **different prayer/meditation per day** (day-indexed) — both shapes are covered by the "Novena Prayers" pattern (ACTS-123), while swappable rosary/litany/chaplet blocks come from the scaffold (ACTS-107/ACTS-122).

*Sources (Gemini-gathered):* Dynamic Catholic, FOCUS, Shrine of Divine Mercy, Benedictine, St. Mike's, Catholic Straight Answers.

## **Expression Types**

* Vocal  
* Meditation  
* Contemplation  
* Scripture  
* Silence  
* Reflection  
* Song — *[Shipped]* a sung prayer with selectable verse/chorus segments

## Traditional / Established Prayer Content

Use Traditional Prayer as the user-facing term for established prayers handed on in Catholic tradition. "Established" may be used in explanatory copy as a synonym, but the product label should be Traditional Prayer. Do not use the term "formula prayer."

This is a different dimension from Prayer Form and Expression Type. For example, the Hail Mary may be a Traditional Prayer, have Expression Type = Vocal, and may contain or support one or more Prayer Forms depending on context.

Recommended backend field: `prayer_origin_type` = traditional, family_tradition, personal, published_or_imported, unknown. The UI may group traditional/established prayers under "Traditional Prayers" and user-created reusable prayers under "My Prayers."

*Shipped note:* the taxonomy is live with all three axes kept strictly separate. **Litany** is a shipped Devotion Type (three public-domain litanies seeded, modeled via the `salutation` item kind), **Song** is a shipped Expression Type, and **Lectio Divina** is delivered as a Scripture-led devotion whose Reflect movement is a first-class session step (see §28). The **`prayer_origin_type` grouping ("Traditional Prayers" vs. "My Prayers") is not yet built** — tracked as ACTS-112.

**Example**  
Hail Mary = reusable Prayer, Expression Type = Vocal.  
Rosary = Prayer Type: Devotional, Devotion Type: Rosary.  
54-Day Rosary Novena = Prayer Type: Devotional, Devotion Type: Novena, nested Devotion: Rosary.  
Daily Mass Readings = related to Liturgical Prayer / Mass but surfaced in the MVP through Daily Word.

# **7\. Core Prayer Domain Model**

| Prayer / PrayerVersion |
| :---: |
| ↓ |
| **Devotion / DevotionVersion when applicable** |
| ↓ |
| **PrayerTemplate** |
| ↓ |
| **PrayerPlan** |
| ↓ |
| **PrayerSession** |
| ↓ |
| **SessionItem** |

## **Prayer**

Reusable prayer content such as the Our Father, Hail Mary, Memorare, Prayer to St. Michael, family prayer, or Prayer to St. Joseph.

## **PrayerVersion**

A preserved wording/version of a Prayer. Traditional, modern, family, and imported wording may coexist.

## **Devotion**

A structured prayer practice such as a Rosary, Divine Mercy Chaplet, Chaplet of St. Michael, or 54-Day Rosary Novena.

## **DevotionVersion**

A particular sourced/traditional form of a Devotion that may differ in sequence, wording, Mystery cycle, meditation, phases, optional prayers, or conclusions.

## **PrayerTemplate**

How the user or family prefers to pray a Devotion.

## **PrayerPlan**

When and for how long a Prayer or Devotion is part of the user's life.

## **PrayerSession**

One actual occurrence on one date or occasion.

## **SessionItem**

One actual rendered prayer/content item inside a Session.

**Foundational completion rule**  
Done belongs to SessionItem, never Prayer. Ten Hail Marys must generate ten independent SessionItems referencing the same reusable Hail Mary Prayer.

# **8\. Home and Today's Devotions**

Home order: Today's Devotions → What's on Your Heart? → Today's Word → Learn → Reflect.

**Home example**  
Daily Rosary  
Glorious Mysteries  
Using: Caro Family Rosary  
[Begin] [Change Template] [Customize Today]

54-Day Rosary Novena  
Day 17 of 54 · Petition  
[Continue]

Chaplet of St. Michael  
Day 4 of 10  
[Begin]

[+ Start a Prayer]

If the Daily Rosary Template changes, offer Today Only or Make Default. Never silently change future Sessions.

# **9\. Start a Prayer and PrayerPlan**

* Rosary  
* Novena  
* Chaplet  
* Single Prayer  
* Saved Template  
* Custom Session

Then ask how the user wants to pray it:

* Just once  
* Daily  
* For a number of days  
* Weekly  
* Custom schedule

Use one PrayerPlan scheduling engine across structured Devotions and individual Prayers. Store `traditional_duration` separately from `chosen_duration`.

A one-time PrayerSession can exist without an ongoing PrayerPlan. Afterward the user may choose Make This Recurring.

# **9A. Optional Session Name and Session Purpose**

PrayerSession should support an optional Session Name and an optional Session Purpose. These describe the context of the whole prayer time and are different from My Intention, a sourced DevotionIntention/Petition, or the actual Prayer content.

## Session Name

Session Name answers: What do I want to call this particular prayer time? It is optional and may be left blank.

* Mom's Birthday Rosary  
* Morning Prayer  
* Family Rosary for Dad  
* Sunday Evening Prayer

## Session Purpose

Session Purpose answers: What kind of occasion or context is this Session serving? It is optional. If blank, treat it as Not Specified / Unsure and do not infer a purpose.

* Daily Devotion  
* Meditation  
* Family Celebration  
* In Memoriam  
* Discernment  
* Thanksgiving  
* Healing / Support  
* Preparation for an Event  
* Seasonal / Liturgical  
* Retreat / Quiet Time  
* Other  
* Not Specified / Unsure

Session Purpose is not the same as My Intention. Example: Session Name = "Mom's Anniversary Rosary"; Session Purpose = "In Memoriam"; My Intention = "For Mom, our family, and gratitude for her life." All may coexist in the same PrayerSession.

*Shipped note:* **[Partial]** — a single free-text Session **name** exists today (`SessionPlan.purpose` holds it). The **structured Session Purpose taxonomy** above (In Memoriam, Discernment, …) is **optional/future**; when it lands, the free-text field becomes `purpose_notes` alongside a `purpose_id` (see §31B).

# **10\. Template Creation and Overrides**

Create New Template must offer Start from Scratch or Start from Existing Template, with a real dropdown/list and Save As.

Creating from an existing Template must not mutate the source Template. Session-specific customization must not mutate the Template unless the user explicitly saves changes back.

## **10A. Session Composition, Nested Templates, and External Links**

Session Builder is the composition layer. A user may start from a Template and then add any component already available to a Session. The starting Template should not pre-populate optional components unless they are actually part of that Template.

Available additions may include a Traditional Prayer, Personal Prayer, Rosary, Novena, Chaplet, other Devotion, Open Prayer, Meditation, Reflection, Scripture, My Intention, sourced Devotion Intention/Petition, External Link, or another reusable Template.

### **Template within a Template**

ACTS should support using another Template as a reusable building block while composing a Session or Template. Treat the nested Template as a composition shortcut, not as an unresolved executable object in Active Prayer Mode.

When the Session is compiled, recursively expand the nested Template into the actual ordered SessionItems. The compiled Session is the executable source of truth. Prevent circular nesting (for example, Template A → Template B → Template A) and preserve a reasonable implementation guardrail for maximum nesting depth.

Example — Session Build  
1. Template Block: Family Rosary  
2. External Link: Pray with the Pope  
3. Open Prayer  
4. Reflection

At compile time, the Family Rosary block expands into its individual prayers and other executable items, followed by the external link, Open Prayer, and Reflection.

### **External Link as a generic Session component**

External Link is a generic TemplateItem / Session component type, not a Pope-specific object. It allows ACTS to include an externally hosted prayer experience without recreating that experience inside ACTS.

An External Link component may offer multiple approved or user-added URL options. One link is marked as the default/top option. Starting the component uses the default unless the user chooses another source. Users may add their own link, including a parish, diocese, ministry, Catholic app, or other trusted prayer source.

The External Link component should retain a label, one or more link options, a default link, optional organization/resource metadata, optional description, and optional Source reference. A link option should minimally retain label and URL.

*Shipped note:* the **External Link** component ships (`external_link` item kind + `ExternalLinkOption`, with a designated default). **Nested Templates / Template Block** is **[Future]** — the composition/compiler support is not yet built (ACTS-110; first consumer is the Rosary+Litany composition, ACTS-107).

# **11\. How To Is Different From the Prayer Session**

HowTo is instructional content. PrayerSession is the actual executable prayer experience.

**Preserve this UX concept**  
These are instructions, not the prayer session. Starting prayer expands every instruction into the actual prayers.

A How To may say "Say three Hail Marys" or "Repeat for the remaining four decades." When the user taps Start Prayer, the Session compiler must expand those instructions into the actual individual Prayer SessionItems.

| HowTo |
| :---: |
| ↓ |
| **Template / Rules** |
| ↓ |
| **Deterministic Session Compiler** |
| ↓ |
| **PrayerSession** |
| ↓ |
| **SessionItems** |
| ↓ |
| **Active Prayer Mode** |

HowTo should belong to a Devotion/DevotionVersion, not to a PrayerSession. From an active Session, the user may open How To for help and return without losing their place.

# **12\. How To Source / Provenance**

Every How To should support visible provenance. The source may be an organization, person/family, URL, imported document, or Unknown.

* Source name  
* Organization / publisher / person or family  
* URL when available  
* Original document/file when imported  
* Page/section when available  
* Provenance status: known, partially_known, unknown

**Examples**  
Source: Caro Family Rosary booklet  
Source: [Organization Name] · [URL]  
Source: Unknown

Do not leave missing provenance ambiguous. Unknown is a valid explicit state.

## Multiple Sources for a How To

A How To may have more than one source. Users must be able to add, remove, and review multiple source references for the same How To. This is useful when the instructions are supported by an official Church source, another Catholic organization, a published prayer book, and/or a family tradition.

Use a many-to-many relationship such as HowToSource rather than a single `source_id` as the only provenance mechanism. One source may be marked primary, but all retained sources remain visible.

* Primary source indicator  
* Source name / organization / person / family  
* URL  
* Original imported file  
* Page / section  
* Provenance status  
* Notes about how this source differs from or supports the How To

## Imported How To Must Be Editable

Users must be able to edit a How To after import. Editing should not destroy the imported source version. Preserve the original imported/source-backed version and save the user-edited version separately so provenance remains intact.

Recommended model: HowTo → HowToVersion. A source/import version remains preserved; a user edit creates a new HowToVersion with `edited_by_user = true` and may retain the same or additional HowToSource links.

The user can set which HowToVersion is active/default for a DevotionVersion or Template without overwriting the original source-backed instructions.

## Seed: USCCB How to Pray the Rosary

Seed the app with a Rosary How To based on the United States Conference of Catholic Bishops (USCCB) "How to Pray the Rosary" resource: https://www.usccb.org/how-to-pray-the-rosary

Use this USCCB source for the default Rosary How To, the four Mystery sets, their traditional day/season guidance, Mystery Scripture references/descriptions, and Fruit of the Mystery content where represented. Preserve USCCB as the source rather than hard-coding the instructions as unsourced app text.

The seeded How To remains editable through HowToVersion. Users may add other sources and choose a different How To version for a family or personal Template.

## **Seed: Scriptural Rosary Template**

Seed a Scriptural Rosary as a reusable Devotion Template. It should demonstrate that a Rosary decade can interleave Mystery/context text, Scripture, and reusable prayers at a fine-grained level.

Example decade sequence:

1. Mystery title plus optional description/explanation text.  
2. Optional meditation/context statement.  
3. Our Father.  
4. Scripture passage/reference.  
5. Hail Mary.  
6. Repeat Scripture → Hail Mary for the remaining decade beads, using a distinct Scripture passage before each Hail Mary.  
7. Glory Be.  
8. Optional single-line salutation/acclamation or other closing text.

The Session compiler must preserve this exact interleaving and expand it into concrete SessionItems. Scripture, description/context text, and Prayer are separate ordered components.

*Shipped note:* the **Scriptural Rosary** template is **[Shipped]** (seeded, with the interleaving above). An **auto-generated How To** exists. **HowTo versioning / multi-source (`HowToVersion`, `HowToSource`) is [Future]** — tracked as ACTS-115.

# **13\. Deterministic Session Compiler**

1. Load Template structure.  
2. Evaluate applicable rules.  
3. Resolve date/day-dependent content.  
4. Resolve Novena phase where applicable.  
5. Resolve Mystery set and MysteryContent.  
6. Resolve PrayerVersion.  
7. Resolve optional content.  
8. Expand repetition shorthand.  
9. Apply Session-level overrides.  
10. Resolve audio strategy and assignments.  
11. Create ordered SessionItems.  
12. Initialize progress and completion state.

AI may assist import analysis. After the structure is approved, runtime sequencing should be deterministic.

# **14\. Active Prayer Mode**

*What do I pray now?*

* Current Prayer title  
* Full Prayer text  
* Mystery title when relevant  
* Meditation when relevant  
* Repetition indicator  
* Subtle Session progress  
* Previous  
* Next  
* Pause  
* Done when completion tracking is active  
* Audio / Voice / Record controls as applicable

Prayer content should dominate the screen. Technology should recede.

# **15\. Audio Is a First-Class Domain** *(Future — ACTS-114)*

Audio may exist at multiple levels and should not be modeled as a single `audio_id` on Prayer.

* Prayer-level audio — one Prayer recorded by one or more people.  
* Template-level audio — preferred audio assignments or a full Template recording.  
* Session-level audio — a full recording of one Session, or item-by-item audio assignments.  
* SessionItem-level audio — a specific recording used for that occurrence.

A single Prayer may have multiple recordings by different people. Example: Grandma, Mom, Dad, the user, a child, or a family recording.

A Template may use a patchwork of recordings from different people. Example: Dad for Our Father, Grandma for Hail Mary, Mom for Fatima Prayer, family recording for the closing.

A Session may inherit Template audio, override individual items, or use one complete full-session recording.

# **16\. AudioRecording Model and Reuse**

Recordings should exist independently so they can be reused across Templates and Sessions.

* `recording_scope`: prayer, template, session, session_item  
* `recording_type`: single_prayer, session_item, full_session, meditation, instructional  
* speaker/person metadata  
* audio URL/storage reference  
* duration  
* transcript when available  
* source/provenance  
* `recorded_in_app` flag  
* created_at / updated_at

TemplateAudioAssignment and SessionAudioAssignment should reference reusable AudioRecording records rather than duplicating media.

# **17\. Full-Session Audio vs. Assembled Audio**

## **Full-session recording**

One continuous recording for the entire PrayerSession or Template. Useful for listening while driving or praying along with a family recording.

## **Assembled audio**

The Session is built from Prayer- or SessionItem-level recordings and may mix speakers. The user can still see the underlying PrayerSession and SessionItems.

Template audio preference may be: none, assembled, or full_session_when_available.

# **18\. Session Audio Playback and Progress Modes**

Separate playback mode from navigation/progress mode.

## **Playback modes**

* None  
* Full Session Audio  
* Item-by-Item Audio

## **Navigation / progress modes**

* Manual Scroll — audio may play, but user controls movement.  
* Audio Auto-Advance — audio completion may mark the SessionItem complete and advance.  
* Voice Follow — microphone estimates where the user is in the prayer and advances appropriately.  
* Hybrid — the Session can mix listening, praying aloud, manual movement, and auto-advance.

Progress behavior may be set at the Session level and overridden at the SessionItem level.

Voice Follow should tolerate pauses, accents, group prayer, natural cadence, slight wording differences, and skipped words. It should not score pronunciation or prayer performance. If confidence is low, remain on the current item and allow manual Next/Done.

# **19\. Record Audio During a Session**

Active Prayer Mode must offer Record Session as an explicit option.

* Record the entire PrayerSession as one audio recording.  
* Optionally support item-level recording later.  
* Continue manual navigation or voice-follow while recording.  
* Preserve the original PrayerSession and SessionItems underneath the recording.

**Important behavior**  
Recording a Session creates a reusable AudioRecording. It does not alter the Prayer or Template unless the user explicitly chooses to save or assign the recording there.

After recording completes, offer options such as Save to This Session Only, Save as Reusable Full-Session Recording, Use With This Template, Add to My Audio Library, or Discard.

# **20\. Microphone Privacy States**

**Voice Follow**  
Microphone is being used to follow where you are in the prayer. Audio is not saved.

**Record Session**  
Your prayer audio is being recorded and will be saved when you finish.

The UI must make these states unmistakably different.

# **21\. Audio Usage Tracking**

Track when and how audio is used so the user can understand the history of recordings and the system can support future personalization and preservation.

* audio_recording_id  
* user_id  
* used_at / date  
* prayer_id when applicable  
* template_id when applicable  
* session_id when applicable  
* session_item_id when applicable  
* usage_type: played, recorded, assigned, inherited, overridden  
* playback_mode  
* progress_mode  
* started_at  
* ended_at  
* completion_status if relevant

Audio use should be traceable by Prayer, Template, Session, SessionItem, date, and person/speaker where applicable.

# **22\. Rosary, Mysteries, Novenas, and Chaplets**

## **Mystery model**

* MysterySet — Joyful, Sorrowful, Glorious, Luminous  
* Mystery — e.g., The Annunciation  
* MysteryContent — title, short description, meditation, Scripture, family/devotion-specific variant, audio, image

Mystery is not a Prayer.

*Shipped note:* each Mystery supports **multiple selectable bodies** (e.g. a reflection, a USCCB Scripture set, or a meditation); the body is chosen at the Devotion and Session level (`mystery_body` in SessionContext) and the compiler splits it across the decades. A version-authoring editor exists for these bodies.

## **Rosary**

Support opening prayers, Mystery sets, decades, repetitions, after-decade prayers, closings, family additions, Intentions, and Mystery presentation options.

## **Novena**

Do not assume all Novenas are nine days. Support 3-day, 9-day, 54-day, custom duration, phases, day-specific content, repeating cycles, nested Devotions, and Intentions.

## **Chaplet**

Use one generic Template/Session architecture. Do not create a separate engine for each Chaplet.

# **23\. Acceptance-Test Sources**

* Caro Family Rosary — detect reusable Prayers, family-specific Prayers, PrayerVersions, HowTo, Mystery schedule, repetitions, closings, family additions, and create a reusable Caro Family Rosary Template.  
* 54-Day Rosary Novena — detect Devotional Prayer, Novena, nested Rosary, 54-day duration, Petition and Thanksgiving phases, Mystery rotation, meditations, repetition rules, and correct day-specific Sessions.  
* Chaplet of St. Michael — detect Chaplet structure, nine salutations, repeated Our Father/Hail Mary groups, additional Our Fathers, closings, and allow one-time or multi-day PrayerPlans.  
* Single Prayer — allow Pray Now or recurring PrayerPlan.

Source basis: the supplied family Rosary booklet, Fifty Four Day Novena document, and Chaplet of St. Michael source. These are acceptance tests, not hard-coded special cases.

# **23A. Seeded Traditional Prayers and Open Prayer**

## Seeded Traditional Prayer Library

The app should ship with a starter collection of Traditional Prayers sourced from the USCCB Basic Prayers resource: https://www.usccb.org/prayer-and-worship/prayers-and-devotions/prayers/basic-prayers

Seed the available basic prayers from that collection as reusable Prayer + PrayerVersion records with USCCB source/provenance metadata. The starter collection should include the prayers exposed by the USCCB Basic Prayers page at build time, such as the Our Father, Hail Mary, Glory Be, Prayer to Your Guardian Angel, Morning Offering, Nicene Creed, Apostles' Creed, Act of Contrition, Act of Faith/Hope/Love, Angelus, Regina Caeli, Anima Christi, Divine Praises, Hail Holy Queen, Memorare, Chaplet of Divine Mercy, O Sacrum Convivium, Tantum Ergo, and Prayer to Our Lord Jesus Christ Crucified.

The USCCB starter library is a seed and preferred reference source, not a closed catalog. Import remains required because valid Catholic devotions and prayers may come from other Catholic organizations, published sources, parishes, family traditions, personal traditions, or unknown sources.

*Shipped note:* the **USCCB Basic Prayers** seed library is **[Shipped]** (`src-usccb` sources, with provenance).

## Open Prayer — Free-Form Prayer From the Heart

Open Prayer is a first-class Session component for free-form personal prayer. It is different from My Intention/UserIntention and from a sourced DevotionIntention or Petition. My Intention answers why I am praying; a sourced DevotionIntention/Petition is part of the devotion; Open Prayer captures the actual words I choose to pray from my heart.

Open Prayer supports three creation/capture moments:

* From the Prayer Library: choose Open Prayer, type or speak a prayer, and optionally Save as Prayer. Saving creates a reusable Personal Prayer + PrayerVersion, typically categorized as Other/Personal with Source = Personal.  
* While building a Template or one-time Session: add Open Prayer and choose Write Now, Speak Now → Transcribe, or Leave Open Until Session.  
* During Active Prayer Mode: when the Session reaches an Open Prayer item, offer Write, Speak, or Pray Without Capturing. If transcription is enabled, spoken words are transcribed and saved to that Session; the user may optionally Save as Reusable Prayer afterward.

## Transcription Control During a Session

Transcription of free-form prayer must be optional and controllable for the Session. The user can turn Transcribe Open Prayer On or Off before or during the Session. If Off, the user may pray aloud without saving audio or text.

Keep microphone behaviors distinct: Voice Follow uses the microphone for navigation and saves neither audio nor text; Transcribe Prayer uses the microphone to create text and does not require saving audio; Record Session saves audio and may optionally create a transcript.

## Shared Text / Voice Capture for Intention and Petition

My Intention/UserIntention, user-fillable Petition/DevotionIntention, and Open Prayer remain separate domain concepts, but they should share a reusable text/voice capture experience. When adding one to a Session, allow the user to type it, speak it for transcription, leave it blank until Active Prayer Mode where appropriate, or continue without capture.

A PrayerPlan may have an overall UserIntention while a specific PrayerSession may also capture a day-specific UserIntention. Neither should overwrite sourced DevotionIntentions/Petitions.

*Shipped note:* **Open Prayer is [Future]** — there is no `open_prayer` item kind yet (ACTS-108). JC wants it.

# **23B. Meditation, Open Prayer, and Reflection**

Keep Meditation, Open Prayer, and Reflection as distinct concepts even though a single Session may naturally move from one into another. The distinction is based on function, not whether the user types or speaks.

## Meditation

Meditation is a first-class prayer expression and Session component: a prayerful process of seeking, pondering, understanding, discerning, and responding. It may be rooted in Scripture, a Mystery, an icon/image, liturgical text, spiritual writing, creation, or a discernment question.

Meditation asks: What am I prayerfully considering?

Meditation may be silent, guided, written, or spoken. A user may complete a Meditation without producing any text. If the user chooses to capture what arose during the Meditation, that captured response should become a linked Open Prayer or Reflection depending on what the user is doing.

## Open Prayer

Open Prayer is the user's own prayer words addressed to God, spoken or written from the heart. It is not defined by the medium: an Open Prayer may be typed, spoken and transcribed, recorded, or prayed without capture.

Open Prayer asks: What am I saying to God in my own words?

## Reflection

Reflection remains the user's own words about what they noticed, learned, felt, questioned, or want to remember. Reflection is not necessarily addressed to God and remains the underlying architecture even when the UI offers an "Open Dialogue" capture mode.

Reflection asks: What did I notice, learn, feel, or want to remember?

## Natural Session Flow

A Session may optionally support this flow without forcing it:

* Meditate — sit with Scripture, a Mystery, a prompt, or a discernment question.  
* Open Prayer — respond to God in the user's own words.  
* Reflect — capture what the user noticed or wants to remember.

Meditate → Open Prayer → Reflect

This flow is especially useful for purpose and discernment questions such as: "Lord, what do you want me to do?" It should remain optional and user-led.

## Meditation Session Behavior

* Allow a Meditation SessionItem to contain a title, prompt, source content, Scripture reference, Mystery link, optional suggested duration, and Source.  
* Allow the user to remain in silence and continue without capture.  
* Optionally offer: Pray in My Own Words, Write My Prayer, Speak My Prayer, Reflect, or Continue in Silence.  
* If the user chooses Pray in My Own Words, create/capture an Open Prayer response.  
* If the user chooses Reflect, create a linked Reflection in the user's own words.  
* Do not automatically convert a Meditation into an Open Prayer or Reflection.

*Shipped note:* a `meditation` item kind exists and **Lectio Divina** ships as a four-movement devotion whose Reflect movement is a first-class session step (see §28). **Open Prayer** and the fuller Meditation prompt/duration/response model are **[Future]** (Meditation overlaps Lectio today; Open Prayer = ACTS-108).

# **24\. Need / Situational Prayer**

*What's on your heart?*

* Health  
* Work & Job  
* Family  
* Grief  
* Anxiety  
* Guidance  
* Relationships  
* Forgiveness  
* Gratitude  
* Protection  
* Special Intention

MVP recommendation model: Situation → Tags → trusted Prayer experiences. Recommendations may include an individual Prayer, Rosary, Novena, Chaplet, or Meditation.

Actions: Pray Now or Create PrayerPlan. Do not build an AI spiritual director.

# **25\. Intentions**

Intention answers: Why am I praying?

* Mom's health  
* Find meaningful work  
* Give thanks  
* Help me discern this decision  
* Help me understand where I am called to serve  
* Help me use my gifts  
* Help me grow in patience

Intentions may represent petition, discernment, growth, vocation, service, surrender, or thanksgiving.

# **25A. My Intention vs. Source / Devotion Intention**

Keep these as separate concepts. They can overlap, but they answer different questions.

## My Intention (UserIntention)

Answers: Why am I personally praying this prayer or devotion today, or during this PrayerPlan?

* For my interview tomorrow and guidance about whether this role is right for me.  
* For Mom's recovery.  
* In thanksgiving for my daughter's graduation.  
* Help me understand where I am called to serve.  
* Help me grow in patience.

A user intention is not necessarily a petition. It may express petition, intercession, thanksgiving, discernment, remembrance, growth, surrender, or another personal reason for praying.

## Source / Devotion Intention (DevotionIntention)

Answers: What does the source or devotion itself invite the person to pray for or about?

Example: "For those seeking employment, that they may find work that respects their dignity."

A sourced devotion intention may have a Prayer Form such as petition, intercession, thanksgiving, praise, or adoration. It belongs to the imported or canonical devotion content and should retain its Source.

## Illustrated example: both can coexist

SOURCE / DEVOTION INTENTION  
For those seeking employment, that they may find dignified work.

MY INTENTION  
For my interview tomorrow, and for guidance about whether this role is right for me.

Both may be attached to the same PrayerSession. Neither overwrites the other.

## Recommended model update

* Rename the current personal Intention concept to UserIntention in the domain model, even if the UI continues to say "My Intention."  
* Add DevotionIntention for sourced or devotion-defined intentions.  
* Allow `DevotionIntention.prayer_form_id` to reference the Church's five forms of prayer.  
* Allow both UserIntention and DevotionIntention to link to the same PrayerPlan or PrayerSession.

*Shipped note:* today there are `intention` and `petition` item kinds, but **no UserIntention / DevotionIntention split** — **[Future]**, low priority (ACTS-111).

# **25B. Prayer Forms and Devotion Components**

The Church's five forms of prayer are a separate taxonomy from Prayer Type and Expression Type. Keep all three dimensions distinct.

## PrayerForm

* Blessing / Adoration  
* Petition  
* Intercession  
* Thanksgiving  
* Praise

PrayerExpression remains Vocal, Meditation, and Contemplation. PrayerType remains the broad prayer category such as Liturgical or Devotional. ACTS may be the consumer brand/mnemonic; it should not replace the five-form data taxonomy.

## Devotion component types

A DevotionVersion or PrayerTemplate may be composed from several kinds of content. Do not assume every executable item is a Prayer.

Include External Link and Template Block among the supported compositional item types. External Link opens an externally hosted prayer experience; Template Block references a reusable Template during composition and is recursively expanded into SessionItems at compile time.

* Prayer — reusable prayer text such as Our Father or Hail Mary.  
* Dialogue / Response — structured V./R. or leader/all lines.  
* DevotionIntention — a source-defined intention or petition associated with the devotion.  
* Mystery — Rosary-specific Mystery content and rules.  
* Scripture / Reading — a Scripture reference or reading included by the source.  
* Meditation — sourced meditation content distinct from the user's own Reflection.

Reference content such as How To, History / Background, and Practice Guidance / When to Pray belongs to the Devotion reference layer rather than being treated as an executable SessionItem unless explicitly included in the prayer flow.

## **Executable Context / Text**

A Prayer Session may contain ordered text that is meant to be encountered during prayer but is not itself a reusable Prayer. This is important for Scriptural Rosaries, meditations, family devotions, sourced prayer guides, and other prayer experiences.

Add a generic executable Text / Context component. Suggested roles include `mystery_intro`, `description`, `explanation`, `historical_context`, `meditation_prompt`, `acclamation`, `salutation`, `instruction_in_session`, and other. A component may retain its own Source reference.

Do not force descriptive or explanatory text into Prayer. Do not force all such text into How To either. How To explains how a devotion works; executable context is intentionally shown at a specific point inside the actual Prayer Session.

Dialogue / Salutation must support one or more lines. A response is optional. This allows a single salutation or acclamation without inventing a V./R. structure.

*Shipped note:* **[Shipped]** — executable Text/Context ships via `scripture`, `heading`, and `custom` item kinds; **Dialogue / Salutation** ships via the `salutation` kind (call = label, refrain = body — the basis for the seeded litanies); **External Link** ships (`external_link`). **Prayer Forms** (the five-form `prayer_form` taxonomy) and **Template Block** are **[Future]** (ACTS-112, ACTS-110).

# **25C. Illustrated Import Behavior — Import a Devotion or How To**

Import must remain a core capability because not every Catholic devotion appears in the preferred reference library. The Chaplet of St. Michael is a practical example: a user may need to import a devotion from another Catholic organization, prayer book, family source, website, PDF, or unknown source.

Import entry points include uploaded files/documents, supported URLs, and pasted text entered directly by the user. Pasted text is a first-class import path.

For pasted text, run the same IMPORT → ANALYZE → MATCH → PROPOSE → REVIEW → SAVE workflow. Detect reusable Prayer/PrayerVersion, Scripture/reference, Mystery title, executable description/context, Dialogue/Salutation, Meditation, DevotionIntention, repetition, sequence, schedule/duration rules, and Source/provenance when supplied.

## Import flow

IMPORT → ANALYZE → MATCH → PROPOSE → REVIEW → SAVE

The MATCH step is required. Importing a Devotion or How To may discover reusable Prayers that already exist in the Prayer Library, alternate versions of existing Prayers, or genuinely new Prayers that should be created only after review.

## Example: Import "How to Pray the Chaplet of St. Michael"

### 1. ANALYZE

* Recognize Devotion: Chaplet of St. Michael.  
* Recognize Devotion Type: Chaplet.  
* Extract How To / sequence.  
* Detect nine salutations or dialogue components.  
* Detect repeated Our Father and Hail Mary instructions.  
* Detect closing prayers.  
* Capture Source name, organization/person/family, URL or file, page/section, and provenance status.

### 2. MATCH reusable prayers

Our Father — Existing Prayer found.  
Options: Use Existing · Compare Versions · Save Imported as Alternate Version.

Hail Mary — Existing Prayer found.  
Options: Use Existing · Compare Versions · Save Imported as Alternate Version.

Closing Prayer — No confident Prayer match found.  
Options: Create New Prayer · Match to Existing Prayer · Ignore.

### 3. PROPOSE structured objects

* Create or link Devotion and DevotionVersion.  
* Create HowTo and HowToSteps.  
* Reuse existing Prayer records where appropriate.  
* Create new Prayer + PrayerVersion only for content the user approves as new.  
* Create Dialogue / Response components for V./R. or salutation structure.  
* Create DevotionIntention components if the source includes petitions/intentions.  
* Create repetition rules and ordering.  
* Create History and PracticeGuidance if present.  
* Link every imported/derived object back to Source.

### 4. REVIEW before save

The user reviews the proposed structure and can change matches, choose alternate PrayerVersions, edit source metadata, or exclude content. The importer never silently commits inferred structure.

### 5. SAVE

Saving the Devotion may therefore grow the Prayer Library at the same time. New reusable Prayers are created only when they do not already exist or when the user intentionally preserves an alternate PrayerVersion.

## Illustrated object flow

Imported Devotion / How To  
↓  
Detect components  
↓  
Prayer? → Existing: link it | New: propose Prayer + PrayerVersion  
↓  
Dialogue / Response? → create/link Dialogue  
↓  
Source / Devotion Intention? → create DevotionIntention  
↓  
Mystery / Scripture / Meditation? → match or create sourced content  
↓  
How To? → create HowTo + Steps  
↓  
History / Practice Guidance? → preserve as reference content  
↓  
User reviews everything  
↓  
Save approved structure

## Data model implications

* UserIntention — personal reason for praying; UI label may be "My Intention."  
* DevotionIntention — sourced intention/petition with `source_id` and optional `prayer_form_id`.  
* PrayerForm — blessing/adoration, petition, intercession, thanksgiving, praise.  
* DevotionComponent — generic ordered component with `component_type` and `source_id`.  
* Dialogue + DialogueLine — supports V./R., leader/all, and other response structures.  
* DevotionHistory — source-preserved history/background.  
* PracticeGuidance — traditional schedule, liturgical season, suggested duration, recommended context, or custom guidance.

*Shipped note:* **[Partial]** — the importer runs ANALYZE → PROPOSE → REVIEW → SAVE and never silently commits guesses, but the **library-dedupe MATCH step is not built** (it proposes rather than reconciling against existing Prayers). Real OCR of uploaded documents is ACTS-81; JC chose to keep the current partial state open (no new story).

# **25D. Resource Directory**

ACTS should include a curated and extensible Resources page for external Catholic/Christian apps, ministries, programs, publishers, and formation tools. Resources link externally rather than requiring ACTS to reproduce third-party content.

Users should be able to add resources over time, save favorites, and when appropriate connect a Resource to Daily Word, a Bible Program, Prayer, or Life Library.

## **Seed Resources**

* Hallow — audio-guided meditations, Rosary, sleep prayers, and seasonal prayer challenges; free content with optional subscription offerings.  
* Laudate — broad Catholic reference/app resource including Daily Mass readings, Liturgy of the Hours, confession resources, Catechism, and prayer content.  
* Amen — daily Scripture, meditations, and audio prayer.  
* iBreviary — Liturgy of the Hours / Divine Office and Roman Missal resources.  
* Pray As You Go — short daily audio prayer sessions rooted in Ignatian spirituality.  
* Ascension — faith-formation programs, including programs such as The Bible in a Year.

## **Resource Fields**

* name  
* description  
* best_for  
* resource_type  
* organization  
* url  
* app_store_url  
* play_store_url  
* access_model  
* cost_notes  
* tags  
* is_featured  
* is_seeded  
* created_by  
* created_at  
* updated_at

Keep Resource separate from Source. Source answers where specific prayer/devotion/content came from. Resource answers what external tool, program, organization, or app may support the user's prayer, Scripture, learning, or formation.

*Shipped note:* the Resource Directory ships **completed via Vessels** (§27) — the external-resource role is served by the Vessels knowledge model rather than a standalone Resources page with the v8 resource fields above. **Open question for JC:** does Vessels need the v8 resource fields (`app_store_url`, `access_model`, `best_for`) + external-app seeds (Hallow, Laudate, …), or is the current Vessels model enough?

## **25E. Seeded Template — Pray with the Pope**

ACTS should ship with "Pray with the Pope" as an available default Prayer Template, similar to the Rosary being an available default Template. It is optional: the user does not have to add it to a PrayerPlan or daily routine.

The seeded Template should remain intentionally minimal. Its required content is one External Link component labeled "Pray with the Pope." The link component may contain multiple source/provider URLs, with the top/primary option marked as the default.

Seed source options may include the Pope's Worldwide Prayer Network, a Hallow implementation, or a regional network such as Pope's Prayer Network USA, subject to content/link validation and product/legal review. The user may add or choose a different link, including a church or parish source.

Do not create Pope-specific intention entities for MVP. Reuse existing Session fields. Session Name may be "Pope's Monthly Intention," while Session Purpose may contain the current intention/context if the user chooses to enter it. My Intention remains separate and optional.

### **Building a Session from this Template**

The Pray with the Pope Template itself does not automatically include Open Prayer, Reflection, Rosary, or other optional components. Those are added only when the user builds/customizes the Session or saves a customized Template.

If the resulting Session contains only the External Link, starting the Session may simply surface the link action and take the user to the default external prayer experience. If the user adds other Session components, ACTS should execute them in the user-defined order.

Example  
Session Name: Pope's Monthly Intention  
Session Purpose: [optional current intention/context]  
1. External Link — Pray with the Pope [default source]

Customized example  
1. Family Rosary Template Block  
2. External Link — Pray with the Pope  
3. Open Prayer  
4. Reflection

### **Landing / Home behavior for MVP**

The MVP need is simple access from the Pray / Today's Devotions landing experience. If the user has enabled or selected Pray with the Pope, show it as a prayer option that can be started like other prayer Templates. Do not build a separate Pope prayer toolkit or dedicated content-management subsystem for MVP.

*Shipped note:* **[Shipped]** — the "Pray with the Pope" Template **is seeded** (`tpl-pray-with-pope`, with a Vatican News link as its External Link). Correcting an earlier "dropped from seed" note: it is present. What remains is **surfacing it on Home as a daily session** — ACTS-109.

# **26\. Daily Word**

*Shipped note:* the Word card now **names the liturgical day** (season + saint / feast / solemnity, computed locally in `src/lib/liturgical/calendar.ts` — no DB map), and **Bible deep-linking** is live: the user sets their preferred Bible app and translation in Settings, and ACTS opens passages there rather than embedding licensed text.

Let the user choose Daily Mass Readings, Bible in a Year, Both, or Neither. Build source links and progress tracking without copying licensed content into the MVP.

## **Daily Mass Readings**

* Open Source  
* Mark Read  
* Heard at Mass  
* Reflect

## **MassExperience**

* Date  
* Church/parish  
* Location  
* Priest / celebrant  
* Mass time  
* Notes  
* Daily Reading reference

## **Homily**

* Priest/speaker  
* Church  
* Date  
* Title  
* Notes  
* Source URL  
* Audio attachment  
* Video attachment  
* Transcript  
* Transcription status

Actions: Add Notes, Attach Audio, Attach Video, Paste URL, Transcribe, Reflect. If transcription is unavailable, show an honest pending/not-connected state.

## **Bible in a Year**

Store name, provider, source URL, start date, total days, current day, and status. Home should show Day X of Y, Open Today's Program, Mark Complete, Reflect.

# **27\. Faith Learning / Life Library → Vessels**

Use Faith Learning as the user-facing dashboard label. Use Learning as the underlying domain field/object. Use Life Library as the name of the user's collection.

Life Library may contain books, videos, articles, newsletters, social media posts, podcasts, sermons/homilies, shows/documentaries, courses, and other material the user is reading, watching, listening to, saving, or studying.

Faith Learning is not a disconnected content tracker. Each item should be able to connect to Reflection so the user can capture what stood out, a question, a connection, or something they want to carry forward.

Home shows LifeLibraryItems with status = in_progress, approximately three before View All In Progress.

* Book  
* Article  
* Newsletter  
* Video  
* Sermon/Homily  
* Podcast  
* Show/Documentary  
* Other

Statuses: Not Started, In Progress, Finished. MVP is logging only; semantic search comes later.

*Shipped note:* this ships as **Vessels** — the chosen product label — a **Vessel → Channel → Content** model (a Vessel is an author/voice; content is attributed to them, with types including Book, Article, Video, Homily, Podcast, and Quote). "Faith Learning / Life Library" from v8 **describes what it is**; Vessels is the name. It unifies v8's Learn, Programs, and Resource Directory (§25D) into one library with a "By Vessel" grouped view and search.

# **28\. Reflection**

*Shipped note:* **reflection is a first-class session step** (not only a Home prompt). **Lectio Divina** ships as a four-movement devotion (Read / Reflect / Respond / Rest) whose Reflect movement captures the user's own words inline and dual-links that Reflection to both the movement and the session. A per-session Scripture passage opens empty (reference-only, Open-in-Bible, paste-propagation) so nothing licensed is stored. **Open Dialogue** is a shipped Reflection capture mode (`ReflectionMode: open_dialogue`). Reflection redesign — inspiration-in-view, voice note, and photo→OCR capture — is planned (ACTS-103).

Home prompt: What stayed with you today?

* What stood out?  
* What are you praying about?  
* What are you wrestling with?  
* What did you hear?  
* What are you grateful for?  
* What do you want to remember?  
* What do you feel called to consider?  
* Is there something you want to do differently?

Use flexible ReflectionLink relationships so one Reflection can connect to multiple objects.

Reflection may capture a connection across Prayer, Word, Faith Learning, Mass, lived experience, or another Reflection. A connection can later become evidence for an Insight and, when the user chooses to name and keep it, Wisdom.

* What connection did you make?

# **29\. Internal Calendar and Future External Calendar**

MVP internal Calendar supports Today, Week, and Month and may show Daily Rosary, Novena days, Chaplet plans, recurring individual Prayers, Bible Program plans, and custom practices.

Home remains the primary place to begin prayer.

Future external integration may support Google Calendar, Apple Calendar, Outlook, tasks, and reminders. Faith Journey remains the source of truth.

* PrayerPlan: recurrence_rule, preferred_time, timezone  
* PrayerSession: scheduled_start_at, scheduled_end_at, is_all_day  
* Prepare ExternalCalendarLink  
* Stable PrayerSession IDs for future deep links

# **30\. Import and Source Preservation**

| UPLOAD |
| :---: |
| ↓ |
| **ANALYZE** |
| ↓ |
| **PROPOSE** |
| ↓ |
| **REVIEW** |
| ↓ |
| **SAVE** |

Initial formats: PDF, Word/text, pasted text, and supported URL/source input. Importer may identify Prayer, PrayerVersion, Devotion, DevotionVersion, Template, HowTo, Mystery, MysteryContent, Scripture/Reading, executable Text/Context, Dialogue/Salutation, Meditation, repetition rules, conditionals, phases, duration, Source, and audio references where applicable.

Never silently commit importer guesses.

When imported Prayer text resembles an existing Prayer, offer Use Existing, Use Imported, Save as Alternate Version, or Compare.

Source records should support source_type, name, organization/person/family, URL, original file, page/section, provenance status, metadata, and created_at.

# **31\. Final MVP Data Model Additions**

In addition to the core models already defined, include the following audio and provenance models/fields.

## **AudioRecording**

* id  
* recording_scope  
* recording_type  
* prayer_id  
* template_id  
* session_id  
* session_item_id  
* title  
* speaker_name  
* speaker_person_id  
* audio_url / storage reference  
* duration_seconds  
* transcript  
* source_id  
* recorded_in_app  
* created_at  
* updated_at

## **TemplateAudioAssignment**

* id  
* template_id  
* template_item_id  
* prayer_id  
* audio_recording_id  
* position  
* is_default

## **SessionAudioAssignment**

* id  
* session_id  
* session_item_id  
* audio_recording_id  
* source_type: template_default, session_override, full_session_recording

## **AudioUsageEvent**

* id  
* audio_recording_id  
* user_id  
* prayer_id  
* template_id  
* session_id  
* session_item_id  
* usage_type  
* playback_mode  
* progress_mode  
* started_at  
* ended_at  
* used_at  
* completion_status  
* created_at

## **HowTo / Source enhancements**

* HowTo.subtitle  
* HowTo.source_id  
* Source.organization  
* Source.author_or_person  
* Source.page_or_section  
* Source.provenance_status

## **PrayerTemplate audio fields**

* default_progress_mode  
* default_playback_mode  
* default_auto_advance  
* preferred_audio_strategy

## **PrayerSession audio fields**

* progress_mode  
* playback_mode  
* auto_advance  
* active_audio_strategy  
* recording_enabled  
* active_recording_id

# **31A. Additional Data Model Updates — Traditional Prayer, How To Versions, Open Prayer**

## Prayer

* `prayer_origin_type`: traditional, family_tradition, personal, published_or_imported, unknown  
* Traditional is the user-facing term for established Catholic prayers; do not use "formula prayer."

## HowToVersion

* id  
* how_to_id  
* version_name  
* content / structured_steps  
* edited_by_user  
* based_on_version_id  
* is_default  
* created_at  
* updated_at

## HowToSource

* id  
* how_to_id or how_to_version_id  
* source_id  
* is_primary  
* notes

## OpenPrayerPrompt

* id  
* title  
* prompt_text  
* allow_prewrite  
* allow_session_entry  
* allow_voice_input  
* default_transcription_enabled  
* allow_save_as_prayer  
* source_id when applicable

## SessionOpenPrayer

* id  
* session_item_id  
* session_id  
* user_id  
* prompt_id  
* captured_text  
* capture_method: typed, voice_transcription, audio_recording, uncaptured, prewritten  
* transcription_enabled  
* audio_recording_id when explicitly recorded  
* saved_as_prayer_id when converted to reusable Prayer  
* created_at  
* updated_at

## SessionUserIntention

* id  
* session_id  
* user_intention_id  
* text  
* capture_method  
* transcription_enabled  
* created_at

## Session microphone / capture settings

* voice_follow_enabled  
* transcribe_open_prayer_enabled  
* record_session_enabled

## **Resource**

* id  
* name  
* description  
* best_for  
* resource_type  
* organization  
* url  
* app_store_url  
* play_store_url  
* access_model  
* cost_notes  
* tags  
* is_featured  
* is_seeded  
* created_by  
* created_at  
* updated_at

*Shipped note:* these models are **[Future]** except where reality already covers them: `prayer_origin_type` grouping (ACTS-112), HowToVersion/HowToSource (ACTS-115), OpenPrayerPrompt/SessionOpenPrayer (ACTS-108), and SessionUserIntention (ACTS-111) are not built. The **Resource** role is served today by the Vessels model (§27), not this field set.

# **31B. Additional Data Model Updates — Session Purpose and Meditation**

## SessionPurpose

* id  
* name  
* description  
* is_system_seeded  
* created_at  
* updated_at

## PrayerSession additions

* name — optional user-facing Session Name  
* purpose_id — optional reference to SessionPurpose  
* purpose_notes — optional free text when Other is selected or more context is desired

## Meditation

* id  
* title  
* prompt  
* content  
* scripture_reference  
* mystery_id when applicable  
* source_id  
* suggested_duration_seconds or minutes  
* allow_open_prayer_response  
* allow_reflection_response  
* allow_voice_input  
* allow_transcription  
* created_at  
* updated_at

## Meditation response links

Meditation itself remains the prayer experience. A user response should be stored as its own linked object rather than overwriting the Meditation.

* Meditation → SessionOpenPrayer when the user responds to God in their own words.  
* Meditation → Reflection when the user captures what they noticed, learned, felt, or wants to remember.  
* Meditation → no captured response when the user remains in silence or simply continues.

## Reflection capture mode

* written  
* spoken_transcription  
* open_dialogue

Open Dialogue is a user-facing Reflection capture mode. Reflection remains the underlying domain object.

*Shipped note:* the **Reflection capture mode** ships (`open_dialogue` is live). **SessionPurpose** and the structured **PrayerSession.purpose_id / purpose_notes** are **[Future]** — today one free-text name exists (`SessionPlan.purpose`, see §9A). The fuller **Meditation** model is **[Future]**; a `meditation` item kind exists and overlaps Lectio.

## **31C. Additional Data Model Updates — External Links and Nested Templates**

### **ExternalLinkComponent / ExternalLinkOption**

ExternalLinkComponent  
- id  
- title / label  
- description optional  
- default_link_option_id  
- resource_id optional  
- source_id optional  
- created_at  
- updated_at

ExternalLinkOption  
- id  
- external_link_component_id  
- label  
- url  
- organization optional  
- resource_id optional  
- source_id optional  
- sort_order  
- is_default  
- created_by_user_id optional

Exactly one option should be treated as the effective default when options exist. The user can change the default or add a custom link without modifying the seeded source record globally unless they explicitly have administrative rights.

### **Template Block / Nested Template**

A TemplateItem may reference another PrayerTemplate as a Template Block. Preserve the referenced `template_id` and its position/configuration during composition. The Session compiler recursively resolves the block into concrete SessionItems. Do not leave unresolved Template Blocks in Active Prayer Mode.

Validation must reject circular references and compiler recursion must be bounded. Compiled SessionItems should retain lineage metadata back to the source Template/TemplateItem when useful for provenance, debugging, and later editing.

*Shipped note:* **ExternalLinkComponent / ExternalLinkOption** ship (`external_link` kind + `ExternalLinkOption`). **Template Block / Nested Template** is **[Future]** (ACTS-110).

# **32\. Future Architecture Appendix**

## **Purpose / Discernment**

Do not build a large Purpose module in MVP. Preserve the ability to later connect purpose statements, vocation questions, decisions, gifts/strengths, responsibilities, values, people served, questions for spiritual direction, actions, next steps, outcomes, Reflections, Intentions, learning, and Scripture.

## **Future Insights**

Future Insights may surface recurring topics, changing language, recurring Intentions, repeated discernment questions, recurring Scripture or learning themes, relationships between Prayer and life experience, prior Reflections worth revisiting, and grounded encouragement. Each Insight should retain evidence links so the user can ask Why am I seeing this?

## **Future Wisdom**

Wisdom is a user-owned outcome of Learning and Reflection: an understanding, principle, connection, or truth the user intentionally wants to carry forward. Example: a Learning item about forgiveness may lead to the Reflection "I keep confusing forgiveness with allowing the same behavior." The user may choose to save the resulting Wisdom: "Forgiveness and boundaries can coexist."

AI may surface a grounded candidate such as: "You've expressed this idea several times. Would you like to save it as Wisdom?" It must not state that this is what God is teaching the user or present Wisdom as divine certainty.

Future relationships should allow Wisdom to retain evidence links to the Reflections, Learning items, Prayer Sessions, Scripture/Word, Mass experiences, or lived-experience records that support it.

### **Future Wisdom data shape**

Do not require this object for MVP, but keep the architecture compatible with a future user-owned Wisdom record.

* id  
* user_id  
* title optional  
* wisdom_text — the user's chosen wording  
* status — candidate / saved / archived  
* created_from — user / surfaced_candidate  
* evidence_links — references to supporting Reflections, Learning items, Prayer Sessions, Word/Scripture, Mass experiences, or lived-experience records  
* created_at  
* user_confirmed_at

A surfaced candidate is not Wisdom until the user chooses to save or confirm it.

*Note:* Insights + Wisdom are a designed pair (future longitudinal intelligence) — tracked together as ACTS-113.

## **Future Learning Companion**

Faith Journey should be capable of connecting to a separate, more robust faith-learning experience for people exploring Christianity, considering conversion, returning to faith, or studying Scripture, theology, history, and traditions. The learning companion asks, "What am I trying to understand?" Faith Journey asks, "How is what I believe, learn, pray, and experience shaping how I live?"

Life Library can become the bridge between these systems.

# **33\. Design Principles**

* Reverent  
* Peaceful  
* Warm  
* Contemporary  
* Personal  
* Quiet  
* Accessible  
* Uncluttered  
* Encouraging

Avoid productivity-dashboard aesthetics, task-manager pressure, social-feed patterns, prayer performance scoring, leaderboards, guilt-based streaks, manipulative engagement, or AI speaking with spiritual authority.

# **34\. MVP Definition of Done**

*This is the target definition of done from v8, preserved in full. See "What's shipped today" above for current status against it.*

1. Open Home and immediately see today's PrayerSessions.  
2. Enable Daily Rosary and see today's Mystery and selected Template.  
3. Change today's Template without changing future default unless explicitly chosen.  
4. Create a Template from scratch or from an existing Template.  
5. View How To instructions with visible Source/provenance and Start Prayer into a fully expanded Session.  
6. Return from How To to an active Session without losing place.  
7. Start a one-time Prayer or create a recurring PrayerPlan.  
8. Start 3-, 9-, 54-, or custom-day Devotions.  
9. Follow every actual Prayer occurrence in correct order; repetitions are expanded.  
10. Use Scroll Only or Manual Done.  
11. Assign multiple audio recordings to a Prayer and identify different speakers.  
12. Create a Template that uses a patchwork of audio from different people.  
13. Use either assembled item-by-item audio or full-session audio.  
14. Choose Manual Scroll, Audio Auto-Advance, Voice Follow, or Hybrid behavior.  
15. Record an entire Session from Active Prayer Mode.  
16. Save the recording to the Session only or explicitly reuse/assign it to a Template or audio library.  
17. Track audio usage by recording, Prayer, Template, Session, SessionItem, date, and usage type.  
18. Clearly distinguish Voice Follow microphone use from Record Session microphone use.  
19. Enter a situation and receive trusted Prayer recommendations.  
20. Create petitionary or discernment-oriented Intentions.  
21. Configure Daily Mass Readings and/or Bible in a Year.  
22. Record Church and Priest when readings are Heard at Mass.  
23. Add Homily notes and support audio/video/transcription workflow hooks.  
24. Log Life Library items and show In Progress items on Home.  
25. Write Reflection in the user's own words and link it to relevant Journey objects.  
26. See scheduled practices in internal Calendar and preserve future external calendar architecture.  
27. Import the supplied Rosary, 54-Day Novena, and St. Michael Chaplet without hard-coding them.  
28. Ship with the USCCB Basic Prayers starter library as Traditional Prayers with source/provenance preserved.  
29. Ship with the USCCB How to Pray the Rosary as the seeded default Rosary How To, including USCCB Mystery content/guidance as modeled.  
30. Allow a How To to retain multiple sources and allow the user to edit an imported How To without destroying the original sourced version.  
31. Add Open Prayer to a Template or Session; type, speak/transcribe, leave open until prayer time, or pray without capture.  
32. Save an Open Prayer as a reusable Personal Prayer when the user chooses.  
33. Turn free-form prayer transcription On or Off before or during a Session while keeping Voice Follow and Record Session as separate microphone behaviors.  
34. Allow My Intention/UserIntention and user-fillable Petition/DevotionIntention to use the same type/speak capture interaction while remaining separate domain objects.  
35. Optionally name a PrayerSession and assign a Session Purpose without requiring either field.  
36. Leave Session Purpose blank and have the system treat it as Not Specified / Unsure rather than inferring one.  
37. Add Meditation as a first-class Session component distinct from Open Prayer and Reflection.  
38. Move from Meditation to Open Prayer and/or Reflection when the user chooses, while preserving each as a separate linked object.  
39. Use Open Dialogue as a Reflection capture mode while keeping Reflection as the underlying architecture.  
40. Add a generic External Link component to a Template or Session, support multiple link options, and use a clearly designated default/top link.  
41. Allow the user to add their own external prayer link and choose it as the default for their personal Template/Session without changing the global seeded record.  
42. Ship Pray with the Pope as an optional default Template whose required content is only an External Link component; do not automatically add Open Prayer, Reflection, Rosary, or other components.  
43. Start a Pray with the Pope Session containing only the link, or customize the Session by adding any other available Session component in the user-defined order.  
44. Support a Template Block / nested Template during composition and deterministically expand it into concrete SessionItems before Active Prayer Mode, while preventing circular nesting.  
45. Surface Pray with the Pope from the Pray / Today's Devotions landing experience when selected or enabled, without requiring a separate Pope-specific toolkit in MVP.  
46. Use Faith Learning as the dashboard label, Learning as the underlying domain term, and Life Library as the collection; allow Learning items to link to Reflection.  
47. Support pasted text as a first-class import source using the same Analyze → Match → Propose → Review → Save workflow as document imports.  
48. Support executable Text / Context as a Session component so descriptions, explanations, Mystery introductions, and other non-Prayer text can appear at exact points in the prayer flow.  
49. Ship a Scriptural Rosary Devotion Template that can interleave Mystery/context, Our Father, a distinct Scripture passage before each Hail Mary, Glory Be, and optional single-line salutation/acclamation.  
50. Allow Dialogue / Salutation components with a single line and no required response.

*Final product test: Does this help the person spend less effort operating software and more attention praying, reflecting, learning, discerning, and living their faith?*

# **35\. Share & Follow-Along — Group and Guest Prayer** *(shipped; v8 predates this)*

*This capability is not in the v8 PRD but is central to ACTS's position — the "pray together" differentiator. It ships today.*

A Session (or Devotion) can be shared as a **short, titled follow-along link** (`/follow/<slug>`) that opens a **read-only guest view**. A guest taps the link and is walked through the exact same ordered prayer — no account, no flipping pages, no knowing what comes next.

**Why it matters**

* **Guests, especially non-Catholics, can pray along.** They don't need to know the structure of a Rosary or a novena — the app leads.
* **Group and led prayer without a pamphlet.** The origin: after a death, a family prayed a 9-day novena and had to hand-make a paper pamphlet and copies. ACTS puts that novena **in the platform, ready** — the leader shares one link and everyone follows the same day's flow.
* **A parent can share a novena with their kids** so they pray along, even apart. It is more than "go pray the 54-day novena" — the day-by-day sequence is built and waiting.

**Model**

* Read-only guest `/follow` view; the guest never mutates the owner's data.
* Short titled links via a share dialog; encoding in `share.ts`, backend in `shareStore.ts` (Supabase `shared_sessions`, public read-only RLS).
* Same connection backs account persistence and auth.

**Future**

* Live "we're all on step N together" presence, turn-taking / leader controls, and per-participant reflection are natural extensions — not yet built.

---

*Document status: this is a living vision doc, **rebased onto PRD v8** (the fuller, correct base). §1–§34 are the v8 Faith Journey PRD, preserved. The front matter, the Mission, the two-part Business/Technical framing, the "Solution Idea" narrowing, the "What's shipped today" inventory, the per-section Shipped notes, and §35 reflect the ACTS product as of 2026-08-29. Build ledger of record: `docs/JIRA-BACKLOG.md`. Prior versions live in git history — this is the single canonical `.md` (no `-vN.md` copies).*
