import type { ReactNode } from "react";

/**
 * The arrival frame — wordmark, tagline, and a centered card of content.
 *
 * Shared by the two things that can stand between a person and the app on a
 * first launch: the beta gate (passcode + name — *access*, see `beta-gate.tsx`)
 * and onboarding (Bible + Daily Rosary — *preferences*, see `onboarding.tsx`).
 * Keeping the frame here means both read as one arrival rather than two screens
 * that happen to look similar.
 */
export function GateShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm text-center">
        <h1 className="font-serif text-4xl font-medium tracking-tight text-foreground">Oravia</h1>
        <p className="mt-2 text-sm text-muted-foreground">Your devotional life, gathered.</p>
        <div className="mt-8">{children}</div>
        <p className="mt-8 text-xs text-muted-foreground/80">
          Private beta · no email or account needed · your entries stay in this browser.
        </p>
      </div>
    </div>
  );
}

/**
 * A minimal, theme-colored hold — avoids a flash of the gate or the app before
 * localStorage has been read and the store has hydrated.
 */
export function Splash() {
  return <div className="min-h-screen bg-background" aria-hidden />;
}
