import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useApp } from "@/lib/prayer/store";
import { newId } from "@/lib/prayer/compiler";
import type { PrayerCategory } from "@/lib/prayer/types";

export const Route = createFileRoute("/prayer/$prayerId")({
  head: () => ({
    meta: [
      { title: "Prayer — Faith Journey" },
      { name: "description", content: "Read, edit, and manage versions of a prayer in your library." },
      { property: "og:title", content: "Prayer — Faith Journey" },
      { property: "og:description", content: "Prayer text, alternate versions, and source lineage." },
    ],
  }),
  component: PrayerDetail,
});

function PrayerDetail() {
  const { prayerId } = Route.useParams();
  const { db, upsertPrayer, addPrayerVersion, deletePrayer, toggleFavorite } = useApp();
  const navigate = useNavigate();
  const isNew = prayerId === "new";

  const prayer = db.prayers.find((p) => p.id === prayerId);
  const versions = db.prayer_versions.filter((v) => v.prayer_id === prayerId);
  const defaultVersion = versions.find((v) => v.id === prayer?.default_version_id) ?? versions[0];

  const [title, setTitle] = useState(prayer?.title ?? "");
  const [body, setBody] = useState(defaultVersion?.body ?? "");
  const [category, setCategory] = useState<PrayerCategory>(prayer?.category ?? "other");
  const [newVersionLabel, setNewVersionLabel] = useState("");
  const [newVersionBody, setNewVersionBody] = useState("");

  const source = db.sources.find((s) => s.id === (prayer?.source_id ?? defaultVersion?.source_id));

  const save = () => {
    if (!title.trim() || !body.trim()) {
      toast.error("A prayer needs a title and text.");
      return;
    }
    const id = prayer?.id ?? newId("prayer");
    const versionId = defaultVersion?.id ?? newId("ver");
    upsertPrayer(
      {
        id,
        title: title.trim(),
        category,
        tags: prayer?.tags ?? [],
        favorite: prayer?.favorite ?? false,
        default_version_id: versionId,
        created_at: prayer?.created_at ?? new Date().toISOString(),
        ...(prayer?.source_id ? { source_id: prayer.source_id } : {}),
      },
      {
        id: versionId,
        prayer_id: id,
        label: defaultVersion?.label ?? "Traditional",
        body: body.trim(),
        language: "en",
        created_at: defaultVersion?.created_at ?? new Date().toISOString(),
      },
    );
    toast.success(isNew ? "Prayer added" : "Prayer saved");
    navigate({ to: "/prayers" });
  };

  return (
    <AppShell
      title={isNew ? "Add a prayer" : (prayer?.title ?? "Prayer")}
      back={{ to: "/prayers", label: "Library" }}
      subtitle={isNew ? "Reusable prayer content" : undefined}
    >
      <div className="space-y-4">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 h-12"
          />
        </div>
        <div>
          <Label htmlFor="category">Category</Label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value as PrayerCategory)}
            className="mt-1 h-12 w-full rounded-md border border-input bg-card px-3"
          >
            {["core", "marian", "closing", "devotional", "family", "other"].map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="body">Prayer text</Label>
          <Textarea
            id="body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={10}
            className="mt-1"
          />
        </div>
        <Button className="h-12 w-full" onClick={save}>
          Save prayer
        </Button>

        {prayer ? (
          <>
            <Button
              variant="secondary"
              className="h-12 w-full"
              onClick={() => toggleFavorite(prayer.id)}
            >
              {prayer.favorite ? "Remove from favorites" : "Add to favorites"}
            </Button>

            <section className="soft-card p-4">
              <p className="eyebrow">Versions</p>
              <ul className="mt-2 space-y-3">
                {versions.map((v) => (
                  <li key={v.id}>
                    <p className="text-sm font-medium">
                      {v.label}
                      {v.id === prayer.default_version_id ? " · default" : ""}
                    </p>
                    <p className="line-clamp-3 text-sm text-muted-foreground">{v.body}</p>
                  </li>
                ))}
              </ul>
              <div className="mt-4 space-y-2">
                <Input
                  placeholder="New version label (e.g. Family wording)"
                  value={newVersionLabel}
                  onChange={(e) => setNewVersionLabel(e.target.value)}
                  className="h-11"
                />
                <Textarea
                  placeholder="Version text"
                  value={newVersionBody}
                  onChange={(e) => setNewVersionBody(e.target.value)}
                  rows={4}
                />
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => {
                    if (!newVersionLabel.trim() || !newVersionBody.trim()) return;
                    addPrayerVersion({
                      id: newId("ver"),
                      prayer_id: prayer.id,
                      label: newVersionLabel.trim(),
                      body: newVersionBody.trim(),
                      language: "en",
                      created_at: new Date().toISOString(),
                    });
                    setNewVersionLabel("");
                    setNewVersionBody("");
                    toast.success("Version added");
                  }}
                >
                  Add version
                </Button>
              </div>
            </section>

            {source ? (
              <section className="soft-card p-4">
                <p className="eyebrow">Source</p>
                <p className="mt-1 text-sm">{source.name}</p>
                <p className="text-sm text-muted-foreground">
                  {source.source_type}
                  {source.file_reference ? ` · ${source.file_reference}` : ""}
                </p>
                {source.url ? (
                  <a className="text-sm underline" href={source.url}>
                    View source
                  </a>
                ) : null}
              </section>
            ) : null}

            <Button
              variant="ghost"
              className="w-full text-destructive"
              onClick={() => {
                deletePrayer(prayer.id);
                toast.success("Prayer removed");
                navigate({ to: "/prayers" });
              }}
            >
              Delete prayer
            </Button>
          </>
        ) : null}
      </div>
    </AppShell>
  );
}
