/**
 * Core domain shapes for Faith Journey (phase 1: types only, no persistence yet).
 * These mirror the planned database schema so UI can be built ahead of Cloud.
 */

import type {
  AudioPlaybackMode,
  DevotionType,
  ExpressionType,
  PlanCadence,
  PrayerType,
  ProgressMode,
  ProvenanceStatus,
  SessionStatus,
} from "./taxonomy";

export interface Source {
  id: string;
  title: string;
  author?: string | null;
  url?: string | null;
  retrievedAt?: string | null;
  provenanceStatus: ProvenanceStatus;
  notes?: string | null;
}

export interface Prayer {
  id: string;
  title: string;
  prayerType: PrayerType;
  expressionType: ExpressionType;
  body: string;
  sourceId?: string | null;
  traditionalDurationSeconds?: number | null;
}

export interface Devotion {
  id: string;
  title: string;
  devotionType: DevotionType;
  summary?: string | null;
  sourceId?: string | null;
}

export interface PrayerTemplate {
  id: string;
  title: string;
  devotionId?: string | null;
  itemCount: number;
}

export interface PrayerPlan {
  id: string;
  templateId: string;
  cadence: PlanCadence;
  startDate: string;
  dayCount?: number | null;
  weekdays?: number[] | null;
}

export interface PrayerSession {
  id: string;
  planId?: string | null;
  templateId: string;
  title: string;
  scheduledFor: string;
  status: SessionStatus;
  audioPlaybackMode: AudioPlaybackMode;
  progressMode: ProgressMode;
  /** Photos captured during this session. MVP placeholder — see PhotoAttachment. */
  photoIds: string[];
}

export interface SessionItem {
  id: string;
  sessionId: string;
  prayerId: string;
  position: number;
  /** Completion lives here only — 10 Hail Marys are 10 rows with the same prayerId. */
  completedAt?: string | null;
  traditionalDurationSeconds?: number | null;
  chosenDurationSeconds?: number | null;
}

export interface Intention {
  id: string;
  text: string;
  createdAt: string;
}

export interface Need {
  id: string;
  text: string;
  createdAt: string;
}

export interface Reflection {
  id: string;
  body: string;
  createdAt: string;
  /** Photos attached to this reflection. MVP placeholder. */
  photoIds: string[];
}

/* -------------------------------------------------------------------------- */
/* Photos & Gallery — MVP placeholder                                          */
/* -------------------------------------------------------------------------- */

/** Where a photo was captured from. Every photo flows into the single Gallery. */
export const PHOTO_CONTEXTS = ["prayer_session", "reflection", "mass", "life_library"] as const;
export type PhotoContext = (typeof PHOTO_CONTEXTS)[number];

/**
 * Photo record (planned table: `photos`).
 * Phase 1 stores nothing; storage upload + gallery browsing land with Cloud.
 */
export interface Photo {
  id: string;
  /** Storage object path once Cloud storage is enabled. */
  storagePath: string | null;
  /** Local/remote preview URL for rendering. */
  previewUrl: string | null;
  caption?: string | null;
  capturedAt: string;
  context: PhotoContext;
  /** Session / reflection / mass id the photo was captured in, if any. */
  contextId?: string | null;
}

/**
 * Join record (planned table: `photo_attachments`) so one photo can appear on a
 * session, a reflection, and the gallery without duplication.
 */
export interface PhotoAttachment {
  id: string;
  photoId: string;
  context: PhotoContext;
  contextId: string;
}

/** Gallery view model: chronological, groupable by day or by context. */
export interface GalleryEntry {
  photo: Photo;
  contextLabel: string;
}

/** Placeholder gallery data source until photo capture + Cloud storage land. */
export const GALLERY_PLACEHOLDER: GalleryEntry[] = [];
