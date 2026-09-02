import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, Check, ExternalLink, RotateCcw } from "lucide-react";

import { AppShell } from "@/components/layout/PageShell";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { ExternalLink as ExtLink } from "@/components/ui/external-link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BIBLE_APPS,
  BIBLE_TRANSLATIONS,
  DEFAULT_TRANSLATION,
  RECOMMENDED_BIBLE_APPS,
  bibleAppById,
  buildPassageUrl,
  effectiveBibleAppId,
  resolveBibleHomeUrl,
  translationById,
} from "@/lib/bible/apps";
import {
  PRAYER_APPS,
  dailyRosaryAppLabel,
  effectivePrayerAppId,
  isExternalDailyRosary,
  prayerAppById,
  resolveDailyRosaryUrl,
} from "@/lib/prayer/apps";
import { STORAGE_KEY, useApp } from "@/lib/prayer/store";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — ACTS" },
      {
        name: "description",
        content: "Your daily devotion and the Bible app you read in.",
      },
      { property: "og:title", content: "Settings — ACTS" },
      {
        property: "og:description",
        content: "Set your Bible app and daily devotion.",
      },
    ],
  }),
  component: SettingsPage,
});

/** A sample reference used only to preview the "open in your Bible" link. */
const PREVIEW_REF = "John 3:16";

function SettingsPage() {
  const { db, updateSettings, setDailyTemplate } = useApp();
  const { settings } = db;

  // Effective choice — YouVersion is the default until the reader picks otherwise.
  const appId = effectiveBibleAppId(settings.bible_app_id);
  const isOther = appId === "other";
  const translation = translationById(settings.bible_translation);
  const chosenApp = bibleAppById(appId);
  const homeUrl = resolveBibleHomeUrl(settings);
  const hasCustomUrl = isOther && homeUrl !== "";
  const showRecommendations = appId === "none" || (isOther && !hasCustomUrl);
  const showPassagePreview = Boolean(chosenApp) && appId !== "none" && (!isOther || hasCustomUrl);
  const previewUrl = buildPassageUrl(settings, PREVIEW_REF);

  const dailyId = settings.daily_template_id;

  // Daily Rosary: pray it in-app (pick a devotion) or launch another app (Hallow).
  const dailyExternal = isExternalDailyRosary(settings);
  const dailyAppId = effectivePrayerAppId(settings);
  const chosenPrayerApp = prayerAppById(dailyAppId);
  const dailyLaunchUrl = resolveDailyRosaryUrl(settings);
  const dailyAppLabel = dailyRosaryAppLabel(settings);

  // Wipe everything this device has saved and reload into a clean, seeded app.
  // Clears the local data blob (prayers, sessions, reflections, name); leaves the
  // beta access code in place so they stay in the beta. A full reset that also
  // re-asks for the code is the "clear site data" path in the reset guide.
  const startOver = () => {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* storage blocked — nothing to clear */
    }
    window.location.href = "/";
  };

  return (
    <AppShell title="Settings" subtitle="Your Bible app and daily devotion.">
      <div className="space-y-6">
        {/* ------------------------------- Bible ------------------------------- */}
        <section className="soft-card p-4">
          <div className="flex items-center gap-2">
            <BookOpen className="size-5 text-muted-foreground" aria-hidden />
            <p className="eyebrow">Your Bible</p>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Tell us where you read Scripture. We'll add an “Online Bible” link on the Word page and
            open cited verses in your app. (Today's Mass readings always come from the USCCB.)
          </p>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="bible-app">Bible app</Label>
              <Select value={appId} onValueChange={(v) => updateSettings({ bible_app_id: v })}>
                <SelectTrigger id="bible-app" className="h-11">
                  <SelectValue placeholder="Choose an app" />
                </SelectTrigger>
                <SelectContent>
                  {BIBLE_APPS.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="bible-translation">Preferred translation</Label>
              <Select
                value={settings.bible_translation ?? DEFAULT_TRANSLATION}
                onValueChange={(v) => updateSettings({ bible_translation: v })}
              >
                <SelectTrigger id="bible-translation" className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BIBLE_TRANSLATIONS.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Custom address for an app we don't have in the catalog. */}
          {isOther ? (
            <div className="mt-4 space-y-1.5">
              <Label htmlFor="bible-custom-url">Your Bible's web address</Label>
              <Input
                id="bible-custom-url"
                type="url"
                inputMode="url"
                placeholder="e.g. https://www.esv.org"
                className="h-11"
                value={settings.bible_app_custom_url ?? ""}
                onChange={(e) => updateSettings({ bible_app_custom_url: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Specific passages open in Bible Gateway (we can't deep-link an unknown app), but
                this is where “open my Bible” points.
              </p>
            </div>
          ) : null}

          {/* Prove the wiring: open a sample passage in the reader they chose. */}
          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
            {showPassagePreview ? (
              <ExtLink
                href={previewUrl}
                className="inline-flex items-center gap-1.5 text-sm text-primary underline"
              >
                Preview: open {PREVIEW_REF} ({translation.id})
                <ExternalLink className="size-3.5" aria-hidden />
              </ExtLink>
            ) : null}
            {hasCustomUrl ? (
              <ExtLink
                href={homeUrl}
                className="inline-flex items-center gap-1.5 text-sm text-primary underline"
              >
                Open my Bible
                <ExternalLink className="size-3.5" aria-hidden />
              </ExtLink>
            ) : null}
          </div>

          {/* Recommendations when they have no app set (or aren't sure). */}
          {showRecommendations ? (
            <div className="mt-5">
              <p className="eyebrow mb-2">
                {appId ? "A couple of good, free options" : "Recommended — free apps with the NIV"}
              </p>
              <ul className="space-y-2">
                {RECOMMENDED_BIBLE_APPS.map((a) => (
                  <li key={a.id}>
                    <ExtLink
                      href={a.homeUrl}
                      className="flex items-center justify-between gap-3 rounded-xl border border-border p-3 transition-colors hover:border-primary/60"
                    >
                      <span className="min-w-0">
                        <span className="block text-sm font-medium">{a.name}</span>
                        <span className="block text-xs text-muted-foreground">{a.blurb}</span>
                      </span>
                      <span className="inline-flex shrink-0 items-center gap-1 text-xs text-primary">
                        Get it
                        <ExternalLink className="size-3.5" aria-hidden />
                      </span>
                    </ExtLink>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>

        {/* --------------------------- Daily prayer --------------------------- */}
        <section className="soft-card p-4">
          <p className="eyebrow">Daily prayer</p>
          <p className="mt-2 text-sm text-muted-foreground">
            How your Home “daily” card and the Daily Rosary row begin.
          </p>

          <div className="mt-4 space-y-1.5">
            <Label htmlFor="daily-mode">Pray my Daily Rosary</Label>
            <Select
              value={dailyExternal ? "external" : "app"}
              onValueChange={(v) =>
                updateSettings({ daily_rosary_mode: v === "external" ? "external" : "app" })
              }
            >
              <SelectTrigger id="daily-mode" className="h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="app">In the app</SelectItem>
                <SelectItem value="external">In another app (Hallow…)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {dailyExternal ? (
            <>
              <div className="mt-4 space-y-1.5">
                <Label htmlFor="daily-app">App</Label>
                <Select
                  value={dailyAppId}
                  onValueChange={(v) => updateSettings({ daily_rosary_app_id: v })}
                >
                  <SelectTrigger id="daily-app" className="h-11">
                    <SelectValue placeholder="Choose an app" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRAYER_APPS.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {chosenPrayerApp ? (
                  <p className="text-xs text-muted-foreground">{chosenPrayerApp.blurb}</p>
                ) : null}
              </div>

              {dailyAppId === "other" ? (
                <div className="mt-4 space-y-1.5">
                  <Label htmlFor="daily-custom-url">App or web address</Label>
                  <Input
                    id="daily-custom-url"
                    type="url"
                    inputMode="url"
                    placeholder="https://…"
                    value={settings.daily_rosary_custom_url ?? ""}
                    onChange={(e) => updateSettings({ daily_rosary_custom_url: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    On a phone, links that an app claims open that app; otherwise they open on
                    the web.
                  </p>
                </div>
              ) : null}

              {dailyLaunchUrl ? (
                <div className="mt-4">
                  <ExtLink
                    href={dailyLaunchUrl}
                    className="inline-flex items-center gap-1.5 text-sm text-primary underline"
                  >
                    Open {dailyAppLabel}
                    <ExternalLink className="size-3.5" aria-hidden />
                  </ExtLink>
                </div>
              ) : null}
            </>
          ) : (
            <div className="mt-4 space-y-1.5">
              <Label htmlFor="daily-devotion">Daily devotion</Label>
              <Select
                value={dailyId ?? "__default__"}
                onValueChange={(v) => setDailyTemplate(v === "__default__" ? undefined : v)}
              >
                <SelectTrigger id="daily-devotion" className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__default__">Standard Holy Rosary (default)</SelectItem>
                  {db.templates.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </section>

        {/* ------------------------------ Start over ------------------------------ */}
        <section className="soft-card p-4">
          <div className="flex items-center gap-2">
            <RotateCcw className="size-5 text-muted-foreground" aria-hidden />
            <p className="eyebrow">Start over</p>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Clear everything you've saved on this device — your prayers, sessions, reflections, and
            name — and begin fresh. This only affects this device and can't be undone.
          </p>
          <div className="mt-4">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Start over</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear everything and start fresh?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This permanently removes every prayer, session, and reflection you've saved on
                    this device. There's no undo, and nothing is backed up.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep my data</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={startOver}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Clear and start over
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </section>

        <p className="flex items-center gap-1.5 px-1 text-xs text-muted-foreground">
          <Check className="size-3.5 text-primary" aria-hidden />
          Changes save automatically to this device.
        </p>
      </div>
    </AppShell>
  );
}
