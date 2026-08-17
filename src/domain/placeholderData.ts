/**
 * Phase 1 placeholder data. Replaced by Cloud queries in phase 2+.
 * Shapes intentionally match src/domain/types.ts.
 */

import type { GalleryEntry, PrayerSession, Reflection } from "./types";

export const todaySessions: Array<
  Pick<PrayerSession, "id" | "title" | "status" | "scheduledFor" | "photoIds"> & {
    subtitle: string;
    itemCount: number;
    completedCount: number;
  }
> = [
  {
    id: "placeholder-session-1",
    title: "Caro Family Rosary",
    subtitle: "Joyful Mysteries · Monday",
    scheduledFor: "morning",
    status: "scheduled",
    itemCount: 62,
    completedCount: 0,
    photoIds: [],
  },
  {
    id: "placeholder-session-2",
    title: "54-Day Rosary Novena",
    subtitle: "Day 12 · Petition phase",
    scheduledFor: "evening",
    status: "in_progress",
    itemCount: 64,
    completedCount: 21,
    photoIds: [],
  },
];

export const inProgressItems = [
  { id: "placeholder-life-1", title: "Introduction to the Devout Life", detail: "Part II, ch. 9" },
  { id: "placeholder-life-2", title: "Bible in a Year", detail: "Reference only — day 41" },
];

export const recentReflections: Array<Reflection & { title: string }> = [
  {
    id: "placeholder-reflection-1",
    title: "After the Chaplet of St. Michael",
    body: "Placeholder reflection. Your own words will live here.",
    createdAt: "yesterday",
    photoIds: [],
  },
];

/** Gallery is a placeholder in MVP: photos captured in prayer or reflection feed it. */
export const galleryPlaceholder: GalleryEntry[] = [];
