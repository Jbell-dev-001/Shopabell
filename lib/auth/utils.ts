import { z } from 'zod'

// Phone number validation
export const phoneSchema = z.string()
  .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
  .transform(val => {
    // Add country code if not present (default to India)
    if (!val.startsWith('+')) {
      return `+91${val}`
    }
    return val
  })

export const otpSchema = z.string()
  .length(6, 'OTP must be 6 digits')
  .regex(/^\d+$/, 'OTP must contain only numbers')

// Generate random OTP
export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Format phone number for display
export const formatPhoneNumber = (phone: string): string => {
  if (phone.startsWith('+91')) {
    const number = phone.slice(3)
    return `+91 ${number.slice(0, 5)} ${number.slice(5)}`
  }
  return phone
}

// Detect user language from phone country code
export const detectLanguageFromPhone = (phone: string): string => {
  const countryCode = phone.slice(0, 3)
  const languageMap: Record<string, string> = {
    '+91': 'hi', // Hindi for India
    '+880': 'bn', // Bengali for Bangladesh
    '+94': 'si', // Sinhala for Sri Lanka
    '+1': 'en', // English for US/Canada
  }
  return languageMap[countryCode] || 'en'
}

// Check if phone number is valid for a country
export const isValidPhoneForCountry = (phone: string, countryCode: string): boolean => {
  const patterns: Record<string, RegExp> = {
    'IN': /^\+91[6-9]\d{9}$/, // India
    'BD': /^\+880\d{10}$/, // Bangladesh
    'LK': /^\+94\d{9}$/, // Sri Lanka
    'US': /^\+1\d{10}$/, // US
  }
  
  const pattern = patterns[countryCode]
  return pattern ? pattern.test(phone) : true
}

// Simulate OTP sending (replace with actual SMS API)
export const sendOTP = async (phone: string, otp: string): Promise<boolean> => {
  console.log(`[SMS Simulation] Sending OTP ${otp} to ${phone}`)
  
  // In production, integrate with Twilio/MSG91
  // await sendSMS(phone, `Your ShopAbell OTP is: ${otp}`)
  
  // For development, always return success
  return true
}

// Store OTP temporarily (in production, use Redis or database)
const otpStore = new Map<string, { otp: string, timestamp: number }>()

export const storeOTP = (phone: string, otp: string): void => {
  otpStore.set(phone, {
    otp,
    timestamp: Date.now()
  })
}

export const verifyOTP = (phone: string, otp: string): boolean => {
  const stored = otpStore.get(phone)
  if (!stored) return false
  
  // Check if OTP expired (5 minutes)
  if (Date.now() - stored.timestamp > 5 * 60 * 1000) {
    otpStore.delete(phone)
    return false
  }
  
  if (stored.otp === otp) {
    otpStore.delete(phone)
    return true
  }
  
  return false
}