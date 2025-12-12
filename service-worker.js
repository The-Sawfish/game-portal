// Version for cache invalidation
const CACHE_VERSION = "v1";
const CACHE_NAME = `sawfish-cache-${CACHE_VERSION}`;

const OFFLINE_URL = "/game-portal/offline.html";

// Pre-cache important core files
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      cache.addAll([
        "/game-portal/",
        "/game-portal/index.html",
        OFFLINE_URL,
        "/game-portal/icons/icon-192.png",
        "/game-portal/icons/icon-512.png"
      ])
    )
  );

  self.skipWaiting();
});

// Clean old caches
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );

  self.clients.claim();
});

// Network-first strategy with offline fallback
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Save fetched files to cache
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, response.clone());
          return response;
        });
      })
      .catch(() => {
        // If offline → return cached file if available
        return caches.match(event.request)
          .then(cached => cached || caches.match(OFFLINE_URL));
      })
  );
});
