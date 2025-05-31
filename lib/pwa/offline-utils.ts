// Utility functions for PWA offline functionality

export interface OfflineQueueItem {
  id: string
  type: 'product' | 'order' | 'message' | 'analytics'
  action: 'create' | 'update' | 'delete'
  data: any
  timestamp: number
  retryCount: number
}

class OfflineManager {
  private dbName = 'shopabell-offline'
  private dbVersion = 1
  private db: IDBDatabase | null = null

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Create object stores
        if (!db.objectStoreNames.contains('queue')) {
          const queueStore = db.createObjectStore('queue', { keyPath: 'id' })
          queueStore.createIndex('type', 'type', { unique: false })
          queueStore.createIndex('timestamp', 'timestamp', { unique: false })
        }

        if (!db.objectStoreNames.contains('cache')) {
          const cacheStore = db.createObjectStore('cache', { keyPath: 'key' })
          cacheStore.createIndex('timestamp', 'timestamp', { unique: false })
        }

        if (!db.objectStoreNames.contains('drafts')) {
          const draftsStore = db.createObjectStore('drafts', { keyPath: 'id' })
          draftsStore.createIndex('type', 'type', { unique: false })
          draftsStore.createIndex('lastModified', 'lastModified', { unique: false })
        }
      }
    })
  }

  // Queue management for offline actions
  async addToQueue(item: Omit<OfflineQueueItem, 'id' | 'timestamp' | 'retryCount'>): Promise<string> {
    if (!this.db) await this.init()

    const queueItem: OfflineQueueItem = {
      ...item,
      id: `${item.type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      retryCount: 0
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['queue'], 'readwrite')
      const store = transaction.objectStore('queue')
      const request = store.add(queueItem)

      request.onsuccess = () => resolve(queueItem.id)
      request.onerror = () => reject(request.error)
    })
  }

  async getQueueItems(type?: string): Promise<OfflineQueueItem[]> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['queue'], 'readonly')
      const store = transaction.objectStore('queue')
      
      let request: IDBRequest
      if (type) {
        const index = store.index('type')
        request = index.getAll(type)
      } else {
        request = store.getAll()
      }

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async removeFromQueue(id: string): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['queue'], 'readwrite')
      const store = transaction.objectStore('queue')
      const request = store.delete(id)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async incrementRetryCount(id: string): Promise<void> {
    if (!this.db) await this.init()

    return new Promise(async (resolve, reject) => {
      const transaction = this.db!.transaction(['queue'], 'readwrite')
      const store = transaction.objectStore('queue')
      
      const getRequest = store.get(id)
      getRequest.onsuccess = () => {
        const item = getRequest.result
        if (item) {
          item.retryCount += 1
          const putRequest = store.put(item)
          putRequest.onsuccess = () => resolve()
          putRequest.onerror = () => reject(putRequest.error)
        } else {
          resolve()
        }
      }
      getRequest.onerror = () => reject(getRequest.error)
    })
  }

  // Cache management for offline data
  async setCache(key: string, data: any, ttl?: number): Promise<void> {
    if (!this.db) await this.init()

    const cacheItem = {
      key,
      data,
      timestamp: Date.now(),
      ttl: ttl || (24 * 60 * 60 * 1000) // Default 24 hours
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cache'], 'readwrite')
      const store = transaction.objectStore('cache')
      const request = store.put(cacheItem)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async getCache(key: string): Promise<any> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cache'], 'readonly')
      const store = transaction.objectStore('cache')
      const request = store.get(key)

      request.onsuccess = () => {
        const result = request.result
        if (result) {
          const now = Date.now()
          if (now - result.timestamp < result.ttl) {
            resolve(result.data)
          } else {
            // Cache expired, remove it
            this.clearCache(key)
            resolve(null)
          }
        } else {
          resolve(null)
        }
      }
      request.onerror = () => reject(request.error)
    })
  }

  async clearCache(key?: string): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cache'], 'readwrite')
      const store = transaction.objectStore('cache')
      
      let request: IDBRequest
      if (key) {
        request = store.delete(key)
      } else {
        request = store.clear()
      }

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  // Draft management for offline editing
  async saveDraft(type: string, data: any): Promise<string> {
    if (!this.db) await this.init()

    const draft = {
      id: `draft_${type}_${Date.now()}`,
      type,
      data,
      lastModified: Date.now()
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['drafts'], 'readwrite')
      const store = transaction.objectStore('drafts')
      const request = store.put(draft)

      request.onsuccess = () => resolve(draft.id)
      request.onerror = () => reject(request.error)
    })
  }

  async getDrafts(type?: string): Promise<any[]> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['drafts'], 'readonly')
      const store = transaction.objectStore('drafts')
      
      let request: IDBRequest
      if (type) {
        const index = store.index('type')
        request = index.getAll(type)
      } else {
        request = store.getAll()
      }

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async deleteDraft(id: string): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['drafts'], 'readwrite')
      const store = transaction.objectStore('drafts')
      const request = store.delete(id)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  // Cleanup old entries
  async cleanup(): Promise<void> {
    if (!this.db) await this.init()

    const now = Date.now()
    const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000)

    // Clean old queue items
    const queueItems = await this.getQueueItems()
    for (const item of queueItems) {
      if (item.timestamp < oneWeekAgo || item.retryCount > 5) {
        await this.removeFromQueue(item.id)
      }
    }

    // Clean expired cache
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cache'], 'readwrite')
      const store = transaction.objectStore('cache')
      const request = store.getAll()

      request.onsuccess = () => {
        const items = request.result
        const deletePromises = items.map(item => {
          if (now - item.timestamp >= item.ttl) {
            return new Promise<void>((resolve, reject) => {
              const deleteReq = store.delete(item.key)
              deleteReq.onsuccess = () => resolve()
              deleteReq.onerror = () => reject(deleteReq.error)
            })
          }
          return Promise.resolve()
        })

        Promise.all(deletePromises)
          .then(() => resolve())
          .catch(reject)
      }
      request.onerror = () => reject(request.error)
    })
  }
}

export const offlineManager = new OfflineManager()

// Online/Offline status management
export class ConnectionManager {
  private callbacks: Array<(online: boolean) => void> = []

  constructor() {
    window.addEventListener('online', () => this.notifyStatusChange(true))
    window.addEventListener('offline', () => this.notifyStatusChange(false))
  }

  isOnline(): boolean {
    return navigator.onLine
  }

  onStatusChange(callback: (online: boolean) => void): () => void {
    this.callbacks.push(callback)
    
    // Return unsubscribe function
    return () => {
      const index = this.callbacks.indexOf(callback)
      if (index > -1) {
        this.callbacks.splice(index, 1)
      }
    }
  }

  private notifyStatusChange(online: boolean): void {
    this.callbacks.forEach(callback => callback(online))
  }

  // Check network quality
  async checkNetworkQuality(): Promise<'fast' | 'slow' | 'offline'> {
    if (!this.isOnline()) {
      return 'offline'
    }

    try {
      const start = Date.now()
      await fetch('/api/ping', { 
        method: 'HEAD',
        cache: 'no-cache'
      })
      const duration = Date.now() - start

      return duration < 1000 ? 'fast' : 'slow'
    } catch {
      return 'offline'
    }
  }
}

export const connectionManager = new ConnectionManager()

// Background sync utilities
export async function registerBackgroundSync(tag: string): Promise<void> {
  if ('serviceWorker' in navigator && 'sync' in (window as any).ServiceWorkerRegistration.prototype) {
    const registration = await navigator.serviceWorker.ready
    await (registration as any).sync.register(tag)
  }
}

// Push notification utilities
export async function subscribeToPush(): Promise<PushSubscription | null> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return null
  }

  try {
    const registration = await navigator.serviceWorker.ready
    const existingSubscription = await registration.pushManager.getSubscription()
    
    if (existingSubscription) {
      return existingSubscription
    }

    // Public VAPID key - in production, this should come from environment
    const vapidPublicKey = 'YOUR_VAPID_PUBLIC_KEY_HERE'
    
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: vapidPublicKey
    })

    return subscription
  } catch (error) {
    console.error('Failed to subscribe to push notifications:', error)
    return null
  }
}

// Service worker registration and updates
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) {
    return null
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js')
    
    // Handle service worker updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New version available
            showUpdateAvailable(registration)
          }
        })
      }
    })

    return registration
  } catch (error) {
    console.error('Service worker registration failed:', error)
    return null
  }
}

function showUpdateAvailable(registration: ServiceWorkerRegistration): void {
  // Show update notification to user
  const shouldUpdate = confirm('A new version of the app is available. Update now?')
  
  if (shouldUpdate && registration.waiting) {
    registration.waiting.postMessage({ type: 'SKIP_WAITING' })
    window.location.reload()
  }
}