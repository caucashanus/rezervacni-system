const CACHE_NAME = 'real-barber-v1';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

// Handle the beforeinstallprompt event
self.addEventListener('beforeinstallprompt', (event) => {
  // Get the current URL parameters
  const url = new URL(event.target.location.href);
  const key = url.searchParams.get('key');
  
  if (key) {
    // Store the key in IndexedDB
    const request = indexedDB.open('RealBarberDB', 1);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings');
      }
    };
    
    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(['settings'], 'readwrite');
      const store = transaction.objectStore('settings');
      store.put(key, 'pwa_key');
    };
  }
}); 