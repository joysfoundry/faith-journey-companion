import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  Check,
  ExternalLink,
  MoreVertical,
  NotebookPen,
  Pencil,
  Plus,
  Star,
  Trash2,
  UserPlus,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  channelLabel,
  channelOf,
  contentTitle,
  detectCategory,
  detectPlatform,
  isQuote,
  isScriptureProgram,
  matchVoice,
  quoteBody,
  voiceFromLink,
} from "@/lib/prayer/knowledge";
import { newId } from "@/lib/prayer/compiler";
import { useApp } from "@/lib/prayer/store";
import type { KnowledgeCategory, KnowledgeItem, LinkPlatform } from "@/lib/prayer/types";

export const Route = createFileRoute("/knowledge/$knowledgeId")({
  validateSearch: (s: Record<string, unknown>): { edit?: boolean } =>
    s["edit"] === true || s["edit"] === "1" ? { edit: true } : {},
  head: () => ({
    meta: [
      { title: "Knowledge — Faith Journey" },
      { name: "description", content: "A book, program, post, or other content in your library." },
    ],
  }),
  component: KnowledgeRecordPage,
});

function KnowledgeRecordPage() {
  const { knowledgeId } = Route.useParams();
  const { edit } = Route.useSearch();
  const {
    db,
    ready,
    updateKnowledgeItem,
    setKnowledgeStatus,
    toggleContentLinkFavorite,
    deleteKnowledgeItem,
    upsertVoice,
  } = useApp();
  const navigate = useNavigate();

  const [editing, setEditing] = useState(!!edit);
  const [tagsDraft, setTagsDraft] = useState<string | null>(null);
  const [newVoiceName, setNewVoiceName] = useState("");

  if (!ready) {
    return (
      <AppShell title="Knowledge" back={{ to: "/formation", label: "Knowledge" }}>
        <p className="text-sm text-muted-foreground">Loading…</p>
      </AppShell>
    );
  }

  const item = db.knowledge_items.find((i) => i.id === knowledgeId);
  if (!item) {
    return (
      <AppShell title="Knowledge" back={{ to: "/formation", label: "Knowledge" }}>
        <p className="text-sm text-muted-foreground">This item isn&apos;t in your library.</p>
      </AppShell>
    );
  }

  const voices = db.voices;
  const voice = item.voice_id ? voices.find((v) => v.id === item.voice_id) : undefined;
  const channel = channelOf(item, voice);
  const links = item.links ?? [];

  function save(patch: Partial<KnowledgeItem>) {
    if (item) updateKnowledgeItem({ ...item, ...patch });
  }

  function updateLink(i: number, patch: Partial<(typeof links)[number]>) {
    save({ links: links.map((l, idx) => (idx === i ? { ...l, ...patch } : l)) });
  }
  function onLinkUrlChange(i: number, url: string) {
    const next = links.map((l, idx) =>
      idx === i
        ? { ...l, url, ...(url.trim() && !l.url.trim() ? { platform: detectPlatform(url) } : {}) }
        : l,
    );
    // First link can auto-attribute a Voice (if none set yet).
    let patch: Partial<KnowledgeItem> = { links: next };
    if (i === 0 && !item!.voice_id) {
      const m = matchVoice(url, voices);
      if (m) patch = { ...patch, voice_id: m.voice.id, channel_id: m.channel.id };
    }
    save(patch);
  }

  function createVoiceFromUrl(url: string) {
    const seed = voiceFromLink(url);
    const id = newId("voice");
    const chanId = newId("chan");
    upsertVoice({
      id,
      name: seed.name,
      kind: seed.kind,
      channels: [{ id: chanId, platform: seed.platform, url: url.trim() }],
      created_at: new Date().toISOString(),
    });
    save({ voice_id: id, channel_id: chanId });
  }
  function createVoiceByName() {
    if (!newVoiceName.trim()) return;
    const id = newId("voice");
    upsertVoice({
      id,
      name: newVoiceName.trim(),
      kind: "individual",
      created_at: new Date().toISOString(),
    });
    save({ voice_id: id, channel_id: undefined });
    setNewVoiceName("");
  }

  const firstUrl = links[0]?.url ?? "";
  const voiceMatch = !item.voice_id ? matchVoice(firstUrl, voices) : undefined;

  const menu = (
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
            deleteKnowledgeItem(item.id);
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
    <AppShell
      title={contentTitle(item)}
      back={{ to: "/formation", label: "Knowledge" }}
      action={menu}
    >
      <div className="space-y-4">
        {editing ? (
          <>
            {/* Type */}
            <div className="space-y-1">
              <label className="text-xs uppercase tracking-wide text-muted-foreground">Type</label>
              <select
                value={item.category}
                onChange={(e) => save({ category: e.target.value as KnowledgeCategory })}
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
            {isQuote(item) ? (
              <Textarea
                value={item.body ?? ""}
                onChange={(e) => save({ body: e.target.value || undefined })}
                placeholder="The quote"
                rows={4}
              />
            ) : (
              <Input
                value={item.title}
                onChange={(e) => save({ title: e.target.value })}
                placeholder="Title"
                className="h-10"
              />
            )}

            {/* Links */}
            {!isQuote(item) ? (
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wide text-muted-foreground">
                  Links — where to find it
                </label>
                {links.map((l, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <select
                      value={l.platform}
                      onChange={(e) => updateLink(i, { platform: e.target.value as LinkPlatform })}
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
                      value={l.url}
                      onChange={(e) => onLinkUrlChange(i, e.target.value)}
                      placeholder="https://…"
                      className="h-9"
                    />
                    <button
                      onClick={() => toggleContentLinkFavorite(item.id, i)}
                      aria-label={l.favorite ? "Unpin from Home" : "Pin to Home"}
                      className="shrink-0 p-1"
                    >
                      <Star
                        className={`size-4 ${l.favorite ? "fill-primary text-primary" : "text-muted-foreground"}`}
                        aria-hidden
                      />
                    </button>
                    <button
                      onClick={() => save({ links: links.filter((_, idx) => idx !== i) })}
                      aria-label="Remove link"
                      className="shrink-0 p-1 text-muted-foreground hover:text-destructive"
                    >
                      <X className="size-4" aria-hidden />
                    </button>
                  </div>
                ))}
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => save({ links: [...links, { platform: "website", url: "" }] })}
                  className="gap-1.5"
                >
                  <Plus className="size-4" aria-hidden /> Add a link
                </Button>
              </div>
            ) : null}

            {/* Voice (author) */}
            <div className="space-y-2 rounded-md border border-border/70 bg-muted/30 p-3">
              <label className="text-xs uppercase tracking-wide text-muted-foreground">
                Voice (author)
              </label>
              <select
                value={item.voice_id ?? ""}
                onChange={(e) =>
                  save({ voice_id: e.target.value || undefined, channel_id: undefined })
                }
                aria-label="Voice"
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">— None —</option>
                {voices.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({VOICE_KIND_LABELS[v.kind].toLowerCase()})
                  </option>
                ))}
              </select>
              {voice && (voice.channels?.length ?? 0) > 0 ? (
                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-wide text-muted-foreground">
                    From which channel
                  </label>
                  <select
                    value={item.channel_id ?? ""}
                    onChange={(e) => save({ channel_id: e.target.value || undefined })}
                    aria-label="Channel"
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="">— Not specified —</option>
                    {voice.channels!.map((c) => (
                      <option key={c.id} value={c.id}>
                        {channelLabel(c)}
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}
              {voiceMatch ? (
                <button
                  type="button"
                  onClick={() =>
                    save({ voice_id: voiceMatch.voice.id, channel_id: voiceMatch.channel.id })
                  }
                  className="text-xs text-primary hover:underline"
                >
                  Link to “{voiceMatch.voice.name}” — matched from the URL
                </button>
              ) : null}
              {!item.voice_id && !voiceMatch && firstUrl.trim() ? (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => createVoiceFromUrl(firstUrl)}
                  className="gap-1.5"
                >
                  <UserPlus className="size-4" aria-hidden /> Create a voice from this link
                </Button>
              ) : null}
              <div className="flex items-center gap-2 pt-1">
                <Input
                  value={newVoiceName}
                  onChange={(e) => setNewVoiceName(e.target.value)}
                  placeholder="New voice by name (e.g. an author)"
                  className="h-9"
                />
                <Button
                  size="icon"
                  variant="secondary"
                  className="size-9 shrink-0"
                  aria-label="Add voice"
                  onClick={createVoiceByName}
                  disabled={!newVoiceName.trim()}
                >
                  <UserPlus className="size-4" aria-hidden />
                </Button>
              </div>
            </div>

            <Input
              value={item.source ?? ""}
              onChange={(e) => save({ source: e.target.value || undefined })}
              placeholder="Publisher / platform (optional)"
              className="h-10"
            />
            <Input
              value={tagsDraft ?? (item.tags ?? []).join(", ")}
              onChange={(e) => setTagsDraft(e.target.value)}
              onBlur={() => {
                if (tagsDraft === null) return;
                const list = tagsDraft
                  .split(",")
                  .map((t) => t.trim().replace(/^#/, ""))
                  .filter(Boolean);
                save({ tags: list.length ? list : undefined });
                setTagsDraft(null);
              }}
              placeholder="Tags (comma-separated) — praying, becomingcatholic"
              className="h-10"
            />
            <Textarea
              value={item.notes ?? ""}
              onChange={(e) => save({ notes: e.target.value || undefined })}
              placeholder="Notes (optional)"
              rows={2}
            />
          </>
        ) : (
          <>
            {/* VIEW */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs text-muted-foreground">
                {CATEGORY_LABELS[item.category]}
              </span>
              {isScriptureProgram(item) ? (
                <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs text-muted-foreground">
                  Word
                </span>
              ) : null}
              {item.source ? (
                <span className="text-xs text-muted-foreground">{item.source}</span>
              ) : null}
            </div>

            {isQuote(item) ? (
              <blockquote className="border-l-2 border-primary/40 pl-4 text-lg italic leading-relaxed text-foreground">
                &ldquo;{quoteBody(item)}&rdquo;
              </blockquote>
            ) : null}

            {voice ? (
              <p className="text-sm text-muted-foreground">
                by{" "}
                <Link
                  to="/voice/$voiceId"
                  params={{ voiceId: voice.id }}
                  className="text-primary underline"
                >
                  {voice.name}
                </Link>
                <span className="text-xs"> · {VOICE_KIND_LABELS[voice.kind]}</span>
                {channel ? <span className="text-xs"> · from {channelLabel(channel)}</span> : null}
              </p>
            ) : item.creator ? (
              <p className="text-sm text-muted-foreground">by {item.creator}</p>
            ) : null}

            {links.length ? (
              <section className="soft-card p-4">
                <p className="eyebrow">Where to find it</p>
                <ul className="mt-2 space-y-2">
                  {links.map((link, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex min-w-0 flex-1 items-center justify-between gap-2 rounded-lg border border-border/70 p-3 transition-colors hover:border-primary/50"
                      >
                        <span className="min-w-0">
                          <span className="block text-sm font-medium">
                            {link.label || LINK_PLATFORM_LABELS[link.platform]}
                          </span>
                          <span className="block truncate text-xs text-muted-foreground">
                            {link.url}
                          </span>
                        </span>
                        <ExternalLink
                          className="size-4 shrink-0 text-muted-foreground"
                          aria-hidden
                        />
                      </a>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-9 shrink-0"
                        aria-label={link.favorite ? "Unpin from Home" : "Pin to Home"}
                        onClick={() => toggleContentLinkFavorite(item.id, i)}
                      >
                        <Star
                          className={`size-4 ${link.favorite ? "fill-primary text-primary" : "text-muted-foreground"}`}
                          aria-hidden
                        />
                      </Button>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {item.tags?.length ? (
              <div className="flex flex-wrap gap-1.5">
                {item.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-border px-2.5 py-0.5 text-xs text-muted-foreground"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            ) : null}

            {item.notes ? (
              <article className="soft-card p-4">
                <p className="eyebrow">Notes</p>
                <p className="mt-1 whitespace-pre-line text-sm">{item.notes}</p>
              </article>
            ) : null}
          </>
        )}

        {/* Status — available in both modes (a quote has no progress) */}
        {!isQuote(item) ? (
          <div className="flex flex-wrap gap-1.5">
            {STATUS_STEPS.map((s) => (
              <button
                key={s.key}
                onClick={() => setKnowledgeStatus(item.id, s.key)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
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

        <Button asChild variant="secondary" className="h-11 w-full">
          <Link to="/reflections">
            <NotebookPen className="size-4" /> Reflect on this
          </Link>
        </Button>
      </div>
    </AppShell>
  );
}
