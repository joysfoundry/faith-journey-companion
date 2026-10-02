import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Link2, Loader2, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CATEGORY_LABELS,
  CATEGORY_OPTIONS,
  COLLECTION_KIND_LABELS,
  COLLECTION_KIND_OPTIONS,
  LINK_PLATFORM_LABELS,
  canonicalUrl,
  collectionKindFromUrl,
  collectionLabel,
  collectionRootOf,
  contentNoun,
  detectCategory,
  detectPlatform,
  detectSourceType,
  detectVoiceKind,
  identityFromUrl,
  isHandlePlatform,
  detectMedia,
  mediaFromCollectionKind,
  orgBrandName,
  resolveCollection,
  VOICE_KIND_LABELS,
  voiceFromLink,
} from "@/lib/prayer/knowledge";
import { EntitySuggestInput } from "@/components/knowledge/EntitySuggestInput";
import { fetchLinkPreview } from "@/lib/prayer/fetchSource.functions";
import { newId } from "@/lib/prayer/compiler";
import { useApp } from "@/lib/prayer/store";
import type {
  Collection,
  CollectionKind,
  KnowledgeCategory,
  LinkPlatform,
  Voice,
  VoiceKind,
} from "@/lib/prayer/types";

/** How a staged link will be attributed once saved. */
type Attribution =
  | { mode: "match"; voice: Voice } // a Vessel you follow
  | { mode: "new"; name: string; kind: VoiceKind } // make a new Vessel (person or org)
  | { mode: "none" }; // save unattributed (General) — content only

/**
 * Content's "Part of" (ACTS-204): an existing Collection of the From Vessel, a
 * new one to create alongside, or none (the item parents to the Vessel directly).
 */
type PartOf =
  | { mode: "existing"; collectionId: string; label: string }
  | { mode: "new"; label: string; url: string; kind: CollectionKind }
  | { mode: "none"; label: string };

/** The person/channel/site behind a link, from the page metadata. */
type Author = { name: string; handle: string; profileUrl: string };
const NO_AUTHOR: Author = { name: "", handle: "", profileUrl: "" };

type Staged = {
  /** The canonical link (tracking params stripped) — what's saved as `url`. */
  url: string;
  /** The link exactly as pasted, when it differs from `url`. */
  originalUrl: string | undefined;
  /** Collection (a show/account) or Content (one item) — inferred, flippable. */
  sourceType: "collection" | "content";
  title: string;
  category: KnowledgeCategory;
  platform: LinkPlatform;
  siteName: string;
  author: Author;
  /** Collection mode: the new Collection's name + kind (its URL is `url`). */
  collectionName: string;
  collectionKind: CollectionKind;
  /** Collection mode: this URL is already a collection of that Vessel. */
  duplicateOf: { voice: Voice; label: string } | undefined;
  /** Content mode: the Collection it files under. */
  partOf: PartOf;
  attribution: Attribution;
  pin: boolean;
};

/** "Podcasts | The Ascension Web App" → "Podcasts": a page title minus its site suffix. */
function bareTitle(title: string): string {
  return title.split(/\s[|–—]\s|\s-\s/)[0]?.trim() ?? "";
}

/** "…/podcasts/homily" → "Homily": a readable name from a URL's last path segment. */
function nameFromPath(url: string): string {
  try {
    const seg = new URL(url).pathname.split("/").filter(Boolean).pop() ?? "";
    const words = decodeURIComponent(seg).replace(/[-_]+/g, " ").trim();
    return words ? words.charAt(0).toUpperCase() + words.slice(1) : "";
  } catch {
    return "";
  }
}

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
 * the post to a Vessel you already follow — so saving an Instagram/web link is a
 * paste and a confirm, not the multi-field form below.
 *
 * ACTS-204 slice d: the URL's SHAPE decides the tier. An account/show root
 * (`/@handle`, `/podcasts/homily`, a Spotify show) stages a **Collection** of the
 * Vessel; a specific item (`watch?v=`, a reel, `?episodeId=`) stages **Content**,
 * filed "Part of" the Collection it lives under (most-specific path wins). Both
 * are inferred and shown on one editable card — the user can flip the tier, the
 * kind, the Vessel, and the collection before anything is saved.
 */
export function QuickAddLink() {
  const { db, addKnowledgeItem, upsertVoice } = useApp();
  const runPreview = useServerFn(fetchLinkPreview);

  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [staged, setStaged] = useState<Staged | null>(null);

  /** Every Collection you have, for the "Part of" autocomplete. */
  const allCollections = db.voices.flatMap((v) =>
    (v.collections ?? []).map((c) => ({ voice: v, collection: c })),
  );

  /** A default Vessel for this link: a URL/brand-name match, else a new one. */
  function defaultAttribution(
    canonical: string,
    author: Author,
    siteName: string,
    resolvedVoice: Voice | undefined,
  ): Attribution {
    const kind = detectVoiceKind(author.profileUrl || canonical);
    const prefillName = vesselNamePrefill(
      author,
      author.profileUrl || "",
      canonical,
      siteName,
      kind,
    );
    // No URL match? Still catch an existing Vessel by name — a known org resolves
    // to one brand name ("Ascension Press") no matter the subdomain, so a second
    // Ascension link attributes to the same Vessel instead of making a duplicate.
    const byName = resolvedVoice
      ? undefined
      : db.voices.find((v) => v.name.trim().toLowerCase() === prefillName.trim().toLowerCase());
    const voice = resolvedVoice ?? byName;
    return voice ? { mode: "match", voice } : { mode: "new", name: prefillName, kind };
  }

  async function lookup() {
    const raw = url.trim();
    if (!/^https?:\/\//i.test(raw)) {
      toast.error("Paste a full link starting with http(s)://");
      return;
    }
    const canonical = canonicalUrl(raw);
    setLoading(true);
    let siteName = "";
    let title = "";
    let author: Author = NO_AUTHOR;
    try {
      const preview = await runPreview({ data: { url: canonical } });
      if (preview.ok) {
        title = preview.title;
        siteName = preview.siteName;
        author = preview.author;
      }
    } catch {
      /* best-effort — fall through to sensible defaults from the URL */
    }
    setLoading(false);

    const platform = detectPlatform(canonical);
    const sourceType = detectSourceType(canonical);
    // A post URL often omits the handle (an IG reel is just /reel/<id>/), so
    // resolve by the URL first, then by the author's profile page.
    const resolved =
      resolveCollection(canonical, db.voices) ??
      (author.profileUrl ? resolveCollection(author.profileUrl, db.voices) : undefined);
    const attribution = defaultAttribution(canonical, author, siteName, resolved?.voice);

    // Content's parent: the collection it resolved under, else a new one at the
    // account home / the item's parent path (never the item URL itself, ACTS-178).
    const root = canonicalUrl(author.profileUrl || collectionRootOf(canonical));
    const partOf: PartOf =
      resolved?.channel && sourceType === "content"
        ? {
            mode: "existing",
            collectionId: resolved.channel.id,
            label: collectionLabel(resolved.channel),
          }
        : root && attribution.mode !== "none"
          ? {
              mode: "new",
              label: collectionLabelFor(platform, author) || nameFromPath(root),
              url: root,
              kind: collectionKindFromUrl(root),
            }
          : { mode: "none", label: "" };

    const pageTitle = title || fallbackTitle(canonical, siteName, author);
    setStaged({
      url: canonical,
      originalUrl: canonical !== raw ? raw : undefined,
      sourceType,
      title: pageTitle,
      category: detectCategory(canonical),
      platform,
      siteName,
      author,
      collectionName:
        (isHandlePlatform(platform) && author.handle ? `@${author.handle}` : "") ||
        bareTitle(title) ||
        nameFromPath(canonical) ||
        pageTitle,
      collectionKind: collectionKindFromUrl(canonical),
      duplicateOf:
        resolved?.exact && resolved.channel
          ? { voice: resolved.voice, label: collectionLabel(resolved.channel) }
          : undefined,
      partOf,
      attribution,
      pin: false,
    });
  }

  function newCollection(p: {
    url: string;
    label: string;
    kind: CollectionKind;
    pinned?: boolean;
  }): Collection {
    return {
      id: newId("chan"),
      platforms: [{ platform: detectPlatform(p.url), url: p.url }],
      kind: p.kind,
      label: p.label.trim() || undefined,
      pinned: p.pinned || undefined,
    };
  }

  /** Attach `collections` to the From Vessel (or mint it); returns its id. */
  function commitVessel(s: Staged, collections: Collection[]): string | undefined {
    if (s.attribution.mode === "match") {
      const matched = s.attribution.voice;
      const vessel = db.voices.find((v) => v.id === matched.id) ?? matched;
      if (collections.length) {
        upsertVoice({ ...vessel, collections: [...(vessel.collections ?? []), ...collections] });
      }
      return vessel.id;
    }
    if (s.attribution.mode === "new") {
      const voiceId = newId("voice");
      upsertVoice({
        id: voiceId,
        name: s.attribution.name.trim() || voiceFromLink(s.url).name,
        kind: s.attribution.kind,
        collections: collections.length ? collections : undefined,
        created_at: new Date().toISOString(),
      });
      return voiceId;
    }
    return undefined;
  }

  function vesselName(s: Staged): string {
    if (s.attribution.mode === "match") return s.attribution.voice.name;
    if (s.attribution.mode === "new") return s.attribution.name.trim() || "a new Vessel";
    return "General";
  }

  function save() {
    if (!staged) return;

    if (staged.sourceType === "collection") {
      if (staged.attribution.mode === "none" || staged.duplicateOf) return;
      const coll = newCollection({
        url: staged.url,
        label: staged.collectionName,
        kind: staged.collectionKind,
        pinned: staged.pin,
      });
      commitVessel(staged, [coll]);
      toast.success(`Added ${collectionLabel(coll)} to ${vesselName(staged)}`);
      setStaged(null);
      setUrl("");
      return;
    }

    let collectionId: string | undefined;
    const extra: Collection[] = [];
    if (staged.partOf.mode === "existing") {
      collectionId = staged.partOf.collectionId;
    } else if (
      staged.partOf.mode === "new" &&
      staged.partOf.url.trim() &&
      staged.attribution.mode !== "none"
    ) {
      const coll = newCollection({
        url: canonicalUrl(staged.partOf.url),
        label: staged.partOf.label,
        kind: staged.partOf.kind,
      });
      extra.push(coll);
      collectionId = coll.id;
    }
    const voiceId = commitVessel(staged, extra);

    addKnowledgeItem({
      id: newId("know"),
      title: staged.title.trim() || fallbackTitle(staged.url, staged.siteName, NO_AUTHOR),
      category: staged.category,
      // ACTS-204: media format from the link; a plain web link inherits its
      // collection's kind instead (a podcast episode is audio). Editable later.
      media: (() => {
        const fromUrl = detectMedia(staged.url);
        if (fromUrl !== "text") return fromUrl;
        const kind =
          staged.partOf.mode === "new"
            ? staged.partOf.kind
            : staged.partOf.mode === "existing"
              ? allCollections.find((c) => c.collection.id === collectionId)?.collection.kind
              : undefined;
        return kind ? mediaFromCollectionKind(kind) : fromUrl;
      })(),
      voice_id: voiceId,
      collection_id: voiceId ? collectionId : undefined,
      links: [{ platform: staged.platform, url: staged.url, original_url: staged.originalUrl }],
      source: staged.siteName || undefined,
      pinned: staged.pin ? true : undefined,
      status: "not_started",
      created_at: new Date().toISOString(),
    });

    toast.success(voiceId ? `Saved to ${vesselName(staged)}` : "Saved to your library");
    setStaged(null);
    setUrl("");
  }

  const patch = (p: Partial<Staged>) => setStaged((s) => (s ? { ...s, ...p } : s));

  /**
   * Change the From Vessel, keeping "Part of" consistent: an existing collection
   * must belong to the Vessel (else it falls back to none), and General can't
   * hold a collection.
   */
  function setAttribution(a: Attribution) {
    setStaged((s) => {
      if (!s) return s;
      let partOf = s.partOf;
      if (partOf.mode === "existing") {
        const { collectionId } = partOf;
        const owned =
          a.mode === "match" && (a.voice.collections ?? []).some((c) => c.id === collectionId);
        if (!owned) partOf = { mode: "none", label: "" };
      }
      return { ...s, attribution: a, partOf };
    });
  }

  /** Re-derive a new-Vessel prefill (used by "Attribute to someone"). */
  function attributeFresh(s: Staged) {
    const kind = detectVoiceKind(s.author.profileUrl || s.url);
    setAttribution({
      mode: "new",
      name: vesselNamePrefill(s.author, s.author.profileUrl, s.url, s.siteName, kind),
      kind,
    });
  }

  const isCollection = staged?.sourceType === "collection";
  const canSave = staged
    ? isCollection
      ? staged.attribution.mode !== "none" &&
        !staged.duplicateOf &&
        Boolean(staged.collectionName.trim())
      : true
    : false;

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
          {/* Saving as — the tier, inferred from the URL's shape, one tap to flip. */}
          <div className="space-y-1">
            <div
              role="radiogroup"
              aria-label="Save as"
              className="inline-flex rounded-full bg-secondary p-0.5"
            >
              {(["content", "collection"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  role="radio"
                  aria-checked={staged.sourceType === t}
                  onClick={() => {
                    if (t === "collection" && staged.attribution.mode === "none")
                      attributeFresh(staged);
                    patch({ sourceType: t });
                  }}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    staged.sourceType === t
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t === "content" ? "One item" : "Collection"}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground">
              {isCollection
                ? "A show, podcast, program, or account — its items file under it."
                : "One video, episode, article, or post."}
            </p>
          </div>

          {isCollection ? (
            <div className="space-y-1">
              <label className="text-xs uppercase tracking-wide text-muted-foreground">Name</label>
              <div className="flex items-center gap-2">
                <Input
                  value={staged.collectionName}
                  onChange={(e) => patch({ collectionName: e.target.value })}
                  placeholder={isHandlePlatform(staged.platform) ? "@username" : "Collection name"}
                  aria-label="Collection name"
                  className="h-9"
                />
                <select
                  value={staged.collectionKind}
                  onChange={(e) => patch({ collectionKind: e.target.value as CollectionKind })}
                  aria-label="Collection kind"
                  className="h-9 shrink-0 rounded-md border border-input bg-background px-2 text-sm"
                >
                  {COLLECTION_KIND_OPTIONS.map((k) => (
                    <option key={k} value={k}>
                      {COLLECTION_KIND_LABELS[k]}
                    </option>
                  ))}
                </select>
              </div>
              <p className="truncate text-[11px] text-muted-foreground">{staged.url}</p>
            </div>
          ) : (
            <>
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-wide text-muted-foreground">
                  Title
                </label>
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
            </>
          )}

          {/* From — the person or organization. Names the Vessel (kept separate
              from the content title and the collection). */}
          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-wide text-muted-foreground">From</label>
            {staged.attribution.mode === "match" ? (
              <p className="text-sm">
                {isCollection ? "Adding to" : "Saving to"}{" "}
                <span className="font-medium">{staged.attribution.voice.name}</span>{" "}
                <button
                  type="button"
                  onClick={() => attributeFresh(staged)}
                  className="text-xs text-muted-foreground underline hover:text-foreground"
                >
                  change
                </button>
              </p>
            ) : staged.attribution.mode === "new" ? (
              (() => {
                // Destructure the narrowed variant into primitives so the
                // callbacks below close over stable values (TS re-widens
                // `staged.attribution` across closures otherwise).
                const { name, kind } = staged.attribution;
                return (
                  <>
                    {/* Suggest Vessels you already have as the name is typed —
                        accepting one LINKS instead of minting a duplicate
                        (ACTS-186 connected-entity sweep). */}
                    <EntitySuggestInput
                      value={name}
                      onChange={(v) => setAttribution({ mode: "new", name: v, kind })}
                      entities={db.voices.map((vc) => ({
                        id: vc.id,
                        name: vc.name,
                        sublabel: VOICE_KIND_LABELS[vc.kind].toLowerCase(),
                      }))}
                      onSelect={(e) => {
                        const v = db.voices.find((x) => x.id === e.id);
                        if (v) setAttribution({ mode: "match", voice: v });
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
                          onClick={() => setAttribution({ mode: "new", name, kind: k })}
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
                    {/* A collection always belongs to a Vessel — General is content-only. */}
                    {!isCollection ? (
                      <button
                        type="button"
                        onClick={() => setAttribution({ mode: "none" })}
                        className="block text-xs text-muted-foreground underline hover:text-foreground"
                      >
                        Save to General instead
                      </button>
                    ) : null}
                  </>
                );
              })()
            ) : (
              <p className="text-sm text-muted-foreground">
                Saving to <span className="font-medium text-foreground">General</span> — not
                attributed.{" "}
                <button
                  type="button"
                  onClick={() => attributeFresh(staged)}
                  className="text-xs underline hover:text-foreground"
                >
                  Attribute to someone
                </button>
              </p>
            )}
            {isCollection && staged.duplicateOf ? (
              <p className="text-xs text-muted-foreground">
                Already saved — {staged.duplicateOf.label} is a collection of{" "}
                {staged.duplicateOf.voice.name}.
              </p>
            ) : null}
          </div>

          {/* Part of — the Collection this item files under. Autocompletes across
              every collection you have (picking one sets From to its owner); a
              typed name that matches none makes a new collection on save. */}
          {!isCollection ? (
            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-wide text-muted-foreground">
                Part of
              </label>
              <EntitySuggestInput
                value={staged.partOf.label}
                onChange={(label) => {
                  const p = staged.partOf;
                  if (!label.trim()) {
                    patch({ partOf: { mode: "none", label } });
                  } else if (p.mode === "new") {
                    patch({ partOf: { ...p, label } });
                  } else {
                    const root = canonicalUrl(
                      staged.author.profileUrl || collectionRootOf(staged.url),
                    );
                    patch({
                      partOf: { mode: "new", label, url: root, kind: collectionKindFromUrl(root) },
                    });
                  }
                }}
                entities={allCollections.map(({ voice, collection }) => ({
                  id: collection.id,
                  name: collectionLabel(collection),
                  sublabel: `${voice.name} · ${COLLECTION_KIND_LABELS[collection.kind ?? "other"]}`,
                }))}
                onSelect={(e) => {
                  const hit = allCollections.find((c) => c.collection.id === e.id);
                  if (!hit) return;
                  setStaged((s) =>
                    s
                      ? {
                          ...s,
                          attribution: { mode: "match", voice: hit.voice },
                          partOf: {
                            mode: "existing",
                            collectionId: hit.collection.id,
                            label: collectionLabel(hit.collection),
                          },
                        }
                      : s,
                  );
                }}
                placeholder="None — or a show, podcast, program…"
                className="h-9"
                ariaLabel="Part of a collection"
              />
              {staged.partOf.mode === "existing" ? (
                <p className="text-[11px] text-muted-foreground">
                  Files as{" "}
                  {(() => {
                    const p = staged.partOf;
                    const hit = allCollections.find((c) => c.collection.id === p.collectionId);
                    const noun = contentNoun(hit?.collection.kind);
                    return `${/^[aeiou]/.test(noun) ? "an" : "a"} ${noun} of ${p.label}`;
                  })()}
                  .
                </p>
              ) : staged.partOf.mode === "new" ? (
                staged.attribution.mode === "none" ? (
                  <p className="text-[11px] text-muted-foreground">
                    Choose who it's from to add a new collection.
                  </p>
                ) : (
                  (() => {
                    const p = staged.partOf;
                    return (
                      <div className="space-y-1.5 rounded-md border border-border/60 bg-background p-2">
                        <p className="text-[11px] text-muted-foreground">
                          New collection of {vesselName(staged)}
                        </p>
                        <div className="flex items-center gap-2">
                          <Input
                            value={p.url}
                            onChange={(e) => patch({ partOf: { ...p, url: e.target.value } })}
                            placeholder="Collection link (https://…)"
                            aria-label="New collection URL"
                            className="h-8"
                          />
                          <select
                            value={p.kind}
                            onChange={(e) =>
                              patch({ partOf: { ...p, kind: e.target.value as CollectionKind } })
                            }
                            aria-label="New collection kind"
                            className="h-8 shrink-0 rounded-md border border-input bg-background px-2 text-sm"
                          >
                            {COLLECTION_KIND_OPTIONS.map((k) => (
                              <option key={k} value={k}>
                                {COLLECTION_KIND_LABELS[k]}
                              </option>
                            ))}
                          </select>
                        </div>
                        {!p.url.trim() ? (
                          <p className="text-[11px] text-muted-foreground">
                            Add the collection's link to create it.
                          </p>
                        ) : null}
                      </div>
                    );
                  })()
                )
              ) : null}
            </div>
          ) : null}

          {staged.originalUrl && !isCollection ? (
            <p className="truncate text-[11px] text-muted-foreground" title={staged.originalUrl}>
              Tracking removed — saving {staged.url}
            </p>
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
            <Button className="h-9 flex-1" onClick={save} disabled={!canSave}>
              <Plus className="size-4" aria-hidden />{" "}
              {isCollection ? "Add collection" : "Save to library"}
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
