/* ═══════════════════════════════════════════
   SW.JS — Service Worker
   Cache primeiro para performance máxima
═══════════════════════════════════════════ */

const CACHE_NAME = 'jv-portfolio-v1';

const CACHE_URLS = [
  './',
  './index.html',
  './sobre.html',
  './projetos.html',
  './contato.html',
  './css/global.css',
  './css/index.css',
  './css/pages.css',
  './js/app.js',
  './js/features.js',
];

/* ── Instala e faz cache dos assets estáticos ── */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(CACHE_URLS))
  );
  self.skipWaiting();
});

/* ── Remove caches velhos ── */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

/* ── Estratégia: Cache First, fallback para rede ── */
self.addEventListener('fetch', event => {
  const req = event.request;

  // Ignora requisições não-GET e APIs externas
  if (req.method !== 'GET' ||
      req.url.includes('api.github.com') ||
      req.url.includes('formspree.io') ||
      req.url.includes('fonts.googleapis') ||
      req.url.includes('fonts.gstatic')) {
    return;
  }

  event.respondWith(
    caches.match(req).then(cached => {
      if (cached) {
        // Serve do cache e atualiza em background (stale-while-revalidate)
        fetch(req).then(fresh => {
          if (fresh && fresh.ok) {
            caches.open(CACHE_NAME).then(cache => cache.put(req, fresh));
          }
        }).catch(() => {});
        return cached;
      }

      return fetch(req).then(fresh => {
        if (fresh && fresh.ok) {
          const clone = fresh.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(req, clone));
        }
        return fresh;
      });
    }).catch(() => caches.match('./index.html'))
  );
});
