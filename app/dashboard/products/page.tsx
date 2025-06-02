'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ProductForm } from '@/components/products/product-form'
import { ProductGrid } from '@/components/products/product-grid'
import { LivestreamCapture } from '@/components/livestream/capture-widget'
import { VideoUploadWidget } from '@/components/products/video-upload-widget'
import { authService, AuthUser } from '@/lib/auth/auth-service'
import { Product } from '@/types/supabase'

type UploadMethod = 'manual' | 'livestream' | 'video' | null

export default function ProductsPage() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [uploadMethod, setUploadMethod] = useState<UploadMethod>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
    // loadProducts() // Will implement when we have API
  }, [])

  const checkAuth = async () => {
    try {
      const currentUser = await authService.getCurrentUser()
      if (currentUser) {
        setUser(currentUser)
      } else {
        router.push('/login')
      }
    } catch (error) {
      router.push('/login')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-whatsapp border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={() => router.push('/dashboard')}
              className="text-sm"
            >
              ← Dashboard
            </Button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Product Management</h1>
              <p className="text-sm text-gray-600">Add and manage your products</p>
            </div>
          </div>
          {uploadMethod && (
            <Button 
              variant="outline" 
              onClick={() => setUploadMethod(null)}
            >
              Cancel
            </Button>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {!uploadMethod ? (
          // Upload Method Selection
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                How would you like to add products?
              </h2>
              <p className="text-gray-600">
                Choose the method that works best for you
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {/* Manual Entry */}
              <Card 
                className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-whatsapp"
                onClick={() => setUploadMethod('manual')}
              >
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">✏️</span>
                  </div>
                  <CardTitle>Manual Entry</CardTitle>
                  <CardDescription>
                    Add products one by one with custom details
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      <span>Full control over details</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      <span>Custom descriptions</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      <span>Upload product images</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* AI Livestream */}
              <Card 
                className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-purple-500"
                onClick={() => setUploadMethod('livestream')}
              >
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">📱</span>
                  </div>
                  <CardTitle>AI Livestream</CardTitle>
                  <CardDescription>
                    Capture products live using AI recognition
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      <span>Real-time AI extraction</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      <span>Multiple products at once</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      <span>Auto-pricing suggestions</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Video Upload */}
              <Card 
                className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-orange-500"
                onClick={() => setUploadMethod('video')}
              >
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">🎥</span>
                  </div>
                  <CardTitle>Upload Video</CardTitle>
                  <CardDescription>
                    Extract products from pre-recorded videos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      <span>Batch processing</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      <span>High-quality extraction</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      <span>Frame-by-frame analysis</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Existing Products */}
            <div className="mt-12">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  Your Products ({products.length})
                </h3>
                {products.length > 0 && (
                  <Button variant="outline" size="sm">
                    Export Catalog
                  </Button>
                )}
              </div>

              {products.length === 0 ? (
                <Card className="text-center py-12">
                  <CardContent>
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-3xl text-gray-400">📦</span>
                    </div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">
                      No products yet
                    </h4>
                    <p className="text-gray-600 mb-6">
                      Start by adding your first product using one of the methods above
                    </p>
                    <Button 
                      onClick={() => setUploadMethod('manual')}
                      className="bg-whatsapp hover:bg-whatsapp-dark"
                    >
                      Add Your First Product
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <ProductGrid products={products} />
              )}
            </div>
          </div>
        ) : (
          // Upload Method Components
          <div className="max-w-4xl mx-auto">
            {uploadMethod === 'manual' && (
              <ProductForm 
                onSuccess={() => {
                  setUploadMethod(null)
                  // Refresh products list
                }}
                onCancel={() => setUploadMethod(null)}
              />
            )}
            
            {uploadMethod === 'livestream' && (
              <LivestreamCapture 
                onProductsCreated={(newProducts) => {
                  setProducts(prev => [...prev, ...newProducts])
                  setUploadMethod(null)
                }}
                onCancel={() => setUploadMethod(null)}
              />
            )}
            
            {uploadMethod === 'video' && (
              <VideoUploadWidget 
                onProductsCreated={(newProducts) => {
                  setProducts(prev => [...prev, ...newProducts])
                  setUploadMethod(null)
                }}
                onCancel={() => setUploadMethod(null)}
              />
            )}
          </div>
        )}
      </main>
    </div>
  )
}