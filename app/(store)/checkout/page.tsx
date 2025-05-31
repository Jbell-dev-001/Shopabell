'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CreditCard, Smartphone, Truck, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useCartStore } from '@/lib/stores/cart-store'
import { useAuthStore } from '@/lib/stores/auth-store'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import Link from 'next/link'

const checkoutSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().min(10, 'Full address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  pincode: z.string().regex(/^\d{6}$/, 'Valid 6-digit pincode is required'),
  notes: z.string().optional()
})

type CheckoutFormData = z.infer<typeof checkoutSchema>

export default function CheckoutPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const { items, getTotalPrice, getCartBySeller, clearCart } = useCartStore()
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'cod'>('upi')
  const [isProcessing, setIsProcessing] = useState(false)
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
      email: user?.email || ''
    }
  })

  const totalPrice = getTotalPrice()
  const platformFee = totalPrice * 0.03
  const finalAmount = totalPrice + platformFee
  const cartBySeller = getCartBySeller()

  const generateOrderNumber = () => {
    return `ORD${Date.now().toString(36).toUpperCase()}`
  }

  const onSubmit = async (data: CheckoutFormData) => {
    if (!user) {
      toast.error('Please login to continue')
      router.push('/login')
      return
    }

    setIsProcessing(true)

    try {
      // Create buyer record if doesn't exist
      const { data: buyer } = await supabase
        .from('buyers')
        .select('id')
        .eq('id', user.id)
        .single()

      if (!buyer) {
        await supabase.from('buyers').insert({
          id: user.id,
          default_address: {
            address: data.address,
            city: data.city,
            state: data.state,
            pincode: data.pincode
          }
        })
      }

      // Create orders for each seller
      const orderPromises = Object.entries(cartBySeller).map(async ([sellerId, sellerItems]) => {
        const sellerTotal = sellerItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        const sellerPlatformFee = sellerTotal * 0.03

        // Create individual orders for each item
        const itemPromises = sellerItems.map(async (item) => {
          const orderData = {
            order_number: generateOrderNumber(),
            buyer_id: user.id,
            seller_id: sellerId,
            product_id: item.productId,
            quantity: item.quantity,
            unit_price: item.price,
            shipping_cost: 0,
            tax_amount: 0,
            platform_fee: (item.price * item.quantity * 0.03),
            total_amount: item.price * item.quantity,
            payment_method: paymentMethod,
            payment_status: paymentMethod === 'cod' ? 'pending' : 'completed',
            shipping_address: {
              name: data.name,
              phone: data.phone,
              address: data.address,
              city: data.city,
              state: data.state,
              pincode: data.pincode
            },
            order_status: 'pending',
            created_via: 'website',
            buyer_notes: data.notes || null
          }

          const { data: order, error } = await supabase
            .from('orders')
            .insert(orderData)
            .select()
            .single()

          if (error) throw error
          return order
        })

        return Promise.all(itemPromises)
      })

      const allOrders = await Promise.all(orderPromises)
      const flatOrders = allOrders.flat()

      // Simulate payment processing
      if (paymentMethod !== 'cod') {
        await simulatePayment(finalAmount, paymentMethod)
      }

      // Clear cart
      clearCart()

      toast.success('Order placed successfully!')
      router.push(`/order-success?orderId=${flatOrders[0].id}`)
    } catch (error) {
      console.error('Checkout error:', error)
      toast.error('Failed to place order. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const simulatePayment = async (amount: number, method: string) => {
    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // In production, this would integrate with actual payment gateways
    console.log(`Processing ${method} payment for ₹${amount}`)
    
    return {
      transactionId: `TXN${Date.now()}`,
      status: 'success'
    }
  }

  if (items.length === 0) {
    router.push('/cart')
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/cart" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Cart
      </Link>

      <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Delivery Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Delivery Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    {...register('name')}
                    placeholder="John Doe"
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    {...register('phone')}
                    placeholder="9876543210"
                  />
                  {errors.phone && (
                    <p className="text-sm text-red-600 mt-1">{errors.phone.message}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="email">Email (Optional)</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register('email')}
                    placeholder="john@example.com"
                  />
                  {errors.email && (
                    <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    {...register('address')}
                    placeholder="House/Flat No, Building Name, Street, Area"
                    rows={3}
                  />
                  {errors.address && (
                    <p className="text-sm text-red-600 mt-1">{errors.address.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    {...register('city')}
                    placeholder="Mumbai"
                  />
                  {errors.city && (
                    <p className="text-sm text-red-600 mt-1">{errors.city.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    {...register('state')}
                    placeholder="Maharashtra"
                  />
                  {errors.state && (
                    <p className="text-sm text-red-600 mt-1">{errors.state.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="pincode">Pincode</Label>
                  <Input
                    id="pincode"
                    {...register('pincode')}
                    placeholder="400001"
                  />
                  {errors.pincode && (
                    <p className="text-sm text-red-600 mt-1">{errors.pincode.message}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="notes">Order Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    {...register('notes')}
                    placeholder="Any special instructions for delivery"
                    rows={2}
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h2>
              
              <div className="space-y-3">
                <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="payment"
                    value="upi"
                    checked={paymentMethod === 'upi'}
                    onChange={() => setPaymentMethod('upi')}
                    className="mr-3"
                  />
                  <Smartphone className="w-5 h-5 mr-3 text-gray-600" />
                  <div className="flex-1">
                    <p className="font-medium">UPI Payment</p>
                    <p className="text-sm text-gray-600">Google Pay, PhonePe, Paytm, etc.</p>
                  </div>
                </label>

                <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="payment"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={() => setPaymentMethod('card')}
                    className="mr-3"
                  />
                  <CreditCard className="w-5 h-5 mr-3 text-gray-600" />
                  <div className="flex-1">
                    <p className="font-medium">Credit/Debit Card</p>
                    <p className="text-sm text-gray-600">All major cards accepted</p>
                  </div>
                </label>

                <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="mr-3"
                  />
                  <Truck className="w-5 h-5 mr-3 text-gray-600" />
                  <div className="flex-1">
                    <p className="font-medium">Cash on Delivery</p>
                    <p className="text-sm text-gray-600">Pay when you receive</p>
                  </div>
                </label>
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing...' : `Place Order - ₹${finalAmount.toFixed(2)}`}
            </Button>
          </form>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6 sticky top-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
            
            <div className="space-y-3 mb-6">
              <div className="max-h-60 overflow-y-auto space-y-2">
                {items.map(item => (
                  <div key={item.productId} className="flex justify-between text-sm">
                    <span className="text-gray-600">{item.name} x{item.quantity}</span>
                    <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              
              <div className="border-t pt-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span>₹{totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Platform Fee (3%)</span>
                  <span>₹{platformFee.toFixed(2)}</span>
                </div>
                {paymentMethod === 'cod' && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">COD Charges</span>
                    <span>₹40</span>
                  </div>
                )}
              </div>
              
              <div className="border-t pt-3">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>₹{(finalAmount + (paymentMethod === 'cod' ? 40 : 0)).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}