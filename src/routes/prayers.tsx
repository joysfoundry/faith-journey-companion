import { useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ChevronDown,
  ChevronRight,
  ExternalLink,
  FilePlus2,
  Hand,
  Heart,
  MoreVertical,
  Pencil,
  Play,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { AppShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ExternalLink as ExtLink } from "@/components/ui/external-link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useApp, variantGroupId } from "@/lib/prayer/store";
import type { HowTo, PrayerHour, PrayerTemplate, Prayer } from "@/lib/prayer/types";
import { toast } from "sonner";
import { mysteryVersions, newId, recurrenceLabel, templateOutline } from "@/lib/prayer/compiler";

const HOUR_LABEL: Record<PrayerHour, string> = {
  office_of_readings: "Office of Readings",
  lauds: "Morning Prayer (Lauds)",
  daytime: "Daytime Prayer",
  vespers: "Evening Prayer (Vespers)",
  compline: "Night Prayer (Compline)",
};

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

/**
 * One devotion in the library — mirrors PrayerRow: a caret expands a summary
 * (schedule + mystery + source + step outline) in place; inline icons edit,
 * favorite, and delete. No detail page — the guided follow-along lives in a
 * prayer session, not here.
 */
function DevotionRow({
  template,
  picking,
  selected,
  onSelect,
}: {
  template: PrayerTemplate;
  picking: boolean;
  selected: Set<string>;
  onSelect: (id: string, on: boolean) => void;
}) {
  const { db, toggleTemplateFavorite, deleteTemplate } = useApp();
  const [open, setOpen] = useState(false);
  const outline = templateOutline(db, template);
  const source = template.source_id
    ? db.sources.find((s) => s.id === template.source_id)
    : undefined;
  const schedule = [
    template.default_recurrence ? recurrenceLabel(template.default_recurrence) : null,
    template.default_start_time ?? null,
    template.default_hour ? HOUR_LABEL[template.default_hour] : null,
  ].filter(Boolean);
  const mystery =
    template.mystery_count > 0
      ? `${template.mystery_count} mysteries · ${
          template.fixed_mystery_set_id
            ? (db.mystery_sets.find((s) => s.id === template.fixed_mystery_set_id)?.name ??
              "fixed set")
            : "by day"
        }`
      : null;

  return (
    <li className="soft-card">
      <div className="flex items-center">
        {picking ? (
          <span className="pl-4">
            <Checkbox
              checked={selected.has(template.id)}
              onCheckedChange={(v) => onSelect(template.id, Boolean(v))}
              aria-label={`Select ${template.name}`}
            />
          </span>
        ) : (
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Hide summary" : "Show summary"}
            aria-expanded={open}
            className="py-4 pl-3 pr-1 text-muted-foreground"
          >
            <ChevronDown className={`size-5 transition-transform ${open ? "rotate-180" : ""}`} />
          </button>
        )}
        <Link
          to="/devotion/$devotionId"
          params={{ devotionId: template.id }}
          className="min-w-0 flex-1 py-4 pl-1 pr-2"
        >
          <p className="truncate font-medium">{template.name}</p>
          <p className="truncate text-xs text-muted-foreground">
            {template.description ?? `${outline.length} steps`}
          </p>
        </Link>
        <Link
          to="/template/$templateId"
          params={{ templateId: template.id }}
          aria-label={`Edit ${template.name}`}
          className="px-2.5 py-4 text-muted-foreground"
        >
          <Pencil className="size-5" />
        </Link>
        <button
          type="button"
          onClick={() => toggleTemplateFavorite(template.id)}
          aria-label={template.favorite ? "Remove favorite" : "Add favorite"}
          className="px-2.5 py-4 text-muted-foreground"
        >
          <Heart className={`size-5 ${template.favorite ? "fill-primary text-primary" : ""}`} />
        </button>
        <button
          type="button"
          onClick={() => {
            if (!window.confirm(`Delete devotion “${template.name}”?`)) return;
            deleteTemplate(template.id);
            toast.success("Devotion deleted");
          }}
          aria-label={`Delete ${template.name}`}
          className="px-2.5 pr-4 py-4 text-muted-foreground"
        >
          <Trash2 className="size-5" />
        </button>
      </div>

      {open ? (
        <div className="space-y-3 border-t border-border/60 px-5 py-4">
          {schedule.length || mystery || source ? (
            <div className="flex flex-wrap gap-x-2 gap-y-1 text-xs text-muted-foreground">
              {schedule.map((s) => (
                <span key={s} className="rounded-full bg-secondary px-2 py-0.5">
                  {s}
                </span>
              ))}
              {mystery ? (
                <span className="rounded-full bg-secondary px-2 py-0.5">{mystery}</span>
              ) : null}
              {source ? (
                <span className="rounded-full bg-secondary px-2 py-0.5">Source: {source.name}</span>
              ) : null}
            </div>
          ) : null}
          <ol className="space-y-1 text-sm">
            {outline.map((o, i) => (
              <li key={i} className="flex gap-2">
                <span className="w-5 shrink-0 text-right text-xs text-muted-foreground tabular-nums">
                  {i + 1}
                </span>
                <span>
                  {o.label}
                  {o.detail ? <span className="text-muted-foreground"> {o.detail}</span> : null}
                </span>
              </li>
            ))}
          </ol>
        </div>
      ) : null}
    </li>
  );
}

/** Pretty label for a resource link — the file name for PDFs, else the host. */
function linkLabel(url: string): string {
  try {
    const u = new URL(url);
    if (/\.pdf($|\?)/i.test(u.pathname)) return u.pathname.split("/").pop() || "PDF";
    return u.hostname.replace(/^www\./, "") + (u.pathname.length > 1 ? u.pathname : "");
  } catch {
    return url;
  }
}

/**
 * A How To guide is a collection of reference links / PDFs (no hand-written
 * steps). Each card lists its links and lets you add or remove URLs.
 */
function HowToCard({ howTo }: { howTo: HowTo }) {
  const { db, saveHowTo, deleteHowTo } = useApp();
  const [newLink, setNewLink] = useState("");
  const links = howTo.links ?? [];
  const linked = db.templates.find((t) => t.id === howTo.template_id);

  const addLink = () => {
    const url = newLink.trim();
    if (!/^https?:\/\//i.test(url)) {
      toast.error("Add a full link starting with https://");
      return;
    }
    saveHowTo({ ...howTo, links: [...links, url] });
    setNewLink("");
  };

  return (
    <li className="soft-card p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-medium">{howTo.title}</p>
          {linked ? <p className="text-xs text-primary">For {linked.name}</p> : null}
        </div>
        <button
          type="button"
          onClick={() => {
            if (!window.confirm(`Delete guide “${howTo.title}”?`)) return;
            deleteHowTo(howTo.id);
            toast.success("Guide deleted");
          }}
          aria-label={`Delete ${howTo.title}`}
          className="shrink-0 text-muted-foreground"
        >
          <Trash2 className="size-5" />
        </button>
      </div>

      <ul className="mt-3 space-y-2">
        {links.map((url) => (
          <li key={url} className="flex items-center gap-2">
            <ExtLink
              href={url}
              className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm transition hover:border-primary"
            >
              <ExternalLink className="size-4 shrink-0 text-muted-foreground" />
              <span className="truncate">{linkLabel(url)}</span>
            </ExtLink>
            <button
              type="button"
              onClick={() => saveHowTo({ ...howTo, links: links.filter((l) => l !== url) })}
              aria-label="Remove link"
              className="shrink-0 text-muted-foreground hover:text-destructive"
            >
              <X className="size-4" />
            </button>
          </li>
        ))}
        {links.length === 0 ? (
          <li className="text-xs text-muted-foreground">No links yet — add a URL or PDF below.</li>
        ) : null}
      </ul>

      <div className="mt-3 flex gap-2">
        <Input
          value={newLink}
          onChange={(e) => setNewLink(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addLink()}
          placeholder="https://… or a PDF link"
          className="h-11"
          aria-label={`Add a link to ${howTo.title}`}
        />
        <Button variant="secondary" className="h-11 shrink-0" onClick={addLink}>
          <Plus className="size-4" /> Add
        </Button>
      </div>
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
      { title: "Prayer Library — ACTS" },
      {
        name: "description",
        content:
          "Browse, search, and edit single prayers, devotions, and How To guides in one library.",
      },
      { property: "og:title", content: "Prayer Library — ACTS" },
      {
        property: "og:description",
        content: "Your prayers, devotions, and instructions, kept together and ready to pray.",
      },
    ],
  }),
  component: LibraryPage,
});

function LibraryPage() {
  const { db, deletePrayer, deleteTemplate, saveHowTo } = useApp();
  const navigate = useNavigate();
  const [tab, setTab] = useState("prayers");
  const [query, setQuery] = useState("");
  const [pickPrayers, setPickPrayers] = useState(false);
  const [selPrayers, setSelPrayers] = useState<Set<string>>(new Set());
  const [pickTemplates, setPickTemplates] = useState(false);
  const [selTemplates, setSelTemplates] = useState<Set<string>>(new Set());
  const [newGuideTitle, setNewGuideTitle] = useState("");

  const addGuide = () => {
    const title = newGuideTitle.trim();
    if (!title) {
      toast.error("Name the guide first.");
      return;
    }
    saveHowTo({ id: newId("howto"), title, summary: "", steps: [], links: [] });
    setNewGuideTitle("");
    toast.success("Guide added — now add its links.");
  };

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

  // Add lives in the ⋯ menu, matching the Prayer Sessions page. "New devotion"
  // opens the Devotion Builder; "Build by hand" jumps straight to the drag-and-
  // drop editor.
  const addMenu = (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Add to library"
        className="rounded-md p-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
      >
        <MoreVertical className="size-5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => navigate({ to: "/import", search: { mode: "single" } })}>
          <Plus className="size-4" /> New prayer
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate({ to: "/import", search: { mode: "devotion" } })}>
          <FilePlus2 className="size-4" /> New devotion
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTab("howto")}>
          <Plus className="size-4" /> New How To
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => navigate({ to: "/template/$templateId", params: { templateId: "new" } })}
        >
          <Hand className="size-4" /> Build a devotion by hand
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <AppShell
      title="Prayers"
      subtitle="Single prayers, devotions, and how to pray them"
      action={addMenu}
    >
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="w-full">
          <TabsTrigger value="prayers" className="flex-1">
            Prayers
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex-1">
            Devotions
          </TabsTrigger>
          <TabsTrigger value="mysteries" className="flex-1">
            Mysteries
          </TabsTrigger>
          <TabsTrigger value="howto" className="flex-1">
            How To
          </TabsTrigger>
        </TabsList>

        <TabsContent value="prayers" className="mt-4">
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
            called chaplets. Add one from the ⋯ menu.
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
          <ul className="space-y-3">
            {[...db.templates]
              .sort(
                (a, b) =>
                  Number(Boolean(b.favorite)) - Number(Boolean(a.favorite)) ||
                  a.name.localeCompare(b.name),
              )
              .map((template) => (
                <DevotionRow
                  key={template.id}
                  template={template}
                  picking={pickTemplates}
                  selected={selTemplates}
                  onSelect={(id, on) => toggle(selTemplates, setSelTemplates, id, on)}
                />
              ))}
            {db.templates.length === 0 ? (
              <li className="py-10 text-center text-sm text-muted-foreground">
                No devotions yet. Add one from the ⋯ menu.
              </li>
            ) : null}
          </ul>
        </TabsContent>

        <TabsContent value="mysteries" className="mt-4 space-y-3">
          <p className="text-sm text-muted-foreground">
            A <span className="font-medium text-foreground">version</span> is one body of every
            mystery — its Scripture, meditation, and fruit — named for its source (USCCB, Ascension,
            your family). Devotions and sessions pick which version to pray.
          </p>
          <Link
            to="/mystery-version/$bodyKey"
            params={{ bodyKey: "new" }}
            className="flex h-12 items-center justify-center gap-2 rounded-md border border-dashed border-input text-sm font-medium text-muted-foreground hover:bg-accent"
          >
            <Plus className="size-4" /> Add a version
          </Link>
          <ul className="space-y-3">
            {mysteryVersions(db).map((v) => (
              <li key={v.key}>
                <Link
                  to="/mystery-version/$bodyKey"
                  params={{ bodyKey: v.key }}
                  className="soft-card flex items-center justify-between p-4 hover:bg-accent"
                >
                  <div>
                    <p className="font-medium">{v.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {v.count} {v.count === 1 ? "mystery" : "mysteries"}
                    </p>
                  </div>
                  <ChevronRight className="size-4 text-muted-foreground" />
                </Link>
              </li>
            ))}
          </ul>
        </TabsContent>

        <TabsContent value="howto" className="mt-4 space-y-3">
          <p className="text-sm text-muted-foreground">
            A How To guide is a set of reference links and PDFs for a devotion — add the pages that
            explain how it&apos;s prayed.
          </p>
          <div className="flex gap-2">
            <Input
              value={newGuideTitle}
              onChange={(e) => setNewGuideTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addGuide()}
              placeholder="New guide title, e.g. How to Pray the Chaplet"
              className="h-12"
              aria-label="New How To guide title"
            />
            <Button variant="secondary" className="h-12 shrink-0" onClick={addGuide}>
              <Plus className="size-4" /> Add
            </Button>
          </div>
          <ul className="space-y-3">
            {db.how_tos.map((howTo) => (
              <HowToCard key={howTo.id} howTo={howTo} />
            ))}
            {db.how_tos.length === 0 ? (
              <li className="py-10 text-center text-sm text-muted-foreground">
                No guides yet. Name one above, then add its links.
              </li>
            ) : null}
          </ul>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
