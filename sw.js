const CACHE = 'caderneta-2';
const FILES = ['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== CACHE).map(x => caches.delete(x)))).then(() => self.clients.claim()));
});
/* Abre sempre do celular, sem esperar o sinal; atualiza em segundo plano quando há internet. */
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const isPage = e.request.mode === 'navigate';
  e.respondWith(caches.open(CACHE).then(async c => {
    const hit = await c.match(isPage ? 'index.html' : e.request, { ignoreSearch: true });
    const net = fetch(e.request).then(r => {
      if (r && r.ok) c.put(isPage ? 'index.html' : e.request, r.clone());
      return r;
    });
    if (hit) { e.waitUntil(net.catch(() => {})); return hit; }
    return net;
  }));
});
