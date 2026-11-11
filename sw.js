// Minimal service worker: network-first (always fresh), cached copy only as offline fallback.
const C = 'wird-v1';
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== location.origin || u.search) return;
  e.respondWith(
    fetch(r, { cache: 'no-cache' })
      .then(res => {
        if (res.ok) { const cp = res.clone(); caches.open(C).then(c => c.put(r, cp)); }
        return res;
      })
      .catch(() => caches.match(r).then(m => m || caches.match('./')))
  );
});
