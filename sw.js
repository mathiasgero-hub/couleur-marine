// Couleur Marine — Service Worker v2
// Placer ce fichier dans le même dossier que couleur-marine.html
// (même répertoire racine sur GitHub Pages)

const CACHE = 'couleur-marine-v2';

// Ressources pré-cachées à l'installation
const PRECACHE = [
  './',
  './couleur-marine.html'
];

// ── INSTALL : pré-cache la page HTML ──────────────────────────────────────
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(PRECACHE))
  );
  self.skipWaiting();
});

// ── ACTIVATE : supprime les anciens caches ────────────────────────────────
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  clients.claim();
});

// ── FETCH ─────────────────────────────────────────────────────────────────
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // 1. Navigation (page HTML) : cache en priorité → réseau en mise à jour arrière-plan
  if (e.request.mode === 'navigate') {
    e.respondWith(
      caches.open(CACHE).then(cache =>
        cache.match('./couleur-marine.html').then(cached => {
          const networkFetch = fetch(e.request)
            .then(res => {
              if (res && res.ok) cache.put(e.request, res.clone());
              return res;
            })
            .catch(() => null);
          return cached || networkFetch;
        })
      )
    );
    return;
  }

  // 2. Polices Google Fonts (CSS + woff2) : cache en priorité
  if (
    url.hostname === 'fonts.googleapis.com' ||
    url.hostname === 'fonts.gstatic.com'
  ) {
    e.respondWith(
      caches.open(CACHE).then(cache =>
        cache.match(e.request).then(cached => {
          if (cached) return cached;
          return fetch(e.request, { mode: 'cors' }).then(res => {
            if (res && res.ok) cache.put(e.request, res.clone());
            return res;
          });
        })
      )
    );
    return;
  }

  // 3. Tout le reste : réseau avec fallback cache
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});
