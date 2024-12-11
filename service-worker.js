// Cache versions
const CACHE_VERSION = 'v5';
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `dynamic-${CACHE_VERSION}`;
const OFFLINE_PAGE = './offline.html';

// Static assets to cache on install
const STATIC_ASSETS = [
  './',
  './index.html',
  './offline.html',
  './manifest.json',
  './styles/main.css',
  './styles/components/modal.css',
  './styles/components/inputs.css',
  './styles/components/notifications.css',
  './icons/icon-192x192.png',
  './icons/icon-512x512.png',
  './js/app.js',
  './js/config.js',
  './js/api.js',
  './js/audioRecorder.js',
  './js/components.js',
  './js/uiManager.js',
  './js/transcriptionManager.js',
  './js/themeManager.js',
  './js/aiCleanup.js',
  './js/aiGenerate.js',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Silkscreen&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then(keys => {
        return Promise.all(
          keys.map(key => {
            if (!key.includes(CACHE_VERSION)) {
              return caches.delete(key);
            }
          })
        );
      })
    ])
  );
});

// Helper function to handle network requests with timeout
const timeoutFetch = (request, timeout = 5000) => {
  // Use a longer timeout for API requests
  if (request.url.includes('/api/')) {
    timeout = 300000; // 5 minutes for API requests
  }
  return Promise.race([
    fetch(request),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Request timed out')), timeout)
    )
  ]);
};

// Fetch event - implement stale-while-revalidate strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Handle navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .catch(() => caches.match(OFFLINE_PAGE))
    );
    return;
  }

  // Skip caching for non-GET requests
  if (request.method !== 'GET') {
    event.respondWith(timeoutFetch(request));
    return;
  }

  // For GET requests, use stale-while-revalidate
  event.respondWith(
    caches.match(request)
      .then(cachedResponse => {
        const fetchPromise = timeoutFetch(request)
          .then(networkResponse => {
            // Cache successful GET responses in dynamic cache
            if (networkResponse.ok) {
              const responseToCache = networkResponse.clone();
              caches.open(DYNAMIC_CACHE)
                .then(cache => cache.put(request, responseToCache));
            }
            return networkResponse;
          })
          .catch(error => {
            console.log('Fetch failed:', error);
            // If it's an image, return a default offline image
            if (request.destination === 'image') {
              return caches.match('./icons/icon-192x192.png');
            }
            // For API requests, return a JSON error
            if (request.url.includes('/api/')) {
              return new Response(
                JSON.stringify({ error: 'Network error' }),
                { 
                  status: 503,
                  headers: { 'Content-Type': 'application/json' }
                }
              );
            }
            throw error;
          });

        return cachedResponse || fetchPromise;
      })
  );
});

// Background sync for pending operations
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-transcriptions') {
    event.waitUntil(syncPendingTranscriptions());
  }
});

// Helper function to sync pending transcriptions
async function syncPendingTranscriptions() {
  try {
    const pendingTranscriptions = await getPendingTranscriptions();
    for (const transcription of pendingTranscriptions) {
      await syncTranscription(transcription);
    }
  } catch (error) {
    console.error('Sync failed:', error);
  }
}

// Cache size management
async function trimCache(cacheName, maxItems = 50) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > maxItems) {
    await Promise.all(
      keys.slice(0, keys.length - maxItems).map(key => cache.delete(key))
    );
  }
}
