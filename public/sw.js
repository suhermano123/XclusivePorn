self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Solo manejar requests del mismo origen para evitar errores de CORS
    // en recursos externos (Cloudflare R2, CDNs, etc.)
    if (url.origin !== self.location.origin) {
        return; // Dejar que el navegador maneje el request de forma nativa
    }

    // Para rutas del mismo origen, hacer fetch normal
    event.respondWith(fetch(event.request));
});
