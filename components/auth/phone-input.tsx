'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils/cn'

interface PhoneInputProps {
  value: string
  onChange: (value: string) => void
  error?: string
  disabled?: boolean
  className?: string
}

export function PhoneInput({ value, onChange, error, disabled, className }: PhoneInputProps) {
  const [countryCode] = useState('+91')

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const phone = e.target.value.replace(/\D/g, '') // Remove non-digits
    const fullPhone = phone ? `${countryCode}${phone}` : ''
    onChange(fullPhone)
  }

  const displayValue = value.startsWith(countryCode) 
    ? value.slice(countryCode.length) 
    : value

  return (
    <div className={cn('space-y-2', className)}>
      <Label htmlFor="phone">WhatsApp Number</Label>
      <div className="flex">
        <div className="flex items-center px-3 border border-r-0 rounded-l-md bg-muted text-muted-foreground">
          🇮🇳 +91
        </div>
        <Input
          id="phone"
          type="tel"
          placeholder="9876543210"
          value={displayValue}
          onChange={handlePhoneChange}
          disabled={disabled}
          className={cn(
            'rounded-l-none',
            error && 'border-destructive focus-visible:ring-destructive'
          )}
          maxLength={10}
        />
      </div>
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
      <p className="text-xs text-muted-foreground">
        We'll send a verification code to your WhatsApp
      </p>
    </div>
  )
}