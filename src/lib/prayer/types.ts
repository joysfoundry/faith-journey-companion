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

/** A concrete wording of a Prayer (traditional, family, short form, ...). */
export interface PrayerVersion {
  id: ID;
  prayer_id: ID;
  label: string;
  body: string;
  language: string;
  source_id?: ID | undefined;
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
 * - salutation: a versicle / response pair (V. … R. …)
 * - mystery_placeholder: rosary decades only
 * - intention: the user's own intention slot
 * - petition: a sourced petition from the devotion
 * - meditation: a meditation prompt / reflection
 * - external_link: a link out to an external prayer experience (generic)
 * - scripture: a Scripture passage (with a citation) placeable anywhere
 * - custom: any other component the user adds
 * - heading: a plain section label
 */
export type TemplateItemKind =
  | "prayer"
  | "salutation"
  | "mystery_placeholder"
  | "intention"
  | "petition"
  | "meditation"
  | "external_link"
  | "scripture"
  | "custom"
  | "heading";

/** Compact template row. `repetition_count` is shorthand; sessions expand it. */
export interface TemplateItem {
  id: ID;
  template_id: ID;
  kind: TemplateItemKind;
  position: number;
  prayer_id?: ID | undefined;
  prayer_version_id?: ID | undefined;
  /** Which decade / mystery ordinal this placeholder refers to (1-based). */
  mystery_ordinal?: number | undefined;
  label?: string | undefined;
  /** Salutation: true = versicle/response pair; false/absent = plain text (body). */
  salutation_vr?: boolean | undefined;
  /** Salutation: the versicle line (spoken by the leader). */
  versicle?: string | undefined;
  /** Salutation: the response line. */
  response?: string | undefined;
  /** Free text for custom components, and the passage text for scripture. */
  body?: string | undefined;
  /** scripture: the citation (e.g. "Lk 1:26-38"). */
  reference?: string | undefined;
  /** external_link: selectable sources; exactly one marked is_default. */
  external_options?: ExternalLinkOption[] | undefined;
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
  include_optional: boolean;
  condition_tags: string[];
  prayer_version_overrides: Record<ID, ID>;
  audio_enabled: boolean;
  /** Chosen "how do you want to listen?" media; absent = read silently. */
  listen_source?: ListenSource | undefined;
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
  | "mystery"
  | "intention"
  | "petition"
  | "meditation"
  | "external_link"
  | "scripture"
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

/** What a reflection can be linked to. Kept flexible and target-agnostic. */
export type ReflectionLinkTarget =
  | "prayer_session"
  | "session_item"
  | "daily_reading"
  | "mass"
  | "learning"
  | "intention"
  | "mystery";

/** A link is stored ON the reflection, never on the item that inspired it. */
export interface ReflectionLink {
  target_type: ReflectionLinkTarget;
  target_id: ID;
  label?: string | undefined;
}

/** The user's own words. Always the user's own unless they ask for transformation. */
export interface Reflection {
  id: ID;
  title?: string | undefined;
  body: string;
  mode: ReflectionMode;
  links: ReflectionLink[];
  photo_count: number;
  created_at: string; // ISO datetime — date/time matters in history views
}

export type LearningStatus = "not_started" | "in_progress" | "finished";

/** Life Library item (dashboard label: Faith Learning). */
export interface LearningItem {
  id: ID;
  title: string;
  content_type: string; // book | article | video | podcast | sermon | show | ...
  creator?: string | undefined;
  source?: string | undefined;
  url?: string | undefined;
  status: LearningStatus;
  has_transcript?: boolean | undefined;
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

export interface Database {
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
  learning_items: LearningItem[];
  mass_experiences: MassExperience[];
}
