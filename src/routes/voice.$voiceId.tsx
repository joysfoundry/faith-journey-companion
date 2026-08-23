import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Check, ExternalLink, MoreVertical, Pencil, Plus, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CATEGORY_LABELS,
  CATEGORY_OPTIONS,
  LINK_PLATFORM_LABELS,
  LINK_PLATFORM_OPTIONS,
  STATUS_STEPS,
  VOICE_KIND_LABELS,
  VOICE_KIND_OPTIONS,
  byStatusThenRecent,
  detectPlatform,
  voiceSubtitle,
} from "@/lib/prayer/knowledge";
import { newId } from "@/lib/prayer/compiler";
import { useApp } from "@/lib/prayer/store";
import type {
  Channel,
  KnowledgeCategory,
  KnowledgeItem,
  LinkPlatform,
  Voice,
} from "@/lib/prayer/types";

export const Route = createFileRoute("/voice/$voiceId")({
  validateSearch: (s: Record<string, unknown>): { edit?: boolean } =>
    s["edit"] === true || s["edit"] === "1" ? { edit: true } : {},
  head: () => ({
    meta: [
      { title: "Voice — Faith Journey" },
      { name: "description", content: "A person, organization, or ministry you follow." },
    ],
  }),
  component: VoiceHubPage,
});

const GENERAL_ID = "general";

/** Content link chips with per-link pin (shared by view + edit). */
function ContentLinks({ item, onPin }: { item: KnowledgeItem; onPin: (index: number) => void }) {
  if (!item.links?.length) return null;
  return (
    <div className="mt-1 flex flex-wrap gap-1">
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
            onClick={() => onPin(i)}
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
  );
}

function StatusSteps({
  item,
  onSet,
}: {
  item: KnowledgeItem;
  onSet: (s: KnowledgeItem["status"]) => void;
}) {
  return (
    <div className="mt-1.5 flex flex-wrap gap-1">
      {STATUS_STEPS.map((s) => (
        <button
          key={s.key}
          onClick={() => onSet(s.key)}
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
  );
}

function VoiceHubPage() {
  const { voiceId } = Route.useParams();
  const { edit } = Route.useSearch();
  const {
    db,
    ready,
    upsertVoice,
    deleteVoice,
    toggleChannelFavorite,
    addKnowledgeItem,
    setKnowledgeStatus,
    deleteKnowledgeItem,
    toggleContentLinkFavorite,
  } = useApp();
  const navigate = useNavigate();

  const [editing, setEditing] = useState(!!edit);

  // Add-rows (drafts)
  const [chanPlatform, setChanPlatform] = useState<LinkPlatform>("instagram");
  const [chanUrl, setChanUrl] = useState("");
  const [addTitle, setAddTitle] = useState("");
  const [addCategory, setAddCategory] = useState<KnowledgeCategory>("post");
  const [addUrl, setAddUrl] = useState("");

  if (!ready) {
    return (
      <AppShell title="Voice" back={{ to: "/formation", label: "Knowledge" }}>
        <p className="text-sm text-muted-foreground">Loading…</p>
      </AppShell>
    );
  }

  const isGeneral = voiceId === GENERAL_ID;
  const voice: Voice | undefined = isGeneral ? undefined : db.voices.find((v) => v.id === voiceId);

  if (!isGeneral && !voice) {
    return (
      <AppShell title="Voice" back={{ to: "/formation", label: "Knowledge" }}>
        <p className="text-sm text-muted-foreground">This isn&apos;t in your library.</p>
      </AppShell>
    );
  }

  const name = isGeneral ? "General" : voice!.name;
  const channels = voice?.channels ?? [];
  const content = db.knowledge_items
    .filter((i) => (isGeneral ? !i.voice_id : i.voice_id === voice!.id))
    .sort(byStatusThenRecent);

  function saveVoice(patch: Partial<Voice>) {
    if (!voice) return;
    upsertVoice({ ...voice, ...patch });
  }

  function addChannel() {
    if (!voice || !chanUrl.trim()) return;
    saveVoice({
      channels: [...channels, { id: newId("chan"), platform: chanPlatform, url: chanUrl.trim() }],
    });
    setChanUrl("");
    setChanPlatform("instagram");
  }

  function updateChannel(id: string, patch: Partial<Channel>) {
    saveVoice({ channels: channels.map((c) => (c.id === id ? { ...c, ...patch } : c)) });
  }

  function addContent() {
    if (!addTitle.trim()) return;
    addKnowledgeItem({
      id: newId("know"),
      title: addTitle.trim(),
      category: addCategory,
      voice_id: isGeneral ? undefined : voice!.id,
      links: addUrl.trim() ? [{ platform: detectPlatform(addUrl), url: addUrl.trim() }] : undefined,
      status: "not_started",
      created_at: new Date().toISOString(),
    });
    setAddTitle("");
    setAddUrl("");
    setAddCategory("post");
  }

  // General is always its simple bucket view; real voices get a view/edit menu.
  const menu = isGeneral ? undefined : (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="secondary" className="size-9" aria-label="Actions">
          <MoreVertical className="size-4" aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {editing ? (
          <DropdownMenuItem onClick={() => setEditing(false)}>
            <Check className="size-4" aria-hidden /> Done
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={() => setEditing(true)}>
            <Pencil className="size-4" aria-hidden /> Edit
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onClick={() => {
            deleteVoice(voice!.id);
            toast.success("Removed from your library");
            navigate({ to: "/formation" });
          }}
        >
          <Trash2 className="size-4" aria-hidden /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <AppShell title={name} back={{ to: "/formation", label: "Knowledge" }} action={menu}>
      <div className="space-y-5">
        {/* Voice header */}
        {isGeneral ? (
          <p className="text-sm text-muted-foreground">
            Content you haven&apos;t attributed to anyone yet — bucketed here.
          </p>
        ) : editing ? (
          <section className="soft-card space-y-3 p-4">
            <div className="space-y-1">
              <label className="text-xs uppercase tracking-wide text-muted-foreground">Name</label>
              <Input
                value={voice!.name}
                onChange={(e) => saveVoice({ name: e.target.value })}
                className="h-10"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs uppercase tracking-wide text-muted-foreground">Kind</label>
              <select
                value={voice!.kind}
                onChange={(e) => saveVoice({ kind: e.target.value as Voice["kind"] })}
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
          </section>
        ) : (
          <p className="text-sm text-muted-foreground">{voiceSubtitle(voice!)}</p>
        )}

        {/* Channels */}
        {!isGeneral ? (
          <section className="space-y-2">
            <h2 className="eyebrow">Channels</h2>
            <div className="overflow-hidden rounded-lg border border-border/60">
              {channels.length === 0 ? (
                <p className="px-4 py-3 text-sm text-muted-foreground">
                  {editing ? "No channels yet — add one below." : "No channels."}
                </p>
              ) : (
                <ul className="divide-y divide-border/60">
                  {channels.map((c) =>
                    editing ? (
                      <li key={c.id} className="flex items-center gap-2 px-3 py-2">
                        <select
                          value={c.platform}
                          onChange={(e) =>
                            updateChannel(c.id, { platform: e.target.value as LinkPlatform })
                          }
                          aria-label="Platform"
                          className="h-9 shrink-0 rounded-md border border-input bg-background px-2 text-sm"
                        >
                          {LINK_PLATFORM_OPTIONS.map((p) => (
                            <option key={p} value={p}>
                              {LINK_PLATFORM_LABELS[p]}
                            </option>
                          ))}
                        </select>
                        <Input
                          value={c.url}
                          onChange={(e) => updateChannel(c.id, { url: e.target.value })}
                          placeholder="https://…"
                          className="h-9"
                        />
                        <button
                          onClick={() => toggleChannelFavorite(voice!.id, c.id)}
                          aria-label={c.favorite ? "Unpin from Home" : "Pin to Home"}
                          className="shrink-0 p-1"
                        >
                          <Star
                            className={`size-4 ${c.favorite ? "fill-primary text-primary" : "text-muted-foreground"}`}
                            aria-hidden
                          />
                        </button>
                        <button
                          onClick={() =>
                            saveVoice({ channels: channels.filter((x) => x.id !== c.id) })
                          }
                          aria-label="Remove channel"
                          className="shrink-0 p-1 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="size-4" aria-hidden />
                        </button>
                      </li>
                    ) : (
                      <li key={c.id} className="flex items-center gap-2 px-4 py-3">
                        <a
                          href={c.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex min-w-0 flex-1 items-center justify-between gap-2 transition-colors hover:text-primary"
                        >
                          <span className="min-w-0">
                            <span className="block text-sm font-medium">
                              {c.label || LINK_PLATFORM_LABELS[c.platform]}
                            </span>
                            <span className="block truncate text-xs text-muted-foreground">
                              {c.url}
                            </span>
                          </span>
                          <ExternalLink
                            className="size-4 shrink-0 text-muted-foreground"
                            aria-hidden
                          />
                        </a>
                        <button
                          onClick={() => toggleChannelFavorite(voice!.id, c.id)}
                          aria-label={c.favorite ? "Unpin from Home" : "Pin to Home"}
                          className="shrink-0 p-1"
                        >
                          <Star
                            className={`size-4 ${c.favorite ? "fill-primary text-primary" : "text-muted-foreground"}`}
                            aria-hidden
                          />
                        </button>
                      </li>
                    ),
                  )}
                </ul>
              )}
              {editing ? (
                <div className="flex items-center gap-2 border-t border-border/60 bg-muted/30 px-3 py-2">
                  <select
                    value={chanPlatform}
                    onChange={(e) => setChanPlatform(e.target.value as LinkPlatform)}
                    aria-label="New channel platform"
                    className="h-9 shrink-0 rounded-md border border-input bg-background px-2 text-sm"
                  >
                    {LINK_PLATFORM_OPTIONS.map((p) => (
                      <option key={p} value={p}>
                        {LINK_PLATFORM_LABELS[p]}
                      </option>
                    ))}
                  </select>
                  <Input
                    value={chanUrl}
                    onChange={(e) => {
                      const u = e.target.value;
                      setChanUrl(u);
                      if (u.trim() && !chanUrl.trim()) setChanPlatform(detectPlatform(u));
                    }}
                    placeholder="https://…"
                    className="h-9"
                  />
                  <Button
                    size="icon"
                    variant="secondary"
                    className="size-9 shrink-0"
                    aria-label="Add channel"
                    onClick={addChannel}
                    disabled={!chanUrl.trim()}
                  >
                    <Plus className="size-4" aria-hidden />
                  </Button>
                </div>
              ) : null}
            </div>
          </section>
        ) : null}

        {/* Content */}
        <section className="space-y-2">
          <h2 className="eyebrow">{isGeneral ? "Saved content" : `From ${name}`}</h2>
          <div className="overflow-hidden rounded-lg border border-border/60">
            {content.length === 0 ? (
              <p className="px-4 py-3 text-sm text-muted-foreground">
                {editing || isGeneral ? "Nothing saved yet — add one below." : "Nothing saved yet."}
              </p>
            ) : (
              <ul className="divide-y divide-border/60">
                {content.map((item) => (
                  <li key={item.id} className="px-3 py-2.5">
                    <div className="flex items-start gap-2">
                      <div className="min-w-0 flex-1">
                        <Link
                          to="/knowledge/$knowledgeId"
                          params={{ knowledgeId: item.id }}
                          className="truncate text-sm font-medium text-foreground hover:text-primary"
                        >
                          {item.title}
                        </Link>
                        <p className="text-xs text-muted-foreground">
                          {CATEGORY_LABELS[item.category]}
                        </p>
                        <ContentLinks
                          item={item}
                          onPin={(i) => toggleContentLinkFavorite(item.id, i)}
                        />
                      </div>
                      {editing || isGeneral ? (
                        <button
                          onClick={() => deleteKnowledgeItem(item.id)}
                          aria-label="Remove"
                          className="shrink-0 p-1 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="size-4" aria-hidden />
                        </button>
                      ) : null}
                    </div>
                    <StatusSteps item={item} onSet={(s) => setKnowledgeStatus(item.id, s)} />
                  </li>
                ))}
              </ul>
            )}
            {editing || isGeneral ? (
              <div className="space-y-2 border-t border-border/60 bg-muted/30 px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <select
                    value={addCategory}
                    onChange={(e) => setAddCategory(e.target.value as KnowledgeCategory)}
                    aria-label="New content type"
                    className="h-9 shrink-0 rounded-md border border-input bg-background px-2 text-sm"
                  >
                    {CATEGORY_OPTIONS.map((c) => (
                      <option key={c} value={c}>
                        {CATEGORY_LABELS[c]}
                      </option>
                    ))}
                  </select>
                  <Input
                    value={addTitle}
                    onChange={(e) => setAddTitle(e.target.value)}
                    placeholder="Title"
                    className="h-9"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    value={addUrl}
                    onChange={(e) => setAddUrl(e.target.value)}
                    placeholder="Link (optional)"
                    className="h-9"
                  />
                  <Button
                    size="icon"
                    variant="secondary"
                    className="size-9 shrink-0"
                    aria-label="Add content"
                    onClick={addContent}
                    disabled={!addTitle.trim()}
                  >
                    <Plus className="size-4" aria-hidden />
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
