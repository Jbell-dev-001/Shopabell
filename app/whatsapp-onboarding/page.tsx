'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Phone, Shield, Building, Store, CheckCircle, MessageCircle } from 'lucide-react'

interface OnboardingStep {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  completed: boolean
}

export default function WhatsAppOnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [sessionId, setSessionId] = useState('')
  const [loading, setLoading] = useState(false)
  
  // Form data
  const [phoneNumber, setPhoneNumber] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [businessDetails, setBusinessDetails] = useState({
    businessName: '',
    businessType: 'fashion',
    ownerName: '',
    businessAddress: '',
    gstNumber: '',
    bankAccountNumber: '',
    ifscCode: '',
    panNumber: ''
  })
  const [storeDetails, setStoreDetails] = useState({
    storeName: '',
    storeDescription: ''
  })

  const steps: OnboardingStep[] = [
    {
      id: 'phone',
      title: 'Phone Verification',
      description: 'Verify your WhatsApp number',
      icon: <Phone className="w-5 h-5" />,
      completed: currentStep > 0
    },
    {
      id: 'verify',
      title: 'Enter Code',
      description: 'Enter the code sent to WhatsApp',
      icon: <Shield className="w-5 h-5" />,
      completed: currentStep > 1
    },
    {
      id: 'business',
      title: 'Business Details',
      description: 'Tell us about your business',
      icon: <Building className="w-5 h-5" />,
      completed: currentStep > 2
    },
    {
      id: 'store',
      title: 'Store Setup',
      description: 'Customize your online store',
      icon: <Store className="w-5 h-5" />,
      completed: currentStep > 3
    },
    {
      id: 'complete',
      title: 'Welcome!',
      description: 'Your store is ready',
      icon: <CheckCircle className="w-5 h-5" />,
      completed: currentStep > 4
    }
  ]

  const startOnboarding = async () => {
    if (!phoneNumber || phoneNumber.length !== 10) {
      toast.error('Please enter a valid 10-digit phone number')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/whatsapp/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: `+91${phoneNumber}` })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to start onboarding')
      }

      setSessionId(data.sessionId)
      setCurrentStep(1)
      toast.success('Verification code sent to your WhatsApp!')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const verifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast.error('Please enter a valid 6-digit code')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/whatsapp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, code: verificationCode })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Verification failed')
      }

      setCurrentStep(2)
      toast.success('Phone number verified!')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Verification failed')
    } finally {
      setLoading(false)
    }
  }

  const saveBusinessDetails = async () => {
    // Validate required fields
    const required = ['businessName', 'businessType', 'ownerName', 'businessAddress', 'bankAccountNumber', 'ifscCode', 'panNumber']
    for (const field of required) {
      if (!businessDetails[field as keyof typeof businessDetails]) {
        toast.error(`${field.replace(/([A-Z])/g, ' $1').toLowerCase()} is required`)
        return
      }
    }

    setLoading(true)
    try {
      const response = await fetch('/api/whatsapp/business-details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, businessDetails })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save business details')
      }

      setCurrentStep(3)
      setStoreDetails({ 
        storeName: businessDetails.businessName, 
        storeDescription: `${businessDetails.businessType} products by ${businessDetails.ownerName}` 
      })
      toast.success('Business details saved!')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save details')
    } finally {
      setLoading(false)
    }
  }

  const completeOnboarding = async () => {
    if (!storeDetails.storeName) {
      toast.error('Store name is required')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/whatsapp/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, storeDetails })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to complete onboarding')
      }

      setCurrentStep(4)
      toast.success('Welcome to ShopAbell! Your store is ready!')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to complete onboarding')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <MessageCircle className="w-8 h-8 text-indigo-600" />
            <h1 className="text-3xl font-bold text-gray-900">ShopAbell WhatsApp Onboarding</h1>
          </div>
          <p className="text-gray-600">
            Start selling on WhatsApp in just a few simple steps
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8 px-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`
                flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors
                ${step.completed ? 'bg-green-500 border-green-500 text-white' : 
                  index === currentStep ? 'bg-indigo-500 border-indigo-500 text-white' : 
                  'bg-white border-gray-300 text-gray-400'}
              `}>
                {step.completed ? <CheckCircle className="w-5 h-5" /> : step.icon}
              </div>
              {index < steps.length - 1 && (
                <div className={`
                  w-16 h-0.5 mx-2 transition-colors
                  ${step.completed ? 'bg-green-500' : 'bg-gray-300'}
                `} />
              )}
            </div>
          ))}
        </div>

        {/* Current Step Content */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {steps[currentStep]?.icon}
              {steps[currentStep]?.title}
            </CardTitle>
            <CardDescription>
              {steps[currentStep]?.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {currentStep === 0 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="phone">WhatsApp Phone Number</Label>
                  <div className="flex">
                    <div className="flex items-center px-3 py-2 border border-r-0 rounded-l-md bg-gray-50">
                      <span className="text-sm text-gray-600">+91</span>
                    </div>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="9876543210"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      className="rounded-l-none"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    We'll send a verification code to this WhatsApp number
                  </p>
                </div>
                <Button onClick={startOnboarding} disabled={loading} className="w-full">
                  {loading ? 'Sending Code...' : 'Send Verification Code'}
                </Button>
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="code">Verification Code</Label>
                  <Input
                    id="code"
                    type="text"
                    placeholder="123456"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="text-center text-2xl tracking-widest"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Check your WhatsApp for the 6-digit verification code
                  </p>
                </div>
                <Button onClick={verifyCode} disabled={loading} className="w-full">
                  {loading ? 'Verifying...' : 'Verify Code'}
                </Button>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="businessName">Business Name</Label>
                    <Input
                      id="businessName"
                      value={businessDetails.businessName}
                      onChange={(e) => setBusinessDetails({...businessDetails, businessName: e.target.value})}
                      placeholder="Fashions by Priya"
                    />
                  </div>
                  <div>
                    <Label htmlFor="businessType">Business Type</Label>
                    <select
                      id="businessType"
                      value={businessDetails.businessType}
                      onChange={(e) => setBusinessDetails({...businessDetails, businessType: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="fashion">Fashion & Clothing</option>
                      <option value="jewelry">Jewelry</option>
                      <option value="electronics">Electronics</option>
                      <option value="home">Home & Garden</option>
                      <option value="beauty">Beauty & Cosmetics</option>
                      <option value="sports">Sports & Fitness</option>
                      <option value="books">Books</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="ownerName">Owner Name</Label>
                    <Input
                      id="ownerName"
                      value={businessDetails.ownerName}
                      onChange={(e) => setBusinessDetails({...businessDetails, ownerName: e.target.value})}
                      placeholder="Priya Sharma"
                    />
                  </div>
                  <div>
                    <Label htmlFor="gstNumber">GST Number (Optional)</Label>
                    <Input
                      id="gstNumber"
                      value={businessDetails.gstNumber}
                      onChange={(e) => setBusinessDetails({...businessDetails, gstNumber: e.target.value})}
                      placeholder="22AAAAA0000A1Z5"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="businessAddress">Business Address</Label>
                    <Textarea
                      id="businessAddress"
                      value={businessDetails.businessAddress}
                      onChange={(e) => setBusinessDetails({...businessDetails, businessAddress: e.target.value})}
                      placeholder="123, Fashion Street, Mumbai, Maharashtra - 400001"
                    />
                  </div>
                  <div>
                    <Label htmlFor="bankAccount">Bank Account Number</Label>
                    <Input
                      id="bankAccount"
                      value={businessDetails.bankAccountNumber}
                      onChange={(e) => setBusinessDetails({...businessDetails, bankAccountNumber: e.target.value})}
                      placeholder="1234567890"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ifsc">IFSC Code</Label>
                    <Input
                      id="ifsc"
                      value={businessDetails.ifscCode}
                      onChange={(e) => setBusinessDetails({...businessDetails, ifscCode: e.target.value.toUpperCase()})}
                      placeholder="SBIN0001234"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="pan">PAN Number</Label>
                    <Input
                      id="pan"
                      value={businessDetails.panNumber}
                      onChange={(e) => setBusinessDetails({...businessDetails, panNumber: e.target.value.toUpperCase()})}
                      placeholder="ABCDE1234F"
                    />
                  </div>
                </div>
                <Button onClick={saveBusinessDetails} disabled={loading} className="w-full">
                  {loading ? 'Saving...' : 'Save Business Details'}
                </Button>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="storeName">Store Name</Label>
                  <Input
                    id="storeName"
                    value={storeDetails.storeName}
                    onChange={(e) => setStoreDetails({...storeDetails, storeName: e.target.value})}
                    placeholder="Priya's Fashion Store"
                  />
                </div>
                <div>
                  <Label htmlFor="storeDescription">Store Description</Label>
                  <Textarea
                    id="storeDescription"
                    value={storeDetails.storeDescription}
                    onChange={(e) => setStoreDetails({...storeDetails, storeDescription: e.target.value})}
                    placeholder="Premium fashion collection with latest trends and traditional wear"
                  />
                </div>
                <Button onClick={completeOnboarding} disabled={loading} className="w-full">
                  {loading ? 'Creating Store...' : 'Create My Store'}
                </Button>
              </div>
            )}

            {currentStep === 4 && (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Welcome to ShopAbell!</h3>
                <p className="text-gray-600">
                  Your store is now ready. You can start adding products and selling on WhatsApp.
                </p>
                <div className="flex gap-4 justify-center">
                  <Button asChild>
                    <a href="/dashboard">Go to Dashboard</a>
                  </Button>
                  <Button variant="outline" asChild>
                    <a href="/dashboard/products">Add Products</a>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Help Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Need Help?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <MessageCircle className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
                <h4 className="font-medium">WhatsApp Support</h4>
                <p className="text-sm text-gray-600">Chat with us on WhatsApp</p>
              </div>
              <div>
                <Phone className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
                <h4 className="font-medium">Call Support</h4>
                <p className="text-sm text-gray-600">+91 98765 43210</p>
              </div>
              <div>
                <Building className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
                <h4 className="font-medium">Business Hours</h4>
                <p className="text-sm text-gray-600">9 AM - 6 PM (Mon-Sat)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}