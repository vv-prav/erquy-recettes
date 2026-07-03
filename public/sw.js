// sw.js — service worker minimal : cache l'app shell, réseau prioritaire pour le reste
// Incrémente CACHE_VERSION à chaque modif d'un fichier statique pour forcer la mise à jour.
const CACHE_VERSION = 'mes-recettes-v1';

const APP_SHELL = [
  '/',
  '/index.html',
  '/css/style.css',
  '/manifest.json',
  '/js/app.js',
  '/js/api.js',
  '/js/presets.js',
  '/js/icons.js',
  '/js/utils.js',
  '/js/components/card.js',
  '/js/components/bottomnav.js',
  '/js/views/home.js',
  '/js/views/add.js',
  '/js/views/list.js',
  '/js/views/detail.js',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Jamais de cache pour Socket.io : le temps réel doit passer par le réseau.
  if (request.url.includes('/socket.io/')) return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy)).catch(() => {});
        return response;
      })
      .catch(() => caches.match(request))
  );
});
