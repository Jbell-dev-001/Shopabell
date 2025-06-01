'use client'

import { useState, useRef } from 'react'
import { Upload, Film, X, Play, Pause, Camera } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { processVideoFrames } from '@/lib/livestream/video-processor'
import { CapturedImage } from '@/lib/livestream/capture-utils'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/lib/stores/auth-store'

interface VideoUploadWidgetProps {
  onFramesCaptured?: (frames: CapturedImage[]) => void
}

export function VideoUploadWidget({ onFramesCaptured }: VideoUploadWidgetProps) {
  const { user } = useAuthStore()
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [capturedFrames, setCapturedFrames] = useState<CapturedImage[]>([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [sessionName, setSessionName] = useState('')
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime']
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a valid video file (MP4, WebM, OGG, or MOV)')
      return
    }

    // Validate file size (max 200MB)
    const maxSize = 200 * 1024 * 1024 // 200MB
    if (file.size > maxSize) {
      toast.error('Video file too large. Maximum size is 200MB')
      return
    }

    setVideoFile(file)
    const url = URL.createObjectURL(file)
    setVideoUrl(url)
    setCapturedFrames([])
    toast.success('Video loaded successfully')
  }

  const handleVideoLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration)
    }
  }

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime)
    }
  }

  const togglePlayPause = () => {
    if (!videoRef.current) return

    if (isPlaying) {
      videoRef.current.pause()
    } else {
      videoRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  const captureCurrentFrame = () => {
    if (!videoRef.current) return

    const canvas = document.createElement('canvas')
    canvas.width = 400
    canvas.height = 400
    const ctx = canvas.getContext('2d')
    
    if (!ctx) return

    // Calculate crop dimensions for square aspect ratio
    const videoWidth = videoRef.current.videoWidth
    const videoHeight = videoRef.current.videoHeight
    const size = Math.min(videoWidth, videoHeight)
    const startX = (videoWidth - size) / 2
    const startY = (videoHeight - size) / 2

    ctx.drawImage(
      videoRef.current,
      startX, startY, size, size,
      0, 0, 400, 400
    )

    const dataUrl = canvas.toDataURL('image/jpeg', 0.8)
    const frame: CapturedImage = {
      id: `frame_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      dataUrl,
      timestamp: currentTime * 1000, // Convert to milliseconds
      processed: false
    }

    setCapturedFrames(prev => [...prev, frame])
    toast.success('Frame captured!')
  }

  const processVideo = async () => {
    if (!videoFile || !videoRef.current) {
      toast.error('Please upload a video first')
      return
    }

    setIsProcessing(true)
    toast.info('Processing video... This may take a few moments')

    try {
      const frames = await processVideoFrames(videoFile, {
        maxFrames: 20,
        intervalSeconds: 5,
        outputSize: 400
      })

      setCapturedFrames(frames)
      if (onFramesCaptured) {
        onFramesCaptured(frames)
      }
      
      toast.success(`Extracted ${frames.length} frames from video`)
    } catch (error) {
      console.error('Error processing video:', error)
      toast.error('Failed to process video')
    } finally {
      setIsProcessing(false)
    }
  }

  const saveFramesAsProducts = async () => {
    if (!user?.id || capturedFrames.length === 0) {
      toast.error('No frames to save')
      return
    }

    setIsProcessing(true)

    try {
      // Create livestream session
      const { data: session, error: sessionError } = await supabase
        .from('livestream_sessions')
        .insert({
          seller_id: user.id,
          session_name: sessionName || `Video Upload - ${new Date().toLocaleDateString()}`,
          status: 'processing',
          platform: 'facebook', // Default platform
          total_products_captured: capturedFrames.length,
          start_time: new Date().toISOString(),
          end_time: new Date().toISOString()
        })
        .select()
        .single()

      if (sessionError) throw sessionError

      // Create products from frames
      const products = await Promise.all(
        capturedFrames.map(async (frame, index) => {
          // Convert data URL to blob
          const response = await fetch(frame.dataUrl)
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
            name: `Product ${index + 1} - ${sessionName || 'Video Upload'}`,
            description: `Product from video at ${Math.round(frame.timestamp / 1000)}s`,
            price: 0, // Seller needs to set price
            images: [urlData.publicUrl],
            stock_quantity: 1,
            is_active: false, // Inactive until seller reviews
            created_from: 'livestream',
            livestream_session_id: session.id,
            source_timestamp: frame.timestamp
          }
          
          const { data: product, error: productError } = await supabase
            .from('products')
            .insert(productData)
            .select()
            .single()
          
          if (productError) throw productError
          
          // Create livestream_product record
          await supabase
            .from('livestream_products')
            .insert({
              session_id: session.id,
              product_id: product.id,
              timestamp: Math.round(frame.timestamp / 1000),
              screenshot_url: urlData.publicUrl,
              ai_confidence_score: 0.95 // Simulated confidence
            })
          
          return product
        })
      )

      // Update session status
      await supabase
        .from('livestream_sessions')
        .update({ status: 'completed' })
        .eq('id', session.id)
      
      toast.success(`Created ${products.length} products from video!`)
      
      // Reset state
      setCapturedFrames([])
      setVideoFile(null)
      setVideoUrl(null)
      setSessionName('')
      
    } catch (error) {
      console.error('Error saving products:', error)
      toast.error('Failed to save products')
    } finally {
      setIsProcessing(false)
    }
  }

  const removeFrame = (frameId: string) => {
    setCapturedFrames(prev => prev.filter(frame => frame.id !== frameId))
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Film className="w-5 h-5" />
            Upload Recorded Livestream
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
              placeholder="Enter session name"
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          {/* File Upload */}
          {!videoUrl && (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 mb-4">
                Upload your recorded livestream video
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 mx-auto"
              >
                <Upload className="w-4 h-4" />
                Choose Video File
              </Button>
              <p className="text-xs text-gray-500 mt-2">
                Supported formats: MP4, WebM, OGG, MOV (Max 200MB)
              </p>
            </div>
          )}

          {/* Video Player */}
          {videoUrl && (
            <>
              <div className="relative bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  src={videoUrl}
                  className="w-full aspect-video object-contain"
                  onLoadedMetadata={handleVideoLoadedMetadata}
                  onTimeUpdate={handleTimeUpdate}
                />
                
                {/* Video Controls */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  <div className="flex items-center gap-4">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={togglePlayPause}
                      className="text-white hover:text-white"
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>
                    
                    <div className="flex-1">
                      <input
                        type="range"
                        min="0"
                        max={duration}
                        value={currentTime}
                        onChange={(e) => {
                          const time = parseFloat(e.target.value)
                          if (videoRef.current) {
                            videoRef.current.currentTime = time
                          }
                        }}
                        className="w-full"
                      />
                    </div>
                    
                    <span className="text-white text-sm">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <Button
                  onClick={captureCurrentFrame}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Camera className="w-4 h-4" />
                  Capture Current Frame
                </Button>
                
                <Button
                  onClick={processVideo}
                  disabled={isProcessing}
                  className="flex items-center gap-2"
                >
                  <Film className="w-4 h-4" />
                  {isProcessing ? 'Processing...' : 'Auto-Extract Frames'}
                </Button>
                
                <Button
                  variant="ghost"
                  onClick={() => {
                    setVideoFile(null)
                    setVideoUrl(null)
                    setCapturedFrames([])
                  }}
                  className="ml-auto"
                >
                  <X className="w-4 h-4" />
                  Remove Video
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Captured Frames */}
      {capturedFrames.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Extracted Frames ({capturedFrames.length})</CardTitle>
              <Button
                onClick={saveFramesAsProducts}
                disabled={isProcessing}
                className="flex items-center gap-2"
              >
                {isProcessing ? 'Saving...' : 'Create Products'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {capturedFrames.map((frame, index) => (
                <div key={frame.id} className="relative group">
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={frame.dataUrl}
                      alt={`Frame ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    onClick={() => removeFrame(frame.id)}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  <div className="mt-2">
                    <p className="text-xs text-gray-600">
                      {formatTime(frame.timestamp / 1000)}
                    </p>
                    <p className="text-xs font-medium">Frame {index + 1}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}