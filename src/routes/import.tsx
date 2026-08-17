import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useApp } from "@/lib/prayer/store";
import { analyzeText, resolveAttribution } from "@/lib/prayer/importer";
import { newId } from "@/lib/prayer/compiler";
import type { ImportCandidate, ImportDraft, SourceType } from "@/lib/prayer/types";

export const Route = createFileRoute("/import")({
  head: () => ({
    meta: [
      { title: "Import Prayers — Prayer Companion" },
      {
        name: "description",
        content:
          "Paste a booklet or prayer text and review each detected prayer, how-to, or mystery before it enters your library.",
      },
      { property: "og:title", content: "Import Prayers — Prayer Companion" },
      {
        property: "og:description",
        content: "Nothing is saved until you review it — duplicates are flagged automatically.",
      },
    ],
  }),
  component: ImportPage,
});

const DECISIONS: Array<{ value: ImportCandidate["decision"]; label: string }> = [
  { value: "save_new", label: "Save as new" },
  { value: "use_existing", label: "Use existing" },
  { value: "save_alternate_version", label: "Save as alternate version" },
  { value: "skip", label: "Skip" },
];

function ImportPage() {
  const { db, saveImportDraft, applyImportDraft } = useApp();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [sourceType, setSourceType] = useState<SourceType>("text");
  const [raw, setRaw] = useState("");
  const [url, setUrl] = useState("");
  const [draft, setDraft] = useState<ImportDraft | null>(null);

  const analyze = () => {
    if (!raw.trim()) {
      toast.error("Paste some text first.");
      return;
    }
    const { url: resolvedUrl, attribution } = resolveAttribution(raw, url);
    const next = analyzeText(db, raw, {
      id: newId("source"),
      source_type: resolvedUrl ? "web" : sourceType,
      name: name.trim() || "Pasted text",
      url: resolvedUrl,
      attribution,
      created_at: new Date().toISOString(),
    });
    setDraft(next);
    saveImportDraft(next);
  };

  const setDecision = (candidateId: string, decision: ImportCandidate["decision"]) => {
    setDraft((current) => {
      if (!current) return current;
      const next = {
        ...current,
        candidates: current.candidates.map((c) =>
          c.id === candidateId ? { ...c, decision } : c,
        ),
      };
      saveImportDraft(next);
      return next;
    });
  };

  const setLinkedTemplate = (candidateId: string, templateId: string) => {
    setDraft((current) => {
      if (!current) return current;
      const next = {
        ...current,
        candidates: current.candidates.map((c) =>
          c.id === candidateId ? { ...c, link_template_id: templateId || undefined } : c,
        ),
      };
      saveImportDraft(next);
      return next;
    });
  };

  const commit = () => {
    if (!draft) return;
    applyImportDraft(draft.id);
    setDraft(null);
    setRaw("");
    toast.success("Imported into your library");
    navigate({ to: "/prayers" });
  };

  return (
    <AppShell
      title="Import"
      subtitle="Review everything before it joins your library."
      back={{ to: "/more", label: "More" }}
    >
      {!draft ? (
        <div className="space-y-4">
          <div className="soft-card space-y-3 p-4">
            <div>
              <Label htmlFor="sname">Source name</Label>
              <Input
                id="sname"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Caro Family Rosary Booklet"
                className="mt-1 h-12"
              />
            </div>
            <div>
              <Label htmlFor="stype">Source type</Label>
              <select
                id="stype"
                value={sourceType}
                onChange={(e) => setSourceType(e.target.value as SourceType)}
                className="mt-1 h-12 w-full rounded-md border border-input bg-card px-3"
              >
                <option value="text">Pasted text</option>
                <option value="document">Document / PDF text</option>
                <option value="web">Web page</option>
              </select>
            </div>
            <div>
              <Label htmlFor="surl">Source URL (optional)</Label>
              <Input
                id="surl"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://… (leave blank and we look in the text)"
                className="mt-1 h-12"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                If no URL is given or printed in the document, we look for the publisher who
                printed it. When neither exists the source is recorded as “self”.
              </p>
            </div>
            <div>
              <Label htmlFor="raw">Text</Label>
              <Textarea
                id="raw"
                value={raw}
                onChange={(e) => setRaw(e.target.value)}
                rows={12}
                placeholder={"Hail Holy Queen\nHail, Holy Queen, Mother of Mercy…"}
                className="mt-1"
              />
              <p className="mt-2 text-xs text-muted-foreground">
                For a PDF, copy its text and paste it here. Each blank-line block with a short first
                line is treated as a titled section.
              </p>
            </div>
            <Button className="h-12 w-full" onClick={analyze}>
              Analyze text
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {draft.candidates.length} sections detected in {draft.source.name}. Nothing is saved
            until you confirm.
          </p>
          <p className="text-sm">
            <span className="eyebrow">Source</span>{" "}
            {draft.source.url ? (
              <a href={draft.source.url} className="text-primary underline" rel="noreferrer">
                {draft.source.url}
              </a>
            ) : (
              (draft.source.attribution ?? "self")
            )}
          </p>
          {draft.candidates.map((c) => {
            const duplicate = db.prayers.find((p) => p.id === c.duplicate_of_prayer_id);
            return (
              <article key={c.id} className="soft-card p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium">{c.title}</p>
                  <span className="eyebrow shrink-0">{c.classification.replace(/_/g, " ")}</span>
                </div>
                <p className="mt-2 line-clamp-4 text-sm text-muted-foreground whitespace-pre-line">
                  {c.body}
                </p>
                {duplicate ? (
                  <p className="mt-2 text-sm text-primary">
                    Looks like “{duplicate.title}” already in your library (
                    {Math.round((c.similarity ?? 0) * 100)}% match).
                  </p>
                ) : null}
                <select
                  value={c.decision}
                  aria-label={`Decision for ${c.title}`}
                  onChange={(e) =>
                    setDecision(c.id, e.target.value as ImportCandidate["decision"])
                  }
                  className="mt-3 h-11 w-full rounded-md border border-input bg-card px-3 text-sm"
                >
                  {DECISIONS.map((d) => (
                    <option key={d.value} value={d.value}>
                      {d.label}
                    </option>
                  ))}
                </select>
                {c.classification === "how_to" && c.decision !== "skip" ? (
                  <div className="mt-3">
                    <Label htmlFor={`tpl-${c.id}`} className="text-xs">
                      These instructions are for
                    </Label>
                    <select
                      id={`tpl-${c.id}`}
                      value={c.link_template_id ?? ""}
                      onChange={(e) => setLinkedTemplate(c.id, e.target.value)}
                      className="mt-1 h-11 w-full rounded-md border border-input bg-card px-3 text-sm"
                    >
                      <option value="">No specific devotion</option>
                      {db.templates.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Each novena has its own “How to pray” guide — pick the one this belongs to.
                    </p>
                  </div>
                ) : null}
              </article>
            );
          })}
          <div className="flex gap-2">
            <Button variant="outline" className="h-12 flex-1" onClick={() => setDraft(null)}>
              Back
            </Button>
            <Button className="h-12 flex-1" onClick={commit}>
              Add to library
            </Button>
          </div>
        </div>
      )}
    </AppShell>
  );
}
