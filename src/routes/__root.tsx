import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { AppStoreProvider } from "@/components/app-store-provider";
import { BetaGate } from "@/components/beta-gate";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

/**
 * Absolute origin for the tags a link-scraper reads. `og:image` and `og:url` MUST be
 * absolute — Facebook, iMessage, Slack and X all drop a relative path silently, which
 * is how we ended up with Apple screenshotting the beta gate instead (ACTS-158).
 *
 * From env so a preview deploy advertises its own origin rather than prod. Resolved
 * the way `integrations/supabase/client.ts` does it — `VITE_*` first, bare name as the
 * SSR fallback — with the prod host as the last resort so a build with no env set
 * still produces a working card. No trailing slash.
 */
const SITE_ORIGIN = (
  import.meta.env["VITE_PUBLIC_URL"] ||
  // Guarded, unlike the supabase client's twin of this: `VITE_PUBLIC_URL` is normally
  // UNSET, so this arm is the usual path — and `process` does not exist in the browser,
  // where `head()` also runs on every client navigation. Unguarded it throws in the root
  // route and blanks the app.
  (typeof process !== "undefined" ? process.env["PUBLIC_URL"] : undefined) ||
  "https://myoravia.lovable.app"
).replace(/\/+$/, "");

/** Cache-buster; bump alongside any redraw of `public/og-cover.png`. Scrapers cache hard. */
const OG_IMAGE = `${SITE_ORIGIN}/og-cover.png?v=1`;

const SHARE_BLURB =
  "Prayer, Scripture, learning, and reflection — woven into one daily rhythm. " +
  "A free beta: no account needed, and your entries stay on your device.";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: "Oravia" },
      { name: "theme-color", content: "#f4f9ff" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "default" },
      { name: "apple-mobile-web-app-title", content: "Oravia" },
      {
        name: "description",
        content: "A companion for daily prayer, devotions, and reflection.",
      },
      { property: "og:title", content: "Oravia — Your devotional life, gathered" },
      { property: "og:description", content: SHARE_BLURB },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Oravia" },
      { property: "og:url", content: SITE_ORIGIN },
      { property: "og:locale", content: "en_US" },
      // Only the root sets an image, so every route inherits the card: child heads
      // override og:title / og:description by key and leave these alone.
      { property: "og:image", content: OG_IMAGE },
      { property: "og:image:secure_url", content: OG_IMAGE },
      { property: "og:image:type", content: "image/png" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      {
        property: "og:image:alt",
        content:
          "The Oravia mark over the words Oravia, Your devotional life gathered — a free beta, no account needed.",
      },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Oravia — Your devotional life, gathered" },
      { name: "twitter:description", content: SHARE_BLURB },
      { name: "twitter:image", content: OG_IMAGE },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Karla:wght@400;500;600&display=swap",
      },
      { rel: "icon", href: "/favicon.ico?v=2", type: "image/x-icon" },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png?v=2" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  // Register the offline-shell service worker (production only — avoids caching
  // headaches against the dev server). Runs client-side after hydration.
  useEffect(() => {
    if (import.meta.env.PROD && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AppStoreProvider>
        <BetaGate>
          {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
          <Outlet />
        </BetaGate>
        <Toaster position="top-center" />
      </AppStoreProvider>
    </QueryClientProvider>
  );
}
