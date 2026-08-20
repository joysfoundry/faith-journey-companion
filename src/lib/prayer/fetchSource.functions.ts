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
