const CACHE_NAME = 'ecommerce-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/cliente.html',
  '/admin.html',
  '/css/styles.css',
  '/js/main.js',
  '/js/auth.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Devuelve el caché si existe, sino hace la petición a la red 
        return response || fetch(event.request);
      })
  );
});