/// <reference lib="webworker" />
import { precacheAndRoute, cleanupOutdatedCaches } from "workbox-precaching";
import { registerRoute, NavigationRoute, setCatchHandler } from "workbox-routing";
import { NetworkFirst, StaleWhileRevalidate } from "workbox-strategies";
import { ExpirationPlugin } from "workbox-expiration";
import { CacheableResponsePlugin } from "workbox-cacheable-response";

declare const self: ServiceWorkerGlobalScope & { __WB_MANIFEST: Array<{ url: string; revision: string | null }> };

// Silence Workbox dev logging (noisy "Router is responding to..." spam)
(self as unknown as { __WB_DISABLE_DEV_LOGS: boolean }).__WB_DISABLE_DEV_LOGS = true;

// Precache build assets
precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

// Offline fallback for navigation
const navigationHandler = new NetworkFirst({
  cacheName: "navigation-cache",
  plugins: [new CacheableResponsePlugin({ statuses: [200] })],
});
registerRoute(new NavigationRoute(navigationHandler, { denylist: [/^\/api\//, /^\/functions\//] }));

// Runtime caches (mirror vite.config workbox.runtimeCaching)
registerRoute(
  /^https:\/\/a7\.alhastream\.com\/.*/i,
  new NetworkFirst({
    cacheName: "azuracast-api-cache",
    networkTimeoutSeconds: 5,
    plugins: [new ExpirationPlugin({ maxEntries: 10, maxAgeSeconds: 300 }), new CacheableResponsePlugin({ statuses: [0, 200] })],
  }),
);
registerRoute(
  /^http:\/\/a7\.alhastream\.com:81\/.*/i,
  new NetworkFirst({
    cacheName: "azuracast-api-cache-http",
    networkTimeoutSeconds: 5,
    plugins: [new ExpirationPlugin({ maxEntries: 10, maxAgeSeconds: 300 }), new CacheableResponsePlugin({ statuses: [0, 200] })],
  }),
);
registerRoute(
  /^https:\/\/voksradio\.com\/wp-json\/wp\/v2\/notification.*/i,
  new StaleWhileRevalidate({
    cacheName: "wp-notification-cache",
    plugins: [new ExpirationPlugin({ maxEntries: 20, maxAgeSeconds: 60 }), new CacheableResponsePlugin({ statuses: [0, 200] })],
  }),
);
registerRoute(
  /^https:\/\/voksradio\.com\/wp-json\/.*/i,
  new StaleWhileRevalidate({
    cacheName: "wordpress-api-cache",
    plugins: [new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 86400 }), new CacheableResponsePlugin({ statuses: [0, 200] })],
  }),
);
registerRoute(
  /^https:\/\/.*\.supabase\.co\/rest\/v1\/.*/i,
  new StaleWhileRevalidate({
    cacheName: "supabase-rest-cache",
    plugins: [new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 3600 }), new CacheableResponsePlugin({ statuses: [0, 200] })],
  }),
);

// Never let a cache miss + network failure reject the FetchEvent (avoids the
// "no-response / promise was rejected" flood). Return a graceful fallback instead.
setCatchHandler(async ({ request }) => {
  if (request.destination === "document") {
    const cache = await caches.open("navigation-cache");
    const offline = await cache.match("/offline.html");
    if (offline) return offline;
  }
  return new Response(JSON.stringify({ offline: true }), {
    status: 503,
    headers: { "Content-Type": "application/json" },
  });
});

// Push notifications
self.addEventListener("push", (event) => {
  const data = (() => {
    try {
      return event.data?.json() ?? { title: "Voks Radio", body: event.data?.text() ?? "Update baru dari Voks" };
    } catch {
      return { title: "Voks Radio", body: event.data?.text() ?? "Update baru" };
    }
  })();
  const title = (data.title as string) ?? "Voks Radio";
  const options = {
    body: (data.body as string) ?? (data.message as string) ?? "",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    data: { url: (data.url as string) ?? (data.deep_link as string) ?? "/" },
    tag: (data.tag as string) ?? "voks-push",
    vibrate: [200, 100, 200],
  } as unknown as NotificationOptions & { data?: { url?: string } };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data as { url?: string } | undefined)?.url ?? "/";
  event.waitUntil(
    (async () => {
      const allClients = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      for (const c of allClients) {
        if (c.url.includes(self.location.origin) && "focus" in c) return (c as WindowClient).focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    })(),
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});
