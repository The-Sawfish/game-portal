const CACHE_VERSION = "v10"; 
const CACHE_NAME = `offline-cache-${CACHE_VERSION}`;

// Cache-first forever
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.open(CACHE_NAME).then(cache =>
      cache.match(event.request).then(response => {
        // If file is cached → use it forever
        if (response) {
          return response;
        }

        // If not cached → fetch and cache it permanently
        return fetch(event.request)
          .then(networkResponse => {
            // Only save successful GET responses
            if (networkResponse.ok) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => {
            // If offline and not cached → fail gracefully
            return caches.match("/offline.html"); 
          });
      })
    )
  );
});

// Remove old versions of cache on activation
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
});
