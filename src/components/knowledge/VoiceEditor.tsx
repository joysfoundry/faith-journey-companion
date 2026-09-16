import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { ExternalLink, Pin, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ExternalLink as ExtLink } from "@/components/ui/external-link";
import { ScriptureCitationField } from "@/components/knowledge/ScriptureCitationField";
import { ScriptureCitationSaveDialog } from "@/components/knowledge/ScriptureCitationSaveDialog";
import { Input } from "@/components/ui/input";
import {
  CATEGORY_LABELS,
  CATEGORY_OPTIONS,
  CHANNEL_KIND_LABELS,
  CHANNEL_KIND_OPTIONS,
  LINK_PLATFORM_LABELS,
  QUOTE_KIND_LABELS,
  QUOTE_KIND_OPTIONS,
  STATUS_STEPS,
  VOICE_KIND_LABELS,
  VOICE_KIND_OPTIONS,
  byStatusThenTitle,
  channelLabel,
  channelOf,
  channelPrimary,
  contentTitle,
  detectPlatform,
  hasStatus,
  isHandlePlatform,
  kindFromPlatform,
  mediaFromCategory,
} from "@/lib/prayer/knowledge";
import { newId } from "@/lib/prayer/compiler";
import { useApp } from "@/lib/prayer/store";
import type {
  Channel,
  ChannelKind,
  ChannelPlatform,
  KnowledgeCategory,
  LinkPlatform,
  QuoteKind,
  Voice,
} from "@/lib/prayer/types";

/**
 * The editable body of a Voice — its name/kind, a Channels table, and a Content
 * table (both with inline add). Shared by the Voice hub's edit mode and the
 * Knowledge "Add" tab so adding and editing are the same form.
 */
export function VoiceEditor({ voiceId }: { voiceId: string }) {
  const {
    db,
    upsertVoice,
    toggleChannelPin,
    addKnowledgeItem,
    setKnowledgeStatus,
    deleteKnowledgeItem,
    toggleContentLinkPin,
  } = useApp();

  // Kind is the one channel choice the user makes; the platform is detected from
  // the URL (ACTS-204) — no second box to reconcile. undefined = use the kind
  // inferred from the pasted URL; a value = the user's explicit pick.
  const [chanKind, setChanKind] = useState<ChannelKind | undefined>(undefined);
  const [chanLabel, setChanLabel] = useState("");
  const [chanUrl, setChanUrl] = useState("");
  const [addTitle, setAddTitle] = useState("");
  const [addCategory, setAddCategory] = useState<KnowledgeCategory>("post");
  const [addUrl, setAddUrl] = useState("");
  const [addQuoteKind, setAddQuoteKind] = useState<QuoteKind>("open");
  const [addScriptureRef, setAddScriptureRef] = useState("");
  const [addSource, setAddSource] = useState("");
  // Save-time citation check for a scripture quote with no citation (ACTS-196).
  const [citationGuardOpen, setCitationGuardOpen] = useState(false);

  const voice = db.voices.find((v) => v.id === voiceId);
  if (!voice) return null;

  const channels = voice.channels ?? [];
  const content = db.knowledge_items
    .filter((i) => i.voice_id === voice.id)
    .sort(byStatusThenTitle);

  const save = (patch: Partial<Voice>) => upsertVoice({ ...voice, ...patch });

  // The platform detected from the URL being typed — drives the auto kind and the
  // name-field placeholder so the user never picks a platform by hand.
  const chanUrlPlatform = detectPlatform(chanUrl);
  function addChannel() {
    if (!chanUrl.trim()) return;
    const platform = detectPlatform(chanUrl);
    save({
      channels: [
        ...channels,
        {
          id: newId("chan"),
          platforms: [{ platform, url: chanUrl.trim() }],
          kind: chanKind ?? kindFromPlatform(platform),
          label: chanLabel.trim() || undefined,
        },
      ],
    });
    setChanUrl("");
    setChanLabel("");
    setChanKind(undefined);
  }
  /** YouTube stores a channel name; Instagram/TikTok/X/podcast an @username. */
  const chanNamePlaceholder = (p: LinkPlatform) =>
    isHandlePlatform(p) ? "@username" : "Channel name";
  const updateChannel = (id: string, patch: Partial<Channel>) =>
    save({ channels: channels.map((c) => (c.id === id ? { ...c, ...patch } : c)) });

  function addContent(opts?: { refOverride?: string; skipGuard?: boolean }) {
    if (!addTitle.trim()) return;
    const isQ = addCategory === "quote";
    const isScripture = isQ && addQuoteKind === "scripture";
    // The citation being saved — an accepted recommendation can override the field.
    const ref = (opts?.refOverride ?? addScriptureRef).trim();
    // Save-time check (ACTS-196): a scripture quote with no citation would land
    // uncited in the generic "Scripture" group — confirm before saving that way.
    if (isScripture && !ref && !opts?.skipGuard) {
      setCitationGuardOpen(true);
      return;
    }
    // The *who* is the Vessel (named above). A book/article quote also names the
    // *work* — the book title or publication/show — in `source`. A link is
    // optional on every kind except scripture (ACTS-181).
    const quoteTakesLink = isQ && addQuoteKind !== "scripture";
    const quoteTakesSource = isQ && (addQuoteKind === "book" || addQuoteKind === "article");
    // Only attach the draft Vessel this form spins up when it has actually been
    // named — otherwise a hand-added quote would be pinned to an unnamed ghost
    // Vessel. Non-quote content keeps the Vessel-centric flow.
    const voiceId = isQ ? (voice!.name.trim() ? voice!.id : undefined) : voice!.id;
    addKnowledgeItem({
      id: newId("know"),
      // A quote's text lives in `body`, not a title, and carries no link.
      title: isQ ? "" : addTitle.trim(),
      body: isQ ? addTitle.trim() : undefined,
      category: addCategory,
      // ACTS-204: default the media format from the category; editable later.
      media: mediaFromCategory(addCategory),
      quote_kind: isQ ? addQuoteKind : undefined,
      scripture_ref: isScripture ? ref || undefined : undefined,
      source: quoteTakesSource ? addSource.trim() || undefined : undefined,
      voice_id: voiceId,
      links:
        (!isQ || quoteTakesLink) && addUrl.trim()
          ? [{ platform: detectPlatform(addUrl), url: addUrl.trim() }]
          : undefined,
      status: "not_started",
      created_at: new Date().toISOString(),
    });
    setAddTitle("");
    setAddUrl("");
    setAddCategory("post");
    setAddQuoteKind("open");
    setAddScriptureRef("");
    setAddSource("");
    setCitationGuardOpen(false);
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
                <li key={c.id} className="space-y-2 px-3 py-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={c.kind ?? kindFromPlatform(channelPrimary(c)?.platform ?? "other")}
                      onChange={(e) =>
                        updateChannel(c.id, { kind: e.target.value as ChannelKind })
                      }
                      aria-label="Kind"
                      className="h-9 shrink-0 rounded-md border border-input bg-background px-2 text-sm"
                    >
                      {CHANNEL_KIND_OPTIONS.map((k) => (
                        <option key={k} value={k}>
                          {CHANNEL_KIND_LABELS[k]}
                        </option>
                      ))}
                    </select>
                    <Input
                      value={c.label ?? ""}
                      onChange={(e) => updateChannel(c.id, { label: e.target.value })}
                      placeholder={chanNamePlaceholder(channelPrimary(c)?.platform ?? "other")}
                      aria-label="Channel name"
                      className="h-9 min-w-[8rem] flex-1"
                    />
                    <button
                      onClick={() => toggleChannelPin(voice.id, c.id)}
                      aria-label={c.pinned ? "Unpin from Home" : "Pin to Home"}
                      className="shrink-0 p-1"
                    >
                      <Pin
                        className={`size-4 ${c.pinned ? "fill-primary text-primary" : "text-muted-foreground"}`}
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
                  </div>
                  {/* Where this show is distributed — one or more platforms
                      (app + YouTube + Spotify). Platform auto-detected per URL. */}
                  <div className="space-y-1.5">
                    {c.platforms.map((p, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Input
                          value={p.url}
                          onChange={(e) => {
                            const url = e.target.value;
                            const platforms = c.platforms.map((pp, j) =>
                              j === i ? { platform: detectPlatform(url), url } : pp,
                            );
                            updateChannel(c.id, { platforms });
                          }}
                          placeholder="https://…"
                          aria-label="Platform link"
                          className="h-9 flex-1"
                        />
                        <span className="w-16 shrink-0 text-right text-xs text-muted-foreground">
                          {p.url ? LINK_PLATFORM_LABELS[p.platform] : ""}
                        </span>
                        <button
                          onClick={() =>
                            updateChannel(c.id, {
                              platforms: c.platforms.filter((_, j) => j !== i),
                            })
                          }
                          disabled={c.platforms.length <= 1}
                          aria-label="Remove platform"
                          className="shrink-0 p-1 text-muted-foreground hover:text-destructive disabled:opacity-30"
                        >
                          <Trash2 className="size-3.5" aria-hidden />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() =>
                        updateChannel(c.id, {
                          platforms: [...c.platforms, { platform: "other", url: "" }],
                        })
                      }
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      + Add another platform
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <div className="space-y-2 border-t border-border/60 bg-muted/30 px-3 py-2">
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={chanKind ?? kindFromPlatform(chanUrlPlatform)}
                onChange={(e) => setChanKind(e.target.value as ChannelKind)}
                aria-label="New channel kind"
                className="h-9 shrink-0 rounded-md border border-input bg-background px-2 text-sm"
              >
                {CHANNEL_KIND_OPTIONS.map((k) => (
                  <option key={k} value={k}>
                    {CHANNEL_KIND_LABELS[k]}
                  </option>
                ))}
              </select>
              <Input
                value={chanLabel}
                onChange={(e) => setChanLabel(e.target.value)}
                placeholder={chanNamePlaceholder(chanUrlPlatform)}
                aria-label="New channel name"
                className="h-9 min-w-[8rem] flex-1"
              />
            </div>
            <div className="flex items-center gap-2">
              <Input
                value={chanUrl}
                onChange={(e) => setChanUrl(e.target.value)}
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
            {chanUrl.trim() ? (
              <p className="text-xs text-muted-foreground">
                On {LINK_PLATFORM_LABELS[chanUrlPlatform]} — detected from the link
              </p>
            ) : null}
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
                              <ExtLink
                                href={l.url}
                                className="inline-flex items-center gap-1 rounded-l-full bg-secondary py-0.5 pl-2 pr-1 text-[11px] font-medium text-muted-foreground hover:text-primary"
                              >
                                {l.label || LINK_PLATFORM_LABELS[l.platform]}
                                <ExternalLink className="size-3" aria-hidden />
                              </ExtLink>
                              <button
                                onClick={() => toggleContentLinkPin(item.id, i)}
                                aria-label={l.pinned ? "Unpin from Home" : "Pin to Home"}
                                className="rounded-r-full bg-secondary py-0.5 pl-1 pr-2"
                              >
                                <Pin
                                  className={`size-3 ${l.pinned ? "fill-primary text-primary" : "text-muted-foreground"}`}
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
                  {/* Only completable content carries status — references
                      (article/post/quote) and containers never do (ACTS-204). */}
                  {hasStatus(item.category) ? (
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
                  ) : null}
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
                placeholder={
                  addCategory === "quote"
                    ? addQuoteKind === "scripture"
                      ? "The passage"
                      : "Quote"
                    : "Title"
                }
                className="h-9"
              />
            </div>
            {/* Quote kind chooser (ACTS-181) — what sort of passage this is. */}
            {addCategory === "quote" ? (
              <div className="flex flex-wrap gap-1">
                {QUOTE_KIND_OPTIONS.map((k) => (
                  <button
                    key={k}
                    type="button"
                    aria-pressed={addQuoteKind === k}
                    onClick={() => setAddQuoteKind(k)}
                    className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${
                      addQuoteKind === k
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {QUOTE_KIND_LABELS[k]}
                  </button>
                ))}
              </div>
            ) : null}
            {/* The *work* — a book title or a publication/show. The *who* (author)
                is the Vessel named above. Scripture uses its citation instead;
                a "heard/read" quote needs neither (ACTS-181). */}
            {addCategory === "quote" && (addQuoteKind === "book" || addQuoteKind === "article") ? (
              <Input
                value={addSource}
                onChange={(e) => setAddSource(e.target.value)}
                placeholder={
                  addQuoteKind === "book"
                    ? "Book title (optional)"
                    : "Publication or show (optional)"
                }
                className="h-9"
              />
            ) : null}
            <div className="flex items-center gap-2">
              {addCategory === "quote" && addQuoteKind === "scripture" ? (
                <ScriptureCitationField
                  value={addScriptureRef}
                  onChange={setAddScriptureRef}
                  body={addTitle}
                  placeholder="Citation — e.g. Lk 1:26-38"
                  className="h-9"
                  wrapperClassName="flex-1"
                />
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
                onClick={() => addContent()}
                disabled={!addTitle.trim()}
              >
                <Plus className="size-4" aria-hidden />
              </Button>
            </div>
          </div>
        </div>
      </section>
      <ScriptureCitationSaveDialog
        open={citationGuardOpen}
        onOpenChange={setCitationGuardOpen}
        body={addTitle}
        onChooseCitation={(ref) => {
          setCitationGuardOpen(false);
          addContent({ refOverride: ref, skipGuard: true });
        }}
        onAddManually={() => setCitationGuardOpen(false)}
        onSaveWithout={() => {
          setCitationGuardOpen(false);
          addContent({ skipGuard: true });
        }}
      />
    </div>
  );
}
