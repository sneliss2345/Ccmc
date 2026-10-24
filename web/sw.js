// Offline cache for the installed web version of «Звёздный рой».
const CACHE = 'zvezdny-roy-v1';
const CORE = [
  './', './index.html', './orbita.html', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png',
  './js/core.js', './js/data.js', './js/audio.js', './js/art.js', './js/game.js', './js/draw.js', './js/ui.js', './js/main.js',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Network first, so updates arrive; cached copy (including Google Fonts) when offline.
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        if (res.ok || res.type === 'opaque') {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy));
        }
        return res;
      })
      .catch(() => caches.match(e.request).then((hit) => hit || caches.match('./index.html')))
  );
});
