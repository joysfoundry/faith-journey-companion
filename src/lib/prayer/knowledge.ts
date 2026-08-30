import type {
  Channel,
  ID,
  KnowledgeCategory,
  KnowledgeItem,
  KnowledgeStatus,
  LinkPlatform,
  Voice,
  VoiceKind,
} from "./types";

/**
 * The user-facing name for the "who" concept — a person/org/ministry God works
 * through. Kept in ONE place so it can be renamed without touching the app.
 */
export const VOICE_LABEL = "Vessels";
export const VOICE_LABEL_SINGULAR = "Vessel";

/**
 * The user-facing name for the whole *section* (Home card, nav, page title,
 * back buttons). Separate from the concept label so the two can diverge; both
 * are "Vessels" today. Route `/formation`, code identifiers stay `Knowledge`.
 */
export const SECTION_LABEL = "Vessels";

/* -------------------------------- Content -------------------------------- */

/** Human labels for a content item's category (used in rows, the Add picker). */
export const CATEGORY_LABELS: Record<KnowledgeCategory, string> = {
  book: "Book",
  article: "Article",
  video: "Video",
  podcast: "Podcast",
  post: "Post",
  quote: "Quote",
  program: "Program",
};

/** The content categories offered in the Add form, in menu order. */
export const CATEGORY_OPTIONS: KnowledgeCategory[] = [
  "book",
  "article",
  "video",
  "podcast",
  "post",
  "quote",
  "program",
];

/**
 * Home / Library grouping for Content. Several categories collapse into one
 * display group ("Media" gathers video/podcast/article/post).
 */
export type KnowledgeGroup = "program" | "book" | "media" | "quote";

export const GROUP_LABELS: Record<KnowledgeGroup, string> = {
  program: "Programs",
  book: "Books",
  media: "Media",
  quote: "Quotes",
};

export const GROUP_ORDER: KnowledgeGroup[] = ["program", "book", "media", "quote"];

/** Which display group a content item belongs to. */
export function groupOf(category: KnowledgeCategory): KnowledgeGroup {
  if (category === "program") return "program";
  if (category === "book") return "book";
  if (category === "quote") return "quote";
  return "media"; // video | podcast | article | post
}

/** A quote = content whose payload is text (`body`), not a title or a link. */
export function isQuote(item: KnowledgeItem): boolean {
  return item.category === "quote";
}

/** The quotation text, from `body` (falls back to `title` for legacy safety). */
export function quoteBody(item: KnowledgeItem): string {
  return (item.body ?? item.title ?? "").trim();
}

/**
 * The label to show for a content item. A quote has no title, so use a trimmed
 * snippet of its text; everything else uses its `title`.
 */
export function contentTitle(item: KnowledgeItem): string {
  if (item.category !== "quote") return item.title;
  const q = quoteBody(item);
  if (!q) return "Quote";
  return q.length > 60 ? `${q.slice(0, 57).trimEnd()}…` : q;
}

/**
 * A Bible-reading program. These display under the Home "Word" section instead
 * of the Knowledge → Programs group (still a `program` in the Library).
 */
export function isScriptureProgram(item: KnowledgeItem): boolean {
  return item.category === "program" && !!item.reads_scripture;
}

/** Best-guess default for the "reads through Scripture" toggle when adding a program. */
export function detectScriptureProgram(url?: string, title?: string, source?: string): boolean {
  const hay = `${url ?? ""} ${title ?? ""} ${source ?? ""}`.toLowerCase();
  if (/reading-plans?/.test(hay) && hay.includes("bible.com")) return true;
  return /\bbible\b|\bscripture\b|\bgospel\b|\bnew testament\b|\bold testament\b/.test(hay);
}

/* -------------------------------- Voices --------------------------------- */

export const VOICE_KIND_LABELS: Record<VoiceKind, string> = {
  individual: "Individual",
  organization: "Organization",
  ministry: "Ministry",
};

export const VOICE_KIND_OPTIONS: VoiceKind[] = ["individual", "organization", "ministry"];

/* ------------------------- Channels / link platforms ---------------------- */

/** Human labels for a channel/link platform. */
export const LINK_PLATFORM_LABELS: Record<LinkPlatform, string> = {
  instagram: "Instagram",
  tiktok: "TikTok",
  youtube: "YouTube",
  x: "X",
  facebook: "Facebook",
  podcast: "Podcast",
  website: "Website",
  store: "Store",
  other: "Link",
};

/** Display label for a channel — its human note if set, else the platform name. */
export function channelLabel(channel: Channel): string {
  return channel.label?.trim() || LINK_PLATFORM_LABELS[channel.platform];
}

/** The channel a content item came from, resolved against its Voice (if any). */
export function channelOf(item: KnowledgeItem, voice: Voice | undefined): Channel | undefined {
  if (!voice || !item.channel_id) return undefined;
  return voice.channels?.find((c) => c.id === item.channel_id);
}

/** Platforms offered in the channel/link editor, in menu order. */
export const LINK_PLATFORM_OPTIONS: LinkPlatform[] = [
  "instagram",
  "tiktok",
  "youtube",
  "x",
  "facebook",
  "podcast",
  "website",
  "store",
  "other",
];

function hostAndPath(url?: string): { host: string; path: string } {
  const raw = (url ?? "").trim().toLowerCase();
  if (!raw) return { host: "", path: "" };
  try {
    const u = new URL(raw.startsWith("http") ? raw : `https://${raw}`);
    return { host: u.hostname.replace(/^www\./, ""), path: u.pathname };
  } catch {
    return { host: raw, path: "" };
  }
}

/** Best-guess platform for a pasted link. */
export function detectPlatform(url?: string): LinkPlatform {
  const { host } = hostAndPath(url);
  if (!host) return "website";
  if (host.includes("instagram.com")) return "instagram";
  if (host.includes("tiktok.com")) return "tiktok";
  if (host.includes("youtube.com") || host.includes("youtu.be")) return "youtube";
  if (host.includes("x.com") || host.includes("twitter.com")) return "x";
  if (host.includes("facebook.com") || host.includes("fb.com")) return "facebook";
  if (host.includes("podcasts.apple.com") || host.includes("open.spotify.com")) return "podcast";
  if (host.includes("amazon.") || host.includes("a.co") || host.includes("audible."))
    return "store";
  return "website";
}

/** A "/p/", "/reel/", "/status/"… segment anywhere in the path = a single post. */
const POST_PATH = /\/(p|reel|reels|tv|status|watch|video|shorts|posts?)\//;

/**
 * A stable identity ("who posted this") pulled from a social URL: the platform
 * plus the account handle. Two URLs from the same account resolve to the same
 * identity, so a pasted post can be matched back to a saved Voice's channel.
 */
export function identityFromUrl(url?: string): { platform: LinkPlatform; handle: string } | null {
  const { host, path } = hostAndPath(url);
  if (!host) return null;
  const platform = detectPlatform(url);
  const segments = path.split("/").filter(Boolean);
  if (segments.length === 0) return null;

  if (platform === "youtube") {
    const seg = segments[0];
    if (!seg) return null;
    if (seg === "watch" || seg === "shorts") return null;
    if ((seg === "c" || seg === "channel" || seg === "user") && segments[1]) {
      return { platform, handle: segments[1].replace(/^@/, "") };
    }
    return { platform, handle: seg.replace(/^@/, "") };
  }

  if (POST_PATH.test(path)) {
    const lead = segments[0];
    if (lead && !/^(p|reel|reels|tv|status|watch|video|shorts|posts?)$/.test(lead)) {
      return { platform, handle: lead.replace(/^@/, "") };
    }
    return null;
  }
  const handle = segments[0];
  if (!handle) return null;
  return { platform, handle: handle.replace(/^@/, "") };
}

function sameIdentity(
  a: { platform: LinkPlatform; handle: string },
  b: { platform: LinkPlatform; handle: string },
): boolean {
  return a.platform === b.platform && a.handle.toLowerCase() === b.handle.toLowerCase();
}

/**
 * Find the saved Voice (and matching channel) a URL belongs to, by matching the
 * URL's identity against each Voice's channels. Powers auto-linking a pasted
 * post to its Voice.
 */
export function matchVoice(
  url: string | undefined,
  voices: Voice[],
): { voice: Voice; channel: Channel } | undefined {
  const id = identityFromUrl(url);
  if (!id) return undefined;
  for (const voice of voices) {
    for (const channel of voice.channels ?? []) {
      const ci = identityFromUrl(channel.url);
      if (ci && sameIdentity(ci, id)) return { voice, channel };
    }
  }
  return undefined;
}

/** Known org/company/reference hosts → an organization Voice by default. */
const ORG_HOSTS = [
  "hallow.com",
  "usccb.org",
  "vatican.va",
  "magnificat.com",
  "ewtn.com",
  "catholic.com",
  "ascensionpress.com",
  "bible.com",
  "youversion",
];

/** Best-guess kind for a Voice created from a pasted URL. */
export function detectVoiceKind(url?: string): VoiceKind {
  const { host } = hostAndPath(url);
  if (ORG_HOSTS.some((h) => host.includes(h))) return "organization";
  return "individual";
}

/** A Voice seed built from a single pasted link — the "create from this URL" tap. */
export function voiceFromLink(url: string): {
  name: string;
  kind: VoiceKind;
  platform: LinkPlatform;
} {
  const id = identityFromUrl(url);
  const platform = detectPlatform(url);
  const name = id?.handle ? `@${id.handle}` : hostAndPath(url).host || "New voice";
  return { name, kind: detectVoiceKind(url), platform };
}

/** True when a freshly-created draft Voice was never touched (safe to discard). */
export function isEmptyDraftVoice(
  voices: Voice[],
  items: KnowledgeItem[],
  voiceId: string,
): boolean {
  const v = voices.find((x) => x.id === voiceId);
  if (!v) return false;
  // "Untitled" = a legacy ghost: an empty draft whose "" name was rewritten on
  // an older hydration (see normalizeVoice). Treat it as untouched so it can be
  // pruned like any other empty draft.
  const untouchedName = !v.name.trim() || v.name === "New voice" || v.name === "Untitled";
  const noChannels = !(v.channels ?? []).length;
  const noContent = !items.some((i) => i.voice_id === voiceId);
  return untouchedName && noChannels && noContent;
}

/* -------------------------------- Sorting -------------------------------- */

const STATUS_RANK: Record<KnowledgeStatus, number> = {
  in_progress: 0,
  not_started: 1,
  finished: 2,
};

/**
 * Whether a category tracks progress (Not started → In progress → Finished).
 * Completable works do — a book you read, a program you follow, a video/podcast
 * you get through. "General" references (an article/post link, a quote) don't:
 * you don't "finish" a website, so they carry no status and sink below the
 * things you're working through.
 */
export function hasStatus(category: KnowledgeCategory): boolean {
  return (
    category === "book" || category === "program" || category === "video" || category === "podcast"
  );
}

/**
 * Order content: status-bearing items (books, programs, video, podcast) first —
 * in-progress, then not-started, then finished — then the status-less references
 * (articles/posts/quotes). Newest within each tier.
 */
export function byStatusThenRecent(a: KnowledgeItem, b: KnowledgeItem): number {
  const aHas = hasStatus(a.category);
  const bHas = hasStatus(b.category);
  if (aHas !== bHas) return aHas ? -1 : 1;
  if (aHas) {
    const s = STATUS_RANK[a.status] - STATUS_RANK[b.status];
    if (s !== 0) return s;
  }
  return (b.created_at ?? "").localeCompare(a.created_at ?? "");
}

export const STATUS_STEPS: { key: KnowledgeStatus; label: string }[] = [
  { key: "not_started", label: "Not started" },
  { key: "in_progress", label: "In progress" },
  { key: "finished", label: "Finished" },
];

/**
 * Heuristic auto-categorization of a piece of Content from a URL — no AI.
 * Returns a best-guess content category the user can override. (Deciding
 * whether something is a Voice vs Content is a separate, explicit choice.)
 */
export function detectCategory(url?: string, _title?: string): KnowledgeCategory {
  const raw = (url ?? "").trim().toLowerCase();
  if (!raw) return "book"; // title-only entries are usually books

  const { host, path } = hostAndPath(raw);

  // Bible reading plans → program.
  if ((host.includes("bible.com") || host.includes("youversion")) && /reading-plans?/.test(path)) {
    return "program";
  }
  if (host.includes("ascensionpress.com") || /reading-plans?|\/plan(s)?\//.test(path)) {
    return "program";
  }

  if (host.includes("youtube.com") || host.includes("youtu.be") || host.includes("vimeo.com")) {
    return "video";
  }
  if (host.includes("podcasts.apple.com") || host.includes("open.spotify.com")) return "podcast";
  if (
    host.includes("instagram.com") ||
    host.includes("x.com") ||
    host.includes("twitter.com") ||
    host.includes("facebook.com") ||
    host.includes("tiktok.com")
  ) {
    return "post";
  }
  if (host.includes("amazon.") || host.includes("a.co") || host.includes("audible.")) return "book";
  return "article";
}

/* ------------------------------- Subtitles ------------------------------- */

/** The platform of a content item's primary link, as a byline — "Instagram". */
function primaryLinkPlatformLabel(item: KnowledgeItem): string | undefined {
  const links = item.links ?? [];
  const link = links.find((l) => l.favorite) ?? links[0];
  // "other" ("Link") is meaningless as a byline; skip it.
  return link && link.platform !== "other" ? LINK_PLATFORM_LABELS[link.platform] : undefined;
}

/**
 * Pretty one-line detail for a Content row: "Category · who · source". The
 * "who" is the Voice, else a typed creator, else — for unattributed content
 * only — the platform of its primary link (so an Instagram post with no author
 * reads "Post · Instagram"). Pass `hideVoice` (e.g. under a Voice's own group,
 * where the header already names it) to drop the Voice name while still showing
 * the platform for unattributed items.
 */
export function knowledgeSubtitle(
  item: KnowledgeItem,
  voices?: Voice[],
  opts?: { hideVoice?: boolean | undefined },
): string {
  const voiceName =
    !opts?.hideVoice && item.voice_id
      ? voices?.find((v) => v.id === item.voice_id)?.name
      : undefined;
  const platform = item.voice_id ? undefined : primaryLinkPlatformLabel(item);
  const who = voiceName ?? item.creator ?? platform;
  return [CATEGORY_LABELS[item.category], who, item.source].filter(Boolean).join(" · ");
}

/** The best single URL to open for a content item (favorited link first). */
export function primaryUrl(item: KnowledgeItem): string | undefined {
  const links = item.links ?? [];
  return (links.find((l) => l.favorite) ?? links[0])?.url;
}

/** Pretty one-line detail for a Voice row. */
export function voiceSubtitle(voice: Voice): string {
  const count = voice.channels?.length ?? 0;
  const channels = count ? `${count} ${count === 1 ? "channel" : "channels"}` : undefined;
  return [VOICE_KIND_LABELS[voice.kind], channels].filter(Boolean).join(" · ");
}

/* -------------------------------- Home ----------------------------------- */

/** A favorited link surfaced on Home, with the record it belongs to. */
export interface PinnedLink {
  ownerId: ID;
  ownerName: string;
  ownerType: "voice" | "content";
  platform: LinkPlatform;
  url: string;
  label?: string | undefined;
}

/** Every favorited channel + content link, for the Home library section. */
export function pinnedLinks(voices: Voice[], items: KnowledgeItem[]): PinnedLink[] {
  const out: PinnedLink[] = [];
  for (const v of voices) {
    for (const c of v.channels ?? []) {
      if (c.favorite)
        out.push({
          ownerId: v.id,
          ownerName: v.name,
          ownerType: "voice",
          platform: c.platform,
          url: c.url,
          label: c.label,
        });
    }
  }
  for (const it of items) {
    for (const l of it.links ?? []) {
      if (l.favorite)
        out.push({
          ownerId: it.id,
          ownerName: it.title,
          ownerType: "content",
          platform: l.platform,
          url: l.url,
          label: l.label,
        });
    }
  }
  return out;
}
