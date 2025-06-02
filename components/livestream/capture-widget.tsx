'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Product } from '@/types/supabase'
import { productService } from '@/lib/products/product-service'
import { authService } from '@/lib/auth/auth-service'

interface CapturedFrame {
  id: string
  image: string
  timestamp: Date
  aiData?: {
    name: string
    category: string
    suggestedPrice: number
    description: string
    confidence: number
  }
}

interface LivestreamCaptureProps {
  onProductsCreated: (products: Product[]) => void
  onCancel: () => void
}

export function LivestreamCapture({ onProductsCreated, onCancel }: LivestreamCaptureProps) {
  const [isCapturing, setIsCapturing] = useState(false)
  const [capturedFrames, setCapturedFrames] = useState<CapturedFrame[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Cleanup function
  const cleanup = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
  }, [stream])

  useEffect(() => {
    return cleanup
  }, [cleanup])

  const startCapture = async () => {
    setError(null)
    
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        setStream(mediaStream)
        setIsCapturing(true)
        
        // Auto-capture every 3 seconds
        intervalRef.current = setInterval(() => {
          captureFrame()
        }, 3000)
      }
    } catch (err) {
      setError('Unable to access camera. Please ensure you have granted camera permissions.')
      console.error('Camera access error:', err)
    }
  }

  const stopCapture = () => {
    cleanup()
    setIsCapturing(false)
  }

  const captureFrame = async () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    
    if (!ctx) return

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    
    // Draw current video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    
    // Get image data
    const imageData = canvas.toDataURL('image/jpeg', 0.8)
    
    // Simulate AI processing (in production, this would call actual AI service)
    const aiData = await simulateAIProcessing(imageData)
    
    if (aiData && aiData.confidence > 0.7) { // Only capture if confidence is high
      const frame: CapturedFrame = {
        id: Date.now().toString(),
        image: imageData,
        timestamp: new Date(),
        aiData
      }
      
      setCapturedFrames(prev => [...prev, frame])
    }
  }

  // Simulate AI processing (replace with actual AI service)
  const simulateAIProcessing = async (imageData: string): Promise<CapturedFrame['aiData'] | null> => {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Simulate random product detection
    const products = [
      { name: 'Cotton T-Shirt', category: 'Fashion', price: 599 },
      { name: 'Denim Jeans', category: 'Fashion', price: 1299 },
      { name: 'Gold Necklace', category: 'Jewelry', price: 15000 },
      { name: 'Silver Earrings', category: 'Jewelry', price: 2500 },
      { name: 'Smartphone', category: 'Electronics', price: 25999 },
      { name: 'Wireless Earbuds', category: 'Electronics', price: 3999 },
    ]
    
    // Random detection (30% chance of detecting something)
    if (Math.random() > 0.7) {
      const product = products[Math.floor(Math.random() * products.length)]
      return {
        name: product.name,
        category: product.category,
        suggestedPrice: product.price,
        description: `High-quality ${product.name.toLowerCase()} with premium features`,
        confidence: 0.75 + Math.random() * 0.2 // 75-95% confidence
      }
    }
    
    return null
  }

  const createProductsFromFrames = async () => {
    setIsProcessing(true)
    
    try {
      // Get current user
      const user = await authService.getCurrentUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      // Convert captured frames to product data
      const productData = capturedFrames
        .filter(frame => frame.aiData)
        .map(frame => ({
          name: frame.aiData!.name,
          description: frame.aiData!.description,
          price: frame.aiData!.suggestedPrice,
          image_url: frame.image,
          category: frame.aiData!.category,
          stock_quantity: 1,
          source: 'livestream' as const,
          ai_extracted_data: frame.aiData
        }))
      
      // Create products using the service
      const result = await productService.createProducts(user.id, productData)
      
      if (result.success) {
        onProductsCreated(result.products)
      } else {
        throw new Error(result.error || 'Failed to create products')
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create products. Please try again.'
      setError(message)
    } finally {
      setIsProcessing(false)
    }
  }

  const removeFrame = (frameId: string) => {
    setCapturedFrames(prev => prev.filter(frame => frame.id !== frameId))
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          AI Livestream Capture
        </h2>
        <p className="text-gray-600">
          Point your camera at products and let AI detect them automatically
        </p>
      </div>

      {/* Camera Feed */}
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${isCapturing ? 'bg-red-500 animate-pulse' : 'bg-gray-300'}`}></span>
            Camera Feed
          </CardTitle>
          <CardDescription>
            {isCapturing 
              ? 'AI is actively scanning for products...' 
              : 'Click "Start Capture" to begin scanning for products'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-64 md:h-96 object-cover"
            />
            <canvas ref={canvasRef} className="hidden" />
            
            {/* Overlay UI */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Scanning Grid */}
              {isCapturing && (
                <div className="absolute inset-4 border-2 border-whatsapp rounded-lg">
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-whatsapp"></div>
                  <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-whatsapp"></div>
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-whatsapp"></div>
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-whatsapp"></div>
                </div>
              )}
              
              {/* Status Text */}
              <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                {isCapturing ? '🔍 Scanning...' : '📷 Ready to scan'}
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <div className="flex gap-4 mt-4">
            {!isCapturing ? (
              <Button
                onClick={startCapture}
                className="flex-1 bg-whatsapp hover:bg-whatsapp-dark"
              >
                Start Capture
              </Button>
            ) : (
              <Button
                onClick={stopCapture}
                variant="outline"
                className="flex-1"
              >
                Stop Capture
              </Button>
            )}
            <Button
              variant="outline"
              onClick={onCancel}
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Captured Products */}
      {capturedFrames.length > 0 && (
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>
              Detected Products ({capturedFrames.length})
            </CardTitle>
            <CardDescription>
              Review and edit the products detected by AI
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {capturedFrames.map((frame) => (
                <div key={frame.id} className="border rounded-lg overflow-hidden">
                  <div className="aspect-video relative">
                    <img 
                      src={frame.image} 
                      alt="Captured product"
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => removeFrame(frame.id)}
                      className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                  {frame.aiData && (
                    <div className="p-3 space-y-2">
                      <h4 className="font-medium">{frame.aiData.name}</h4>
                      <p className="text-sm text-gray-600">{frame.aiData.category}</p>
                      <p className="text-lg font-bold text-whatsapp">
                        ₹{frame.aiData.suggestedPrice.toLocaleString()}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Confidence:</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-whatsapp h-2 rounded-full"
                            style={{ width: `${frame.aiData.confidence * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500">
                          {Math.round(frame.aiData.confidence * 100)}%
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {capturedFrames.length > 0 && (
              <div className="flex gap-4 mt-6">
                <Button
                  onClick={createProductsFromFrames}
                  disabled={isProcessing}
                  className="flex-1 bg-whatsapp hover:bg-whatsapp-dark"
                >
                  {isProcessing ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Creating Products...
                    </div>
                  ) : (
                    `Create ${capturedFrames.length} Product${capturedFrames.length > 1 ? 's' : ''}`
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setCapturedFrames([])}
                  disabled={isProcessing}
                >
                  Clear All
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tips */}
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-lg">🎯 Tips for Better Detection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <span className="text-whatsapp font-bold">💡</span>
            <div>
              <p className="font-medium">Good Lighting</p>
              <p className="text-sm text-gray-600">Ensure your products are well-lit and clearly visible</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-whatsapp font-bold">📏</span>
            <div>
              <p className="font-medium">Proper Distance</p>
              <p className="text-sm text-gray-600">Hold your device 1-2 feet away from the product</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-whatsapp font-bold">🎯</span>
            <div>
              <p className="font-medium">Clear Background</p>
              <p className="text-sm text-gray-600">Use a clean, uncluttered background for better detection</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}