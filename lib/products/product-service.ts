import { Product, InsertProduct } from '@/types/supabase'

export interface CreateProductData {
  name: string
  description?: string
  price: number
  category?: string
  stock_quantity?: number
  image_url?: string
  source?: 'manual' | 'livestream' | 'video' | 'chat_command'
  ai_extracted_data?: any
}

export interface UpdateProductData extends Partial<CreateProductData> {
  is_active?: boolean
}

export interface ProductsResponse {
  success: boolean
  products: Product[]
  total: number
  hasMore: boolean
  error?: string
}

export interface ProductResponse {
  success: boolean
  product?: Product
  error?: string
}

export class ProductService {
  /**
   * Get products for a user
   */
  async getProducts(params: {
    userId: string
    limit?: number
    offset?: number
    category?: string
    search?: string
  }): Promise<ProductsResponse> {
    try {
      const queryParams = new URLSearchParams({
        userId: params.userId,
        limit: (params.limit || 20).toString(),
        offset: (params.offset || 0).toString()
      })

      if (params.category) queryParams.append('category', params.category)
      if (params.search) queryParams.append('search', params.search)

      const response = await fetch(`/api/products?${queryParams}`)
      const data = await response.json()

      return data
    } catch (error) {
      console.error('Get products error:', error)
      return {
        success: false,
        products: [],
        total: 0,
        hasMore: false,
        error: 'Failed to fetch products'
      }
    }
  }

  /**
   * Create a new product
   */
  async createProduct(userId: string, productData: CreateProductData): Promise<ProductResponse> {
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...productData,
          user_id: userId
        })
      })

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Create product error:', error)
      return {
        success: false,
        error: 'Failed to create product'
      }
    }
  }

  /**
   * Update a product
   */
  async updateProduct(userId: string, productId: string, updates: UpdateProductData): Promise<ProductResponse> {
    try {
      const response = await fetch('/api/products', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: productId,
          user_id: userId,
          ...updates
        })
      })

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Update product error:', error)
      return {
        success: false,
        error: 'Failed to update product'
      }
    }
  }

  /**
   * Delete a product (soft delete)
   */
  async deleteProduct(userId: string, productId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`/api/products?id=${productId}&userId=${userId}`, {
        method: 'DELETE'
      })

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Delete product error:', error)
      return {
        success: false,
        error: 'Failed to delete product'
      }
    }
  }

  /**
   * Bulk create products (for AI-extracted products)
   */
  async createProducts(userId: string, products: CreateProductData[]): Promise<{
    success: boolean
    products: Product[]
    failed: number
    error?: string
  }> {
    try {
      const results = await Promise.allSettled(
        products.map(product => this.createProduct(userId, product))
      )

      const successful: Product[] = []
      let failed = 0

      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value.success && result.value.product) {
          successful.push(result.value.product)
        } else {
          failed++
          console.error(`Failed to create product ${index}:`, result)
        }
      })

      return {
        success: true,
        products: successful,
        failed
      }
    } catch (error) {
      console.error('Bulk create products error:', error)
      return {
        success: false,
        products: [],
        failed: products.length,
        error: 'Failed to create products'
      }
    }
  }

  /**
   * Upload product image
   */
  async uploadImage(file: File): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      // In production, upload to Supabase Storage or CDN
      // For now, create a data URL for demo purposes
      return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          resolve({
            success: true,
            url: e.target?.result as string
          })
        }
        reader.onerror = () => {
          resolve({
            success: false,
            error: 'Failed to process image'
          })
        }
        reader.readAsDataURL(file)
      })
    } catch (error) {
      console.error('Upload image error:', error)
      return {
        success: false,
        error: 'Failed to upload image'
      }
    }
  }

  /**
   * Get product categories with counts
   */
  async getCategories(userId: string): Promise<{
    success: boolean
    categories: Array<{ name: string; count: number }>
    error?: string
  }> {
    try {
      // This would typically be a separate API endpoint
      // For now, we'll extract from products
      const response = await this.getProducts({ userId, limit: 1000 })
      
      if (!response.success) {
        return {
          success: false,
          categories: [],
          error: response.error
        }
      }

      const categoryCount: Record<string, number> = {}
      response.products.forEach(product => {
        if (product.category) {
          categoryCount[product.category] = (categoryCount[product.category] || 0) + 1
        }
      })

      const categories = Object.entries(categoryCount).map(([name, count]) => ({
        name,
        count
      }))

      return {
        success: true,
        categories
      }
    } catch (error) {
      console.error('Get categories error:', error)
      return {
        success: false,
        categories: [],
        error: 'Failed to fetch categories'
      }
    }
  }

  /**
   * Format price for display
   */
  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(price)
  }

  /**
   * Get stock status
   */
  getStockStatus(stock: number): { text: string; color: string; urgent: boolean } {
    if (stock === 0) {
      return { text: 'Out of Stock', color: 'text-red-500', urgent: true }
    }
    if (stock <= 5) {
      return { text: 'Low Stock', color: 'text-orange-500', urgent: true }
    }
    return { text: 'In Stock', color: 'text-green-500', urgent: false }
  }

  /**
   * Validate product data
   */
  validateProduct(data: CreateProductData): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!data.name?.trim()) {
      errors.push('Product name is required')
    } else if (data.name.trim().length < 2) {
      errors.push('Product name must be at least 2 characters')
    }

    if (!data.price || data.price <= 0) {
      errors.push('Price must be greater than 0')
    }

    if (data.stock_quantity !== undefined && data.stock_quantity < 0) {
      errors.push('Stock quantity cannot be negative')
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }
}

// Export singleton instance
export const productService = new ProductService()