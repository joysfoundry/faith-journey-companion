/**
 * Phase 1 placeholder data. Replaced by Cloud queries in phase 2+.
 * Shapes intentionally match src/domain/types.ts.
 */

import type { DailySessionView } from "./dailyRosary";

/** A — Prayer or Devotion: sessions planned for today (empty ⇒ Daily Rosary default). */
export const plannedSessions: DailySessionView[] = [
  {
    id: "placeholder-session-novena",
    title: "54-Day Rosary Novena",
    templateTitle: "54-Day Novena template · Day 12, petition phase",
    mystery: "Joyful",
    itemCount: 64,
    completedCount: 21,
    isDefault: false,
  },
];

/** Prayer library entries, searchable from Home. */
export interface LibraryPrayer {
  id: string;
  title: string;
  tags: string[];
}

export const prayerLibrary: LibraryPrayer[] = [
  { id: "prayer-memorare", title: "Memorare", tags: ["Marian", "healing", "intercession"] },
  { id: "prayer-st-michael", title: "St. Michael the Archangel", tags: ["protection"] },
  { id: "prayer-anima-christi", title: "Anima Christi", tags: ["Eucharistic", "after communion"] },
  { id: "prayer-divine-mercy", title: "Chaplet of Divine Mercy", tags: ["mercy", "chaplet"] },
  { id: "prayer-litany-loreto", title: "Litany of Loreto", tags: ["Marian", "litany"] },
  { id: "prayer-act-contrition", title: "Act of Contrition", tags: ["repentance"] },
];


/** C — Word: daily Mass readings, lived-experience metadata, and a reading program. */
export interface WordEntry {
  id: string;
  liturgicalTitle: string;
  readingsUrl: string;
  readings: string[];
  heardAtMass: boolean | null;
  church?: string | null;
  priest?: string | null;
  homilyAttachments: string[];
}

export const todaysWord: WordEntry = {
  id: "placeholder-word-1",
  liturgicalTitle: "Twentieth Sunday in Ordinary Time",
  readingsUrl: "https://bible.usccb.org/daily-bible-reading",
  readings: ["First Reading", "Responsorial Psalm", "Second Reading", "Gospel"],
  heardAtMass: null,
  church: null,
  priest: null,
  homilyAttachments: [],
};

export interface ReadingProgram {
  id: string;
  title: string;
  detail: string;
  url: string;
}

export const readingPrograms: ReadingProgram[] = [
  {
    id: "placeholder-program-biay",
    title: "Bible in a Year",
    detail: "Day 41 — reference only",
    url: "https://ascensionpress.com/pages/biay-registration",
  },
];

/** D — Learn: anything you're currently reading, watching, or listening to. */
export const LEARN_CONTENT_TYPES = [
  "book",
  "article",
  "newsletter",
  "video",
  "sermon",
  "podcast",
  "show",
  "other",
] as const;
export type LearnContentType = (typeof LEARN_CONTENT_TYPES)[number];

export const LEARN_STATUSES = ["not_started", "in_progress", "finished"] as const;
export type LearnStatus = (typeof LEARN_STATUSES)[number];

export interface LearnItem {
  id: string;
  title: string;
  creator?: string | null;
  contentType: LearnContentType;
  source?: string | null;
  url?: string | null;
  status: LearnStatus;
  hasTranscript: boolean;
}

export const learnItems: LearnItem[] = [
  {
    id: "placeholder-learn-1",
    title: "Introduction to the Devout Life",
    creator: "St. Francis de Sales",
    contentType: "book",
    source: "TAN Books",
    url: null,
    status: "in_progress",
    hasTranscript: false,
  },
  {
    id: "placeholder-learn-2",
    title: "The Meaning of Suffering",
    creator: "Fr. Michael",
    contentType: "video",
    source: "YouTube",
    url: "https://example.com/video",
    status: "in_progress",
    hasTranscript: false,
  },
];

/** Reflections written today. Journal entries can link to any item above. */
export interface ReflectionEntry {
  id: string;
  title: string;
  body: string;
  linkedItemIds: string[];
  photoCount: number;
}

export const todaysReflections: ReflectionEntry[] = [];

/** Everything a reflection can be linked to, gathered for the link picker. */
export interface LinkableItem {
  id: string;
  label: string;
  group: string;
}
