'use client'

import { useState, useRef, useEffect } from 'react'
import { Play, Square, Camera, Settings, Download, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { LivestreamCapture, CapturedImage, detectDuplicates } from '@/lib/livestream/capture-utils'
import { toast } from 'sonner'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/lib/stores/auth-store'

export function CaptureWidget() {
  const { user } = useAuthStore()
  const [isRecording, setIsRecording] = useState(false)
  const [capturedImages, setCapturedImages] = useState<CapturedImage[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [sessionName, setSessionName] = useState('')
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const captureRef = useRef<LivestreamCapture | null>(null)
  const supabase = createClient()
  
  useEffect(() => {
    // Initialize capture instance
    captureRef.current = new LivestreamCapture((image) => {
      setCapturedImages(prev => [...prev, image])
      toast.success('Frame captured!')
    })
    
    return () => {
      if (captureRef.current) {
        captureRef.current.stopCapture()
      }
    }
  }, [])
  
  const startRecording = async () => {
    if (!captureRef.current || !videoRef.current) return
    
    try {
      await captureRef.current.startCapture(videoRef.current)
      setIsRecording(true)
      toast.success('Recording started! Frames will be captured every 5 seconds')
    } catch (error) {
      console.error('Failed to start recording:', error)
      toast.error('Failed to start recording. Please allow screen sharing.')
    }
  }
  
  const stopRecording = () => {
    if (captureRef.current) {
      captureRef.current.stopCapture()
    }
    setIsRecording(false)
    toast.success('Recording stopped')
  }
  
  const manualCapture = () => {
    if (captureRef.current && isRecording) {
      const image = captureRef.current.captureFrame()
      if (image) {
        setCapturedImages(prev => [...prev, image])
        toast.success('Manual capture successful!')
      }
    }
  }
  
  const processAndSave = async () => {
    if (!user?.id || capturedImages.length === 0) {
      toast.error('No images to process')
      return
    }
    
    setIsProcessing(true)
    
    try {
      // Remove duplicates
      const uniqueImages = detectDuplicates(capturedImages)
      
      // Create products from captured images
      const products = await Promise.all(
        uniqueImages.map(async (image, index) => {
          // Convert data URL to blob
          const response = await fetch(image.dataUrl)
          const blob = await response.blob()
          
          // Upload to Supabase Storage
          const fileName = `livestream/${Date.now()}-${index}.jpg`
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('product-images')
            .upload(fileName, blob)
          
          if (uploadError) throw uploadError
          
          // Get public URL
          const { data: urlData } = supabase.storage
            .from('product-images')
            .getPublicUrl(uploadData.path)
          
          // Create product
          const productData = {
            seller_id: user.id,
            name: `Live Product ${index + 1}`,
            description: `Product captured from livestream on ${new Date(image.timestamp).toLocaleString()}`,
            price: 0, // Seller needs to set price
            images: [urlData.publicUrl],
            stock_quantity: 1,
            is_active: false, // Inactive until seller reviews
            created_from: 'livestream',
            source_timestamp: image.timestamp
          }
          
          const { data: product, error: productError } = await supabase
            .from('products')
            .insert(productData)
            .select()
            .single()
          
          if (productError) throw productError
          return product
        })
      )
      
      toast.success(`${products.length} products created from livestream!`)
      setCapturedImages([])
      setSessionName('')
      
    } catch (error) {
      console.error('Error processing images:', error)
      toast.error('Failed to process images')
    } finally {
      setIsProcessing(false)
    }
  }
  
  const clearCaptures = () => {
    setCapturedImages([])
    toast.success('Captures cleared')
  }
  
  const removeImage = (imageId: string) => {
    setCapturedImages(prev => prev.filter(img => img.id !== imageId))
  }
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Livestream Capture
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Session Name */}
          <div>
            <label className="block text-sm font-medium mb-2">Session Name</label>
            <input
              type="text"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              placeholder="Enter session name (optional)"
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          
          {/* Video Preview */}
          <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
            <video
              ref={videoRef}
              className="w-full h-full object-contain"
              muted
              playsInline
            />
            {!isRecording && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
                <p className="text-white">Click "Start Recording" to begin</p>
              </div>
            )}
          </div>
          
          {/* Controls */}
          <div className="flex items-center gap-3">
            {!isRecording ? (
              <Button onClick={startRecording} className="flex items-center gap-2">
                <Play className="w-4 h-4" />
                Start Recording
              </Button>
            ) : (
              <>
                <Button 
                  onClick={stopRecording} 
                  variant="destructive"
                  className="flex items-center gap-2"
                >
                  <Square className="w-4 h-4" />
                  Stop Recording
                </Button>
                <Button 
                  onClick={manualCapture}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Camera className="w-4 h-4" />
                  Manual Capture
                </Button>
              </>
            )}
            
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-sm text-gray-600">
                Captured: {capturedImages.length}
              </span>
              {isRecording && (
                <span className="inline-flex items-center px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-1 animate-pulse"></span>
                  Recording
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Captured Images */}
      {capturedImages.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Captured Frames ({capturedImages.length})</CardTitle>
              <div className="flex gap-2">
                <Button
                  onClick={processAndSave}
                  disabled={isProcessing}
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  {isProcessing ? 'Processing...' : 'Create Products'}
                </Button>
                <Button
                  onClick={clearCaptures}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear All
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {capturedImages.map((image, index) => (
                <div key={image.id} className="relative group">
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={image.dataUrl}
                      alt={`Capture ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    onClick={() => removeImage(image.id)}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                  <div className="mt-2">
                    <p className="text-xs text-gray-600">
                      {new Date(image.timestamp).toLocaleTimeString()}
                    </p>
                    <p className="text-xs font-medium">Product {index + 1}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            How to Use
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-600">
          <p>1. Click "Start Recording" and share your screen or camera</p>
          <p>2. Frames will be automatically captured every 5 seconds</p>
          <p>3. Use "Manual Capture" for immediate screenshots</p>
          <p>4. Click "Create Products" to add captured items to your catalog</p>
          <p>5. Review and update product details in your Products dashboard</p>
        </CardContent>
      </Card>
    </div>
  )
}