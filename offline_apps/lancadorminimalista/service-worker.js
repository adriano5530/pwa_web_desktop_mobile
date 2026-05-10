const CACHE_NAME = 'pwa-cache-lm';
const PRECACHE_URLS = [
 "./",
  "./lancadorminimalista.html"
];

// Instala e faz o precache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS);
    })
  );
  self.skipWaiting(); // ativa imediatamente após instalação
});

// Ativa e limpa caches antigos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Estratégia: Stale-While-Revalidate
self.addEventListener('fetch', (event) => {
  // Só lida com GET
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          // Atualiza o cache
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        })
        .catch(() => {
          // Se offline e sem cache novo, volta ao que tinha
          return cachedResponse || caches.match('/offline.html');
        });

      // Retorna o cache antigo imediatamente (se houver), enquanto atualiza em background
      return cachedResponse || fetchPromise;
    })
  );
});

