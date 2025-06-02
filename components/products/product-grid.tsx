'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Product } from '@/types/supabase'
import { cn } from '@/lib/utils/cn'

interface ProductGridProps {
  products: Product[]
  onEdit?: (product: Product) => void
  onDelete?: (productId: string) => void
}

export function ProductGrid({ products, onEdit, onDelete }: ProductGridProps) {
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])

  const toggleProductSelection = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(price)
  }

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { text: 'Out of Stock', color: 'text-red-500' }
    if (stock <= 5) return { text: 'Low Stock', color: 'text-orange-500' }
    return { text: 'In Stock', color: 'text-green-500' }
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl text-gray-400">📦</span>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No products found
        </h3>
        <p className="text-gray-600">
          Start by adding your first product
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Bulk Actions */}
      {selectedProducts.length > 0 && (
        <div className="bg-whatsapp/10 border border-whatsapp/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              {selectedProducts.length} product{selectedProducts.length > 1 ? 's' : ''} selected
            </span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                Bulk Edit
              </Button>
              <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                Delete Selected
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSelectedProducts([])}
              >
                Clear Selection
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => {
          const stockStatus = getStockStatus(product.stock_quantity)
          const isSelected = selectedProducts.includes(product.id)
          
          return (
            <Card 
              key={product.id} 
              className={cn(
                "product-card relative overflow-hidden cursor-pointer transition-all",
                isSelected && "ring-2 ring-whatsapp border-whatsapp"
              )}
              onClick={() => toggleProductSelection(product.id)}
            >
              {/* Selection Checkbox */}
              <div className="absolute top-3 left-3 z-10">
                <div className={cn(
                  "w-5 h-5 rounded border-2 flex items-center justify-center transition-colors",
                  isSelected 
                    ? "bg-whatsapp border-whatsapp" 
                    : "bg-white border-gray-300 hover:border-whatsapp"
                )}>
                  {isSelected && (
                    <svg className="w-3 h-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </div>

              {/* Product Image */}
              <div className="aspect-square relative bg-gray-100">
                {product.image_url ? (
                  <Image
                    src={product.image_url}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-4xl text-gray-300">📷</span>
                  </div>
                )}
                
                {/* Stock Badge */}
                <div className="absolute top-3 right-3">
                  <span className={cn(
                    "px-2 py-1 text-xs font-medium rounded-full bg-white shadow-sm",
                    stockStatus.color
                  )}>
                    {stockStatus.text}
                  </span>
                </div>

                {/* AI Badge */}
                {product.source !== 'manual' && (
                  <div className="absolute bottom-3 left-3">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-700">
                      AI {product.source === 'livestream' ? 'Live' : 'Video'}
                    </span>
                  </div>
                )}
              </div>

              <CardContent className="p-4">
                <div className="space-y-2">
                  {/* Product Name */}
                  <h3 className="font-semibold text-gray-900 line-clamp-2 leading-tight">
                    {product.name}
                  </h3>
                  
                  {/* Category */}
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    {product.category}
                  </p>
                  
                  {/* Price */}
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-gray-900">
                      {formatPrice(product.price)}
                    </span>
                    <span className="text-sm text-gray-500">
                      Stock: {product.stock_quantity}
                    </span>
                  </div>

                  {/* Description */}
                  {product.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {product.description}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation()
                        onEdit?.(product)
                      }}
                    >
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                      onClick={(e) => {
                        e.stopPropagation()
                        onDelete?.(product.id)
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Load More Button */}
      {products.length >= 20 && (
        <div className="text-center pt-6">
          <Button variant="outline">
            Load More Products
          </Button>
        </div>
      )}
    </div>
  )
}