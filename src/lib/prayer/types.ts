/**
 * Domain models for the Prayer Companion.
 *
 * Field names are snake_case so these types map 1:1 onto Supabase tables when
 * the backend is enabled. No UI logic lives in this file.
 *
 * CRITICAL RULE: completion never lives on Prayer. It lives on SessionItem.
 */

export type ID = string;

import type {
  DevotionType as DevotionTypeValue,
  ExpressionType as ExpressionTypeValue,
  PrayerType as PrayerTypeValue,
} from "@/domain/taxonomy";

export type SourceType =
  "written" | "manual" | "pdf" | "document" | "text" | "web" | "image" | "audio" | "video";

export interface Source {
  id: ID;
  source_type: SourceType;
  name: string;
  url?: string | undefined;
  /** Who published/printed it. Falls back to "self" when nothing is found. */
  attribution?: string | undefined;
  file_reference?: string | undefined;
  metadata?: Record<string, string> | undefined;
  created_at: string;
}

/**
 * Prayers are classified on the three separate taxonomy axes defined in
 * src/domain/taxonomy.ts. There is no single collapsed "category" field:
 * - prayer_type: liturgical | devotional | traditional_expression
 * - expression_type: how it is prayed (vocal, meditation, scripture, ...)
 * - devotion_type: the devotion it belongs to, when it belongs to one
 */
export type { DevotionType, ExpressionType, PrayerType } from "@/domain/taxonomy";

/**
 * Audio / video attached to a prayer. Persists with the prayer and is editable
 * from the prayer editor. `link` and `file`/`recording` differ only in where
 * `url` points: an external URL, or a data: URL for a small local clip.
 */
export type PrayerMediaKind = "audio" | "video";
export type PrayerMediaSource = "link" | "file" | "recording";
export interface PrayerMedia {
  id: ID;
  kind: PrayerMediaKind;
  source: PrayerMediaSource;
  label?: string | undefined;
  /** External URL (link) or a data: URL (small file / recording). */
  url: string;
  duration_sec?: number | undefined;
  created_at: string;
}

/**
 * Reusable prayer content. Never carries completion state.
 *
 * Every wording of the same prayer is its own Prayer record. Records that are
 * wordings of the same prayer share `variant_group_id`, and exactly one of them
 * has `is_default_variant`. Devotions can therefore point at any wording while
 * the library groups them and shows the default first.
 */
export interface Prayer {
  id: ID;
  title: string;
  prayer_type: PrayerTypeValue;
  expression_type: ExpressionTypeValue;
  devotion_type?: DevotionTypeValue | undefined;
  tags: string[];
  favorite: boolean;
  default_version_id: ID;
  /** Shared by all wordings of the same prayer. Defaults to the record's own id. */
  variant_group_id?: ID | undefined;
  /** Human label for this wording ("Traditional", "Family wording", ...). */
  variant_label?: string | undefined;
  /** Exactly one record per variant group is the default. */
  is_default_variant?: boolean | undefined;
  source_id?: ID | undefined;
  /** Audio/video links & short clips attached to this prayer. */
  media?: PrayerMedia[] | undefined;
  created_at: string;
}

/**
 * A song is a prayer that is sung and is segmented into ordered parts. The
 * segments live on the wording (not the Prayer) because translations and
 * arrangements differ in verse text and even verse count. A prayer is a song
 * when its expression_type is "song" and its default version carries segments.
 */
export type SongSegmentKind = "verse" | "chorus" | "bridge";
export interface SongSegment {
  /** Order within the song, 1-based. Also the id used by TemplateItem.song_segments. */
  ordinal: number;
  kind: SongSegmentKind;
  /** Human label ("Verse II", "Chorus"). Derived from kind + ordinal when absent. */
  label?: string | undefined;
  body: string;
}

/** A concrete wording of a Prayer (traditional, family, short form, ...). */
export interface PrayerVersion {
  id: ID;
  prayer_id: ID;
  label: string;
  body: string;
  language: string;
  source_id?: ID | undefined;
  /** Songs only: the ordered verses / chorus. `body` stays the joined full text. */
  segments?: SongSegment[] | undefined;
  created_at: string;
}

export interface MysterySet {
  id: ID;
  name: string;
  /** ISO weekday numbers (1 = Monday ... 7 = Sunday) this set is prayed on. */
  default_weekdays: number[];
  position: number;
}

export interface Mystery {
  id: ID;
  mystery_set_id: ID;
  title: string;
  position: number;
}

export type MysteryContentVariant =
  "title_only" | "short_description" | "full_meditation" | "scripture" | "family" | "devotion";

export interface MysteryContent {
  id: ID;
  mystery_id: ID;
  variant: MysteryContentVariant;
  /**
   * Stable slug identifying this *body* (version) across every mystery in a set
   * — e.g. `"usccb-scripture"`, `"ascension-meditation"`, `"reflection"`. The
   * devotion/session "which body" pick keys off this: pick a body once and the
   * compiler resolves the matching content for each decade. Absent = the
   * built-in reflection body.
   */
  body_key?: string | undefined;
  /** Human name for the body picker (e.g. "USCCB — Scripture"). Falls back to the source name. */
  label?: string | undefined;
  /** Scripture citation for this body (e.g. "Luke 1:26-27"), when it quotes Scripture. */
  scripture_ref?: string | undefined;
  /** The Scripture quote for this body, kept apart from the meditation prose. */
  scripture_text?: string | undefined;
  /** Fruit of the mystery for this body — may differ in wording between bodies. */
  fruit?: string | undefined;
  body: string;
  source_id?: ID | undefined;
}

export type MysteryPresentation = "title_only" | "title_and_description" | "choose_during_session";

/**
 * A single external prayer experience (e.g. "Pray with the Pope").
 * Modeled generically — never a provider-specific engine. One option is the
 * default; the user may pick another source or add their own (parish, church).
 */
/**
 * What kind of destination an external-link source points at. Drives whether a
 * source can be a "listen" source (audio/video play inline and can be followed)
 * or is a plain "open out" web link. Absent = treat as `web` for back-compat.
 */
export type ExternalLinkMediaKind = "web" | "audio" | "video";

export interface ExternalLinkOption {
  label: string;
  url: string;
  is_default?: boolean | undefined;
  /** web (open out) · audio / video (playable, eligible as a listen source). */
  media_kind?: ExternalLinkMediaKind | undefined;
}

/**
 * The components a devotion is built from:
 * - prayer: a prayer record from the library
 * - song: a sung prayer, optionally narrowed to specific verses / chorus
 * - salutation: a versicle / response pair (V. … R. …)
 * - mystery_placeholder: rosary decades only
 * - intention: the user's own intention slot
 * - petition: a sourced petition from the devotion
 * - meditation: a meditation prompt / reflection
 * - external_link: a link out to an external prayer experience (generic)
 * - scripture: a Scripture passage (with a citation) placeable anywhere
 * - custom: any other component the user adds
 * - heading: a plain section label
 * - template_block: reuse a whole other Template inline (the compiler recursively
 *   expands it into concrete items). Lets composites — e.g. a Rosary **plus** a
 *   Litany — reuse a devotion instead of re-adding every item.
 */
export type TemplateItemKind =
  | "prayer"
  | "song"
  | "salutation"
  | "mystery_placeholder"
  | "intention"
  | "petition"
  | "meditation"
  | "external_link"
  | "scripture"
  | "reflection"
  | "custom"
  | "heading"
  | "template_block";

/** Compact template row. `repetition_count` is shorthand; sessions expand it. */
export interface TemplateItem {
  id: ID;
  template_id: ID;
  kind: TemplateItemKind;
  position: number;
  prayer_id?: ID | undefined;
  prayer_version_id?: ID | undefined;
  /**
   * Song only: the ordered segment ordinals to sing at this placement, in the
   * order they should be sung (e.g. [2, 1] = Verse II then Chorus). Absent or
   * empty = the whole song. The whole placement is one session step.
   */
  song_segments?: number[] | undefined;
  /** Which decade / mystery ordinal this placeholder refers to (1-based). */
  mystery_ordinal?: number | undefined;
  label?: string | undefined;
  /** Salutation: true = versicle/response pair; false/absent = plain text (body). */
  salutation_vr?: boolean | undefined;
  /** Salutation: the versicle line (spoken by the leader). */
  versicle?: string | undefined;
  /** Salutation: the response line. */
  response?: string | undefined;
  /**
   * Free text for custom components, the passage text for scripture, and the
   * journaling **prompt** for a `reflection` step (the movement name rides in
   * `label`). The user's written response is captured per session, not here.
   */
  body?: string | undefined;
  /** scripture: the citation (e.g. "Lk 1:26-38"). */
  reference?: string | undefined;
  /** external_link: selectable sources; exactly one marked is_default. */
  external_options?: ExternalLinkOption[] | undefined;
  /**
   * template_block: the `PrayerTemplate.id` to expand inline here. The compiler
   * recurses into that template's items (guarding circular nesting + depth).
   */
  block_template_id?: ID | undefined;
  /**
   * template_block: the templates this block may be filled with (each a
   * `PrayerTemplate.id`), including the default `block_template_id`. When present,
   * the Session Builder shows a picker so the leader can swap which devotion fills
   * this slot for a given session — e.g. a vigil whose "Rosary" slot accepts the
   * Decade of the Passion or the Holy Rosary. Choosing rewrites this item's
   * `block_template_id` in the session's own copy; the compiler expands whatever
   * it points at, so no separate resolution is needed.
   */
  block_options?: ID[] | undefined;
  repetition_count: number;
  optional: boolean;
  /** Only included when the session context enables this group. */
  condition_tag?: string | undefined;
}

export type TemplateKind = "standard" | "rosary";

export interface PrayerTemplate {
  id: ID;
  name: string;
  description?: string | undefined;
  kind: TemplateKind;
  mystery_presentation: MysteryPresentation;
  /**
   * Notes the source itself gives about the devotion — promises, when to pray it,
   * instructions printed alongside the prayers, or context copied from a URL.
   */
  notes?: string | undefined;
  /** Rosary helper: how many mystery placeholders the template expects. */
  mystery_count: number;
  /**
   * Default schedule this devotion suggests — pre-fills the Session Builder when
   * you build from it. A 54-day rosary carries `{ freq:"daily", count:54 }`.
   */
  default_recurrence?: Recurrence | undefined;
  /** Default Liturgy-of-the-Hours tag this devotion is prayed at. */
  default_hour?: PrayerHour | undefined;
  /** Default clock time ("HH:MM", 24h) this devotion is prayed at. */
  default_start_time?: string | undefined;
  /** Pin the mysteries to one set (e.g. Luminous); absent = resolve by day. */
  fixed_mystery_set_id?: ID | undefined;
  /**
   * Default mystery *body* (a `MysteryContent.body_key`) this devotion prays —
   * e.g. a Scriptural Rosary defaults to `"usccb-scripture"`. Absent = the
   * built-in reflection body. Overridable per session via `mystery_body`.
   */
  default_mystery_body?: string | undefined;
  /** Audio of the whole devotion — links now; uploads later. */
  media?: PrayerMedia[] | undefined;
  source_id?: ID | undefined;
  built_in: boolean;
  /** Starred in the Prayers → Devotions list. */
  favorite?: boolean | undefined;
  created_at: string;
}

export interface Intention {
  id: ID;
  title: string;
  body?: string | undefined;
  created_at: string;
}

export type ProgressMode = "scroll" | "manual_done";

/**
 * The media the user chose to listen to for a session ("How do you want to
 * listen?"). Gathered from the template's saved media, its prayers' clips, and
 * any audio/video external links. Absent = read silently, no audio.
 */
export interface ListenSource {
  /** External URL, or a data: URL for a local clip/recording. */
  url: string;
  kind: "audio" | "video";
  label: string;
  /** How the underlying media is stored, when it came from PrayerMedia. */
  source?: PrayerMediaSource | undefined;
}

export interface SessionContext {
  date: string; // yyyy-mm-dd
  mystery_set_id?: ID | undefined;
  progress_mode: ProgressMode;
  mystery_presentation?: MysteryPresentation | undefined;
  /** Chosen mystery body (a `MysteryContent.body_key`); overrides the devotion default. */
  mystery_body?: string | undefined;
  include_optional: boolean;
  condition_tags: string[];
  prayer_version_overrides: Record<ID, ID>;
  audio_enabled: boolean;
  /** Chosen "how do you want to listen?" media; absent = read silently. */
  listen_source?: ListenSource | undefined;
  /**
   * Who this session is prayed for — a named soul (e.g. a departed loved one).
   * Drives dedication-token substitution in the compiler (`{name}`/`{subj}`/
   * `{obj}`/`{poss}`/`{us}`). Absent = no dedication: tokens fall back to the
   * plural "the faithful departed / they / them / their", and `{us}` stays "us".
   */
  for_whom?: Dedication | undefined;
}

/** Third-person pronoun set for a dedication. `they` is the plural fallback. */
export type Pronoun = "she" | "he" | "they";

/** A session dedication: an optional name plus the pronoun to use for that soul. */
export interface Dedication {
  name?: string | undefined;
  pronoun: Pronoun;
}

export interface PrayerSession {
  id: ID;
  template_id: ID;
  title: string;
  context: SessionContext;
  created_at: string;
  completed_at?: string | undefined;
  /** The SessionPlan this was started from; lets completion advance a recurrence. */
  plan_id?: ID | undefined;
  /** Index of the item the user is currently on. */
  cursor: number;
  /**
   * Set when this session was prayed in an external app (e.g. Hallow) rather than
   * in-app: the app's display label. Such a session has no `session_items` — it is
   * a completed log so history/streaks count it. See `src/lib/prayer/apps.ts`.
   */
  external_app?: string | undefined;
  /** The URL that was launched for an external session (for "open again"). */
  external_url?: string | undefined;
}

export type Frequency = "none" | "daily" | "weekly" | "monthly" | "yearly";

/**
 * Calendar-style recurrence — a subset of iCalendar RRULE (FREQ/INTERVAL/COUNT/
 * UNTIL). One model for everything: "once" is `{ freq: "none" }`, a 9-day novena
 * is `{ freq: "daily", count: 9 }`, a 54-day rosary is `{ freq: "daily", count:
 * 54 }`. The "Day N of M" a session shows is derived from this, not a separate
 * counter. Shaped so a real calendar (Google/ICS) can sync it later.
 */
export interface Recurrence {
  freq: Frequency;
  /** Every N units (default 1). */
  interval: number;
  /** Total occurrences; absent = open-ended. Gives the "of M" in "Day N of M". */
  count?: number | undefined;
  /** yyyy-mm-dd end date; an alternative to `count`. */
  until?: string | undefined;
}

/** "Once" — no repetition. */
export const RECURRENCE_ONCE: Recurrence = { freq: "none", interval: 1 };

/**
 * A canonical hour of the Liturgy of the Hours a session may be tied to.
 * Office of Readings may be prayed at any time; the rest anchor to a time of day.
 */
export type PrayerHour =
  | "office_of_readings"
  | "lauds" // Morning Prayer
  | "daytime" // Mid-morning / noon / mid-afternoon
  | "vespers" // Evening Prayer
  | "compline"; // Night Prayer

/**
 * A saved, re-prayable session the user assembled in the builder: one template
 * plus the choices they made (mysteries, progress, how to listen) and an
 * optional schedule. Praying it compiles a fresh PrayerSession from `context`.
 */
export interface SessionPlan {
  id: ID;
  /** Base template this session started from; "" when built from scratch. */
  template_id: ID;
  /** User's name for it, e.g. "Monthly Family Rosary". Falls back to template name. */
  purpose?: string | undefined;
  /** Current/next date to pray (yyyy-mm-dd); advances on finish. Absent = no fixed date. */
  date?: string | undefined;
  /** Fixed series anchor (DTSTART, yyyy-mm-dd) the "Day N of M" index counts from. */
  starts_on?: string | undefined;
  recurrence: Recurrence;
  /** Rare free-text detail the structured recurrence can't express. */
  recurrence_note?: string | undefined;
  /**
   * When true, this (bounded, rosary-bearing) plan stands in for the user's Daily
   * Rosary for the length of its series — e.g. "I'm praying my Daily Rosary through
   * this novena." While `today` falls in the window `[starts_on … last occurrence]`
   * the sessions list shows THIS plan under the DAILY ROSARY label with "Day X of N"
   * and suppresses the standalone daily row; past the last occurrence it reverts
   * automatically. Only meaningful for a bounded series (a novena has an end).
   */
  fulfills_daily_rosary?: boolean | undefined;
  /** Liturgy-of-the-Hours slot — a filterable tag, not a clock time; absent = none. */
  hour?: PrayerHour | undefined;
  /** Concrete clock time to pray ("HH:MM", 24h); absent = only the hour tag. Calendar-ready. */
  start_time?: string | undefined;
  /** Estimated time to pray, in minutes (app-computed). Doubles as calendar event length. */
  duration_min?: number | undefined;
  /** The builder choices, applied verbatim when the plan is prayed. */
  context: Partial<SessionContext>;
  /**
   * The session's own (possibly customized) item list. Edits here are
   * session-scoped and never change the base template. Absent = use the
   * template's items unchanged.
   */
  items?: TemplateItem[] | undefined;
  created_at: string;
}

export type SessionItemKind =
  | "prayer"
  | "song"
  | "mystery"
  | "intention"
  | "petition"
  | "meditation"
  | "external_link"
  | "scripture"
  | "reflection"
  | "heading";
export type CompletionStatus = "pending" | "complete" | "skipped";
export type CompletionMethod = "manual" | "auto" | "audio" | "voice" | null;

/** One occurrence of content inside one session. Completion lives here. */
export interface SessionItem {
  id: ID;
  session_id: ID;
  kind: SessionItemKind;
  position: number;
  prayer_id?: ID | undefined;
  prayer_version_id?: ID | undefined;
  title: string;
  body?: string | undefined;
  /** scripture: the citation (e.g. "Lk 1:26-38"). */
  reference?: string | undefined;
  repetition_index?: number | undefined;
  repetition_total?: number | undefined;
  progress_mode: ProgressMode;
  completion_status: CompletionStatus;
  completion_method: CompletionMethod;
  completed_at?: string | undefined;
  mystery_id?: ID | undefined;
  mystery_content_id?: ID | undefined;
  mystery_ordinal?: number | undefined;
  audio_id?: ID | undefined;
  /**
   * Lineage: the `PrayerTemplate.id` this item was compiled from. Differs from the
   * session's own `template_id` when the item came from a nested `template_block`,
   * so edits can be routed back to the source template. Absent = the root template.
   */
  source_template_id?: ID | undefined;
  configuration?: Record<string, unknown> | undefined;
}

export interface HowToStep {
  id: ID;
  how_to_id: ID;
  position: number;
  text: string;
}

/** Instructional content. Never rendered as a substitute for prayers. */
export interface HowTo {
  id: ID;
  title: string;
  summary: string;
  steps: HowToStep[];
  /** Reference links — videos, websites, articles. Any number of them. */
  links?: string[] | undefined;
  /** Devotion template created from this guide. */
  template_id?: ID | undefined;
  source_id?: ID | undefined;
}

export type ImportClassification =
  | "prayer"
  | "prayer_version"
  | "how_to"
  | "template_structure"
  | "mystery"
  | "mystery_meditation"
  | "source_material";

export interface ImportCandidate {
  id: ID;
  classification: ImportClassification;
  title: string;
  body: string;
  confidence: number;
  /** Existing prayer this candidate closely resembles. */
  duplicate_of_prayer_id?: ID | undefined;
  similarity?: number | undefined;
  decision: "save_new" | "use_existing" | "save_alternate_version" | "skip";
  /** Proposed taxonomy for prayer candidates; editable during review. */
  prayer_type?: PrayerTypeValue | undefined;
  expression_type?: ExpressionTypeValue | undefined;
  /** For how_to candidates: the specific template these instructions describe. */
  link_template_id?: ID | undefined;
}

export interface ImportDraft {
  id: ID;
  source: Source;
  raw_text: string;
  candidates: ImportCandidate[];
  /**
   * When set, applying the draft also creates a devotion (template) that
   * bundles every saved prayer in document order. The prayers themselves are
   * still stored as single expressions in the library.
   */
  devotion?:
    | {
        name: string;
        description?: string | undefined;
        /** Notes from the source about the devotion (promises, when to pray it, context). */
        notes?: string | undefined;
        /** Detected default schedule (e.g. a "54-day" → daily × 54); editable before saving. */
        recurrence?: Recurrence | undefined;
        hour?: PrayerHour | undefined;
        start_time?: string | undefined;
      }
    | undefined;
  created_at: string;
}

/* ------------------------------------------------------------------ */
/* Journey layer: Reflection (the connecting tissue), Learning, Mass    */
/* ------------------------------------------------------------------ */

export type ReflectionMode = "written" | "spoken" | "open_dialogue";

/**
 * What a reflection can be linked to. Kept flexible and target-agnostic. Two
 * non-entity sources have nothing to resolve by id: `passage` (a book/quote text
 * the user pasted, stored in `excerpt`) and `link` (a manually-entered web URL,
 * stored in `url`).
 */
export type ReflectionLinkTarget =
  | "prayer_session"
  | "session_item"
  | "daily_reading"
  | "mass"
  | "learning"
  | "intention"
  | "mystery"
  | "passage"
  | "link";

/** A link is stored ON the reflection, never on the item that inspired it. */
export interface ReflectionLink {
  target_type: ReflectionLinkTarget;
  target_id: ID;
  label?: string | undefined;
  /**
   * Snapshot text of the inspiration, for sources with no entity to resolve
   * (a pasted book `passage`). The inspiration panel renders this verbatim when
   * present. Entity links leave it empty and resolve their content by `target_id`.
   */
  excerpt?: string | undefined;
  /**
   * External web URL for a manually-entered `link` source. The inspiration panel
   * renders it as a reference card with an Open-out link. (Entity links that
   * happen to have a canonical URL resolve it from the store, not from here.)
   */
  url?: string | undefined;
}

/** The user's own words. Always the user's own unless they ask for transformation. */
export interface Reflection {
  id: ID;
  title?: string | undefined;
  body: string;
  mode: ReflectionMode;
  links: ReflectionLink[];
  /**
   * Optional free-form themes/topics for organizing the journal (ACTS-135) — e.g.
   * "gratitude", "trust". Always optional: a themeless entry is first-class. Kept
   * lowercase-normalized so "Trust" and "trust" group together. The "group by
   * theme" view buckets entries by these; entries with none fall under "Untagged".
   */
  themes?: string[] | undefined;
  photo_count: number;
  created_at: string; // ISO datetime — date/time matters in history views
}

export type KnowledgeStatus = "not_started" | "in_progress" | "finished";

/**
 * The kind of a Knowledge item. This is the discriminator across the whole
 * library — completable content (book/article/video/podcast/post) and guided
 * plans (program) carry a real `status`; `resource` items are ongoing tools
 * (apps/sites) with no completion, surfaced on Home only when favorited.
 */
/**
 * Content kinds — the *what* you read/watch/listen to. The *who* behind it is a
 * separate `Voice` record (see below), referenced by `KnowledgeItem.voice_id`.
 */
export type KnowledgeCategory =
  "book" | "article" | "video" | "podcast" | "post" | "quote" | "program";

/**
 * The platform a Channel or a Content link points at. Drives the icon/label and
 * the auto-detect that matches a pasted URL back to a Voice's channel.
 */
export type LinkPlatform =
  "instagram" | "tiktok" | "youtube" | "x" | "facebook" | "podcast" | "website" | "store" | "other";

/**
 * A Channel — the middle level. A Voice's account/presence on one platform
 * (its Instagram, its podcast, its website). A Voice has many. `favorite` pins
 * this one channel to Home ("show me their podcast").
 */
export interface Channel {
  id: ID;
  platform: LinkPlatform;
  url: string;
  /** Optional human note ("main channel", "Spanish account"). */
  label?: string | undefined;
  /** Pinned to Home. Favoriting is per-channel, not per-Voice. */
  favorite?: boolean | undefined;
}

/**
 * Where a specific piece of Content lives — an Amazon / Audible page, a YouTube
 * video, an episode link. Distinct from a Channel (a Voice's ongoing account):
 * this points at the one work. `favorite` pins the link to Home.
 */
export interface KnowledgeLink {
  platform: LinkPlatform;
  url: string;
  label?: string | undefined;
  favorite?: boolean | undefined;
}

/** What kind of Voice this is — an individual, an organization/company, or a ministry. */
export type VoiceKind = "individual" | "organization" | "ministry";

/**
 * A Voice = the *who* behind content: a person, an organization/company, or a
 * ministry you follow (Fr. Mike, the Vatican, Sisters of Life, Hallow). It owns
 * its `channels` (accounts on each platform) and is the parent of any
 * `KnowledgeItem` attributed to it. The display label for the whole concept
 * ("Voices") lives in a single constant in `knowledge.ts` for easy renaming.
 */
export interface Voice {
  id: ID;
  name: string;
  kind: VoiceKind;
  /** This Voice's accounts, one per platform presence. */
  channels?: Channel[] | undefined;
  notes?: string | undefined;
  created_at: string;
}

/**
 * One piece of Content in the library — a book, article, video, podcast, post,
 * or guided program (the *what*). It may belong to a `Voice` (`voice_id`, the
 * *who* — optional; content can sit unattributed), may name the specific
 * `channel_id` it came from, and may carry its own `links` (where to get it —
 * an Amazon page, a video), or be linkless.
 * - `status` (not_started → in_progress → finished) tracks progress;
 * - `start_date`/`target_date` apply to programs (absent = open-ended plan);
 * - `links[].favorite` pins a specific link to Home.
 */
export interface KnowledgeItem {
  id: ID;
  title: string;
  category: KnowledgeCategory;
  /** The Voice this content is attributed to. Optional — content can be unattributed. */
  voice_id?: ID | undefined;
  /** Which of the Voice's channels this came from (e.g. their Instagram). Optional. */
  channel_id?: ID | undefined;
  /**
   * The quotation text — the primary payload of a `quote`, which has no title,
   * link, or progress. Empty for other categories.
   */
  body?: string | undefined;
  /** Free-text author/creator, used when no `voice_id` is set (or as a quick label). */
  creator?: string | undefined;
  source?: string | undefined; // publisher / platform ("YouVersion", "Ascension")
  notes?: string | undefined;
  status: KnowledgeStatus;
  start_date?: string | undefined; // programs
  target_date?: string | undefined; // programs
  /**
   * Programs only. A program that involves reading through Scripture displays
   * under the Home "Word" section instead of the Knowledge → Programs group
   * (it's still a `program` in the Library). E.g. Bible in a Year.
   */
  reads_scripture?: boolean | undefined;
  /** Where to get / access this content — Amazon, Audible, a video, … */
  links?: KnowledgeLink[] | undefined;
  /** Free-form tags for finding a saved item later ("praying", "becomingcatholic"). */
  tags?: string[] | undefined;
  created_at: string;
}

/** A Mass the user attended — "Heard at Mass". Nothing is fabricated. */
export interface MassExperience {
  id: ID;
  date: string; // yyyy-mm-dd
  church?: string | undefined;
  celebrant?: string | undefined;
  mass_time?: string | undefined;
  location?: string | undefined;
  notes?: string | undefined;
  audio_url?: string | undefined;
  transcript?: string | undefined;
  transcript_status?: "none" | "pending" | "ready" | undefined;
  created_at: string;
}

/** App-level, user-editable settings. Persisted with the rest of the store. */
export interface AppSettings {
  /**
   * The devotion the Home "daily" prayer card starts. Absent = the standard
   * Holy Rosary (`tpl-rosary`). Lets the family pin their own (e.g. the Caro
   * Family Rosary) as the daily prayer.
   */
  daily_template_id?: ID | undefined;
  /**
   * How the Daily Rosary is prayed. Absent / "app" = an in-app session from
   * `daily_template_id` (the default). "external" = launch another app (e.g.
   * Hallow) instead — the pinned Daily Rosary row deep-links out rather than
   * starting a session. See `src/lib/prayer/apps.ts`.
   */
  daily_rosary_mode?: string | undefined;
  /** Which external app the Daily Rosary launches (id from `PRAYER_APPS`, e.g. "hallow"). */
  daily_rosary_app_id?: string | undefined;
  /** Custom launch URL when `daily_rosary_app_id === "other"`. */
  daily_rosary_custom_url?: string | undefined;
  /**
   * The Bible app the reader uses (an id from `BIBLE_APPS`, e.g. "youversion",
   * or "none"/"other"). Powers "open in your Bible" deep-links across the app.
   */
  bible_app_id?: string | undefined;
  /** Preferred translation id (from `BIBLE_TRANSLATIONS`, e.g. "NIV"). */
  bible_translation?: string | undefined;
  /**
   * Web address of the reader's Bible when `bible_app_id === "other"` — the app
   * isn't in our catalog, so this is where "open my Bible" links point. Specific
   * passages still open via Bible Gateway (we can't template an unknown app).
   */
  bible_app_custom_url?: string | undefined;
  /**
   * The name the person gave at the beta name prompt (see BetaGate). Purely a
   * personalization label — NOT an account or login. Lives here in `settings`
   * (rather than a separate localStorage key) on purpose: it rides along inside
   * the same Database blob, so if we later add real auth (ACTS-82/87/88) the
   * whole local DB — including who this data belongs to — migrates in one piece.
   */
  display_name?: string | undefined;
}

export interface Database {
  settings: AppSettings;
  sources: Source[];
  prayers: Prayer[];
  prayer_versions: PrayerVersion[];
  mystery_sets: MysterySet[];
  mysteries: Mystery[];
  mystery_contents: MysteryContent[];
  templates: PrayerTemplate[];
  template_items: TemplateItem[];
  sessions: PrayerSession[];
  session_items: SessionItem[];
  session_plans: SessionPlan[];
  how_tos: HowTo[];
  intentions: Intention[];
  import_drafts: ImportDraft[];
  reflections: Reflection[];
  voices: Voice[];
  knowledge_items: KnowledgeItem[];
  mass_experiences: MassExperience[];
}
