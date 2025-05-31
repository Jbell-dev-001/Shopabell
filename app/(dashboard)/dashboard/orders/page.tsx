'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/lib/stores/auth-store'
import { createClient } from '@/lib/supabase/client'
import { Package, Truck, CheckCircle, XCircle, Clock, Eye, Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { format } from 'date-fns'

interface Order {
  id: string
  order_number: string
  created_at: string
  buyer_id: string
  product_id: string
  quantity: number
  total_amount: number
  order_status: string
  payment_status: string
  shipping_address: any
  tracking_number?: string
  shipping_status?: string
  shipping_cost?: number
  buyer?: {
    name: string
    phone: string
  }
  product?: {
    name: string
    images: any
  }
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-indigo-100 text-indigo-800',
  packed: 'bg-purple-100 text-purple-800',
  shipped: 'bg-cyan-100 text-cyan-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  returned: 'bg-gray-100 text-gray-800'
}

const statusIcons = {
  pending: Clock,
  confirmed: CheckCircle,
  processing: Package,
  packed: Package,
  shipped: Truck,
  delivered: CheckCircle,
  cancelled: XCircle,
  returned: XCircle
}

export default function OrdersPage() {
  const { user } = useAuthStore()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('')
  const supabase = createClient()

  useEffect(() => {
    if (user?.id) {
      fetchOrders()
    }
  }, [user, filterStatus])

  const fetchOrders = async () => {
    try {
      let query = supabase
        .from('orders')
        .select(`
          *,
          buyer:buyers!inner(
            id,
            users!inner(name, phone)
          ),
          product:products!inner(
            name,
            images
          )
        `)
        .eq('seller_id', user?.id)
        .order('created_at', { ascending: false })

      if (filterStatus) {
        query = query.eq('order_status', filterStatus)
      }

      const { data, error } = await query

      if (error) throw error

      // Transform nested data
      const transformedOrders = (data || []).map(order => ({
        ...order,
        buyer: {
          name: order.buyer?.users?.name || 'Unknown',
          phone: order.buyer?.users?.phone || ''
        }
      }))

      setOrders(transformedOrders)
    } catch (error) {
      console.error('Error fetching orders:', error)
      toast.error('Failed to load orders')
    } finally {
      setIsLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ order_status: newStatus })
        .eq('id', orderId)
        .eq('seller_id', user?.id)

      if (error) throw error

      setOrders(prev => 
        prev.map(order => 
          order.id === orderId ? { ...order, order_status: newStatus } : order
        )
      )

      toast.success('Order status updated')
    } catch (error) {
      console.error('Error updating order:', error)
      toast.error('Failed to update order')
    }
  }

  const getNextStatus = (currentStatus: string): string | null => {
    const statusFlow = {
      pending: 'confirmed',
      confirmed: 'processing',
      processing: 'packed',
      packed: 'shipped',
      shipped: 'delivered'
    }
    return statusFlow[currentStatus as keyof typeof statusFlow] || null
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading orders...</div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
        <p className="text-gray-600 mt-2">Manage your customer orders</p>
      </div>

      {/* Status Filter */}
      <div className="mb-6 flex gap-2 flex-wrap">
        <button
          onClick={() => setFilterStatus('')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            filterStatus === ''
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All Orders ({orders.length})
        </button>
        {Object.keys(statusColors).map(status => {
          const count = orders.filter(o => o.order_status === status).length
          if (count === 0 && filterStatus !== status) return null
          
          return (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors capitalize ${
                filterStatus === status
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status} ({count})
            </button>
          )
        })}
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg">
          <p className="text-gray-500">
            {filterStatus ? `No ${filterStatus} orders` : 'No orders yet'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => {
            const StatusIcon = statusIcons[order.order_status as keyof typeof statusIcons] || Clock
            const nextStatus = getNextStatus(order.order_status)
            const imageUrl = Array.isArray(order.product?.images) && order.product.images.length > 0
              ? order.product.images[0]
              : '/placeholder.png'

            return (
              <div key={order.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Order #{order.order_number}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {format(new Date(order.created_at), 'PPp')}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium inline-flex items-center gap-1 ${
                    statusColors[order.order_status as keyof typeof statusColors]
                  }`}>
                    <StatusIcon className="w-4 h-4" />
                    {order.order_status}
                  </span>
                </div>

                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={imageUrl}
                    alt={order.product?.name}
                    className="w-20 h-20 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{order.product?.name}</h4>
                    <p className="text-sm text-gray-600">Quantity: {order.quantity}</p>
                    <p className="text-lg font-semibold text-gray-900 mt-1">
                      ₹{order.total_amount}
                    </p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Customer</p>
                      <p className="font-medium">{order.buyer?.name}</p>
                      <p className="text-sm text-gray-600">{order.buyer?.phone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Shipping Address</p>
                      <p className="text-sm">
                        {order.shipping_address?.address}, {order.shipping_address?.city}
                      </p>
                      <p className="text-sm">
                        {order.shipping_address?.state} - {order.shipping_address?.pincode}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      {order.order_status === 'packed' && !order.tracking_number && (
                        <Button
                          size="sm"
                          onClick={() => window.open(`/dashboard/shipping?create_label=${order.id}`, '_blank')}
                        >
                          <Tag className="w-4 h-4 mr-1" />
                          Create Shipping Label
                        </Button>
                      )}
                      {order.tracking_number && (
                        <div className="text-sm">
                          <span className="text-gray-600">Tracking: </span>
                          <span className="font-mono">{order.tracking_number}</span>
                        </div>
                      )}
                      {nextStatus && order.order_status !== 'delivered' && order.order_status !== 'cancelled' && (
                        <Button
                          size="sm"
                          onClick={() => updateOrderStatus(order.id, nextStatus)}
                        >
                          Mark as {nextStatus}
                        </Button>
                      )}
                      {order.order_status !== 'cancelled' && order.order_status !== 'delivered' && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => updateOrderStatus(order.id, 'cancelled')}
                        >
                          Cancel Order
                        </Button>
                      )}
                    </div>
                    <Button size="sm" variant="outline">
                      <Eye className="w-4 h-4 mr-1" />
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}