const CACHE_NAME = 'mockstore-v1';
const PRECACHE = [
  '/', '/index.html', '/style.css', '/app.js', '/data.json', '/admin.html', '/login.html'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE)));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.map(k => { if(k !== CACHE_NAME) return caches.delete(k);}))));
});

self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);
  // network-first for data.json to keep analytics fresh
  if(url.pathname.endsWith('/data.json') || url.pathname.endsWith('data.json')){
    event.respondWith(fetch(req).then(r=>{ const c = r.clone(); caches.open(CACHE_NAME).then(cache=>cache.put(req, c)); return r; }).catch(()=>caches.match(req)));
    return;
  }

  // cache-first for others
  event.respondWith(caches.match(req).then(cached => cached || fetch(req).then(r=>{ caches.open(CACHE_NAME).then(cache=>cache.put(req, r.clone())); return r; })).catch(()=>caches.match('/index.html')));
});
