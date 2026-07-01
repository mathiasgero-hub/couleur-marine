// Couleur Marine — Service Worker
// Placer ce fichier dans le même dossier que couleur-marine.html
// Il sera automatiquement utilisé quand l'app est servie via HTTPS (ex: GitHub Pages)

const CACHE_NAME = 'couleur-marine-v1';
const ASSETS = [
  './',
  './couleur-marine.html'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  clients.claim();
});

self.addEventListener('fetch', e => {
  // Navigation : réseau d'abord, cache en fallback (offline)
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request)
        .then(res => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
          return res;
        })
        .catch(() => caches.match('./couleur-marine.html'))
    );
    return;
  }
  // Ressources (fonts, etc.) : cache d'abord
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});
