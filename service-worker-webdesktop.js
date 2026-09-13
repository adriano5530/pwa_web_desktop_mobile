const CACHE_NAME = 'pwa-wdim-cache-v1';
const ASSETS_PARA_CACHEAR = [
  "./",
  "./webdesktopmobile.html",
  "./offline_apps/documentos/documentos.html",
  "./offline_apps/documentos/jsbib/tinymce.min.js",
  "./offline_apps/documentos/jsbib/mammoth.browser.min.js",
  "./offline_apps/documentos/jsbib/webodf.js",
  "./offline_apps/documentos/jsbib/FileSaver.min.js",
  "./offline_apps/planilhas/planilhas.html",
  "./offline_apps/planilhas/jslib/FileSaver.min.js",
  "./offline_apps/planilhas/jslib/xlsx.full.min.js",
  "./offline_apps/browser.html",
  "./offline_apps/iaoff/webllm-chat.html",
  "./offline_apps/bloco-notas-offline-editor.html",
  "./offline_apps/notastudoemum.html",
  "./offline_apps/desenho.html",
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

// Instalação do SW: pré-carrega os arquivos essenciais
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Service Worker: Armazenando assets estáticos no cache');
      return cache.addAll(ASSETS_PARA_CACHEAR);
    }).then(() => self.skipWaiting())
  );
});

// Ativação do SW: limpa caches antigos, se houver
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Service Worker: Apagando cache antigo', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Intercepta requisições - navegação com fallback pro app shell, demais assets com stale-while-revalidate
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET' || !request.url.startsWith('http')) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match('./webdesktopmobile.html', { ignoreSearch: true }))
    );
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cachedResponse = await cache.match(request, { ignoreSearch: true });

      const networkFetch = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || networkFetch;
    })
  );
});