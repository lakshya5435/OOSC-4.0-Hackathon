const CACHE_NAME = 'wellbeing-pwa-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
];


self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Caching core assets');
        return cache.addAll(urlsToCache);
      })
  );
});


self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        
        return response || fetch(event.request);
      })
  );
});