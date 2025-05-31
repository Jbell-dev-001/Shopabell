'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Phone } from 'lucide-react'
import { phoneSchema } from '@/lib/auth/utils'
import { cn } from '@/lib/utils/cn'

const phoneFormSchema = z.object({
  phone: phoneSchema
})

type PhoneFormData = z.infer<typeof phoneFormSchema>

interface PhoneInputProps {
  onSubmit: (phone: string) => Promise<void>
  isLoading?: boolean
}

export function PhoneInput({ onSubmit, isLoading }: PhoneInputProps) {
  const [error, setError] = useState<string | null>(null)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PhoneFormData>({
    resolver: zodResolver(phoneFormSchema),
  })

  const handlePhoneSubmit = async (data: PhoneFormData) => {
    setError(null)
    try {
      await onSubmit(data.phone)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  return (
    <form onSubmit={handleSubmit(handlePhoneSubmit)} className="space-y-6">
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
          Phone Number
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Phone className="h-5 w-5 text-gray-400" />
          </div>
          <input
            {...register('phone')}
            type="tel"
            id="phone"
            autoComplete="tel"
            placeholder="9876543210"
            disabled={isLoading}
            className={cn(
              "block w-full pl-10 pr-3 py-3 border rounded-md leading-5",
              "placeholder-gray-400 focus:outline-none focus:ring-2",
              "focus:ring-indigo-500 focus:border-indigo-500",
              errors.phone ? "border-red-300" : "border-gray-300"
            )}
          />
        </div>
        {errors.phone && (
          <p className="mt-2 text-sm text-red-600">{errors.phone.message}</p>
        )}
        {error && (
          <p className="mt-2 text-sm text-red-600">{error}</p>
        )}
      </div>

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
        {isLoading ? 'Sending OTP...' : 'Send OTP'}
      </button>
    </form>
  )
}