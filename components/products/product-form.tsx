'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { businessTypes } from '@/lib/auth/utils'
import { cn } from '@/lib/utils/cn'
import { productService } from '@/lib/products/product-service'
import { authService } from '@/lib/auth/auth-service'

interface ProductFormData {
  name: string
  description: string
  price: string
  category: string
  stock: string
  image?: FileList
}

interface ProductFormProps {
  onSuccess: () => void
  onCancel: () => void
}

export function ProductForm({ onSuccess, onCancel }: ProductFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  
  const form = useForm<ProductFormData>({
    defaultValues: {
      name: '',
      description: '',
      price: '',
      category: '',
      stock: '1'
    }
  })

  const { register, handleSubmit, watch, formState: { errors } } = form

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviewImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const onSubmit = async (data: ProductFormData) => {
    setIsLoading(true)
    
    try {
      // Get current user
      const user = await authService.getCurrentUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      // Upload image if provided
      let imageUrl = previewImage
      if (data.image?.[0]) {
        const uploadResult = await productService.uploadImage(data.image[0])
        if (uploadResult.success && uploadResult.url) {
          imageUrl = uploadResult.url
        }
      }

      // Create product
      const result = await productService.createProduct(user.id, {
        name: data.name,
        description: data.description,
        price: parseFloat(data.price),
        category: data.category,
        stock_quantity: parseInt(data.stock),
        image_url: imageUrl,
        source: 'manual'
      })

      if (result.success) {
        onSuccess()
      } else {
        throw new Error(result.error || 'Failed to create product')
      }
    } catch (error) {
      console.error('Error creating product:', error)
      // You could add toast notification here
      alert(error instanceof Error ? error.message : 'Failed to create product')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Add New Product
        </h2>
        <p className="text-gray-600">
          Fill in the details for your new product
        </p>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Product Information</CardTitle>
          <CardDescription>
            Provide accurate details to help customers find and buy your product
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Product Image */}
            <div className="space-y-2">
              <Label htmlFor="image">Product Image</Label>
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    {...register('image')}
                    onChange={handleImageChange}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-whatsapp file:text-white hover:file:bg-whatsapp-dark"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Recommended: Square image, at least 800x800px
                  </p>
                </div>
                {previewImage && (
                  <div className="w-20 h-20 border rounded-lg overflow-hidden">
                    <img 
                      src={previewImage} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Product Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Cotton Kurti, Gold Necklace, Smartphone"
                {...register('name', { 
                  required: 'Product name is required',
                  minLength: { value: 2, message: 'Name must be at least 2 characters' }
                })}
                className={cn(errors.name && 'border-red-500')}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                placeholder="Describe your product's features, materials, size, etc."
                {...register('description')}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            {/* Price and Stock Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price (₹) *</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="1299"
                  {...register('price', { 
                    required: 'Price is required',
                    min: { value: 1, message: 'Price must be at least ₹1' }
                  })}
                  className={cn(errors.price && 'border-red-500')}
                />
                {errors.price && (
                  <p className="text-sm text-red-500">{errors.price.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="stock">Stock Quantity *</Label>
                <Input
                  id="stock"
                  type="number"
                  placeholder="10"
                  {...register('stock', { 
                    required: 'Stock quantity is required',
                    min: { value: 0, message: 'Stock cannot be negative' }
                  })}
                  className={cn(errors.stock && 'border-red-500')}
                />
                {errors.stock && (
                  <p className="text-sm text-red-500">{errors.stock.message}</p>
                )}
              </div>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <select
                id="category"
                {...register('category', { required: 'Please select a category' })}
                className={cn(
                  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                  errors.category && 'border-red-500'
                )}
              >
                <option value="">Select a category</option>
                {businessTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="text-sm text-red-500">{errors.category.message}</p>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex gap-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-whatsapp hover:bg-whatsapp-dark"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating...
                  </div>
                ) : (
                  'Create Product'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Tips Card */}
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-lg">💡 Tips for Better Sales</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <span className="text-whatsapp font-bold">📸</span>
            <div>
              <p className="font-medium">High-Quality Images</p>
              <p className="text-sm text-gray-600">Use clear, well-lit photos that show your product from multiple angles</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-whatsapp font-bold">📝</span>
            <div>
              <p className="font-medium">Detailed Descriptions</p>
              <p className="text-sm text-gray-600">Include materials, dimensions, care instructions, and key features</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-whatsapp font-bold">💰</span>
            <div>
              <p className="font-medium">Competitive Pricing</p>
              <p className="text-sm text-gray-600">Research similar products to set competitive yet profitable prices</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}