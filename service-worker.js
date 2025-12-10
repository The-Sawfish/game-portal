const CACHE_NAME = "seraph-v1";

// Add all files you want cached here
const CACHE_NAME = "seraph-v1";

const FILES_TO_CACHE = [
  "/game-portal/",
  "/game-portal/index.html",
  "/game-portal/manifest.json",
  "/game-portal/icons/icon-192.png",
  "/game-portal/icons/icon-512.png",
];


// Install event — cache core files
self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);

  // Cache every file inside /retrobowl/
  if (url.pathname.startsWith("/game-portal/retrobowl/")) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        return cached || fetch(event.request).then(response => {
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, response.clone());
            return response;
          });
        });
      })
    );
    return;
  }

  // Cache the rest normally
  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request);
    })
  );
});


// Activate event — clean old cache versions
self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys.map(key => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            )
        )
    );
    self.clients.claim();
});
