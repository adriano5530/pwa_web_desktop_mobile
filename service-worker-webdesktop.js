const CACHE_NAME = 'rotina-acao';
// A parte principal e apps essenciais entram pré-cacheados na instalação. Todo o resto
// (cada app dentro de offline_apps/, suas libs, imagens etc.) é cacheado
// automaticamente em tempo de execução na primeira vez que for aberto
// com internet — não precisa editar esta lista ao adicionar um app novo.
// Único cuidado: um app não pré-cacheado só funciona offline DEPOIS de ter sido aberto
// pelo menos uma vez estando online.
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
      (async () => {
        const cache = await caches.open(CACHE_NAME);
        try {
          const networkResponse = await fetch(request);
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        } catch {
          // Offline: tenta primeiro servir a própria página pedida (ex.: um
          // app aberto num iframe, como documentos.html ou calculadora.html).
          const cachedPage = await cache.match(request, { ignoreSearch: true });
          if (cachedPage) return cachedPage;

          // Só cai pra casca principal (webdesktopmobile.html) se a navegação
          // pedida FOR a própria raiz do site — nunca pra um app específico
          // que não esteja cacheado, senão o desktop abre aninhado dentro
          // da janela do app.
          const url = new URL(request.url);
          const ehRaiz = url.pathname.endsWith('/') || url.pathname.endsWith('webdesktopmobile.html');
          if (ehRaiz) {
            const shell = await cache.match('./webdesktopmobile.html', { ignoreSearch: true });
            if (shell) return shell;
          }

          // App específico ainda não salvo para uso offline: mostra aviso
          // em vez de reaproveitar a casca do desktop.
          return new Response(
            `<!DOCTYPE html><html><body style="font-family:sans-serif;background:#1e1e1e;color:#eee;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;text-align:center;padding:20px;box-sizing:border-box;">
              <div>
                <p style="font-size:40px;margin:0 0 10px;">📴</p>
                <p>Este app ainda não foi salvo para uso offline.<br>Abra-o uma vez conectado à internet.</p>
              </div>
            </body></html>`,
            { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
          );
        }
      })()
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