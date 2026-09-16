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
  kindFromPlatform,
  matchVoice,
  detectMedia,
  orgBrandName,
  VOICE_KIND_LABELS,
  voiceFromLink,
} from "@/lib/prayer/knowledge";
import { EntitySuggestInput } from "@/components/knowledge/EntitySuggestInput";
import { fetchLinkPreview } from "@/lib/prayer/fetchSource.functions";
import { newId } from "@/lib/prayer/compiler";
import { useApp } from "@/lib/prayer/store";
import type { Collection, KnowledgeCategory, LinkPlatform, Voice, VoiceKind } from "@/lib/prayer/types";

/** How a staged link will be attributed once saved. */
type Attribution =
  | { mode: "match"; voice: Voice; collectionId: string } // matches a Vessel you follow
  | { mode: "new"; name: string; kind: VoiceKind } // make a new Vessel (person or org)
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
  collectionUrl: string;
  /** The channel's own name/username — kept on the Collection, not the Vessel. */
  collectionLabel: string;
  /**
   * When attributing to an *existing* Vessel, whether to also add this link's
   * channel URL to that Vessel (so e.g. Ascension Press gains its homilies
   * channel alongside its website). Ignored in "new" mode.
   */
  addChannel: boolean;
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

/** The bare brand host for an org name fallback: app/m/www subdomains stripped
 * ("app.ascensionpress.com" → "ascensionpress.com"). */
function hostBrand(url: string): string {
  try {
    return new URL(url).hostname.replace(/^(www|app|m)\./, "");
  } catch {
    return "";
  }
}

/**
 * Pre-fill for the Vessel's `name` — the *who*.
 *
 * For an **organization** use its brand / site name (og:site_name, e.g. "Ascension
 * Press"), never an @handle: a website has no real @username, and a path segment
 * ("/products/…", "/pages/program/…") is not one — prefilling "@product" / "@program"
 * is wrong. For an **individual** (and true handle platforms) prefer the account's
 * **@handle** — a YouTube import should default to `@username`, not the channel
 * *title* ("AfterMass with Ana Munley"), which belongs on the Collection. The user can
 * always edit this.
 */
function vesselNamePrefill(
  author: Author,
  collectionUrl: string,
  url: string,
  siteName: string,
  kind: VoiceKind,
): string {
  if (kind === "organization") {
    // A known org resolves to its canonical brand name regardless of subdomain
    // or path, so every Ascension link lands on one "Ascension Press".
    const brand = orgBrandName(url);
    if (brand) return brand;
    if (siteName.trim()) return siteName.trim();
    if (author.name.trim()) return author.name.trim();
    return hostBrand(url) || voiceFromLink(url).name;
  }
  const id = identityFromUrl(collectionUrl) ?? identityFromUrl(url);
  if (id?.handle) return `@${id.handle}`;
  if (author.handle) return `@${author.handle}`;
  if (author.name) return author.name;
  return voiceFromLink(url).name;
}

/**
 * The channel's own name, kept on the Collection so renaming the Vessel doesn't lose
 * it: the @username for handle platforms, the channel/show/site name otherwise.
 */
function collectionLabelFor(platform: LinkPlatform, author: Author): string {
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
    const urlMatch =
      matchVoice(raw, db.voices) ||
      (author.profileUrl ? matchVoice(author.profileUrl, db.voices) : undefined);
    const kind = detectVoiceKind(author.profileUrl || raw);
    const prefillName = vesselNamePrefill(author, author.profileUrl || "", raw, siteName, kind);
    // If we don't match by URL, still catch an existing Vessel by name — a known
    // org resolves to one brand name ("Ascension Press") no matter the subdomain,
    // so a second Ascension link attributes to the same Vessel instead of making a
    // duplicate. (Exact-name matches are hidden by the suggest box, so auto-link.)
    const byName = urlMatch
      ? undefined
      : db.voices.find((v) => v.name.trim().toLowerCase() === prefillName.trim().toLowerCase());
    const matched = urlMatch
      ? { voice: urlMatch.voice, collectionId: urlMatch.channel.id }
      : byName
        ? { voice: byName, collectionId: byName.collections?.[0]?.id ?? "" }
        : undefined;
    // In "new" mode the channel is the account HOME only (never the content URL,
    // ACTS-178). But when we MATCH an existing Vessel, the user may want to add
    // this exact link as one of that Vessel's collections (its homilies section,
    // say), so default the editable channel URL to the account home or the link.
    const collectionUrl = matched ? author.profileUrl || raw : author.profileUrl || "";
    setStaged({
      url: raw,
      title: title || fallbackTitle(raw, siteName, author),
      category,
      platform,
      siteName,
      collectionUrl,
      collectionLabel: collectionLabelFor(platform, author),
      addChannel: Boolean(matched),
      attribution: matched
        ? { mode: "match", voice: matched.voice, collectionId: matched.collectionId }
        : { mode: "new", name: prefillName, kind },
      pin: false,
    });
  }

  function save() {
    if (!staged) return;
    let voiceId: string | undefined;
    let collectionId: string | undefined;

    if (staged.attribution.mode === "match") {
      const vessel = staged.attribution.voice;
      voiceId = vessel.id;
      collectionId = staged.attribution.collectionId;
      // Optionally add this link's channel to the existing Vessel — unless that
      // channel is already there (match by identity), in which case reuse it.
      const collUrl = staged.collectionUrl.trim();
      if (staged.addChannel && collUrl) {
        const existing = matchVoice(collUrl, [vessel])?.channel;
        if (existing) {
          collectionId = existing.id;
        } else {
          const newChanId = newId("chan");
          upsertVoice({
            ...vessel,
            collections: [
              ...(vessel.collections ?? []),
              {
                id: newChanId,
                platforms: [{ platform: detectPlatform(collUrl), url: collUrl }],
                kind: kindFromPlatform(detectPlatform(collUrl)),
                label: staged.collectionLabel.trim() || undefined,
              },
            ],
          });
          collectionId = newChanId;
        }
      }
    } else if (staged.attribution.mode === "new") {
      // Collection = the account's HOME page, so a later post from the same account
      // matches this Vessel; the item's own link stays the specific post below.
      // Only attach a channel when we actually have that home URL — never the
      // pasted content URL (ACTS-178).
      const collUrl = staged.collectionUrl.trim();
      voiceId = newId("voice");
      const collections: Collection[] = [];
      if (collUrl) {
        collectionId = newId("chan");
        collections.push({
          id: collectionId,
          platforms: [{ platform: detectPlatform(collUrl), url: collUrl }],
          kind: kindFromPlatform(detectPlatform(collUrl)),
          label: staged.collectionLabel.trim() || undefined,
        });
      }
      upsertVoice({
        id: voiceId,
        name: staged.attribution.name.trim() || voiceFromLink(staged.url).name,
        kind: staged.attribution.kind,
        collections: collections.length ? collections : undefined,
        created_at: new Date().toISOString(),
      });
    }

    addKnowledgeItem({
      id: newId("know"),
      title: staged.title.trim() || fallbackTitle(staged.url, staged.siteName, NO_AUTHOR),
      category: staged.category,
      // ACTS-204: media format detected from the link (editable later).
      media: detectMedia(staged.url),
      voice_id: voiceId,
      collection_id: collectionId,
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

          {/* From — the person or organization this content is by. Names the
              Vessel (kept separate from the content title and the channel). */}
          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-wide text-muted-foreground">From</label>
            {staged.attribution.mode === "match" ? (
              (() => {
                const vessel = staged.attribution.voice;
                const collUrl = staged.collectionUrl.trim();
                const alreadyHas = collUrl
                  ? Boolean(matchVoice(collUrl, [vessel])?.channel)
                  : false;
                return (
                  <>
                    <p className="text-sm">
                      Saving to <span className="font-medium">{vessel.name}</span>{" "}
                      <button
                        type="button"
                        onClick={() => patch({ attribution: { mode: "none" } })}
                        className="text-xs text-muted-foreground underline hover:text-foreground"
                      >
                        change
                      </button>
                    </p>
                    {/* One Vessel, many collections: add this link's channel URL to the
                        existing Vessel (e.g. Ascension Press gains its homilies
                        channel) while staying attributed to it (ACTS-186). */}
                    {collUrl && !alreadyHas ? (
                      <div className="space-y-1.5 rounded-md border border-border/60 bg-background p-2">
                        <label className="flex items-center gap-2 text-xs text-muted-foreground">
                          <input
                            type="checkbox"
                            checked={staged.addChannel}
                            onChange={(e) => patch({ addChannel: e.target.checked })}
                            className="size-4"
                          />
                          Add this as a collection of {vessel.name}
                        </label>
                        {staged.addChannel ? (
                          <>
                            <Input
                              value={staged.collectionLabel}
                              onChange={(e) => patch({ collectionLabel: e.target.value })}
                              placeholder="Collection name (e.g. Homilies)"
                              aria-label="New collection name"
                              className="h-8"
                            />
                            <Input
                              value={staged.collectionUrl}
                              onChange={(e) => patch({ collectionUrl: e.target.value })}
                              placeholder="https://…"
                              aria-label="New collection URL"
                              className="h-8"
                            />
                          </>
                        ) : null}
                      </div>
                    ) : alreadyHas ? (
                      <p className="text-xs text-muted-foreground">
                        This collection is already on {vessel.name}.
                      </p>
                    ) : null}
                  </>
                );
              })()
            ) : staged.attribution.mode === "new" ? (
              (() => {
                // Destructure the narrowed variant into primitives so the
                // callbacks below close over stable values (TS re-widens
                // `staged.attribution` across closures otherwise).
                const { name, kind } = staged.attribution;
                return (
                  <>
                    {/* Suggest Vessels you already have as the name is typed —
                        accepting one switches to "match" so it LINKS instead of
                        minting a duplicate (ACTS-186 connected-entity sweep). */}
                    <EntitySuggestInput
                      value={name}
                      onChange={(v) => patch({ attribution: { mode: "new", name: v, kind } })}
                      entities={db.voices.map((vc) => ({
                        id: vc.id,
                        name: vc.name,
                        sublabel: VOICE_KIND_LABELS[vc.kind].toLowerCase(),
                      }))}
                      onSelect={(e) => {
                        const v = db.voices.find((x) => x.id === e.id);
                        if (v)
                          // Seed the channel-add with this link so the matched
                          // Vessel can gain the pasted link's channel (e.g. its
                          // homilies section), not just be attributed.
                          patch({
                            attribution: {
                              mode: "match",
                              voice: v,
                              collectionId: v.collections?.[0]?.id ?? "",
                            },
                            collectionUrl: staged.collectionUrl.trim() || staged.url,
                            addChannel: true,
                          });
                      }}
                      placeholder="Name (person or organization)"
                      className="h-9"
                      ariaLabel="Attribute to a Vessel"
                    />
                    <div className="flex gap-1">
                      {(["individual", "organization"] as const).map((k) => (
                        <button
                          key={k}
                          type="button"
                          aria-pressed={kind === k}
                          onClick={() => patch({ attribution: { mode: "new", name, kind: k } })}
                          className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium capitalize transition-colors ${
                            kind === k
                              ? "bg-primary text-primary-foreground"
                              : "bg-secondary text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {k}
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => patch({ attribution: { mode: "none" } })}
                      className="block text-xs text-muted-foreground underline hover:text-foreground"
                    >
                      Save to General instead
                    </button>
                  </>
                );
              })()
            ) : (
              <p className="text-sm text-muted-foreground">
                Saving to <span className="font-medium text-foreground">General</span> — not
                attributed.{" "}
                <button
                  type="button"
                  onClick={() => {
                    // Same defaults as the initial lookup: an @handle for an
                    // individual, the brand/site name for an organization.
                    const kind = detectVoiceKind(staged.collectionUrl || staged.url);
                    patch({
                      attribution: {
                        mode: "new",
                        name: vesselNamePrefill(
                          NO_AUTHOR,
                          staged.collectionUrl,
                          staged.url,
                          staged.siteName,
                          kind,
                        ),
                        kind,
                      },
                    });
                  }}
                  className="text-xs underline hover:text-foreground"
                >
                  Attribute to someone
                </button>
              </p>
            )}
          </div>

          {/* Collection — the account's home (its @username / channel name + home
              URL), kept on the Collection so renaming the Vessel to the person
              doesn't lose it. Only shown when we actually have the account's home
              URL — never the pasted video/post link. */}
          {staged.attribution.mode === "new" && staged.collectionUrl ? (
            <div className="space-y-1">
              <label className="text-xs uppercase tracking-wide text-muted-foreground">
                Collection
              </label>
              <Input
                value={staged.collectionLabel}
                onChange={(e) => patch({ collectionLabel: e.target.value })}
                placeholder={isHandlePlatform(staged.platform) ? "@username" : "Collection name"}
                className="h-9"
              />
              <p className="truncate text-[11px] text-muted-foreground">{staged.collectionUrl}</p>
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
