const CACHE = 'cohen-adventure-v1';
const STATIC = ['/', '/offline.html', '/manifest.json', '/icons/icon-192.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(STATIC)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))),
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const { request } = e;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== location.origin) return; // let CDN/fonts/wixstatic pass through

  // HTML pages: network-first, fall back to cache then offline page
  if (request.headers.get('accept')?.includes('text/html')) {
    e.respondWith(
      fetch(request)
        .then((res) => { const clone = res.clone(); caches.open(CACHE).then((c) => c.put(request, clone)); return res; })
        .catch(() => caches.match(request).then((c) => c || caches.match('/offline.html'))),
    );
    return;
  }

  // Same-origin static assets: cache-first
  e.respondWith(
    caches.match(request).then((cached) => cached || fetch(request).then((res) => {
      if (res.ok && /\.(js|css|woff2?|png|jpg|jpeg|svg|webp|ico)$/.test(url.pathname)) {
        const clone = res.clone(); caches.open(CACHE).then((c) => c.put(request, clone));
      }
      return res;
    })),
  );
});
