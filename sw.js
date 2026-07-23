/* Electron Wrangler service worker — network-first for freshness, cache fallback offline */
const CACHE = 'electron-wrangler-v8';
const ASSETS = ['./', 'ElectronWrangler.html', 'ElectronWrangler_dist.html', 'electron_wrangler.js', 'manifest.json', 'favicon.ico'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => Promise.all(ASSETS.map(url => c.add(url).catch(()=>{}))))); self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  // network-first: always try the network so app/JS updates reach installed users;
  // fall back to cache (and cache fresh copies) so the app still works fully offline.
  e.respondWith(fetch(e.request).then(res => {
    const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)).catch(()=>{}); return res;
  }).catch(() => caches.match(e.request).then(hit => hit || caches.match('ElectronWrangler.html'))));
});
