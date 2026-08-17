import { useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowDown, ArrowUp, Minus, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useApp } from "@/lib/prayer/store";
import { newId } from "@/lib/prayer/compiler";
import type { MysteryPresentation, PrayerTemplate, TemplateItem } from "@/lib/prayer/types";

export const Route = createFileRoute("/template/$templateId")({
  head: () => ({
    meta: [
      { title: "Template Builder — Prayer Companion" },
      {
        name: "description",
        content:
          "Build a reusable prayer template: add prayers, set repetition counts, and place mystery placeholders.",
      },
      { property: "og:title", content: "Template Builder — Prayer Companion" },
      {
        property: "og:description",
        content: "Compact templates expand into full prayer sessions when you begin praying.",
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

  const save = () => {
    if (!name.trim()) {
      toast.error("Give the template a name.");
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
      ...(existing?.novena ?? baseTemplate?.novena
        ? { novena: existing?.novena ?? baseTemplate?.novena }
        : {}),
      ...(existing?.source_id ? { source_id: existing.source_id } : {}),
    };
    saveTemplate(
      template,
      items.map((it, index) => ({ ...it, template_id: id, position: index })),
    );
    toast.success("Template saved");
    navigate({ to: "/library" });
  };

  return (
    <AppShell
      title={isNew ? "New template" : (existing?.name ?? "Template")}
      subtitle="Repetition counts stay compact here and expand during prayer."
      back={{ to: "/library", label: "Library" }}
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
              <option value="">Blank template</option>
              {db.templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-muted-foreground">
              Copies that template's prayers, repetitions, and mystery placeholders so you can edit
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
              <li key={item.id} className="soft-card p-3">
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <p className="font-medium">
                      {item.kind === "mystery_placeholder"
                        ? `Mystery placeholder ${item.mystery_ordinal ?? index + 1}`
                        : item.kind === "intention"
                          ? (item.label ?? "Intention")
                          : (prayer?.title ?? "Prayer")}
                    </p>
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
            {db.prayers.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  className="w-full px-4 py-3 text-left"
                  onClick={() => {
                    addItem({ kind: "prayer", prayer_id: p.id });
                    setPickerOpen(false);
                  }}
                >
                  {p.title}
                </button>
              </li>
            ))}
          </ul>
        ) : null}

        <Button className="h-12 w-full" onClick={save}>
          Save template
        </Button>
        {existing && !existing.built_in ? (
          <Button
            variant="ghost"
            className="w-full text-destructive"
            onClick={() => {
              deleteTemplate(existing.id);
              toast.success("Template deleted");
              navigate({ to: "/library" });
            }}
          >
            Delete template
          </Button>
        ) : null}
      </div>
    </AppShell>
  );
}
