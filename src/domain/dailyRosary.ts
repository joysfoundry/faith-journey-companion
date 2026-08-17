/**
 * Daily Rosary default.
 *
 * Rule: if nothing is planned for today, the day's session defaults to the
 * Daily Rosary with the mystery set traditionally prayed on that weekday.
 */

export type MysterySetName = "Joyful" | "Sorrowful" | "Glorious" | "Luminous";

const MYSTERY_BY_WEEKDAY: MysterySetName[] = [
  "Glorious", // Sunday
  "Joyful", // Monday
  "Sorrowful", // Tuesday
  "Glorious", // Wednesday
  "Luminous", // Thursday
  "Sorrowful", // Friday
  "Joyful", // Saturday
];

export function mysteryForDate(date: Date): MysterySetName {
  return MYSTERY_BY_WEEKDAY[date.getDay()]!;
}

export interface DailySessionView {
  id: string;
  /** Session name — the thing being prayed today. */
  title: string;
  /** Template the session was compiled from. */
  templateTitle: string;
  mystery?: MysterySetName;
  itemCount: number;
  completedCount: number;
  isDefault: boolean;
}

/** The standard session used when the user has planned nothing for today. */
export function defaultDailyRosarySession(date: Date): DailySessionView {
  const mystery = mysteryForDate(date);
  return {
    id: "default-daily-rosary",
    title: "Daily Rosary",
    templateTitle: "Traditional Rosary template",
    mystery,
    itemCount: 62,
    completedCount: 0,
    isDefault: true,
  };
}
