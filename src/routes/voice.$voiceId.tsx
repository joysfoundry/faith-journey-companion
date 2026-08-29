import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Check, ExternalLink, MoreVertical, Pencil, Plus, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { ExternalLink as ExtLink } from "@/components/ui/external-link";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { VoiceEditor } from "@/components/knowledge/VoiceEditor";
import {
  CATEGORY_LABELS,
  CATEGORY_OPTIONS,
  LINK_PLATFORM_LABELS,
  SECTION_LABEL,
  STATUS_STEPS,
  VOICE_KIND_LABELS,
  VOICE_LABEL_SINGULAR,
  byStatusThenRecent,
  detectPlatform,
  voiceSubtitle,
} from "@/lib/prayer/knowledge";
import { newId } from "@/lib/prayer/compiler";
import { useApp } from "@/lib/prayer/store";
import type { KnowledgeCategory, Voice } from "@/lib/prayer/types";

export const Route = createFileRoute("/voice/$voiceId")({
  validateSearch: (s: Record<string, unknown>): { edit?: boolean } =>
    s["edit"] === true || s["edit"] === "1" ? { edit: true } : {},
  head: () => ({
    meta: [
      { title: `${VOICE_LABEL_SINGULAR} — ACTS` },
      { name: "description", content: "A person, organization, or ministry you follow." },
    ],
  }),
  component: VoiceHubPage,
});

const GENERAL_ID = "general";

function VoiceHubPage() {
  const { voiceId } = Route.useParams();
  const { edit } = Route.useSearch();
  const {
    db,
    ready,
    deleteVoice,
    toggleChannelFavorite,
    addKnowledgeItem,
    setKnowledgeStatus,
    deleteKnowledgeItem,
    toggleContentLinkFavorite,
  } = useApp();
  const navigate = useNavigate();

  const [editing, setEditing] = useState(!!edit);
  const [addTitle, setAddTitle] = useState("");
  const [addCategory, setAddCategory] = useState<KnowledgeCategory>("post");
  const [addUrl, setAddUrl] = useState("");

  if (!ready) {
    return (
      <AppShell title={VOICE_LABEL_SINGULAR} back={{ to: "/formation", label: SECTION_LABEL }}>
        <p className="text-sm text-muted-foreground">Loading…</p>
      </AppShell>
    );
  }

  const isGeneral = voiceId === GENERAL_ID;
  const voice: Voice | undefined = isGeneral ? undefined : db.voices.find((v) => v.id === voiceId);

  if (!isGeneral && !voice) {
    return (
      <AppShell title={VOICE_LABEL_SINGULAR} back={{ to: "/formation", label: SECTION_LABEL }}>
        <p className="text-sm text-muted-foreground">This isn&apos;t in your library.</p>
      </AppShell>
    );
  }

  const name = isGeneral ? "General" : voice!.name;
  const content = db.knowledge_items
    .filter((i) => (isGeneral ? !i.voice_id : i.voice_id === voice!.id))
    .sort(byStatusThenRecent);

  function addGeneralContent() {
    if (!addTitle.trim()) return;
    addKnowledgeItem({
      id: newId("know"),
      title: addTitle.trim(),
      category: addCategory,
      links: addUrl.trim() ? [{ platform: detectPlatform(addUrl), url: addUrl.trim() }] : undefined,
      status: "not_started",
      created_at: new Date().toISOString(),
    });
    setAddTitle("");
    setAddUrl("");
    setAddCategory("post");
  }

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

  // Real Voice, edit mode → the shared editor (same form as the Add tab).
  if (!isGeneral && editing) {
    return (
      <AppShell title={name} back={{ to: "/formation", label: SECTION_LABEL }} action={menu}>
        <VoiceEditor voiceId={voice!.id} />
      </AppShell>
    );
  }

  return (
    <AppShell title={name} back={{ to: "/formation", label: SECTION_LABEL }} action={menu}>
      <div className="space-y-5">
        {isGeneral ? (
          <p className="text-sm text-muted-foreground">
            Content you haven&apos;t attributed to anyone yet — bucketed here.
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">{voiceSubtitle(voice!)}</p>
        )}

        {/* Channels (view) */}
        {!isGeneral && voice!.channels?.length ? (
          <section className="space-y-2">
            <h2 className="eyebrow">Channels</h2>
            <div className="overflow-hidden rounded-lg border border-border/60">
              <ul className="divide-y divide-border/60">
                {voice!.channels.map((c) => (
                  <li key={c.id} className="flex items-center gap-2 px-4 py-3">
                    <ExtLink
                      href={c.url}
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
                      <ExternalLink className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                    </ExtLink>
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
                ))}
              </ul>
            </div>
          </section>
        ) : null}

        {/* Content */}
        <section className="space-y-2">
          <h2 className="eyebrow">{isGeneral ? "Saved content" : `From ${name}`}</h2>
          <div className="overflow-hidden rounded-lg border border-border/60">
            {content.length === 0 ? (
              <p className="px-4 py-3 text-sm text-muted-foreground">Nothing saved yet.</p>
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
                        {item.links?.length ? (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {item.links.map((l, i) => (
                              <span key={i} className="inline-flex items-center">
                                <ExtLink
                                  href={l.url}
                                  className="inline-flex items-center gap-1 rounded-l-full bg-secondary py-0.5 pl-2 pr-1 text-[11px] font-medium text-muted-foreground hover:text-primary"
                                >
                                  {l.label || LINK_PLATFORM_LABELS[l.platform]}
                                  <ExternalLink className="size-3" aria-hidden />
                                </ExtLink>
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
                      {isGeneral ? (
                        <button
                          onClick={() => deleteKnowledgeItem(item.id)}
                          aria-label="Remove"
                          className="shrink-0 p-1 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="size-4" aria-hidden />
                        </button>
                      ) : null}
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
            {/* General lets you add unattributed content inline. */}
            {isGeneral ? (
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
                    onClick={addGeneralContent}
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
