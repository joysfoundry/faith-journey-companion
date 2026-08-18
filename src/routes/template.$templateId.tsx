import { useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowDown, ArrowUp, GripVertical, Minus, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useApp, variantsOf } from "@/lib/prayer/store";
import { distinctivePhrase, lengthHint } from "@/lib/prayer/variantDiff";
import { newId } from "@/lib/prayer/compiler";
import type { MysteryPresentation, Prayer, PrayerTemplate, TemplateItem } from "@/lib/prayer/types";

export const Route = createFileRoute("/template/$templateId")({
  head: () => ({
    meta: [
      { title: "Devotion Builder — Faith Journey" },
      {
        name: "description",
        content:
          "Build a devotion: bundle traditional prayers, set repetition counts, and place mystery placeholders.",
      },
      { property: "og:title", content: "Devotion Builder — Faith Journey" },
      {
        property: "og:description",
        content: "Devotions expand into full prayer sessions when you begin praying.",
      },
    ],
  }),
  component: TemplateBuilder,
});

function TemplateBuilder() {
  const { templateId } = Route.useParams();
  const { db, saveTemplate, deleteTemplate } = useApp();
  const navigate = useNavigate();
  const isNew = templateId === "new";
  const existing = db.templates.find((t) => t.id === templateId);

  const [name, setName] = useState(existing?.name ?? "");
  const [description, setDescription] = useState(existing?.description ?? "");
  /** Notes the source gives about the devotion (promises, when to pray it, context). */
  const [notes, setNotes] = useState(existing?.notes ?? "");
  const [presentation, setPresentation] = useState<MysteryPresentation>(
    existing?.mystery_presentation ?? "title_and_description",
  );
  const [items, setItems] = useState<TemplateItem[]>(() =>
    db.template_items
      .filter((i) => i.template_id === templateId)
      .sort((a, b) => a.position - b.position)
      .map((i) => ({ ...i })),
  );
  const [pickerOpen, setPickerOpen] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const [baseId, setBaseId] = useState("");
  const [baseTemplate, setBaseTemplate] = useState<PrayerTemplate | null>(null);

  /** Prefill a brand-new template from an existing one instead of starting empty. */
  const applyBase = (sourceTemplateId: string) => {
    setBaseId(sourceTemplateId);
    if (!sourceTemplateId) {
      setBaseTemplate(null);
      setItems([]);
      return;
    }
    const source = db.templates.find((t) => t.id === sourceTemplateId);
    if (!source) return;
    setBaseTemplate(source);
    setName((current) => current || `${source.name} (copy)`);
    setDescription(source.description ?? "");
    setNotes(source.notes ?? "");
    setPresentation(source.mystery_presentation);
    setItems(
      db.template_items
        .filter((i) => i.template_id === source.id)
        .sort((a, b) => a.position - b.position)
        .map((i, index) => ({ ...i, id: newId("titem"), template_id: id, position: index })),
    );
  };

  const id = existing?.id ?? useMemo(() => newId("tpl"), []);

  const update = (index: number, patch: Partial<TemplateItem>) =>
    setItems((list) => list.map((it, i) => (i === index ? { ...it, ...patch } : it)));

  const move = (index: number, delta: number) =>
    setItems((list) => {
      const next = [...list];
      const target = index + delta;
      if (target < 0 || target >= next.length) return list;
      const a = next[index]!;
      next[index] = next[target]!;
      next[target] = a;
      return next.map((it, i) => ({ ...it, position: i }));
    });

  /** Drag-and-drop reordering; the arrow buttons remain for keyboard/touch use. */
  const reorder = (from: number, to: number) =>
    setItems((list) => {
      if (from === to || from < 0 || to < 0 || from >= list.length || to >= list.length) return list;
      const next = [...list];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved!);
      return next.map((it, i) => ({ ...it, position: i }));
    });

  const addItem = (partial: Partial<TemplateItem> & { kind: TemplateItem["kind"] }) =>
    setItems((list) => [
      ...list,
      {
        id: newId("titem"),
        template_id: id,
        position: list.length,
        repetition_count: 1,
        optional: false,
        ...partial,
      } as TemplateItem,
    ]);

  const mysteryCount = items.filter((i) => i.kind === "mystery_placeholder").length;

  /** Default wording of a prayer record — what the devotion will actually pray. */
  const bodyOf = (prayer: Prayer) =>
    db.prayer_versions.find((v) => v.id === prayer.default_version_id)?.body ?? "";

  /**
   * Every wording of a prayer plus the line that sets it apart, so choosing a
   * version in a devotion isn't guesswork.
   */
  const versionsOf = (prayer: Prayer) => {
    const siblings = variantsOf(db, prayer);
    if (siblings.length < 2) return [];
    return siblings.map((sibling) => {
      const body = bodyOf(sibling);
      const others = siblings.filter((s) => s.id !== sibling.id).map(bodyOf);
      return {
        prayer: sibling,
        label: sibling.variant_label ?? (sibling.is_default_variant ? "Default" : "Alternate"),
        difference: distinctivePhrase(body, others),
        hint: lengthHint(body, others[0] ?? body),
      };
    });
  };

  /** One row per prayer group for the picker: the default first, versions nested. */
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


  const save = () => {
    if (!name.trim()) {
      toast.error("Give the devotion a name.");
      return;
    }
    const template: PrayerTemplate = {
      id,
      name: name.trim(),
      kind: existing?.kind ?? baseTemplate?.kind ?? (mysteryCount > 0 ? "rosary" : "standard"),
      mystery_presentation: presentation,
      mystery_count: mysteryCount,
      built_in: false,
      created_at: existing?.created_at ?? new Date().toISOString(),
      ...(description.trim() ? { description: description.trim() } : {}),
      ...(notes.trim() ? { notes: notes.trim() } : {}),
      ...(existing?.novena ?? baseTemplate?.novena
        ? { novena: existing?.novena ?? baseTemplate?.novena }
        : {}),
      ...(existing?.source_id ? { source_id: existing.source_id } : {}),
    };
    saveTemplate(
      template,
      items.map((it, index) => ({ ...it, template_id: id, position: index })),
    );
    toast.success("Devotion saved");
    navigate({ to: "/prayers" });
  };

  return (
    <AppShell
      title={isNew ? "New devotion" : (existing?.name ?? "Devotion")}
      subtitle="Repetition counts stay compact here and expand during prayer."
      back={{ to: "/prayers", label: "Prayers" }}
    >
      <div className="space-y-4">
        {isNew ? (
          <div>
            <Label htmlFor="base">Start from</Label>
            <select
              id="base"
              value={baseId}
              onChange={(e) => applyBase(e.target.value)}
              className="mt-1 h-12 w-full rounded-md border border-input bg-card px-3"
            >
              <option value="">Blank devotion</option>
              {db.templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-muted-foreground">
              Copies that devotion's prayers, repetitions, and mystery placeholders so you can edit
              instead of rebuilding.
            </p>
          </div>
        ) : null}
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 h-12" />
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
            rows={4}
            placeholder="Promises, when to pray it, instructions printed with the prayers…"
            className="mt-1"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            What the booklet or web page says about this devotion itself — kept alongside the
            prayers, not prayed.
          </p>
        </div>
        <div>
          <Label htmlFor="pres">Mystery presentation</Label>
          <select
            id="pres"
            value={presentation}
            onChange={(e) => setPresentation(e.target.value as MysteryPresentation)}
            className="mt-1 h-12 w-full rounded-md border border-input bg-card px-3"
          >
            <option value="title_only">Title only</option>
            <option value="title_and_description">Title and description</option>
            <option value="choose_during_session">Choose during session</option>
          </select>
        </div>

        <ul className="space-y-2">
          {items.map((item, index) => {
            const prayer = db.prayers.find((p) => p.id === item.prayer_id);
            return (
              <li
                key={item.id}
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
                  overIndex === index && dragIndex !== null && dragIndex !== index
                    ? "ring-2 ring-primary"
                    : ""
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    aria-hidden
                    className="cursor-grab touch-none text-muted-foreground active:cursor-grabbing"
                  >
                    <GripVertical className="size-4" />
                  </span>
                  <div className="flex-1">
                    <p className="font-medium">
                      {item.kind === "mystery_placeholder"
                        ? `Mystery placeholder ${item.mystery_ordinal ?? index + 1}`
                        : item.kind === "intention"
                          ? (item.label ?? "Intention")
                          : (prayer?.title ?? "Prayer")}
                    </p>
                    {item.kind === "prayer" && prayer ? (
                      (() => {
                        const versions = versionsOf(prayer);
                        if (versions.length < 2) return null;
                        const current = versions.find((v) => v.prayer.id === prayer.id);
                        return (
                          <div className="mt-1">
                            <select
                              aria-label="Version used in this devotion"
                              value={prayer.id}
                              onChange={(e) => update(index, { prayer_id: e.target.value })}
                              className="h-9 w-full rounded-md border border-input bg-card px-2 text-xs"
                            >
                              {versions.map((v) => (
                                <option key={v.prayer.id} value={v.prayer.id}>
                                  {v.label}
                                  {v.prayer.is_default_variant ? " (default)" : ""} — {v.difference}
                                </option>
                              ))}
                            </select>
                            {current ? (
                              <p className="mt-1 text-xs text-muted-foreground">
                                Differs here: “{current.difference}”
                                {current.hint ? ` · ${current.hint}` : ""}
                              </p>
                            ) : null}
                          </div>
                        );
                      })()
                    ) : null}
                    {item.optional ? (
                      <p className="text-xs text-muted-foreground">Optional</p>
                    ) : null}
                    {item.condition_tag ? (
                      <p className="text-xs text-muted-foreground">
                        Only when: {item.condition_tag}
                      </p>
                    ) : null}
                  </div>
                  {item.kind === "prayer" ? (
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
                      <span className="w-10 text-center tabular-nums">
                        × {item.repetition_count}
                      </span>
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
                    <Switch
                      checked={item.optional}
                      onCheckedChange={(v) => update(index, { optional: v })}
                    />
                    Optional
                  </label>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" aria-label="Move up" onClick={() => move(index, -1)}>
                      <ArrowUp className="size-4" />
                    </Button>
                    <Button size="icon" variant="ghost" aria-label="Move down" onClick={() => move(index, 1)}>
                      <ArrowDown className="size-4" />
                    </Button>
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
              </li>
            );
          })}
        </ul>

        <div className="grid grid-cols-2 gap-2">
          <Button variant="secondary" onClick={() => setPickerOpen((v) => !v)}>
            <Plus className="size-4" /> Prayer
          </Button>
          <Button
            variant="secondary"
            onClick={() =>
              addItem({
                kind: "mystery_placeholder",
                mystery_ordinal: mysteryCount + 1,
                label: `Decade ${mysteryCount + 1}`,
              })
            }
          >
            <Plus className="size-4" /> Mystery
          </Button>
          <Button
            variant="secondary"
            className="col-span-2"
            onClick={() => addItem({ kind: "intention", label: "Intention" })}
          >
            <Plus className="size-4" /> Intention
          </Button>
        </div>

        {pickerOpen ? (
          <ul className="soft-card max-h-72 divide-y divide-border overflow-auto">
            {pickerGroups.map(({ primary, versions }) => (
              <li key={primary.id} className="p-1">
                {versions.length < 2 ? (
                  <button
                    type="button"
                    className="w-full px-3 py-2 text-left"
                    onClick={() => {
                      addItem({ kind: "prayer", prayer_id: primary.id });
                      setPickerOpen(false);
                    }}
                  >
                    {primary.title}
                  </button>
                ) : (
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium">{primary.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {versions.length} versions — pick the wording this devotion should pray.
                    </p>
                    <ul className="mt-1 space-y-1">
                      {versions.map((v) => (
                        <li key={v.prayer.id}>
                          <button
                            type="button"
                            className="w-full rounded-md border border-input px-2 py-2 text-left"
                            onClick={() => {
                              addItem({ kind: "prayer", prayer_id: v.prayer.id });
                              setPickerOpen(false);
                            }}
                          >
                            <span className="text-xs font-medium">
                              {v.label}
                              {v.prayer.is_default_variant ? " · default" : ""}
                            </span>
                            <span className="block text-xs text-muted-foreground">
                              “{v.difference}”{v.hint ? ` · ${v.hint}` : ""}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            ))}
          </ul>
        ) : null}

        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" className="h-12" onClick={() => navigate({ to: "/prayers" })}>
            Cancel
          </Button>
          <Button className="h-12" onClick={save}>
            Save devotion
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
            Delete template
          </Button>
        ) : null}
      </div>
    </AppShell>
  );
}
