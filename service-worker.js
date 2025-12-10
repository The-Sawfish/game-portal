const CACHE_NAME = "seraph-v1";

// Add all files you want cached here
const FILES_TO_CACHE = [
    "/",                         // homepage
    "/index.html",

    // Retro Bowl files (add more if you have subfolders)
    "/retrobowl/index.html",
];

// Install event — cache core files
self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(FILES_TO_CACHE);
        })
    );
    self.skipWaiting();
});

// Fetch event — serve cached files when offline
self.addEventListener("fetch", event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            // return cached response if available
            return response || fetch(event.request);
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
