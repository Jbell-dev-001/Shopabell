const CACHE_NAME = 'shopabell-v1.0.0'
const STATIC_CACHE_NAME = 'shopabell-static-v1.0.0'
const DYNAMIC_CACHE_NAME = 'shopabell-dynamic-v1.0.0'

// Static assets to cache
const STATIC_ASSETS = [
  '/',
  '/login',
  '/dashboard',
  '/explore',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
]

// API routes that should be cached
const CACHE_API_ROUTES = [
  '/api/products',
  '/api/orders',
  '/api/analytics'
]

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...')
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then(cache => {
        console.log('Caching static assets')
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => {
        return self.skipWaiting()
      })
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...')
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE_NAME && 
                cacheName !== DYNAMIC_CACHE_NAME &&
                cacheName !== CACHE_NAME) {
              console.log('Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => {
        return self.clients.claim()
      })
  )
})

// Fetch event - implement caching strategy
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-HTTP requests
  if (!request.url.startsWith('http')) {
    return
  }

  // Skip if it's a chrome extension request
  if (request.url.includes('chrome-extension')) {
    return
  }

  // Handle different types of requests
  if (request.method === 'GET') {
    // Static assets - Cache First strategy
    if (STATIC_ASSETS.some(asset => request.url.includes(asset))) {
      event.respondWith(cacheFirstStrategy(request, STATIC_CACHE_NAME))
    }
    // API routes - Network First strategy
    else if (CACHE_API_ROUTES.some(route => request.url.includes(route))) {
      event.respondWith(networkFirstStrategy(request, DYNAMIC_CACHE_NAME))
    }
    // Pages - Stale While Revalidate strategy
    else if (request.headers.get('accept')?.includes('text/html')) {
      event.respondWith(staleWhileRevalidateStrategy(request, DYNAMIC_CACHE_NAME))
    }
    // Images and other assets - Cache First strategy
    else if (request.headers.get('accept')?.includes('image/')) {
      event.respondWith(cacheFirstStrategy(request, DYNAMIC_CACHE_NAME))
    }
  }
})

// Cache First Strategy - for static assets
async function cacheFirstStrategy(request, cacheName) {
  try {
    const cache = await caches.open(cacheName)
    const cachedResponse = await cache.match(request)
    
    if (cachedResponse) {
      return cachedResponse
    }
    
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch (error) {
    console.error('Cache First strategy failed:', error)
    return new Response('Offline - Asset not available', { status: 503 })
  }
}

// Network First Strategy - for API calls
async function networkFirstStrategy(request, cacheName) {
  try {
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.log('Network failed, trying cache:', error)
    
    const cache = await caches.open(cacheName)
    const cachedResponse = await cache.match(request)
    
    if (cachedResponse) {
      return cachedResponse
    }
    
    return new Response(JSON.stringify({ 
      error: 'Offline - Data not available',
      offline: true 
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

// Stale While Revalidate Strategy - for pages
async function staleWhileRevalidateStrategy(request, cacheName) {
  const cache = await caches.open(cacheName)
  const cachedResponse = await cache.match(request)
  
  const fetchPromise = fetch(request).then(networkResponse => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  }).catch(() => cachedResponse)
  
  return cachedResponse || fetchPromise
}

// Background Sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag)
  
  if (event.tag === 'product-sync') {
    event.waitUntil(syncProducts())
  } else if (event.tag === 'order-sync') {
    event.waitUntil(syncOrders())
  } else if (event.tag === 'message-sync') {
    event.waitUntil(syncMessages())
  }
})

// Sync functions for offline data
async function syncProducts() {
  try {
    // Get offline products from IndexedDB and sync to server
    console.log('Syncing offline products...')
    // Implementation would go here
  } catch (error) {
    console.error('Product sync failed:', error)
  }
}

async function syncOrders() {
  try {
    // Get offline orders from IndexedDB and sync to server
    console.log('Syncing offline orders...')
    // Implementation would go here
  } catch (error) {
    console.error('Order sync failed:', error)
  }
}

async function syncMessages() {
  try {
    // Get offline messages from IndexedDB and sync to server
    console.log('Syncing offline messages...')
    // Implementation would go here
  } catch (error) {
    console.error('Message sync failed:', error)
  }
}

// Push notifications
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event)
  
  if (!event.data) {
    return
  }
  
  const data = event.data.json()
  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    image: data.image,
    data: data.data,
    actions: data.actions || [
      {
        action: 'view',
        title: 'View',
        icon: '/icons/action-view.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/icons/action-dismiss.png'
      }
    ],
    requireInteraction: data.requireInteraction || false,
    silent: data.silent || false,
    vibrate: data.vibrate || [200, 100, 200],
    tag: data.tag || 'default'
  }
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  )
})

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event)
  
  event.notification.close()
  
  const action = event.action
  const data = event.notification.data
  
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(clientList => {
      // If a window is already open, focus it
      for (const client of clientList) {
        if (client.url.includes(data?.url || '/') && 'focus' in client) {
          return client.focus()
        }
      }
      
      // Otherwise, open a new window
      if (clients.openWindow) {
        let url = '/'
        
        if (action === 'view' && data?.url) {
          url = data.url
        } else if (data?.url) {
          url = data.url
        }
        
        return clients.openWindow(url)
      }
    })
  )
})

// Message handling for communication with main thread
self.addEventListener('message', (event) => {
  console.log('Service Worker received message:', event.data)
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME })
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    const urls = event.data.payload
    event.waitUntil(
      caches.open(DYNAMIC_CACHE_NAME).then(cache => {
        return cache.addAll(urls)
      })
    )
  }
})

// Error handling
self.addEventListener('error', (event) => {
  console.error('Service Worker error:', event.error)
})

self.addEventListener('unhandledrejection', (event) => {
  console.error('Service Worker unhandled rejection:', event.reason)
  event.preventDefault()
})