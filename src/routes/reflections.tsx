import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowDownWideNarrow,
  ArrowUpNarrowWide,
  ChevronDown,
  ChevronsDownUp,
  ChevronsUpDown,
  Flame,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { type LinkableItem } from "@/domain/placeholderData";
import { todayISO } from "@/lib/prayer/compiler";
import { getLiturgicalDay, type LiturgicalDay } from "@/lib/liturgical/calendar";
import { buildReflectionLinkables } from "@/lib/prayer/linkables";
import { resolveInspiration } from "@/lib/prayer/inspiration";
import { LECTIO_TEMPLATE_ID } from "@/lib/prayer/seed";
import { useApp } from "@/lib/prayer/store";
import { displayTheme, suggestThemes, themeHistory } from "@/lib/prayer/themes";
import type { Database, Reflection } from "@/lib/prayer/types";

type GroupBy = "date" | "theme" | "source";

/**
 * The Lectio session a reflection belongs to (ACTS-140), or null. A Lectio
 * movement is dual-linked to its `prayer_session`; we confirm that session is a
 * Lectio (its template) so only real sittings fold — an ordinary session a note
 * was tagged with stays a normal entry.
 */
function lectioSessionId(entry: Reflection, db: Database): string | null {
  const link = entry.links.find((l) => l.target_type === "prayer_session");
  if (!link) return null;
  const session = db.sessions.find((s) => s.id === link.target_id);
  return session && session.template_id === LECTIO_TEMPLATE_ID ? session.id : null;
}

/** Step order of a movement within its session (its `session_item` position). */
function movementPosition(entry: Reflection, db: Database): number {
  const link = entry.links.find((l) => l.target_type === "session_item");
  const item = link ? db.session_items.find((i) => i.id === link.target_id) : undefined;
  return item?.position ?? 0;
}

/** A journal row is either a lone reflection or a folded Lectio sitting. */
type JournalItem =
  | { kind: "entry"; entry: Reflection }
  | { kind: "sitting"; sessionId: string; movements: Reflection[] };

/**
 * Fold the flat, date-sorted entry list into journal items (ACTS-140): a Lectio
 * sitting's per-movement reflections collapse into one item, positioned where its
 * first movement falls (so the sitting keeps its place in the date order), with
 * the movements ordered Read → Reflect → Respond → Rest by step position. Every
 * other reflection passes through as its own entry.
 */
function buildJournalItems(entries: Reflection[], db: Database): JournalItem[] {
  const items: JournalItem[] = [];
  const indexBySession = new Map<string, number>();
  for (const entry of entries) {
    const sid = lectioSessionId(entry, db);
    if (!sid) {
      items.push({ kind: "entry", entry });
      continue;
    }
    const at = indexBySession.get(sid);
    if (at == null) {
      indexBySession.set(sid, items.length);
      items.push({ kind: "sitting", sessionId: sid, movements: [entry] });
    } else {
      (items[at] as Extract<JournalItem, { kind: "sitting" }>).movements.push(entry);
    }
  }
  for (const item of items) {
    if (item.kind === "sitting") {
      item.movements.sort((a, b) => movementPosition(a, db) - movementPosition(b, db));
    }
  }
  return items;
}

/** Theme keys for a journal item (ACTS-135). A folded Lectio sitting carries none. */
function itemThemeKeys(item: JournalItem): string[] {
  if (item.kind !== "entry") return [];
  return (item.entry.themes ?? []).map(displayTheme);
}

/** Source keys for a journal item. A folded sitting groups under the Lectio devotion. */
function itemSourceKeys(item: JournalItem, db: Database): string[] {
  if (item.kind === "sitting") return ["Lectio Divina"];
  return item.entry.links.map((link) => resolveInspiration(link, db).label);
}

/**
 * Bucket journal items for the group-by views (ACTS-135; extended in ACTS-140 to
 * operate on folded items, so a Lectio sitting stays one unit — grouped under the
 * Lectio devotion for "source" and never split into its movements). "date" is one
 * flat list. An item with several themes/sources appears under each (deduped);
 * a themeless/sourceless item falls under the "Untagged"/"No source" catch-all.
 */
function groupJournalItems(
  items: JournalItem[],
  groupBy: GroupBy,
  db: Database,
): { key: string; items: JournalItem[] }[] {
  if (groupBy === "date") return [{ key: "", items }];
  const catchAll = groupBy === "theme" ? "Untagged" : "No source";
  const map = new Map<string, JournalItem[]>();
  const push = (key: string, it: JournalItem) => {
    const arr = map.get(key);
    if (arr) arr.push(it);
    else map.set(key, [it]);
  };
  for (const it of items) {
    const keys = groupBy === "theme" ? itemThemeKeys(it) : itemSourceKeys(it, db);
    if (keys.length === 0) push(catchAll, it);
    else for (const k of new Set(keys)) push(k, it);
  }
  const keys = [...map.keys()].filter((k) => k !== catchAll).sort((a, b) => a.localeCompare(b));
  if (map.has(catchAll)) keys.push(catchAll);
  return keys.map((key) => ({ key, items: map.get(key) ?? [] }));
}

/**
 * Header facts for a folded sitting: its date, the passage citation, and the
 * pasted passage text if the reader entered one (the app never stores Bible text
 * itself — only what was pasted into the session — so `passageText` is often absent).
 */
function sittingMeta(
  sessionId: string,
  db: Database,
): { date: string; passage?: string; passageText?: string } {
  const session = db.sessions.find((s) => s.id === sessionId);
  const scripture = db.session_items.find(
    (i) => i.session_id === sessionId && i.kind === "scripture",
  );
  return {
    date: session?.created_at ?? "",
    ...(scripture?.reference?.trim() ? { passage: scripture.reference.trim() } : {}),
    ...(scripture?.body?.trim() ? { passageText: scripture.body.trim() } : {}),
  };
}

function formatDay(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
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

/**
 * A folded Lectio sitting (ACTS-140): one collapsible row for a whole session.
 * Collapsed, it's a quiet summary (date · passage · movement count); expanded, it
 * lists the movements in step order, each opening the single-entry view. The
 * header links back to the session so an in-progress sitting can be resumed.
 */
function SittingGroup({
  sessionId,
  movements,
  db,
  open,
  onToggle,
  onOpenEntry,
}: {
  sessionId: string;
  movements: Reflection[];
  db: Database;
  open: boolean;
  onToggle: () => void;
  onOpenEntry: (id: string) => void;
}) {
  const meta = sittingMeta(sessionId, db);
  const count = movements.length;
  return (
    <li className="overflow-hidden">
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onToggle}
          aria-label={open ? "Collapse sitting" : "Expand sitting"}
          className="p-2 text-muted-foreground hover:text-foreground"
        >
          <ChevronDown
            className={`size-4 transition-transform ${open ? "rotate-180" : ""}`}
            aria-hidden
          />
        </button>
        <div className="min-w-0 flex-1 py-3 pr-2">
          <div className="flex items-center gap-1.5">
            <Flame className="size-3.5 shrink-0 text-primary" aria-hidden />
            <span className="font-medium text-foreground">Lectio Divina</span>
            <span className="text-muted-foreground">· {formatDay(meta.date)}</span>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {meta.passage ? `${meta.passage} · ` : ""}
            {count} movement{count === 1 ? "" : "s"}
          </p>
        </div>
        <Button
          asChild
          size="sm"
          variant="ghost"
          className="mr-1 h-8 shrink-0 text-muted-foreground hover:text-foreground"
        >
          <Link to="/session/$sessionId" params={{ sessionId }}>
            Open
          </Link>
        </Button>
      </div>
      {open ? (
        <div className="space-y-3 px-4 pb-4 pl-11">
          {meta.passageText ? (
            <div className="rounded-lg border border-border bg-secondary/40 p-3">
              {meta.passage ? (
                <p className="mb-1 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                  {meta.passage}
                </p>
              ) : null}
              <p className="whitespace-pre-line font-display text-sm leading-relaxed text-foreground/90">
                {meta.passageText}
              </p>
            </div>
          ) : null}
          <ul className="space-y-3">
            {movements.map((m) => (
              <li key={m.id}>
                <button
                  type="button"
                  onClick={() => onOpenEntry(m.id)}
                  className="w-full text-left"
                >
                  <p className="text-sm font-medium text-foreground hover:text-primary">
                    {m.title ?? "Reflection"}
                  </p>
                  <p className="line-clamp-2 whitespace-pre-line text-sm text-muted-foreground">
                    {m.body}
                  </p>
                </button>
              </li>
            ))}
          </ul>
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

  // Two views on one page (ACTS-139), via the shared Tabs component: "write"
  // (the composer) and "journal" (the saved entries). Write is the default so
  // the compose box greets you — and a `?link=` deep-link from a Reflect icon
  // (ACTS-129) lands here pre-linked. Radix unmounts the inactive tab, but no
  // state is lost: the journal's group/sort/expand state lives here in the page,
  // and the composer's in-progress entry is persisted to the shared draft.
  const [tab, setTab] = useState<"write" | "journal">("write");

  const [groupBy, setGroupBy] = useState<GroupBy>("date");
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const toggleGroup = (key: string) =>
    setCollapsedGroups((s) => {
      const next = new Set(s);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const [openIds, setOpenIds] = useState<Set<string>>(new Set());
  // Folded Lectio sittings are expanded independently of lone entries (ACTS-140).
  const [openSittings, setOpenSittings] = useState<Set<string>>(new Set());
  const [detailId, setDetailId] = useState<string | null>(null);
  const detailEntry = entries.find((e) => e.id === detailId);

  // Every view folds a Lectio sitting into one item (ACTS-140): the Date view as a
  // flat list, Theme/Source bucketed by `groupJournalItems` (a sitting groups under
  // the Lectio devotion for source, and carries no themes).
  const journalItems = buildJournalItems(entries, db);
  const groups = groupJournalItems(journalItems, groupBy, db);
  const sittingIds = Array.from(
    new Set(entries.map((e) => lectioSessionId(e, db)).filter((x): x is string => x !== null)),
  );

  const allOpen =
    entries.length > 0 &&
    entries.every((e) => openIds.has(e.id)) &&
    sittingIds.every((s) => openSittings.has(s));
  const noneOpen = openIds.size === 0 && openSittings.size === 0;
  const expandAll = () => {
    setOpenIds(new Set(entries.map((e) => e.id)));
    setOpenSittings(new Set(sittingIds));
  };
  const collapseAll = () => {
    setOpenIds(new Set());
    setOpenSittings(new Set());
  };
  const toggle = (id: string) =>
    setOpenIds((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const toggleSitting = (id: string) =>
    setOpenSittings((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  // One renderer for both the flat Date list and the grouped views, so a folded
  // sitting looks and behaves the same everywhere. `keyPrefix` keeps React keys
  // unique when an item repeats across groups.
  const renderItem = (item: JournalItem, keyPrefix = "") =>
    item.kind === "entry" ? (
      <JournalRow
        key={`${keyPrefix}${item.entry.id}`}
        entry={item.entry}
        open={openIds.has(item.entry.id)}
        onToggle={() => toggle(item.entry.id)}
        onOpen={() => setDetailId(item.entry.id)}
      />
    ) : (
      <SittingGroup
        key={`${keyPrefix}${item.sessionId}`}
        sessionId={item.sessionId}
        movements={item.movements}
        db={db}
        open={openSittings.has(item.sessionId)}
        onToggle={() => toggleSitting(item.sessionId)}
        onOpenEntry={(id) => setDetailId(id)}
      />
    );

  return (
    <AppShell title="Reflection" subtitle="Scripture Guided Writing or Inspired Free Writing">
      <Tabs value={tab} onValueChange={(v) => setTab(v as "write" | "journal")}>
        <TabsList className="mb-4 grid w-full grid-cols-2">
          <TabsTrigger value="write">Write</TabsTrigger>
          <TabsTrigger value="journal">Journal</TabsTrigger>
        </TabsList>

        <TabsContent value="write" className="mt-0">
          <ReflectionComposer
            linkables={linkables}
            prefillLinkId={prefillLinkId ?? null}
            showDraftStatus
          />
        </TabsContent>

        <TabsContent value="journal" className="mt-0">
          <section>
            <div className="mb-2 space-y-2">
              <div className="flex items-center justify-end gap-3">
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
                      onClick={expandAll}
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
                      onClick={collapseAll}
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
                {journalItems.map((item) => renderItem(item))}
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
                        <span className="text-xs text-muted-foreground">{group.items.length}</span>
                      </button>
                      {!collapsed ? (
                        <ul className="divide-y divide-border/70 overflow-hidden rounded-xl border border-border">
                          {group.items.map((item) => renderItem(item, `${group.key}:`))}
                        </ul>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </TabsContent>
      </Tabs>

      <JournalEntryDialog
        entry={detailEntry}
        onOpenChange={(open) => setDetailId(open ? detailId : null)}
      />
    </AppShell>
  );
}
