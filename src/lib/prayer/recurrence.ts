/**
 * Shared, UI-agnostic helpers for editing a calendar-style {@link Recurrence}
 * in a form (frequency + interval + an "ends" mode). Used by both the Session
 * Builder and the Devotion Builder so the two controls never drift.
 */
import type { Frequency, Recurrence } from "./types";

export type EndMode = "never" | "count" | "until";

export const FREQ_OPTIONS: { value: Frequency; label: string }[] = [
  { value: "none", label: "Once" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
];

export const FREQ_UNIT_LABEL: Record<Frequency, string> = {
  none: "time",
  daily: "day",
  weekly: "week",
  monthly: "month",
  yearly: "year",
};

/** The editable pieces of a Recurrence, as form field values. */
export interface RecurrenceFieldValues {
  freq: Frequency;
  interval: string;
  endMode: EndMode;
  count: string;
  until: string;
}

/** Assemble the structured Recurrence from a form's field values. */
export function buildRecurrence(v: RecurrenceFieldValues): Recurrence {
  if (v.freq === "none") return { freq: "none", interval: 1 };
  const r: Recurrence = { freq: v.freq, interval: Math.max(1, Number(v.interval) || 1) };
  if (v.endMode === "count" && Number(v.count) > 0) r.count = Number(v.count);
  else if (v.endMode === "until" && v.until) r.until = v.until;
  return r;
}

/** Spread a stored Recurrence back into form field values. */
export function recurrenceFields(r: Recurrence | undefined): RecurrenceFieldValues {
  if (!r || r.freq === "none")
    return { freq: "none", interval: "1", endMode: "never", count: "", until: "" };
  return {
    freq: r.freq,
    interval: String(r.interval ?? 1),
    endMode: r.count ? "count" : r.until ? "until" : "never",
    count: r.count ? String(r.count) : "",
    until: r.until ?? "",
  };
}
