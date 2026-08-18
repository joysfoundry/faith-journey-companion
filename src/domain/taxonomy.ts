/**
 * Faith Journey taxonomy.
 *
 * These three axes are kept strictly separate and are never collapsed into a
 * single "type" field: a prayer has a prayer_type, a devotion has a
 * devotion_type, and the way it is prayed is an expression_type.
 */

export const PRAYER_TYPES = ["liturgical", "devotional", "traditional_expression", "other"] as const;
export type PrayerType = (typeof PRAYER_TYPES)[number];

export const DEVOTION_TYPES = [
  "rosary",
  "novena",
  "chaplet",
  "stations",
  "litany",
  "consecration",
  "custom",
] as const;
export type DevotionType = (typeof DEVOTION_TYPES)[number];

export const EXPRESSION_TYPES = [
  "vocal",
  "meditation",
  "contemplation",
  "scripture",
  "silence",
  "reflection",
] as const;
export type ExpressionType = (typeof EXPRESSION_TYPES)[number];

/** Provenance honesty: we never invent an origin we do not know. */
export const PROVENANCE_STATUSES = ["known", "partially_known", "unknown"] as const;
export type ProvenanceStatus = (typeof PROVENANCE_STATUSES)[number];

export const PLAN_CADENCES = ["once", "daily", "n_days", "weekly", "custom"] as const;
export type PlanCadence = (typeof PLAN_CADENCES)[number];

export const SESSION_STATUSES = ["scheduled", "in_progress", "completed", "skipped"] as const;
export type SessionStatus = (typeof SESSION_STATUSES)[number];

export const AUDIO_PLAYBACK_MODES = ["none", "full_session", "item_by_item"] as const;
export type AudioPlaybackMode = (typeof AUDIO_PLAYBACK_MODES)[number];

export const PROGRESS_MODES = ["manual", "auto_advance", "voice_follow", "hybrid"] as const;
export type ProgressMode = (typeof PROGRESS_MODES)[number];

export const TAXONOMY_LABELS: Record<string, string> = {
  liturgical: "Liturgical",
  devotional: "Devotional",
  traditional_expression: "Traditional expression",
  other: "Other",
  rosary: "Rosary",
  novena: "Novena",
  chaplet: "Chaplet",
  stations: "Stations",
  litany: "Litany",
  consecration: "Consecration",
  custom: "Custom",
  vocal: "Vocal",
  meditation: "Meditation",
  contemplation: "Contemplation",
  scripture: "Scripture",
  silence: "Silence",
  reflection: "Reflection",
};
