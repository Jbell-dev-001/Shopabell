'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SalesData } from '@/lib/analytics/metrics'
import { format, parseISO } from 'date-fns'

interface SalesChartProps {
  salesData: SalesData[]
  isLoading?: boolean
  onPeriodChange?: (days: number) => void
}

export function SalesChart({ salesData, isLoading, onPeriodChange }: SalesChartProps) {
  const [selectedPeriod, setSelectedPeriod] = useState(30)
  const [viewMode, setViewMode] = useState<'revenue' | 'orders'>('revenue')

  const periods = [
    { label: '7 Days', value: 7 },
    { label: '30 Days', value: 30 },
    { label: '90 Days', value: 90 }
  ]

  const handlePeriodChange = (days: number) => {
    setSelectedPeriod(days)
    if (onPeriodChange) {
      onPeriodChange(days)
    }
  }

  const maxValue = Math.max(...salesData.map(d => 
    viewMode === 'revenue' ? d.revenue : d.orders
  ))

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sales Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Sales Overview</CardTitle>
          <div className="flex gap-2">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('revenue')}
                className={`px-3 py-1 text-sm rounded ${
                  viewMode === 'revenue' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600'
                }`}
              >
                Revenue
              </button>
              <button
                onClick={() => setViewMode('orders')}
                className={`px-3 py-1 text-sm rounded ${
                  viewMode === 'orders' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600'
                }`}
              >
                Orders
              </button>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {periods.map(period => (
            <Button
              key={period.value}
              size="sm"
              variant={selectedPeriod === period.value ? 'default' : 'outline'}
              onClick={() => handlePeriodChange(period.value)}
            >
              {period.label}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {salesData.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No sales data available</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Summary */}
            <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-lg font-bold">
                  {formatCurrency(salesData.reduce((sum, d) => sum + d.revenue, 0))}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-lg font-bold">
                  {salesData.reduce((sum, d) => sum + d.orders, 0)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Avg Order Value</p>
                <p className="text-lg font-bold">
                  {formatCurrency(
                    salesData.reduce((sum, d) => sum + d.revenue, 0) /
                    Math.max(salesData.reduce((sum, d) => sum + d.orders, 0), 1)
                  )}
                </p>
              </div>
            </div>

            {/* Chart */}
            <div className="h-64 flex items-end justify-between gap-1 p-4 border rounded-lg bg-white">
              {salesData.map((data, index) => {
                const value = viewMode === 'revenue' ? data.revenue : data.orders
                const height = maxValue > 0 ? (value / maxValue) * 100 : 0
                const date = parseISO(data.date)
                
                return (
                  <div
                    key={data.date}
                    className="flex-1 flex flex-col items-center group relative"
                  >
                    <div className="w-full flex justify-center">
                      <div
                        className="w-full max-w-8 bg-indigo-500 rounded-t hover:bg-indigo-600 transition-colors cursor-pointer"
                        style={{ height: `${height}%`, minHeight: value > 0 ? '2px' : '0px' }}
                      />
                    </div>
                    
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs rounded py-1 px-2 pointer-events-none z-10">
                      <div className="text-center">
                        <p>{format(date, 'MMM dd')}</p>
                        <p>
                          {viewMode === 'revenue' 
                            ? formatCurrency(data.revenue)
                            : `${data.orders} orders`
                          }
                        </p>
                      </div>
                    </div>
                    
                    {/* Date label */}
                    {(index % Math.ceil(salesData.length / 6) === 0) && (
                      <p className="text-xs text-gray-500 mt-2 transform -rotate-45 origin-top-left">
                        {format(date, 'MMM dd')}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-indigo-500 rounded"></div>
                <span>{viewMode === 'revenue' ? 'Revenue (₹)' : 'Orders'}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}