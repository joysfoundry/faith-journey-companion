import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Link2, Loader2, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CATEGORY_LABELS,
  CATEGORY_OPTIONS,
  LINK_PLATFORM_LABELS,
  detectCategory,
  detectPlatform,
  detectVoiceKind,
  identityFromUrl,
  isHandlePlatform,
  matchVoice,
  voiceFromLink,
} from "@/lib/prayer/knowledge";
import { fetchLinkPreview } from "@/lib/prayer/fetchSource.functions";
import { newId } from "@/lib/prayer/compiler";
import { useApp } from "@/lib/prayer/store";
import type { KnowledgeCategory, LinkPlatform, Voice } from "@/lib/prayer/types";

/** How a staged link will be attributed once saved. */
type Attribution =
  | { mode: "match"; voice: Voice; channelId: string } // matches a Vessel you follow
  | { mode: "new"; name: string } // make a new Vessel from the link
  | { mode: "none" }; // save unattributed (General)

/** The person/channel/site behind a link, from the page metadata. */
type Author = { name: string; handle: string; profileUrl: string };
const NO_AUTHOR: Author = { name: "", handle: "", profileUrl: "" };

type Staged = {
  url: string;
  title: string;
  category: KnowledgeCategory;
  platform: LinkPlatform;
  siteName: string;
  /** The account's home page — the Vessel's channel URL (so future posts match). */
  channelUrl: string;
  /** The channel's own name/username — kept on the Channel, not the Vessel. */
  channelLabel: string;
  attribution: Attribution;
  pin: boolean;
};

/** A sensible title when the page gives none (a login-walled or unreachable page). */
function fallbackTitle(url: string, siteName: string, author: Author): string {
  if (author.name) return author.name;
  const id = identityFromUrl(url);
  if (id) return `${LINK_PLATFORM_LABELS[id.platform]} — @${id.handle}`;
  if (author.handle) return `@${author.handle}`;
  if (siteName) return siteName;
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "Saved link";
  }
}

/**
 * Pre-fill for the Vessel's `name` — the *who*: the person/channel/site from the
 * page. The user edits it to the actual person (e.g. "Ana Munley"); the channel's
 * own name is kept separately (see `channelLabelFor`) so it isn't lost.
 */
function vesselNamePrefill(author: Author, url: string): string {
  if (author.name) return author.name;
  if (author.handle) return `@${author.handle}`;
  return voiceFromLink(url).name;
}

/**
 * The channel's own name, kept on the Channel so renaming the Vessel doesn't lose
 * it: the @username for handle platforms, the channel/show/site name otherwise.
 */
function channelLabelFor(platform: LinkPlatform, author: Author): string {
  if (isHandlePlatform(platform)) return author.handle ? `@${author.handle}` : author.name;
  return author.name;
}

/**
 * Paste-a-link quick-add for Vessels (ACTS-171). One URL field: it detects the
 * platform + category, best-effort fetches the page title, and auto-attributes
 * the post to a Vessel you already follow (`matchVoice`) — so saving an
 * Instagram/web link is a paste and a confirm, not the multi-field form below.
 */
export function QuickAddLink() {
  const { db, addKnowledgeItem, upsertVoice } = useApp();
  const runPreview = useServerFn(fetchLinkPreview);

  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [staged, setStaged] = useState<Staged | null>(null);

  async function lookup() {
    const raw = url.trim();
    if (!/^https?:\/\//i.test(raw)) {
      toast.error("Paste a full link starting with http(s)://");
      return;
    }
    setLoading(true);
    const platform = detectPlatform(raw);
    const category = detectCategory(raw);
    let siteName = "";
    let title = "";
    let author: Author = NO_AUTHOR;
    try {
      const preview = await runPreview({ data: { url: raw } });
      if (preview.ok) {
        title = preview.title;
        siteName = preview.siteName;
        author = preview.author;
      }
    } catch {
      /* best-effort — fall through to sensible defaults from the URL */
    }
    setLoading(false);
    // A post URL often omits the handle (an IG reel is just /reel/<id>/), so match
    // by the URL first, then by the author's profile page from the metadata.
    const match =
      matchVoice(raw, db.voices) ||
      (author.profileUrl ? matchVoice(author.profileUrl, db.voices) : undefined);
    setStaged({
      url: raw,
      title: title || fallbackTitle(raw, siteName, author),
      category,
      platform,
      siteName,
      channelUrl: author.profileUrl || raw,
      channelLabel: channelLabelFor(platform, author),
      attribution: match
        ? { mode: "match", voice: match.voice, channelId: match.channel.id }
        : { mode: "new", name: vesselNamePrefill(author, raw) },
      pin: false,
    });
  }

  function save() {
    if (!staged) return;
    let voiceId: string | undefined;
    let channelId: string | undefined;

    if (staged.attribution.mode === "match") {
      voiceId = staged.attribution.voice.id;
      channelId = staged.attribution.channelId;
    } else if (staged.attribution.mode === "new") {
      // Channel = the account's home page, so a later post from the same account
      // matches this Vessel; the item's own link stays the specific post below.
      const chanUrl = staged.channelUrl;
      voiceId = newId("voice");
      channelId = newId("chan");
      upsertVoice({
        id: voiceId,
        name: staged.attribution.name.trim() || voiceFromLink(staged.url).name,
        kind: detectVoiceKind(chanUrl),
        channels: [
          {
            id: channelId,
            platform: detectPlatform(chanUrl),
            url: chanUrl,
            label: staged.channelLabel.trim() || undefined,
          },
        ],
        created_at: new Date().toISOString(),
      });
    }

    addKnowledgeItem({
      id: newId("know"),
      title: staged.title.trim() || fallbackTitle(staged.url, staged.siteName, NO_AUTHOR),
      category: staged.category,
      voice_id: voiceId,
      channel_id: channelId,
      links: [{ platform: staged.platform, url: staged.url }],
      source: staged.siteName || undefined,
      pinned: staged.pin ? true : undefined,
      status: "not_started",
      created_at: new Date().toISOString(),
    });

    toast.success(
      staged.attribution.mode === "match"
        ? `Saved to ${staged.attribution.voice.name}`
        : "Saved to your library",
    );
    setStaged(null);
    setUrl("");
  }

  const patch = (p: Partial<Staged>) => setStaged((s) => (s ? { ...s, ...p } : s));

  return (
    <section className="soft-card space-y-3 p-4">
      <div className="flex items-center gap-2">
        <Link2 className="size-4 text-primary" aria-hidden />
        <h2 className="text-sm font-medium">Paste a link</h2>
      </div>
      <div className="flex items-center gap-2">
        <Input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !loading) void lookup();
          }}
          placeholder="Instagram, YouTube, or any web link"
          className="h-10"
          inputMode="url"
          autoComplete="off"
        />
        <Button
          className="h-10 shrink-0"
          onClick={() => void lookup()}
          disabled={loading || !url.trim()}
        >
          {loading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : "Look up"}
        </Button>
      </div>

      {staged ? (
        <div className="space-y-3 rounded-lg border border-border/60 bg-muted/20 p-3">
          <div className="space-y-1">
            <label className="text-xs uppercase tracking-wide text-muted-foreground">Title</label>
            <Input
              value={staged.title}
              onChange={(e) => patch({ title: e.target.value })}
              className="h-9"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={staged.category}
              onChange={(e) => patch({ category: e.target.value as KnowledgeCategory })}
              aria-label="Type"
              className="h-9 shrink-0 rounded-md border border-input bg-background px-2 text-sm"
            >
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {CATEGORY_LABELS[c]}
                </option>
              ))}
            </select>
            <span className="text-xs text-muted-foreground">
              {LINK_PLATFORM_LABELS[staged.platform]}
            </span>
          </div>

          {/* Attribution — where this lands in the library */}
          <div className="space-y-1">
            <label className="text-xs uppercase tracking-wide text-muted-foreground">Vessel</label>
            {staged.attribution.mode === "match" ? (
              <p className="text-sm">
                Saving to <span className="font-medium">{staged.attribution.voice.name}</span>{" "}
                <button
                  type="button"
                  onClick={() => patch({ attribution: { mode: "none" } })}
                  className="text-xs text-muted-foreground underline hover:text-foreground"
                >
                  change
                </button>
              </p>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={staged.attribution.mode}
                  onChange={(e) =>
                    patch({
                      attribution:
                        e.target.value === "new"
                          ? { mode: "new", name: voiceFromLink(staged.url).name }
                          : { mode: "none" },
                    })
                  }
                  aria-label="Vessel"
                  className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                >
                  <option value="new">New vessel</option>
                  <option value="none">No vessel (General)</option>
                </select>
                {staged.attribution.mode === "new" ? (
                  <Input
                    value={staged.attribution.name}
                    onChange={(e) => patch({ attribution: { mode: "new", name: e.target.value } })}
                    placeholder="Name (the person)"
                    className="h-9 flex-1"
                  />
                ) : null}
              </div>
            )}
          </div>

          {/* Channel — the account's own name (@username or channel name), kept on
              the Channel so it survives renaming the Vessel to the person. */}
          {staged.attribution.mode === "new" ? (
            <div className="space-y-1">
              <label className="text-xs uppercase tracking-wide text-muted-foreground">
                Channel
              </label>
              <Input
                value={staged.channelLabel}
                onChange={(e) => patch({ channelLabel: e.target.value })}
                placeholder={isHandlePlatform(staged.platform) ? "@username" : "Channel name"}
                className="h-9"
              />
              <p className="truncate text-[11px] text-muted-foreground">{staged.channelUrl}</p>
            </div>
          ) : null}

          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={staged.pin}
              onChange={(e) => patch({ pin: e.target.checked })}
              className="size-4"
            />
            Pin to Home
          </label>

          <div className="flex items-center gap-2 pt-1">
            <Button className="h-9 flex-1" onClick={save}>
              <Plus className="size-4" aria-hidden /> Save to library
            </Button>
            <Button
              variant="secondary"
              className="h-9"
              onClick={() => {
                setStaged(null);
                setUrl("");
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
