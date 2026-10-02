// Aumente a VERSION sempre que quiser forçar a renovação do cache
const VERSION = 'v2';
const CACHE_PREFIX = 'pwa-wdim-cache-';
const CACHE_NAME = CACHE_PREFIX + VERSION;

// Crítico: se qualquer um destes falhar, a instalação falha (o que é desejável)
const SHELL = [
  './',
  './webdesktopmobile.html',
  './offline_apps/documentos/documentos.html',
  './offline_apps/documentos/jsbib/tinymce.min.js',
  './offline_apps/documentos/jsbib/mammoth.browser.min.js',
  './offline_apps/documentos/jsbib/webodf.js',
  './offline_apps/documentos/jsbib/FileSaver.min.js',
  './offline_apps/planilhas/planilhas.html',
  './offline_apps/planilhas/jslib/FileSaver.min.js',
  './offline_apps/planilhas/jslib/xlsx.full.min.js',
  './offline_apps/browser.html',
  './offline_apps/bloco-notas-offline-editor.html',
  './offline_apps/touchpad.js',
  './offline_apps/calculadora.html',
  './offline_apps/filemanager.html',
  './offline_apps/camera.html'
];

// Opcionais: falha em um não derruba a instalação
const APPS = [
  './offline_apps/iaoff/webllm-chat.html',
  './offline_apps/desenho.html',
  './offline_apps/rotina.html',
  './offline_apps/diario/diario.html',
  './offline_apps/diario/crypto-js.min.js',
  './offline_apps/tarefas.html',
  './offline_apps/youtube-wrapper.html', 
  './offline_apps/player.html',
  './offline_apps/porcentagem.html',
  './offline_apps/calcdata.html',
  './offline_apps/terminal.html'
];

const MSG_OFFLINE = `<!doctype html><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<body style="font-family:sans-serif;padding:24px;text-align:center">
<h3>App ainda não salvo para uso offline</h3>
<p>Abra este app uma vez com internet para ele ficar disponível offline.</p></body>`;

// ---------- INSTALL ----------
self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    // 'reload' evita pegar versão velha do cache HTTP do navegador
    await cache.addAll(SHELL.map((u) => new Request(u, { cache: 'reload' })));
    await Promise.allSettled(
      APPS.map((u) => cache.add(new Request(u, { cache: 'reload' })))
    );
    await self.skipWaiting();
  })());
});

// ---------- ACTIVATE ----------
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(
      names
        .filter((n) => n.startsWith(CACHE_PREFIX) && n !== CACHE_NAME)
        .map((n) => caches.delete(n))
    );
    await self.clients.claim();
  })());
});

// ---------- FETCH: stale-while-revalidate com fallbacks seguros ----------
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || !req.url.startsWith('http')) return;
  // Mídia (áudio/vídeo) usa Range -> resposta 206 não pode ir para o cache
  if (req.headers.has('range')) return;

  event.respondWith(handle(event));
});

async function handle(event) {
  const req = event.request;
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(req);

  const network = fetch(req)
    .then((res) => {
      // Só guarda respostas boas (nunca 404/500/opaque)
      if (res && res.status === 200 && (res.type === 'basic' || res.type === 'cors')) {
        cache.put(req, res.clone());
      }
      return res;
    })
    .catch(() => null);

  if (cached) {
    event.waitUntil(network); // deixa a atualização terminar em segundo plano
    return cached;
  }

  const res = await network;
  return res || offlineFallback(req, cache);
}

async function offlineFallback(req, cache) {
  // 1) mesma URL ignorando query string (?v=123, ?app=x ...)
  const hit = await cache.match(req, { ignoreSearch: true });
  if (hit) return hit;

  if (req.mode === 'navigate') {
    // 2) Só a navegação do documento principal cai no shell.
    //    Navegação de iframe (apps) NÃO pode cair no shell, senão o
    //    desktop abre dentro dele mesmo, em loop.
    if (req.destination === 'document') {
      const shell = await cache.match('./webdesktopmobile.html');
      if (shell) return shell;
    }
    return new Response(MSG_OFFLINE, {
      status: 503,
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  }

  return Response.error();
}
