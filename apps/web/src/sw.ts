import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist';
import { Serwist } from 'serwist';

// This declares the value of `injectionPoint` to TypeScript.
// `injectionPoint` is the string that will be replaced by the
// actual precache manifest. By default, this string is set to
// `"self.__SW_MANIFEST"`.
declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: any;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST || [],
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  disableDevLogs: process.env.NODE_ENV === 'production', // Only disable in production
  fallbacks: {
    entries: [
      {
        url: '/offline',
        matcher({ request }) {
          return request.destination === 'document';
        },
      },
    ],
  },
  runtimeCaching: [
    {
      matcher: /^https:\/\/fonts\.googleapis\.com\/.*/i,
      handler: 'CacheFirst' as any,
      options: {
        cacheName: 'google-fonts',
        expiration: {
          maxEntries: 4,
          maxAgeSeconds: 365 * 24 * 60 * 60 // 365 days
        }
      }
    } as any,
    {
      matcher: /^https:\/\/fonts\.gstatic\.com\/.*/i,
      handler: 'CacheFirst' as any,
      options: {
        cacheName: 'google-fonts-static',
        expiration: {
          maxEntries: 4,
          maxAgeSeconds: 365 * 24 * 60 * 60 // 365 days
        }
      }
    } as any,
    {
      matcher: /\.(?:js|css|woff2?|png|jpg|jpeg|gif|svg|ico)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-assets',
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 24 * 60 * 60 // 24 hours
        }
      }
    } as any,
    {
      matcher: /^\/api\/(lists|tasks|folders|notifications)\/?.*$/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-data-cache',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 30 * 60 // 30 minutes for data
        },
        networkTimeoutSeconds: 5,
        cacheKeyWillBeUsed: async ({ request }: any) => {
          // Remove auth headers from cache key to avoid cache misses
          const url = new URL(request.url);
          return url.pathname + url.search;
        }
      }
    } as any,
    {
      matcher: /^\/api\/auth\/.*/i,
      handler: 'NetworkOnly', // Never cache auth endpoints
    },
    {
      matcher: /^\/api\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 5 * 60 // 5 minutes for other API calls
        },
        networkTimeoutSeconds: 10
      }
    }
  ]
});

serwist.addEventListeners();

// Background Sync for offline operations
self.addEventListener('sync', (event: any) => {
  console.log('Background sync triggered:', event.tag);
  
  if (event.tag === 'sync-offline-actions') {
    event.waitUntil(syncOfflineActions());
  }
});

// Handle offline task operations
self.addEventListener('message', (event: any) => {
  if (event.data && event.data.type === 'OFFLINE_ACTION') {
    // Store offline action in IndexedDB
    storeOfflineAction(event.data.payload);
    
    // Register for background sync
    self.registration.sync.register('sync-offline-actions');
  }
});

// Store offline actions in IndexedDB
async function storeOfflineAction(action: any) {
  try {
    const db = await openOfflineDB();
    const tx = db.transaction(['offline_actions'], 'readwrite');
    const store = tx.objectStore('offline_actions');
    
    await store.add({
      ...action,
      timestamp: Date.now(),
      id: crypto.randomUUID(),
    });
    
    console.log('Stored offline action:', action);
  } catch (error) {
    console.error('Failed to store offline action:', error);
  }
}

// Sync offline actions when online
async function syncOfflineActions() {
  try {
    const db = await openOfflineDB();
    const tx = db.transaction(['offline_actions'], 'readwrite');
    const store = tx.objectStore('offline_actions');
    
    const actions = await store.getAll();
    
    for (const action of actions as any) {
      try {
        // Send action to server
        const response = await fetch(action.url, {
          method: action.method,
          headers: action.headers,
          body: action.body,
        });
        
        if (response.ok) {
          // Remove successful action from storage
          await store.delete(action.id);
          console.log('Synced offline action:', action);
        }
      } catch (error) {
        console.error('Failed to sync action:', action, error);
      }
    }
  } catch (error) {
    console.error('Failed to sync offline actions:', error);
  }
}

// Initialize IndexedDB for offline storage
function openOfflineDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('FamTodoOffline', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create offline actions store
      if (!db.objectStoreNames.contains('offline_actions')) {
        const store = db.createObjectStore('offline_actions', { keyPath: 'id' });
        store.createIndex('timestamp', 'timestamp');
      }
      
      // Create cached data store
      if (!db.objectStoreNames.contains('cached_data')) {
        const store = db.createObjectStore('cached_data', { keyPath: 'key' });
        store.createIndex('timestamp', 'timestamp');
      }
    };
  });
}

// Install event - cache critical assets
self.addEventListener('install', (event: any) => {
  console.log('Service Worker installing');
  event.waitUntil(
    caches.open('nestlist-critical-v1').then(async (cache) => {
      try {
        // Add files individually to avoid failing if some don't exist
        const criticalUrls = ['/', '/login', '/dashboard', '/offline', '/manifest.json', '/icon-192x192.png'];
        
        for (const url of criticalUrls) {
          try {
            const response = await fetch(url, { method: 'HEAD' });
            if (response.ok) {
              await cache.add(url);
              console.log(`Cached: ${url}`);
            } else {
              console.warn(`Skipping ${url} - not available (${response.status})`);
            }
          } catch (error) {
            console.warn(`Failed to cache ${url}:`, error);
          }
        }
      } catch (error) {
        console.warn('Failed to cache critical assets:', error);
      }
    })
  );
});

// Push notification support
self.addEventListener('push', (event: any) => {
  if (!event.data) return;
  
  try {
    const data = event.data.json();
    const options = {
      body: data.message,
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      data: data.data,
      actions: [
        {
          action: 'view',
          title: 'Se detaljer',
        },
        {
          action: 'dismiss',
          title: 'Afvis',
        },
      ],
      requireInteraction: true,
      vibrate: [200, 100, 200],
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  } catch (error) {
    console.error('Error handling push notification:', error);
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event: any) => {
  event.notification.close();
  
  if (event.action === 'view') {
    // Open the app to the relevant page
    const urlToOpen = event.notification.data?.url || '/dashboard';
    
    event.waitUntil(
      self.clients.matchAll({ type: 'window' }).then((clients: any) => {
        // Check if app is already open
        for (const client of clients) {
          if (client.url.includes(urlToOpen) && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Open new window
        if (self.clients.openWindow) {
          return self.clients.openWindow(urlToOpen);
        }
      })
    );
  }
});