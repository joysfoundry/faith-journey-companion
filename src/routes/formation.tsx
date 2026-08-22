import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ExternalLink, MoreVertical, Pencil, Plus, Star, Trash2 } from "lucide-react";

import { AppShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { newId } from "@/lib/prayer/compiler";
import {
  CATEGORY_LABELS,
  CATEGORY_OPTIONS,
  GROUP_LABELS,
  GROUP_ORDER,
  STATUS_STEPS,
  byStatusThenRecent,
  detectCategory,
  detectScriptureProgram,
  groupOf,
  isCompletable,
  isScriptureProgram,
  knowledgeSubtitle,
  type KnowledgeGroup,
} from "@/lib/prayer/knowledge";
import { useApp } from "@/lib/prayer/store";
import type { KnowledgeCategory, KnowledgeItem } from "@/lib/prayer/types";

export const Route = createFileRoute("/formation")({
  validateSearch: (search: Record<string, unknown>): { add?: boolean } =>
    search["add"] === "1" || search["add"] === true ? { add: true } : {},
  head: () => ({
    meta: [
      { title: "Knowledge — Faith Journey" },
      {
        name: "description",
        content:
          "Your Knowledge library — books, media, guided programs, and the resources forming your faith, with reflections attached.",
      },
      { property: "og:title", content: "Knowledge — Faith Journey" },
      {
        property: "og:description",
        content: "Books, media, programs, and resources forming your faith right now.",
      },
    ],
  }),
  component: KnowledgePage,
});

type FilterKey = "all" | KnowledgeGroup;

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  ...GROUP_ORDER.map((g) => ({ key: g, label: GROUP_LABELS[g] })),
];

function KnowledgePage() {
  const {
    db,
    addKnowledgeItem,
    updateKnowledgeItem,
    setKnowledgeStatus,
    toggleKnowledgeFavorite,
    deleteKnowledgeItem,
  } = useApp();
  const { add } = Route.useSearch();

  const [tab, setTab] = useState<"add" | "library">(add ? "add" : "library");
  const [filter, setFilter] = useState<FilterKey>("all");

  // Add / edit form
  const [editingId, setEditingId] = useState<string | null>(null);
  const [category, setCategory] = useState<KnowledgeCategory>("book");
  const [categoryTouched, setCategoryTouched] = useState(false);
  const [title, setTitle] = useState("");
  const [creator, setCreator] = useState("");
  const [source, setSource] = useState("");
  const [url, setUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [startDate, setStartDate] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [readsScripture, setReadsScripture] = useState(false);
  const [scriptureTouched, setScriptureTouched] = useState(false);

  const items = db.knowledge_items;

  const visible = useMemo(() => {
    const filtered = filter === "all" ? items : items.filter((i) => groupOf(i.category) === filter);
    return [...filtered].sort(byStatusThenRecent);
  }, [items, filter]);

  function resetForm() {
    setEditingId(null);
    setCategory("book");
    setCategoryTouched(false);
    setTitle("");
    setCreator("");
    setSource("");
    setUrl("");
    setNotes("");
    setStartDate("");
    setTargetDate("");
    setReadsScripture(false);
    setScriptureTouched(false);
  }

  function beginEdit(item: KnowledgeItem) {
    setEditingId(item.id);
    setCategory(item.category);
    setCategoryTouched(true);
    setTitle(item.title);
    setCreator(item.creator ?? "");
    setSource(item.source ?? "");
    setUrl(item.url ?? "");
    setNotes(item.notes ?? "");
    setStartDate(item.start_date ?? "");
    setTargetDate(item.target_date ?? "");
    setReadsScripture(!!item.reads_scripture);
    setScriptureTouched(true);
    setTab("add");
  }

  function save() {
    if (!title.trim()) return;
    const base = {
      title: title.trim(),
      category,
      creator: creator.trim() || undefined,
      source: source.trim() || undefined,
      url: url.trim() || undefined,
      notes: notes.trim() || undefined,
      start_date: category === "program" ? startDate || undefined : undefined,
      target_date: category === "program" ? targetDate || undefined : undefined,
      reads_scripture: category === "program" ? readsScripture || undefined : undefined,
    };
    if (editingId) {
      const existing = items.find((i) => i.id === editingId);
      if (existing) updateKnowledgeItem({ ...existing, ...base });
    } else {
      addKnowledgeItem({
        id: newId("know"),
        ...base,
        status: "not_started",
        created_at: new Date().toISOString(),
      });
    }
    resetForm();
    setTab("library");
  }

  // When the URL changes and the user hasn't picked a category by hand, guess it.
  function onUrlChange(next: string) {
    setUrl(next);
    const guessed = categoryTouched ? category : detectCategory(next, title);
    if (!categoryTouched) setCategory(guessed);
    if (!scriptureTouched && guessed === "program") {
      setReadsScripture(detectScriptureProgram(next, title, source));
    }
  }

  const addMenu =
    tab === "add" ? (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon" variant="secondary" className="size-9" aria-label="Item actions">
            <MoreVertical className="size-4" aria-hidden />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={save} disabled={!title.trim()}>
            <Plus className="size-4" aria-hidden /> {editingId ? "Save changes" : "Save item"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              resetForm();
              setTab("library");
            }}
          >
            {editingId ? "Cancel edit" : "Clear"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ) : undefined;

  return (
    <AppShell
      title="Knowledge"
      subtitle="Books, media, programs, and resources forming your faith"
      back={{ to: "/more", label: "More" }}
      action={addMenu}
    >
      <Tabs value={tab} onValueChange={(v) => setTab(v as "add" | "library")}>
        <TabsList className="mb-4 grid w-full grid-cols-2">
          <TabsTrigger value="add">{editingId ? "Edit" : "Add"}</TabsTrigger>
          <TabsTrigger value="library">Library</TabsTrigger>
        </TabsList>

        {/* ADD / EDIT ------------------------------------------------------ */}
        <TabsContent value="add" className="mt-0">
          <div className="soft-card space-y-3 p-4">
            <div className="space-y-1">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Type</Label>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value as KnowledgeCategory);
                  setCategoryTouched(true);
                }}
                aria-label="Type"
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {CATEGORY_LABELS[c]}
                  </option>
                ))}
              </select>
              {url.trim() && !categoryTouched ? (
                <p className="text-[11px] text-muted-foreground">
                  Auto-detected from the link — change it above if it&apos;s wrong.
                </p>
              ) : null}
            </div>

            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
              className="h-10"
            />
            <Input
              value={url}
              onChange={(e) => onUrlChange(e.target.value)}
              placeholder="Link (optional) — paste to auto-sort"
              className="h-10"
            />
            <Input
              value={creator}
              onChange={(e) => setCreator(e.target.value)}
              placeholder="Author / creator (optional)"
              className="h-10"
            />
            <Input
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="Publisher / platform (optional)"
              className="h-10"
            />

            {category === "program" ? (
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Start (optional)</Label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="h-10"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Target (optional)</Label>
                  <Input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="h-10"
                  />
                </div>
              </div>
            ) : null}

            {category === "program" ? (
              <label className="flex items-start gap-2 rounded-md border border-border/70 bg-muted/30 p-3">
                <Checkbox
                  checked={readsScripture}
                  onCheckedChange={(v) => {
                    setReadsScripture(v === true);
                    setScriptureTouched(true);
                  }}
                  className="mt-0.5"
                />
                <span className="text-sm">
                  <span className="font-medium text-foreground">Reads through Scripture</span>
                  <span className="block text-xs text-muted-foreground">
                    Shows under the Word section on Home instead of Programs.
                  </span>
                </span>
              </label>
            ) : null}

            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes (optional)"
              rows={2}
            />

            <p className="text-[11px] text-muted-foreground">
              Save from the ⋯ menu at the top right.
            </p>
          </div>
        </TabsContent>

        {/* LIBRARY --------------------------------------------------------- */}
        <TabsContent value="library" className="mt-0">
          <div className="mb-3 flex flex-wrap gap-1.5">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  filter === f.key
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {visible.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nothing here yet — add a book, video, program, or resource.
            </p>
          ) : (
            <ul className="divide-y divide-border/60 overflow-hidden rounded-lg border border-border/60">
              {visible.map((item) => (
                <li key={item.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="truncate text-sm font-medium text-foreground">{item.title}</p>
                      {item.url ? (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={`Open ${item.title}`}
                          className="shrink-0 text-muted-foreground hover:text-primary"
                        >
                          <ExternalLink className="size-3.5" aria-hidden />
                        </a>
                      ) : null}
                      {isScriptureProgram(item) ? (
                        <span className="shrink-0 rounded-full bg-secondary px-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                          Word
                        </span>
                      ) : null}
                    </div>
                    <p className="truncate text-xs text-muted-foreground">
                      {knowledgeSubtitle(item)}
                    </p>
                    {isCompletable(item.category) ? (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {STATUS_STEPS.map((s) => (
                          <button
                            key={s.key}
                            onClick={() => setKnowledgeStatus(item.id, s.key)}
                            className={`rounded-full px-2 py-0.5 text-[11px] font-medium transition-colors ${
                              item.status === s.key
                                ? "bg-primary text-primary-foreground"
                                : "bg-secondary text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            {s.label}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>

                  {/* Resources: star = show on Home. */}
                  {item.category === "resource" ? (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-8 shrink-0"
                      aria-label={item.favorite ? "Unfavorite" : "Favorite (show on Home)"}
                      title={
                        item.favorite ? "Favorited — shows on Home" : "Favorite to show on Home"
                      }
                      onClick={() => toggleKnowledgeFavorite(item.id)}
                    >
                      <Star
                        className={`size-4 ${item.favorite ? "fill-primary text-primary" : "text-muted-foreground"}`}
                        aria-hidden
                      />
                    </Button>
                  ) : null}

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-8 shrink-0 text-muted-foreground"
                        aria-label={`Actions for ${item.title}`}
                      >
                        <MoreVertical className="size-4" aria-hidden />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => beginEdit(item)}>
                        <Pencil className="size-4" aria-hidden /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => deleteKnowledgeItem(item.id)}
                      >
                        <Trash2 className="size-4" aria-hidden /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </li>
              ))}
            </ul>
          )}
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
