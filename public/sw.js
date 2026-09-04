// Kill-switch. Un service worker anterior hacía `respondWith(fetch(event.request))`
// para todas las peticiones del mismo origen: sin caché y, si el fetch fallaba,
// rompía la navegación (HTML sin __NEXT_DATA__ -> React no hidrataba -> el
// reproductor no montaba). Este SW se desregistra solo y libera a los clientes.
self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
    event.waitUntil((async () => {
        try {
            const keys = await caches.keys();
            await Promise.all(keys.map((k) => caches.delete(k)));
        } catch (e) {
            /* noop */
        }
        await self.registration.unregister();
        const windows = await self.clients.matchAll({ type: 'window' });
        for (const client of windows) {
            client.navigate(client.url);
        }
    })());
});

// Sin handler de 'fetch': el navegador maneja todas las peticiones de forma nativa.
