import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, ExternalLink, NotebookPen, Plus } from "lucide-react";

import { AppShell } from "@/components/layout/PageShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { learnItems } from "@/domain/placeholderData";

export const Route = createFileRoute("/formation")({
  head: () => ({
    meta: [
      { title: "Formation — Faith Journey" },
      {
        name: "description",
        content:
          "Books, articles, videos, sermons, and podcasts you are reading and watching, with reflections attached.",
      },
      { property: "og:title", content: "Formation — Faith Journey" },
      {
        property: "og:description",
        content: "Track the books, videos, and sermons forming your faith right now.",
      },
    ],
  }),
  component: FormationPage,
});

const CONTENT_TYPE_LABELS: Record<string, string> = {
  book: "Book",
  article: "Article",
  newsletter: "Newsletter",
  video: "Video",
  sermon: "Sermon",
  podcast: "Podcast",
  show: "Show",
  other: "Other",
};

const STATUS_LABELS: Record<string, string> = {
  not_started: "Not started",
  in_progress: "In progress",
  finished: "Finished",
};

function FormationPage() {
  const inProgress = learnItems.filter((i) => i.status !== "finished");
  const finished = learnItems.filter((i) => i.status === "finished");

  return (
    <AppShell
      title="Formation"
      subtitle="Books, articles, videos, sermons, and podcasts"
      back={{ to: "/more", label: "More" }}
      action={
        <Button size="sm" variant="secondary">
          <Plus className="size-4" aria-hidden /> Item
        </Button>
      }
    >
      <ul className="space-y-2">
        {inProgress.map((item) => (
          <li key={item.id} className="soft-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium text-foreground">{item.title}</p>
                <p className="truncate text-sm text-muted-foreground">
                  {CONTENT_TYPE_LABELS[item.contentType]}
                  {item.creator ? ` · ${item.creator}` : ""}
                  {item.source ? ` · ${item.source}` : ""}
                </p>
              </div>
              <Badge variant="secondary" className="shrink-0 font-normal">
                {STATUS_LABELS[item.status]}
              </Badge>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <Button size="sm" variant="ghost">
                <NotebookPen className="size-4" aria-hidden /> Reflect
              </Button>
              {item.url ? (
                <Button asChild size="sm" variant="ghost">
                  <a href={item.url} target="_blank" rel="noreferrer">
                    <ExternalLink className="size-4" aria-hidden /> Open
                  </a>
                </Button>
              ) : null}
              {item.hasTranscript ? (
                <Button size="sm" variant="ghost">
                  <BookOpen className="size-4" aria-hidden /> Transcript
                </Button>
              ) : null}
            </div>
          </li>
        ))}
      </ul>

      <p className="eyebrow mt-8 mb-2">Finished</p>
      {finished.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nothing finished yet — completed items land here.
        </p>
      ) : (
        <ul className="space-y-2">
          {finished.map((item) => (
            <li key={item.id} className="soft-card p-4">
              <p className="font-medium text-foreground">{item.title}</p>
              <p className="text-sm text-muted-foreground">
                {CONTENT_TYPE_LABELS[item.contentType]}
                {item.creator ? ` · ${item.creator}` : ""}
              </p>
            </li>
          ))}
        </ul>
      )}
    </AppShell>
  );
}
