import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { ExternalLink, MoreVertical, NotebookPen, Pencil, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CATEGORY_LABELS,
  LINK_PLATFORM_LABELS,
  STATUS_STEPS,
  VOICE_KIND_LABELS,
  isScriptureProgram,
} from "@/lib/prayer/knowledge";
import { useApp } from "@/lib/prayer/store";

export const Route = createFileRoute("/knowledge/$knowledgeId")({
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
  const { db, ready, setKnowledgeStatus, toggleContentLinkFavorite, deleteKnowledgeItem } =
    useApp();
  const navigate = useNavigate();

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

  const voice = item.voice_id ? db.voices.find((v) => v.id === item.voice_id) : undefined;
  const links = item.links ?? [];

  const menu = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="secondary" className="size-9" aria-label="Actions">
          <MoreVertical className="size-4" aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => navigate({ to: "/formation", search: { edit: item.id } })}>
          <Pencil className="size-4" aria-hidden /> Edit
        </DropdownMenuItem>
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
    <AppShell title={item.title} back={{ to: "/formation", label: "Knowledge" }} action={menu}>
      <div className="space-y-4">
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

        {/* Voice (author) */}
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
          </p>
        ) : item.creator ? (
          <p className="text-sm text-muted-foreground">by {item.creator}</p>
        ) : null}

        {/* Links — where to find it, each pinnable */}
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
                    <ExternalLink className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                  </a>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-9 shrink-0"
                    aria-label={link.favorite ? "Unpin from Home" : "Pin to Home"}
                    title={link.favorite ? "Pinned to Home" : "Pin to Home"}
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

        {/* Tags */}
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

        {/* Notes */}
        {item.notes ? (
          <article className="soft-card p-4">
            <p className="eyebrow">Notes</p>
            <p className="mt-1 whitespace-pre-line text-sm">{item.notes}</p>
          </article>
        ) : null}

        {/* Status */}
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

        <Button asChild variant="secondary" className="h-11 w-full">
          <Link to="/reflections">
            <NotebookPen className="size-4" /> Reflect on this
          </Link>
        </Button>
      </div>
    </AppShell>
  );
}
