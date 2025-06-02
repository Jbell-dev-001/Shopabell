'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Product } from '@/types/supabase'

interface ExtractedProduct {
  id: string
  name: string
  category: string
  suggestedPrice: number
  description: string
  confidence: number
  timestamp: number
  imageData: string
}

interface VideoUploadWidgetProps {
  onProductsCreated: (products: Product[]) => void
  onCancel: () => void
}

export function VideoUploadWidget({ onProductsCreated, onCancel }: VideoUploadWidgetProps) {
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [extractedProducts, setExtractedProducts] = useState<ExtractedProduct[]>([])
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith('video/')) {
      setVideoFile(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
      setExtractedProducts([])
    }
  }

  const processVideo = async () => {
    if (!videoFile || !videoRef.current || !canvasRef.current) return

    setIsProcessing(true)
    setProgress(0)
    setExtractedProducts([])

    try {
      const video = videoRef.current
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      
      if (!ctx) throw new Error('Unable to get canvas context')

      // Wait for video metadata to load
      await new Promise((resolve) => {
        video.onloadedmetadata = resolve
      })

      const duration = video.duration
      const frameInterval = 2 // Extract frame every 2 seconds
      const totalFrames = Math.floor(duration / frameInterval)
      
      const products = new Map<string, ExtractedProduct>()

      for (let i = 0; i < totalFrames; i++) {
        const time = i * frameInterval
        
        // Seek to specific time
        video.currentTime = time
        await new Promise(resolve => video.onseeked = resolve)

        // Set canvas size to match video
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight

        // Draw frame to canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        
        // Get image data
        const imageData = canvas.toDataURL('image/jpeg', 0.8)
        
        // Process with AI (simulated)
        const extracted = await simulateAIExtraction(imageData, time)
        
        if (extracted && extracted.confidence > 0.7) {
          // Deduplicate similar products
          const key = `${extracted.category}_${extracted.name}`
          if (!products.has(key) || extracted.confidence > products.get(key)!.confidence) {
            products.set(key, extracted)
          }
        }

        // Update progress
        setProgress(((i + 1) / totalFrames) * 100)
      }

      setExtractedProducts(Array.from(products.values()))
    } catch (error) {
      console.error('Video processing error:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const simulateAIExtraction = async (imageData: string, timestamp: number): Promise<ExtractedProduct | null> => {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 200))
    
    const products = [
      { name: 'Elegant Dress', category: 'Fashion', price: 1899, desc: 'Beautiful flowing dress perfect for special occasions' },
      { name: 'Casual Sneakers', category: 'Fashion', price: 2499, desc: 'Comfortable everyday sneakers with premium cushioning' },
      { name: 'Diamond Ring', category: 'Jewelry', price: 45000, desc: 'Stunning diamond engagement ring with 18k gold band' },
      { name: 'Pearl Necklace', category: 'Jewelry', price: 8500, desc: 'Classic pearl necklace with sterling silver clasp' },
      { name: 'Gaming Laptop', category: 'Electronics', price: 75999, desc: 'High-performance gaming laptop with RTX graphics' },
      { name: 'Bluetooth Speaker', category: 'Electronics', price: 4999, desc: 'Portable wireless speaker with deep bass' },
      { name: 'Decorative Vase', category: 'Home Decor', price: 1299, desc: 'Handcrafted ceramic vase with artistic design' },
      { name: 'Table Lamp', category: 'Home Decor', price: 2199, desc: 'Modern LED table lamp with adjustable brightness' }
    ]
    
    // Random detection (40% chance)
    if (Math.random() > 0.6) {
      const product = products[Math.floor(Math.random() * products.length)]
      return {
        id: `${timestamp}_${product.name.replace(/\s+/g, '_')}`,
        name: product.name,
        category: product.category,
        suggestedPrice: product.price,
        description: product.desc,
        confidence: 0.7 + Math.random() * 0.25, // 70-95% confidence
        timestamp,
        imageData
      }
    }
    
    return null
  }

  const editProduct = (productId: string, updates: Partial<ExtractedProduct>) => {
    setExtractedProducts(prev => 
      prev.map(product => 
        product.id === productId 
          ? { ...product, ...updates }
          : product
      )
    )
  }

  const removeProduct = (productId: string) => {
    setExtractedProducts(prev => prev.filter(p => p.id !== productId))
  }

  const createProducts = async () => {
    setIsProcessing(true)
    
    try {
      const products: Product[] = extractedProducts.map(product => ({
        id: product.id,
        user_id: '', // Will be set by API
        name: product.name,
        description: product.description,
        price: product.suggestedPrice,
        image_url: product.imageData,
        category: product.category,
        stock_quantity: 1,
        source: 'video' as const,
        is_active: true,
        ai_extracted_data: {
          confidence: product.confidence,
          timestamp: product.timestamp,
          extraction_method: 'video_analysis'
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }))

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      onProductsCreated(products)
    } catch (error) {
      console.error('Error creating products:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Video to Catalog
        </h2>
        <p className="text-gray-600">
          Upload a video and let AI extract products automatically
        </p>
      </div>

      {/* Video Upload */}
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Upload Video</CardTitle>
          <CardDescription>
            Select a video file to analyze for products
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!videoFile ? (
            <div 
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-whatsapp transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🎥</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Choose Video File
              </h3>
              <p className="text-gray-600 mb-4">
                Upload MP4, MOV, or AVI files up to 100MB
              </p>
              <Button className="bg-whatsapp hover:bg-whatsapp-dark">
                Select Video
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Video Preview */}
              <div className="relative bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  src={previewUrl || undefined}
                  controls
                  className="w-full h-64 md:h-96 object-contain"
                  preload="metadata"
                />
                <canvas ref={canvasRef} className="hidden" />
              </div>

              {/* Video Info */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{videoFile.name}</p>
                  <p className="text-sm text-gray-600">
                    {(videoFile.size / (1024 * 1024)).toFixed(1)} MB
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    setVideoFile(null)
                    setPreviewUrl(null)
                    setExtractedProducts([])
                    if (fileInputRef.current) {
                      fileInputRef.current.value = ''
                    }
                  }}
                >
                  Remove
                </Button>
              </div>

              {/* Processing Controls */}
              <div className="flex gap-4">
                <Button
                  onClick={processVideo}
                  disabled={isProcessing}
                  className="flex-1 bg-whatsapp hover:bg-whatsapp-dark"
                >
                  {isProcessing ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing... {Math.round(progress)}%
                    </div>
                  ) : (
                    'Analyze Video'
                  )}
                </Button>
                <Button variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              </div>

              {/* Progress Bar */}
              {isProcessing && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-whatsapp h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Extracted Products */}
      {extractedProducts.length > 0 && (
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>
              Extracted Products ({extractedProducts.length})
            </CardTitle>
            <CardDescription>
              Review and edit the products found in your video
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {extractedProducts.map((product) => (
                <div key={product.id} className="border rounded-lg p-4">
                  <div className="flex gap-4">
                    {/* Product Image */}
                    <div className="w-24 h-24 border rounded-lg overflow-hidden flex-shrink-0">
                      <img 
                        src={product.imageData} 
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Product Name
                          </label>
                          <input
                            type="text"
                            value={product.name}
                            onChange={(e) => editProduct(product.id, { name: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-whatsapp"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Price (₹)
                          </label>
                          <input
                            type="number"
                            value={product.suggestedPrice}
                            onChange={(e) => editProduct(product.id, { suggestedPrice: Number(e.target.value) })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-whatsapp"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <textarea
                          value={product.description}
                          onChange={(e) => editProduct(product.id, { description: e.target.value })}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-whatsapp"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-gray-600">
                            Category: <span className="font-medium">{product.category}</span>
                          </span>
                          <span className="text-sm text-gray-600">
                            Confidence: <span className="font-medium">{Math.round(product.confidence * 100)}%</span>
                          </span>
                          <span className="text-sm text-gray-600">
                            Time: {Math.round(product.timestamp)}s
                          </span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeProduct(product.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-4 mt-6">
              <Button
                onClick={createProducts}
                disabled={isProcessing}
                className="flex-1 bg-whatsapp hover:bg-whatsapp-dark"
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating Products...
                  </div>
                ) : (
                  `Create ${extractedProducts.length} Product${extractedProducts.length > 1 ? 's' : ''}`
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setExtractedProducts([])}
                disabled={isProcessing}
              >
                Clear All
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tips */}
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-lg">📹 Video Tips</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <span className="text-whatsapp font-bold">🎬</span>
            <div>
              <p className="font-medium">Clear Footage</p>
              <p className="text-sm text-gray-600">Record in good lighting with steady movements</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-whatsapp font-bold">⏱️</span>
            <div>
              <p className="font-medium">Optimal Length</p>
              <p className="text-sm text-gray-600">2-5 minute videos work best for product extraction</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-whatsapp font-bold">📱</span>
            <div>
              <p className="font-medium">Format Support</p>
              <p className="text-sm text-gray-600">MP4, MOV, and AVI formats up to 100MB</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}