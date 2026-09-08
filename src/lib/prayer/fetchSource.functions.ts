import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/**
 * Fetches a web page and returns readable text with line structure preserved.
 * Prayer pages rely on line breaks (V/. and R/. responses, rubrics), so we keep
 * newlines rather than collapsing everything into a paragraph.
 */
export const fetchSourceText = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({ url: z.string().url() }).parse(data))
  .handler(async ({ data }) => {
    const response = await fetch(data.url, {
      headers: {
        "user-agent":
          "Mozilla/5.0 (compatible; FaithJourney/1.0; prayer text import)",
        accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
    });
    if (!response.ok) {
      return { ok: false as const, error: `The page returned ${response.status}.`, text: "", title: "" };
    }
    const html = await response.text();
    return { ok: true as const, error: null, text: htmlToText(html), title: pageTitle(html) };
  });

/**
 * Best-effort link preview for the Vessels quick-add (ACTS-171): fetch a URL
 * server-side (no CORS wall) and pull its Open Graph / Twitter / <title>
 * metadata so pasting a link can pre-fill a saved item. Always best-effort —
 * a login-walled or unreachable page (Instagram, say) returns empty fields and
 * `ok: false`, and the caller keeps the raw link rather than blocking the save.
 */
export const fetchLinkPreview = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({ url: z.string().url() }).parse(data))
  .handler(async ({ data }) => {
    const empty = {
      title: "",
      description: "",
      siteName: "",
      imageUrl: "",
      author: { name: "", handle: "", profileUrl: "" },
    };
    const guard = guardPreviewUrl(data.url);
    if (!guard.ok) return { ok: false as const, error: guard.error, ...empty };
    try {
      const response = await fetch(data.url, {
        headers: {
          "user-agent": "Mozilla/5.0 (compatible; Oravia/1.0; link preview)",
          accept: "text/html,application/xhtml+xml",
        },
        redirect: "follow",
      });
      if (!response.ok) {
        return { ok: false as const, error: `The page returned ${response.status}.`, ...empty };
      }
      const html = await response.text();
      return {
        ok: true as const,
        error: null,
        title:
          metaContent(html, "og:title", "twitter:title") || pageTitle(html) || "",
        description: metaContent(html, "og:description", "twitter:description"),
        siteName: metaContent(html, "og:site_name", "application-name"),
        imageUrl: metaContent(html, "og:image", "twitter:image", "twitter:image:src"),
        author: extractAuthor(html, data.url),
      };
    } catch {
      return { ok: false as const, error: "Could not reach that link.", ...empty };
    }
  });

/**
 * Best-effort author behind a link — the person/channel/site to name a Vessel
 * after, so a saved item is attributed to "@handle" or a channel/site, never the
 * bare domain. A social **post** URL often omits the handle (an Instagram reel
 * link is just `/reel/<id>/`), so the author comes from the page's metadata, not
 * the path. `profileUrl` is the account's home — used to match future posts from
 * the same account back to the Vessel this one creates.
 */
function extractAuthor(
  html: string,
  url: string,
): { name: string; handle: string; profileUrl: string } {
  const host = safeHost(url);

  // Instagram: handle from "(@handle)" in twitter:title, else "- handle on …" in
  // the description; display name from "<Name> on Instagram" in og:title.
  if (host.includes("instagram.com")) {
    const tw = metaContent(html, "twitter:title");
    const desc = metaContent(html, "og:description");
    const title = metaContent(html, "og:title");
    const handle =
      tw.match(/\(@([A-Za-z0-9_.]+)\)/)?.[1] ||
      desc.match(/-\s*([A-Za-z0-9_.]+)\s+on\b/i)?.[1] ||
      "";
    const name =
      tw.match(/^(.*?)\s*\(@/)?.[1]?.trim() ||
      title.match(/^(.+?)\s+on Instagram/i)?.[1]?.trim() ||
      "";
    return { name, handle, profileUrl: handle ? `https://www.instagram.com/${handle}/` : "" };
  }

  // YouTube: the channel comes from the embedded player JSON, not OG tags.
  if (host.includes("youtube.com") || host.includes("youtu.be")) {
    const owner = html.match(/"ownerProfileUrl":"([^"]+)"/)?.[1]?.replace(/\\\//g, "/") ?? "";
    const canonical = html.match(/"canonicalBaseUrl":"(\/@[^"]+)"/)?.[1] ?? "";
    const handle = owner.match(/@([\w.-]+)/)?.[1] || canonical.match(/@([\w.-]+)/)?.[1] || "";
    const name = unescapeJson(html.match(/"author":"([^"]+)"/)?.[1] ?? "");
    return { name, handle, profileUrl: owner || (handle ? `https://www.youtube.com/@${handle}` : "") };
  }

  // Generic web: the site is the "author"; its home page is the profile.
  return {
    name: metaContent(html, "og:site_name", "application-name"),
    handle: "",
    profileUrl: safeOrigin(url),
  };
}

/** Un-escape the \uXXXX and \-escapes inside a JSON string value. */
function unescapeJson(s: string): string {
  return s
    .replace(/\\u([0-9a-fA-F]{4})/g, (_m, h: string) => String.fromCharCode(parseInt(h, 16)))
    .replace(/\\(.)/g, "$1")
    .trim();
}

function safeHost(url: string): string {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return "";
  }
}

function safeOrigin(url: string): string {
  try {
    return new URL(url).origin;
  } catch {
    return "";
  }
}

/**
 * Reject URLs the server should not fetch on the user's behalf: non-http(s)
 * schemes and hosts that point back inside the network (loopback, link-local,
 * RFC-1918 private ranges, the cloud metadata IP). A literal-host guard — it
 * does not resolve DNS, so a public name that resolves to a private address
 * (DNS rebinding) is not covered; that would need resolve-then-check.
 */
function guardPreviewUrl(raw: string): { ok: true } | { ok: false; error: string } {
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    return { ok: false, error: "That doesn't look like a valid link." };
  }
  if (u.protocol !== "http:" && u.protocol !== "https:") {
    return { ok: false, error: "Only http(s) links can be previewed." };
  }
  const host = u.hostname.toLowerCase().replace(/^\[|\]$/g, "");
  const isPrivate =
    host === "localhost" ||
    host.endsWith(".localhost") ||
    host === "0.0.0.0" ||
    host === "::1" ||
    host === "169.254.169.254" || // cloud metadata
    /^127\./.test(host) ||
    /^10\./.test(host) ||
    /^192\.168\./.test(host) ||
    /^169\.254\./.test(host) || // link-local
    /^172\.(1[6-9]|2\d|3[01])\./.test(host) ||
    /^(fc|fd)[0-9a-f]{2}:/.test(host) || // unique-local IPv6
    /^fe80:/.test(host); // link-local IPv6
  if (isPrivate) return { ok: false, error: "That link points to a private address." };
  return { ok: true };
}

/**
 * First matching `<meta>` content for any of the given og:/twitter:/name keys.
 * Tolerates attribute order (content before or after property/name).
 */
function metaContent(html: string, ...keys: string[]): string {
  for (const key of keys) {
    const esc = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const tag = html.match(
      new RegExp(`<meta[^>]+(?:property|name)=["']${esc}["'][^>]*>`, "i"),
    )?.[0];
    const content = tag?.match(/content=["']([^"']*)["']/i)?.[1];
    if (content) return decodeEntities(content).slice(0, 300).trim();
  }
  return "";
}

/** Decode the handful of HTML entities that show up in meta/title text. */
function decodeEntities(s: string): string {
  return s
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/&hellip;/gi, "…")
    .replace(/&mdash;/gi, "—")
    .replace(/&ndash;/gi, "–")
    .replace(/&#x([0-9a-f]+);/gi, (_m, hex: string) => codePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_m, code: string) => codePoint(Number(code)))
    .replace(/\s+/g, " ")
    .trim();
}

/** Guarded String.fromCodePoint — drops an out-of-range numeric entity rather than throwing. */
function codePoint(n: number): string {
  return Number.isFinite(n) && n >= 0 && n <= 0x10ffff ? String.fromCodePoint(n) : "";
}

/** Best-effort page title: <h1> if present, else <title> (stripped of site suffix). */
function pageTitle(html: string): string {
  const decode = (s: string) =>
    s
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/gi, " ")
      .replace(/&amp;/gi, "&")
      .replace(/&#39;|&apos;/gi, "'")
      .replace(/&quot;/gi, '"')
      .replace(/\s+/g, " ")
      .trim();
  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1];
  if (h1) return decode(h1).slice(0, 120);
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1];
  if (title) return (decode(title).split(/\s*[|–—-]\s*/)[0] ?? "").slice(0, 120);
  return "";
}

/** Minimal, dependency-free HTML → text with block-level line breaks. */
function htmlToText(html: string): string {
  const body = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1] ?? html;
  const text = body
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<(nav|header|footer|form|aside|svg|iframe)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|tr|h[1-6]|blockquote|section|article)>/gi, "\n\n")
    .replace(/<h([1-6])[^>]*>/gi, "\n\n")
    .replace(/<li[^>]*>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&hellip;/gi, "…")
    .replace(/&mdash;/gi, "—")
    .replace(/&ndash;/gi, "–")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#(\d+);/g, (_m, code: string) => String.fromCharCode(Number(code)));

  return text
    .split("\n")
    .map((line) => line.replace(/[ \t\u00a0]+/g, " ").trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
