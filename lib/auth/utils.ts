import { z } from 'zod'

// Phone validation schema with demo account support
export const phoneSchema = z.string()
  .min(10, 'Phone number must be at least 10 digits')
  .max(15, 'Phone number must not exceed 15 digits')
  .refine(val => {
    // Demo phone numbers for testing
    const demoPhones = ['+919999999991', '+919999999992', '+919999999993', '+919999999994']
    if (demoPhones.includes(val)) {
      return true
    }
    
    // Regular validation for non-demo phones
    if (val.startsWith('+91')) {
      return /^\+91[6-9]\d{9}$/.test(val)
    }
    
    // Allow other country codes
    return /^\+\d{10,15}$/.test(val)
  }, 'Invalid phone number format')

// OTP validation schema
export const otpSchema = z.string()
  .length(6, 'OTP must be exactly 6 digits')
  .regex(/^\d{6}$/, 'OTP must contain only numbers')

// Business onboarding validation
export const businessOnboardingSchema = z.object({
  business_name: z.string()
    .min(2, 'Business name must be at least 2 characters')
    .max(100, 'Business name must not exceed 100 characters'),
  
  owner_name: z.string()
    .min(2, 'Owner name must be at least 2 characters')
    .max(100, 'Owner name must not exceed 100 characters'),
  
  business_type: z.string()
    .min(1, 'Please select a business type'),
  
  business_address: z.object({
    address_line: z.string().min(5, 'Please enter a valid address'),
    city: z.string().min(2, 'Please enter city name'),
    state: z.string().min(2, 'Please enter state'),
    pincode: z.string().regex(/^\d{6}$/, 'Please enter a valid 6-digit pincode')
  }).optional()
})

// Format phone number for display
export function formatPhoneNumber(phone: string): string {
  if (phone.startsWith('+91')) {
    const number = phone.slice(3)
    return `+91 ${number.slice(0, 5)} ${number.slice(5)}`
  }
  return phone
}

// Check if phone is demo account
export function isDemoPhone(phone: string): boolean {
  const demoPhones = ['+919999999991', '+919999999992', '+919999999993', '+919999999994']
  return demoPhones.includes(phone)
}

// Business type options
export const businessTypes = [
  'Fashion',
  'Jewelry',
  'Electronics',
  'Home Decor',
  'Food & Beverages',
  'Beauty & Health',
  'Sports & Fitness',
  'Books & Education',
  'Toys & Games',
  'Other'
] as const

export type BusinessType = typeof businessTypes[number]

// Indian states for address validation
export const indianStates = [
  { code: 'AP', name: 'Andhra Pradesh' },
  { code: 'AR', name: 'Arunachal Pradesh' },
  { code: 'AS', name: 'Assam' },
  { code: 'BR', name: 'Bihar' },
  { code: 'CG', name: 'Chhattisgarh' },
  { code: 'GA', name: 'Goa' },
  { code: 'GJ', name: 'Gujarat' },
  { code: 'HR', name: 'Haryana' },
  { code: 'HP', name: 'Himachal Pradesh' },
  { code: 'JK', name: 'Jammu and Kashmir' },
  { code: 'JH', name: 'Jharkhand' },
  { code: 'KA', name: 'Karnataka' },
  { code: 'KL', name: 'Kerala' },
  { code: 'MP', name: 'Madhya Pradesh' },
  { code: 'MH', name: 'Maharashtra' },
  { code: 'MN', name: 'Manipur' },
  { code: 'ML', name: 'Meghalaya' },
  { code: 'MZ', name: 'Mizoram' },
  { code: 'NL', name: 'Nagaland' },
  { code: 'OR', name: 'Odisha' },
  { code: 'PB', name: 'Punjab' },
  { code: 'RJ', name: 'Rajasthan' },
  { code: 'SK', name: 'Sikkim' },
  { code: 'TN', name: 'Tamil Nadu' },
  { code: 'TG', name: 'Telangana' },
  { code: 'TR', name: 'Tripura' },
  { code: 'UP', name: 'Uttar Pradesh' },
  { code: 'UK', name: 'Uttarakhand' },
  { code: 'WB', name: 'West Bengal' },
  { code: 'AN', name: 'Andaman and Nicobar Islands' },
  { code: 'CH', name: 'Chandigarh' },
  { code: 'DH', name: 'Dadra and Nagar Haveli' },
  { code: 'DD', name: 'Daman and Diu' },
  { code: 'DL', name: 'Delhi' },
  { code: 'LD', name: 'Lakshadweep' },
  { code: 'PY', name: 'Puducherry' }
] as const