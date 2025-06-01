// WhatsApp-based seller onboarding service

import { createClient } from '@/lib/supabase/server'
import { getWhatsAppClient } from './whatsapp-client'

export interface OnboardingSession {
  id: string
  phoneNumber: string
  step: 'verification' | 'business_details' | 'store_setup' | 'first_product' | 'completed'
  data: Record<string, any>
  expiresAt: Date
  createdAt: Date
}

export interface BusinessDetails {
  businessName: string
  businessType: 'fashion' | 'jewelry' | 'electronics' | 'home' | 'beauty' | 'sports' | 'books' | 'other'
  ownerName: string
  businessAddress: string
  gstNumber?: string
  bankAccountNumber: string
  ifscCode: string
  panNumber: string
}

export class WhatsAppOnboardingService {
  private async getSupabase() {
    return await createClient()
  }
  private whatsapp = getWhatsAppClient()

  // Start onboarding process
  async startOnboarding(phoneNumber: string): Promise<{ success: boolean; sessionId?: string; error?: string }> {
    try {
      // Clean phone number (remove country code if present)
      const cleanPhone = phoneNumber.replace(/^\+91/, '').replace(/\D/g, '')
      
      if (cleanPhone.length !== 10) {
        return { success: false, error: 'Invalid phone number format' }
      }

      const supabase = await this.getSupabase()
      
      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('sellers')
        .select('id, onboarding_completed')
        .eq('phone', cleanPhone)
        .single()

      if (existingUser?.onboarding_completed) {
        return { success: false, error: 'User already onboarded' }
      }

      // Generate verification code
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()

      // Create or update onboarding session
      const sessionData = {
        phone_number: cleanPhone,
        step: 'verification',
        data: { verificationCode },
        expires_at: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
      }

      const { data: session, error } = await supabase
        .from('onboarding_sessions')
        .upsert(sessionData, { 
          onConflict: 'phone_number',
          ignoreDuplicates: false 
        })
        .select()
        .single()

      if (error) {
        throw new Error(`Database error: ${error.message}`)
      }

      // Send verification code via WhatsApp
      const messageSent = await this.whatsapp.sendVerificationCode(`+91${cleanPhone}`, verificationCode)
      
      if (!messageSent) {
        // Fallback: save session anyway for manual verification
        console.warn('Failed to send WhatsApp verification, proceeding with manual flow')
      }

      return { 
        success: true, 
        sessionId: session.id 
      }
    } catch (error) {
      console.error('Onboarding start error:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  // Verify phone number with code
  async verifyPhone(sessionId: string, code: string): Promise<{ success: boolean; error?: string }> {
    try {
      const supabase = await this.getSupabase()
      const { data: session, error } = await supabase
        .from('onboarding_sessions')
        .select('*')
        .eq('id', sessionId)
        .eq('step', 'verification')
        .single()

      if (error || !session) {
        return { success: false, error: 'Invalid session' }
      }

      if (new Date() > new Date(session.expires_at)) {
        return { success: false, error: 'Verification code expired' }
      }

      const storedCode = session.data.verificationCode
      if (code !== storedCode) {
        return { success: false, error: 'Invalid verification code' }
      }

      // Update session to next step
      const { error: updateError } = await supabase
        .from('onboarding_sessions')
        .update({ 
          step: 'business_details',
          expires_at: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes for business details
        })
        .eq('id', sessionId)

      if (updateError) {
        throw new Error(`Update error: ${updateError.message}`)
      }

      // Send business details instructions
      await this.whatsapp.sendOnboardingInstructions(`+91${session.phone_number}`)

      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Verification failed' 
      }
    }
  }

  // Save business details
  async saveBusinessDetails(sessionId: string, details: BusinessDetails): Promise<{ success: boolean; error?: string }> {
    try {
      const supabase = await this.getSupabase()
      const { data: session, error } = await supabase
        .from('onboarding_sessions')
        .select('*')
        .eq('id', sessionId)
        .eq('step', 'business_details')
        .single()

      if (error || !session) {
        return { success: false, error: 'Invalid session' }
      }

      if (new Date() > new Date(session.expires_at)) {
        return { success: false, error: 'Session expired' }
      }

      // Validate required fields
      const required = ['businessName', 'businessType', 'ownerName', 'businessAddress', 'bankAccountNumber', 'ifscCode', 'panNumber']
      for (const field of required) {
        if (!details[field as keyof BusinessDetails]) {
          return { success: false, error: `${field} is required` }
        }
      }

      // Update session with business details
      const updatedData = { ...session.data, businessDetails: details }
      
      const { error: updateError } = await supabase
        .from('onboarding_sessions')
        .update({ 
          step: 'store_setup',
          data: updatedData,
          expires_at: new Date(Date.now() + 60 * 60 * 1000) // 1 hour for store setup
        })
        .eq('id', sessionId)

      if (updateError) {
        throw new Error(`Update error: ${updateError.message}`)
      }

      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to save business details' 
      }
    }
  }

  // Complete seller registration
  async completeOnboarding(sessionId: string, storeDetails: any): Promise<{ success: boolean; sellerId?: string; error?: string }> {
    try {
      const supabase = await this.getSupabase()
      const { data: session, error } = await supabase
        .from('onboarding_sessions')
        .select('*')
        .eq('id', sessionId)
        .single()

      if (error || !session) {
        return { success: false, error: 'Invalid session' }
      }

      const businessDetails = session.data.businessDetails
      if (!businessDetails) {
        return { success: false, error: 'Business details not found' }
      }

      // Create seller account
      const sellerData = {
        phone: session.phone_number,
        business_name: businessDetails.businessName,
        business_type: businessDetails.businessType,
        owner_name: businessDetails.ownerName,
        business_address: businessDetails.businessAddress,
        gst_number: businessDetails.gstNumber,
        bank_account_number: businessDetails.bankAccountNumber,
        ifsc_code: businessDetails.ifscCode,
        pan_number: businessDetails.panNumber,
        store_name: storeDetails.storeName || businessDetails.businessName,
        store_description: storeDetails.storeDescription || '',
        store_logo: storeDetails.storeLogo || null,
        onboarding_completed: true,
        onboarding_completed_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      }

      const { data: seller, error: sellerError } = await supabase
        .from('sellers')
        .upsert(sellerData, { onConflict: 'phone', ignoreDuplicates: false })
        .select()
        .single()

      if (sellerError) {
        throw new Error(`Seller creation error: ${sellerError.message}`)
      }

      // Create default store
      const { error: storeError } = await supabase
        .from('stores')
        .upsert({
          seller_id: seller.id,
          name: storeDetails.storeName || businessDetails.businessName,
          slug: this.generateSlug(storeDetails.storeName || businessDetails.businessName),
          description: storeDetails.storeDescription || '',
          logo_url: storeDetails.storeLogo || null,
          is_active: true,
          created_at: new Date().toISOString()
        }, { onConflict: 'seller_id' })

      if (storeError) {
        console.error('Store creation error:', storeError)
      }

      // Send welcome message
      await this.whatsapp.sendWelcomeMessage(`+91${session.phone_number}`, businessDetails.ownerName)

      // Clean up session
      await supabase
        .from('onboarding_sessions')
        .delete()
        .eq('id', sessionId)

      return { success: true, sellerId: seller.id }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to complete onboarding' 
      }
    }
  }

  // Process WhatsApp webhook messages
  async processWebhookMessage(phoneNumber: string, message: string): Promise<void> {
    try {
      const supabase = await this.getSupabase()
      const cleanPhone = phoneNumber.replace(/^\+91/, '').replace(/\D/g, '')
      
      // Get active onboarding session
      const { data: session } = await supabase
        .from('onboarding_sessions')
        .select('*')
        .eq('phone_number', cleanPhone)
        .gte('expires_at', new Date().toISOString())
        .single()

      if (session) {
        await this.handleOnboardingMessage(session, message)
      } else {
        // Check if it's an existing seller
        const { data: seller } = await supabase
          .from('sellers')
          .select('id, business_name')
          .eq('phone', cleanPhone)
          .eq('onboarding_completed', true)
          .single()

        if (seller) {
          // Forward to chat system
          await this.forwardToChat(seller.id, message)
        } else {
          // New user - start onboarding
          await this.startOnboarding(phoneNumber)
        }
      }
    } catch (error) {
      console.error('Webhook processing error:', error)
    }
  }

  private async handleOnboardingMessage(session: any, message: string): Promise<void> {
    const step = session.step
    const phoneNumber = `+91${session.phone_number}`

    switch (step) {
      case 'verification':
        // Handle verification code
        if (/^\d{6}$/.test(message.trim())) {
          const result = await this.verifyPhone(session.id, message.trim())
          if (result.success) {
            await this.whatsapp.sendMessage({
              from: process.env.WHATSAPP_PHONE_NUMBER_ID!,
              to: phoneNumber,
              type: 'text',
              text: { body: '✅ Phone verified! Please complete your business details in the app.' }
            })
          } else {
            await this.whatsapp.sendMessage({
              from: process.env.WHATSAPP_PHONE_NUMBER_ID!,
              to: phoneNumber,
              type: 'text',
              text: { body: '❌ Invalid code. Please try again.' }
            })
          }
        }
        break

      case 'business_details':
      case 'store_setup':
        // Guide them to complete in the app
        await this.whatsapp.sendMessage({
          from: process.env.WHATSAPP_PHONE_NUMBER_ID!,
          to: phoneNumber,
          type: 'text',
          text: { body: 'Please complete your registration in the ShopAbell app for a better experience. Link: https://shopabell.com/onboarding' }
        })
        break
    }
  }

  private async forwardToChat(sellerId: string, message: string): Promise<void> {
    // This would integrate with the chat system
    // For now, just acknowledge
    console.log(`Chat message from seller ${sellerId}: ${message}`)
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
      .substring(0, 50)
  }

  // Get onboarding session
  async getSession(sessionId: string): Promise<OnboardingSession | null> {
    try {
      const supabase = await this.getSupabase()
      const { data: session, error } = await supabase
        .from('onboarding_sessions')
        .select('*')
        .eq('id', sessionId)
        .single()

      if (error || !session) {
        return null
      }

      return {
        id: session.id,
        phoneNumber: session.phone_number,
        step: session.step,
        data: session.data,
        expiresAt: new Date(session.expires_at),
        createdAt: new Date(session.created_at)
      }
    } catch (error) {
      console.error('Get session error:', error)
      return null
    }
  }

  // Clean up expired sessions
  async cleanupExpiredSessions(): Promise<void> {
    try {
      const supabase = await this.getSupabase()
      await supabase
        .from('onboarding_sessions')
        .delete()
        .lt('expires_at', new Date().toISOString())
    } catch (error) {
      console.error('Cleanup error:', error)
    }
  }
}

export const whatsappOnboarding = new WhatsAppOnboardingService()