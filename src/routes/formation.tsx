import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ExternalLink, MoreVertical, Pencil, Plus, Star, Trash2, UserPlus } from "lucide-react";

import { AppShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
    addKnowledgeItem,
  } = useApp();
  const navigate = useNavigate();

  const [filter, setFilter] = useState<FilterKey>("all");

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
  const orphanCount = useMemo(() => items.filter((i) => !i.voice_id).length, [items]);
  const showGeneral = (filter === "all" || filter === "voice") && orphanCount > 0;

  // Adding = create the record, then open it on its own page in edit mode
  // (mirrors editing — one surface per record type).
  function newVoice() {
    const id = newId("voice");
    upsertVoice({
      id,
      name: "New voice",
      kind: "individual",
      created_at: new Date().toISOString(),
    });
    navigate({ to: "/voice/$voiceId", params: { voiceId: id }, search: { edit: true } });
  }
  function newContent() {
    const id = newId("know");
    addKnowledgeItem({
      id,
      title: "New item",
      category: "post",
      status: "not_started",
      created_at: new Date().toISOString(),
    });
    navigate({
      to: "/knowledge/$knowledgeId",
      params: { knowledgeId: id },
      search: { edit: true },
    });
  }

  const addMenu = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="secondary" className="size-9" aria-label="Add">
          <Plus className="size-4" aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={newVoice}>
          <UserPlus className="size-4" aria-hidden /> New {VOICE_LABEL_SINGULAR.toLowerCase()}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={newContent}>
          <Plus className="size-4" aria-hidden /> New content
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <AppShell
      title="Knowledge"
      subtitle={`The ${VOICE_LABEL.toLowerCase()} you follow and the content that forms you`}
      back={{ to: "/more", label: "More" }}
      action={addMenu}
    >
      <div>
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
            Nothing here yet — add a {VOICE_LABEL_SINGULAR.toLowerCase()} or content with the +
            above.
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
      </div>
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
