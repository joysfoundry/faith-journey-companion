import { useState } from "react";
import { Link, createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
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
import { useApp, variantsOf } from "@/lib/prayer/store";
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
  const {
    db,
    upsertPrayer,
    addPrayerVariant,
    setDefaultVariant,
    deletePrayer,
    toggleFavorite,
  } = useApp();
  const navigate = useNavigate();

  const prayer = db.prayers.find((p) => p.id === prayerId);
  const version = db.prayer_versions.find((v) => v.prayer_id === prayerId);
  // Each wording is its own prayer record; siblings share a variant group.
  const siblings = prayer ? variantsOf(db, prayer) : [];

  const [draft, setDraft] = useState<PrayerDraft>({
    title: prayer?.title ?? "",
    body: version?.body ?? "",
    prayerType: prayer?.prayer_type ?? "devotional",
    expressionType: prayer?.expression_type ?? "vocal",
  });
  const [newVersionLabel, setNewVersionLabel] = useState("");
  const [newVersionBody, setNewVersionBody] = useState("");

  const source = db.sources.find((s) => s.id === (prayer?.source_id ?? version?.source_id));

  const save = () => {
    if (!draft.title.trim() || !draft.body.trim()) {
      toast.error("A prayer needs a title and text.");
      return;
    }
    const records = buildPrayerRecords(draft, { prayer, version });
    upsertPrayer(
      {
        ...records.prayer,
        ...(prayer?.variant_group_id ? { variant_group_id: prayer.variant_group_id } : {}),
        ...(prayer?.variant_label ? { variant_label: prayer.variant_label } : {}),
        is_default_variant: prayer?.is_default_variant ?? true,
      },
      records.version,
    );
    toast.success("Prayer saved");
    navigate({ to: "/prayers" });
  };

  return (
    <AppShell
      title={prayer?.title ?? "Prayer"}
      back={{ to: "/prayers", label: "Prayers" }}
    >
      <div className="space-y-4">
        {prayer?.variant_label ? (
          <p className="text-sm text-muted-foreground">
            Version: {prayer.variant_label}
            {prayer.is_default_variant ? " · default" : ""}
          </p>
        ) : null}
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
              <p className="mt-1 text-xs text-muted-foreground">
                Each version is its own record, so a devotion can use any wording. The
                default one is used when you pray and sits at the top of the library.
              </p>
              <ul className="mt-2 space-y-3">
                {siblings.map((v) => {
                  const body =
                    db.prayer_versions.find((x) => x.prayer_id === v.id)?.body ?? "";
                  return (
                    <li key={v.id} className="flex items-start gap-3">
                      {siblings.length > 1 ? (
                        <input
                          type="radio"
                          name="default-version"
                          className="mt-1 size-4"
                          checked={Boolean(v.is_default_variant)}
                          aria-label={`Use ${v.variant_label ?? "this version"} as default`}
                          onChange={() => {
                            setDefaultVariant(v.id);
                            toast.success(`“${v.variant_label ?? "Version"}” is now the default`);
                          }}
                        />
                      ) : null}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">
                          {v.id === prayer.id ? (
                            <>{v.variant_label ?? "Traditional"}</>
                          ) : (
                            <Link
                              to="/prayer/$prayerId"
                              params={{ prayerId: v.id }}
                              className="underline"
                            >
                              {v.variant_label ?? "Alternate wording"}
                            </Link>
                          )}
                          {v.is_default_variant ? " · default" : ""}
                        </p>
                        <p className="line-clamp-3 text-sm text-muted-foreground">{body}</p>
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
                    addPrayerVariant(prayer.id, {
                      label: newVersionLabel.trim(),
                      body: newVersionBody.trim(),
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
