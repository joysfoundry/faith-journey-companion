import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ExternalLink, NotebookPen, Plus } from "lucide-react";

import { AppShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { newId } from "@/lib/prayer/compiler";
import { useApp } from "@/lib/prayer/store";
import type { LearningStatus } from "@/lib/prayer/types";

export const Route = createFileRoute("/formation")({
  validateSearch: (search: Record<string, unknown>): { add?: boolean } =>
    search["add"] === "1" || search["add"] === true ? { add: true } : {},
  head: () => ({
    meta: [
      { title: "Learn — Faith Journey" },
      {
        name: "description",
        content:
          "Your Life Library — books, articles, videos, sermons, and podcasts you are reading and watching, with reflections attached.",
      },
      { property: "og:title", content: "Learn — Faith Journey" },
      {
        property: "og:description",
        content: "Your Life Library — the books, videos, and sermons forming your faith right now.",
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
  podcast: "Podcast",
  sermon: "Sermon",
  show: "Show",
  social_media: "Social media",
  course: "Course",
  other: "Other",
};

const STATUS_STEPS: { key: LearningStatus; label: string }[] = [
  { key: "not_started", label: "Not started" },
  { key: "in_progress", label: "In progress" },
  { key: "finished", label: "Finished" },
];

function FormationPage() {
  const { db, setLearningStatus, addLearningItem } = useApp();
  const navigate = useNavigate();
  const { add } = Route.useSearch();
  const [adding, setAdding] = useState(Boolean(add));
  const [title, setTitle] = useState("");
  const [creator, setCreator] = useState("");
  const [contentType, setContentType] = useState("book");
  const [url, setUrl] = useState("");

  const items = db.learning_items;
  const active = items.filter((i) => i.status !== "finished");
  const finished = items.filter((i) => i.status === "finished");

  function submit() {
    if (!title.trim()) return;
    addLearningItem({
      id: newId("learn"),
      title: title.trim(),
      content_type: contentType,
      creator: creator.trim() || undefined,
      url: url.trim() || undefined,
      status: "not_started",
      created_at: new Date().toISOString(),
    });
    setTitle("");
    setCreator("");
    setUrl("");
    setContentType("book");
    setAdding(false);
  }

  return (
    <AppShell
      title="Learn"
      subtitle="Your Life Library — books, articles, videos, sermons, podcasts"
      back={{ to: "/more", label: "More" }}
      action={
        <Button size="sm" variant="secondary" onClick={() => setAdding((v) => !v)}>
          <Plus className="size-4" aria-hidden /> Item
        </Button>
      }
    >
      {adding ? (
        <div className="soft-card mb-4 space-y-2 p-4">
          <label className="block text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Type
          </label>
          <select
            value={contentType}
            onChange={(e) => setContentType(e.target.value)}
            aria-label="Type"
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            {Object.entries(CONTENT_TYPE_LABELS).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="h-10"
          />
          <Input
            value={creator}
            onChange={(e) => setCreator(e.target.value)}
            placeholder="Author / creator (optional)"
            className="h-10"
          />
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Link (optional)"
            className="h-10"
          />
          <Button className="w-full" onClick={submit} disabled={!title.trim()}>
            Add to Life Library
          </Button>
        </div>
      ) : null}

      <p className="eyebrow mb-2">In progress &amp; up next</p>
      <ul className="space-y-2">
        {active.length === 0 ? (
          <li className="text-sm text-muted-foreground">
            Nothing active — add something forming your faith.
          </li>
        ) : null}
        {active.map((item) => (
          <li key={item.id} className="soft-card p-4">
            <div className="min-w-0">
              <p className="font-medium text-foreground">{item.title}</p>
              <p className="truncate text-sm text-muted-foreground">
                {CONTENT_TYPE_LABELS[item.content_type] ?? item.content_type}
                {item.creator ? ` · ${item.creator}` : ""}
                {item.source ? ` · ${item.source}` : ""}
              </p>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              {STATUS_STEPS.map((s) => (
                <button
                  key={s.key}
                  onClick={() => setLearningStatus(item.id, s.key)}
                  className="rounded-full px-2.5 py-1 text-xs font-medium"
                  style={{
                    background:
                      item.status === s.key ? "hsl(var(--primary))" : "hsl(var(--secondary))",
                    color:
                      item.status === s.key
                        ? "hsl(var(--primary-foreground))"
                        : "hsl(var(--muted-foreground))",
                  }}
                >
                  {s.label}
                </button>
              ))}
              <span className="ml-auto flex items-center gap-1">
                <Button size="sm" variant="ghost" onClick={() => navigate({ to: "/reflections" })}>
                  <NotebookPen className="size-4" aria-hidden /> Reflect
                </Button>
                {item.url ? (
                  <Button asChild size="sm" variant="ghost">
                    <a href={item.url} target="_blank" rel="noreferrer">
                      <ExternalLink className="size-4" aria-hidden /> Open
                    </a>
                  </Button>
                ) : null}
              </span>
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
            <li key={item.id} className="soft-card flex items-center justify-between gap-3 p-4">
              <div className="min-w-0">
                <p className="font-medium text-foreground">{item.title}</p>
                <p className="truncate text-sm text-muted-foreground">
                  {CONTENT_TYPE_LABELS[item.content_type] ?? item.content_type}
                  {item.creator ? ` · ${item.creator}` : ""}
                </p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setLearningStatus(item.id, "in_progress")}
              >
                Reopen
              </Button>
            </li>
          ))}
        </ul>
      )}
    </AppShell>
  );
}
