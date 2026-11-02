// sw.js — Service Worker del Panel de actividad (red primero; la copia guardada solo si no hay conexión)
const CACHE = 'panel-v1';
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.add('/panel/').catch(() => {})));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const u = new URL(e.request.url);
  if (u.origin !== self.location.origin) return; // Firebase, fuentes y demás van directo a la red
  e.respondWith(
    fetch(e.request).then(res => {
      if (res && res.status === 200) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
      return res;
    }).catch(() => caches.match(e.request).then(c => c || (e.request.mode === 'navigate' ? caches.match('/panel/') : undefined)))
  );
});
