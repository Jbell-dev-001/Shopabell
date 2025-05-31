'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/lib/stores/auth-store'
import { shippingService } from '@/lib/shipping/shipping-service'
import { ShippingLabel } from '@/lib/shipping/shipping-service'
import { Truck, Package, Download, Eye, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { TrackingInfo } from '@/components/shipping/tracking-info'
import { format } from 'date-fns'
import { toast } from 'sonner'

export default function ShippingPage() {
  const { user } = useAuthStore()
  const [labels, setLabels] = useState<ShippingLabel[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedLabel, setSelectedLabel] = useState<ShippingLabel | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (user?.id) {
      fetchShippingHistory()
    }
  }, [user])

  const fetchShippingHistory = async () => {
    try {
      const history = await shippingService.getShippingHistory(user?.id || '')
      setLabels(history)
    } catch (error) {
      console.error('Error fetching shipping history:', error)
      toast.error('Failed to load shipping history')
    } finally {
      setIsLoading(false)
    }
  }

  const downloadLabel = async (labelUrl: string, trackingNumber: string) => {
    try {
      // In a real implementation, this would download the actual PDF
      toast.success('Label download would start here')
      console.log('Download label:', labelUrl)
    } catch (error) {
      toast.error('Failed to download label')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'in_transit':
        return 'bg-blue-100 text-blue-800'
      case 'picked_up':
        return 'bg-yellow-100 text-yellow-800'
      case 'created':
        return 'bg-gray-100 text-gray-800'
      case 'returned':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredLabels = labels.filter(label =>
    label.tracking_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    label.courier_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    label.to_address.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading shipping data...</div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Shipping Management</h1>
        <p className="text-gray-600 mt-2">Manage shipping labels and track shipments</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Shipments</p>
                <p className="text-2xl font-bold text-gray-900">{labels.length}</p>
              </div>
              <Package className="w-8 h-8 text-indigo-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Transit</p>
                <p className="text-2xl font-bold text-gray-900">
                  {labels.filter(l => l.status === 'in_transit').length}
                </p>
              </div>
              <Truck className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Delivered</p>
                <p className="text-2xl font-bold text-gray-900">
                  {labels.filter(l => l.status === 'delivered').length}
                </p>
              </div>
              <Package className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Shipping Cost</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₹{labels.reduce((sum, l) => sum + l.shipping_cost, 0).toLocaleString()}
                </p>
              </div>
              <Truck className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Shipping Labels List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Shipping Labels</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by tracking number, courier, or customer..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent>
              {filteredLabels.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  {labels.length === 0 ? (
                    <div>
                      <p className="mb-2">No shipping labels yet</p>
                      <p className="text-sm">Labels will appear here when you fulfill orders</p>
                    </div>
                  ) : (
                    <p>No labels match your search</p>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredLabels.map((label) => (
                    <div
                      key={label.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        selectedLabel?.id === label.id
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedLabel(label)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-medium text-gray-900">
                              {label.tracking_number}
                            </h4>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(label.status)}`}>
                              {label.status.replace('_', ' ')}
                            </span>
                          </div>
                          
                          <div className="space-y-1 text-sm text-gray-600">
                            <p><strong>To:</strong> {label.to_address.name}</p>
                            <p><strong>Courier:</strong> {label.courier_name} ({label.service_type})</p>
                            <p><strong>Weight:</strong> {label.package_weight} kg</p>
                            <p><strong>Cost:</strong> ₹{label.shipping_cost}</p>
                            {label.cod_amount && (
                              <p><strong>COD:</strong> ₹{label.cod_amount}</p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 ml-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation()
                              downloadLabel(label.label_url, label.tracking_number)
                            }}
                          >
                            <Download className="w-3 h-3 mr-1" />
                            Label
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedLabel(label)
                            }}
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            Track
                          </Button>
                        </div>
                      </div>
                      
                      <div className="mt-2 text-xs text-gray-500">
                        Created: {format(new Date(label.created_at), 'MMM dd, yyyy HH:mm')}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Tracking Details */}
        <div>
          {selectedLabel ? (
            <TrackingInfo 
              trackingNumber={selectedLabel.tracking_number}
              showInput={false}
            />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Track Shipment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <Truck className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Select a shipment to view tracking details</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}