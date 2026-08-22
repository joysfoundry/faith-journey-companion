import { useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DevotionItemsEditor, ordinal } from "@/components/prayer/DevotionItemsEditor";
import { useApp } from "@/lib/prayer/store";
import { allMysteryBodies, generatePrayerSession, newId } from "@/lib/prayer/compiler";
import {
  buildRecurrence,
  FREQ_OPTIONS,
  FREQ_UNIT_LABEL,
  recurrenceFields,
  type EndMode,
} from "@/lib/prayer/recurrence";
import type {
  Frequency,
  HowTo,
  MysteryPresentation,
  PrayerHour,
  PrayerMedia,
  PrayerTemplate,
  TemplateItem,
} from "@/lib/prayer/types";

const HOUR_LABEL: Record<PrayerHour, string> = {
  office_of_readings: "Office of Readings",
  lauds: "Morning Prayer (Lauds)",
  daytime: "Daytime Prayer",
  vespers: "Evening Prayer (Vespers)",
  compline: "Night Prayer (Compline)",
};

export const Route = createFileRoute("/template/$templateId")({
  head: () => ({
    meta: [
      { title: "Devotion Builder — Faith Journey" },
      {
        name: "description",
        content: "Build a devotion: add prayers, salutations, Scripture, mysteries, and more.",
      },
      { property: "og:title", content: "Devotion Builder — Faith Journey" },
      {
        property: "og:description",
        content: "Devotions expand into full prayer sessions when you begin praying.",
      },
    ],
  }),
  component: TemplateGate,
});

function TemplateGate() {
  const { ready } = useApp();
  if (!ready)
    return (
      <AppShell title="Devotion" back={{ to: "/prayers", label: "Prayers" }}>
        <p className="text-sm text-muted-foreground">Loading…</p>
      </AppShell>
    );
  return <TemplateBuilder />;
}

/** Turn the template into a simple numbered How-To guide saved alongside it. */
function buildHowToSteps(items: TemplateItem[], prayerTitle: (id?: string) => string): string[] {
  return items.map((it) => {
    const times = it.repetition_count > 1 ? ` (×${it.repetition_count})` : "";
    switch (it.kind) {
      case "prayer":
        return `${prayerTitle(it.prayer_id)}${times}`;
      case "salutation":
        return `${it.label ?? "Salutation"}${times}`;
      case "scripture":
        return `Scripture — ${it.reference ?? "passage"}`;
      case "mystery_placeholder":
        return `Announce the ${ordinal(it.mystery_ordinal ?? 1)} mystery, then pray the decade`;
      case "intention":
        return it.label ?? "Offer your intention";
      case "petition":
        return it.label ?? "Offer the petition";
      case "meditation":
        return it.label ?? "Meditate";
      case "external_link":
        return it.label ?? "Open the linked prayer";
      case "heading":
        return `— ${it.label ?? "Section"} —`;
      default:
        return it.label ?? "Component";
    }
  });
}

function TemplateBuilder() {
  const { templateId } = Route.useParams();
  const { db, saveTemplate, deleteTemplate, saveHowTo, upsertSource } = useApp();
  const navigate = useNavigate();
  const isNew = templateId === "new";
  const existing = db.templates.find((t) => t.id === templateId);
  const existingSource = existing?.source_id
    ? db.sources.find((s) => s.id === existing.source_id)
    : undefined;

  const fallbackId = useMemo(() => newId("tpl"), []);
  const id = existing?.id ?? fallbackId;

  const [name, setName] = useState(existing?.name ?? "");
  const [description, setDescription] = useState(existing?.description ?? "");
  const [notes, setNotes] = useState(existing?.notes ?? "");
  const [presentation, setPresentation] = useState<MysteryPresentation>(
    existing?.mystery_presentation ?? "title_and_description",
  );
  const [fixedSetId, setFixedSetId] = useState(existing?.fixed_mystery_set_id ?? "");
  const [bodyKey, setBodyKey] = useState(existing?.default_mystery_body ?? "");
  const [media, setMedia] = useState<PrayerMedia[]>(existing?.media ?? []);
  const [sourceName, setSourceName] = useState(existingSource?.name ?? "");
  const [sourceUrl, setSourceUrl] = useState(existingSource?.url ?? "");
  // Default schedule this devotion suggests (calendar-style recurrence + hour).
  const initialRec = recurrenceFields(existing?.default_recurrence);
  const [freq, setFreq] = useState<Frequency>(initialRec.freq);
  const [interval, setIntervalVal] = useState(initialRec.interval);
  const [endMode, setEndMode] = useState<EndMode>(initialRec.endMode);
  const [count, setCount] = useState(initialRec.count);
  const [untilVal, setUntilVal] = useState(initialRec.until);
  const [hour, setHour] = useState<PrayerHour | "">(existing?.default_hour ?? "");
  const [startTime, setStartTime] = useState(existing?.default_start_time ?? "");
  const [items, setItems] = useState<TemplateItem[]>(() =>
    db.template_items
      .filter((i) => i.template_id === templateId)
      .sort((a, b) => a.position - b.position)
      .map((i) => ({ ...i })),
  );

  const [reviewing, setReviewing] = useState(false);

  const mysteryCount = items.filter((i) => i.kind === "mystery_placeholder").length;

  const prayerTitle = (pid?: string) => db.prayers.find((p) => p.id === pid)?.title ?? "Prayer";

  const buildTemplate = (sourceIdOverride?: string): PrayerTemplate => {
    const sourceId = sourceIdOverride ?? existing?.source_id;
    return {
      id,
      name: name.trim(),
      kind: existing?.kind ?? (mysteryCount > 0 ? "rosary" : "standard"),
      mystery_presentation: presentation,
      mystery_count: mysteryCount,
      built_in: false,
      created_at: existing?.created_at ?? new Date().toISOString(),
      ...(description.trim() ? { description: description.trim() } : {}),
      ...(notes.trim() ? { notes: notes.trim() } : {}),
      ...(fixedSetId ? { fixed_mystery_set_id: fixedSetId } : {}),
      ...(bodyKey ? { default_mystery_body: bodyKey } : {}),
      ...(media.length ? { media } : {}),
      ...(freq !== "none"
        ? {
            default_recurrence: buildRecurrence({
              freq,
              interval,
              endMode,
              count,
              until: untilVal,
            }),
          }
        : {}),
      ...(hour ? { default_hour: hour } : {}),
      ...(startTime ? { default_start_time: startTime } : {}),
      ...(sourceId ? { source_id: sourceId } : {}),
    };
  };

  const save = () => {
    if (!name.trim()) {
      toast.error("Give the devotion a name.");
      return;
    }
    // Persist the source (name + optional URL) and link it to the template.
    let sourceId = existing?.source_id;
    if (sourceName.trim() || sourceUrl.trim()) {
      sourceId = sourceId ?? `src-${id}`;
      upsertSource({
        id: sourceId,
        source_type: sourceUrl.trim() ? "web" : "manual",
        name: sourceName.trim() || name.trim(),
        created_at: existingSource?.created_at ?? new Date().toISOString(),
        ...(sourceUrl.trim() ? { url: sourceUrl.trim() } : {}),
        ...(existingSource?.attribution ? { attribution: existingSource.attribution } : {}),
      });
    }

    const template = buildTemplate(sourceId);
    const orderedItems = items.map((it, index) => ({ ...it, template_id: id, position: index }));
    saveTemplate(template, orderedItems);

    // A How-To guide (numbered list) is created/updated from the template.
    const steps = buildHowToSteps(orderedItems, prayerTitle);
    const howToId = `howto-${id}`;
    const howTo: HowTo = {
      id: howToId,
      title: `How to pray ${name.trim()}`,
      summary:
        "Auto-generated from the devotion. These are instructions — starting prayer expands them into the full text.",
      template_id: id,
      steps: steps.map((text, i) => ({
        id: `${howToId}-s${i}`,
        how_to_id: howToId,
        position: i,
        text,
      })),
      ...(existing?.source_id ? { source_id: existing.source_id } : {}),
    };
    saveHowTo(howTo);

    toast.success("You can now use this devotion to build your prayer sessions.");
    navigate({ to: "/prayers" });
  };

  /* ------------------------------ Preview ------------------------------ */
  // Same expansion the session uses: every prayer occurrence listed (Hail Mary
  // appears ten times, not "×10"), so what you preview is exactly what you pray.
  if (reviewing) {
    const previewDb = {
      ...db,
      template_items: [
        ...db.template_items.filter((i) => i.template_id !== id),
        ...items.map((it, i) => ({ ...it, template_id: id, position: i })),
      ],
    };
    const compiled = generatePrayerSession(previewDb, buildTemplate(), {}).items;
    return (
      <AppShell title="Preview devotion" back={{ to: "/prayers", label: "Prayers" }}>
        <div className="space-y-4">
          <div>
            <h2 className="font-display text-2xl">{name || "Untitled devotion"}</h2>
            {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
          </div>
          {mysteryCount > 0 ? (
            <p className="text-sm text-muted-foreground">
              Mysteries:{" "}
              {fixedSetId ? db.mystery_sets.find((s) => s.id === fixedSetId)?.name : "by day"} ·{" "}
              {presentation.replace(/_/g, " ")}
            </p>
          ) : null}
          <p className="text-xs text-muted-foreground">
            {compiled.length} steps, fully expanded — this is exactly what you&apos;ll pray.
          </p>
          <ol className="space-y-2">
            {compiled.map((it, i) => {
              const heading =
                it.kind === "mystery"
                  ? (it.configuration as { heading?: string })?.heading
                  : undefined;
              return (
                <li key={it.id} className="soft-card p-3">
                  {heading ? (
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-primary">
                      {heading}
                    </p>
                  ) : null}
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-sm font-medium">
                      {i + 1}. {it.title}
                      {it.repetition_total
                        ? ` (${it.repetition_index} of ${it.repetition_total})`
                        : ""}
                    </span>
                  </div>
                  {it.body ? (
                    <p className="prayer-text mt-1 whitespace-pre-line text-sm text-muted-foreground">
                      {it.body}
                    </p>
                  ) : null}
                </li>
              );
            })}
          </ol>
          <p className="text-xs text-muted-foreground">
            Saving also creates a summarized “How to pray” guide (e.g. “Hail Mary ×10”).
          </p>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" className="h-12" onClick={() => setReviewing(false)}>
              Back to edit
            </Button>
            <Button className="h-12" onClick={save}>
              Save devotion
            </Button>
          </div>
        </div>
      </AppShell>
    );
  }

  /* ------------------------------ Editor ------------------------------ */
  return (
    <AppShell
      title={isNew ? "New devotion" : (existing?.name ?? "Devotion")}
      subtitle="Add and order the parts — they expand into a full session when you pray."
      back={{ to: "/prayers", label: "Prayers" }}
    >
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 h-12"
          />
        </div>
        <div>
          <Label htmlFor="desc">Description</Label>
          <Input
            id="desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 h-12"
          />
        </div>
        <div>
          <Label htmlFor="notes">Notes from the source</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Promises, when to pray it, printed instructions…"
            className="mt-1"
          />
        </div>

        {/* Source of the devotion — a name and/or a URL */}
        <div className="soft-card space-y-2 p-4">
          <p className="eyebrow">Source</p>
          <div>
            <Label htmlFor="src-name" className="text-xs text-muted-foreground">
              Where it&apos;s from
            </Label>
            <Input
              id="src-name"
              value={sourceName}
              onChange={(e) => setSourceName(e.target.value)}
              placeholder="USCCB, a booklet, a parish…"
              className="mt-1 h-11"
            />
          </div>
          <div>
            <Label htmlFor="src-url" className="text-xs text-muted-foreground">
              Link (optional)
            </Label>
            <Input
              id="src-url"
              type="url"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              placeholder="https://…"
              className="mt-1 h-11"
            />
          </div>
        </div>

        {/* Default schedule — pre-fills the Session Builder when you build from this
            devotion. "Daily · ends after 9" is a novena; 54 is a 54-day rosary. */}
        <div className="soft-card space-y-3 p-4">
          <p className="eyebrow">Default schedule</p>
          <p className="-mt-1 text-xs text-muted-foreground">
            Suggested when you build a session from this devotion — you can change it there.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="freq">Repeats</Label>
              <select
                id="freq"
                value={freq}
                onChange={(e) => setFreq(e.target.value as Frequency)}
                className="mt-1 h-11 w-full rounded-md border border-input bg-card px-3"
              >
                {FREQ_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            {freq !== "none" ? (
              <div>
                <Label htmlFor="endmode">Ends</Label>
                <select
                  id="endmode"
                  value={endMode}
                  onChange={(e) => setEndMode(e.target.value as EndMode)}
                  className="mt-1 h-11 w-full rounded-md border border-input bg-card px-3"
                >
                  <option value="never">Never</option>
                  <option value="count">After N times</option>
                  <option value="until">On date</option>
                </select>
              </div>
            ) : null}
          </div>
          {freq !== "none" ? (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="interval">Every</Label>
                <div className="mt-1 flex items-center gap-2">
                  <Input
                    id="interval"
                    type="number"
                    min={1}
                    inputMode="numeric"
                    value={interval}
                    onChange={(e) => setIntervalVal(e.target.value)}
                    className="w-20 h-11"
                  />
                  <span className="text-sm text-muted-foreground">
                    {FREQ_UNIT_LABEL[freq]}
                    {Number(interval) > 1 ? "s" : ""}
                  </span>
                </div>
              </div>
              {endMode === "count" ? (
                <div>
                  <Label htmlFor="count">How many {FREQ_UNIT_LABEL[freq]}s?</Label>
                  <Input
                    id="count"
                    type="number"
                    min={1}
                    inputMode="numeric"
                    value={count}
                    placeholder="9, 54…"
                    onChange={(e) => setCount(e.target.value)}
                    className="mt-1 h-11"
                  />
                </div>
              ) : null}
              {endMode === "until" ? (
                <div>
                  <Label htmlFor="until">Until</Label>
                  <Input
                    id="until"
                    type="date"
                    value={untilVal}
                    onChange={(e) => setUntilVal(e.target.value)}
                    className="mt-1 h-11"
                  />
                </div>
              ) : null}
            </div>
          ) : null}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="hour">Hour (tag)</Label>
              <select
                id="hour"
                value={hour}
                onChange={(e) => setHour(e.target.value as PrayerHour | "")}
                className="mt-1 h-11 w-full rounded-md border border-input bg-card px-3"
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
              <Label htmlFor="start-time">Start time</Label>
              <Input
                id="start-time"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="mt-1 h-11"
              />
            </div>
          </div>
        </div>

        {/* Template-level audio */}
        <TemplateAudio media={media} onChange={setMedia} />

        {/* Mysteries — only when the devotion has mystery placeholders */}
        {mysteryCount > 0 ? (
          <div className="soft-card space-y-3 p-4">
            <p className="eyebrow">Mysteries</p>
            <div>
              <Label htmlFor="mset" className="text-xs text-muted-foreground">
                Which mysteries
              </Label>
              <select
                id="mset"
                value={fixedSetId}
                onChange={(e) => setFixedSetId(e.target.value)}
                className="mt-1 h-11 w-full rounded-md border border-input bg-card px-3 text-sm"
              >
                <option value="">By the day (today’s mysteries)</option>
                {db.mystery_sets.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-muted-foreground">
                Pin a set (e.g. Luminous for a Scriptural Rosary) or let it follow the day.
              </p>
            </div>
            <div>
              <Label htmlFor="pres" className="text-xs text-muted-foreground">
                Presentation
              </Label>
              <select
                id="pres"
                value={presentation}
                onChange={(e) => setPresentation(e.target.value as MysteryPresentation)}
                className="mt-1 h-11 w-full rounded-md border border-input bg-card px-3 text-sm"
              >
                <option value="title_only">Title only</option>
                <option value="title_and_description">Title and description</option>
                <option value="choose_during_session">Choose during session</option>
              </select>
            </div>
            <div>
              <Label htmlFor="mbody" className="text-xs text-muted-foreground">
                Which version
              </Label>
              <select
                id="mbody"
                value={bodyKey}
                onChange={(e) => setBodyKey(e.target.value)}
                className="mt-1 h-11 w-full rounded-md border border-input bg-card px-3 text-sm"
              >
                {allMysteryBodies(db).map((b) => (
                  <option key={b.key} value={b.key}>
                    {b.label}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-muted-foreground">
                Which body of each mystery to pray — Scripture, a meditation, or the reflection.
              </p>
            </div>
          </div>
        ) : null}

        {/* Items */}
        <DevotionItemsEditor items={items} onChange={setItems} templateId={id} />

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" className="h-12" onClick={() => navigate({ to: "/prayers" })}>
            Cancel
          </Button>
          <Button
            className="h-12"
            onClick={() => {
              if (!name.trim()) {
                toast.error("Give the devotion a name.");
                return;
              }
              setReviewing(true);
            }}
          >
            Review &amp; save
          </Button>
        </div>
        {existing && !existing.built_in ? (
          <Button
            variant="ghost"
            className="w-full text-destructive"
            onClick={() => {
              deleteTemplate(existing.id);
              toast.success("Devotion deleted");
              navigate({ to: "/prayers" });
            }}
          >
            Delete devotion
          </Button>
        ) : null}
      </div>
    </AppShell>
  );
}

function TemplateAudio({
  media,
  onChange,
}: {
  media: PrayerMedia[];
  onChange: (next: PrayerMedia[]) => void;
}) {
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");
  const audio = media.filter((m) => m.kind === "audio");

  const addLink = () => {
    if (!/^https?:\/\//i.test(url.trim())) return;
    onChange([
      ...media,
      {
        id: newId("media"),
        kind: "audio",
        source: "link",
        url: url.trim(),
        label: label.trim() || undefined,
        created_at: new Date().toISOString(),
      },
    ]);
    setLabel("");
    setUrl("");
  };

  return (
    <div className="soft-card space-y-2 p-4">
      <p className="eyebrow">Audio of this devotion</p>
      {audio.length ? (
        <ul className="space-y-2">
          {audio.map((m) => (
            <li key={m.id} className="rounded-lg border border-border/70 p-2">
              <div className="flex items-center justify-between gap-2">
                <span className="min-w-0 truncate text-sm">{m.label ?? m.url}</span>
                <button
                  type="button"
                  onClick={() => onChange(media.filter((x) => x.id !== m.id))}
                  className="text-muted-foreground"
                  aria-label="Remove audio"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
              <audio controls src={m.url} className="mt-1 w-full" />
            </li>
          ))}
        </ul>
      ) : null}
      <div className="flex gap-2">
        <Input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Label"
          className="h-10 w-1/3"
        />
        <Input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://… audio link"
          className="h-10 flex-1"
        />
        <Button
          type="button"
          variant="secondary"
          className="h-10"
          onClick={addLink}
          disabled={!url.trim()}
        >
          Add
        </Button>
      </div>
      <Button
        type="button"
        variant="secondary"
        className="h-10 w-full"
        disabled
        title="Audio uploads land with cloud storage"
      >
        Upload audio (coming soon)
      </Button>
    </div>
  );
}
