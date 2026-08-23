import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ExternalLink, MoreVertical, Pencil, Plus, Star, Trash2, UserPlus, X } from "lucide-react";

import { AppShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { newId } from "@/lib/prayer/compiler";
import {
  CATEGORY_LABELS,
  CATEGORY_OPTIONS,
  GROUP_LABELS,
  GROUP_ORDER,
  LINK_PLATFORM_LABELS,
  LINK_PLATFORM_OPTIONS,
  STATUS_STEPS,
  VOICE_KIND_LABELS,
  VOICE_KIND_OPTIONS,
  VOICE_LABEL,
  VOICE_LABEL_SINGULAR,
  byStatusThenRecent,
  detectCategory,
  detectPlatform,
  detectScriptureProgram,
  groupOf,
  knowledgeSubtitle,
  matchVoice,
  voiceFromLink,
  voiceSubtitle,
  type KnowledgeGroup,
} from "@/lib/prayer/knowledge";
import { useApp } from "@/lib/prayer/store";
import type {
  Channel,
  KnowledgeCategory,
  KnowledgeItem,
  KnowledgeLink,
  LinkPlatform,
  Voice,
  VoiceKind,
} from "@/lib/prayer/types";

export const Route = createFileRoute("/formation")({
  validateSearch: (
    search: Record<string, unknown>,
  ): { add?: boolean; edit?: string; editVoice?: string } => {
    const out: { add?: boolean; edit?: string; editVoice?: string } = {};
    if (search["add"] === "1" || search["add"] === true) out.add = true;
    if (typeof search["edit"] === "string" && search["edit"]) out.edit = search["edit"];
    if (typeof search["editVoice"] === "string" && search["editVoice"])
      out.editVoice = search["editVoice"];
    return out;
  },
  head: () => ({
    meta: [
      { title: "Knowledge — Faith Journey" },
      {
        name: "description",
        content: "Your Knowledge library — the voices you follow and the content that forms you.",
      },
    ],
  }),
  component: KnowledgePage,
});

type FilterKey = "all" | KnowledgeGroup | "voice";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  ...GROUP_ORDER.map((g) => ({ key: g, label: GROUP_LABELS[g] })),
  { key: "voice", label: VOICE_LABEL },
];

/** A small editor row for a platform + URL (used for both channels and content links). */
function LinkRow({
  platform,
  url,
  onPlatform,
  onUrl,
  onRemove,
}: {
  platform: LinkPlatform;
  url: string;
  onPlatform: (p: LinkPlatform) => void;
  onUrl: (u: string) => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <select
        value={platform}
        onChange={(e) => onPlatform(e.target.value as LinkPlatform)}
        aria-label="Platform"
        className="h-10 shrink-0 rounded-md border border-input bg-background px-2 text-sm"
      >
        {LINK_PLATFORM_OPTIONS.map((p) => (
          <option key={p} value={p}>
            {LINK_PLATFORM_LABELS[p]}
          </option>
        ))}
      </select>
      <Input
        value={url}
        onChange={(e) => onUrl(e.target.value)}
        placeholder="https://…"
        className="h-10"
      />
      <Button
        size="icon"
        variant="ghost"
        className="size-9 shrink-0 text-muted-foreground"
        aria-label="Remove"
        onClick={onRemove}
      >
        <X className="size-4" aria-hidden />
      </Button>
    </div>
  );
}

function KnowledgePage() {
  const {
    db,
    addKnowledgeItem,
    updateKnowledgeItem,
    setKnowledgeStatus,
    deleteKnowledgeItem,
    toggleContentLinkFavorite,
    upsertVoice,
    deleteVoice,
    toggleChannelFavorite,
  } = useApp();
  const { add, edit, editVoice } = Route.useSearch();
  const navigate = useNavigate();

  const [tab, setTab] = useState<"add" | "library">(add ? "add" : "library");
  const [filter, setFilter] = useState<FilterKey>("all");

  // What are we adding/editing?
  const [mode, setMode] = useState<"content" | "voice">("content");
  const [editingId, setEditingId] = useState<string | null>(null);

  // Content fields
  const [category, setCategory] = useState<KnowledgeCategory>("book");
  const [categoryTouched, setCategoryTouched] = useState(false);
  const [title, setTitle] = useState("");
  const [source, setSource] = useState("");
  const [notes, setNotes] = useState("");
  const [startDate, setStartDate] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [readsScripture, setReadsScripture] = useState(false);
  const [scriptureTouched, setScriptureTouched] = useState(false);
  const [links, setLinks] = useState<KnowledgeLink[]>([]);
  const [voiceId, setVoiceId] = useState("");
  const [voiceTouched, setVoiceTouched] = useState(false);
  const [tags, setTags] = useState("");

  // Voice fields
  const [voiceName, setVoiceName] = useState("");
  const [voiceKind, setVoiceKind] = useState<VoiceKind>("individual");
  const [channels, setChannels] = useState<Channel[]>([]);
  const [voiceNotes, setVoiceNotes] = useState("");

  const items = db.knowledge_items;
  const voices = db.voices;

  const visibleContent = useMemo(() => {
    const filtered =
      filter === "all"
        ? items
        : filter === "voice"
          ? []
          : items.filter((i) => groupOf(i.category) === filter);
    return [...filtered].sort(byStatusThenRecent);
  }, [items, filter]);

  const visibleVoices = useMemo(
    () => (filter === "all" || filter === "voice" ? voices : []),
    [voices, filter],
  );
  // Unattributed content is bucketed under a virtual "General" voice.
  const orphanCount = useMemo(() => items.filter((i) => !i.voice_id).length, [items]);
  const showGeneral = (filter === "all" || filter === "voice") && orphanCount > 0;

  function resetForm() {
    setEditingId(null);
    setMode("content");
    setCategory("book");
    setCategoryTouched(false);
    setTitle("");
    setSource("");
    setNotes("");
    setStartDate("");
    setTargetDate("");
    setReadsScripture(false);
    setScriptureTouched(false);
    setLinks([]);
    setVoiceId("");
    setVoiceTouched(false);
    setTags("");
    setVoiceName("");
    setVoiceKind("individual");
    setChannels([]);
    setVoiceNotes("");
  }

  function beginEditContent(item: KnowledgeItem) {
    resetForm();
    setMode("content");
    setEditingId(item.id);
    setCategory(item.category);
    setCategoryTouched(true);
    setTitle(item.title);
    setSource(item.source ?? "");
    setNotes(item.notes ?? "");
    setStartDate(item.start_date ?? "");
    setTargetDate(item.target_date ?? "");
    setReadsScripture(!!item.reads_scripture);
    setScriptureTouched(true);
    setLinks(item.links ?? []);
    setVoiceId(item.voice_id ?? "");
    setVoiceTouched(true);
    setTags((item.tags ?? []).join(", "));
    setTab("add");
  }

  function beginEditVoice(voice: Voice) {
    resetForm();
    setMode("voice");
    setEditingId(voice.id);
    setVoiceName(voice.name);
    setVoiceKind(voice.kind);
    setChannels(voice.channels ?? []);
    setVoiceNotes(voice.notes ?? "");
    setTab("add");
  }

  // Deep-linked edit from a record page.
  useEffect(() => {
    if (edit) {
      const t = items.find((i) => i.id === edit);
      if (t) beginEditContent(t);
      void navigate({ to: "/formation", search: {}, replace: true });
    } else if (editVoice) {
      const v = voices.find((x) => x.id === editVoice);
      if (v) beginEditVoice(v);
      void navigate({ to: "/formation", search: {}, replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [edit, editVoice]);

  function saveContent() {
    if (!title.trim()) return;
    const cleanLinks = links
      .map((l) => ({ ...l, url: l.url.trim(), label: l.label?.trim() || undefined }))
      .filter((l) => l.url);
    const tagList = tags
      .split(",")
      .map((t) => t.trim().replace(/^#/, ""))
      .filter(Boolean);
    const base = {
      title: title.trim(),
      category,
      voice_id: voiceId || undefined,
      source: source.trim() || undefined,
      notes: notes.trim() || undefined,
      start_date: category === "program" ? startDate || undefined : undefined,
      target_date: category === "program" ? targetDate || undefined : undefined,
      reads_scripture: category === "program" ? readsScripture || undefined : undefined,
      links: cleanLinks.length ? cleanLinks : undefined,
      tags: tagList.length ? tagList : undefined,
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

  function saveVoice() {
    if (!voiceName.trim()) return;
    const cleanChannels = channels
      .map((c) => ({ ...c, url: c.url.trim(), label: c.label?.trim() || undefined }))
      .filter((c) => c.url);
    const voice: Voice = {
      id: editingId ?? newId("voice"),
      name: voiceName.trim(),
      kind: voiceKind,
      channels: cleanChannels.length ? cleanChannels : undefined,
      notes: voiceNotes.trim() || undefined,
      created_at:
        (editingId && voices.find((v) => v.id === editingId)?.created_at) ||
        new Date().toISOString(),
    };
    upsertVoice(voice);
    resetForm();
    // Adding/editing a Voice lands on its editable hub page.
    void navigate({ to: "/voice/$voiceId", params: { voiceId: voice.id }, search: { edit: true } });
  }

  // Content: paste a URL → auto-sort category + auto-link the voice.
  function onLinkUrlChange(index: number, next: string) {
    setLinks((prev) =>
      prev.map((l, i) =>
        i === index
          ? {
              ...l,
              url: next,
              ...(next.trim() && !l.url.trim() ? { platform: detectPlatform(next) } : {}),
            }
          : l,
      ),
    );
    if (index !== 0) return;
    if (!categoryTouched) {
      const guessed = detectCategory(next, title);
      setCategory(guessed);
      if (!scriptureTouched && guessed === "program") {
        setReadsScripture(detectScriptureProgram(next, title, source));
      }
    }
    if (!voiceTouched) {
      const match = matchVoice(next, voices);
      setVoiceId(match ? match.voice.id : "");
    }
  }

  function addLink() {
    setLinks((p) => [...p, { platform: "website", url: "" }]);
  }
  function addChannel() {
    setChannels((p) => [...p, { id: newId("chan"), platform: "instagram", url: "" }]);
  }

  // "Create a voice from this link" — turns an unknown URL into a Voice + attaches it.
  function createVoiceFromUrl(url: string) {
    const seed = voiceFromLink(url);
    const id = newId("voice");
    upsertVoice({
      id,
      name: seed.name,
      kind: seed.kind,
      channels: [{ id: newId("chan"), platform: seed.platform, url: url.trim() }],
      created_at: new Date().toISOString(),
    });
    setVoiceId(id);
    setVoiceTouched(true);
  }

  const firstUrl = links[0]?.url ?? "";
  const voiceMatch = !voiceId ? matchVoice(firstUrl, voices) : undefined;
  const canCreateVoice = mode === "content" && !voiceId && !voiceMatch && !!firstUrl.trim();

  const addMenu =
    tab === "add" ? (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon" variant="secondary" className="size-9" aria-label="Item actions">
            <MoreVertical className="size-4" aria-hidden />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={mode === "voice" ? saveVoice : saveContent}
            disabled={mode === "voice" ? !voiceName.trim() : !title.trim()}
          >
            <Plus className="size-4" aria-hidden />{" "}
            {editingId
              ? "Save changes"
              : mode === "voice"
                ? `Save ${VOICE_LABEL_SINGULAR}`
                : "Save item"}
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
      subtitle={`The ${VOICE_LABEL.toLowerCase()} you follow and the content that forms you`}
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
            {/* Mode: content vs voice (only when creating) */}
            {!editingId ? (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setMode("content")}
                  className={`rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                    mode === "content"
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-input bg-background text-muted-foreground"
                  }`}
                >
                  Content
                </button>
                <button
                  onClick={() => setMode("voice")}
                  className={`rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                    mode === "voice"
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-input bg-background text-muted-foreground"
                  }`}
                >
                  {VOICE_LABEL_SINGULAR}
                </button>
              </div>
            ) : null}

            {mode === "voice" ? (
              <>
                <Input
                  value={voiceName}
                  onChange={(e) => setVoiceName(e.target.value)}
                  placeholder="Name (person, organization, or ministry)"
                  className="h-10"
                />
                <div className="space-y-1">
                  <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                    Kind
                  </Label>
                  <select
                    value={voiceKind}
                    onChange={(e) => setVoiceKind(e.target.value as VoiceKind)}
                    aria-label="Kind"
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    {VOICE_KIND_OPTIONS.map((k) => (
                      <option key={k} value={k}>
                        {VOICE_KIND_LABELS[k]}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                    Channels
                  </Label>
                  {channels.length === 0 ? (
                    <p className="text-xs text-muted-foreground">
                      Add each place they can be followed — Instagram, a podcast, a website.
                    </p>
                  ) : null}
                  {channels.map((c, i) => (
                    <LinkRow
                      key={c.id}
                      platform={c.platform}
                      url={c.url}
                      onPlatform={(p) =>
                        setChannels((prev) =>
                          prev.map((x, idx) => (idx === i ? { ...x, platform: p } : x)),
                        )
                      }
                      onUrl={(u) =>
                        setChannels((prev) =>
                          prev.map((x, idx) =>
                            idx === i
                              ? {
                                  ...x,
                                  url: u,
                                  ...(u.trim() && !x.url.trim()
                                    ? { platform: detectPlatform(u) }
                                    : {}),
                                }
                              : x,
                          ),
                        )
                      }
                      onRemove={() => setChannels((prev) => prev.filter((_, idx) => idx !== i))}
                    />
                  ))}
                  <Button variant="secondary" size="sm" onClick={addChannel} className="gap-1.5">
                    <Plus className="size-4" aria-hidden /> Add a channel
                  </Button>
                </div>
                <Textarea
                  value={voiceNotes}
                  onChange={(e) => setVoiceNotes(e.target.value)}
                  placeholder="Notes (optional)"
                  rows={2}
                />
              </>
            ) : (
              <>
                <div className="space-y-1">
                  <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                    Type
                  </Label>
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
                </div>

                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Title"
                  className="h-10"
                />

                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                    Links — where to find it
                  </Label>
                  {links.map((l, i) => (
                    <LinkRow
                      key={i}
                      platform={l.platform}
                      url={l.url}
                      onPlatform={(p) =>
                        setLinks((prev) =>
                          prev.map((x, idx) => (idx === i ? { ...x, platform: p } : x)),
                        )
                      }
                      onUrl={(u) => onLinkUrlChange(i, u)}
                      onRemove={() => setLinks((prev) => prev.filter((_, idx) => idx !== i))}
                    />
                  ))}
                  <Button variant="secondary" size="sm" onClick={addLink} className="gap-1.5">
                    <Plus className="size-4" aria-hidden /> Add a link
                  </Button>
                </div>

                {/* Voice (author) */}
                <div className="space-y-2 rounded-md border border-border/70 bg-muted/30 p-3">
                  <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                    {VOICE_LABEL_SINGULAR} (optional)
                  </Label>
                  <select
                    value={voiceId}
                    onChange={(e) => {
                      setVoiceId(e.target.value);
                      setVoiceTouched(true);
                    }}
                    aria-label={VOICE_LABEL_SINGULAR}
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="">— None —</option>
                    {voices.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} ({VOICE_KIND_LABELS[v.kind].toLowerCase()})
                      </option>
                    ))}
                  </select>
                  {voiceMatch ? (
                    <button
                      type="button"
                      onClick={() => {
                        setVoiceId(voiceMatch.voice.id);
                        setVoiceTouched(true);
                      }}
                      className="text-xs text-primary hover:underline"
                    >
                      Link to “{voiceMatch.voice.name}” — matched from the URL
                    </button>
                  ) : null}
                  {canCreateVoice ? (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => createVoiceFromUrl(firstUrl)}
                      className="gap-1.5"
                    >
                      <UserPlus className="size-4" aria-hidden /> Create a{" "}
                      {VOICE_LABEL_SINGULAR.toLowerCase()} from this link
                    </Button>
                  ) : null}
                </div>

                <Input
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  placeholder="Publisher / platform (optional)"
                  className="h-10"
                />

                {category === "program" ? (
                  <>
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
                  </>
                ) : null}

                <Input
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="Tags (comma-separated) — praying, becomingcatholic"
                  className="h-10"
                />
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Notes (optional)"
                  rows={2}
                />
              </>
            )}

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

          {visibleContent.length === 0 && visibleVoices.length === 0 && !showGeneral ? (
            <p className="text-sm text-muted-foreground">Nothing here yet.</p>
          ) : (
            <ul className="divide-y divide-border/60 overflow-hidden rounded-lg border border-border/60">
              {showGeneral ? (
                <li className="flex items-start gap-3 px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <Link
                      to="/voice/$voiceId"
                      params={{ voiceId: "general" }}
                      className="truncate text-sm font-medium text-foreground hover:text-primary"
                    >
                      General
                    </Link>
                    <p className="truncate text-xs text-muted-foreground">
                      Unattributed · {orphanCount} {orphanCount === 1 ? "item" : "items"}
                    </p>
                  </div>
                </li>
              ) : null}
              {visibleVoices.map((v) => (
                <li key={v.id} className="flex items-start gap-3 px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <Link
                      to="/voice/$voiceId"
                      params={{ voiceId: v.id }}
                      className="truncate text-sm font-medium text-foreground hover:text-primary"
                    >
                      {v.name}
                    </Link>
                    <p className="truncate text-xs text-muted-foreground">{voiceSubtitle(v)}</p>
                    {v.channels?.length ? (
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {v.channels.map((c) => (
                          <span key={c.id} className="inline-flex items-center">
                            <a
                              href={c.url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 rounded-l-full bg-secondary py-0.5 pl-2 pr-1 text-[11px] font-medium text-muted-foreground hover:text-primary"
                            >
                              {c.label || LINK_PLATFORM_LABELS[c.platform]}
                              <ExternalLink className="size-3" aria-hidden />
                            </a>
                            <button
                              onClick={() => toggleChannelFavorite(v.id, c.id)}
                              aria-label={c.favorite ? "Unpin from Home" : "Pin to Home"}
                              className="rounded-r-full bg-secondary py-0.5 pl-1 pr-2"
                            >
                              <Star
                                className={`size-3 ${c.favorite ? "fill-primary text-primary" : "text-muted-foreground"}`}
                                aria-hidden
                              />
                            </button>
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                  <RowMenu onEdit={() => beginEditVoice(v)} onDelete={() => deleteVoice(v.id)} />
                </li>
              ))}

              {visibleContent.map((item) => (
                <li key={item.id} className="flex items-start gap-3 px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <Link
                        to="/knowledge/$knowledgeId"
                        params={{ knowledgeId: item.id }}
                        className="truncate text-sm font-medium text-foreground hover:text-primary"
                      >
                        {item.title}
                      </Link>
                      {isScriptureWord(item) ? (
                        <span className="shrink-0 rounded-full bg-secondary px-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                          Word
                        </span>
                      ) : null}
                    </div>
                    <p className="truncate text-xs text-muted-foreground">
                      {knowledgeSubtitle(item, voices)}
                    </p>
                    {item.links?.length ? (
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {item.links.map((l, i) => (
                          <span key={i} className="inline-flex items-center">
                            <a
                              href={l.url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 rounded-l-full bg-secondary py-0.5 pl-2 pr-1 text-[11px] font-medium text-muted-foreground hover:text-primary"
                            >
                              {l.label || LINK_PLATFORM_LABELS[l.platform]}
                              <ExternalLink className="size-3" aria-hidden />
                            </a>
                            <button
                              onClick={() => toggleContentLinkFavorite(item.id, i)}
                              aria-label={l.favorite ? "Unpin from Home" : "Pin to Home"}
                              className="rounded-r-full bg-secondary py-0.5 pl-1 pr-2"
                            >
                              <Star
                                className={`size-3 ${l.favorite ? "fill-primary text-primary" : "text-muted-foreground"}`}
                                aria-hidden
                              />
                            </button>
                          </span>
                        ))}
                      </div>
                    ) : null}
                    {item.tags?.length ? (
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {item.tags.map((t) => (
                          <span
                            key={t}
                            className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    ) : null}
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
                  </div>
                  <RowMenu
                    onEdit={() => beginEditContent(item)}
                    onDelete={() => deleteKnowledgeItem(item.id)}
                  />
                </li>
              ))}
            </ul>
          )}
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}

function isScriptureWord(item: KnowledgeItem): boolean {
  return item.category === "program" && !!item.reads_scripture;
}

function RowMenu({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          className="size-8 shrink-0 text-muted-foreground"
          aria-label="Actions"
        >
          <MoreVertical className="size-4" aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onEdit}>
          <Pencil className="size-4" aria-hidden /> Edit
        </DropdownMenuItem>
        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={onDelete}>
          <Trash2 className="size-4" aria-hidden /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
