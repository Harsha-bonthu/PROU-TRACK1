const CACHE_NAME = 'aurora-store-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/auth.js',
  '/data.json'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)).then(()=> self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(self.clients.claim());
});

// fetch strategy: stale-while-revalidate for assets, network-first for data.json
self.addEventListener('fetch', (e) => {
  const req = e.request;
  // network-first for data.json to keep data fresh, fallback to cache
  if(req.url.endsWith('data.json')){
    e.respondWith(fetch(req).then(r=>{ if(r && r.ok){ caches.open(CACHE_NAME).then(c=>c.put(req, r.clone())); } return r; }).catch(()=> caches.match('/data.json')));
    return;
  }
  // stale-while-revalidate for static assets
  e.respondWith(caches.match(req).then(cached => {
    const networkFetch = fetch(req).then(resp => {
      if(req.method === 'GET' && resp && resp.ok && new URL(req.url).origin === location.origin){
        caches.open(CACHE_NAME).then(c => c.put(req, resp.clone()));
      }
      return resp;
    }).catch(()=>{});
    return cached || networkFetch.then(r=>r).catch(()=> caches.match('/index.html'));
  }));
});
