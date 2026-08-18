import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  EXPRESSION_TYPES,
  PRAYER_TYPES,
  TAXONOMY_LABELS,
  type ExpressionType,
  type PrayerType,
} from "@/domain/taxonomy";
import type { Prayer, PrayerVersion } from "@/lib/prayer/types";
import { newId } from "@/lib/prayer/compiler";

export interface PrayerDraft {
  title: string;
  body: string;
  prayerType: PrayerType;
  expressionType: ExpressionType;
}

export const EMPTY_PRAYER_DRAFT: PrayerDraft = {
  title: "",
  body: "",
  prayerType: "devotional",
  expressionType: "vocal",
};

/**
 * Single place that turns the shared prayer form into store records, so manual
 * entry and the prayer editor never drift apart.
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
      prayer_type: draft.prayerType,
      expression_type: draft.expressionType,
      tags: prayer?.tags ?? [],
      favorite: prayer?.favorite ?? false,
      default_version_id: versionId,
      created_at: prayer?.created_at ?? now,
      ...(prayer?.devotion_type ? { devotion_type: prayer.devotion_type } : {}),
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

interface TaxonomySelectProps {
  id: string;
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
}

/** Reusable labelled select over a taxonomy axis. */
export function TaxonomySelect({ id, label, value, options, onChange }: TaxonomySelectProps) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 h-12 w-full rounded-md border border-input bg-card px-3"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {TAXONOMY_LABELS[o] ?? o}
          </option>
        ))}
      </select>
    </div>
  );
}

interface PrayerFieldsProps {
  draft: PrayerDraft;
  onChange: (draft: PrayerDraft) => void;
  idPrefix?: string;
  rows?: number;
  /** Hide the title input when the caller collects the title elsewhere. */
  showTitle?: boolean;
}

/** Title · prayer type · expression type · text — every single prayer needs these. */
export function PrayerFields({
  draft,
  onChange,
  idPrefix = "prayer",
  rows = 10,
  showTitle = true,
}: PrayerFieldsProps) {
  return (
    <div className="space-y-4">
      {showTitle ? (
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
      ) : null}
      <TaxonomySelect
        id={`${idPrefix}-prayer-type`}
        label="Prayer type"
        value={draft.prayerType}
        options={PRAYER_TYPES}
        onChange={(v) => onChange({ ...draft, prayerType: v as PrayerType })}
      />
      <TaxonomySelect
        id={`${idPrefix}-expression-type`}
        label="How it is prayed"
        value={draft.expressionType}
        options={EXPRESSION_TYPES}
        onChange={(v) => onChange({ ...draft, expressionType: v as ExpressionType })}
      />
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
