import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import { fetchSourceText } from "@/lib/prayer/fetchSource.functions";
import { AppShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  PrayerFields,
  EMPTY_PRAYER_DRAFT,
  TaxonomySelect,
  buildPrayerRecords,
  type PrayerDraft,
} from "@/components/prayer/PrayerFields";
import { MediaEditor } from "@/components/media/MediaEditor";
import { PhotoDropzone, type LocalPhoto } from "@/components/media/PhotoDropzone";
import { useApp } from "@/lib/prayer/store";
import {
  analyzeText,
  detectRecurrence,
  resolveAttribution,
  similarity,
} from "@/lib/prayer/importer";
import { newId, recurrenceLabel } from "@/lib/prayer/compiler";
import {
  buildRecurrence,
  FREQ_OPTIONS,
  FREQ_UNIT_LABEL,
  recurrenceFields,
  type EndMode,
} from "@/lib/prayer/recurrence";
import {
  EXPRESSION_TYPES,
  PRAYER_TYPES,
  TAXONOMY_LABELS,
  type ExpressionType,
  type PrayerType,
} from "@/domain/taxonomy";
import type {
  Frequency,
  ImportCandidate,
  ImportDraft,
  PrayerHour,
  Recurrence,
  Source,
  SourceType,
} from "@/lib/prayer/types";

const HOUR_LABEL: Record<PrayerHour, string> = {
  office_of_readings: "Office of Readings",
  lauds: "Morning Prayer (Lauds)",
  daytime: "Daytime Prayer",
  vespers: "Evening Prayer (Vespers)",
  compline: "Night Prayer (Compline)",
};

type ImportMode = "single" | "devotion" | "howto";

export const Route = createFileRoute("/import")({
  validateSearch: (search: Record<string, unknown>): { mode?: ImportMode } => {
    const mode = search["mode"];
    return mode === "single" || mode === "devotion" || mode === "howto" ? { mode } : {};
  },
  head: () => ({
    meta: [
      { title: "Devotion Builder — Oravia" },
      {
        name: "description",
        content:
          "Build a devotion or add a single prayer — by hand, from a link, or from a photo — and review it before it enters your library.",
      },
      { property: "og:title", content: "Devotion Builder — Oravia" },
      { property: "og:description", content: "Nothing is saved until you review it." },
    ],
  }),
  component: AddPrayerPage,
});

type What = "single" | "devotion";
type How = "manual" | "url" | "photo" | "paste";

const SINGLE_HOWS: { key: How; label: string }[] = [
  { key: "manual", label: "Enter manually" },
  { key: "url", label: "From a link" },
  { key: "photo", label: "From a photo" },
];
const DEVOTION_HOWS: { key: How; label: string }[] = [
  { key: "manual", label: "By hand" },
  { key: "paste", label: "Paste text" },
  { key: "url", label: "From a link" },
  { key: "photo", label: "From a photo" },
];

const DECISIONS: Array<{ value: ImportCandidate["decision"]; label: string }> = [
  { value: "save_new", label: "Save as new" },
  { value: "use_existing", label: "Use existing" },
  { value: "save_alternate_version", label: "Save as alternate version" },
  { value: "skip", label: "Skip" },
];

function Segmented<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { key: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div
      className="grid gap-2"
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0,1fr))` }}
    >
      {options.map((o) => (
        <button
          key={o.key}
          type="button"
          onClick={() => onChange(o.key)}
          className={
            "h-11 rounded-md border px-2 text-sm font-medium transition-colors " +
            (value === o.key
              ? "border-primary bg-primary text-primary-foreground"
              : "border-input bg-card text-muted-foreground")
          }
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function AddPrayerPage() {
  const { db, upsertPrayer, addPrayerVariant, addSource, saveImportDraft, applyImportDraft } =
    useApp();
  const navigate = useNavigate();
  const { mode } = Route.useSearch();
  const loadSource = useServerFn(fetchSourceText);

  // Prayers tab → single prayer; Devotions tab → a devotion. Mirrors the tab you
  // came from so the right form is showing on arrival.
  const [what, setWhat] = useState<What>(mode === "devotion" ? "devotion" : "single");
  const [how, setHow] = useState<How>(mode === "devotion" ? "paste" : "manual");

  // Shared intake helpers
  const [url, setUrl] = useState("");
  const [fetching, setFetching] = useState(false);
  const [photos, setPhotos] = useState<LocalPhoto[]>([]);

  // Single-prayer state
  const [draft, setDraft] = useState<PrayerDraft>(EMPTY_PRAYER_DRAFT);
  const [sourceName, setSourceName] = useState("");
  const [reviewingSingle, setReviewingSingle] = useState(false);

  // Devotion (bundle) state
  const [devotionName, setDevotionName] = useState("");
  const [devDescription, setDevDescription] = useState("");
  const [devSourceName, setDevSourceName] = useState("");
  const [devSourceUrl, setDevSourceUrl] = useState("");
  const [raw, setRaw] = useState("");
  const [notes, setNotes] = useState("");
  const [bundleType, setBundleType] = useState<PrayerType>("traditional_expression");
  const [bundleExpr, setBundleExpr] = useState<ExpressionType>("vocal");
  const [importDraft, setImportDraft] = useState<ImportDraft | null>(null);

  function pickWhat(next: What) {
    setWhat(next);
    setHow(next === "single" ? "manual" : "paste");
    setReviewingSingle(false);
    setImportDraft(null);
  }

  // --- URL fetch: fills the right target for the current mode ----------------
  async function fetchFromUrl() {
    const target = url.trim();
    if (!/^https?:\/\//i.test(target)) {
      toast.error("Add a full link starting with https://");
      return;
    }
    setFetching(true);
    try {
      const result = await loadSource({ data: { url: target } });
      if (!result.ok || !result.text.trim()) {
        toast.error(result.error ?? "Nothing readable came back — paste the text instead.");
        return;
      }
      if (what === "single") {
        setDraft((d) => ({
          ...d,
          title: d.title.trim() || result.title || d.title,
          body: result.text,
        }));
      } else {
        setRaw(result.text);
        if (!devotionName.trim() && result.title) setDevotionName(result.title);
        // Auto-fill what the source gives us: the page as the source + its link.
        if (!devSourceUrl.trim()) setDevSourceUrl(target);
        if (!devSourceName.trim()) {
          try {
            setDevSourceName(new URL(target).hostname.replace(/^www\./, ""));
          } catch {
            /* leave blank */
          }
        }
      }
      toast.success("Fetched — check the text, then review.");
    } catch {
      toast.error("That page couldn't be read. Copy and paste the text instead.");
    } finally {
      setFetching(false);
    }
  }

  // --- Single prayer: dedupe + save ------------------------------------------
  const bestDuplicate = (() => {
    const body = draft.body.trim();
    if (body.length < 12) return undefined;
    let best = 0;
    let match: (typeof db.prayers)[number] | undefined;
    for (const p of db.prayers) {
      if (p.is_default_variant === false) continue;
      const vbody = db.prayer_versions.find((v) => v.id === p.default_version_id)?.body ?? "";
      const s = similarity(body, vbody);
      if (s > best) {
        best = s;
        match = p;
      }
    }
    return match && best > 0.6 ? { prayer: match, score: best } : undefined;
  })();

  function makeSourceId(): string | undefined {
    if (!sourceName.trim() && !url.trim()) return undefined;
    const id = newId("source");
    const src: Source = {
      id,
      source_type: url.trim() ? "web" : "manual",
      name: sourceName.trim() || (url.trim() ? "Fetched from a link" : "Added by me"),
      created_at: new Date().toISOString(),
      ...(url.trim() ? { url: url.trim() } : {}),
      ...(photos.length ? { metadata: { photo_count: String(photos.length) } } : {}),
    };
    addSource(src);
    return id;
  }

  function saveSingleNew() {
    const records = buildPrayerRecords(draft);
    const sourceId = makeSourceId();
    upsertPrayer(
      { ...records.prayer, is_default_variant: true, ...(sourceId ? { source_id: sourceId } : {}) },
      records.version,
    );
    toast.success("Added to your library");
    navigate({ to: "/prayers" });
  }

  function saveSingleAsVariant() {
    if (!bestDuplicate) return;
    addPrayerVariant(bestDuplicate.prayer.id, {
      label: draft.title.trim() || "Alternate wording",
      body: draft.body.trim(),
    });
    toast.success(`Saved as a version of “${bestDuplicate.prayer.title}”`);
    navigate({ to: "/prayer/$prayerId", params: { prayerId: bestDuplicate.prayer.id } });
  }

  // --- Devotion (bundle): analyze -> review -> apply -------------------------
  function analyzeBundle() {
    if (!raw.trim()) {
      toast.error("Add the devotion text first.");
      return;
    }
    if (!devotionName.trim()) {
      toast.error("Name the devotion.");
      return;
    }
    const { url: resolvedUrl, attribution } = resolveAttribution(raw, devSourceUrl || url);
    const sourceUrl = devSourceUrl.trim() || resolvedUrl;
    const source: Source = {
      id: newId("source"),
      source_type: sourceUrl ? "web" : "text",
      name: devSourceName.trim() || devotionName.trim(),
      attribution,
      created_at: new Date().toISOString(),
      ...(sourceUrl ? { url: sourceUrl } : {}),
      ...(photos.length ? { metadata: { photo_count: String(photos.length) } } : {}),
    };
    const next = analyzeText(db, raw, source);
    next.candidates = next.candidates.map((c) =>
      c.classification === "prayer" || c.classification === "prayer_version"
        ? {
            ...c,
            prayer_type: c.prayer_type ?? bundleType,
            expression_type: c.expression_type ?? bundleExpr,
          }
        : c,
    );
    // Detect a default schedule from the text (e.g. "54-Day Rosary" → daily × 54).
    const detected = detectRecurrence(`${devotionName} ${notes} ${raw}`);
    next.devotion = {
      name: devotionName.trim(),
      ...(devDescription.trim() ? { description: devDescription.trim() } : {}),
      ...(notes.trim() ? { notes: notes.trim() } : {}),
      ...(detected ? { recurrence: detected } : {}),
    };
    setImportDraft(next);
    saveImportDraft(next);
  }

  function patchDevotion(patch: Partial<NonNullable<ImportDraft["devotion"]>>) {
    setImportDraft((cur) => {
      if (!cur || !cur.devotion) return cur;
      const next = { ...cur, devotion: { ...cur.devotion, ...patch } };
      saveImportDraft(next);
      return next;
    });
  }

  function patchCandidate(id: string, patch: Partial<ImportCandidate>) {
    setImportDraft((cur) => {
      if (!cur) return cur;
      const next = {
        ...cur,
        candidates: cur.candidates.map((c) => (c.id === id ? { ...c, ...patch } : c)),
      };
      saveImportDraft(next);
      return next;
    });
  }

  function commitBundle() {
    if (!importDraft) return;
    applyImportDraft(importDraft.id);
    toast.success("Devotion and prayers added");
    navigate({ to: "/prayers" });
  }

  const urlBox = (
    <div>
      <Label htmlFor="surl">Link</Label>
      <div className="mt-1 flex gap-2">
        <Input
          id="surl"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://…"
          className="h-12"
        />
        <Button
          type="button"
          variant="secondary"
          className="h-12 shrink-0"
          disabled={fetching}
          onClick={fetchFromUrl}
        >
          {fetching ? "Fetching…" : "Fetch"}
        </Button>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        We pull the title and text off the page. If it&apos;s blocked, paste the text instead.
      </p>
    </div>
  );

  const photoBox = (
    <PhotoDropzone
      label="Photo or scan"
      hint="Snap or drop a page, holy card, or prayer sheet. Reading text from the image needs the AI connector — for now, type the words below."
      photos={photos}
      onChange={setPhotos}
    />
  );

  return (
    <AppShell
      title="Devotion Builder"
      subtitle="Build a devotion, or add a single prayer"
      back={{ to: "/prayers", label: "Prayers" }}
    >
      {/* ---- Single-prayer review ---- */}
      {what === "single" && reviewingSingle ? (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Review before saving. Nothing is stored until you confirm.
          </p>
          <article className="soft-card space-y-2 p-4">
            <div className="flex items-start justify-between gap-2">
              <p className="font-display text-lg">{draft.title || "Untitled prayer"}</p>
              <span className="eyebrow shrink-0">{TAXONOMY_LABELS[draft.prayerType]}</span>
            </div>
            <p className="whitespace-pre-line text-sm text-muted-foreground">{draft.body}</p>
            <p className="text-xs text-muted-foreground">
              {TAXONOMY_LABELS[draft.expressionType]}
              {draft.tags.filter(Boolean).length
                ? ` · ${draft.tags.filter(Boolean).join(", ")}`
                : ""}
              {draft.media.length ? ` · ${draft.media.length} media` : ""}
              {sourceName.trim() ? ` · Source: ${sourceName.trim()}` : ""}
            </p>
          </article>

          {bestDuplicate ? (
            <div className="soft-card p-4">
              <p className="text-sm text-primary">
                Looks like “{bestDuplicate.prayer.title}” is already in your library (
                {Math.round(bestDuplicate.score * 100)}% match).
              </p>
              <Button
                variant="secondary"
                className="mt-2 h-11 w-full"
                onClick={saveSingleAsVariant}
              >
                Save as a version of “{bestDuplicate.prayer.title}”
              </Button>
              <p className="mt-1 text-xs text-muted-foreground">
                (Media attaches to a new prayer, not to a version — save as new to keep
                audio/video.)
              </p>
            </div>
          ) : null}

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="h-12 flex-1"
              onClick={() => setReviewingSingle(false)}
            >
              Back to edit
            </Button>
            <Button
              className="h-12 flex-1"
              onClick={saveSingleNew}
              disabled={!draft.title.trim() || !draft.body.trim()}
            >
              Save to library
            </Button>
          </div>
        </div>
      ) : /* ---- Devotion review ---- */ importDraft ? (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {importDraft.candidates.length} section{importDraft.candidates.length === 1 ? "" : "s"}{" "}
            detected in {importDraft.source.name}. Nothing is saved until you confirm.
          </p>

          {/* Default schedule detected from the text (e.g. "54-day" → daily × 54),
              editable in case detection is off. Saved onto the devotion. */}
          {(() => {
            const rf = recurrenceFields(importDraft.devotion?.recurrence);
            const setRec = (next: Partial<typeof rf>) => {
              const merged = { ...rf, ...next };
              patchDevotion({ recurrence: buildRecurrence(merged) });
            };
            return (
              <div className="soft-card space-y-3 p-4">
                <p className="eyebrow">Default schedule</p>
                <p className="-mt-1 text-xs text-muted-foreground">
                  {importDraft.devotion?.recurrence
                    ? `Detected: ${recurrenceLabel(importDraft.devotion.recurrence)}. Adjust if it read the text wrong.`
                    : "No repeat detected — set one if this devotion is prayed over several days."}
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="imp-freq">Repeats</Label>
                    <select
                      id="imp-freq"
                      value={rf.freq}
                      onChange={(e) => setRec({ freq: e.target.value as Frequency })}
                      className="mt-1 h-11 w-full rounded-md border border-input bg-card px-3 text-sm"
                    >
                      {FREQ_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  {rf.freq !== "none" ? (
                    <div>
                      <Label htmlFor="imp-end">Ends</Label>
                      <select
                        id="imp-end"
                        value={rf.endMode}
                        onChange={(e) => setRec({ endMode: e.target.value as EndMode })}
                        className="mt-1 h-11 w-full rounded-md border border-input bg-card px-3 text-sm"
                      >
                        <option value="never">Never</option>
                        <option value="count">After N times</option>
                        <option value="until">On date</option>
                      </select>
                    </div>
                  ) : null}
                </div>
                {rf.freq !== "none" && rf.endMode === "count" ? (
                  <div>
                    <Label htmlFor="imp-count">How many {FREQ_UNIT_LABEL[rf.freq]}s?</Label>
                    <Input
                      id="imp-count"
                      type="number"
                      min={1}
                      inputMode="numeric"
                      value={rf.count}
                      placeholder="9, 54…"
                      onChange={(e) => setRec({ count: e.target.value })}
                      className="mt-1 h-11"
                    />
                  </div>
                ) : null}
                {rf.freq !== "none" && rf.endMode === "until" ? (
                  <div>
                    <Label htmlFor="imp-until">Until</Label>
                    <Input
                      id="imp-until"
                      type="date"
                      value={rf.until}
                      onChange={(e) => setRec({ until: e.target.value })}
                      className="mt-1 h-11"
                    />
                  </div>
                ) : null}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="imp-hour">Hour (tag)</Label>
                    <select
                      id="imp-hour"
                      value={importDraft.devotion?.hour ?? ""}
                      onChange={(e) =>
                        patchDevotion({
                          hour: (e.target.value || undefined) as PrayerHour | undefined,
                        })
                      }
                      className="mt-1 h-11 w-full rounded-md border border-input bg-card px-3 text-sm"
                    >
                      <option value="">No set hour</option>
                      {(Object.keys(HOUR_LABEL) as PrayerHour[]).map((h) => (
                        <option key={h} value={h}>
                          {HOUR_LABEL[h]}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="imp-time">Start time</Label>
                    <Input
                      id="imp-time"
                      type="time"
                      value={importDraft.devotion?.start_time ?? ""}
                      onChange={(e) => patchDevotion({ start_time: e.target.value || undefined })}
                      className="mt-1 h-11"
                    />
                  </div>
                </div>
              </div>
            );
          })()}

          {importDraft.candidates.map((c) => {
            const duplicate = db.prayers.find((p) => p.id === c.duplicate_of_prayer_id);
            const isPrayer = c.classification === "prayer" || c.classification === "prayer_version";
            return (
              <article key={c.id} className="soft-card p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium">{c.title}</p>
                  <span className="eyebrow shrink-0">{c.classification.replace(/_/g, " ")}</span>
                </div>
                <p className="mt-2 line-clamp-4 whitespace-pre-line text-sm text-muted-foreground">
                  {c.body}
                </p>
                {duplicate ? (
                  <p className="mt-2 text-sm text-primary">
                    Looks like “{duplicate.title}” already in your library (
                    {Math.round((c.similarity ?? 0) * 100)}% match).
                  </p>
                ) : null}
                <select
                  value={c.decision}
                  aria-label={`Decision for ${c.title}`}
                  onChange={(e) =>
                    patchCandidate(c.id, {
                      decision: e.target.value as ImportCandidate["decision"],
                    })
                  }
                  className="mt-3 h-11 w-full rounded-md border border-input bg-card px-3 text-sm"
                >
                  {DECISIONS.map((d) => (
                    <option key={d.value} value={d.value}>
                      {d.label}
                    </option>
                  ))}
                </select>
                {isPrayer && c.decision === "save_new" ? (
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    <select
                      value={c.prayer_type ?? "traditional_expression"}
                      aria-label={`Prayer type for ${c.title}`}
                      onChange={(e) =>
                        patchCandidate(c.id, { prayer_type: e.target.value as PrayerType })
                      }
                      className="h-11 w-full rounded-md border border-input bg-card px-3 text-sm"
                    >
                      {PRAYER_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {TAXONOMY_LABELS[t]}
                        </option>
                      ))}
                    </select>
                    <select
                      value={c.expression_type ?? "vocal"}
                      aria-label={`How ${c.title} is prayed`}
                      onChange={(e) =>
                        patchCandidate(c.id, { expression_type: e.target.value as ExpressionType })
                      }
                      className="h-11 w-full rounded-md border border-input bg-card px-3 text-sm"
                    >
                      {EXPRESSION_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {TAXONOMY_LABELS[t]}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : null}
              </article>
            );
          })}
          <div className="flex gap-2">
            <Button variant="outline" className="h-12 flex-1" onClick={() => setImportDraft(null)}>
              Back
            </Button>
            <Button className="h-12 flex-1" onClick={commitBundle}>
              Add to library
            </Button>
          </div>
        </div>
      ) : (
        /* ---- Intake form ---- */
        <div className="space-y-4">
          <div>
            <Label>What are you adding?</Label>
            <div className="mt-1">
              <Segmented<What>
                value={what}
                onChange={pickWhat}
                options={[
                  { key: "single", label: "A single prayer" },
                  { key: "devotion", label: "A devotion (multiple prayers)" },
                ]}
              />
            </div>
          </div>

          <div>
            <Label>How?</Label>
            <div className="mt-1">
              <Segmented<How>
                value={how}
                onChange={(v) => {
                  // "By hand" is the full drag-and-drop devotion editor.
                  if (what === "devotion" && v === "manual") {
                    navigate({ to: "/template/$templateId", params: { templateId: "new" } });
                    return;
                  }
                  setHow(v);
                }}
                options={what === "single" ? SINGLE_HOWS : DEVOTION_HOWS}
              />
            </div>
          </div>

          {how === "url" ? urlBox : null}
          {how === "photo" ? photoBox : null}

          {what === "single" ? (
            <div className="soft-card space-y-4 p-4">
              <PrayerFields draft={draft} onChange={setDraft} />
              <div>
                <Label htmlFor="ssource">Source (optional)</Label>
                <Input
                  id="ssource"
                  value={sourceName}
                  onChange={(e) => setSourceName(e.target.value)}
                  placeholder="USCCB, a booklet, a website…"
                  className="mt-1 h-12"
                />
              </div>
              <MediaEditor
                media={draft.media}
                onChange={(media) => setDraft((d) => ({ ...d, media }))}
              />
              <Button
                className="h-12 w-full"
                onClick={() => {
                  if (!draft.title.trim() || !draft.body.trim()) {
                    toast.error("A prayer needs a title and text.");
                    return;
                  }
                  setReviewingSingle(true);
                }}
              >
                Review prayer
              </Button>
            </div>
          ) : (
            <div className="soft-card space-y-4 p-4">
              <div>
                <Label htmlFor="dname">Devotion name</Label>
                <Input
                  id="dname"
                  value={devotionName}
                  onChange={(e) => setDevotionName(e.target.value)}
                  placeholder="Divine Mercy Chaplet, a family rosary…"
                  className="mt-1 h-12"
                />
              </div>
              <div>
                <Label htmlFor="ddesc">Description (optional)</Label>
                <Input
                  id="ddesc"
                  value={devDescription}
                  onChange={(e) => setDevDescription(e.target.value)}
                  placeholder="One line on what this devotion is"
                  className="mt-1 h-12"
                />
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <div>
                  <Label htmlFor="dsrcname">Source (optional)</Label>
                  <Input
                    id="dsrcname"
                    value={devSourceName}
                    onChange={(e) => setDevSourceName(e.target.value)}
                    placeholder="USCCB, a booklet…"
                    className="mt-1 h-12"
                  />
                </div>
                <div>
                  <Label htmlFor="dsrcurl">Source link (optional)</Label>
                  <Input
                    id="dsrcurl"
                    type="url"
                    value={devSourceUrl}
                    onChange={(e) => setDevSourceUrl(e.target.value)}
                    placeholder="https://…"
                    className="mt-1 h-12"
                  />
                </div>
              </div>
              <TaxonomySelect
                id="bundle-type"
                label="Default prayer type"
                value={bundleType}
                options={PRAYER_TYPES}
                onChange={(v) => setBundleType(v as PrayerType)}
              />
              <TaxonomySelect
                id="bundle-expr"
                label="How they are prayed"
                value={bundleExpr}
                options={EXPRESSION_TYPES}
                onChange={(v) => setBundleExpr(v as ExpressionType)}
              />
              <p className="-mt-1 text-xs text-muted-foreground">
                The starting point for each detected prayer — change any of them on the review
                screen.
              </p>
              <div>
                <Label htmlFor="dnotes">Notes from the source (optional)</Label>
                <Textarea
                  id="dnotes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Promises, when to pray it, printed instructions…"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="raw">Devotion text</Label>
                <Textarea
                  id="raw"
                  value={raw}
                  onChange={(e) => setRaw(e.target.value)}
                  rows={12}
                  placeholder={
                    "Apostles' Creed\nI believe in God…\n\nOur Father\nOur Father, who art in heaven…"
                  }
                  className="mt-1"
                />
                <p className="mt-2 text-xs text-muted-foreground">
                  Each block with a short first line becomes its own prayer, bundled in order.
                </p>
              </div>
              <Button className="h-12 w-full" onClick={analyzeBundle}>
                Review prayers
              </Button>
            </div>
          )}
        </div>
      )}
    </AppShell>
  );
}
