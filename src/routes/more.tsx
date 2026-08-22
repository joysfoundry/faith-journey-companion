import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarDays, Download, Lightbulb } from "lucide-react";

import { AppShell } from "@/components/layout/PageShell";
import { useApp } from "@/lib/prayer/store";

export const Route = createFileRoute("/more")({
  head: () => ({
    meta: [
      { title: "More — Faith Journey" },
      {
        name: "description",
        content: "The prayer calendar, your Life Library, imported sources, and how-to guides.",
      },
      { property: "og:title", content: "More — Faith Journey" },
      {
        property: "og:description",
        content: "Calendar, Life Library, and prayer imports.",
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
      desc: "Mysteries and what you have prayed",
    },
    {
      to: "/formation",
      icon: Lightbulb,
      title: "Knowledge",
      desc: `${db.knowledge_items.filter((i) => i.category !== "resource" && i.status === "in_progress").length} in progress · ${db.knowledge_items.length} saved`,
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
