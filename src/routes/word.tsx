import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { WordSection } from "@/components/home/WordSection";
import { AppShell } from "@/components/layout/PageShell";

export const Route = createFileRoute("/word")({
  head: () => ({
    meta: [
      { title: "Word — ACTS" },
      {
        name: "description",
        content:
          "Today's Mass readings, the Mass you attended, and the reading programs you follow.",
      },
      { property: "og:title", content: "Word — ACTS" },
      {
        property: "og:description",
        content: "Daily Mass readings, homily capture, and your reading programs.",
      },
    ],
  }),
  component: WordPage,
});

function WordPage() {
  const navigate = useNavigate();

  return (
    <AppShell title="Word" subtitle="Today's readings and your reading programs">
      <WordSection onReflect={() => navigate({ to: "/reflections" })} />
    </AppShell>
  );
}
