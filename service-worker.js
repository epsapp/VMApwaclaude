// ══════════════════════════════════════════════════════════
//  VMA Tracker — Service Worker
//  Stratégie : Cache First + Network Fallback
//  Mise à jour automatique à chaque nouvelle version
// ══════════════════════════════════════════════════════════

const CACHE_NAME = 'vma-tracker-v1';

// Fichiers à mettre en cache lors de l'installation
const ASSETS_TO_CACHE = [
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  // Police Google Fonts (sera mise en cache si accessible au 1er chargement)
  'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@400;500&family=DM+Sans:wght@300;400;500;700&display=swap'
];

// ── INSTALLATION : mise en cache des ressources principales ──
self.addEventListener('install', event => {
  console.log('[SW] Installation du Service Worker…');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Mise en cache des fichiers principaux');
        // On met en cache les fichiers locaux en priorité
        // Les ressources externes (Google Fonts) sont tentées mais non bloquantes
        return cache.addAll(['./index.html', './manifest.json', './icons/icon-192.png', './icons/icon-512.png'])
          .then(() => {
            // Tentative de mise en cache des polices (peut échouer hors ligne)
            return cache.add('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@400;500&family=DM+Sans:wght@300;400;500;700&display=swap')
              .catch(() => console.log('[SW] Polices Google non mises en cache (normal hors ligne)'));
          });
      })
      .then(() => {
        console.log('[SW] Installation terminée');
        // Activation immédiate sans attendre la fermeture des onglets
        return self.skipWaiting();
      })
  );
});

// ── ACTIVATION : nettoyage des anciens caches ──
self.addEventListener('activate', event => {
  console.log('[SW] Activation du Service Worker…');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => {
            console.log('[SW] Suppression ancien cache :', name);
            return caches.delete(name);
          })
      );
    }).then(() => {
      console.log('[SW] Activation terminée — contrôle de tous les clients');
      return self.clients.claim();
    })
  );
});

// ── FETCH : stratégie Cache First ──
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // On ne gère que les requêtes GET
  if (event.request.method !== 'GET') return;

  // Stratégie spéciale pour les polices Google : Cache First, puis réseau
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(
      caches.match(event.request).then(cached => {
        if (cached) return cached;
        return fetch(event.request)
          .then(response => {
            if (!response || response.status !== 200) return response;
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
            return response;
          })
          .catch(() => {
            // Pas de police dispo — l'app fonctionne quand même avec les polices système
            return new Response('', { status: 200 });
          });
      })
    );
    return;
  }

  // Pour toutes les autres ressources : Cache First, puis réseau, puis page offline
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) {
        // Ressource en cache trouvée : on la retourne ET on met à jour en arrière-plan
        const fetchPromise = fetch(event.request)
          .then(response => {
            if (response && response.status === 200 && response.type !== 'opaque') {
              caches.open(CACHE_NAME).then(cache => cache.put(event.request, response.clone()));
            }
            return response;
          })
          .catch(() => {/* Pas de réseau — on utilise le cache */});
        return cached; // Retourne immédiatement le cache
      }

      // Pas en cache : on tente le réseau
      return fetch(event.request)
        .then(response => {
          if (!response || response.status !== 200 || response.type === 'opaque') {
            return response;
          }
          // On met en cache la nouvelle ressource
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return response;
        })
        .catch(() => {
          // Pas de réseau ET pas de cache → page de fallback
          if (event.request.headers.get('accept').includes('text/html')) {
            return caches.match('./index.html');
          }
          return new Response('Ressource non disponible hors ligne', { status: 503 });
        });
    })
  );
});

// ── MESSAGE : forcer la mise à jour depuis l'app ──
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
