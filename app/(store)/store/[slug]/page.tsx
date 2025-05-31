'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Store as StoreIcon, Star, ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useCartStore } from '@/lib/stores/cart-store'
import { ChatButton } from '@/components/chat/chat-button'

interface Product {
  id: string
  name: string
  description: string | null
  price: number
  original_price: number | null
  images: any
  stock_quantity: number
}

interface Seller {
  id: string
  business_name: string
  business_category: string
  rating: number
  review_count: number
  total_sales: number
  pickup_address?: any
}

export default function StorePage() {
  const params = useParams()
  const slug = params.slug as string
  const [seller, setSeller] = useState<Seller | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (slug) {
      fetchStoreData()
    }
  }, [slug])

  const fetchStoreData = async () => {
    try {
      // Fetch seller info
      const { data: sellerData, error: sellerError } = await supabase
        .from('sellers')
        .select('*')
        .eq('store_slug', slug)
        .single()

      if (sellerError) throw sellerError
      setSeller(sellerData)

      // Fetch products
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('seller_id', sellerData.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (productsError) throw productsError
      setProducts(productsData || [])
    } catch (error) {
      console.error('Error fetching store data:', error)
      toast.error('Failed to load store')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddToCart = (product: Product) => {
    if (!seller) return
    
    const { addItem } = useCartStore.getState()
    
    const imageUrl = Array.isArray(product.images) && product.images.length > 0 
      ? product.images[0] 
      : '/placeholder.png'
    
    addItem({
      productId: product.id,
      sellerId: seller.id,
      name: product.name,
      price: product.price,
      image: imageUrl,
      maxQuantity: product.stock_quantity
    })
    
    toast.success(`${product.name} added to cart!`)
  }

  const handleChatWithSeller = (product: Product) => {
    // Chat functionality is handled by ChatButton component
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading store...</div>
        </div>
      </div>
    )
  }

  if (!seller) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Store not found</h2>
          <Link href="/explore" className="text-indigo-600 hover:text-indigo-700">
            Browse other stores
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Store Header */}
      <div className="bg-white rounded-lg shadow mb-8 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center">
              <StoreIcon className="w-10 h-10 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{seller.business_name}</h1>
              <p className="text-gray-600">{seller.business_category}</p>
              {seller.pickup_address?.city && (
                <p className="text-sm text-gray-500">{seller.pickup_address.city}</p>
              )}
            </div>
          </div>
          
          <div className="text-right">
            <div className="flex items-center justify-end mb-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${
                    i < Math.floor(seller.rating)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
              <span className="ml-2 text-gray-600">
                {seller.rating.toFixed(1)} ({seller.review_count} reviews)
              </span>
            </div>
            <p className="text-sm text-gray-600">{seller.total_sales} successful orders</p>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Products ({products.length})
        </h2>
        
        {products.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-gray-500">No products available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => {
              const imageUrl = Array.isArray(product.images) && product.images.length > 0 
                ? product.images[0] 
                : '/placeholder.png'
              
              const discountPercentage = product.original_price 
                ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
                : 0

              return (
                <div key={product.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
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
                    
                    <div className="mt-3 mb-4">
                      <span className="text-lg font-bold text-gray-900">₹{product.price}</span>
                      {product.original_price && (
                        <span className="text-sm text-gray-500 line-through ml-2">
                          ₹{product.original_price}
                        </span>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleAddToCart(product)}
                        disabled={product.stock_quantity === 0}
                        className="flex-1"
                      >
                        <ShoppingCart className="w-4 h-4 mr-1" />
                        Add to Cart
                      </Button>
                      <ChatButton
                        sellerId={seller.id}
                        productId={product.id}
                        productName={product.name}
                        productImage={imageUrl}
                        productPrice={product.price}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}