'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { PhoneInput } from '@/components/auth/phone-input'
import { OTPInput } from '@/components/auth/otp-input'
import { useAuthStore } from '@/lib/stores/auth-store'
import { generateOTP, sendOTP, storeOTP, verifyOTP } from '@/lib/auth/utils'
import { createClient } from '@/lib/supabase/client'

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const returnTo = searchParams.get('from') || '/dashboard'
  
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [isLoading, setIsLoading] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [displayOTP, setDisplayOTP] = useState<string>('')
  
  const { setUser, setPhoneNumber: setStorePhone } = useAuthStore()
  const supabase = createClient()

  const handlePhoneSubmit = async (phone: string) => {
    setIsLoading(true)
    try {
      // Check if user exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('phone', phone)
        .single()

      if (!existingUser) {
        toast.error('No account found with this phone number')
        setIsLoading(false)
        return
      }

      // Generate and send OTP
      const otp = generateOTP()
      await sendOTP(phone, otp)
      storeOTP(phone, otp)
      
      // Show OTP on screen for demo/development
      console.log(`[DEV] OTP for ${phone}: ${otp}`)
      setDisplayOTP(otp)
      toast.success(`OTP: ${otp}`, { duration: 10000 })
      
      setPhoneNumber(phone)
      setStorePhone(phone)
      setStep('otp')
      toast.success('OTP sent successfully!')
    } catch (error) {
      console.error('Phone submission error:', error)
      toast.error('Failed to send OTP. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOTPComplete = async (otp: string) => {
    setIsLoading(true)
    try {
      // Verify OTP
      const isValid = verifyOTP(phoneNumber, otp)
      
      if (!isValid) {
        toast.error('Invalid or expired OTP')
        setIsLoading(false)
        return
      }

      // Create a valid email from phone number (remove + and special chars)
      const sanitizedPhone = phoneNumber.replace(/[^0-9]/g, '')
      const emailFormat = `${sanitizedPhone}@demo.shopabell.com`
      
      // Sign in with Supabase (using sanitized phone as email)
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: emailFormat,
        password: sanitizedPhone
      })

      if (authError) {
        // Try to create auth user if doesn't exist
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: emailFormat,
          password: sanitizedPhone
        })

        if (signUpError) {
          console.log('Auth signup error:', signUpError)
          // For demo purposes, continue even if auth fails
        }
      }

      // Fetch user data
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('phone', phoneNumber)
        .single()

      if (userData) {
        setUser({
          id: userData.id,
          phone: userData.phone,
          name: userData.name,
          email: userData.email,
          role: userData.role,
          languagePreference: userData.language_preference,
          profileImage: userData.profile_image,
          isVerified: userData.is_verified
        })
        
        toast.success('Login successful!')
        router.push(returnTo)
      }
    } catch (error) {
      console.error('OTP verification error:', error)
      toast.error('Login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOTP = async () => {
    const otp = generateOTP()
    await sendOTP(phoneNumber, otp)
    storeOTP(phoneNumber, otp)
    
    // Show OTP on screen for demo/development
    console.log(`[DEV] Resent OTP for ${phoneNumber}: ${otp}`)
    setDisplayOTP(otp)
    toast.success(`OTP: ${otp}`, { duration: 10000 })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Welcome back
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link href="/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
              create a new account
            </Link>
          </p>
        </div>

        <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {step === 'phone' ? (
            <PhoneInput onSubmit={handlePhoneSubmit} isLoading={isLoading} />
          ) : (
            <div className="space-y-6">
              {displayOTP && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                  <p className="text-sm text-green-600 mb-2">🔑 Demo OTP for Testing:</p>
                  <p className="text-2xl font-bold text-green-800 tracking-widest">{displayOTP}</p>
                  <p className="text-xs text-green-500 mt-2">Copy this OTP to the field below</p>
                </div>
              )}
              <OTPInput
                onComplete={handleOTPComplete}
                onResend={handleResendOTP}
                isLoading={isLoading}
                phoneNumber={phoneNumber}
              />
            </div>
          )}
        </div>

        {/* Demo Credentials */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-800 mb-3 text-center">📱 Demo Credentials for Testing</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-white rounded p-3 border border-blue-100 shadow-sm">
              <div className="font-medium text-blue-700 mb-1">🏪 Seller</div>
              <div className="text-blue-600 font-mono text-sm">+919876543210</div>
              <div className="text-blue-500 text-xs mt-1">Fashion Junction</div>
            </div>
            <div className="bg-white rounded p-3 border border-blue-100 shadow-sm">
              <div className="font-medium text-blue-700 mb-1">🛒 Buyer</div>
              <div className="text-blue-600 font-mono text-sm">+919876543220</div>
              <div className="text-blue-500 text-xs mt-1">Vikram Singh</div>
            </div>
            <div className="bg-white rounded p-3 border border-blue-100 shadow-sm">
              <div className="font-medium text-blue-700 mb-1">👨‍💼 Admin</div>
              <div className="text-blue-600 font-mono text-sm">+919876543200</div>
              <div className="text-blue-500 text-xs mt-1">Platform Admin</div>
            </div>
          </div>
          <p className="text-xs text-blue-600 text-center mt-3">
            Demo users available for testing • 
            <a href="/demo-setup" className="underline font-medium ml-1">Set up demo users</a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  )
}