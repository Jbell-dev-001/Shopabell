'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Edit, Trash2, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils/cn'

interface ProductCardProps {
  product: {
    id: string
    name: string
    description: string | null
    price: number
    original_price: number | null
    images: any
    stock_quantity: number
    is_active: boolean
    view_count: number
  }
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  onToggleActive?: (id: string, isActive: boolean) => void
  showActions?: boolean
}

export function ProductCard({ 
  product, 
  onEdit, 
  onDelete, 
  onToggleActive,
  showActions = true 
}: ProductCardProps) {
  const imageUrl = Array.isArray(product.images) && product.images.length > 0 
    ? product.images[0] 
    : '/placeholder.png'
  
  const discountPercentage = product.original_price 
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0

  return (
    <div className={cn(
      "bg-white rounded-lg shadow hover:shadow-lg transition-shadow",
      !product.is_active && "opacity-60"
    )}>
      <div className="relative aspect-square">
        <Image
          src={imageUrl}
          alt={product.name}
          fill
          className="object-cover rounded-t-lg"
        />
        {discountPercentage > 0 && (
          <span className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-sm font-medium">
            -{discountPercentage}%
          </span>
        )}
        {product.stock_quantity === 0 && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-t-lg">
            <span className="text-white font-semibold">Out of Stock</span>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-900 line-clamp-1">{product.name}</h3>
        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
          {product.description || 'No description'}
        </p>
        
        <div className="mt-3 flex items-center justify-between">
          <div>
            <span className="text-lg font-bold text-gray-900">₹{product.price}</span>
            {product.original_price && (
              <span className="text-sm text-gray-500 line-through ml-2">
                ₹{product.original_price}
              </span>
            )}
          </div>
          <span className="text-sm text-gray-600">
            Stock: {product.stock_quantity}
          </span>
        </div>

        <div className="mt-2 flex items-center justify-between text-sm text-gray-500">
          <span>{product.view_count} views</span>
          <span className={cn(
            "font-medium",
            product.is_active ? "text-green-600" : "text-red-600"
          )}>
            {product.is_active ? 'Active' : 'Inactive'}
          </span>
        </div>

        {showActions && (
          <div className="mt-4 flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onToggleActive?.(product.id, !product.is_active)}
              className="flex-1"
            >
              {product.is_active ? (
                <>
                  <EyeOff className="w-4 h-4 mr-1" />
                  Hide
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 mr-1" />
                  Show
                </>
              )}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEdit?.(product.id)}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onDelete?.(product.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}