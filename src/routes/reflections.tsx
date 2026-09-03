import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowDownWideNarrow,
  ArrowUpNarrowWide,
  ChevronDown,
  ChevronsDownUp,
  ChevronsUpDown,
  MoreVertical,
  Pencil,
  Tag,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";

import { ReflectionComposer } from "@/components/home/ReflectionComposer";
import { InspirationPanel } from "@/components/reflections/InspirationPanel";
import { ThemeEditor } from "@/components/reflections/ThemeEditor";
import { AppShell } from "@/components/layout/PageShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { type LinkableItem } from "@/domain/placeholderData";
import { todayISO } from "@/lib/prayer/compiler";
import { getLiturgicalDay, type LiturgicalDay } from "@/lib/liturgical/calendar";
import { buildReflectionLinkables } from "@/lib/prayer/linkables";
import { resolveInspiration } from "@/lib/prayer/inspiration";
import { useApp } from "@/lib/prayer/store";
import { displayTheme, suggestThemes, themeHistory } from "@/lib/prayer/themes";
import type { Database, Reflection } from "@/lib/prayer/types";

type GroupBy = "date" | "theme" | "source";

/**
 * Bucket entries for the journal's group-by view (ACTS-135). "date" is one flat
 * list; "theme" and "source" split into named sections (an entry with several
 * themes/links appears under each), with an "Untagged"/"No source" catch-all last.
 * Assumes `entries` is already date-sorted, so each section keeps that order.
 */
function groupEntries(
  entries: Reflection[],
  groupBy: GroupBy,
  db: Database,
): { key: string; entries: Reflection[] }[] {
  if (groupBy === "date") return [{ key: "", entries }];
  const catchAll = groupBy === "theme" ? "Untagged" : "No source";
  const map = new Map<string, Reflection[]>();
  const push = (key: string, e: Reflection) => {
    const arr = map.get(key);
    if (arr) arr.push(e);
    else map.set(key, [e]);
  };
  for (const e of entries) {
    if (groupBy === "theme") {
      const ts = e.themes ?? [];
      if (ts.length === 0) push(catchAll, e);
      else for (const t of ts) push(displayTheme(t), e);
    } else {
      if (e.links.length === 0) push(catchAll, e);
      else for (const link of e.links) push(resolveInspiration(link, db).label, e);
    }
  }
  const keys = [...map.keys()].filter((k) => k !== catchAll).sort((a, b) => a.localeCompare(b));
  if (map.has(catchAll)) keys.push(catchAll);
  return keys.map((key) => ({ key, entries: map.get(key) ?? [] }));
}

export const Route = createFileRoute("/reflections")({
  // `?link=<id>` pre-links the composer to the item you reflected from (a session,
  // a reading, or a library item), so provenance carries over from the reflect icon.
  validateSearch: (search: Record<string, unknown>): { link?: string } =>
    typeof search["link"] === "string" ? { link: search["link"] } : {},
  head: () => ({
    meta: [
      { title: "Reflection — ACTS" },
      {
        name: "description",
        content:
          "Write reflections and link them to the prayer, reading, Mass, or book that prompted them.",
      },
      { property: "og:title", content: "Reflection — ACTS" },
      {
        property: "og:description",
        content: "Your journal — the connecting tissue across prayer, Word, and learning.",
      },
    ],
  }),
  component: ReflectionsPage,
});

function formatWhen(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function EntryLinks({ entry }: { entry: Reflection }) {
  const themes = entry.themes ?? [];
  if (entry.links.length === 0 && themes.length === 0 && entry.mode !== "open_dialogue")
    return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {entry.mode === "open_dialogue" && (
        <Badge variant="outline" className="font-normal">
          Open dialogue
        </Badge>
      )}
      {themes.map((theme) => (
        <Badge key={`theme:${theme}`} variant="secondary" className="gap-1 font-normal">
          <Tag className="size-3" aria-hidden />
          {displayTheme(theme)}
        </Badge>
      ))}
      {entry.links.map((link) => (
        <Badge key={link.target_id} variant="secondary" className="font-normal">
          {link.label ?? link.target_id}
        </Badge>
      ))}
    </div>
  );
}

/**
 * One journal row. The caret toggles an inline preview of the body (no actions —
 * just content); clicking the date/title opens the single-entry view where edit
 * and delete live.
 */
function JournalRow({
  entry,
  open,
  onToggle,
  onOpen,
}: {
  entry: Reflection;
  open: boolean;
  onToggle: () => void;
  onOpen: () => void;
}) {
  return (
    <li className="overflow-hidden">
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onToggle}
          aria-label={open ? "Collapse preview" : "Expand preview"}
          className="p-2 text-muted-foreground hover:text-foreground"
        >
          <ChevronDown
            className={`size-4 transition-transform ${open ? "rotate-180" : ""}`}
            aria-hidden
          />
        </button>
        <button
          type="button"
          onClick={onOpen}
          className="min-w-0 flex-1 truncate py-3 pr-4 text-left text-foreground hover:text-primary"
        >
          <span className="text-muted-foreground">{formatWhen(entry.created_at)}</span>
          {entry.title?.trim() ? <span className="font-medium"> · {entry.title}</span> : null}
        </button>
      </div>
      {open ? (
        <div className="space-y-2 px-4 pb-4 pl-11">
          <p className="whitespace-pre-line text-sm text-muted-foreground">{entry.body}</p>
          <EntryLinks entry={entry} />
        </div>
      ) : null}
    </li>
  );
}

/** The single journal entry: full content, with an ellipsis menu to edit or delete. */
function JournalEntryDialog({
  entry,
  onOpenChange,
}: {
  entry: Reflection | undefined;
  onOpenChange: (open: boolean) => void;
}) {
  const { db, updateReflection, deleteReflection } = useApp();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [themes, setThemes] = useState<string[]>([]);

  useEffect(() => {
    // Reset the form only when a different entry opens — not on every keystroke.
    setEditing(false);
    setTitle(entry?.title ?? "");
    setBody(entry?.body ?? "");
    setThemes(entry?.themes ?? []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entry?.id]);

  const editSuggestions = suggestThemes(`${title}\n${body}`, {
    history: themeHistory(db.reflections).map((h) => h.theme),
    applied: themes,
  });

  function saveEdit() {
    if (!entry || !body.trim()) return;
    updateReflection({
      ...entry,
      title: title.trim() || undefined,
      body: body.trim(),
      themes: themes.length > 0 ? themes : undefined,
    });
    setEditing(false);
  }

  return (
    <Dialog open={Boolean(entry)} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        {entry ? (
          <>
            <DialogHeader>
              <div className="flex items-start justify-between gap-3">
                <DialogTitle className="min-w-0 font-display text-xl font-normal">
                  {entry.title?.trim() ? entry.title : "Reflection"}
                </DialogTitle>
                {!editing ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="-mr-2 -mt-1 size-8 shrink-0 text-muted-foreground hover:text-foreground"
                        aria-label="Entry options"
                      >
                        <MoreVertical className="size-4" aria-hidden />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditing(true)}>
                        <Pencil className="size-4" aria-hidden /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => {
                          deleteReflection(entry.id);
                          onOpenChange(false);
                        }}
                      >
                        <Trash2 className="size-4" aria-hidden /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : null}
              </div>
              <p className="text-xs text-muted-foreground">{formatWhen(entry.created_at)}</p>
            </DialogHeader>

            {editing ? (
              <div className="space-y-3">
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Title or theme (optional)"
                  className="font-display"
                />
                <Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={6} />
                <ThemeEditor
                  value={themes}
                  onChange={setThemes}
                  suggestions={editSuggestions}
                  historyThemes={themeHistory(db.reflections).map((h) => h.theme)}
                />
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" onClick={() => setEditing(false)}>
                    Cancel
                  </Button>
                  <Button onClick={saveEdit} disabled={!body.trim()}>
                    Save
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="whitespace-pre-line text-sm text-muted-foreground">{entry.body}</p>
                <EntryLinks entry={entry} />
                <InspirationPanel links={entry.links} db={db} />
              </div>
            )}
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function ReflectionsPage() {
  const { db } = useApp();
  const { link: prefillLinkId } = Route.useSearch();

  // Same liturgical-day label as Home (computed client-side to dodge an
  // SSR/timezone hydration mismatch), so the daily-readings tag reads the same
  // wherever the reflection is started.
  const [litDay, setLitDay] = useState<LiturgicalDay | null>(null);
  useEffect(() => setLitDay(getLiturgicalDay(todayISO())), []);

  // The one shared builder, identical to Home's picker (ACTS-136 source parity).
  const linkables: LinkableItem[] = buildReflectionLinkables(db, {
    dailyReadingLabel: litDay?.title,
  });

  // Sort by date; newest-first by default, toggle to oldest-first.
  const [sortAsc, setSortAsc] = useState(false);
  const entries = [...db.reflections].sort((a, b) => {
    const cmp = (a.created_at ?? "").localeCompare(b.created_at ?? "");
    return sortAsc ? cmp : -cmp;
  });

  const [groupBy, setGroupBy] = useState<GroupBy>("date");
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const groups = groupEntries(entries, groupBy, db);
  const toggleGroup = (key: string) =>
    setCollapsedGroups((s) => {
      const next = new Set(s);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const [openIds, setOpenIds] = useState<Set<string>>(new Set());
  const [detailId, setDetailId] = useState<string | null>(null);
  const detailEntry = entries.find((e) => e.id === detailId);
  const allOpen = entries.length > 0 && entries.every((e) => openIds.has(e.id));
  const noneOpen = openIds.size === 0;
  const toggle = (id: string) =>
    setOpenIds((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <AppShell title="Reflection" subtitle="Write freely and link what inspired it">
      <div className="space-y-6">
        <ReflectionComposer linkables={linkables} prefillLinkId={prefillLinkId ?? null} />

        <section>
          <div className="mb-2 space-y-2">
            <div className="flex items-center justify-between gap-3">
              <p className="eyebrow">Journal</p>
              {entries.length > 0 ? (
                <div className="flex items-center gap-0.5">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-8 text-muted-foreground hover:text-foreground"
                    onClick={() => setSortAsc((v) => !v)}
                    aria-label={sortAsc ? "Sort newest first" : "Sort oldest first"}
                    title={
                      sortAsc
                        ? "Oldest first — tap for newest first"
                        : "Newest first — tap for oldest first"
                    }
                  >
                    {sortAsc ? (
                      <ArrowUpNarrowWide className="size-4" aria-hidden />
                    ) : (
                      <ArrowDownWideNarrow className="size-4" aria-hidden />
                    )}
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-8 text-muted-foreground hover:text-foreground"
                    onClick={() => setOpenIds(new Set(entries.map((e) => e.id)))}
                    disabled={allOpen}
                    aria-label="Expand all"
                    title="Expand all"
                  >
                    <ChevronsUpDown className="size-4" aria-hidden />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-8 text-muted-foreground hover:text-foreground"
                    onClick={() => setOpenIds(new Set())}
                    disabled={noneOpen}
                    aria-label="Collapse all"
                    title="Collapse all"
                  >
                    <ChevronsDownUp className="size-4" aria-hidden />
                  </Button>
                </div>
              ) : null}
            </div>
            {entries.length > 0 ? (
              <div className="flex items-center gap-1">
                <span className="mr-1 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                  Group by
                </span>
                {(["date", "theme", "source"] as GroupBy[]).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGroupBy(g)}
                    aria-pressed={groupBy === g}
                    className={`rounded-full px-2.5 py-1 text-xs capitalize transition-colors ${
                      groupBy === g
                        ? "bg-secondary text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
          {entries.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nothing yet — your saved reflections will appear here, newest first.
            </p>
          ) : groupBy === "date" ? (
            <ul className="divide-y divide-border/70 overflow-hidden rounded-xl border border-border">
              {entries.map((entry) => (
                <JournalRow
                  key={entry.id}
                  entry={entry}
                  open={openIds.has(entry.id)}
                  onToggle={() => toggle(entry.id)}
                  onOpen={() => setDetailId(entry.id)}
                />
              ))}
            </ul>
          ) : (
            <div className="space-y-3">
              {groups.map((group) => {
                const collapsed = collapsedGroups.has(group.key);
                return (
                  <div key={group.key}>
                    <button
                      type="button"
                      onClick={() => toggleGroup(group.key)}
                      className="mb-1 flex w-full items-center gap-1.5 text-left"
                      aria-expanded={!collapsed}
                    >
                      <ChevronDown
                        className={`size-3.5 text-muted-foreground transition-transform ${
                          collapsed ? "-rotate-90" : ""
                        }`}
                        aria-hidden
                      />
                      <span className="text-sm font-medium text-foreground">{group.key}</span>
                      <span className="text-xs text-muted-foreground">{group.entries.length}</span>
                    </button>
                    {!collapsed ? (
                      <ul className="divide-y divide-border/70 overflow-hidden rounded-xl border border-border">
                        {group.entries.map((entry) => (
                          <JournalRow
                            key={`${group.key}:${entry.id}`}
                            entry={entry}
                            open={openIds.has(entry.id)}
                            onToggle={() => toggle(entry.id)}
                            onOpen={() => setDetailId(entry.id)}
                          />
                        ))}
                      </ul>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      <JournalEntryDialog
        entry={detailEntry}
        onOpenChange={(open) => setDetailId(open ? detailId : null)}
      />
    </AppShell>
  );
}
