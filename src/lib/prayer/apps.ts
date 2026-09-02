/**
 * Prayer-app catalog + Daily Rosary hand-off links.
 *
 * Some people pray their daily rosary in another app (e.g. Hallow) and just launch
 * that app directly. What brings them here is journaling — or already being in the
 * app — so the Daily Rosary slot should be able to launch out to their app instead
 * of starting an in-app session. Settings pick the app; this resolves the URL.
 *
 * Hallow's daily-rosary page URL is BOTH an iOS Universal Link and an Android App
 * Link — verified against hallow.com's `apple-app-site-association` + `assetlinks.json`
 * (2026-09-02; `/collections/*` is a handled path on both platforms). So the same
 * https URL opens the native Hallow app when installed and the web page otherwise,
 * automatically, per device. One URL covers "web" and "app on phone"; there is no
 * separate "force web" choice (a browser web app can't reliably defeat app links).
 *
 * Mirrors the deep-link-out idiom in `src/lib/bible/apps.ts`.
 */

import { normalizeUrl } from "@/lib/bible/apps";

export type PrayerAppId = "hallow" | "other";

export interface PrayerApp {
  id: PrayerAppId;
  name: string;
  /** One-line "what this launches". */
  blurb: string;
  /**
   * The launch URL. Hallow's is a Universal/App Link (app on phone, else web).
   * Empty for "other" — the user supplies a custom URL in Settings.
   */
  url: string;
}

/** Ordered for display. `other` is a real, selectable choice. */
export const PRAYER_APPS: PrayerApp[] = [
  {
    id: "hallow",
    name: "Hallow",
    blurb: "Opens Hallow's Daily Rosary — the app on your phone, or the web.",
    url: "https://hallow.com/collections/16/",
  },
  {
    id: "other",
    name: "Another app",
    blurb: "Launch a different app or web page by its address.",
    url: "",
  },
];

/** Where "open Hallow" falls back to when a specific page can't be resolved. */
export const HALLOW_HOME_URL = "https://hallow.com";

/** The app assumed when external mode is on but no app has been chosen yet. */
export const DEFAULT_PRAYER_APP: PrayerAppId = "hallow";

export function prayerAppById(id: string | undefined): PrayerApp | undefined {
  return PRAYER_APPS.find((a) => a.id === id);
}

/** The Daily-Rosary-related slice of app settings this module reads. */
export interface DailyRosarySettings {
  /** "external" launches an app; anything else (incl. absent) = in-app session. */
  daily_rosary_mode?: string | undefined;
  /** Which external app to launch (id from PRAYER_APPS, e.g. "hallow"). */
  daily_rosary_app_id?: string | undefined;
  /** Custom launch URL when `daily_rosary_app_id === "other"`. */
  daily_rosary_custom_url?: string | undefined;
}

/** Whether the Daily Rosary should launch an external app instead of an in-app session. */
export function isExternalDailyRosary(settings: DailyRosarySettings): boolean {
  return settings.daily_rosary_mode === "external";
}

/** The effective external-app id — the chosen app, or the Hallow default. */
export function effectivePrayerAppId(settings: DailyRosarySettings): string {
  return settings.daily_rosary_app_id ?? DEFAULT_PRAYER_APP;
}

/**
 * The URL the Daily Rosary should launch in external mode, or "" when none is
 * set. Hallow → its Universal/App Link; "other" → the user's custom URL; a known
 * app with a missing URL falls back to Hallow's home page.
 */
export function resolveDailyRosaryUrl(settings: DailyRosarySettings): string {
  const id = effectivePrayerAppId(settings);
  if (id === "other") return normalizeUrl(settings.daily_rosary_custom_url);
  return prayerAppById(id)?.url || HALLOW_HOME_URL;
}

/** A short label for the chosen app — used in row subtitles and "Open X" links. */
export function dailyRosaryAppLabel(settings: DailyRosarySettings): string {
  const id = effectivePrayerAppId(settings);
  if (id === "other") return "another app";
  return prayerAppById(id)?.name ?? "another app";
}
