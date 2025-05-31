export interface CapturedImage {
  id: string
  dataUrl: string
  timestamp: number
  processed: boolean
}

export interface LivestreamSession {
  id: string
  name: string
  startTime: Date
  endTime?: Date
  capturedImages: CapturedImage[]
  status: 'recording' | 'processing' | 'completed'
}

export class LivestreamCapture {
  private mediaStream: MediaStream | null = null
  private video: HTMLVideoElement | null = null
  private canvas: HTMLCanvasElement | null = null
  private captureInterval: NodeJS.Timeout | null = null
  private onImageCaptured?: (image: CapturedImage) => void
  
  constructor(onImageCaptured?: (image: CapturedImage) => void) {
    this.onImageCaptured = onImageCaptured
  }
  
  async startCapture(videoElement: HTMLVideoElement): Promise<void> {
    try {
      // Request screen share or camera access
      this.mediaStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false
      })
      
      this.video = videoElement
      this.video.srcObject = this.mediaStream
      await this.video.play()
      
      // Create canvas for capturing frames
      this.canvas = document.createElement('canvas')
      this.canvas.width = 500
      this.canvas.height = 500
      
      // Start capturing frames every 5 seconds
      this.startAutoCapture()
      
    } catch (error) {
      console.error('Error starting capture:', error)
      throw error
    }
  }
  
  private startAutoCapture(): void {
    this.captureInterval = setInterval(() => {
      this.captureFrame()
    }, 5000) // Capture every 5 seconds
  }
  
  captureFrame(): CapturedImage | null {
    if (!this.video || !this.canvas) return null
    
    const ctx = this.canvas.getContext('2d')
    if (!ctx) return null
    
    // Draw video frame to canvas
    ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height)
    
    // Convert to data URL
    const dataUrl = this.canvas.toDataURL('image/jpeg', 0.8)
    
    const capturedImage: CapturedImage = {
      id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      dataUrl,
      timestamp: Date.now(),
      processed: false
    }
    
    // Call callback if provided
    if (this.onImageCaptured) {
      this.onImageCaptured(capturedImage)
    }
    
    return capturedImage
  }
  
  stopCapture(): void {
    if (this.captureInterval) {
      clearInterval(this.captureInterval)
      this.captureInterval = null
    }
    
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop())
      this.mediaStream = null
    }
    
    if (this.video) {
      this.video.srcObject = null
    }
  }
  
  async processImages(images: CapturedImage[]): Promise<CapturedImage[]> {
    return images.map(image => {
      // Simple processing: just crop center portion
      const processedImage = this.cropCenter(image.dataUrl)
      return {
        ...image,
        dataUrl: processedImage,
        processed: true
      }
    })
  }
  
  private cropCenter(dataUrl: string): string {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    img.onload = () => {
      const size = Math.min(img.width, img.height)
      const startX = (img.width - size) / 2
      const startY = (img.height - size) / 2
      
      canvas.width = 400
      canvas.height = 400
      
      ctx?.drawImage(
        img,
        startX, startY, size, size,
        0, 0, 400, 400
      )
    }
    
    img.src = dataUrl
    return canvas.toDataURL('image/jpeg', 0.8)
  }
}

export function generateProductName(index: number): string {
  return `Product ${index}`
}

export function detectDuplicates(images: CapturedImage[]): CapturedImage[] {
  // Simple duplicate detection based on timestamp proximity
  const uniqueImages: CapturedImage[] = []
  
  images.forEach(image => {
    const isDuplicate = uniqueImages.some(unique => 
      Math.abs(image.timestamp - unique.timestamp) < 3000 // Within 3 seconds
    )
    
    if (!isDuplicate) {
      uniqueImages.push(image)
    }
  })
  
  return uniqueImages
}