'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AnalyticsMetrics } from '@/lib/analytics/metrics'
import { Users, Phone } from 'lucide-react'

interface TopCustomersProps {
  customers: AnalyticsMetrics['customers']['topCustomers']
  isLoading?: boolean
}

export function TopCustomers({ customers, isLoading }: TopCustomersProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatPhone = (phone: string) => {
    // Format phone number to show only last 4 digits for privacy
    if (phone.length > 4) {
      return `****${phone.slice(-4)}`
    }
    return phone
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Customers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Top Customers
        </CardTitle>
      </CardHeader>
      <CardContent>
        {customers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No customer data available</p>
          </div>
        ) : (
          <div className="space-y-4">
            {customers.map((customer, index) => (
              <div key={customer.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-purple-100 text-purple-600 rounded-full font-medium text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {customer.name || 'Unknown Customer'}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <Phone className="w-3 h-3" />
                        {formatPhone(customer.phone)}
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {customer.totalOrders} orders
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    {formatCurrency(customer.totalSpent)}
                  </p>
                  <p className="text-sm text-gray-600">
                    {formatCurrency(customer.totalSpent / customer.totalOrders)} avg
                  </p>
                </div>
              </div>
            ))}
            
            {customers.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No customers yet</p>
                <p className="text-sm">Start selling to see your top customers here</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}