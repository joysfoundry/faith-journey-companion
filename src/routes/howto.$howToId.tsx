import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ExternalLink, ListPlus, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useApp } from "@/lib/prayer/store";

export const Route = createFileRoute("/howto/$howToId")({
  head: () => ({
    meta: [
      { title: "How To — Faith Journey" },
      {
        name: "description",
        content:
          "Instructions for praying a devotion, with reference links. Turn a guide into an editable devotion template.",
      },
      { property: "og:title", content: "How To — Faith Journey" },
      {
        property: "og:description",
        content: "Instructional shorthand here; complete prayers live in the devotion template.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: HowToPage,
});

function HowToPage() {
  const { howToId } = Route.useParams();
  const { db, saveHowTo, createTemplateFromHowTo } = useApp();
  const navigate = useNavigate();
  const howTo = db.how_tos.find((h) => h.id === howToId);
  const source = db.sources.find((s) => s.id === howTo?.source_id);
  const linkedTemplate = db.templates.find((t) => t.id === howTo?.template_id);

  const [editing, setEditing] = useState(false);
  const [steps, setSteps] = useState<string[]>(() => (howTo?.steps ?? []).map((s) => s.text));
  const [links, setLinks] = useState<string[]>(() => howTo?.links ?? []);
  const [newLink, setNewLink] = useState("");

  if (!howTo) {
    return (
      <AppShell title="Not found" back={{ to: "/prayers", label: "Prayers" }}>
        <p className="text-sm text-muted-foreground">That guide is no longer available.</p>
      </AppShell>
    );
  }

  const startEditing = () => {
    setSteps(howTo.steps.map((s) => s.text));
    setLinks(howTo.links ?? []);
    setEditing(true);
  };

  const save = () => {
    const cleaned = steps.map((t) => t.trim()).filter(Boolean);
    saveHowTo({
      ...howTo,
      links: links.map((l) => l.trim()).filter(Boolean),
      steps: cleaned.map((text, i) => ({
        id: howTo.steps[i]?.id ?? `${howTo.id}-s${i}-${Date.now()}`,
        how_to_id: howTo.id,
        position: i,
        text,
      })),
    });
    setEditing(false);
    toast.success("Guide saved");
  };

  const addLink = () => {
    const value = newLink.trim();
    if (!value) return;
    setLinks((l) => [...l, value]);
    setNewLink("");
  };

  return (
    <AppShell
      title={howTo.title}
      subtitle={linkedTemplate ? `How to pray ${linkedTemplate.name}` : howTo.summary}
      back={{ to: "/prayers", label: "Prayers" }}
    >
      {editing ? (
        <section className="space-y-4">
          <div className="space-y-2">
            <p className="eyebrow">Steps</p>
            {steps.map((text, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="pt-3 font-display text-lg text-muted-foreground tabular-nums">
                  {i + 1}
                </span>
                <Textarea
                  value={text}
                  rows={2}
                  onChange={(e) =>
                    setSteps((s) => s.map((v, idx) => (idx === i ? e.target.value : v)))
                  }
                />
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Remove step"
                  onClick={() => setSteps((s) => s.filter((_, idx) => idx !== i))}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
            <Button variant="outline" onClick={() => setSteps((s) => [...s, ""])}>
              <Plus className="size-4" /> Add step
            </Button>
          </div>

          <div className="space-y-2">
            <p className="eyebrow">Links (videos, websites)</p>
            {links.map((link, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input
                  value={link}
                  onChange={(e) =>
                    setLinks((l) => l.map((v, idx) => (idx === i ? e.target.value : v)))
                  }
                  placeholder="https://…"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Remove link"
                  onClick={() => setLinks((l) => l.filter((_, idx) => idx !== i))}
                >
                  <X className="size-4" />
                </Button>
              </div>
            ))}
            <div className="flex items-center gap-2">
              <Input
                value={newLink}
                onChange={(e) => setNewLink(e.target.value)}
                placeholder="Add a URL to a video or website"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addLink();
                  }
                }}
              />
              <Button variant="outline" onClick={addLink}>
                Add
              </Button>
            </div>
          </div>

          <div className="flex gap-2">
            <Button className="flex-1" onClick={save}>
              Save guide
            </Button>
            <Button variant="outline" onClick={() => setEditing(false)}>
              Cancel
            </Button>
          </div>
        </section>
      ) : (
        <>
          <ol className="space-y-4">
            {howTo.steps.map((step, i) => (
              <li key={step.id} className="soft-card flex gap-3 p-4">
                <span className="font-display text-xl text-muted-foreground tabular-nums">
                  {i + 1}
                </span>
                <p>{step.text}</p>
              </li>
            ))}
          </ol>

          {howTo.links?.length ? (
            <section className="soft-card mt-4 p-4">
              <p className="eyebrow">Links</p>
              <ul className="mt-2 space-y-2">
                {howTo.links.map((link) => (
                  <li key={link} className="flex items-start gap-2 text-sm">
                    <ExternalLink className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                    <a
                      href={link}
                      target="_blank"
                      rel="noreferrer"
                      className="break-all text-primary underline"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <p className="mt-6 text-sm text-muted-foreground">
            These are instructions, not the prayer session. Creating a devotion template turns each
            instruction into an item you can replace with the actual prayers.
          </p>

          <div className="mt-4 flex gap-2">
            <Button
              className="h-14 flex-1 text-base"
              onClick={() => {
                const templateId = createTemplateFromHowTo(howTo.id);
                if (templateId)
                  navigate({ to: "/template/$templateId", params: { templateId } });
              }}
            >
              <ListPlus className="size-5" />
              Create Devotion Template
            </Button>
            <Button variant="outline" className="h-14" onClick={startEditing}>
              Edit steps
            </Button>
          </div>
        </>
      )}

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
