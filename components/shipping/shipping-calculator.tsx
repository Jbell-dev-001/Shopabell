'use client'

import { useState } from 'react'
import { Truck, Package, Clock, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { shippingService } from '@/lib/shipping/shipping-service'
import { ShippingRate, validatePincode } from '@/lib/shipping/rates'
import { toast } from 'sonner'

interface ShippingCalculatorProps {
  fromPincode: string
  packageWeight: number
  codAmount?: number
  onRateSelect?: (rate: ShippingRate) => void
  showSelectButton?: boolean
}

export function ShippingCalculator({ 
  fromPincode, 
  packageWeight, 
  codAmount,
  onRateSelect,
  showSelectButton = false 
}: ShippingCalculatorProps) {
  const [toPincode, setToPincode] = useState('')
  const [rates, setRates] = useState<ShippingRate[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedRate, setSelectedRate] = useState<ShippingRate | null>(null)

  const calculateRates = async () => {
    if (!validatePincode(toPincode)) {
      toast.error('Please enter a valid 6-digit pincode')
      return
    }

    setIsLoading(true)
    try {
      const calculatedRates = await shippingService.getShippingRates(
        fromPincode,
        toPincode,
        packageWeight,
        codAmount
      )
      setRates(calculatedRates)
      
      if (calculatedRates.length === 0) {
        toast.error('No shipping options available for this location')
      }
    } catch (error) {
      console.error('Error calculating shipping rates:', error)
      toast.error('Failed to calculate shipping rates')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectRate = (rate: ShippingRate) => {
    setSelectedRate(rate)
    if (onRateSelect) {
      onRateSelect(rate)
    }
  }

  const getCourierLogo = (courierId: string) => {
    // Return placeholder for now, in real app would have actual logos
    return '/placeholder.png'
  }

  const getServiceIcon = (serviceType: string) => {
    switch (serviceType) {
      case 'express':
        return '⚡'
      case 'surface':
        return '🚛'
      case 'economy':
        return '📦'
      case 'cod':
        return '💰'
      default:
        return '📮'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="w-5 h-5" />
          Shipping Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Input Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="from-pincode">From Pincode</Label>
            <Input
              id="from-pincode"
              value={fromPincode}
              disabled
              placeholder="Seller's pincode"
            />
          </div>
          <div>
            <Label htmlFor="to-pincode">To Pincode</Label>
            <Input
              id="to-pincode"
              value={toPincode}
              onChange={(e) => setToPincode(e.target.value)}
              placeholder="Delivery pincode"
              maxLength={6}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Package Weight</Label>
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">{packageWeight} kg</span>
            </div>
          </div>
          {codAmount && (
            <div>
              <Label>COD Amount</Label>
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">₹{codAmount}</span>
              </div>
            </div>
          )}
        </div>

        <Button 
          onClick={calculateRates} 
          disabled={isLoading || !toPincode}
          className="w-full"
        >
          {isLoading ? 'Calculating...' : 'Calculate Shipping Rates'}
        </Button>

        {/* Results Section */}
        {rates.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Available Shipping Options</h4>
            {rates.map((rate, index) => (
              <div
                key={`${rate.courier_id}-${rate.service_type}`}
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  selectedRate === rate 
                    ? 'border-indigo-500 bg-indigo-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleSelectRate(rate)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={getCourierLogo(rate.courier_id)}
                      alt={rate.courier_name}
                      className="w-10 h-10 rounded object-contain bg-gray-100 p-1"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h5 className="font-medium">{rate.courier_name}</h5>
                        <span className="text-lg">{getServiceIcon(rate.service_type)}</span>
                      </div>
                      <p className="text-sm text-gray-600 capitalize">
                        {rate.service_type} Service
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-lg font-bold">₹{rate.cost}</div>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Clock className="w-3 h-3" />
                      {rate.estimated_delivery_days} day{rate.estimated_delivery_days > 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
                
                <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                  {rate.cod_available && (
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      COD Available
                    </span>
                  )}
                  {rate.tracking_available && (
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      Tracking Available
                    </span>
                  )}
                </div>

                {showSelectButton && selectedRate === rate && (
                  <div className="mt-3">
                    <Button size="sm" className="w-full">
                      Selected ✓
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {rates.length === 0 && toPincode && !isLoading && (
          <div className="text-center py-6 text-gray-500">
            <Truck className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p>Enter delivery pincode to see shipping options</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}