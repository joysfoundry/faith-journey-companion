import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ExternalLink, MoreVertical, Pencil, Star, Trash2 } from "lucide-react";

import { AppShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VoiceEditor } from "@/components/knowledge/VoiceEditor";
import { newId } from "@/lib/prayer/compiler";
import {
  GROUP_LABELS,
  GROUP_ORDER,
  LINK_PLATFORM_LABELS,
  STATUS_STEPS,
  VOICE_LABEL,
  VOICE_LABEL_SINGULAR,
  byStatusThenRecent,
  groupOf,
  isEmptyDraftVoice,
  isScriptureProgram,
  knowledgeSubtitle,
  voiceSubtitle,
  type KnowledgeGroup,
} from "@/lib/prayer/knowledge";
import { useApp } from "@/lib/prayer/store";

export const Route = createFileRoute("/formation")({
  validateSearch: (search: Record<string, unknown>): { add?: boolean } =>
    search["add"] === "1" || search["add"] === true ? { add: true } : {},
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

function KnowledgePage() {
  const {
    db,
    setKnowledgeStatus,
    deleteKnowledgeItem,
    toggleContentLinkFavorite,
    deleteVoice,
    toggleChannelFavorite,
    upsertVoice,
  } = useApp();
  const { add } = Route.useSearch();
  const navigate = useNavigate();

  const [tab, setTab] = useState<"add" | "library">(add ? "add" : "library");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [draftVoiceId, setDraftVoiceId] = useState<string | null>(null);

  const items = db.knowledge_items;
  const voices = db.voices;

  // The Add tab IS a Voice form: create a fresh draft to edit in place.
  useEffect(() => {
    if (tab === "add" && !draftVoiceId) {
      const id = newId("voice");
      upsertVoice({ id, name: "", kind: "individual", created_at: new Date().toISOString() });
      setDraftVoiceId(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, draftVoiceId]);

  function leaveAdd() {
    if (draftVoiceId && isEmptyDraftVoice(db.voices, db.knowledge_items, draftVoiceId))
      deleteVoice(draftVoiceId);
    setDraftVoiceId(null);
  }
  function goTab(next: "add" | "library") {
    if (tab === "add" && next !== "add") leaveAdd();
    setTab(next);
  }

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
    () =>
      filter === "all" || filter === "voice" ? voices.filter((v) => v.id !== draftVoiceId) : [],
    [voices, filter, draftVoiceId],
  );
  const orphanCount = useMemo(() => items.filter((i) => !i.voice_id).length, [items]);
  const showGeneral = (filter === "all" || filter === "voice") && orphanCount > 0;

  return (
    <AppShell
      title="Knowledge"
      subtitle={`The ${VOICE_LABEL.toLowerCase()} you follow and the content that forms you`}
      back={{ to: "/more", label: "More" }}
    >
      <Tabs value={tab} onValueChange={(v) => goTab(v as "add" | "library")}>
        <TabsList className="mb-4 grid w-full grid-cols-2">
          <TabsTrigger value="add">Add</TabsTrigger>
          <TabsTrigger value="library">Library</TabsTrigger>
        </TabsList>

        {/* ADD — a Voice and its content, all in one form ------------------ */}
        <TabsContent value="add" className="mt-0">
          {draftVoiceId ? <VoiceEditor voiceId={draftVoiceId} /> : null}
          <Button className="mt-4 h-11 w-full" onClick={() => goTab("library")}>
            Done
          </Button>
          <p className="mt-2 text-center text-[11px] text-muted-foreground">
            Add the {VOICE_LABEL_SINGULAR.toLowerCase()}&apos;s channels and content above. An empty{" "}
            {VOICE_LABEL_SINGULAR.toLowerCase()} is discarded.
          </p>
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
            <p className="text-sm text-muted-foreground">
              Nothing here yet — add a {VOICE_LABEL_SINGULAR.toLowerCase()} from the Add tab.
            </p>
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
                      {v.name || "Untitled"}
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
                  <RowMenu
                    onEdit={() =>
                      navigate({
                        to: "/voice/$voiceId",
                        params: { voiceId: v.id },
                        search: { edit: true },
                      })
                    }
                    onDelete={() => deleteVoice(v.id)}
                  />
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
                      {isScriptureProgram(item) ? (
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
                    onEdit={() =>
                      navigate({
                        to: "/knowledge/$knowledgeId",
                        params: { knowledgeId: item.id },
                        search: { edit: true },
                      })
                    }
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
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={onDelete}>
          <Trash2 className="size-4" aria-hidden /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
