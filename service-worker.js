const CACHE_NAME = "site-cache-v1";
const DYNAMIC_CACHE = "dynamic-cache-v1";

// Precache only the absolutely essential files
const PRECACHE_FILES = [
  "/game-portal/",
  "/game-portal/index.html",
  "/game-portal/manifest.json",
  "/game-portal/icons/icon-192.png",
  "/game-portal/icons/icon-512.png"
];

// Install step — precache core shell
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(PRECACHE_FILES);
    })
  );
  self.skipWaiting();
});

// Activate step — cleanup old caches
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys
          .filter(key => key !== CACHE_NAME && key !== DYNAMIC_CACHE)
          .map(key => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch step — cache everything on first use
self.addEventListener("fetch", event => {
  // Only handle GET requests (no POST, PUT, etc.)
  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      return fetch(event.request)
        .then(response => {
          // Cache only if response is good
          if (!response || response.status !== 200) {
            return response;
          }

          // Save dynamically
          const clone = response.clone();
          caches.open(DYNAMIC_CACHE).then(cache => {
            cache.put(event.request, clone);
          });

          return response;
        })
        .catch(() => cached);
    })
  );
});
