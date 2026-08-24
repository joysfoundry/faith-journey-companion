import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { ExternalLink, Plus, Star, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CATEGORY_LABELS,
  CATEGORY_OPTIONS,
  LINK_PLATFORM_LABELS,
  LINK_PLATFORM_OPTIONS,
  STATUS_STEPS,
  VOICE_KIND_LABELS,
  VOICE_KIND_OPTIONS,
  byStatusThenRecent,
  channelLabel,
  channelOf,
  contentTitle,
  detectPlatform,
} from "@/lib/prayer/knowledge";
import { newId } from "@/lib/prayer/compiler";
import { useApp } from "@/lib/prayer/store";
import type { Channel, KnowledgeCategory, LinkPlatform, Voice } from "@/lib/prayer/types";

/**
 * The editable body of a Voice — its name/kind, a Channels table, and a Content
 * table (both with inline add). Shared by the Voice hub's edit mode and the
 * Knowledge "Add" tab so adding and editing are the same form.
 */
export function VoiceEditor({ voiceId }: { voiceId: string }) {
  const {
    db,
    upsertVoice,
    toggleChannelFavorite,
    addKnowledgeItem,
    setKnowledgeStatus,
    deleteKnowledgeItem,
    toggleContentLinkFavorite,
  } = useApp();

  const [chanPlatform, setChanPlatform] = useState<LinkPlatform>("instagram");
  const [chanUrl, setChanUrl] = useState("");
  const [addTitle, setAddTitle] = useState("");
  const [addCategory, setAddCategory] = useState<KnowledgeCategory>("post");
  const [addUrl, setAddUrl] = useState("");

  const voice = db.voices.find((v) => v.id === voiceId);
  if (!voice) return null;

  const channels = voice.channels ?? [];
  const content = db.knowledge_items
    .filter((i) => i.voice_id === voice.id)
    .sort(byStatusThenRecent);

  const save = (patch: Partial<Voice>) => upsertVoice({ ...voice, ...patch });

  function addChannel() {
    if (!chanUrl.trim()) return;
    save({
      channels: [...channels, { id: newId("chan"), platform: chanPlatform, url: chanUrl.trim() }],
    });
    setChanUrl("");
    setChanPlatform("instagram");
  }
  const updateChannel = (id: string, patch: Partial<Channel>) =>
    save({ channels: channels.map((c) => (c.id === id ? { ...c, ...patch } : c)) });

  function addContent() {
    if (!addTitle.trim()) return;
    const isQ = addCategory === "quote";
    addKnowledgeItem({
      id: newId("know"),
      // A quote's text lives in `body`, not a title, and carries no link.
      title: isQ ? "" : addTitle.trim(),
      body: isQ ? addTitle.trim() : undefined,
      category: addCategory,
      voice_id: voice!.id,
      links:
        !isQ && addUrl.trim()
          ? [{ platform: detectPlatform(addUrl), url: addUrl.trim() }]
          : undefined,
      status: "not_started",
      created_at: new Date().toISOString(),
    });
    setAddTitle("");
    setAddUrl("");
    setAddCategory("post");
  }

  return (
    <div className="space-y-5">
      {/* Name + kind */}
      <section className="soft-card space-y-3 p-4">
        <div className="space-y-1">
          <label className="text-xs uppercase tracking-wide text-muted-foreground">Name</label>
          <Input
            value={voice.name}
            onChange={(e) => save({ name: e.target.value })}
            placeholder="Name (person, organization, or ministry)"
            className="h-10"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs uppercase tracking-wide text-muted-foreground">Kind</label>
          <select
            value={voice.kind}
            onChange={(e) => save({ kind: e.target.value as Voice["kind"] })}
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

      {/* Channels */}
      <section className="space-y-2">
        <h2 className="eyebrow">Channels</h2>
        <div className="overflow-hidden rounded-lg border border-border/60">
          {channels.length === 0 ? (
            <p className="px-4 py-3 text-sm text-muted-foreground">
              No channels yet — add one below.
            </p>
          ) : (
            <ul className="divide-y divide-border/60">
              {channels.map((c) => (
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
                    onClick={() => toggleChannelFavorite(voice.id, c.id)}
                    aria-label={c.favorite ? "Unpin from Home" : "Pin to Home"}
                    className="shrink-0 p-1"
                  >
                    <Star
                      className={`size-4 ${c.favorite ? "fill-primary text-primary" : "text-muted-foreground"}`}
                      aria-hidden
                    />
                  </button>
                  <button
                    onClick={() => save({ channels: channels.filter((x) => x.id !== c.id) })}
                    aria-label="Remove channel"
                    className="shrink-0 p-1 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="size-4" aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
          )}
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
        </div>
      </section>

      {/* Content */}
      <section className="space-y-2">
        <h2 className="eyebrow">Content</h2>
        <div className="overflow-hidden rounded-lg border border-border/60">
          {content.length === 0 ? (
            <p className="px-4 py-3 text-sm text-muted-foreground">
              Nothing saved yet — add a book, post, or article below.
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
                        {contentTitle(item)}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {CATEGORY_LABELS[item.category]}
                        {channelOf(item, voice)
                          ? ` · from ${channelLabel(channelOf(item, voice)!)}`
                          : ""}
                      </p>
                      {item.links?.length ? (
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
                    </div>
                    <button
                      onClick={() => deleteKnowledgeItem(item.id)}
                      aria-label="Remove"
                      className="shrink-0 p-1 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="size-4" aria-hidden />
                    </button>
                  </div>
                  <div className="mt-1.5 flex flex-wrap gap-1">
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
                </li>
              ))}
            </ul>
          )}
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
                placeholder={addCategory === "quote" ? "Quote" : "Title"}
                className="h-9"
              />
            </div>
            <div className="flex items-center gap-2">
              {addCategory === "quote" ? (
                <span className="flex-1 text-[11px] text-muted-foreground">
                  A quote needs no link — add the wording above.
                </span>
              ) : (
                <Input
                  value={addUrl}
                  onChange={(e) => setAddUrl(e.target.value)}
                  placeholder="Link (optional)"
                  className="h-9"
                />
              )}
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
        </div>
      </section>
    </div>
  );
}
