'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PhoneInput } from '@/components/auth/phone-input'
import { OTPInput } from '@/components/auth/otp-input'
import { authService } from '@/lib/auth/auth-service'
import { businessTypes } from '@/lib/auth/utils'
import { useRouter } from 'next/navigation'

interface Message {
  id: string
  text: string
  isBot: boolean
  timestamp: Date
  showTyping?: boolean
  options?: Array<{id: string, label: string, value: string}>
  inputType?: 'text' | 'phone' | 'otp' | 'select'
}

type OnboardingStage = 
  | 'welcome' 
  | 'phone_verification' 
  | 'otp_verification'
  | 'business_name' 
  | 'owner_name' 
  | 'business_type' 
  | 'business_address'
  | 'confirmation'
  | 'complete'

export default function WhatsAppOnboarding() {
  const [messages, setMessages] = useState<Message[]>([])
  const [stage, setStage] = useState<OnboardingStage>('welcome')
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [businessData, setBusinessData] = useState({
    phone: '',
    business_name: '',
    owner_name: '',
    business_type: '',
    business_address: {
      address_line: '',
      city: '',
      state: '',
      pincode: ''
    }
  })
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    // Initialize with welcome message
    addBotMessage("Welcome to ShopAbell! 🛍️", 1000)
    setTimeout(() => {
      addBotMessage("I'll help you set up your online store in just 2 minutes. Let's get started! 🚀", 2000)
      setTimeout(() => {
        setStage('phone_verification')
        addBotMessage("What's your WhatsApp number? (We'll send you a verification code)", 0, {
          inputType: 'phone'
        })
      }, 3000)
    }, 2000)
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const addBotMessage = (text: string, delay: number = 0, options?: {
    options?: Array<{id: string, label: string, value: string}>
    inputType?: 'text' | 'phone' | 'otp' | 'select'
  }) => {
    setTimeout(() => {
      const message: Message = {
        id: Date.now().toString(),
        text,
        isBot: true,
        timestamp: new Date(),
        ...options
      }
      setMessages(prev => [...prev, message])
    }, delay)
  }

  const addUserMessage = (text: string) => {
    const message: Message = {
      id: Date.now().toString(),
      text,
      isBot: false,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, message])
  }

  const handleSubmit = async (value: string) => {
    if (!value.trim() && stage !== 'otp_verification') return
    
    setError('')
    setIsLoading(true)

    try {
      switch (stage) {
        case 'phone_verification':
          await handlePhoneVerification(value)
          break
        case 'otp_verification':
          await handleOTPVerification(value)
          break
        case 'business_name':
          await handleBusinessName(value)
          break
        case 'owner_name':
          await handleOwnerName(value)
          break
        case 'business_type':
          await handleBusinessType(value)
          break
        case 'business_address':
          await handleBusinessAddress(value)
          break
        case 'confirmation':
          await handleConfirmation()
          break
      }
    } catch (error) {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePhoneVerification = async (phone: string) => {
    addUserMessage(phone)
    setBusinessData(prev => ({ ...prev, phone }))

    // Simulate bot typing
    addBotMessage("Let me verify this number...", 500)
    
    const result = await authService.sendOTP(phone)
    
    if (result.success) {
      addBotMessage("Perfect! ✅ I've sent a 6-digit verification code to your WhatsApp.", 1500)
      addBotMessage("Please enter the code you received:", 2500, { inputType: 'otp' })
      setStage('otp_verification')
    } else {
      setError(result.message)
      addBotMessage("Hmm, there seems to be an issue with that number. Can you please try again? 🤔", 1500, { inputType: 'phone' })
    }
    
    setInputValue('')
  }

  const handleOTPVerification = async (otp: string) => {
    if (otp.length !== 6) return

    addUserMessage(otp)
    addBotMessage("Verifying your code...", 500)

    const result = await authService.verifyOTP(businessData.phone, otp)
    
    if (result.success) {
      addBotMessage("Excellent! ✅ Your number is verified.", 1500)
      addBotMessage("Now, what's your business name?", 2500, { inputType: 'text' })
      setStage('business_name')
    } else {
      setError(result.error || 'Invalid OTP')
      addBotMessage("That code doesn't look right. Please try again: 🔢", 1500, { inputType: 'otp' })
    }
    
    setInputValue('')
  }

  const handleBusinessName = async (name: string) => {
    addUserMessage(name)
    setBusinessData(prev => ({ ...prev, business_name: name }))
    
    addBotMessage(`Great! "${name}" is a wonderful name! 🏪`, 800)
    addBotMessage("What's your name? (As the business owner)", 1800, { inputType: 'text' })
    setStage('owner_name')
    setInputValue('')
  }

  const handleOwnerName = async (name: string) => {
    addUserMessage(name)
    setBusinessData(prev => ({ ...prev, owner_name: name }))
    
    addBotMessage(`Nice to meet you, ${name}! 👋`, 800)
    addBotMessage("What type of products do you sell?", 1800, {
      options: businessTypes.map(type => ({ id: type, label: type, value: type }))
    })
    setStage('business_type')
    setInputValue('')
  }

  const handleBusinessType = async (type: string) => {
    addUserMessage(type)
    setBusinessData(prev => ({ ...prev, business_type: type }))
    
    addBotMessage(`${type} - that's awesome! 🎯`, 800)
    addBotMessage("Let's set up your business address. Please provide your complete address:", 1800, { inputType: 'text' })
    setStage('business_address')
    setInputValue('')
  }

  const handleBusinessAddress = async (address: string) => {
    addUserMessage(address)
    
    // Simple address parsing (in production, use a proper address parser)
    const addressParts = address.split(',').map(part => part.trim())
    setBusinessData(prev => ({
      ...prev,
      business_address: {
        address_line: addressParts[0] || address,
        city: addressParts[1] || '',
        state: addressParts[2] || '',
        pincode: addressParts[3] || ''
      }
    }))
    
    addBotMessage("Perfect! Let me confirm your details:", 800)
    setTimeout(() => {
      addBotMessage(`📱 Phone: ${businessData.phone}`, 1200)
      addBotMessage(`🏪 Business: ${businessData.business_name}`, 1600)
      addBotMessage(`👤 Owner: ${businessData.owner_name}`, 2000)
      addBotMessage(`🏷️ Type: ${businessData.business_type}`, 2400)
      addBotMessage(`📍 Address: ${address}`, 2800)
      addBotMessage("Is everything correct? Type 'YES' to confirm or 'NO' to make changes:", 3200, { inputType: 'text' })
    }, 0)
    
    setStage('confirmation')
    setInputValue('')
  }

  const handleConfirmation = async () => {
    const confirmation = inputValue.toLowerCase()
    addUserMessage(inputValue)
    
    if (confirmation === 'yes' || confirmation === 'y') {
      addBotMessage("Fantastic! Creating your store now... ⚡", 500)
      
      // Complete onboarding
      const user = await authService.getCurrentUser()
      if (user) {
        const result = await authService.completeOnboarding(user.id, {
          business_name: businessData.business_name,
          owner_name: businessData.owner_name,
          business_type: businessData.business_type,
          business_address: businessData.business_address
        })
        
        if (result.success) {
          addBotMessage("🎉 Congratulations! Your store is ready!", 1500)
          addBotMessage("You can now:", 2500)
          addBotMessage("• Add products using AI livestream", 3000)
          addBotMessage("• Manage orders through chat", 3500)
          addBotMessage("• Track your business analytics", 4000)
          addBotMessage("Ready to start selling? Let's go to your dashboard! 🚀", 4500)
          
          setTimeout(() => {
            router.push('/dashboard')
          }, 6000)
        }
      }
    } else {
      addBotMessage("No problem! Let's start over. What would you like to change?", 800)
      setStage('business_name')
      addBotMessage("What's your business name?", 1200, { inputType: 'text' })
    }
    
    setInputValue('')
  }

  const renderInput = () => {
    const currentMessage = messages[messages.length - 1]
    if (!currentMessage || currentMessage.isBot === false) return null

    if (currentMessage.options) {
      return (
        <div className="p-4 bg-gray-100">
          <div className="flex flex-wrap gap-2">
            {currentMessage.options.map((option) => (
              <Button
                key={option.id}
                variant="outline"
                className="border-whatsapp text-whatsapp hover:bg-whatsapp hover:text-white"
                onClick={() => handleSubmit(option.value)}
                disabled={isLoading}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>
      )
    }

    if (currentMessage.inputType === 'phone') {
      return (
        <div className="p-4 bg-gray-100">
          <PhoneInput
            value={inputValue}
            onChange={setInputValue}
            error={error}
            disabled={isLoading}
          />
          <Button
            className="w-full mt-3 bg-whatsapp hover:bg-whatsapp-dark"
            onClick={() => handleSubmit(inputValue)}
            disabled={isLoading || !inputValue}
          >
            {isLoading ? 'Sending...' : 'Send Code'}
          </Button>
        </div>
      )
    }

    if (currentMessage.inputType === 'otp') {
      return (
        <div className="p-4 bg-gray-100">
          <OTPInput
            value={inputValue}
            onChange={setInputValue}
            error={error}
            disabled={isLoading}
          />
          <Button
            className="w-full mt-3 bg-whatsapp hover:bg-whatsapp-dark"
            onClick={() => handleSubmit(inputValue)}
            disabled={isLoading || inputValue.length !== 6}
          >
            {isLoading ? 'Verifying...' : 'Verify'}
          </Button>
        </div>
      )
    }

    return (
      <div className="p-4 bg-gray-100 flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type your message..."
          disabled={isLoading}
          onKeyPress={(e) => e.key === 'Enter' && handleSubmit(inputValue)}
          className="flex-1"
        />
        <Button
          onClick={() => handleSubmit(inputValue)}
          disabled={isLoading || !inputValue.trim()}
          className="bg-whatsapp hover:bg-whatsapp-dark"
        >
          Send
        </Button>
      </div>
    )
  }

  return (
    <div className="whatsapp-container min-h-screen">
      {/* WhatsApp Header */}
      <div className="whatsapp-header">
        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
          <span className="text-lg">🤖</span>
        </div>
        <div>
          <h1 className="font-semibold">ShopAbell Assistant</h1>
          <p className="text-sm opacity-90">Online • Setting up your store</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 pb-20 custom-scrollbar overflow-y-auto">
        <div className="max-w-lg mx-auto space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`chat-bubble ${message.isBot ? 'received' : 'sent'}`}
            >
              <p className="text-sm">{message.text}</p>
              <span className="text-xs opacity-70 block mt-1">
                {message.timestamp.toLocaleTimeString('en-IN', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t">
        {renderInput()}
      </div>
    </div>
  )
}