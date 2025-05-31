import { createClient } from '@/lib/supabase/client'
import { 
  calculateShippingRates, 
  generateTrackingNumber, 
  getCourierById,
  ShippingAddress,
  ShippingRate 
} from './rates'

export interface ShippingLabel {
  id: string
  order_id: string
  tracking_number: string
  courier_id: string
  courier_name: string
  service_type: string
  from_address: ShippingAddress
  to_address: ShippingAddress
  package_weight: number
  shipping_cost: number
  cod_amount?: number
  label_url: string
  status: 'created' | 'picked_up' | 'in_transit' | 'delivered' | 'returned'
  created_at: string
}

export interface TrackingEvent {
  timestamp: string
  status: string
  location: string
  description: string
}

export interface TrackingInfo {
  tracking_number: string
  current_status: string
  estimated_delivery: string
  events: TrackingEvent[]
}

export class ShippingService {
  private supabase = createClient()
  
  async getShippingRates(
    fromPincode: string,
    toPincode: string,
    weight: number,
    codAmount?: number
  ): Promise<ShippingRate[]> {
    try {
      const rates = calculateShippingRates(fromPincode, toPincode, weight, codAmount)
      return rates
    } catch (error) {
      console.error('Error calculating shipping rates:', error)
      throw new Error('Failed to calculate shipping rates')
    }
  }
  
  async createShippingLabel(
    orderId: string,
    selectedRate: ShippingRate,
    fromAddress: ShippingAddress,
    toAddress: ShippingAddress,
    packageWeight: number,
    codAmount?: number
  ): Promise<ShippingLabel> {
    try {
      const trackingNumber = generateTrackingNumber(selectedRate.courier_id)
      const courier = getCourierById(selectedRate.courier_id)
      
      if (!courier) {
        throw new Error('Invalid courier selected')
      }
      
      // Create shipping label record
      const labelData = {
        order_id: orderId,
        tracking_number: trackingNumber,
        courier_id: selectedRate.courier_id,
        courier_name: selectedRate.courier_name,
        service_type: selectedRate.service_type,
        from_address: fromAddress,
        to_address: toAddress,
        package_weight: packageWeight,
        shipping_cost: selectedRate.cost,
        cod_amount: codAmount,
        label_url: this.generateLabelUrl(trackingNumber),
        status: 'created' as const,
        estimated_delivery_days: selectedRate.estimated_delivery_days
      }
      
      const { data, error } = await this.supabase
        .from('shipping_labels')
        .insert(labelData)
        .select()
        .single()
      
      if (error) throw error
      
      // Update order with shipping info
      await this.supabase
        .from('orders')
        .update({
          tracking_number: trackingNumber,
          shipping_status: 'label_created',
          shipping_cost: selectedRate.cost
        })
        .eq('id', orderId)
      
      return {
        ...data,
        created_at: data.created_at
      }
    } catch (error) {
      console.error('Error creating shipping label:', error)
      throw new Error('Failed to create shipping label')
    }
  }
  
  async trackShipment(trackingNumber: string): Promise<TrackingInfo> {
    try {
      // Get shipping label info
      const { data: label, error } = await this.supabase
        .from('shipping_labels')
        .select('*')
        .eq('tracking_number', trackingNumber)
        .single()
      
      if (error || !label) {
        throw new Error('Tracking number not found')
      }
      
      // Generate simulated tracking events
      const events = this.generateTrackingEvents(label)
      
      // Calculate estimated delivery
      const estimatedDelivery = this.calculateEstimatedDelivery(
        label.created_at,
        label.estimated_delivery_days
      )
      
      return {
        tracking_number: trackingNumber,
        current_status: label.status,
        estimated_delivery: estimatedDelivery,
        events
      }
    } catch (error) {
      console.error('Error tracking shipment:', error)
      throw new Error('Failed to track shipment')
    }
  }
  
  async updateShippingStatus(
    trackingNumber: string,
    status: ShippingLabel['status'],
    location?: string
  ): Promise<void> {
    try {
      await this.supabase
        .from('shipping_labels')
        .update({ status })
        .eq('tracking_number', trackingNumber)
      
      // Also update order status
      const orderStatus = this.mapShippingStatusToOrderStatus(status)
      if (orderStatus) {
        await this.supabase
          .from('orders')
          .update({ shipping_status: orderStatus })
          .eq('tracking_number', trackingNumber)
      }
    } catch (error) {
      console.error('Error updating shipping status:', error)
      throw new Error('Failed to update shipping status')
    }
  }
  
  async getShippingHistory(sellerId: string): Promise<ShippingLabel[]> {
    try {
      const { data, error } = await this.supabase
        .from('shipping_labels')
        .select(`
          *,
          orders!inner(seller_id)
        `)
        .eq('orders.seller_id', sellerId)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      return data || []
    } catch (error) {
      console.error('Error fetching shipping history:', error)
      throw new Error('Failed to fetch shipping history')
    }
  }
  
  private generateLabelUrl(trackingNumber: string): string {
    // In a real implementation, this would generate a PDF label
    return `/api/shipping/labels/${trackingNumber}.pdf`
  }
  
  private generateTrackingEvents(label: ShippingLabel): TrackingEvent[] {
    const events: TrackingEvent[] = []
    const createdDate = new Date(label.created_at)
    
    // Always have label created event
    events.push({
      timestamp: createdDate.toISOString(),
      status: 'Label Created',
      location: label.from_address.city,
      description: 'Shipping label has been created'
    })
    
    // Simulate additional events based on current status
    const now = new Date()
    const hoursElapsed = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60)
    
    if (hoursElapsed > 12 || label.status !== 'created') {
      events.push({
        timestamp: new Date(createdDate.getTime() + 12 * 60 * 60 * 1000).toISOString(),
        status: 'Picked Up',
        location: label.from_address.city,
        description: 'Package has been picked up by courier'
      })
    }
    
    if (hoursElapsed > 24 || ['in_transit', 'delivered'].includes(label.status)) {
      events.push({
        timestamp: new Date(createdDate.getTime() + 24 * 60 * 60 * 1000).toISOString(),
        status: 'In Transit',
        location: `${label.from_address.state} Hub`,
        description: 'Package is in transit'
      })
    }
    
    if (hoursElapsed > 48 || label.status === 'delivered') {
      events.push({
        timestamp: new Date(createdDate.getTime() + 48 * 60 * 60 * 1000).toISOString(),
        status: 'Out for Delivery',
        location: label.to_address.city,
        description: 'Package is out for delivery'
      })
    }
    
    if (label.status === 'delivered') {
      events.push({
        timestamp: new Date(createdDate.getTime() + 72 * 60 * 60 * 1000).toISOString(),
        status: 'Delivered',
        location: label.to_address.city,
        description: 'Package has been delivered successfully'
      })
    }
    
    return events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
  }
  
  private calculateEstimatedDelivery(createdAt: string, deliveryDays: number): string {
    const created = new Date(createdAt)
    const estimated = new Date(created.getTime() + deliveryDays * 24 * 60 * 60 * 1000)
    return estimated.toISOString()
  }
  
  private mapShippingStatusToOrderStatus(status: ShippingLabel['status']): string | null {
    switch (status) {
      case 'created':
        return 'label_created'
      case 'picked_up':
        return 'picked_up'
      case 'in_transit':
        return 'in_transit'
      case 'delivered':
        return 'delivered'
      case 'returned':
        return 'returned'
      default:
        return null
    }
  }
}

export const shippingService = new ShippingService()