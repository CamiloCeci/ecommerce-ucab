const CACHE_NAME = 'ucab-store-v1';
const ASSETS_TO_CACHE = [
    '../index.html',
    '../cliente.html',
    '../admin.html',
    '../registro.html',
    '../recuperar.html',
    '../css/styles.css',
    'main.js',
    'auth.js',
    'api.js',
    'cliente.js',
    'admin.js',
    'registro.js',
    'recuperar.js'
];

// Evento Install: Almacena en la caché local del navegador los recursos indispensables
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('📦 Service Worker: Almacenando recursos estáticos en caché.');
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .then(() => self.skipWaiting())
    );
});

// Evento Activate: Limpia cachés antiguas si se actualiza la versión de la app
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        console.log('🧹 SW: Removiendo Caché obsoleta:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Intercepción de Peticiones (Estrategia Cache-First falling back to Network)
self.addEventListener('fetch', (event) => {
    // No interceptar llamadas externas de APIs dinámicas (como imágenes aleatorias o fakestoreapi) si estamos online
    if (event.request.url.includes('fakestoreapi.com')) {
        return; 
    }

    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    return cachedResponse; // Retornar recurso guardado si no hay internet
                }
                return fetch(event.request); // Ir a la red si no está en caché
            })
    );
});