import { Fragment, useMemo, useState } from "react";
import { GripVertical, Minus, Plus, Search, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useApp, variantsOf } from "@/lib/prayer/store";
import { newId } from "@/lib/prayer/compiler";
import type { ExternalLinkMediaKind, Prayer, TemplateItem } from "@/lib/prayer/types";

export const KIND_LABELS: Record<TemplateItem["kind"], string> = {
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

export function ordinal(n: number): string {
  return (
    ["first", "second", "third", "fourth", "fifth", "sixth", "seventh", "eighth", "ninth", "tenth"][
      n - 1
    ] ?? `${n}th`
  );
}

function ordinalCap(n: number): string {
  const w = ordinal(n);
  return w.charAt(0).toUpperCase() + w.slice(1);
}

/**
 * The ordered item-editing surface shared by the devotion (template) builder and
 * the session builder. Fully controlled: it renders `items` and emits the next
 * list through `onChange` on every edit (positions renumbered).
 *
 * When `templateOriginIds` is provided (session builder), items whose id is NOT
 * in that set are "session add-ons" and get a distinct accent border/shade, so
 * it's clear what came from the template vs. what was added for this session.
 */
export function DevotionItemsEditor({
  items,
  onChange,
  templateId,
  templateOriginIds,
}: {
  items: TemplateItem[];
  onChange: (next: TemplateItem[]) => void;
  templateId: string;
  templateOriginIds?: Set<string> | undefined;
}) {
  const { db } = useApp();

  const [menuIndex, setMenuIndex] = useState<number | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerIndex, setPickerIndex] = useState<number>(0);
  const [pickerQuery, setPickerQuery] = useState("");
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  const renumber = (list: TemplateItem[]) => list.map((it, i) => ({ ...it, position: i }));

  const update = (index: number, patch: Partial<TemplateItem>) =>
    onChange(items.map((it, i) => (i === index ? { ...it, ...patch } : it)));

  const removeAt = (index: number) => onChange(renumber(items.filter((_, i) => i !== index)));

  const reorder = (from: number, to: number) => {
    if (from === to || from < 0 || to < 0 || from >= items.length || to >= items.length) return;
    const next = [...items];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved!);
    onChange(renumber(next));
  };

  const insertItem = (
    partial: Partial<TemplateItem> & { kind: TemplateItem["kind"] },
    index: number,
  ) => {
    const at = Math.max(0, Math.min(index, items.length));
    const item = {
      id: newId("titem"),
      template_id: templateId,
      position: at,
      repetition_count: 1,
      optional: false,
      ...partial,
    } as TemplateItem;
    onChange(renumber([...items.slice(0, at), item, ...items.slice(at)]));
  };

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
      mystery_placeholder: {
        mystery_ordinal: mysteryCount + 1,
        label: `Decade ${mysteryCount + 1}`,
      },
      external_link: {
        label: "External link",
        external_options: [{ label: "Source", url: "https://", is_default: true }],
      },
      heading: { label: "Section" },
      custom: { label: "Component", body: "" },
    };
    insertItem({ kind, ...(defaults[kind] ?? {}) }, index);
  };

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

  /** Hover-revealed "+" between items; click turns the gap into a type dropdown. */
  const insertPoint = (index: number, always = false) => {
    if (menuIndex === index) {
      return (
        <div className="flex items-center gap-2 rounded-md border border-primary/40 bg-card px-2 py-1.5">
          <Plus className="size-4 shrink-0 text-primary" />
          <select
            autoFocus
            defaultValue=""
            aria-label="Type of item to add"
            onChange={(e) =>
              e.target.value && chooseType(e.target.value as TemplateItem["kind"], index)
            }
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
          <button
            type="button"
            onClick={() => setMenuIndex(null)}
            aria-label="Cancel"
            className="text-muted-foreground"
          >
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

  return (
    <div>
      <div className="space-y-1">
        {items.map((item, index) => {
          const prayer = db.prayers.find((p) => p.id === item.prayer_id);
          const versions = prayer ? versionsOf(prayer) : [];
          const isAddon = templateOriginIds ? !templateOriginIds.has(item.id) : false;
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
                className={`soft-card border-l-4 p-3 transition ${
                  isAddon ? "border-l-primary bg-primary/5" : "border-l-border"
                } ${dragIndex === index ? "opacity-50" : ""} ${
                  overIndex === index && dragIndex !== null && dragIndex !== index
                    ? "ring-2 ring-primary"
                    : ""
                }`}
              >
                <div className="flex items-start gap-2">
                  <span
                    className="mt-1 cursor-grab touch-none text-muted-foreground active:cursor-grabbing"
                    aria-hidden
                  >
                    <GripVertical className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-muted-foreground">
                      {KIND_LABELS[item.kind]}
                      {isAddon ? (
                        <span className="rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-medium normal-case tracking-normal text-primary">
                          Added this session
                        </span>
                      ) : null}
                    </p>
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

                    {item.kind === "intention" ||
                    item.kind === "petition" ||
                    item.kind === "meditation" ? (
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
                        onClick={() =>
                          update(index, {
                            repetition_count: Math.max(1, item.repetition_count - 1),
                          })
                        }
                      >
                        <Minus className="size-4" />
                      </Button>
                      <span className="w-8 text-center tabular-nums text-sm">
                        ×{item.repetition_count}
                      </span>
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label="More repetitions"
                        onClick={() =>
                          update(index, { repetition_count: item.repetition_count + 1 })
                        }
                      >
                        <Plus className="size-4" />
                      </Button>
                    </div>
                  ) : null}

                  <button
                    type="button"
                    aria-label="Remove item"
                    onClick={() => removeAt(index)}
                    className="-mr-1 mt-0.5 shrink-0 p-1 text-muted-foreground hover:text-destructive"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              </div>
            </Fragment>
          );
        })}
        {insertPoint(items.length, true)}
      </div>

      {pickerOpen ? (
        <div className="soft-card mt-2 p-2">
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
              <li className="px-3 py-4 text-center text-sm text-muted-foreground">
                No prayers match.
              </li>
            ) : null}
          </ul>
        </div>
      ) : null}
    </div>
  );
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
            onChange={(e) =>
              setOptions(options.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)))
            }
            className="h-9 flex-1 text-sm"
          />
          <select
            value={o.media_kind ?? "web"}
            onChange={(e) =>
              setOptions(
                options.map((x, j) =>
                  j === i ? { ...x, media_kind: e.target.value as ExternalLinkMediaKind } : x,
                ),
              )
            }
            aria-label="Source type"
            title="Web opens out; audio/video can be a listen source"
            className="h-9 rounded-md border border-input bg-card px-2 text-sm"
          >
            <option value="web">Web</option>
            <option value="audio">Audio</option>
            <option value="video">Video</option>
          </select>
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
        onClick={() =>
          setOptions([
            ...options,
            { label: "Source", url: "https://", is_default: options.length === 0 },
          ])
        }
      >
        <Plus className="size-4" /> Add source
      </Button>
    </div>
  );
}
