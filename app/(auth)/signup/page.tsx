'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { PhoneInput } from '@/components/auth/phone-input'
import { OTPInput } from '@/components/auth/otp-input'
import { useAuthStore } from '@/lib/stores/auth-store'
import { generateOTP, sendOTP, storeOTP, verifyOTP, detectLanguageFromPhone } from '@/lib/auth/utils'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils/cn'
import { Store, User } from 'lucide-react'

interface ProfileFormData {
  name: string
  role: 'seller' | 'buyer'
  businessName?: string
  businessCategory?: string
}

export default function SignupPage() {
  const router = useRouter()
  const [step, setStep] = useState<'phone' | 'otp' | 'profile'>('phone')
  const [isLoading, setIsLoading] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [displayOTP, setDisplayOTP] = useState<string>('')
  const [profileData, setProfileData] = useState<ProfileFormData>({
    name: '',
    role: 'buyer'
  })
  
  const { setUser, setPhoneNumber: setStorePhone } = useAuthStore()
  const supabase = createClient()

  const handlePhoneSubmit = async (phone: string) => {
    setIsLoading(true)
    try {
      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('phone', phone)
        .single()

      if (existingUser) {
        toast.error('An account already exists with this phone number')
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

      setStep('profile')
      toast.success('Phone verified successfully!')
    } catch (error) {
      console.error('OTP verification error:', error)
      toast.error('Verification failed. Please try again.')
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

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      // Create a valid email from phone number (remove + and special chars)
      const sanitizedPhone = phoneNumber.replace(/[^0-9]/g, '')
      const emailFormat = `${sanitizedPhone}@demo.shopabell.com`
      
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: emailFormat,
        password: sanitizedPhone
      })

      if (authError) {
        console.log('Auth signup error:', authError)
        // For demo purposes, continue even if auth fails - we'll use direct user creation
      }

      const userId = authData.user?.id || crypto.randomUUID()

      // Create user record
      const languagePreference = detectLanguageFromPhone(phoneNumber)
      
      const { error: userError } = await supabase
        .from('users')
        .insert({
          id: userId,
          phone: phoneNumber,
          name: profileData.name,
          role: profileData.role,
          language_preference: languagePreference,
          is_verified: true
        })

      if (userError) throw userError

      // Create role-specific record
      if (profileData.role === 'seller') {
        const storeSlug = profileData.businessName!
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '')
        
        const { error: sellerError } = await supabase
          .from('sellers')
          .insert({
            id: userId,
            business_name: profileData.businessName!,
            business_category: profileData.businessCategory!,
            store_slug: storeSlug,
            virtual_account_number: Date.now().toString(),
            virtual_upi_id: `${storeSlug}@shopabell`
          })

        if (sellerError) throw sellerError
      } else {
        const { error: buyerError } = await supabase
          .from('buyers')
          .insert({
            id: userId
          })

        if (buyerError) throw buyerError
      }

      // Set user in store
      setUser({
        id: userId,
        phone: phoneNumber,
        name: profileData.name,
        email: null,
        role: profileData.role,
        languagePreference,
        profileImage: null,
        isVerified: true
      })
      
      toast.success('Account created successfully!')
      
      // Redirect based on role
      if (profileData.role === 'seller') {
        router.push('/dashboard')
      } else {
        router.push('/')
      }
    } catch (error) {
      console.error('Profile submission error:', error)
      toast.error('Failed to create account. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
              sign in to existing account
            </Link>
          </p>
        </div>

        <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {step === 'phone' && (
            <PhoneInput onSubmit={handlePhoneSubmit} isLoading={isLoading} />
          )}
          
          {step === 'otp' && (
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
          
          {step === 'profile' && (
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Your Name
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  I want to
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setProfileData({ ...profileData, role: 'buyer' })}
                    className={cn(
                      "relative rounded-lg border p-4 flex flex-col items-center space-y-2",
                      "focus:outline-none focus:ring-2 focus:ring-indigo-500",
                      profileData.role === 'buyer'
                        ? "border-indigo-500 bg-indigo-50"
                        : "border-gray-300"
                    )}
                  >
                    <User className="h-8 w-8 text-indigo-600" />
                    <span className="text-sm font-medium">Buy Products</span>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setProfileData({ ...profileData, role: 'seller' })}
                    className={cn(
                      "relative rounded-lg border p-4 flex flex-col items-center space-y-2",
                      "focus:outline-none focus:ring-2 focus:ring-indigo-500",
                      profileData.role === 'seller'
                        ? "border-indigo-500 bg-indigo-50"
                        : "border-gray-300"
                    )}
                  >
                    <Store className="h-8 w-8 text-indigo-600" />
                    <span className="text-sm font-medium">Sell Products</span>
                  </button>
                </div>
              </div>

              {profileData.role === 'seller' && (
                <>
                  <div>
                    <label htmlFor="businessName" className="block text-sm font-medium text-gray-700">
                      Business Name
                    </label>
                    <input
                      type="text"
                      id="businessName"
                      required
                      value={profileData.businessName || ''}
                      onChange={(e) => setProfileData({ ...profileData, businessName: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="businessCategory" className="block text-sm font-medium text-gray-700">
                      What do you sell?
                    </label>
                    <select
                      id="businessCategory"
                      required
                      value={profileData.businessCategory || ''}
                      onChange={(e) => setProfileData({ ...profileData, businessCategory: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">Select category</option>
                      <option value="Fashion & Clothing">Fashion & Clothing</option>
                      <option value="Beauty & Cosmetics">Beauty & Cosmetics</option>
                      <option value="Electronics & Gadgets">Electronics & Gadgets</option>
                      <option value="Home & Kitchen">Home & Kitchen</option>
                      <option value="Jewelry & Accessories">Jewelry & Accessories</option>
                      <option value="Books & Stationery">Books & Stationery</option>
                      <option value="Sports & Fitness">Sports & Fitness</option>
                      <option value="Food & Beverages">Food & Beverages</option>
                    </select>
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className={cn(
                  "w-full flex justify-center py-3 px-4 border border-transparent",
                  "rounded-md shadow-sm text-sm font-medium text-white",
                  "bg-indigo-600 hover:bg-indigo-700 focus:outline-none",
                  "focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                {isLoading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}