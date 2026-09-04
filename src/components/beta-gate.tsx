import { useEffect, useState, type ReactNode, type FormEvent } from "react";
import { useRouterState } from "@tanstack/react-router";

import { useApp } from "@/lib/prayer/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * BetaGate — a soft, client-side entry gate for the private beta.
 *
 * Two steps, in order:
 *   1. Passcode  — a shared access code, so the published preview isn't wide open
 *      to search engines and passers-by. Only active when VITE_BETA_PASSCODE is
 *      set; if it's unset the passcode step is skipped entirely (app stays open).
 *   2. Name      — asks who's praying, purely to personalize. The name is stored
 *      in the app Database's `settings.display_name`, so it lives in the SAME
 *      localStorage blob as everything else the person creates.
 *
 * IMPORTANT — this is NOT authentication. The passcode is baked into the client
 * bundle at build time, so anyone who reads the source can find it. It keeps the
 * public out of a private beta; it does not protect data. Real accounts come with
 * ACTS-82/87/88. See docs for the migration path.
 *
 * Public "follow-along" share links (`/follow/*`, ACTS-94) are exempt from both
 * steps — a guest with no passcode and no name must still be able to open a link.
 */

const UNLOCK_KEY = "acts-beta-unlocked-v1";

// Vite replaces this at build time. Set it in the host (Lovable) env to arm the gate.
const PASSCODE: string = (import.meta.env["VITE_BETA_PASSCODE"] as string | undefined) ?? "";

function Splash() {
  // Minimal, theme-colored hold to avoid a flash of the gate/app before we've
  // read localStorage and the store has hydrated.
  return <div className="min-h-screen bg-background" aria-hidden />;
}

function GateShell({ children }: { children: ReactNode }) {
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

export function BetaGate({ children }: { children: ReactNode }) {
  const { db, ready, updateSettings } = useApp();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const [unlocked, setUnlocked] = useState(false);
  const [checkedStorage, setCheckedStorage] = useState(false);
  const [codeEntry, setCodeEntry] = useState("");
  const [codeError, setCodeError] = useState(false);
  const [nameEntry, setNameEntry] = useState("");

  // Read the per-browser unlock flag once, client-side, to avoid a hydration flash.
  useEffect(() => {
    try {
      setUnlocked(window.localStorage.getItem(UNLOCK_KEY) === "1");
    } catch {
      /* storage blocked — treat as locked */
    }
    setCheckedStorage(true);
  }, []);

  // Guest share links bypass the gate entirely.
  if (pathname.startsWith("/follow")) return <>{children}</>;

  const passcodeArmed = PASSCODE.length > 0;

  // Hold until we've read storage (for the passcode step) and the store has
  // hydrated (so we know the real display_name, not the seed default).
  if ((passcodeArmed && !checkedStorage) || !ready) return <Splash />;

  // Step 1 — passcode.
  if (passcodeArmed && !unlocked) {
    const submitCode = (e: FormEvent) => {
      e.preventDefault();
      if (codeEntry.trim() === PASSCODE) {
        try {
          window.localStorage.setItem(UNLOCK_KEY, "1");
        } catch {
          /* storage blocked — unlock for this session only */
        }
        setUnlocked(true);
        setCodeError(false);
      } else {
        setCodeError(true);
      }
    };
    return (
      <GateShell>
        <form onSubmit={submitCode} className="space-y-3 text-left">
          <Label htmlFor="beta-passcode">Access code</Label>
          <Input
            id="beta-passcode"
            type="password"
            autoComplete="off"
            autoFocus
            value={codeEntry}
            onChange={(e) => {
              setCodeEntry(e.target.value);
              if (codeError) setCodeError(false);
            }}
            placeholder="Enter the code you were given"
            aria-invalid={codeError}
          />
          {codeError ? (
            <p className="text-sm text-destructive">That code didn't match. Try again.</p>
          ) : null}
          <Button type="submit" className="w-full" disabled={!codeEntry.trim()}>
            Enter
          </Button>
        </form>
      </GateShell>
    );
  }

  // Step 2 — name (personalization only).
  const currentName = db.settings.display_name?.trim();
  if (!currentName) {
    const submitName = (e: FormEvent) => {
      e.preventDefault();
      const name = nameEntry.trim();
      if (!name) return;
      updateSettings({ display_name: name });
    };
    return (
      <GateShell>
        <form onSubmit={submitName} className="space-y-3 text-left">
          <Label htmlFor="beta-name">What should we call you?</Label>
          <Input
            id="beta-name"
            type="text"
            autoComplete="given-name"
            autoFocus
            maxLength={40}
            value={nameEntry}
            onChange={(e) => setNameEntry(e.target.value)}
            placeholder="Your first name"
          />
          <Button type="submit" className="w-full" disabled={!nameEntry.trim()}>
            Continue
          </Button>
        </form>
      </GateShell>
    );
  }

  return <>{children}</>;
}
