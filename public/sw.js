/* Faith Journey — minimal offline-shell service worker.
 * App data lives in localStorage, so this only caches the shell + static assets
 * so the app loads offline. Runtime caching only (no build manifest): assets are
 * cached as they're fetched. Bump VERSION to invalidate old caches on deploy. */
const VERSION = "fj-v1";
const SHELL = `fj-shell-${VERSION}`;
const RUNTIME = `fj-runtime-${VERSION}`;
const SHELL_URLS = ["/", "/manifest.webmanifest", "/icon-192.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(SHELL);
      await cache.addAll(SHELL_URLS).catch(() => {});
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((k) => !k.endsWith(VERSION)).map((k) => caches.delete(k)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  // Only handle same-origin; let cross-origin (fonts, Bible/USCCB links, etc.) pass through.
  if (url.origin !== self.location.origin) return;

  // Navigations: network-first, fall back to cached page then the app shell.
  if (req.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const net = await fetch(req);
          const cache = await caches.open(RUNTIME);
          cache.put(req, net.clone());
          return net;
        } catch {
          const cache = await caches.open(RUNTIME);
          return (
            (await cache.match(req)) ||
            (await caches.match("/")) ||
            new Response("Offline", {
              status: 503,
              headers: { "Content-Type": "text/plain" },
            })
          );
        }
      })(),
    );
    return;
  }

  // Static assets: stale-while-revalidate.
  if (/\.(js|mjs|css|woff2?|ttf|png|jpe?g|svg|webp|ico|json|webmanifest)$/i.test(url.pathname)) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(RUNTIME);
        const cached = await cache.match(req);
        const network = fetch(req)
          .then((res) => {
            if (res && res.ok) cache.put(req, res.clone());
            return res;
          })
          .catch(() => null);
        return cached || (await network) || new Response("", { status: 504 });
      })(),
    );
  }
});
