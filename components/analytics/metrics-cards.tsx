'use client'

import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Package, Users, MessageSquare, Video } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AnalyticsMetrics } from '@/lib/analytics/metrics'

interface MetricsCardsProps {
  metrics: AnalyticsMetrics
  isLoading?: boolean
}

export function MetricsCards({ metrics, isLoading }: MetricsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatGrowth = (rate: number) => {
    const isPositive = rate >= 0
    const Icon = isPositive ? TrendingUp : TrendingDown
    const color = isPositive ? 'text-green-600' : 'text-red-600'
    
    return (
      <div className={`flex items-center gap-1 text-sm ${color}`}>
        <Icon className="w-3 h-3" />
        <span>{Math.abs(rate).toFixed(1)}%</span>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Revenue Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(metrics.revenue.total)}</div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-muted-foreground">
              This month: {formatCurrency(metrics.revenue.thisMonth)}
            </p>
            {formatGrowth(metrics.revenue.growthRate)}
          </div>
        </CardContent>
      </Card>

      {/* Orders Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.orders.total}</div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-muted-foreground">
              This month: {metrics.orders.thisMonth}
            </p>
            <p className="text-xs text-gray-600">
              Avg: {formatCurrency(metrics.orders.averageValue)}
            </p>
          </div>
          <div className="flex gap-2 mt-2 text-xs">
            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
              {metrics.orders.pending} pending
            </span>
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
              {metrics.orders.completed} completed
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Products Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Products</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.products.total}</div>
          <div className="flex gap-2 mt-2 text-xs">
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
              {metrics.products.active} active
            </span>
            <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded">
              {metrics.products.inactive} inactive
            </span>
          </div>
          {metrics.products.outOfStock > 0 && (
            <p className="text-xs text-red-600 mt-2">
              {metrics.products.outOfStock} out of stock
            </p>
          )}
        </CardContent>
      </Card>

      {/* Customers Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Customers</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.customers.total}</div>
          <div className="flex gap-2 mt-2 text-xs">
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
              {metrics.customers.newThisMonth} new
            </span>
            <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">
              {metrics.customers.repeatCustomers} repeat
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Chats Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Chat Metrics</CardTitle>
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.chats.total}</div>
          <div className="flex justify-between mt-2 text-xs">
            <span>Conversion: {metrics.chats.conversionRate.toFixed(1)}%</span>
            <span>Avg response: {metrics.chats.averageResponseTime}m</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {metrics.chats.active} active conversations
          </p>
        </CardContent>
      </Card>

      {/* Livestream Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Live Selling</CardTitle>
          <Video className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.livestream.totalSessions}</div>
          <div className="space-y-1 mt-2 text-xs text-muted-foreground">
            <p>{metrics.livestream.totalProductsCaptured} products captured</p>
            <p>{formatCurrency(metrics.livestream.totalRevenue)} revenue</p>
            <p>{Math.round(metrics.livestream.averageSessionDuration)}m avg duration</p>
          </div>
        </CardContent>
      </Card>

      {/* Order Status Breakdown */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Order Status</CardTitle>
          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Pending</span>
              <span className="font-medium">{metrics.orders.pending}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Completed</span>
              <span className="font-medium text-green-600">{metrics.orders.completed}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Cancelled</span>
              <span className="font-medium text-red-600">{metrics.orders.cancelled}</span>
            </div>
          </div>
          {metrics.orders.total > 0 && (
            <div className="mt-3 pt-3 border-t">
              <p className="text-xs text-muted-foreground">
                Success rate: {((metrics.orders.completed / metrics.orders.total) * 100).toFixed(1)}%
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance Summary */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Performance</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Monthly Growth</span>
              {formatGrowth(metrics.revenue.growthRate)}
            </div>
            <div className="flex justify-between">
              <span>Chat Conversion</span>
              <span className="font-medium">{metrics.chats.conversionRate.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span>Repeat Customers</span>
              <span className="font-medium">
                {metrics.customers.total > 0 
                  ? ((metrics.customers.repeatCustomers / metrics.customers.total) * 100).toFixed(1)
                  : 0}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}