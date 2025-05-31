'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { registerServiceWorker, connectionManager, offlineManager } from '@/lib/pwa/offline-utils'

export function PWALifecycle() {
  const [isOnline, setIsOnline] = useState(true)
  const [networkQuality, setNetworkQuality] = useState<'fast' | 'slow' | 'offline'>('fast')

  useEffect(() => {
    // Initialize PWA features
    initializePWA()

    // Set up connection monitoring
    const unsubscribe = connectionManager.onStatusChange(handleConnectionChange)
    
    // Check initial connection status
    setIsOnline(connectionManager.isOnline())
    checkNetworkQuality()

    // Set up periodic network quality checks
    const qualityInterval = setInterval(checkNetworkQuality, 30000) // Check every 30 seconds

    // Initialize offline manager
    offlineManager.init().catch(console.error)

    // Cleanup old offline data periodically
    const cleanupInterval = setInterval(() => {
      offlineManager.cleanup().catch(console.error)
    }, 60000 * 60) // Cleanup every hour

    return () => {
      unsubscribe()
      clearInterval(qualityInterval)
      clearInterval(cleanupInterval)
    }
  }, [])

  const initializePWA = async () => {
    try {
      // Register service worker
      const registration = await registerServiceWorker()
      
      if (registration) {
        console.log('Service Worker registered successfully')
        
        // Handle service worker updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                toast('App Update Available', {
                  description: 'A new version is available. Refresh to update.',
                  action: {
                    label: 'Refresh',
                    onClick: () => window.location.reload()
                  },
                  duration: 10000
                })
              }
            })
          }
        })
      }
    } catch (error) {
      console.error('Failed to initialize PWA:', error)
    }
  }

  const handleConnectionChange = (online: boolean) => {
    setIsOnline(online)
    
    if (online) {
      toast.success('Back Online', {
        description: 'Your connection has been restored. Syncing data...'
      })
      syncOfflineData()
    } else {
      toast.error('You\'re Offline', {
        description: 'Some features may be limited. Changes will sync when you\'re back online.'
      })
    }
  }

  const checkNetworkQuality = async () => {
    const quality = await connectionManager.checkNetworkQuality()
    setNetworkQuality(quality)
    
    if (quality === 'slow' && isOnline) {
      toast.warning('Slow Connection', {
        description: 'Your connection is slow. Some features may load slowly.'
      })
    }
  }

  const syncOfflineData = async () => {
    try {
      // Get all pending offline actions
      const queueItems = await offlineManager.getQueueItems()
      
      if (queueItems.length > 0) {
        toast.loading(`Syncing ${queueItems.length} offline changes...`, {
          id: 'sync-progress'
        })

        let successCount = 0
        let errorCount = 0

        for (const item of queueItems) {
          try {
            // Attempt to sync the item
            await syncQueueItem(item)
            await offlineManager.removeFromQueue(item.id)
            successCount++
          } catch (error) {
            console.error('Failed to sync item:', item, error)
            await offlineManager.incrementRetryCount(item.id)
            errorCount++
          }
        }

        toast.dismiss('sync-progress')
        
        if (successCount > 0) {
          toast.success(`Synced ${successCount} changes successfully`)
        }
        
        if (errorCount > 0) {
          toast.error(`Failed to sync ${errorCount} changes. Will retry later.`)
        }
      }
    } catch (error) {
      console.error('Failed to sync offline data:', error)
      toast.error('Failed to sync offline changes')
    }
  }

  const syncQueueItem = async (item: any) => {
    const { type, action, data } = item

    // Simulate API calls for different types
    const baseUrl = '/api'
    let url = ''
    let method = 'POST'

    switch (type) {
      case 'product':
        url = `${baseUrl}/products`
        if (action === 'update') {
          url += `/${data.id}`
          method = 'PUT'
        } else if (action === 'delete') {
          url += `/${data.id}`
          method = 'DELETE'
        }
        break
      
      case 'order':
        url = `${baseUrl}/orders`
        if (action === 'update') {
          url += `/${data.id}`
          method = 'PUT'
        }
        break
      
      case 'message':
        url = `${baseUrl}/chat/messages`
        break
      
      case 'analytics':
        url = `${baseUrl}/analytics/events`
        break
      
      default:
        throw new Error(`Unknown sync type: ${type}`)
    }

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: action !== 'delete' ? JSON.stringify(data) : undefined
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    return response.json()
  }

  // This component doesn't render anything visible
  // It just handles PWA lifecycle events in the background
  return (
    <>
      {/* Connection Status Indicator */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 bg-red-500 text-white text-center py-2 text-sm z-50">
          You're offline. Some features may be limited.
        </div>
      )}
      
      {networkQuality === 'slow' && isOnline && (
        <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-white text-center py-2 text-sm z-50">
          Slow connection detected. Content may load slowly.
        </div>
      )}
    </>
  )
}