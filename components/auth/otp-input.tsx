'use client'

import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils/cn'

interface OTPInputProps {
  onComplete: (otp: string) => void
  onResend: () => Promise<void>
  isLoading?: boolean
  phoneNumber: string
}

export function OTPInput({ onComplete, onResend, isLoading, phoneNumber }: OTPInputProps) {
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [resendTimer, setResendTimer] = useState(30)
  const [canResend, setCanResend] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      setCanResend(true)
    }
  }, [resendTimer])

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.slice(-1)
    }

    if (!/^\d*$/.test(value)) {
      return
    }

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    setError(null)

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    // Check if OTP is complete
    if (newOtp.every(digit => digit !== '')) {
      onComplete(newOtp.join(''))
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').trim()
    
    if (!/^\d{6}$/.test(pastedData)) {
      setError('Please paste a valid 6-digit code')
      return
    }

    const newOtp = pastedData.split('')
    setOtp(newOtp)
    onComplete(pastedData)
  }

  const handleResend = async () => {
    setCanResend(false)
    setResendTimer(30)
    setError(null)
    try {
      await onResend()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend OTP')
      setCanResend(true)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-sm text-gray-600">
          Enter the 6-digit code sent to
        </p>
        <p className="text-sm font-medium text-gray-900">{phoneNumber}</p>
      </div>

      <div className="flex justify-center space-x-2">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={el => {
              if (el) inputRefs.current[index] = el
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            disabled={isLoading}
            className={cn(
              "w-12 h-12 text-center text-lg font-semibold",
              "border rounded-md focus:outline-none focus:ring-2",
              "focus:ring-indigo-500 focus:border-indigo-500",
              error ? "border-red-300" : "border-gray-300",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          />
        ))}
      </div>

      {error && (
        <p className="text-center text-sm text-red-600">{error}</p>
      )}

      <div className="text-center">
        {canResend ? (
          <button
            onClick={handleResend}
            disabled={isLoading}
            className="text-sm text-indigo-600 hover:text-indigo-500 disabled:opacity-50"
          >
            Resend OTP
          </button>
        ) : (
          <p className="text-sm text-gray-500">
            Resend OTP in {resendTimer}s
          </p>
        )}
      </div>
    </div>
  )
}