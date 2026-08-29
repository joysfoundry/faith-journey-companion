import { useState } from "react";
import { Link, createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { Heart, NotebookPen, Pencil, Play } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { ExternalLink as ExtLink } from "@/components/ui/external-link";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  PrayerFields,
  buildPrayerRecords,
  type PrayerDraft,
} from "@/components/prayer/PrayerFields";
import { MediaEditor } from "@/components/media/MediaEditor";
import { useApp, variantsOf } from "@/lib/prayer/store";
import { TAXONOMY_LABELS } from "@/domain/taxonomy";
import type { PrayerMedia } from "@/lib/prayer/types";

export const Route = createFileRoute("/prayer/$prayerId")({
  validateSearch: (s: Record<string, unknown>): { edit?: boolean } =>
    s["edit"] === true || s["edit"] === "true" ? { edit: true } : {},
  head: () => ({
    meta: [
      { title: "Prayer — ACTS" },
      { name: "description", content: "Read, pray, and manage a prayer in your library." },
      { property: "og:title", content: "Prayer — ACTS" },
      { property: "og:description", content: "Prayer text, audio, alternate versions, and source." },
    ],
  }),
  // Adding a prayer lives on the single "Add a prayer" screen.
  beforeLoad: ({ params }) => {
    if (params.prayerId === "new") throw redirect({ to: "/import" });
  },
  component: PrayerPage,
});

function PrayerPage() {
  const { edit } = Route.useSearch();
  return edit ? <EditPrayer /> : <ViewPrayer />;
}

function MediaItem({ m }: { m: PrayerMedia }) {
  return (
    <li className="rounded-lg border border-border/70 p-2.5">
      <p className="text-sm font-medium">
        {m.label ?? (m.kind === "video" ? "Video" : "Audio")}
        <span className="ml-2 text-xs font-normal text-muted-foreground">
          {m.kind} · {m.source}
        </span>
      </p>
      {m.kind === "video" ? (
        m.source === "link" ? (
          <ExtLink href={m.url} className="mt-1 block break-all text-sm text-primary underline">
            {m.url}
          </ExtLink>
        ) : (
          <video controls src={m.url} className="mt-1 w-full rounded-md" />
        )
      ) : m.source === "link" ? (
        <ExtLink href={m.url} className="mt-1 block break-all text-sm text-primary underline">
          {m.url}
        </ExtLink>
      ) : (
        <audio controls src={m.url} className="mt-1 w-full" />
      )}
    </li>
  );
}

function LoadingPrayer() {
  return (
    <AppShell title="Prayer" back={{ to: "/prayers", label: "Prayers" }}>
      <p className="text-sm text-muted-foreground">Loading…</p>
    </AppShell>
  );
}

/* ------------------------------- View (read-only) ------------------------- */
function ViewPrayer() {
  const { prayerId } = Route.useParams();
  const { db, ready, toggleFavorite, startSinglePrayer } = useApp();
  const navigate = useNavigate();

  const prayer = db.prayers.find((p) => p.id === prayerId);
  const version = db.prayer_versions.find((v) => v.id === prayer?.default_version_id)
    ?? db.prayer_versions.find((v) => v.prayer_id === prayerId);
  const siblings = prayer ? variantsOf(db, prayer) : [];
  const source = db.sources.find((s) => s.id === (prayer?.source_id ?? version?.source_id));

  // Until the store hydrates from localStorage, a just-added prayer isn't in `db` yet.
  if (!ready) return <LoadingPrayer />;
  if (!prayer) {
    return (
      <AppShell title="Prayer" back={{ to: "/prayers", label: "Prayers" }}>
        <p className="text-sm text-muted-foreground">This prayer isn&apos;t in your library.</p>
      </AppShell>
    );
  }

  const media = prayer.media ?? [];
  const tags = prayer.tags ?? [];

  function prayNow() {
    const session = startSinglePrayer(prayer!.id);
    if (session) navigate({ to: "/session/$sessionId", params: { sessionId: session.id } });
  }

  return (
    <AppShell title={prayer.title} back={{ to: "/prayers", label: "Prayers" }}>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs text-muted-foreground">
            {TAXONOMY_LABELS[prayer.prayer_type]}
          </span>
          <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs text-muted-foreground">
            {TAXONOMY_LABELS[prayer.expression_type]}
          </span>
          {prayer.variant_label ? (
            <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs text-muted-foreground">
              {prayer.variant_label}
              {prayer.is_default_variant ? " · default" : ""}
            </span>
          ) : null}
        </div>

        <article className="soft-card p-5">
          <p className="prayer-text whitespace-pre-line text-lg">{version?.body}</p>
        </article>

        {tags.length ? (
          <div className="flex flex-wrap gap-1.5">
            {tags.map((t) => (
              <span key={t} className="rounded-full border border-border px-2.5 py-0.5 text-xs text-muted-foreground">
                {t}
              </span>
            ))}
          </div>
        ) : null}

        {media.length ? (
          <section className="soft-card p-4">
            <p className="eyebrow">Audio &amp; video</p>
            <ul className="mt-2 space-y-2">
              {media.map((m) => (
                <MediaItem key={m.id} m={m} />
              ))}
            </ul>
          </section>
        ) : null}

        {/* Primary actions */}
        <div className="flex gap-2">
          <Button className="h-12 flex-1" onClick={prayNow}>
            <Play className="size-5" /> Pray now
          </Button>
          <Button asChild variant="secondary" className="h-12">
            <Link to="/prayer/$prayerId" params={{ prayerId: prayer.id }} search={{ edit: true }}>
              <Pencil className="size-5" /> Edit
            </Link>
          </Button>
          <Button variant="secondary" className="h-12" onClick={() => toggleFavorite(prayer.id)} aria-label="Favorite">
            <Heart className={`size-5 ${prayer.favorite ? "fill-primary text-primary" : ""}`} />
          </Button>
        </div>

        <Button asChild variant="ghost" className="h-11 w-full">
          <Link to="/reflections">
            <NotebookPen className="size-4" /> Reflect on this prayer
          </Link>
        </Button>

        {siblings.length > 1 ? (
          <section className="soft-card p-4">
            <p className="eyebrow">Other versions</p>
            <ul className="mt-2 space-y-2">
              {siblings
                .filter((v) => v.id !== prayer.id)
                .map((v) => (
                  <li key={v.id}>
                    <Link
                      to="/prayer/$prayerId"
                      params={{ prayerId: v.id }}
                      className="text-sm text-primary underline"
                    >
                      {v.variant_label ?? "Alternate wording"}
                    </Link>
                  </li>
                ))}
            </ul>
          </section>
        ) : null}

        {source ? (
          <section className="soft-card p-4">
            <p className="eyebrow">Source</p>
            <p className="mt-1 text-sm">{source.name}</p>
            {source.url ? (
              <ExtLink
                className="mt-1 block break-all text-sm text-primary underline"
                href={source.url}
              >
                {source.url}
              </ExtLink>
            ) : null}
          </section>
        ) : null}
      </div>
    </AppShell>
  );
}

/* ------------------------------- Edit ------------------------------------- */
// The form seeds its state from the store once. Gate on `ready` so a hard reload
// or deep-link to a just-added (localStorage-only) prayer doesn't seed empty.
function EditPrayer() {
  const { ready } = useApp();
  if (!ready) return <LoadingPrayer />;
  return <EditPrayerForm />;
}

function EditPrayerForm() {
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
  const siblings = prayer ? variantsOf(db, prayer) : [];

  const [draft, setDraft] = useState<PrayerDraft>({
    title: prayer?.title ?? "",
    body: version?.body ?? "",
    prayerType: prayer?.prayer_type ?? "devotional",
    expressionType: prayer?.expression_type ?? "vocal",
    tags: prayer?.tags ?? [],
    media: prayer?.media ?? [],
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
    navigate({ to: "/prayer/$prayerId", params: { prayerId }, search: { edit: false } });
  };

  return (
    <AppShell title={prayer?.title ?? "Prayer"} back={{ to: "/prayers", label: "Prayers" }}>
      <div className="space-y-4">
        {prayer?.variant_label ? (
          <p className="text-sm text-muted-foreground">
            Version: {prayer.variant_label}
            {prayer.is_default_variant ? " · default" : ""}
          </p>
        ) : null}
        <PrayerFields draft={draft} onChange={setDraft} />
        <MediaEditor media={draft.media} onChange={(media) => setDraft({ ...draft, media })} />
        <Button className="h-12 w-full" onClick={save}>
          Save prayer
        </Button>

        {prayer ? (
          <>
            <Button variant="secondary" className="h-12 w-full" onClick={() => toggleFavorite(prayer.id)}>
              {prayer.favorite ? "Remove from favorites" : "Add to favorites"}
            </Button>

            <section className="soft-card p-4">
              <p className="eyebrow">Versions</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Each version is its own record, so a devotion can use any wording. The default one is
                used when you pray and sits at the top of the library.
              </p>
              <ul className="mt-2 space-y-3">
                {siblings.map((v) => {
                  const body = db.prayer_versions.find((x) => x.prayer_id === v.id)?.body ?? "";
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
                              search={{ edit: true }}
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
                  <ExtLink className="text-sm underline" href={source.url}>
                    View source
                  </ExtLink>
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
