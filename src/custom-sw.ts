/// <reference lib="WebWorker" />

// Version of the service worker
const CACHE_VERSION = 'v3';

// Files to cache
const CACHE_FILES = [
  '/',
  '/index.html',
  '/favicon.ico',
  '/manifest.webmanifest',
  '/main.ts',
  '/styles.scss',
  '/custom-theme.scss',
  '/assets/img/icon.png'
];

// Install event: cache files
self.addEventListener('install', (event: any) => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then((cache) => {
        console.log('Opened cache:', CACHE_VERSION);
        return cache.addAll(CACHE_FILES);
      })
  );
  (self as any).skipWaiting();  // Activate the service worker immediately once it's installed
});

// Activate event: remove old caches
self.addEventListener('activate', (event: any) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_VERSION) {
            console.log('Removing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  (self as any).clients.claim();  // Take control of the currently open pages
});

// Fetch event: serve from cache or make a network request
self.addEventListener('fetch', (event: FetchEvent) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response; // if valid response is found in cache return it
        } else {
          return fetch(event.request) // else fetch from network
            .then((res) => {
              return caches.open(CACHE_VERSION)
                .then((cache) => {
                  cache.put(event.request.url, res.clone()); // save the response for future
                  return res; // return the fetched data
                });
            })
            .catch((err) => {
              console.log('Fetch Error:', err);
              throw err; // re-throw the error to make sure it's not treated as a resolution
            });
        }
      })
  );
});
