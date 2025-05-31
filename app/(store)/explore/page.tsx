'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Store, Star, MapPin } from 'lucide-react'

interface Seller {
  id: string
  business_name: string
  business_category: string
  store_slug: string
  total_sales: number
  rating: number
  review_count: number
  product_count?: number
  pickup_address?: any
}

export default function ExplorePage() {
  const [sellers, setSellers] = useState<Seller[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('')
  const supabase = createClient()

  useEffect(() => {
    fetchSellers()
  }, [selectedCategory])

  const fetchSellers = async () => {
    try {
      let query = supabase
        .from('sellers')
        .select(`
          id,
          business_name,
          business_category,
          store_slug,
          total_sales,
          rating,
          review_count,
          pickup_address
        `)
        .eq('onboarding_completed', true)
        .eq('verification_status', 'verified')

      if (selectedCategory) {
        query = query.eq('business_category', selectedCategory)
      }

      const { data: sellersData, error } = await query

      if (error) throw error

      // Fetch product counts for each seller
      const sellersWithProducts = await Promise.all(
        (sellersData || []).map(async (seller) => {
          const { count } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('seller_id', seller.id)
            .eq('is_active', true)

          return {
            ...seller,
            product_count: count || 0
          }
        })
      )

      setSellers(sellersWithProducts)
    } catch (error) {
      console.error('Error fetching sellers:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'Fashion & Clothing', label: 'Fashion & Clothing' },
    { value: 'Beauty & Cosmetics', label: 'Beauty & Cosmetics' },
    { value: 'Electronics & Gadgets', label: 'Electronics & Gadgets' },
    { value: 'Home & Kitchen', label: 'Home & Kitchen' },
    { value: 'Jewelry & Accessories', label: 'Jewelry & Accessories' },
    { value: 'Books & Stationery', label: 'Books & Stationery' },
    { value: 'Sports & Fitness', label: 'Sports & Fitness' },
    { value: 'Food & Beverages', label: 'Food & Beverages' },
  ]

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading stores...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Explore Stores</h1>
        <p className="text-gray-600">Discover amazing sellers and their unique products</p>
      </div>

      {/* Category Filter */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.value}
              onClick={() => setSelectedCategory(category.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category.value
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sellers Grid */}
      {sellers.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No stores found in this category</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sellers.map((seller) => (
            <Link
              key={seller.id}
              href={`/store/${seller.store_slug}`}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mx-auto mb-4">
                  <Store className="w-8 h-8 text-indigo-600" />
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 text-center mb-1">
                  {seller.business_name}
                </h3>
                
                <p className="text-sm text-gray-600 text-center mb-3">
                  {seller.business_category}
                </p>

                {seller.pickup_address?.city && (
                  <div className="flex items-center justify-center text-sm text-gray-500 mb-3">
                    <MapPin className="w-4 h-4 mr-1" />
                    {seller.pickup_address.city}
                  </div>
                )}

                <div className="flex items-center justify-center mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(seller.rating)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className="ml-2 text-sm text-gray-600">
                      ({seller.review_count})
                    </span>
                  </div>
                </div>

                <div className="flex justify-between text-sm text-gray-600">
                  <span>{seller.product_count} Products</span>
                  <span>{seller.total_sales} Sales</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}