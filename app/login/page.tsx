'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PhoneInput } from '@/components/auth/phone-input'
import { OTPInput } from '@/components/auth/otp-input'
import { authService } from '@/lib/auth/auth-service'

export default function LoginPage() {
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSendOTP = async () => {
    if (!phone) return
    
    setIsLoading(true)
    setError('')
    
    try {
      const result = await authService.sendOTP(phone)
      
      if (result.success) {
        setStep('otp')
      } else {
        setError(result.message)
      }
    } catch (error) {
      setError('Failed to send OTP. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) return
    
    setIsLoading(true)
    setError('')
    
    try {
      const result = await authService.verifyOTP(phone, otp)
      
      if (result.success && result.user) {
        // Check if onboarding is completed
        if (result.user.onboarding_completed) {
          router.push('/dashboard')
        } else {
          router.push('/whatsapp-onboarding')
        }
      } else {
        setError(result.error || 'Invalid OTP')
      }
    } catch (error) {
      setError('Verification failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-whatsapp to-whatsapp-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-whatsapp font-bold text-2xl">S</span>
          </div>
          <h1 className="text-white text-2xl font-bold">Welcome Back</h1>
          <p className="text-white/80 mt-2">
            Sign in to your ShopAbell account
          </p>
        </div>

        {/* Login Form */}
        <Card className="bg-white/95 backdrop-blur-md">
          <CardHeader>
            <CardTitle>
              {step === 'phone' ? 'Enter Your Phone Number' : 'Verify Your Number'}
            </CardTitle>
            <CardDescription>
              {step === 'phone' 
                ? 'We\'ll send you a verification code on WhatsApp'
                : `Enter the 6-digit code sent to ${phone}`
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {step === 'phone' ? (
              <>
                <PhoneInput
                  value={phone}
                  onChange={setPhone}
                  error={error}
                  disabled={isLoading}
                />
                <Button
                  onClick={handleSendOTP}
                  disabled={isLoading || !phone}
                  className="w-full bg-whatsapp hover:bg-whatsapp-dark"
                >
                  {isLoading ? 'Sending...' : 'Send Verification Code'}
                </Button>
              </>
            ) : (
              <>
                <OTPInput
                  value={otp}
                  onChange={setOtp}
                  error={error}
                  disabled={isLoading}
                />
                <Button
                  onClick={handleVerifyOTP}
                  disabled={isLoading || otp.length !== 6}
                  className="w-full bg-whatsapp hover:bg-whatsapp-dark"
                >
                  {isLoading ? 'Verifying...' : 'Verify & Sign In'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setStep('phone')
                    setOtp('')
                    setError('')
                  }}
                  disabled={isLoading}
                  className="w-full"
                >
                  Change Phone Number
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-white/80 text-sm">
            Don't have an account?{' '}
            <Link 
              href="/whatsapp-onboarding" 
              className="text-yellow-300 hover:text-yellow-200 font-medium"
            >
              Create one through WhatsApp
            </Link>
          </p>
          <p className="text-white/60 text-xs mt-4">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  )
}