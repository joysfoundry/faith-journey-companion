import { Fragment, useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { GripVertical, Minus, Plus, Search, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useApp, variantsOf } from "@/lib/prayer/store";
import { generatePrayerSession, newId } from "@/lib/prayer/compiler";
import type {
  HowTo,
  MysteryPresentation,
  Prayer,
  PrayerMedia,
  PrayerTemplate,
  TemplateItem,
} from "@/lib/prayer/types";

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

const KIND_LABELS: Record<TemplateItem["kind"], string> = {
  prayer: "Prayer",
  salutation: "Salutation",
  mystery_placeholder: "Mystery",
  intention: "Intention",
  petition: "Petition",
  meditation: "Meditation",
  external_link: "External link",
  scripture: "Scripture",
  custom: "Other",
  heading: "Section",
};

/** JIRA-style "add and type" menu. Order matches how a devotion usually reads. */
const ADD_TYPES: { kind: TemplateItem["kind"]; label: string }[] = [
  { kind: "prayer", label: "Prayer" },
  { kind: "salutation", label: "Salutation" },
  { kind: "scripture", label: "Scripture" },
  { kind: "intention", label: "Intention" },
  { kind: "petition", label: "Petition" },
  { kind: "meditation", label: "Meditation" },
  { kind: "mystery_placeholder", label: "Mystery" },
  { kind: "external_link", label: "External link" },
  { kind: "heading", label: "Section" },
  { kind: "custom", label: "Other" },
];

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

function ordinal(n: number): string {
  return (
    ["first", "second", "third", "fourth", "fifth", "sixth", "seventh", "eighth", "ninth", "tenth"][
      n - 1
    ] ?? `${n}th`
  );
}

function TemplateBuilder() {
  const { templateId } = Route.useParams();
  const { db, saveTemplate, deleteTemplate, saveHowTo, upsertSource } = useApp();
  const navigate = useNavigate();
  const isNew = templateId === "new";
  const existing = db.templates.find((t) => t.id === templateId);
  const existingSource = existing?.source_id ? db.sources.find((s) => s.id === existing.source_id) : undefined;

  const fallbackId = useMemo(() => newId("tpl"), []);
  const id = existing?.id ?? fallbackId;

  const [name, setName] = useState(existing?.name ?? "");
  const [description, setDescription] = useState(existing?.description ?? "");
  const [notes, setNotes] = useState(existing?.notes ?? "");
  const [presentation, setPresentation] = useState<MysteryPresentation>(
    existing?.mystery_presentation ?? "title_and_description",
  );
  const [fixedSetId, setFixedSetId] = useState(existing?.fixed_mystery_set_id ?? "");
  const [media, setMedia] = useState<PrayerMedia[]>(existing?.media ?? []);
  const [sourceName, setSourceName] = useState(existingSource?.name ?? "");
  const [sourceUrl, setSourceUrl] = useState(existingSource?.url ?? "");
  const [items, setItems] = useState<TemplateItem[]>(() =>
    db.template_items
      .filter((i) => i.template_id === templateId)
      .sort((a, b) => a.position - b.position)
      .map((i) => ({ ...i })),
  );

  const [menuIndex, setMenuIndex] = useState<number | null>(null); // which insert point's type menu is open
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerIndex, setPickerIndex] = useState<number>(0); // where a picked prayer will be inserted
  const [pickerQuery, setPickerQuery] = useState("");
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const [reviewing, setReviewing] = useState(false);

  const update = (index: number, patch: Partial<TemplateItem>) =>
    setItems((list) => list.map((it, i) => (i === index ? { ...it, ...patch } : it)));

  const reorder = (from: number, to: number) =>
    setItems((list) => {
      if (from === to || from < 0 || to < 0 || from >= list.length || to >= list.length) return list;
      const next = [...list];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved!);
      return next.map((it, i) => ({ ...it, position: i }));
    });

  /** Insert an item at `index` (clamped), renumbering positions. */
  const insertItem = (partial: Partial<TemplateItem> & { kind: TemplateItem["kind"] }, index: number) =>
    setItems((list) => {
      const at = Math.max(0, Math.min(index, list.length));
      const item = {
        id: newId("titem"),
        template_id: id,
        position: at,
        repetition_count: 1,
        optional: false,
        ...partial,
      } as TemplateItem;
      const next = [...list.slice(0, at), item, ...list.slice(at)];
      return next.map((it, i) => ({ ...it, position: i }));
    });

  /** Choose a type from an insert-point menu; Prayer opens the searchable picker. */
  const chooseType = (kind: TemplateItem["kind"], index: number) => {
    setMenuIndex(null);
    if (kind === "prayer") {
      setPickerIndex(index);
      setPickerQuery("");
      setPickerOpen(true);
      return;
    }
    const mysteryCount = items.filter((i) => i.kind === "mystery_placeholder").length;
    const defaults: Record<string, Partial<TemplateItem>> = {
      salutation: { label: "Salutation", salutation_vr: true, versicle: "", response: "" },
      scripture: { reference: "", body: "" },
      intention: { label: "Intention", body: "" },
      petition: { label: "Petition", body: "" },
      meditation: { label: "Meditation", body: "" },
      mystery_placeholder: { mystery_ordinal: mysteryCount + 1, label: `Decade ${mysteryCount + 1}` },
      external_link: {
        label: "External link",
        external_options: [{ label: "Source", url: "https://", is_default: true }],
      },
      heading: { label: "Section" },
      custom: { label: "Component", body: "" },
    };
    insertItem({ kind, ...(defaults[kind] ?? {}) }, index);
  };

  const mysteryCount = items.filter((i) => i.kind === "mystery_placeholder").length;

  const versionsOf = (prayer: Prayer) => {
    const siblings = variantsOf(db, prayer);
    if (siblings.length < 2) return [];
    return siblings.map((sibling) => ({
      prayer: sibling,
      label: sibling.variant_label ?? (sibling.is_default_variant ? "Default" : "Alternate"),
    }));
  };

  const pickerGroups = useMemo(() => {
    const seen = new Set<string>();
    const groups: Array<{ primary: Prayer; versions: ReturnType<typeof versionsOf> }> = [];
    for (const prayer of db.prayers) {
      const group = prayer.variant_group_id ?? prayer.id;
      if (seen.has(group)) continue;
      seen.add(group);
      const siblings = variantsOf(db, prayer);
      const primary = siblings.find((s) => s.is_default_variant) ?? siblings[0] ?? prayer;
      groups.push({ primary, versions: versionsOf(primary) });
    }
    return groups;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db.prayers, db.prayer_versions]);

  const filteredGroups = useMemo(() => {
    const q = pickerQuery.trim().toLowerCase();
    if (!q) return pickerGroups;
    return pickerGroups.filter(
      (g) =>
        g.primary.title.toLowerCase().includes(q) ||
        (g.primary.tags ?? []).some((t) => t.includes(q)),
    );
  }, [pickerGroups, pickerQuery]);

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
      ...(media.length ? { media } : {}),
      ...(existing?.novena ? { novena: existing.novena } : {}),
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
      steps: steps.map((text, i) => ({ id: `${howToId}-s${i}`, how_to_id: howToId, position: i, text })),
      ...(existing?.source_id ? { source_id: existing.source_id } : {}),
    };
    saveHowTo(howTo);

    toast.success("Devotion saved · How-To guide created");
    navigate({ to: "/prayers" });
  };

  /**
   * A hover-revealed "+" between items (JIRA-style). Clicking it turns the gap
   * into a compact type dropdown that inserts at this index. `always` keeps it
   * visible (empty list / the trailing add).
   */
  const insertPoint = (index: number, always = false) => {
    if (menuIndex === index) {
      return (
        <div className="flex items-center gap-2 rounded-md border border-primary/40 bg-card px-2 py-1.5">
          <Plus className="size-4 shrink-0 text-primary" />
          <select
            autoFocus
            defaultValue=""
            aria-label="Type of item to add"
            onChange={(e) => e.target.value && chooseType(e.target.value as TemplateItem["kind"], index)}
            className="h-8 flex-1 rounded border border-input bg-card px-2 text-sm"
          >
            <option value="" disabled>
              Choose a type…
            </option>
            {ADD_TYPES.map((t) => (
              <option key={t.kind} value={t.kind}>
                {t.label}
              </option>
            ))}
          </select>
          <button type="button" onClick={() => setMenuIndex(null)} aria-label="Cancel" className="text-muted-foreground">
            <X className="size-4" />
          </button>
        </div>
      );
    }
    return (
      <div className="group flex h-6 items-center">
        <button
          type="button"
          onClick={() => setMenuIndex(index)}
          aria-label="Add item here"
          className={`flex w-full items-center gap-1.5 text-xs text-muted-foreground transition ${
            always ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}
        >
          <span className="flex size-5 shrink-0 items-center justify-center rounded-full border border-border bg-card hover:border-primary hover:text-primary">
            <Plus className="size-3" />
          </span>
          <span className="h-px flex-1 bg-border/70" />
        </button>
      </div>
    );
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
              Mysteries: {fixedSetId ? db.mystery_sets.find((s) => s.id === fixedSetId)?.name : "by day"} ·{" "}
              {presentation.replace(/_/g, " ")}
            </p>
          ) : null}
          <p className="text-xs text-muted-foreground">
            {compiled.length} steps, fully expanded — this is exactly what you&apos;ll pray.
          </p>
          <ol className="space-y-2">
            {compiled.map((it, i) => (
              <li key={it.id} className="soft-card p-3">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-sm font-medium">
                    {i + 1}. {it.title}
                    {it.repetition_total ? ` (${it.repetition_index} of ${it.repetition_total})` : ""}
                  </span>
                  {it.kind === "mystery" ? (
                    <span className="text-[11px] uppercase tracking-wide text-muted-foreground">Mystery</span>
                  ) : null}
                </div>
                {it.body ? (
                  <p className="prayer-text mt-1 whitespace-pre-line text-sm text-muted-foreground">{it.body}</p>
                ) : null}
              </li>
            ))}
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
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 h-12" />
        </div>
        <div>
          <Label htmlFor="desc">Description</Label>
          <Input id="desc" value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 h-12" />
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
            <Label htmlFor="src-name" className="text-xs text-muted-foreground">Where it&apos;s from</Label>
            <Input
              id="src-name"
              value={sourceName}
              onChange={(e) => setSourceName(e.target.value)}
              placeholder="USCCB, a booklet, a parish…"
              className="mt-1 h-11"
            />
          </div>
          <div>
            <Label htmlFor="src-url" className="text-xs text-muted-foreground">Link (optional)</Label>
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

        {/* Template-level audio */}
        <TemplateAudio media={media} onChange={setMedia} />

        {/* Mysteries — only when the devotion has mystery placeholders */}
        {mysteryCount > 0 ? (
          <div className="soft-card space-y-3 p-4">
            <p className="eyebrow">Mysteries</p>
            <div>
              <Label htmlFor="mset" className="text-xs text-muted-foreground">Which mysteries</Label>
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
              <Label htmlFor="pres" className="text-xs text-muted-foreground">Presentation</Label>
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
          </div>
        ) : null}

        {/* Items */}
        <div className="space-y-1">
          {items.map((item, index) => {
            const prayer = db.prayers.find((p) => p.id === item.prayer_id);
            const versions = prayer ? versionsOf(prayer) : [];
            return (
              <Fragment key={item.id}>
              {insertPoint(index)}
              <div
                draggable
                onDragStart={(e) => {
                  setDragIndex(index);
                  e.dataTransfer.effectAllowed = "move";
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  if (dragIndex !== null && overIndex !== index) setOverIndex(index);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  if (dragIndex !== null) reorder(dragIndex, index);
                  setDragIndex(null);
                  setOverIndex(null);
                }}
                onDragEnd={() => {
                  setDragIndex(null);
                  setOverIndex(null);
                }}
                className={`soft-card p-3 transition ${dragIndex === index ? "opacity-50" : ""} ${
                  overIndex === index && dragIndex !== null && dragIndex !== index ? "ring-2 ring-primary" : ""
                }`}
              >
                <div className="flex items-start gap-2">
                  <span className="mt-1 cursor-grab touch-none text-muted-foreground active:cursor-grabbing" aria-hidden>
                    <GripVertical className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">{KIND_LABELS[item.kind]}</p>
                    <p className="font-medium">
                      {item.kind === "mystery_placeholder"
                        ? `${ordinalCap(item.mystery_ordinal ?? index + 1)} mystery`
                        : item.kind === "prayer"
                          ? (prayer?.title ?? "Prayer")
                          : (item.label ?? KIND_LABELS[item.kind])}
                    </p>

                    {item.kind === "prayer" && versions.length >= 2 ? (
                      <select
                        aria-label="Version used in this devotion"
                        value={prayer!.id}
                        onChange={(e) => update(index, { prayer_id: e.target.value })}
                        className="mt-1 h-9 w-full rounded-md border border-input bg-card px-2 text-xs"
                      >
                        {versions.map((v) => (
                          <option key={v.prayer.id} value={v.prayer.id}>
                            {v.label}
                            {v.prayer.is_default_variant ? " (default)" : ""}
                          </option>
                        ))}
                      </select>
                    ) : null}

                    {item.kind === "salutation" ? (
                      <SalutationEditor item={item} onChange={(patch) => update(index, patch)} />
                    ) : null}

                    {item.kind === "scripture" ? (
                      <div className="mt-2 space-y-2">
                        <Input
                          value={item.reference ?? ""}
                          placeholder="Citation (e.g. Lk 1:26-38)"
                          onChange={(e) => update(index, { reference: e.target.value })}
                          className="h-9 text-sm"
                        />
                        <Textarea
                          value={item.body ?? ""}
                          rows={3}
                          placeholder="Scripture passage"
                          onChange={(e) => update(index, { body: e.target.value })}
                          className="text-sm"
                        />
                      </div>
                    ) : null}

                    {item.kind === "intention" || item.kind === "petition" || item.kind === "meditation" ? (
                      <div className="mt-2 space-y-2">
                        <Input
                          value={item.label ?? ""}
                          placeholder={`${KIND_LABELS[item.kind]} title`}
                          onChange={(e) => update(index, { label: e.target.value })}
                          className="h-9 text-sm"
                        />
                        <Textarea
                          value={item.body ?? ""}
                          rows={2}
                          placeholder={
                            item.kind === "meditation"
                              ? "Meditation prompt (optional)"
                              : "Text (optional)"
                          }
                          onChange={(e) => update(index, { body: e.target.value })}
                          className="text-sm"
                        />
                      </div>
                    ) : null}

                    {item.kind === "external_link" ? (
                      <ExternalLinkEditor item={item} onChange={(patch) => update(index, patch)} />
                    ) : null}

                    {item.kind === "heading" ? (
                      <Input
                        value={item.label ?? ""}
                        placeholder="Section label"
                        onChange={(e) => update(index, { label: e.target.value })}
                        className="mt-2 h-9 text-sm"
                      />
                    ) : null}

                    {item.kind === "custom" ? (
                      <div className="mt-2 space-y-2">
                        <Input
                          value={item.label ?? ""}
                          placeholder="Component name"
                          onChange={(e) => update(index, { label: e.target.value })}
                          className="h-9 text-sm"
                        />
                        <Textarea
                          value={item.body ?? ""}
                          rows={3}
                          placeholder="Text prayed for this component"
                          onChange={(e) => update(index, { body: e.target.value })}
                          className="text-sm"
                        />
                      </div>
                    ) : null}
                  </div>

                  {item.kind === "prayer" || item.kind === "salutation" ? (
                    <div className="flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label="Fewer repetitions"
                        onClick={() => update(index, { repetition_count: Math.max(1, item.repetition_count - 1) })}
                      >
                        <Minus className="size-4" />
                      </Button>
                      <span className="w-8 text-center tabular-nums text-sm">×{item.repetition_count}</span>
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label="More repetitions"
                        onClick={() => update(index, { repetition_count: item.repetition_count + 1 })}
                      >
                        <Plus className="size-4" />
                      </Button>
                    </div>
                  ) : null}
                </div>

                <div className="mt-2 flex items-center justify-between">
                  <label className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Switch checked={item.optional} onCheckedChange={(v) => update(index, { optional: v })} />
                    Optional
                  </label>
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label="Remove item"
                    onClick={() => setItems((l) => l.filter((_, i) => i !== index))}
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              </div>
              </Fragment>
            );
          })}
          {/* Trailing add — always visible; hover reveals the "+" between items above. */}
          {insertPoint(items.length, true)}
        </div>

        {/* Prayer search picker */}
        {pickerOpen ? (
          <div className="soft-card p-2">
            <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                autoFocus
                value={pickerQuery}
                onChange={(e) => setPickerQuery(e.target.value)}
                placeholder="Search prayers"
                className="h-11 pl-9"
              />
            </div>
            <ul className="max-h-72 divide-y divide-border overflow-auto">
              {filteredGroups.map(({ primary, versions }) => (
                <li key={primary.id} className="p-1">
                  {versions.length < 2 ? (
                    <button
                      type="button"
                      className="w-full px-3 py-2 text-left text-sm"
                      onClick={() => {
                        insertItem({ kind: "prayer", prayer_id: primary.id }, pickerIndex);
                        setPickerOpen(false);
                        setPickerQuery("");
                      }}
                    >
                      {primary.title}
                    </button>
                  ) : (
                    <div className="px-3 py-2">
                      <p className="text-sm font-medium">{primary.title}</p>
                      <ul className="mt-1 space-y-1">
                        {versions.map((v) => (
                          <li key={v.prayer.id}>
                            <button
                              type="button"
                              className="w-full rounded-md border border-input px-2 py-2 text-left text-xs"
                              onClick={() => {
                                insertItem({ kind: "prayer", prayer_id: v.prayer.id }, pickerIndex);
                                setPickerOpen(false);
                                setPickerQuery("");
                              }}
                            >
                              {v.label}
                              {v.prayer.is_default_variant ? " · default" : ""}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </li>
              ))}
              {filteredGroups.length === 0 ? (
                <li className="px-3 py-4 text-center text-sm text-muted-foreground">No prayers match.</li>
              ) : null}
            </ul>
          </div>
        ) : null}

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

function ordinalCap(n: number): string {
  const w = ordinal(n);
  return w.charAt(0).toUpperCase() + w.slice(1);
}

/* --------------------------- Sub-editors --------------------------- */
function SalutationEditor({
  item,
  onChange,
}: {
  item: TemplateItem;
  onChange: (patch: Partial<TemplateItem>) => void;
}) {
  const vr = item.salutation_vr ?? Boolean(item.versicle || item.response);
  return (
    <div className="mt-2 space-y-2">
      <Input
        value={item.label ?? ""}
        placeholder="Salutation name (e.g. First Salutation)"
        onChange={(e) => onChange({ label: e.target.value })}
        className="h-9 text-sm"
      />
      <div className="inline-flex rounded-md border border-border p-0.5 text-xs">
        <button
          type="button"
          onClick={() => onChange({ salutation_vr: false })}
          className={`rounded px-2 py-1 ${!vr ? "bg-secondary font-medium" : "text-muted-foreground"}`}
        >
          Text
        </button>
        <button
          type="button"
          onClick={() => onChange({ salutation_vr: true })}
          className={`rounded px-2 py-1 ${vr ? "bg-secondary font-medium" : "text-muted-foreground"}`}
        >
          V. and R.
        </button>
      </div>
      {vr ? (
        <>
          <Input
            value={item.versicle ?? ""}
            placeholder="V. versicle line"
            onChange={(e) => onChange({ versicle: e.target.value })}
            className="h-9 text-sm"
          />
          <Input
            value={item.response ?? ""}
            placeholder="R. response line (optional)"
            onChange={(e) => onChange({ response: e.target.value })}
            className="h-9 text-sm"
          />
        </>
      ) : (
        <Textarea
          value={item.body ?? ""}
          rows={2}
          placeholder="Salutation text"
          onChange={(e) => onChange({ body: e.target.value })}
          className="text-sm"
        />
      )}
    </div>
  );
}

function ExternalLinkEditor({
  item,
  onChange,
}: {
  item: TemplateItem;
  onChange: (patch: Partial<TemplateItem>) => void;
}) {
  const options = item.external_options ?? [];
  const setOptions = (next: typeof options) => onChange({ external_options: next });
  return (
    <div className="mt-2 space-y-2">
      <Input
        value={item.label ?? ""}
        placeholder="Link label (e.g. Pray with the Pope)"
        onChange={(e) => onChange({ label: e.target.value })}
        className="h-9 text-sm"
      />
      {options.map((o, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            type="radio"
            name={`default-${item.id}`}
            checked={Boolean(o.is_default)}
            onChange={() => setOptions(options.map((x, j) => ({ ...x, is_default: j === i })))}
            aria-label="Default source"
            className="size-4"
          />
          <Input
            value={o.url}
            placeholder="https://…"
            onChange={(e) => setOptions(options.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)))}
            className="h-9 flex-1 text-sm"
          />
          <button
            type="button"
            onClick={() => setOptions(options.filter((_, j) => j !== i))}
            aria-label="Remove source"
            className="text-muted-foreground"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      ))}
      <Button
        type="button"
        variant="secondary"
        className="h-9"
        onClick={() => setOptions([...options, { label: "Source", url: "https://", is_default: options.length === 0 }])}
      >
        <Plus className="size-4" /> Add source
      </Button>
    </div>
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
        <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Label" className="h-10 w-1/3" />
        <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://… audio link" className="h-10 flex-1" />
        <Button type="button" variant="secondary" className="h-10" onClick={addLink} disabled={!url.trim()}>
          Add
        </Button>
      </div>
      <Button type="button" variant="secondary" className="h-10 w-full" disabled title="Audio uploads land with cloud storage">
        Upload audio (coming soon)
      </Button>
    </div>
  );
}
