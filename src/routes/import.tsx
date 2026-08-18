import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TaxonomySelect } from "@/components/prayer/PrayerFields";
import { PhotoDropzone, type LocalPhoto } from "@/components/media/PhotoDropzone";
import { useApp } from "@/lib/prayer/store";
import { analyzeText, draftFromWrittenPrayer, resolveAttribution } from "@/lib/prayer/importer";
import { newId } from "@/lib/prayer/compiler";
import {
  EXPRESSION_TYPES,
  PRAYER_TYPES,
  TAXONOMY_LABELS,
  type ExpressionType,
  type PrayerType,
} from "@/domain/taxonomy";
import type { ImportCandidate, ImportDraft, SourceType } from "@/lib/prayer/types";

export const Route = createFileRoute("/import")({
  validateSearch: (search: Record<string, unknown>): { mode?: "devotion" } =>
    search["mode"] === "devotion" ? { mode: "devotion" } : {},
  head: () => ({
    meta: [
      { title: "Add Prayers — Faith Journey" },
      {
        name: "description",
        content:
          "Add one prayer or a whole booklet: write it or paste it, then review every detected prayer, how-to, or mystery before it enters your library.",
      },
      { property: "og:title", content: "Add Prayers — Faith Journey" },
      {
        property: "og:description",
        content: "Nothing is saved until you review it — duplicates are flagged automatically.",
      },
    ],
  }),
  component: AddPrayersPage,
});

const DECISIONS: Array<{ value: ImportCandidate["decision"]; label: string }> = [
  { value: "save_new", label: "Save as new" },
  { value: "use_existing", label: "Use existing" },
  { value: "save_alternate_version", label: "Save as alternate version" },
  { value: "skip", label: "Skip" },
];

const SOURCE_TYPES: Array<{ value: SourceType; label: string }> = [
  { value: "written", label: "Written by me" },
  { value: "text", label: "Pasted text" },
  { value: "document", label: "Document / PDF text" },
  { value: "web", label: "Web page" },
];

function AddPrayersPage() {
  const { db, saveImportDraft, applyImportDraft } = useApp();
  const navigate = useNavigate();
  const { mode } = Route.useSearch();
  const [name, setName] = useState("");
  const [devotionName, setDevotionName] = useState("");
  const [sourceType, setSourceType] = useState<SourceType>("written");
  const [title, setTitle] = useState("");
  const [raw, setRaw] = useState("");
  const [url, setUrl] = useState("");
  const [prayerType, setPrayerType] = useState<PrayerType>("traditional_expression");
  const [expressionType, setExpressionType] = useState<ExpressionType>("vocal");
  const [draft, setDraft] = useState<ImportDraft | null>(null);

  const asDevotion = mode === "devotion";
  const isWritten = sourceType === "written" && !asDevotion;

  const analyze = () => {
    if (!raw.trim()) {
      toast.error("Add some prayer text first.");
      return;
    }
    if (isWritten && !title.trim()) {
      toast.error("Give the prayer a title.");
      return;
    }
    if (asDevotion && !devotionName.trim()) {
      toast.error("Name the devotion.");
      return;
    }
    const { url: resolvedUrl, attribution } = resolveAttribution(raw, url);
    const source = {
      id: newId("source"),
      source_type: resolvedUrl && !isWritten ? ("web" as SourceType) : sourceType,
      name: name.trim() || (isWritten ? "Written by me" : "Pasted text"),
      url: resolvedUrl,
      attribution: isWritten ? (attribution === "self" ? "self" : attribution) : attribution,
      created_at: new Date().toISOString(),
    };
    // One typed prayer skips block detection; a pasted bundle gets analyzed.
    const next = isWritten
      ? draftFromWrittenPrayer(db, title.trim(), raw.trim(), source, {
          prayer_type: prayerType,
          expression_type: expressionType,
        })
      : analyzeText(db, raw, source);
    if (asDevotion) next.devotion = { name: devotionName.trim() };
    setDraft(next);
    saveImportDraft(next);
  };

  const patchCandidate = (candidateId: string, patch: Partial<ImportCandidate>) => {
    setDraft((current) => {
      if (!current) return current;
      const next = {
        ...current,
        candidates: current.candidates.map((c) => (c.id === candidateId ? { ...c, ...patch } : c)),
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
    setTitle("");
    toast.success(asDevotion ? "Devotion and prayers added" : "Added to your library");
    navigate({ to: "/prayers" });
  };

  return (
    <AppShell
      title={asDevotion ? "New devotion" : "Add prayers"}
      subtitle={
        asDevotion
          ? "Paste the devotion. Each prayer is saved on its own, then bundled in order."
          : "One prayer or a whole booklet — written or pasted."
      }
      back={{ to: "/prayers", label: "Prayers" }}
    >
      {!draft ? (
        <div className="soft-card space-y-3 p-4">
          <div>
            <Label htmlFor="stype">Where it comes from</Label>
            <select
              id="stype"
              value={sourceType}
              onChange={(e) => setSourceType(e.target.value as SourceType)}
              className="mt-1 h-12 w-full rounded-md border border-input bg-card px-3"
            >
              {SOURCE_TYPES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {asDevotion ? (
            <div>
              <Label htmlFor="dname">Devotion name</Label>
              <Input
                id="dname"
                value={devotionName}
                onChange={(e) => setDevotionName(e.target.value)}
                placeholder="Divine Mercy Chaplet"
                className="mt-1 h-12"
              />
            </div>
          ) : null}

          {isWritten ? (
            <div>
              <Label htmlFor="ptitle">Prayer title</Label>
              <Input
                id="ptitle"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Hail, Holy Queen"
                className="mt-1 h-12"
              />
            </div>
          ) : (
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
          )}

          <TaxonomySelect
            id="prayer-type"
            label="Prayer type"
            value={prayerType}
            options={PRAYER_TYPES}
            onChange={(v) => setPrayerType(v as PrayerType)}
          />
          <TaxonomySelect
            id="expression-type"
            label="How it is prayed"
            value={expressionType}
            options={EXPRESSION_TYPES}
            onChange={(v) => setExpressionType(v as ExpressionType)}
          />
          {!isWritten ? (
            <p className="-mt-1 text-xs text-muted-foreground">
              Used as the starting point for each detected prayer — you can change any of them on the
              next screen.
            </p>
          ) : null}

          <div>
            <Label htmlFor="surl">Source URL (optional)</Label>
            <Input
              id="surl"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://…"
              className="mt-1 h-12"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Paste a link to import from, or keep it as the source of the text below. If none is
              given we look for a URL or publisher printed in the text, otherwise the source is
              recorded as “self”.
            </p>
          </div>

          <PhotoDropzone
            label="Source photos (optional)"
            hint="Snap or drop pages of a booklet, holy card, or prayer sheet. Photos stay with the source and flow into your Gallery; reading text from a photo arrives with Cloud, so paste the wording below for now."
            photos={photos}
            onChange={setPhotos}
          />

          <div>
            <Label htmlFor="raw">{isWritten ? "Prayer text" : "Text"}</Label>
            <Textarea
              id="raw"
              value={raw}
              onChange={(e) => setRaw(e.target.value)}
              rows={isWritten ? 10 : 12}
              placeholder={
                isWritten
                  ? "Hail, Holy Queen, Mother of Mercy…"
                  : "Hail Holy Queen\nHail, Holy Queen, Mother of Mercy…"
              }
              className="mt-1"
            />
            {!isWritten ? (
              <p className="mt-2 text-xs text-muted-foreground">
                For a PDF, copy its text and paste it here. Each block with a short first line is
                treated as a titled section.
              </p>
            ) : null}
          </div>
          <Button className="h-12 w-full" onClick={analyze}>
            {isWritten ? "Review prayer" : "Analyze text"}
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {draft.candidates.length} section{draft.candidates.length === 1 ? "" : "s"} detected in{" "}
            {draft.source.name}. Nothing is saved until you confirm.
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
            const isPrayer = c.classification === "prayer" || c.classification === "prayer_version";
            return (
              <article key={c.id} className="soft-card p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium">{c.title}</p>
                  <span className="eyebrow shrink-0">{c.classification.replace(/_/g, " ")}</span>
                </div>
                <p className="mt-2 line-clamp-4 text-sm whitespace-pre-line text-muted-foreground">
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
                    patchCandidate(c.id, {
                      decision: e.target.value as ImportCandidate["decision"],
                    })
                  }
                  className="mt-3 h-11 w-full rounded-md border border-input bg-card px-3 text-sm"
                >
                  {DECISIONS.map((d) => (
                    <option key={d.value} value={d.value}>
                      {d.label}
                    </option>
                  ))}
                </select>
                {isPrayer && c.decision === "save_new" ? (
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    <select
                      value={c.prayer_type ?? "traditional_expression"}
                      aria-label={`Prayer type for ${c.title}`}
                      onChange={(e) =>
                        patchCandidate(c.id, { prayer_type: e.target.value as PrayerType })
                      }
                      className="h-11 w-full rounded-md border border-input bg-card px-3 text-sm"
                    >
                      {PRAYER_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {TAXONOMY_LABELS[t]}
                        </option>
                      ))}
                    </select>
                    <select
                      value={c.expression_type ?? "vocal"}
                      aria-label={`How ${c.title} is prayed`}
                      onChange={(e) =>
                        patchCandidate(c.id, { expression_type: e.target.value as ExpressionType })
                      }
                      className="h-11 w-full rounded-md border border-input bg-card px-3 text-sm"
                    >
                      {EXPRESSION_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {TAXONOMY_LABELS[t]}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : null}
                {c.classification === "how_to" && c.decision !== "skip" ? (
                  <div className="mt-3">
                    <Label htmlFor={`tpl-${c.id}`} className="text-xs">
                      These instructions are for
                    </Label>
                    <select
                      id={`tpl-${c.id}`}
                      value={c.link_template_id ?? ""}
                      onChange={(e) =>
                        patchCandidate(c.id, { link_template_id: e.target.value || undefined })
                      }
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
