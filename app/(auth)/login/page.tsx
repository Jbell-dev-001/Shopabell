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
      
      // In development, show OTP in console
      if (process.env.NODE_ENV === 'development') {
        console.log(`[DEV] OTP for ${phone}: ${otp}`)
        toast.info(`Development OTP: ${otp}`)
      }
      
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

      // Sign in with Supabase (using phone as both email and password for now)
      // In production, implement proper phone auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: `${phoneNumber}@shopabell.temp`,
        password: phoneNumber
      })

      if (authError) {
        // Try to create auth user if doesn't exist
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: `${phoneNumber}@shopabell.temp`,
          password: phoneNumber
        })

        if (signUpError) {
          throw signUpError
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
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEV] Resent OTP for ${phoneNumber}: ${otp}`)
      toast.info(`Development OTP: ${otp}`)
    }
    
    toast.success('OTP resent successfully!')
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
            <OTPInput
              onComplete={handleOTPComplete}
              onResend={handleResendOTP}
              isLoading={isLoading}
              phoneNumber={phoneNumber}
            />
          )}
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