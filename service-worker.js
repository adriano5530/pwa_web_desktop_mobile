const CACHE_NAME = 'pwa-cache-v1';
const PRECACHE_URLS = [
 "./",
  "./index.html",
  "./offline_apps/documentos/documentos.html",
  "./offline_apps/documentos/jsbib/tinymce.min.js",
  "./offline_apps/documentos/jsbib/mammoth.browser.min.js",
  "./offline_apps/documentos/jsbib/webodf.js",
  "./offline_apps/documentos/jsbib/FileSaver.min.js",
  "./offline_apps/planilhas.html",
  "./offline_apps/browser.html",
  "./offline_apps/iaoff/webllm-chat.html",
  "./offline_apps/notastudoemum.html",
  "./offline_apps/whiteboard/index.html",
  "./offline_apps/camera.html",
  "./offline_apps/rotina.html",
  "./offline_apps/diario/diario.html",
  "./offline_apps/diario/crypto-js.min.js",
  "./offline_apps/tarefas.html",
  "./offline_apps/touchpad.js",
  "./offline_apps/calculadora.html",
  "./offline_apps/youtube-wrapper.html",
  "./offline_apps/filemanager.html",
  "./offline_apps/player.html",
  "./offline_apps/porcentagem.html",
  "./offline_apps/calcdata.html",
  "./offline_apps/terminal.html"
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

