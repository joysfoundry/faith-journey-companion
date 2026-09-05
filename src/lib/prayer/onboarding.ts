/**
 * First-launch onboarding — what we ask, and how we know we already asked.
 *
 * Two questions, asked once, right after the beta name step (see
 * `src/components/onboarding.tsx`): where you read Scripture, and how you pray
 * your daily rosary. Neither adds a capability — both settings already exist
 * and are editable in Settings (`bible_app_id` / `bible_translation` in
 * `src/lib/bible/apps.ts`, `daily_rosary_*` in `./apps.ts`). This is only the
 * *asking*, so the app fits an existing habit instead of waiting to be found.
 *
 * WHY A MARKER AND NOT AN INFERENCE: "have they been asked?" cannot be read off
 * the answers. Both questions are skippable, and skipping deliberately writes
 * nothing — so `bible_app_id` being absent means either "skipped" or "never
 * asked", and inferring from it would re-ask on every single launch. Hence one
 * explicit stamp, written on finish *and* on skip.
 *
 * The stamp is additive, so it needs no `STORAGE_KEY` bump — existing testers
 * keep their data and simply see the questions once (JC, 2026-09-04: everyone
 * is asked once, not just brand-new installs).
 */

/** The settings slice this module reads — see `AppSettings`. */
export interface OnboardingSettings {
  /** ISO timestamp of when the questions were answered *or* skipped. */
  onboarding_completed_at?: string | undefined;
}

/** The questions, in the order they're asked. */
export const ONBOARDING_STEPS = ["bible", "rosary"] as const;

export type OnboardingStep = (typeof ONBOARDING_STEPS)[number];

/** The step after `step`, or `null` when `step` is the last one. */
export function nextOnboardingStep(step: OnboardingStep): OnboardingStep | null {
  const i = ONBOARDING_STEPS.indexOf(step);
  return ONBOARDING_STEPS[i + 1] ?? null;
}

/** True while the person has never been asked — answered or skipped both count as asked. */
export function needsOnboarding(settings: OnboardingSettings): boolean {
  return !settings.onboarding_completed_at?.trim();
}

/**
 * The patch that marks onboarding done. Applied on the last question whether it
 * was answered or skipped, so the flow never returns.
 */
export function onboardingCompletePatch(now: Date = new Date()): {
  onboarding_completed_at: string;
} {
  return { onboarding_completed_at: now.toISOString() };
}
