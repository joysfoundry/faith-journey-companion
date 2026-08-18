import { useState } from "react";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  PrayerFields,
  buildPrayerRecords,
  type PrayerDraft,
} from "@/components/prayer/PrayerFields";
import { useApp } from "@/lib/prayer/store";
import { newId } from "@/lib/prayer/compiler";

export const Route = createFileRoute("/prayer/$prayerId")({
  head: () => ({
    meta: [
      { title: "Prayer — Faith Journey" },
      { name: "description", content: "Read, edit, and manage versions of a prayer in your library." },
      { property: "og:title", content: "Prayer — Faith Journey" },
      { property: "og:description", content: "Prayer text, alternate versions, and source lineage." },
    ],
  }),
  // Adding a prayer lives on the single "Add prayers" screen.
  beforeLoad: ({ params }) => {
    if (params.prayerId === "new") throw redirect({ to: "/import" });
  },
  component: PrayerDetail,
});

function PrayerDetail() {
  const { prayerId } = Route.useParams();
  const { db, upsertPrayer, addPrayerVersion, deletePrayer, toggleFavorite } = useApp();
  const navigate = useNavigate();

  const prayer = db.prayers.find((p) => p.id === prayerId);
  const versions = db.prayer_versions.filter((v) => v.prayer_id === prayerId);
  const defaultVersion = versions.find((v) => v.id === prayer?.default_version_id) ?? versions[0];

  const [draft, setDraft] = useState<PrayerDraft>({
    title: prayer?.title ?? "",
    body: defaultVersion?.body ?? "",
    prayerType: prayer?.prayer_type ?? "devotional",
    expressionType: prayer?.expression_type ?? "vocal",
  });
  const [newVersionLabel, setNewVersionLabel] = useState("");
  const [newVersionBody, setNewVersionBody] = useState("");

  const source = db.sources.find((s) => s.id === (prayer?.source_id ?? defaultVersion?.source_id));

  const save = () => {
    if (!draft.title.trim() || !draft.body.trim()) {
      toast.error("A prayer needs a title and text.");
      return;
    }
    const records = buildPrayerRecords(draft, { prayer, version: defaultVersion });
    upsertPrayer(records.prayer, records.version);
    toast.success("Prayer saved");
    navigate({ to: "/prayers" });
  };

  return (
    <AppShell
      title={prayer?.title ?? "Prayer"}
      back={{ to: "/prayers", label: "Prayers" }}
    >
      <div className="space-y-4">
        <PrayerFields draft={draft} onChange={setDraft} />
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
              {versions.length > 1 ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  The default version is the one used when you pray.
                </p>
              ) : null}
              <ul className="mt-2 space-y-3">
                {versions.map((v) => {
                  const isDefault = v.id === (prayer.default_version_id ?? versions[0]?.id);
                  return (
                    <li key={v.id} className="flex items-start gap-3">
                      {versions.length > 1 ? (
                        <input
                          type="radio"
                          name="default-version"
                          className="mt-1 size-4"
                          checked={isDefault}
                          aria-label={`Use ${v.label} as default`}
                          onChange={() => {
                            upsertPrayer({ ...prayer, default_version_id: v.id }, v);
                            setDraft((d) => ({ ...d, body: v.body }));
                            toast.success(`“${v.label}” is now the default`);
                          }}
                        />
                      ) : null}
                      <div className="min-w-0">
                        <p className="text-sm font-medium">
                          {v.label}
                          {isDefault ? " · default" : ""}
                        </p>
                        <p className="line-clamp-3 text-sm text-muted-foreground">{v.body}</p>
                      </div>
                    </li>
                  );
                })}
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
