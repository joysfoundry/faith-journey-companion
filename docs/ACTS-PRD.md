**FAITH JOURNEY** — *the long-term vision*
**Now shipping: ACTS** — *the prayer-first product*

**Product Vision & Requirements Document**
v2 · updated 2026-08-29 · supersedes the original "Final Build-Ready MVP PRD"
last synced: 2026-08-29 · 6d5a13f

Umbrella vision: **Faith Journey** — bring prayer, Scripture, learning, reflection, and lived experience together in service of discerning God's will and living one's purpose.
Shipping now: **ACTS** — a guided Catholic prayer companion. *(ACTS = **A**doration, **C**ontrition, **T**hanksgiving, **S**upplication — the traditional shape of prayer.)*
Primary MVP wedge: **Prayer** (Catholic devotional prayer)
Experience: **Mobile-first** — mobile web, no app store (see ACTS-90)

*A daily place where prayer, Scripture, learning, reflection, and lived experience become part of a meaningful record of how I am trying to live my faith, discern God's will, and live my purpose.*

---

## **What ACTS is**

ACTS is a guided Catholic prayer companion — it turns devotions (the Rosary and its mysteries, Lectio Divina, litanies, novenas, chaplets, hymns) into structured, step-by-step **sessions you actually pray through**, anchored to the liturgical day and shareable so a group can follow along in real time.

## **The problem I'm solving**

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

A few concrete moments started this:

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

## **What's shipped today (and what's still ahead)**

This document describes the full Faith Journey vision. Much of the **prayer wedge is now built**; the deeper longitudinal layers are still **future**. The sections below (§1–§34) remain the vision of record; this inventory says where reality currently stands.

*Status legend:* **[Shipped]** live in the app · **[Partial]** partly built · **[Future]** designed here, not yet built. Live build ledger: `docs/JIRA-BACKLOG.md`.

**Shipped**

* Prayer taxonomy — Prayer / Devotion / Expression axes kept strictly separate (§6) — **[Shipped]**
* Core domain — Prayer → Devotion → Template → Plan → Session → SessionItem + deterministic session compiler (§7, §13) — **[Shipped]**
* Guided "Pray mode" — current-item tracking, completed prayers grayed, auto-scroll (§14) — **[Shipped]**
* Rosary + mysteries, with **selectable mystery bodies** (Scripture vs. meditation variants) (§22) — **[Shipped]**
* **Litanies** — three public-domain litanies seeded as devotions (§6) — **[Shipped]**
* **Songs / hymns** — a sung prayer type with selectable verse/chorus segments (§6) — **[Shipped]**
* **Lectio Divina** — four movements, with **reflection as a first-class session step** (§28) — **[Shipped]**
* **Vessels** (was "Learn / Life Library") — Vessel → Channel → Content knowledge model (§27) — **[Shipped]**
* **Daily Word** naming the **liturgical day** (season + saint/feast) and reading-program voices (§26) — **[Shipped]**
* **Bible deep-linking** — open the user's own Bible app + translation from Settings (§26) — **[Shipped]**
* **Share / follow-along** — read-only guest view via a short titled link (the "pray together" piece) — **[Shipped]**
* **Accounts & persistence** — Supabase auth + backend (was future in §29–31) — **[Shipped]**
* Templates from scratch / from existing; session-only overrides that don't mutate the source (§10) — **[Shipped]**

**Partial**

* Import → Analyze → Propose → Review → Save seam (§30) — **[Partial]** (manual transcribe today; real OCR is ACTS-81)
* PrayerPlan scheduling / calendar (§9, §29) — **[Partial]** (RRULE recurrence live; month calendar is ACTS-98)

**Future (kept in full in the sections below)**

* Full **audio domain** — multi-speaker recordings, voice-follow, full-session audio (§15–§21) — **[Future]**
* **Insights** — grounded pattern recognition across the Journey (§3, §32) — **[Future]**
* **Purpose / discernment** longitudinal layer (§4, §32) — **[Future]**
* **Future Learning Companion** (§32) — **[Future]**

# **1\. Product Vision**

Faith Journey is a personal faith application designed to help people bring prayer, Scripture, learning, reflection, and lived experience into the rhythms and needs of everyday life.

*Help people deepen their relationship with God and bring prayer, Scripture, learning, reflection, and lived experience together in service of discerning God's will and living the purpose to which they are called.*

The MVP is centered on prayer, especially Catholic devotional prayer. The product is not simply a prayer library, Rosary app, prayer tracker, Bible-reading app, journal, reading tracker, or AI spiritual director.

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
“God is telling you to change jobs.”

The first example is grounded in the user's own record. The second would be an inappropriate interpretation of God's will.

Future Insights may also offer grounded encouragement or cheerleading based on the user's own evidence. Example: “You've continued to bring this intention into prayer and reflection even though the answer has not been clear.”

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
| **Learn** |
| ↓ |
| **Reflect — my own words** |
| ↓ |
| **Insights — patterns across my Journey** |
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
* LEARN — What am I learning from right now?  
* REFLECT — What is staying with me?

Home should feel like a personal daily faith space, not a feature dashboard.

# **6\. Prayer Taxonomy Is First-Class**

Do not model every prayer experience as a Devotion. The application must distinguish Prayer Type, Devotion Type, and Expression Type.

## **Prayer Types**

* Liturgical Prayer — Mass, Liturgy of the Hours, Sacramental rites  
* Devotional Prayer — Rosary, Novena, Chaplet, Stations, Litany, Consecration, Custom Devotion  
* Traditional Expressions of Prayer — Vocal Prayer, Meditation, Contemplation

## **Devotion Types**

* Rosary  
* Novena  
* Chaplet  
* Stations  
* Litany  
* Consecration  
* Custom

## **Expression Types**

* Vocal  
* Meditation  
* Contemplation  
* Scripture  
* Silence  
* Reflection  
* Song — *[Shipped]* a sung prayer with selectable verse/chorus segments

*Shipped note:* the taxonomy is live with all three axes kept strictly separate. **Litany** is a shipped Devotion Type (three public-domain litanies seeded), **Song** is a shipped Expression Type, and **Lectio Divina** is delivered as a Scripture-led devotion whose Reflect movement is a first-class session step (see §28).

**Example**  
Hail Mary \= reusable Prayer, Expression Type \= Vocal.  
Rosary \= Prayer Type: Devotional, Devotion Type: Rosary.  
54-Day Rosary Novena \= Prayer Type: Devotional, Devotion Type: Novena, nested Devotion: Rosary.  
Daily Mass Readings \= related to Liturgical Prayer / Mass but surfaced in the MVP through Daily Word.

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
\[Begin\] \[Change Template\] \[Customize Today\]

54-Day Rosary Novena  
Day 17 of 54 · Petition  
\[Continue\]

Chaplet of St. Michael  
Day 4 of 10  
\[Begin\]

\[+ Start a Prayer\]

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

Use one PrayerPlan scheduling engine across structured Devotions and individual Prayers. Store traditional\_duration separately from chosen\_duration.

A one-time PrayerSession can exist without an ongoing PrayerPlan. Afterward the user may choose Make This Recurring.

# **10\. Template Creation and Overrides**

Create New Template must offer Start from Scratch or Start from Existing Template, with a real dropdown/list and Save As.

Creating from an existing Template must not mutate the source Template. Session-specific customization must not mutate the Template unless the user explicitly saves changes back.

# **11\. How To Is Different From the Prayer Session**

HowTo is instructional content. PrayerSession is the actual executable prayer experience.

**Preserve this UX concept**  
These are instructions, not the prayer session. Starting prayer expands every instruction into the actual prayers.

A How To may say “Say three Hail Marys” or “Repeat for the remaining four decades.” When the user taps Start Prayer, the Session compiler must expand those instructions into the actual individual Prayer SessionItems.

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
* Provenance status: known, partially\_known, unknown

**Examples**  
Source: Caro Family Rosary booklet  
Source: \[Organization Name\] · \[URL\]  
Source: Unknown

Do not leave missing provenance ambiguous. Unknown is a valid explicit state.

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

# **15\. Audio Is a First-Class Domain**

Audio may exist at multiple levels and should not be modeled as a single audio\_id on Prayer.

* Prayer-level audio — one Prayer recorded by one or more people.  
* Template-level audio — preferred audio assignments or a full Template recording.  
* Session-level audio — a full recording of one Session, or item-by-item audio assignments.  
* SessionItem-level audio — a specific recording used for that occurrence.

A single Prayer may have multiple recordings by different people. Example: Grandma, Mom, Dad, the user, a child, or a family recording.

A Template may use a patchwork of recordings from different people. Example: Dad for Our Father, Grandma for Hail Mary, Mom for Fatima Prayer, family recording for the closing.

A Session may inherit Template audio, override individual items, or use one complete full-session recording.

# **16\. AudioRecording Model and Reuse**

Recordings should exist independently so they can be reused across Templates and Sessions.

* recording\_scope: prayer, template, session, session\_item  
* recording\_type: single\_prayer, session\_item, full\_session, meditation, instructional  
* speaker/person metadata  
* audio URL/storage reference  
* duration  
* transcript when available  
* source/provenance  
* recorded\_in\_app flag  
* created\_at / updated\_at

TemplateAudioAssignment and SessionAudioAssignment should reference reusable AudioRecording records rather than duplicating media.

# **17\. Full-Session Audio vs. Assembled Audio**

## **Full-session recording**

One continuous recording for the entire PrayerSession or Template. Useful for listening while driving or praying along with a family recording.

## **Assembled audio**

The Session is built from Prayer- or SessionItem-level recordings and may mix speakers. The user can still see the underlying PrayerSession and SessionItems.

Template audio preference may be: none, assembled, or full\_session\_when\_available.

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

* audio\_recording\_id  
* user\_id  
* used\_at / date  
* prayer\_id when applicable  
* template\_id when applicable  
* session\_id when applicable  
* session\_item\_id when applicable  
* usage\_type: played, recorded, assigned, inherited, overridden  
* playback\_mode  
* progress\_mode  
* started\_at  
* ended\_at  
* completion\_status if relevant

Audio use should be traceable by Prayer, Template, Session, SessionItem, date, and person/speaker where applicable.

# **22\. Rosary, Mysteries, Novenas, and Chaplets**

## **Mystery model**

* MysterySet — Joyful, Sorrowful, Glorious, Luminous  
* Mystery — e.g., The Annunciation  
* MysteryContent — title, short description, meditation, Scripture, family/devotion-specific variant, audio, image

Mystery is not a Prayer.

*Shipped note:* each Mystery supports **multiple selectable bodies** (e.g. a reflection, a USCCB Scripture set, or a meditation); the body is chosen at the Devotion and Session level and the compiler splits it across the decades. A version-authoring editor exists for these bodies.

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

# **26\. Daily Word**

*Shipped note:* the Word card now **names the liturgical day** (season + saint / feast / solemnity, computed locally — no DB map), and **Bible deep-linking** is live: the user sets their preferred Bible app and translation in Settings, and ACTS opens passages there rather than embedding licensed text.

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

# **27\. Learn / Life Library → Vessels**

*Shipped note:* this now ships as **Vessels** — a **Vessel → Channel → Content** model (a Vessel is an author/voice; content is attributed to them, with types including Book, Article, Video, Homily, Podcast, and Quote). It unifies what this section calls Learn, plus Programs and Resources, into one library with a "By Vessel" grouped view and search.

Home shows LifeLibraryItems with status \= in\_progress, approximately three before View All In Progress.

* Book  
* Article  
* Newsletter  
* Video  
* Sermon/Homily  
* Podcast  
* Show/Documentary  
* Other

Statuses: Not Started, In Progress, Finished. MVP is logging only; semantic search comes later.

# **28\. Reflection**

*Shipped note:* **reflection is a first-class session step** (not only a Home prompt). **Lectio Divina** ships as a four-movement devotion (Read / Reflect / Respond / Rest) whose Reflect movement captures the user's own words inline and dual-links that Reflection to both the movement and the session. A per-session Scripture passage opens empty (reference-only, Open-in-Bible, paste-propagation) so nothing licensed is stored. Reflection redesign — inspiration-in-view, voice note, and photo→OCR capture — is planned (ACTS-103).

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

# **29\. Internal Calendar and Future External Calendar**

MVP internal Calendar supports Today, Week, and Month and may show Daily Rosary, Novena days, Chaplet plans, recurring individual Prayers, Bible Program plans, and custom practices.

Home remains the primary place to begin prayer.

Future external integration may support Google Calendar, Apple Calendar, Outlook, tasks, and reminders. Faith Journey remains the source of truth.

* PrayerPlan: recurrence\_rule, preferred\_time, timezone  
* PrayerSession: scheduled\_start\_at, scheduled\_end\_at, is\_all\_day  
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

Initial formats: PDF, Word/text, pasted text. Importer may identify Prayer, PrayerVersion, Devotion, DevotionVersion, Template, HowTo, Mystery, MysteryContent, repetition rules, conditionals, phases, duration, Source, and audio references where applicable.

Never silently commit importer guesses.

When imported Prayer text resembles an existing Prayer, offer Use Existing, Use Imported, Save as Alternate Version, or Compare.

Source records should support source\_type, name, organization/person/family, URL, original file, page/section, provenance status, metadata, and created\_at.

# **31\. Final MVP Data Model Additions**

In addition to the core models already defined, include the following audio and provenance models/fields.

## **AudioRecording**

* id  
* recording\_scope  
* recording\_type  
* prayer\_id  
* template\_id  
* session\_id  
* session\_item\_id  
* title  
* speaker\_name  
* speaker\_person\_id  
* audio\_url / storage reference  
* duration\_seconds  
* transcript  
* source\_id  
* recorded\_in\_app  
* created\_at  
* updated\_at

## **TemplateAudioAssignment**

* id  
* template\_id  
* template\_item\_id  
* prayer\_id  
* audio\_recording\_id  
* position  
* is\_default

## **SessionAudioAssignment**

* id  
* session\_id  
* session\_item\_id  
* audio\_recording\_id  
* source\_type: template\_default, session\_override, full\_session\_recording

## **AudioUsageEvent**

* id  
* audio\_recording\_id  
* user\_id  
* prayer\_id  
* template\_id  
* session\_id  
* session\_item\_id  
* usage\_type  
* playback\_mode  
* progress\_mode  
* started\_at  
* ended\_at  
* used\_at  
* completion\_status  
* created\_at

## **HowTo / Source enhancements**

* HowTo.subtitle  
* HowTo.source\_id  
* Source.organization  
* Source.author\_or\_person  
* Source.page\_or\_section  
* Source.provenance\_status

## **PrayerTemplate audio fields**

* default\_progress\_mode  
* default\_playback\_mode  
* default\_auto\_advance  
* preferred\_audio\_strategy

## **PrayerSession audio fields**

* progress\_mode  
* playback\_mode  
* auto\_advance  
* active\_audio\_strategy  
* recording\_enabled  
* active\_recording\_id

# **32\. Future Architecture Appendix**

## **Purpose / Discernment**

Do not build a large Purpose module in MVP. Preserve the ability to later connect purpose statements, vocation questions, decisions, gifts/strengths, responsibilities, values, people served, questions for spiritual direction, actions, next steps, outcomes, Reflections, Intentions, learning, and Scripture.

## **Future Insights**

Future Insights may surface recurring topics, changing language, recurring Intentions, repeated discernment questions, recurring Scripture or learning themes, relationships between Prayer and life experience, prior Reflections worth revisiting, and grounded encouragement. Each Insight should retain evidence links so the user can ask Why am I seeing this?

## **Future Learning Companion**

Faith Journey should be capable of connecting to a separate, more robust faith-learning product for people exploring Christianity, considering conversion, returning to faith, or studying Scripture, theology, history, and traditions. The companion asks What am I trying to understand? Faith Journey asks How is what I believe, learn, pray, and experience shaping how I live?

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

13. Open Home and immediately see today's PrayerSessions.  
14. Enable Daily Rosary and see today's Mystery and selected Template.  
15. Change today's Template without changing future default unless explicitly chosen.  
16. Create a Template from scratch or from an existing Template.  
17. View How To instructions with visible Source/provenance and Start Prayer into a fully expanded Session.  
18. Return from How To to an active Session without losing place.  
19. Start a one-time Prayer or create a recurring PrayerPlan.  
20. Start 3-, 9-, 54-, or custom-day Devotions.  
21. Follow every actual Prayer occurrence in correct order; repetitions are expanded.  
22. Use Scroll Only or Manual Done.  
23. Assign multiple audio recordings to a Prayer and identify different speakers.  
24. Create a Template that uses a patchwork of audio from different people.  
25. Use either assembled item-by-item audio or full-session audio.  
26. Choose Manual Scroll, Audio Auto-Advance, Voice Follow, or Hybrid behavior.  
27. Record an entire Session from Active Prayer Mode.  
28. Save the recording to the Session only or explicitly reuse/assign it to a Template or audio library.  
29. Track audio usage by recording, Prayer, Template, Session, SessionItem, date, and usage type.  
30. Clearly distinguish Voice Follow microphone use from Record Session microphone use.  
31. Enter a situation and receive trusted Prayer recommendations.  
32. Create petitionary or discernment-oriented Intentions.  
33. Configure Daily Mass Readings and/or Bible in a Year.  
34. Record Church and Priest when readings are Heard at Mass.  
35. Add Homily notes and support audio/video/transcription workflow hooks.  
36. Log Life Library items and show In Progress items on Home.  
37. Write Reflection in the user's own words and link it to relevant Journey objects.  
38. See scheduled practices in internal Calendar and preserve future external calendar architecture.  
39. Import the supplied Rosary, 54-Day Novena, and St. Michael Chaplet without hard-coding them.

*Final product test: Does this help the person spend less effort operating software and more attention praying, reflecting, learning, discerning, and living their faith?*

# **35\. Share & Follow-Along — Group and Guest Prayer** *(shipped)*

*This capability is not in the original PRD but is central to ACTS's position — the "pray together" differentiator. It ships today.*

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

*Document status: this is a living vision doc. §1–§34 are the original Faith Journey PRD, preserved. The front matter, the "What's shipped today" inventory, the shipped-notes, and §35 reflect the ACTS product as of 2026-08-29. Build ledger of record: `docs/JIRA-BACKLOG.md`.*

