import { useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ChevronDown, Heart, Pencil, Play, Plus, Search, Trash2, X } from "lucide-react";
import { AppShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useApp, variantGroupId } from "@/lib/prayer/store";
import type { Prayer } from "@/lib/prayer/types";
import { toast } from "sonner";
import { templateOutline } from "@/lib/prayer/compiler";

/** One prayer group: a caret expands the text; icons pray / edit; title opens details. */
function PrayerRow({
  primary,
  others,
  picking,
  selected,
  onSelect,
}: {
  primary: Prayer;
  others: Prayer[];
  picking: boolean;
  selected: Set<string>;
  onSelect: (id: string, on: boolean) => void;
}) {
  const { db, toggleFavorite, deletePrayer, startSinglePrayer } = useApp();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const body = db.prayer_versions.find((v) => v.id === primary.default_version_id)?.body ?? "";

  const prayNow = () => {
    const session = startSinglePrayer(primary.id);
    if (session) navigate({ to: "/session/$sessionId", params: { sessionId: session.id } });
  };

  return (
    <li className="soft-card">
      <div className="flex items-center">
        {picking ? (
          <span className="pl-4">
            <Checkbox
              checked={selected.has(primary.id)}
              onCheckedChange={(v) => onSelect(primary.id, Boolean(v))}
              aria-label={`Select ${primary.title}`}
            />
          </span>
        ) : (
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Hide text" : "Show text"}
            aria-expanded={open}
            className="py-4 pl-3 pr-1 text-muted-foreground"
          >
            <ChevronDown className={`size-5 transition-transform ${open ? "rotate-180" : ""}`} />
          </button>
        )}
        <Link
          to="/prayer/$prayerId"
          params={{ prayerId: primary.id }}
          className="min-w-0 flex-1 py-4 pl-1 pr-2"
        >
          <p className="truncate font-medium">{primary.title}</p>
          {others.length ? (
            <p className="text-xs text-muted-foreground">{others.length + 1} versions</p>
          ) : null}
        </Link>
        <button
          type="button"
          onClick={prayNow}
          aria-label={`Pray ${primary.title} now`}
          className="px-2.5 py-4 text-primary"
        >
          <Play className="size-5" />
        </button>
        <Link
          to="/prayer/$prayerId"
          params={{ prayerId: primary.id }}
          search={{ edit: true }}
          aria-label={`Edit ${primary.title}`}
          className="px-2.5 py-4 text-muted-foreground"
        >
          <Pencil className="size-5" />
        </Link>
        <button
          type="button"
          onClick={() => toggleFavorite(primary.id)}
          aria-label={primary.favorite ? "Remove favorite" : "Add favorite"}
          className="px-2.5 py-4 text-muted-foreground"
        >
          <Heart className={`size-5 ${primary.favorite ? "fill-primary text-primary" : ""}`} />
        </button>
        <button
          type="button"
          onClick={() => {
            if (!window.confirm(`Delete “${primary.title}”?`)) return;
            deletePrayer(primary.id);
            toast.success("Prayer deleted");
          }}
          aria-label={`Delete ${primary.title}`}
          className="px-2.5 pr-4 py-4 text-muted-foreground"
        >
          <Trash2 className="size-5" />
        </button>
      </div>

      {open ? (
        <div className="border-t border-border/60 px-5 py-3">
          <p className="prayer-text whitespace-pre-line text-sm text-muted-foreground">{body}</p>
        </div>
      ) : null}

      {others.length ? (
        <ul className="border-t border-border/60 px-4 py-2">
          {others.map((variant) => (
            <li key={variant.id} className="flex items-center">
              {picking ? (
                <span className="pr-3">
                  <Checkbox
                    checked={selected.has(variant.id)}
                    onCheckedChange={(v) => onSelect(variant.id, Boolean(v))}
                    aria-label={`Select ${variant.variant_label ?? "version"} of ${primary.title}`}
                  />
                </span>
              ) : null}
              <Link
                to="/prayer/$prayerId"
                params={{ prayerId: variant.id }}
                className="flex-1 py-2 text-sm text-muted-foreground"
              >
                {variant.variant_label ?? "Alternate wording"}
              </Link>
              <Link
                to="/prayer/$prayerId"
                params={{ prayerId: variant.id }}
                search={{ edit: true }}
                aria-label={`Edit ${variant.variant_label ?? "version"}`}
                className="py-2 pl-3 text-muted-foreground"
              >
                <Pencil className="size-4" />
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </li>
  );
}

/** Shared bulk-selection toolbar: enter select mode, select all, delete many. */
function BulkBar({
  ids,
  selected,
  setSelected,
  onDelete,
  noun,
  active,
  setActive,
}: {
  ids: string[];
  selected: Set<string>;
  setSelected: (next: Set<string>) => void;
  onDelete: (ids: string[]) => void;
  noun: string;
  active: boolean;
  setActive: (next: boolean) => void;
}) {
  if (!ids.length) return null;

  if (!active)
    return (
      <button
        type="button"
        onClick={() => setActive(true)}
        className="ml-auto block text-sm text-primary underline"
      >
        Select
      </button>
    );

  const allSelected = selected.size === ids.length;
  return (
    <div className="flex items-center gap-2 rounded-md border border-border bg-card p-2">
      <Checkbox
        checked={allSelected}
        onCheckedChange={(v) => setSelected(v ? new Set(ids) : new Set())}
        aria-label={`Select all ${noun}`}
      />
      <span className="text-sm text-muted-foreground">{selected.size} selected</span>
      <Button
        variant="destructive"
        size="sm"
        className="ml-auto"
        disabled={!selected.size}
        onClick={() => {
          if (!window.confirm(`Delete ${selected.size} ${noun}?`)) return;
          onDelete([...selected]);
          setSelected(new Set());
          toast.success(`Deleted ${noun}`);
        }}
      >
        <Trash2 className="size-4" /> Delete
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          setSelected(new Set());
          setActive(false);
        }}
      >
        <X className="size-4" />
      </Button>
    </div>
  );
}

export const Route = createFileRoute("/prayers")({
  head: () => ({
    meta: [
      { title: "Prayer Library — Faith Journey" },
      {
        name: "description",
        content:
          "Browse, search, and edit single prayers, devotions, and How To guides in one library.",
      },
      { property: "og:title", content: "Prayer Library — Faith Journey" },
      {
        property: "og:description",
        content: "Your prayers, devotions, and instructions, kept together and ready to pray.",
      },
    ],
  }),
  component: LibraryPage,
});

function LibraryPage() {
  const { db, deletePrayer, deleteTemplate, deleteHowTo } = useApp();
  const [query, setQuery] = useState("");
  const [pickPrayers, setPickPrayers] = useState(false);
  const [selPrayers, setSelPrayers] = useState<Set<string>>(new Set());
  const [pickTemplates, setPickTemplates] = useState(false);
  const [selTemplates, setSelTemplates] = useState<Set<string>>(new Set());
  const [pickHowTos, setPickHowTos] = useState(false);
  const [selHowTos, setSelHowTos] = useState<Set<string>>(new Set());

  const toggle = (
    set: Set<string>,
    setter: (next: Set<string>) => void,
    id: string,
    on: boolean,
  ) => {
    const next = new Set(set);
    if (on) next.add(id);
    else next.delete(id);
    setter(next);
  };

  // Every wording is its own record; the library groups them and shows the
  // default wording at the top of each group.
  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matches = (p: Prayer) =>
      !q ||
      p.title.toLowerCase().includes(q) ||
      (p.variant_label ?? "").toLowerCase().includes(q) ||
      (p.tags ?? []).some((t: string) => t.includes(q)) ||
      (p.prayer_type ?? "").includes(q) ||
      (db.prayer_versions.find((v) => v.id === p.default_version_id)?.body ?? "")
        .toLowerCase()
        .includes(q);

    const byGroup = new Map<string, Prayer[]>();
    for (const prayer of db.prayers) {
      const key = variantGroupId(prayer);
      byGroup.set(key, [...(byGroup.get(key) ?? []), prayer]);
    }

    return [...byGroup.entries()]
      .filter(([, members]) => members.some(matches))
      .map(([key, members]) => {
        const sorted = [...members].sort(
          (a, b) =>
            Number(Boolean(b.is_default_variant)) - Number(Boolean(a.is_default_variant)) ||
            (a.variant_label ?? "").localeCompare(b.variant_label ?? ""),
        );
        return { key, primary: sorted[0]!, others: sorted.slice(1) };
      })
      .sort(
        (a, b) =>
          Number(b.primary.favorite) - Number(a.primary.favorite) ||
          a.primary.title.localeCompare(b.primary.title),
      );
  }, [db, query]);

  return (
    <AppShell title="Prayers" subtitle="Single prayers, devotions, and how to pray them">
      <Tabs defaultValue="prayers">
        <TabsList className="w-full">
          <TabsTrigger value="prayers" className="flex-1">
            Prayers
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex-1">
            Devotions
          </TabsTrigger>
          <TabsTrigger value="howto" className="flex-1">
            How To
          </TabsTrigger>
        </TabsList>

        <TabsContent value="prayers" className="mt-4">
          <Button asChild variant="secondary" className="mb-3 h-12 w-full">
            <Link to="/import">
              <Plus className="size-4" /> New prayer
            </Link>
          </Button>
          <p className="mb-3 text-center text-xs text-muted-foreground">
            Write it, paste it, or add a link to import from.
          </p>
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search prayers"
              className="h-12 pl-9"
              aria-label="Search prayers"
            />
          </div>
          <div className="mb-3">
            <BulkBar
              noun="prayers"
              ids={groups.flatMap(({ primary, others }) => [
                primary.id,
                ...others.map((o) => o.id),
              ])}
              selected={selPrayers}
              setSelected={setSelPrayers}
              active={pickPrayers}
              setActive={setPickPrayers}
              onDelete={(ids) => ids.forEach(deletePrayer)}
            />
          </div>
          <ul className="space-y-3">
            {groups.map(({ key, primary, others }) => (
              <PrayerRow
                key={key}
                primary={primary}
                others={others}
                picking={pickPrayers}
                selected={selPrayers}
                onSelect={(id, on) => toggle(selPrayers, setSelPrayers, id, on)}
              />
            ))}
            {groups.length === 0 ? (
              <li className="py-10 text-center text-sm text-muted-foreground">
                No prayers match that search.
              </li>
            ) : null}
          </ul>
        </TabsContent>

        <TabsContent value="templates" className="mt-4 space-y-3">
          <p className="text-sm text-muted-foreground">
            A devotion is a composite sequence of structured prayers — vocal prayer woven with
            meditation. The Rosary is a devotion; bead-based devotions that follow a set pattern are
            called chaplets.
          </p>
          <Button asChild variant="secondary" className="h-12 w-full">
            <Link to="/import" search={{ mode: "devotion" }}>
              <Plus className="size-4" /> New devotion
            </Link>
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Paste or write the devotion — each prayer is saved on its own, then bundled.{" "}
            <Link
              to="/template/$templateId"
              params={{ templateId: "new" }}
              className="text-primary underline"
            >
              Build one by hand
            </Link>
          </p>
          <BulkBar
            noun="devotions"
            ids={db.templates.map((t) => t.id)}
            selected={selTemplates}
            setSelected={setSelTemplates}
            active={pickTemplates}
            setActive={setPickTemplates}
            onDelete={(ids) => ids.forEach(deleteTemplate)}
          />
          {db.templates.map((template) => {
            const outline = templateOutline(db, template);
            return (
              <div key={template.id} className="soft-card flex items-start">
                {pickTemplates ? (
                  <span className="self-center pl-4">
                    <Checkbox
                      checked={selTemplates.has(template.id)}
                      onCheckedChange={(v) =>
                        toggle(selTemplates, setSelTemplates, template.id, Boolean(v))
                      }
                      aria-label={`Select ${template.name}`}
                    />
                  </span>
                ) : null}
                <Link
                  to="/template/$templateId"
                  params={{ templateId: template.id }}
                  className="block flex-1 p-4"
                >
                  <p className="font-medium">{template.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {template.description ?? `${outline.length} items`}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {outline
                      .slice(0, 4)
                      .map((o) => `${o.label}${o.detail ? ` ${o.detail}` : ""}`)
                      .join(" · ")}
                    {outline.length > 4 ? " …" : ""}
                  </p>
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    if (!window.confirm(`Delete devotion “${template.name}”?`)) return;
                    deleteTemplate(template.id);
                    toast.success("Devotion deleted");
                  }}
                  aria-label={`Delete ${template.name}`}
                  className="px-4 py-5 text-muted-foreground"
                >
                  <Trash2 className="size-5" />
                </button>
              </div>
            );
          })}
        </TabsContent>

        <TabsContent value="howto" className="mt-4 space-y-3">
          <Button asChild variant="secondary" className="h-12 w-full">
            <Link to="/import" search={{ mode: "howto" }}>
              <Plus className="size-4" /> New How To guide
            </Link>
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Paste a page that explains how a devotion is prayed. Every line becomes a step — guides
            are only created here, never guessed from prayer text.
          </p>
          <BulkBar
            noun="guides"
            ids={db.how_tos.map((h) => h.id)}
            selected={selHowTos}
            setSelected={setSelHowTos}
            active={pickHowTos}
            setActive={setPickHowTos}
            onDelete={(ids) => ids.forEach(deleteHowTo)}
          />
          {db.how_tos.map((howTo) => {
            const linked = db.templates.find((t) => t.id === howTo.template_id);
            return (
              <div key={howTo.id} className="soft-card flex items-start">
                {pickHowTos ? (
                  <span className="self-center pl-4">
                    <Checkbox
                      checked={selHowTos.has(howTo.id)}
                      onCheckedChange={(v) => toggle(selHowTos, setSelHowTos, howTo.id, Boolean(v))}
                      aria-label={`Select ${howTo.title}`}
                    />
                  </span>
                ) : null}
                <Link
                  to="/howto/$howToId"
                  params={{ howToId: howTo.id }}
                  className="block flex-1 p-4"
                >
                  <p className="font-medium">{howTo.title}</p>
                  <p className="text-sm text-muted-foreground">{howTo.summary}</p>
                  {linked ? <p className="mt-1 text-xs text-primary">For {linked.name}</p> : null}
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    if (!window.confirm(`Delete guide “${howTo.title}”?`)) return;
                    deleteHowTo(howTo.id);
                    toast.success("Guide deleted");
                  }}
                  aria-label={`Delete ${howTo.title}`}
                  className="px-4 py-5 text-muted-foreground"
                >
                  <Trash2 className="size-5" />
                </button>
              </div>
            );
          })}
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
