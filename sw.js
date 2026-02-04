
const CACHE_NAME = 'financas-v3';
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.svg',
  './icon-512.svg'
];

// Install Event: Cache critical static assets immediately
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Force this SW to become active immediately
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

// Activate Event: Clean up old caches and claim clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Removing old cache', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim(); // Take control of all open pages immediately
});

// Fetch Event: Stale-While-Revalidate / Cache First with Dynamic Caching
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Do not cache API calls (e.g., Gemini AI)
  if (url.origin.includes('generativelanguage.googleapis.com')) {
    return;
  }

  // Strategy: Try cache first, then network. 
  // If found in network, update cache for next time.
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request)
        .then((response) => {
          // Check if response is valid to cache
          if (!response || response.status !== 200 || response.type === 'error') {
            return response;
          }

          // Clone response to store in cache
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return response;
        })
        .catch(() => {
          // Offline fallback for navigation (HTML)
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
        });
    })
  );
});
