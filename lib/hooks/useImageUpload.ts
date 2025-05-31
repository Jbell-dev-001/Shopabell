import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface UploadProgress {
  file: string
  progress: number
}

export function useImageUpload(bucket: string = 'product-images') {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<Record<string, UploadProgress>>({})
  const supabase = createClient()

  const uploadImages = useCallback(async (files: File[]): Promise<string[]> => {
    setIsUploading(true)
    const uploadedUrls: string[] = []

    try {
      for (const file of files) {
        // Validate file
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} is not a valid image`)
          continue
        }

        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} is too large (max 5MB)`)
          continue
        }

        // Generate unique filename
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
        const filePath = `${fileName}`

        // Update progress
        setUploadProgress(prev => ({
          ...prev,
          [file.name]: { file: file.name, progress: 0 }
        }))

        // Upload to Supabase
        const { data, error } = await supabase.storage
          .from(bucket)
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          })

        if (error) {
          toast.error(`Failed to upload ${file.name}`)
          console.error('Upload error:', error)
          continue
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from(bucket)
          .getPublicUrl(data.path)

        uploadedUrls.push(urlData.publicUrl)

        // Update progress to 100%
        setUploadProgress(prev => ({
          ...prev,
          [file.name]: { file: file.name, progress: 100 }
        }))
      }

      return uploadedUrls
    } finally {
      setIsUploading(false)
      // Clear progress after a delay
      setTimeout(() => setUploadProgress({}), 2000)
    }
  }, [bucket, supabase])

  const deleteImage = useCallback(async (url: string) => {
    try {
      // Extract file path from URL
      const urlParts = url.split('/')
      const filePath = urlParts[urlParts.length - 1]

      const { error } = await supabase.storage
        .from(bucket)
        .remove([filePath])

      if (error) throw error
      
      toast.success('Image deleted')
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Failed to delete image')
    }
  }, [bucket, supabase])

  return {
    uploadImages,
    deleteImage,
    isUploading,
    uploadProgress
  }
}