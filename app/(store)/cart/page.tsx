'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/lib/stores/cart-store'
import { useAuthStore } from '@/lib/stores/auth-store'
import { toast } from 'sonner'

export default function CartPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const { items, updateQuantity, removeItem, getTotalPrice, getCartBySeller } = useCartStore()
  const [isProcessing, setIsProcessing] = useState(false)

  const cartBySeller = getCartBySeller()
  const totalPrice = getTotalPrice()

  const handleCheckout = () => {
    if (!user) {
      toast.info('Please login to continue')
      router.push('/login?from=/cart')
      return
    }

    if (items.length === 0) {
      toast.error('Your cart is empty')
      return
    }

    router.push('/checkout')
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center py-16">
          <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-8">
            Looks like you haven't added anything to your cart yet
          </p>
          <Link href="/explore">
            <Button size="lg">
              Explore Stores
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {Object.entries(cartBySeller).map(([sellerId, sellerItems]) => {
            const sellerTotal = sellerItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
            
            return (
              <div key={sellerId} className="bg-white rounded-lg shadow p-6">
                <h3 className="font-semibold text-gray-900 mb-4">
                  Seller: {sellerId.slice(0, 8)}...
                </h3>
                
                <div className="space-y-4">
                  {sellerItems.map((item) => (
                    <div key={item.productId} className="flex items-start gap-4">
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={80}
                        height={80}
                        className="rounded-lg object-cover"
                      />
                      
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{item.name}</h4>
                        <p className="text-lg font-semibold text-gray-900 mt-1">
                          ₹{item.price}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="p-1 rounded-md hover:bg-gray-100 disabled:opacity-50"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          disabled={item.quantity >= item.maxQuantity}
                          className="p-1 rounded-md hover:bg-gray-100 disabled:opacity-50"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 pt-4 border-t text-right">
                  <p className="text-sm text-gray-600">
                    Subtotal ({sellerItems.length} items)
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    ₹{sellerTotal.toFixed(2)}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6 sticky top-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span>₹{totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping</span>
                <span className="text-green-600">Free</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Platform Fee</span>
                <span>₹{(totalPrice * 0.03).toFixed(2)}</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>₹{(totalPrice * 1.03).toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            <Button
              onClick={handleCheckout}
              disabled={isProcessing}
              className="w-full"
              size="lg"
            >
              {isProcessing ? 'Processing...' : 'Proceed to Checkout'}
            </Button>
            
            <p className="text-xs text-gray-500 text-center mt-4">
              By proceeding, you agree to our Terms and Conditions
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}