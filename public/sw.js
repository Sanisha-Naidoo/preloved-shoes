
// Version number to help with cache busting
const CACHE_VERSION = '1.0.0';
const CACHE_NAME = `reboot-v${CACHE_VERSION}`;

// Core assets to cache
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/lovable-uploads/ba6fcc1a-24b1-4e24-8750-43bdc56bb2fb.png',
  '/favicon.ico',
  '/icons/widget-preview.png'
];

// Install a service worker
self.addEventListener('install', event => {
  console.log('Service Worker: Installing version', CACHE_VERSION);
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Cache and return requests
self.addEventListener('fetch', event => {
  // Skip cache for submission-related API requests
  if (event.request.url.includes('supabase.co')) {
    console.log('Service Worker: Bypassing cache for API request', event.request.url);
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          // For HTML files, we'll only use cache if network request fails
          // This ensures users always get fresh content
          if (event.request.url.endsWith('.html') || event.request.url === '/' || !event.request.url.includes('.')) {
            return fetch(event.request)
              .then(networkResponse => {
                return networkResponse || response;
              })
              .catch(() => {
                console.log('Service Worker: Using cached version of', event.request.url);
                return response;
              });
          }
          return response;
        }

        return fetch(event.request).then(
          networkResponse => {
            // Don't cache if response is not valid
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }

            // Clone the response as it's going to be consumed by the browser
            const responseToCache = networkResponse.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                // Don't cache API responses
                if (!event.request.url.includes('supabase.co')) {
                  cache.put(event.request, responseToCache);
                }
              });

            return networkResponse;
          }
        );
      })
  );
});

// Update a service worker
self.addEventListener('activate', event => {
  console.log('Service Worker: Activating new version', CACHE_VERSION);
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
          return null;
        })
      );
    })
  );
});

// Handle messages from the client
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    console.log('Service Worker: Clearing cache as requested by client');
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
    }).then(() => {
      if (event.ports && event.ports[0]) {
        event.ports[0].postMessage({ success: true });
      }
    });
  }
});

// Handle errors
self.addEventListener('error', event => {
  console.error('Service Worker error:', event.message);
});

console.log('Service Worker script loaded v' + CACHE_VERSION);
