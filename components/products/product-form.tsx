'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, X, Upload, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useImageUpload } from '@/lib/hooks/useImageUpload'
import { cn } from '@/lib/utils/cn'
import Image from 'next/image'

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(255),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  short_description: z.string().max(500).optional(),
  price: z.number().positive('Price must be positive'),
  original_price: z.number().positive().optional(),
  category: z.string().min(1, 'Category is required'),
  stock_quantity: z.number().int().min(0, 'Stock cannot be negative'),
  weight: z.number().positive().optional(),
  shipping_cost: z.number().min(0).optional(),
  cod_available: z.boolean(),
  return_policy: z.string().optional(),
})

type ProductFormData = z.infer<typeof productSchema>

interface ProductFormProps {
  sellerId: string
  onSuccess: () => void
  onCancel: () => void
  initialData?: Partial<ProductFormData>
}

export function ProductForm({ sellerId, onSuccess, onCancel, initialData }: ProductFormProps) {
  const [images, setImages] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { uploadImages, deleteImage, isUploading } = useImageUpload()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      cod_available: true,
      shipping_cost: 0,
      ...initialData
    }
  })

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    const uploadedUrls = await uploadImages(files)
    setImages(prev => [...prev, ...uploadedUrls])
  }

  const removeImage = async (url: string) => {
    await deleteImage(url)
    setImages(prev => prev.filter(img => img !== url))
  }

  const onSubmit = async (data: ProductFormData) => {
    if (images.length === 0) {
      alert('Please upload at least one product image')
      return
    }

    setIsSubmitting(true)
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()

      const productData = {
        ...data,
        seller_id: sellerId,
        images,
        is_active: true,
        created_from: 'manual' as const
      }

      const { error } = await supabase
        .from('products')
        .insert(productData)

      if (error) throw error

      onSuccess()
    } catch (error) {
      console.error('Error creating product:', error)
      alert('Failed to create product')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Image Upload */}
      <div>
        <Label>Product Images</Label>
        <div className="mt-2 grid grid-cols-3 gap-4">
          {images.map((url, index) => (
            <div key={url} className="relative group">
              <Image
                src={url}
                alt={`Product ${index + 1}`}
                width={200}
                height={200}
                className="w-full h-32 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => removeImage(url)}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
          
          <label className={cn(
            "flex flex-col items-center justify-center h-32 border-2 border-dashed rounded-lg cursor-pointer",
            "hover:border-indigo-500 hover:bg-indigo-50 transition-colors",
            isUploading && "pointer-events-none opacity-50"
          )}>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              disabled={isUploading}
            />
            {isUploading ? (
              <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
            ) : (
              <>
                <Upload className="w-8 h-8 text-gray-400" />
                <span className="text-sm text-gray-500 mt-2">Upload Images</span>
              </>
            )}
          </label>
        </div>
      </div>

      {/* Product Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="name">Product Name</Label>
          <Input
            id="name"
            {...register('name')}
            placeholder="Enter product name"
          />
          {errors.name && (
            <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="category">Category</Label>
          <select
            id="category"
            {...register('category')}
            className="w-full h-10 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select category</option>
            <option value="fashion-clothing">Fashion & Clothing</option>
            <option value="beauty-cosmetics">Beauty & Cosmetics</option>
            <option value="electronics-gadgets">Electronics & Gadgets</option>
            <option value="home-kitchen">Home & Kitchen</option>
            <option value="jewelry-accessories">Jewelry & Accessories</option>
            <option value="books-stationery">Books & Stationery</option>
            <option value="sports-fitness">Sports & Fitness</option>
            <option value="food-beverages">Food & Beverages</option>
          </select>
          {errors.category && (
            <p className="text-sm text-red-600 mt-1">{errors.category.message}</p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          {...register('description')}
          placeholder="Describe your product in detail"
          rows={4}
        />
        {errors.description && (
          <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <Label htmlFor="price">Price (₹)</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            {...register('price', { valueAsNumber: true })}
            placeholder="0.00"
          />
          {errors.price && (
            <p className="text-sm text-red-600 mt-1">{errors.price.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="original_price">Original Price (₹)</Label>
          <Input
            id="original_price"
            type="number"
            step="0.01"
            {...register('original_price', { valueAsNumber: true })}
            placeholder="0.00"
          />
        </div>

        <div>
          <Label htmlFor="stock_quantity">Stock Quantity</Label>
          <Input
            id="stock_quantity"
            type="number"
            {...register('stock_quantity', { valueAsNumber: true })}
            placeholder="0"
          />
          {errors.stock_quantity && (
            <p className="text-sm text-red-600 mt-1">{errors.stock_quantity.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <Label htmlFor="weight">Weight (kg)</Label>
          <Input
            id="weight"
            type="number"
            step="0.001"
            {...register('weight', { valueAsNumber: true })}
            placeholder="0.000"
          />
        </div>

        <div>
          <Label htmlFor="shipping_cost">Shipping Cost (₹)</Label>
          <Input
            id="shipping_cost"
            type="number"
            step="0.01"
            {...register('shipping_cost', { valueAsNumber: true })}
            placeholder="0.00"
          />
        </div>

        <div className="flex items-center space-x-2 mt-8">
          <input
            type="checkbox"
            id="cod_available"
            {...register('cod_available')}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <Label htmlFor="cod_available" className="cursor-pointer">
            Cash on Delivery Available
          </Label>
        </div>
      </div>

      <div>
        <Label htmlFor="return_policy">Return Policy (Optional)</Label>
        <Textarea
          id="return_policy"
          {...register('return_policy')}
          placeholder="Describe your return policy"
          rows={3}
        />
      </div>

      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting || isUploading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || isUploading}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            'Create Product'
          )}
        </Button>
      </div>
    </form>
  )
}