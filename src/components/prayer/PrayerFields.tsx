import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Prayer, PrayerCategory, PrayerVersion } from "@/lib/prayer/types";
import { newId } from "@/lib/prayer/compiler";

export const PRAYER_CATEGORIES: PrayerCategory[] = [
  "core",
  "marian",
  "closing",
  "devotional",
  "family",
  "other",
];

export interface PrayerDraft {
  title: string;
  body: string;
  category: PrayerCategory;
}

/**
 * Single place that turns the shared prayer form into store records, so the
 * manual-entry flow and the prayer editor never drift apart.
 */
export function buildPrayerRecords(
  draft: PrayerDraft,
  existing?: { prayer?: Prayer | undefined; version?: PrayerVersion | undefined },
): { prayer: Prayer; version: PrayerVersion } {
  const prayer = existing?.prayer;
  const version = existing?.version;
  const id = prayer?.id ?? newId("prayer");
  const versionId = version?.id ?? newId("ver");
  const now = new Date().toISOString();
  return {
    prayer: {
      id,
      title: draft.title.trim(),
      category: draft.category,
      tags: prayer?.tags ?? [],
      favorite: prayer?.favorite ?? false,
      default_version_id: versionId,
      created_at: prayer?.created_at ?? now,
      ...(prayer?.source_id ? { source_id: prayer.source_id } : {}),
    },
    version: {
      id: versionId,
      prayer_id: id,
      label: version?.label ?? "Traditional",
      body: draft.body.trim(),
      language: "en",
      created_at: version?.created_at ?? now,
    },
  };
}

interface PrayerFieldsProps {
  draft: PrayerDraft;
  onChange: (draft: PrayerDraft) => void;
  idPrefix?: string;
  rows?: number;
}

/** Title · category · text — the fields every single prayer needs. */
export function PrayerFields({ draft, onChange, idPrefix = "prayer", rows = 10 }: PrayerFieldsProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor={`${idPrefix}-title`}>Title</Label>
        <Input
          id={`${idPrefix}-title`}
          value={draft.title}
          onChange={(e) => onChange({ ...draft, title: e.target.value })}
          placeholder="Hail Holy Queen"
          className="mt-1 h-12"
        />
      </div>
      <div>
        <Label htmlFor={`${idPrefix}-category`}>Category</Label>
        <select
          id={`${idPrefix}-category`}
          value={draft.category}
          onChange={(e) => onChange({ ...draft, category: e.target.value as PrayerCategory })}
          className="mt-1 h-12 w-full rounded-md border border-input bg-card px-3"
        >
          {PRAYER_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <div>
        <Label htmlFor={`${idPrefix}-body`}>Prayer text</Label>
        <Textarea
          id={`${idPrefix}-body`}
          value={draft.body}
          onChange={(e) => onChange({ ...draft, body: e.target.value })}
          rows={rows}
          placeholder="Hail, Holy Queen, Mother of Mercy…"
          className="mt-1"
        />
      </div>
    </div>
  );
}
