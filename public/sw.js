const CACHE = "amani-v1";
const PRECACHE_URLS = ["/", "/services", "/booking", "/pricing", "/about", "/gallery", "/contact"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE_URLS)).then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))),
  );
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  event.respondWith(
    (async () => {
      const cached = await caches.match(request);
      if (cached) return cached;

      try {
        const response = await fetch(request);
        if (response.ok && response.status < 400) {
          const clone = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, clone));
        }
        return response;
      } catch {
        if (request.mode === "navigate") {
          const fallback = await caches.match("/");
          if (fallback) return fallback;
        }
        return new Response("Offline", { status: 503 });
      }
    })(),
  );
});
