'use client';

import { useEffect, useState } from 'react';

export function PWAKeyManager() {
  const [pwaKey, setPwaKey] = useState<string | null>(null);

  useEffect(() => {
    // Check if we're running as a PWA
    const isPWA = window.matchMedia('(display-mode: standalone)').matches || 
                 (window.navigator as any).standalone === true;

    if (isPWA) {
      // Try to get the key from IndexedDB
      const request = indexedDB.open('RealBarberDB', 1);
      
      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const transaction = db.transaction(['settings'], 'readonly');
        const store = transaction.objectStore('settings');
        const getRequest = store.get('pwa_key');
        
        getRequest.onsuccess = () => {
          if (getRequest.result) {
            setPwaKey(getRequest.result);
            // You can use this key in your application
            // For example, store it in localStorage or use it in API calls
            localStorage.setItem('pwa_key', getRequest.result);
          }
        };
      };
    } else {
      // If not PWA, check URL parameters
      const url = new URL(window.location.href);
      const key = url.searchParams.get('key');
      if (key) {
        setPwaKey(key);
        localStorage.setItem('pwa_key', key);
      }
    }
  }, []);

  return null;
} 