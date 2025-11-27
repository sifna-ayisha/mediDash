const CACHE_NAME = 'medidash-v2';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/vite.svg', // Caching the icon
];

// On install, cache the static assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(STATIC_ASSETS);
        })
    );
});

// On activate, clean up old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.filter(name => name !== CACHE_NAME)
                         .map(name => caches.delete(name))
            );
        })
    );
});

// On fetch, use caching strategies
self.addEventListener('fetch', event => {
    // Ignore non-GET requests
    if (event.request.method !== 'GET') {
        return;
    }
    
    // For HTML pages, use network-first to ensure the latest version is always shown,
    // falling back to the cached index.html if offline.
    if (event.request.headers.get('accept').includes('text/html')) {
        event.respondWith(
            fetch(event.request)
            .catch(() => caches.match('/index.html'))
        );
        return;
    }

    // For other assets (JS from import maps, CSS, images, etc.), use stale-while-revalidate.
    // This serves from cache for speed, but also fetches an update in the background.
    event.respondWith(
        caches.open(CACHE_NAME).then(cache => {
            return cache.match(event.request).then(response => {
                const fetchPromise = fetch(event.request).then(networkResponse => {
                    // If we got a valid response, update the cache
                    if (networkResponse && networkResponse.status === 200) {
                        cache.put(event.request, networkResponse.clone());
                    }
                    return networkResponse;
                }).catch(() => {
                    // Fetch failed, probably offline. The initial 'response' will be used if it exists.
                });

                // Return cached response immediately if available, otherwise wait for the network.
                return response || fetchPromise;
            });
        })
    );
});
