const CACHE_NAME = 'shopabell-v1'
const urlsToCache = [
  '/',
  '/whatsapp-onboarding',
  '/dashboard',
  '/login',
  '/offline',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
]

// Install event
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache')
        return cache.addAll(urlsToCache)
      })
  )
})

// Fetch event with offline fallback
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch from network
        if (response) {
          return response
        }
        
        return fetch(event.request)
          .then(response => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response
            }
            
            // Clone the response
            const responseToCache = response.clone()
            
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache)
              })
              
            return response
          })
      })
      .catch(() => {
        // Return offline page for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match('/offline')
        }
      })
  )
})

// Activate event
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME]
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
})

// Background sync for offline orders
self.addEventListener('sync', event => {
  if (event.tag === 'sync-orders') {
    event.waitUntil(syncOfflineOrders())
  }
})

async function syncOfflineOrders() {
  try {
    // Get offline orders from IndexedDB
    const offlineOrders = await getOfflineOrders()
    
    for (const order of offlineOrders) {
      try {
        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(order)
        })
        
        if (response.ok) {
          // Remove from offline storage
          await removeOfflineOrder(order.id)
        }
      } catch (error) {
        console.error('Failed to sync order:', error)
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error)
  }
}

// Helper functions for IndexedDB operations
async function getOfflineOrders() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('ShopabellDB', 1)
    
    request.onsuccess = event => {
      const db = event.target.result
      const transaction = db.transaction(['offline-orders'], 'readonly')
      const objectStore = transaction.objectStore('offline-orders')
      const getAllRequest = objectStore.getAll()
      
      getAllRequest.onsuccess = () => {
        resolve(getAllRequest.result)
      }
    }
    
    request.onerror = () => {
      reject(request.error)
    }
  })
}

async function removeOfflineOrder(orderId) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('ShopabellDB', 1)
    
    request.onsuccess = event => {
      const db = event.target.result
      const transaction = db.transaction(['offline-orders'], 'readwrite')
      const objectStore = transaction.objectStore('offline-orders')
      const deleteRequest = objectStore.delete(orderId)
      
      deleteRequest.onsuccess = () => {
        resolve()
      }
    }
    
    request.onerror = () => {
      reject(request.error)
    }
  })
}