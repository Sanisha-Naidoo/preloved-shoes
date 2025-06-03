
// Version number to help with cache busting - increment to force refresh
const CACHE_VERSION = '3.0.0'; // Updated version to force cache refresh for new 180x180 icon
const CACHE_NAME = `reboot-v${CACHE_VERSION}`;

// Core assets to cache - updated with proper icon paths including 180x180
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/icons/icon-144x144.png',
  '/icons/icon-152x152.png',
  '/icons/icon-167x167.png',
  '/icons/icon-180x180.png',
  '/icons/icon-192x192.png',
  '/icons/icon-384x384.png',
  '/icons/icon-512x512.png',
  '/icons/maskable_icon.png',
  '/lovable-uploads/ba6fcc1a-24b1-4e24-8750-43bdc56bb2fb.png',
  '/favicon.ico'
];

// Install a service worker
self.addEventListener('install', event => {
  console.log('Service Worker: Installing version', CACHE_VERSION);
  // Force immediate activation to clear old caches
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('Service Worker: Failed to cache resources', error);
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

  // Force fresh fetch for icon files to ensure latest versions
  if (event.request.url.includes('/icons/') || event.request.url.includes('icon')) {
    console.log('Service Worker: Force fetching fresh icon', event.request.url);
    event.respondWith(
      fetch(event.request)
        .then(networkResponse => {
          if (networkResponse && networkResponse.status === 200) {
            // Update cache with fresh icon
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
          }
          return networkResponse;
        })
        .catch(() => {
          // Fallback to cache if network fails
          return caches.match(event.request);
        })
    );
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

// Update a service worker - force immediate activation
self.addEventListener('activate', event => {
  console.log('Service Worker: Activating new version', CACHE_VERSION);
  // Take control immediately
  self.clients.claim();
  
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
    }).then(() => {
      console.log('Service Worker: Cache cleanup complete, reloading all clients');
      // Force reload all tabs to use new cache
      return self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({ type: 'CACHE_UPDATED' });
        });
      });
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
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('Service Worker: Skip waiting requested');
    self.skipWaiting();
  }
});

// Handle errors
self.addEventListener('error', event => {
  console.error('Service Worker error:', event.message);
});

console.log('Service Worker script loaded v' + CACHE_VERSION);
