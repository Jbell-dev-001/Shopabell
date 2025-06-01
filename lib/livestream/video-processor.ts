import { CapturedImage } from './capture-utils'

export interface VideoProcessingOptions {
  maxFrames?: number
  intervalSeconds?: number
  outputSize?: number
  startTime?: number
  endTime?: number
}

export async function processVideoFrames(
  videoFile: File,
  options: VideoProcessingOptions = {}
): Promise<CapturedImage[]> {
  const {
    maxFrames = 20,
    intervalSeconds = 5,
    outputSize = 400,
    startTime = 0,
    endTime
  } = options

  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    if (!ctx) {
      reject(new Error('Could not create canvas context'))
      return
    }

    canvas.width = outputSize
    canvas.height = outputSize

    const frames: CapturedImage[] = []
    let currentTime = startTime
    
    video.addEventListener('loadedmetadata', () => {
      const duration = endTime || video.duration
      const totalFrames = Math.min(
        maxFrames,
        Math.floor((duration - startTime) / intervalSeconds)
      )
      
      let capturedFrames = 0

      const captureFrame = () => {
        if (capturedFrames >= totalFrames || currentTime > duration) {
          video.remove()
          canvas.remove()
          resolve(frames)
          return
        }

        video.currentTime = currentTime

        video.addEventListener('seeked', () => {
          // Calculate crop for square aspect ratio
          const videoWidth = video.videoWidth
          const videoHeight = video.videoHeight
          const size = Math.min(videoWidth, videoHeight)
          const startX = (videoWidth - size) / 2
          const startY = (videoHeight - size) / 2

          // Draw cropped frame to canvas
          ctx.drawImage(
            video,
            startX, startY, size, size,
            0, 0, outputSize, outputSize
          )

          // Convert to data URL
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8)
          
          frames.push({
            id: `frame_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            dataUrl,
            timestamp: currentTime * 1000, // Convert to milliseconds
            processed: false
          })

          capturedFrames++
          currentTime += intervalSeconds
          
          // Process next frame
          setTimeout(captureFrame, 100)
        }, { once: true })
      }

      // Start capturing frames
      captureFrame()
    })

    video.addEventListener('error', (e) => {
      reject(new Error(`Failed to load video: ${e}`))
    })

    // Load video
    video.src = URL.createObjectURL(videoFile)
    video.load()
  })
}

export function extractThumbnail(
  videoFile: File,
  timestamp: number = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    if (!ctx) {
      reject(new Error('Could not create canvas context'))
      return
    }

    video.addEventListener('loadedmetadata', () => {
      video.currentTime = Math.min(timestamp, video.duration)
    })

    video.addEventListener('seeked', () => {
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      ctx.drawImage(video, 0, 0)
      
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8)
      video.remove()
      canvas.remove()
      resolve(dataUrl)
    }, { once: true })

    video.addEventListener('error', (e) => {
      reject(new Error(`Failed to load video: ${e}`))
    })

    video.src = URL.createObjectURL(videoFile)
    video.load()
  })
}

export function estimateProcessingTime(
  videoDuration: number,
  intervalSeconds: number
): number {
  const frameCount = Math.floor(videoDuration / intervalSeconds)
  // Estimate ~200ms per frame for processing
  return frameCount * 0.2
}

export function validateVideoFile(file: File): { valid: boolean; error?: string } {
  const validTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime']
  const maxSize = 200 * 1024 * 1024 // 200MB
  
  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Please upload MP4, WebM, OGG, or MOV files.'
    }
  }
  
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File too large. Maximum size is 200MB.'
    }
  }
  
  return { valid: true }
}