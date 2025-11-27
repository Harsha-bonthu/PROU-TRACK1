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

self.addEventListener('fetch', (e) => {
  const req = e.request;
  // network-first for data.json
  if(req.url.endsWith('data.json')){
    e.respondWith(fetch(req).catch(()=> caches.match('/data.json')));
    return;
  }
  // otherwise cache-first
  e.respondWith(caches.match(req).then(r => r || fetch(req).then(resp => {
    // put non-cross-origin GET requests into cache
    if(req.method === 'GET' && resp && resp.ok && new URL(req.url).origin === location.origin){
      caches.open(CACHE_NAME).then(c => c.put(req, resp.clone()));
    }
    return resp;
  }).catch(()=> caches.match('/index.html'))));
});
