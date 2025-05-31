'use client'

import { useState, useEffect } from 'react'
import { Package, MapPin, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { shippingService, type TrackingInfo } from '@/lib/shipping/shipping-service'
import { format } from 'date-fns'
import { toast } from 'sonner'

interface TrackingInfoProps {
  trackingNumber?: string
  showInput?: boolean
}

export function TrackingInfo({ trackingNumber: initialTrackingNumber, showInput = true }: TrackingInfoProps) {
  const [trackingNumber, setTrackingNumber] = useState(initialTrackingNumber || '')
  const [trackingInfo, setTrackingInfo] = useState<TrackingInfo | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (initialTrackingNumber) {
      trackShipment(initialTrackingNumber)
    }
  }, [initialTrackingNumber])

  const trackShipment = async (trackingNum?: string) => {
    const numToTrack = trackingNum || trackingNumber
    if (!numToTrack) {
      toast.error('Please enter a tracking number')
      return
    }

    setIsLoading(true)
    try {
      const info = await shippingService.trackShipment(numToTrack)
      setTrackingInfo(info)
    } catch (error) {
      console.error('Error tracking shipment:', error)
      toast.error('Failed to track shipment. Please check tracking number.')
      setTrackingInfo(null)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'out for delivery':
      case 'in transit':
        return <Package className="w-5 h-5 text-blue-500" />
      case 'picked up':
        return <Package className="w-5 h-5 text-yellow-500" />
      case 'label created':
        return <AlertCircle className="w-5 h-5 text-gray-500" />
      default:
        return <Package className="w-5 h-5 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'text-green-600 bg-green-50'
      case 'out for delivery':
      case 'in transit':
        return 'text-blue-600 bg-blue-50'
      case 'picked up':
        return 'text-yellow-600 bg-yellow-50'
      case 'label created':
        return 'text-gray-600 bg-gray-50'
      default:
        return 'text-gray-500 bg-gray-50'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="w-5 h-5" />
          Track Your Shipment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {showInput && (
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="tracking-number">Tracking Number</Label>
              <Input
                id="tracking-number"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value.toUpperCase())}
                placeholder="Enter tracking number"
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={() => trackShipment()}
                disabled={isLoading || !trackingNumber}
              >
                {isLoading ? 'Tracking...' : 'Track'}
              </Button>
            </div>
          </div>
        )}

        {trackingInfo && (
          <div className="space-y-4">
            {/* Status Header */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getStatusIcon(trackingInfo.current_status)}
                  <span className="font-medium">Tracking: {trackingInfo.tracking_number}</span>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(trackingInfo.current_status)}`}>
                  {trackingInfo.current_status}
                </span>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>Estimated Delivery: {format(new Date(trackingInfo.estimated_delivery), 'MMM dd, yyyy')}</span>
                </div>
              </div>
            </div>

            {/* Tracking Timeline */}
            <div>
              <h4 className="font-medium mb-3">Tracking History</h4>
              <div className="space-y-3">
                {trackingInfo.events.map((event, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full ${
                        index === 0 ? 'bg-indigo-600' : 'bg-gray-300'
                      }`}></div>
                      {index < trackingInfo.events.length - 1 && (
                        <div className="w-0.5 h-12 bg-gray-200 mt-1"></div>
                      )}
                    </div>
                    
                    <div className="flex-1 pb-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h5 className="font-medium text-gray-900">{event.status}</h5>
                          <p className="text-sm text-gray-600">{event.description}</p>
                        </div>
                        <div className="text-right text-sm text-gray-500">
                          <div>{format(new Date(event.timestamp), 'MMM dd')}</div>
                          <div>{format(new Date(event.timestamp), 'HH:mm')}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
                        <MapPin className="w-3 h-3" />
                        <span>{event.location}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h5 className="font-medium mb-2">Need Help?</h5>
              <p className="text-sm text-gray-600 mb-2">
                If you have any questions about your shipment, please contact our support team.
              </p>
              <Button variant="outline" size="sm">
                Contact Support
              </Button>
            </div>
          </div>
        )}

        {!trackingInfo && !isLoading && trackingNumber && (
          <div className="text-center py-6 text-gray-500">
            <Package className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p>No tracking information found</p>
            <p className="text-sm">Please check your tracking number and try again</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}