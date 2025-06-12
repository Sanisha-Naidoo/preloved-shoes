
// Version number to help with cache busting - increment to force refresh
const CACHE_VERSION = '5.0.0'; // Updated to completely fix React context issues
const CACHE_NAME = `reboot-v${CACHE_VERSION}`;

// Only cache static assets, never JS/React modules
const urlsToCache = [
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

// Install service worker
self.addEventListener('install', event => {
  console.log('Service Worker: Installing version', CACHE_VERSION);
  self.skipWaiting(); // Activate immediately
  
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

// Handle fetch events - be very selective about what we cache
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // Never intercept:
  // - API requests
  // - JavaScript files
  // - HTML files (let them always be fresh)
  // - Any dynamic content
  if (
    url.hostname.includes('supabase.co') ||
    url.hostname.includes('gpteng.co') ||
    url.pathname.includes('.js') ||
    url.pathname.includes('.ts') ||
    url.pathname.includes('.tsx') ||
    url.pathname.endsWith('.html') ||
    url.pathname === '/' ||
    event.request.method !== 'GET'
  ) {
    // Let these requests go to network directly
    return;
  }

  // Only cache static assets like images and icons
  if (url.pathname.includes('/icons/') || url.pathname.includes('lovable-uploads')) {
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          if (response) {
            return response;
          }
          return fetch(event.request).then(networkResponse => {
            if (networkResponse && networkResponse.status === 200) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, responseToCache);
              });
            }
            return networkResponse;
          });
        })
    );
  }
});

// Activate service worker
self.addEventListener('activate', event => {
  console.log('Service Worker: Activating new version', CACHE_VERSION);
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Cache cleanup complete');
      return self.clients.claim();
    })
  );
});

console.log('Service Worker script loaded v' + CACHE_VERSION);
