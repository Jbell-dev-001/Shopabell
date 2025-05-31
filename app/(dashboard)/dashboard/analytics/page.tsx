'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/lib/stores/auth-store'
import { analyticsService, AnalyticsMetrics, SalesData } from '@/lib/analytics/metrics'
import { MetricsCards } from '@/components/analytics/metrics-cards'
import { SalesChart } from '@/components/analytics/sales-chart'
import { TopProducts } from '@/components/analytics/top-products'
import { TopCustomers } from '@/components/analytics/top-customers'
import { BarChart3, Download, Calendar, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

export default function AnalyticsPage() {
  const { user } = useAuthStore()
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null)
  const [salesData, setSalesData] = useState<SalesData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [salesPeriod, setSalesPeriod] = useState(30)

  useEffect(() => {
    if (user?.id) {
      loadAnalytics()
    }
  }, [user])

  const loadAnalytics = async () => {
    if (!user?.id) return

    try {
      setIsLoading(true)
      
      // Load metrics and sales data in parallel
      const [metricsData, salesDataResponse] = await Promise.all([
        analyticsService.getMetrics(user.id),
        analyticsService.getSalesData(user.id, salesPeriod)
      ])

      setMetrics(metricsData)
      setSalesData(salesDataResponse)
    } catch (error) {
      console.error('Error loading analytics:', error)
      toast.error('Failed to load analytics data')
    } finally {
      setIsLoading(false)
    }
  }

  const refreshAnalytics = async () => {
    if (!user?.id) return

    try {
      setIsRefreshing(true)
      await loadAnalytics()
      toast.success('Analytics data refreshed')
    } catch (error) {
      console.error('Error refreshing analytics:', error)
      toast.error('Failed to refresh analytics')
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleSalesPeriodChange = async (days: number) => {
    if (!user?.id) return
    
    setSalesPeriod(days)
    try {
      const newSalesData = await analyticsService.getSalesData(user.id, days)
      setSalesData(newSalesData)
    } catch (error) {
      console.error('Error loading sales data:', error)
      toast.error('Failed to load sales data')
    }
  }

  const exportData = async () => {
    try {
      // In a real implementation, this would generate and download a CSV/Excel file
      const csvData = [
        ['Date', 'Revenue', 'Orders'],
        ...salesData.map(d => [d.date, d.revenue, d.orders])
      ].map(row => row.join(',')).join('\n')

      const blob = new Blob([csvData], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `analytics-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      
      toast.success('Analytics data exported successfully')
    } catch (error) {
      console.error('Error exporting data:', error)
      toast.error('Failed to export data')
    }
  }

  if (isLoading && !metrics) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        </div>
        <MetricsCards metrics={{} as AnalyticsMetrics} isLoading={true} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SalesChart salesData={[]} isLoading={true} />
          <TopProducts products={[]} isLoading={true} />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-2">Track your business performance and insights</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={refreshAnalytics}
            disabled={isRefreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Button
            variant="outline"
            onClick={exportData}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      {metrics && (
        <MetricsCards metrics={metrics} isLoading={isLoading} />
      )}

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <div className="lg:col-span-2">
          <SalesChart 
            salesData={salesData} 
            isLoading={isLoading}
            onPeriodChange={handleSalesPeriodChange}
          />
        </div>

        {/* Top Products */}
        {metrics && (
          <TopProducts 
            products={metrics.products.topSelling} 
            isLoading={isLoading} 
          />
        )}

        {/* Top Customers */}
        {metrics && (
          <TopCustomers 
            customers={metrics.customers.topCustomers} 
            isLoading={isLoading} 
          />
        )}
      </div>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Chat Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Chat Performance</CardTitle>
          </CardHeader>
          <CardContent>
            {metrics && (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Conversations</span>
                  <span className="font-medium">{metrics.chats.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Active Chats</span>
                  <span className="font-medium">{metrics.chats.active}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Conversion Rate</span>
                  <span className="font-medium text-green-600">
                    {metrics.chats.conversionRate.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg Response Time</span>
                  <span className="font-medium">{metrics.chats.averageResponseTime}m</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Live Selling */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Live Selling</CardTitle>
          </CardHeader>
          <CardContent>
            {metrics && (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Sessions</span>
                  <span className="font-medium">{metrics.livestream.totalSessions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Products Captured</span>
                  <span className="font-medium">{metrics.livestream.totalProductsCaptured}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Revenue Generated</span>
                  <span className="font-medium text-green-600">
                    ₹{metrics.livestream.totalRevenue.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg Duration</span>
                  <span className="font-medium">
                    {Math.round(metrics.livestream.averageSessionDuration)}m
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Business Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Business Insights</CardTitle>
          </CardHeader>
          <CardContent>
            {metrics && (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Success Rate</span>
                  <span className="font-medium text-green-600">
                    {metrics.orders.total > 0 
                      ? ((metrics.orders.completed / metrics.orders.total) * 100).toFixed(1)
                      : 0}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Customer Retention</span>
                  <span className="font-medium">
                    {metrics.customers.total > 0 
                      ? ((metrics.customers.repeatCustomers / metrics.customers.total) * 100).toFixed(1)
                      : 0}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Growth Rate</span>
                  <span className={`font-medium ${
                    metrics.revenue.growthRate >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {metrics.revenue.growthRate >= 0 ? '+' : ''}
                    {metrics.revenue.growthRate.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Products Active</span>
                  <span className="font-medium">
                    {metrics.products.total > 0 
                      ? ((metrics.products.active / metrics.products.total) * 100).toFixed(0)
                      : 0}%
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Getting Started Guide */}
      {metrics && metrics.orders.total === 0 && (
        <Card className="border-indigo-200 bg-indigo-50">
          <CardHeader>
            <CardTitle className="text-indigo-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Start Growing Your Business
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-indigo-800">
              <p>• Add products to your catalog to start selling</p>
              <p>• Share your store link with customers</p>
              <p>• Use live selling to capture products from your streams</p>
              <p>• Engage with customers through chat to increase conversions</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}