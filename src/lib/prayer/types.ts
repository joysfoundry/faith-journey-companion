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
  | "written"
  | "manual"
  | "pdf"
  | "document"
  | "text"
  | "web"
  | "image"
  | "audio"
  | "video";

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

/** Reusable prayer content. Never carries completion state. */
export interface Prayer {
  id: ID;
  title: string;
  prayer_type: PrayerTypeValue;
  expression_type: ExpressionTypeValue;
  devotion_type?: DevotionTypeValue | undefined;
  tags: string[];
  favorite: boolean;
  default_version_id: ID;
  source_id?: ID | undefined;
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
  | "title_only"
  | "short_description"
  | "full_meditation"
  | "scripture"
  | "family"
  | "devotion";

export interface MysteryContent {
  id: ID;
  mystery_id: ID;
  variant: MysteryContentVariant;
  body: string;
  source_id?: ID | undefined;
}

export type MysteryPresentation =
  | "title_only"
  | "title_and_description"
  | "choose_during_session";

export type TemplateItemKind =
  | "prayer"
  | "mystery_placeholder"
  | "intention"
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
  repetition_count: number;
  optional: boolean;
  /** Only included when the session context enables this group. */
  condition_tag?: string | undefined;
}

export type TemplateKind = "standard" | "rosary" | "novena";

export interface PrayerTemplate {
  id: ID;
  name: string;
  description?: string | undefined;
  kind: TemplateKind;
  mystery_presentation: MysteryPresentation;
  /** Rosary/Novena helper: how many mystery placeholders the template expects. */
  mystery_count: number;
  /** Novena config — duration is never assumed to be nine days. */
  novena?: NovenaConfig | undefined;
  source_id?: ID | undefined;
  built_in: boolean;
  created_at: string;
}

export interface NovenaPhase {
  id: ID;
  name: string;
  start_day: number;
  end_day: number;
  /** Prayers tagged with this condition tag are included during the phase. */
  condition_tag?: string | undefined;
  note?: string | undefined;
}

export interface NovenaConfig {
  duration_days: number;
  phases: NovenaPhase[];
  /** Rotating mystery cycle by MysterySet id, applied day by day. */
  mystery_cycle: ID[];
}

export interface NovenaInstance {
  id: ID;
  template_id: ID;
  name: string;
  start_date: string; // yyyy-mm-dd
  intention_id?: ID | undefined;
  created_at: string;
}

export interface Intention {
  id: ID;
  title: string;
  body?: string | undefined;
  created_at: string;
}

export type ProgressMode = "scroll" | "manual_done";

export interface SessionContext {
  date: string; // yyyy-mm-dd
  mystery_set_id?: ID | undefined;
  novena_instance_id?: ID | undefined;
  novena_day?: number | undefined;
  novena_phase_id?: ID | undefined;
  progress_mode: ProgressMode;
  mystery_presentation?: MysteryPresentation | undefined;
  include_optional: boolean;
  condition_tags: string[];
  prayer_version_overrides: Record<ID, ID>;
  audio_enabled: boolean;
}

export interface PrayerSession {
  id: ID;
  template_id: ID;
  title: string;
  context: SessionContext;
  created_at: string;
  completed_at?: string | undefined;
  /** Index of the item the user is currently on. */
  cursor: number;
}

export type SessionItemKind = "prayer" | "mystery" | "intention" | "heading";
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
  /** Template started when the user taps "Start Prayer". */
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
  | "novena"
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
  /** For how_to candidates: the specific template/novena these instructions describe. */
  link_template_id?: ID | undefined;
}

export interface ImportDraft {
  id: ID;
  source: Source;
  raw_text: string;
  candidates: ImportCandidate[];
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
  how_tos: HowTo[];
  intentions: Intention[];
  novena_instances: NovenaInstance[];
  import_drafts: ImportDraft[];
}
