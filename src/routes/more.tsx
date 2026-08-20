import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, CalendarDays, Download, FileText, Sparkles } from "lucide-react";

import { AppShell } from "@/components/layout/PageShell";
import { useApp } from "@/lib/prayer/store";

export const Route = createFileRoute("/more")({
  head: () => ({
    meta: [
      { title: "More — Faith Journey" },
      {
        name: "description",
        content:
          "Novenas, the prayer calendar, your Life Library, imported sources, and how-to guides.",
      },
      { property: "og:title", content: "More — Faith Journey" },
      {
        property: "og:description",
        content: "Novenas, calendar, Life Library, and prayer imports.",
      },
    ],
  }),
  component: MorePage,
});

function MorePage() {
  const { db } = useApp();

  const links = [
    {
      to: "/calendar",
      icon: CalendarDays,
      title: "Calendar",
      desc: "Mysteries, novena days, and what you have prayed",
    },
    {
      to: "/novenas",
      icon: Sparkles,
      title: "Novenas",
      desc: `${db.novena_instances.length} in progress`,
    },
    {
      to: "/formation",
      icon: BookOpen,
      title: "Learn",
      desc: `Life Library · ${db.learning_items.filter((i) => i.status !== "finished").length} in progress`,
    },
    {
      to: "/import",
      icon: Download,
      title: "Add prayers",
      desc: "Paste a booklet or type a single prayer",
    },
  ] as const;

  return (
    <AppShell title="More" subtitle="Everything behind the prayer.">
      <ul className="space-y-2">
        {links.map((l) => (
          <li key={l.to}>
            <Link to={l.to} className="soft-card flex items-center gap-3 p-4">
              <l.icon className="size-5 text-muted-foreground" aria-hidden />
              <span>
                <span className="block font-medium">{l.title}</span>
                <span className="block text-sm text-muted-foreground">{l.desc}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <p className="eyebrow mt-8 mb-2">How to guides</p>
      <ul className="space-y-2">
        {db.how_tos.map((h) => (
          <li key={h.id}>
            <Link
              to="/howto/$howToId"
              params={{ howToId: h.id }}
              className="soft-card flex items-center gap-3 p-4"
            >
              <FileText className="size-5 text-muted-foreground" aria-hidden />
              <span>
                <span className="block font-medium">{h.title}</span>
                <span className="block text-sm text-muted-foreground">{h.steps.length} steps</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <p className="eyebrow mt-8 mb-2">Sources</p>
      <ul className="space-y-2">
        {db.sources.map((s) => (
          <li key={s.id} className="soft-card p-4">
            <p className="font-medium">{s.name}</p>
            <p className="text-sm text-muted-foreground">
              {s.source_type}
              {s.attribution ? ` · ${s.attribution}` : ""}
            </p>
          </li>
        ))}
      </ul>
    </AppShell>
  );
}
