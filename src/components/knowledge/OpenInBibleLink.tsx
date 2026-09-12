import { BookOpen, ExternalLink as LinkIcon } from "lucide-react";

import { ExternalLink as ExtLink } from "@/components/ui/external-link";
import { buildPassageUrl } from "@/lib/bible/apps";
import { useApp } from "@/lib/prayer/store";

/**
 * "Open in your Bible" deep-link for a cited scripture passage (ACTS-196). Given a
 * `scripture_ref`, it builds a link to that exact passage in the reader's chosen
 * Bible (falling back to Bible Gateway) — so a precise, cited quote always has the
 * official text one tap away, wherever the quote appears (journal, inspiration
 * cards, Vessels rows). Renders nothing when there's no citation to link.
 *
 * The passage text is never embedded (translation licensing) — this is the deep-link
 * that lets a paraphrase or another version reach the exact source.
 */
export function OpenInBibleLink({
  reference,
  className,
  label = "Open in your Bible",
  iconOnly = false,
}: {
  reference: string | undefined;
  className?: string | undefined;
  label?: string;
  /** Render just a compact book icon (with the label as tooltip/aria) — for tight
   *  rows where the citation is already shown right beside it. */
  iconOnly?: boolean;
}) {
  const { db } = useApp();
  const ref = reference?.trim();
  if (!ref) return null;
  const href = buildPassageUrl(db.settings, ref);

  if (iconOnly) {
    return (
      <ExtLink
        href={href}
        aria-label={`${label} — ${ref}`}
        title={label}
        className={className ?? "inline-flex text-primary hover:text-primary/80"}
      >
        <BookOpen className="size-3.5" aria-hidden />
      </ExtLink>
    );
  }

  return (
    <ExtLink
      href={href}
      className={
        className ??
        "inline-flex items-center gap-1 text-xs text-primary hover:underline"
      }
    >
      {label}
      <LinkIcon className="size-3" aria-hidden />
    </ExtLink>
  );
}
