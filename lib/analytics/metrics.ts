import { createClient } from '@/lib/supabase/client'

export interface AnalyticsMetrics {
  revenue: {
    total: number
    thisMonth: number
    lastMonth: number
    growthRate: number
  }
  orders: {
    total: number
    thisMonth: number
    pending: number
    completed: number
    cancelled: number
    averageValue: number
  }
  products: {
    total: number
    active: number
    inactive: number
    outOfStock: number
    topSelling: Array<{
      id: string
      name: string
      sales: number
      revenue: number
    }>
  }
  customers: {
    total: number
    newThisMonth: number
    repeatCustomers: number
    topCustomers: Array<{
      id: string
      name: string
      phone: string
      totalOrders: number
      totalSpent: number
    }>
  }
  chats: {
    total: number
    active: number
    conversionRate: number
    averageResponseTime: number
  }
  livestream: {
    totalSessions: number
    totalProductsCaptured: number
    totalRevenue: number
    averageSessionDuration: number
  }
}

export interface SalesData {
  date: string
  revenue: number
  orders: number
}

export interface CategoryData {
  category: string
  revenue: number
  orders: number
}

export class AnalyticsService {
  private supabase = createClient()

  async getMetrics(sellerId: string): Promise<AnalyticsMetrics> {
    const now = new Date()
    const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

    // Get revenue metrics
    const revenue = await this.getRevenueMetrics(sellerId, firstDayThisMonth, firstDayLastMonth, lastDayLastMonth)
    
    // Get order metrics
    const orders = await this.getOrderMetrics(sellerId, firstDayThisMonth)
    
    // Get product metrics
    const products = await this.getProductMetrics(sellerId)
    
    // Get customer metrics
    const customers = await this.getCustomerMetrics(sellerId, firstDayThisMonth)
    
    // Get chat metrics
    const chats = await this.getChatMetrics(sellerId)
    
    // Get livestream metrics
    const livestream = await this.getLivestreamMetrics(sellerId)

    return {
      revenue,
      orders,
      products,
      customers,
      chats,
      livestream
    }
  }

  private async getRevenueMetrics(
    sellerId: string, 
    firstDayThisMonth: Date, 
    firstDayLastMonth: Date, 
    lastDayLastMonth: Date
  ) {
    // Total revenue
    const { data: totalData } = await this.supabase
      .from('orders')
      .select('total_amount')
      .eq('seller_id', sellerId)
      .eq('payment_status', 'completed')

    const total = totalData?.reduce((sum, order) => sum + order.total_amount, 0) || 0

    // This month revenue
    const { data: thisMonthData } = await this.supabase
      .from('orders')
      .select('total_amount')
      .eq('seller_id', sellerId)
      .eq('payment_status', 'completed')
      .gte('created_at', firstDayThisMonth.toISOString())

    const thisMonth = thisMonthData?.reduce((sum, order) => sum + order.total_amount, 0) || 0

    // Last month revenue
    const { data: lastMonthData } = await this.supabase
      .from('orders')
      .select('total_amount')
      .eq('seller_id', sellerId)
      .eq('payment_status', 'completed')
      .gte('created_at', firstDayLastMonth.toISOString())
      .lt('created_at', firstDayThisMonth.toISOString())

    const lastMonth = lastMonthData?.reduce((sum, order) => sum + order.total_amount, 0) || 0

    // Growth rate
    const growthRate = lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth) * 100 : 0

    return {
      total,
      thisMonth,
      lastMonth,
      growthRate
    }
  }

  private async getOrderMetrics(sellerId: string, firstDayThisMonth: Date) {
    // All orders
    const { data: allOrders } = await this.supabase
      .from('orders')
      .select('total_amount, order_status, created_at')
      .eq('seller_id', sellerId)

    const total = allOrders?.length || 0
    const thisMonth = allOrders?.filter(order => 
      new Date(order.created_at) >= firstDayThisMonth
    ).length || 0

    const pending = allOrders?.filter(order => 
      ['pending', 'confirmed', 'processing', 'packed'].includes(order.order_status)
    ).length || 0

    const completed = allOrders?.filter(order => 
      order.order_status === 'delivered'
    ).length || 0

    const cancelled = allOrders?.filter(order => 
      ['cancelled', 'returned'].includes(order.order_status)
    ).length || 0

    const averageValue = total > 0 
      ? (allOrders?.reduce((sum, order) => sum + order.total_amount, 0) || 0) / total 
      : 0

    return {
      total,
      thisMonth,
      pending,
      completed,
      cancelled,
      averageValue
    }
  }

  private async getProductMetrics(sellerId: string) {
    // Product counts
    const { data: allProducts } = await this.supabase
      .from('products')
      .select('is_active, stock_quantity')
      .eq('seller_id', sellerId)

    const total = allProducts?.length || 0
    const active = allProducts?.filter(p => p.is_active).length || 0
    const inactive = total - active
    const outOfStock = allProducts?.filter(p => p.stock_quantity === 0).length || 0

    // Top selling products
    const { data: topSellingData } = await this.supabase
      .from('orders')
      .select(`
        product_id,
        quantity,
        total_amount,
        product:products!inner(name)
      `)
      .eq('seller_id', sellerId)
      .eq('payment_status', 'completed')

    const productSales = new Map()
    topSellingData?.forEach(order => {
      const productId = order.product_id
      if (!productSales.has(productId)) {
        productSales.set(productId, {
          id: productId,
          name: order.product?.name || 'Unknown Product',
          sales: 0,
          revenue: 0
        })
      }
      const product = productSales.get(productId)
      product.sales += order.quantity
      product.revenue += order.total_amount
    })

    const topSelling = Array.from(productSales.values())
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5)

    return {
      total,
      active,
      inactive,
      outOfStock,
      topSelling
    }
  }

  private async getCustomerMetrics(sellerId: string, firstDayThisMonth: Date) {
    // Unique customers
    const { data: allOrders } = await this.supabase
      .from('orders')
      .select(`
        buyer_id,
        total_amount,
        created_at,
        buyer:buyers!inner(
          users!inner(name, phone)
        )
      `)
      .eq('seller_id', sellerId)

    const uniqueCustomers = new Map()
    allOrders?.forEach(order => {
      const buyerId = order.buyer_id
      if (!uniqueCustomers.has(buyerId)) {
        uniqueCustomers.set(buyerId, {
          id: buyerId,
          name: order.buyer?.users?.name || 'Unknown Customer',
          phone: order.buyer?.users?.phone || '',
          totalOrders: 0,
          totalSpent: 0,
          firstOrder: order.created_at
        })
      }
      const customer = uniqueCustomers.get(buyerId)
      customer.totalOrders += 1
      customer.totalSpent += order.total_amount
    })

    const customers = Array.from(uniqueCustomers.values())
    const total = customers.length
    const newThisMonth = customers.filter(c => 
      new Date(c.firstOrder) >= firstDayThisMonth
    ).length
    const repeatCustomers = customers.filter(c => c.totalOrders > 1).length

    const topCustomers = customers
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 5)

    return {
      total,
      newThisMonth,
      repeatCustomers,
      topCustomers
    }
  }

  private async getChatMetrics(sellerId: string) {
    // Chat statistics
    const { data: allChats } = await this.supabase
      .from('chats')
      .select('status, created_at')
      .eq('seller_id', sellerId)

    const total = allChats?.length || 0
    const active = allChats?.filter(chat => chat.status === 'active').length || 0

    // Calculate conversion rate (chats that led to orders)
    const { data: ordersFromChats } = await this.supabase
      .from('orders')
      .select('id')
      .eq('seller_id', sellerId)
      .eq('created_via', 'chat')

    const conversions = ordersFromChats?.length || 0
    const conversionRate = total > 0 ? (conversions / total) * 100 : 0

    // Simulate average response time (in real app, would track actual response times)
    const averageResponseTime = 15 // minutes

    return {
      total,
      active,
      conversionRate,
      averageResponseTime
    }
  }

  private async getLivestreamMetrics(sellerId: string) {
    // Livestream statistics
    const { data: sessions } = await this.supabase
      .from('livestream_sessions')
      .select('total_products_captured, total_revenue, start_time, end_time')
      .eq('seller_id', sellerId)

    const totalSessions = sessions?.length || 0
    const totalProductsCaptured = sessions?.reduce((sum, session) => 
      sum + session.total_products_captured, 0) || 0
    const totalRevenue = sessions?.reduce((sum, session) => 
      sum + session.total_revenue, 0) || 0

    // Calculate average session duration
    const completedSessions = sessions?.filter(s => s.end_time) || []
    const averageSessionDuration = completedSessions.length > 0
      ? completedSessions.reduce((sum, session) => {
          const duration = new Date(session.end_time).getTime() - new Date(session.start_time).getTime()
          return sum + (duration / (1000 * 60)) // Convert to minutes
        }, 0) / completedSessions.length
      : 0

    return {
      totalSessions,
      totalProductsCaptured,
      totalRevenue,
      averageSessionDuration
    }
  }

  async getSalesData(sellerId: string, days: number = 30): Promise<SalesData[]> {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(endDate.getDate() - days)

    const { data } = await this.supabase
      .from('orders')
      .select('created_at, total_amount')
      .eq('seller_id', sellerId)
      .eq('payment_status', 'completed')
      .gte('created_at', startDate.toISOString())
      .order('created_at')

    // Group by date
    const salesByDate = new Map()
    
    // Initialize all dates with 0
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)
      const dateStr = date.toISOString().split('T')[0]
      salesByDate.set(dateStr, { date: dateStr, revenue: 0, orders: 0 })
    }

    // Fill with actual data
    data?.forEach(order => {
      const dateStr = order.created_at.split('T')[0]
      if (salesByDate.has(dateStr)) {
        const dayData = salesByDate.get(dateStr)
        dayData.revenue += order.total_amount
        dayData.orders += 1
      }
    })

    return Array.from(salesByDate.values())
  }

  async getCategoryData(sellerId: string): Promise<CategoryData[]> {
    const { data } = await this.supabase
      .from('orders')
      .select(`
        total_amount,
        product:products!inner(category)
      `)
      .eq('seller_id', sellerId)
      .eq('payment_status', 'completed')

    const categoryMap = new Map()
    
    data?.forEach(order => {
      const category = order.product?.category || 'Other'
      if (!categoryMap.has(category)) {
        categoryMap.set(category, { category, revenue: 0, orders: 0 })
      }
      const categoryData = categoryMap.get(category)
      categoryData.revenue += order.total_amount
      categoryData.orders += 1
    })

    return Array.from(categoryMap.values())
      .sort((a, b) => b.revenue - a.revenue)
  }
}

export const analyticsService = new AnalyticsService()