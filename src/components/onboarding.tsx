import { useState, type FormEvent } from "react";

import { GateShell } from "@/components/gate-shell";
import { Button } from "@/components/ui/button";
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
  DEFAULT_BIBLE_APP,
  DEFAULT_TRANSLATION,
} from "@/lib/bible/apps";
import { PRAYER_APPS, prayerAppById } from "@/lib/prayer/apps";
import { onboardingCompletePatch, type OnboardingStep } from "@/lib/prayer/onboarding";
import { useApp } from "@/lib/prayer/store";

/**
 * First-launch onboarding — two questions, asked once.
 *
 * Rendered by `BetaGate` after the name step (see `src/lib/prayer/onboarding.ts`
 * for when and why). Nothing here is new capability: every field writes the same
 * `settings` value the Settings page edits, through the same `updateSettings`,
 * so an answer given here shows up there immediately and vice versa.
 *
 * Both questions are skippable. Skipping writes **no** preference — the app then
 * runs on the same defaults it always had (`DEFAULT_BIBLE_APP` / `NABRE`, and an
 * in-app Daily Rosary) — and only the completion stamp is written, so the person
 * is never asked twice.
 */

/** The value the Daily Rosary select uses for "pray it in this app". */
const IN_APP = "__in_app__";

/**
 * ⚠️ Each step is its OWN component on purpose. Both steps render the same
 * shapes (`GateShell → form → div → Select`), so if they were two branches of
 * one component React would reconcile rather than remount — the Radix `Select`
 * instance carried over from the Bible step, arrived at the Daily Rosary step
 * with a stale item collection, and reported an empty value. Visibly the
 * dropdown rendered blank; invisibly, submitting wrote
 * `daily_rosary_mode: "external"` with an empty app id — the opposite of the
 * "In this app" the person was looking at. Distinct component types force the
 * unmount/mount that keeps each Select's value honest.
 */

function StepHeading({ title, blurb }: { title: string; blurb: string }) {
  return (
    <div className="text-left">
      <h2 className="font-serif text-xl font-medium tracking-tight text-foreground">{title}</h2>
      <p className="mt-1.5 text-sm text-muted-foreground">{blurb}</p>
    </div>
  );
}

/** Answers are held locally and handed up on Continue, so "Not now" writes nothing. */
interface StepProps {
  onAnswer: (patch: Record<string, string>) => void;
  onSkip: () => void;
}

// --------------------------------- Bible ---------------------------------
function BibleStep({ onAnswer, onSkip }: StepProps) {
  const [bibleApp, setBibleApp] = useState<string>(DEFAULT_BIBLE_APP);
  const [translation, setTranslation] = useState<string>(DEFAULT_TRANSLATION);
  const [bibleUrl, setBibleUrl] = useState("");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    onAnswer({
      bible_app_id: bibleApp,
      bible_translation: translation,
      ...(bibleApp === "other" && bibleUrl.trim() ? { bible_app_custom_url: bibleUrl.trim() } : {}),
    });
  };

  return (
      <GateShell>
        <form onSubmit={submit} className="space-y-5">
          <StepHeading
            title="Where do you read Scripture?"
            blurb="Cited verses and the day's readings will open in your Bible, so you're never hunting for the right page."
          />

          <div className="space-y-1.5 text-left">
            <Label htmlFor="onboarding-bible-app">Bible app</Label>
            <Select value={bibleApp} onValueChange={setBibleApp}>
              <SelectTrigger id="onboarding-bible-app" className="h-11">
                <SelectValue />
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

          <div className="space-y-1.5 text-left">
            <Label htmlFor="onboarding-translation">Translation</Label>
            <Select value={translation} onValueChange={setTranslation}>
              <SelectTrigger id="onboarding-translation" className="h-11">
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

          {bibleApp === "other" ? (
            <div className="space-y-1.5 text-left">
              <Label htmlFor="onboarding-bible-url">Your Bible's web address</Label>
              <Input
                id="onboarding-bible-url"
                type="url"
                inputMode="url"
                className="h-11"
                placeholder="e.g. https://www.esv.org"
                value={bibleUrl}
                onChange={(e) => setBibleUrl(e.target.value)}
              />
            </div>
          ) : null}

          <div className="space-y-2">
            <Button type="submit" className="w-full">
              Continue
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full text-muted-foreground"
              onClick={onSkip}
            >
              Not now
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">You can change this any time in Settings.</p>
      </form>
    </GateShell>
  );
}

// ------------------------------ Daily Rosary ------------------------------
function RosaryStep({ onAnswer, onSkip }: StepProps) {
  const [rosary, setRosary] = useState<string>(IN_APP);
  const [rosaryUrl, setRosaryUrl] = useState("");

  const external = rosary !== IN_APP;
  const chosenApp = external ? prayerAppById(rosary) : undefined;

  // Launching out lands on someone else's account, not ours — say so before they
  // pick, so a sign-in wall on the way to prayer isn't a surprise. "Another app or
  // website" has no name worth interpolating, hence the bare "there".
  const signInNote = external
    ? `You may need to sign in to ${
        rosary === "other" || !chosenApp ? "it" : chosenApp.name
      } the first time — Oravia opens the app, it doesn't sign you in.`
    : null;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    onAnswer(
      external
        ? {
            daily_rosary_mode: "external",
            daily_rosary_app_id: rosary,
            ...(rosary === "other" && rosaryUrl.trim()
              ? { daily_rosary_custom_url: rosaryUrl.trim() }
              : {}),
          }
        : { daily_rosary_mode: "app" },
    );
  };

  return (
    <GateShell>
      <form onSubmit={submit} className="space-y-5">
        <StepHeading
          title="How would you like to pray your daily rosary?"
          blurb="Some people pray it here; many already pray it in Hallow or somewhere else. Either way, it's counted as prayed."
        />

        <div className="space-y-1.5 text-left">
          <Label htmlFor="onboarding-rosary">Daily Rosary</Label>
          <Select value={rosary} onValueChange={setRosary}>
            <SelectTrigger id="onboarding-rosary" className="h-11">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={IN_APP}>In this app</SelectItem>
              {PRAYER_APPS.map((a) => (
                <SelectItem key={a.id} value={a.id}>
                  {a.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {chosenApp ? (
            <p className="pt-0.5 text-xs text-muted-foreground">{chosenApp.blurb}</p>
          ) : null}
          {signInNote ? <p className="text-xs text-muted-foreground">{signInNote}</p> : null}
        </div>

        {rosary === "other" ? (
          <div className="space-y-1.5 text-left">
            <Label htmlFor="onboarding-rosary-url">App or web address</Label>
            <Input
              id="onboarding-rosary-url"
              type="url"
              inputMode="url"
              className="h-11"
              placeholder="https://…"
              value={rosaryUrl}
              onChange={(e) => setRosaryUrl(e.target.value)}
            />
          </div>
        ) : null}

        <div className="space-y-2">
          <Button type="submit" className="w-full">
            Begin
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="w-full text-muted-foreground"
            onClick={onSkip}
          >
            Not now
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">You can change this any time in Settings.</p>
        <p className="font-serif text-sm text-muted-foreground">Keep your seeking for God.</p>
      </form>
    </GateShell>
  );
}

export function Onboarding() {
  const { updateSettings } = useApp();
  const [step, setStep] = useState<OnboardingStep>("bible");

  /** The last step stamps completion, whether it was answered or skipped. */
  const finish = (patch: Record<string, string> = {}) =>
    updateSettings({ ...patch, ...onboardingCompletePatch() });

  if (step === "bible") {
    return (
      <BibleStep
        onAnswer={(patch) => {
          updateSettings(patch);
          setStep("rosary");
        }}
        onSkip={() => setStep("rosary")}
      />
    );
  }

  return <RosaryStep onAnswer={finish} onSkip={() => finish()} />;
}
