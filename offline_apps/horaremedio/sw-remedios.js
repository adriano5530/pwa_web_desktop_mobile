// sw-remedios.js — Service Worker dedicado do app "Horários de Remédios"
// Escopo próprio (pasta onde este arquivo está) para instalação independente
// do restante do Ecossistema Nano_Tech. Estratégia: stale-while-revalidate.

const CACHE_NAME = 'remedios-horarios-v1';
const APP_SHELL = [
  './remedios-horarios.html',
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .catch(() => {}) // não bloqueia a instalação se o precache falhar
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(event.request, { ignoreSearch: true });

      const networkFetch = fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            cache.put(event.request, response.clone());
          }
          return response;
        })
        .catch(() => cached);

      // stale-while-revalidate: responde com o cache na hora (se existir)
      // e atualiza o cache em segundo plano; sem cache, aguarda a rede.
      return cached || networkFetch;
    })
  );
});
