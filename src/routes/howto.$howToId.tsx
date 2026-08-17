import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { AppShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/prayer/store";
import { todayISO } from "@/lib/prayer/compiler";

export const Route = createFileRoute("/howto/$howToId")({
  head: () => ({
    meta: [
      { title: "How To — Faith Journey" },
      {
        name: "description",
        content:
          "Instructions for praying a devotion. Tap Start Prayer and the app expands the instructions into the full prayers.",
      },
      { property: "og:title", content: "How To — Faith Journey" },
      {
        property: "og:description",
        content: "Instructional shorthand here; complete prayers in Prayer Mode.",
      },
    ],
  }),
  component: HowToPage,
});

function HowToPage() {
  const { howToId } = Route.useParams();
  const { db, startSession } = useApp();
  const navigate = useNavigate();
  const howTo = db.how_tos.find((h) => h.id === howToId);
  const source = db.sources.find((s) => s.id === howTo?.source_id);
  const linkedTemplate = db.templates.find((t) => t.id === howTo?.template_id);

  if (!howTo) {
    return (
      <AppShell title="Not found" back={{ to: "/prayers", label: "Library" }}>
        <p className="text-sm text-muted-foreground">That guide is no longer available.</p>
      </AppShell>
    );
  }

  return (
    <AppShell title={howTo.title} subtitle={linkedTemplate ? `How to pray ${linkedTemplate.name}` : howTo.summary} back={{ to: "/prayers", label: "Library" }}>
      <ol className="space-y-4">
        {howTo.steps.map((step, i) => (
          <li key={step.id} className="soft-card flex gap-3 p-4">
            <span className="font-display text-xl text-muted-foreground tabular-nums">{i + 1}</span>
            <p>{step.text}</p>
          </li>
        ))}
      </ol>

      <p className="mt-6 text-sm text-muted-foreground">
        These are instructions, not the prayer session. Starting prayer expands every instruction
        into the actual prayers.
      </p>

      {howTo.template_id ? (
        <Button
          className="mt-4 h-14 w-full text-base"
          onClick={() => {
            const session = startSession(howTo.template_id!, {
              date: todayISO(),
              progress_mode: "scroll",
            });
            if (session)
              navigate({ to: "/session/$sessionId", params: { sessionId: session.id } });
          }}
        >
          <Sparkles className="size-5" /> Start Prayer
        </Button>
      ) : null}

      {source ? (
        <section className="soft-card mt-4 p-4">
          <p className="eyebrow">Source</p>
          <p className="mt-1 text-sm">{source.name}</p>
          {source.url ? (
            <a href={source.url} rel="noreferrer" className="text-sm text-primary underline break-all">
              {source.url}
            </a>
          ) : (
            <p className="text-sm text-muted-foreground">{source.attribution ?? "self"}</p>
          )}
          <p className="text-sm text-muted-foreground">
            {source.source_type}
            {source.file_reference ? ` · ${source.file_reference}` : ""}
          </p>
        </section>
      ) : null}
    </AppShell>
  );
}
