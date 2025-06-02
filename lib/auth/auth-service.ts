import { supabase } from '@/lib/supabase/client'
import { User } from '@/types/supabase'

export interface OTPResponse {
  success: boolean
  message: string
  error?: string
}

export interface AuthUser extends User {
  session?: any
}

export class AuthService {
  /**
   * Send OTP to phone number
   */
  async sendOTP(phone: string): Promise<OTPResponse> {
    try {
      // Validate phone format
      if (!this.validatePhoneNumber(phone)) {
        return {
          success: false,
          message: 'Invalid phone number format'
        }
      }

      // Generate 6-digit OTP
      const otp = this.generateOTP()
      
      // Store OTP in database with 10-minute expiry
      const { error } = await supabase
        .from('otp_verifications')
        .insert({
          phone,
          otp,
          expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString()
        })

      if (error) {
        console.error('Error storing OTP:', error)
        return {
          success: false,
          message: 'Failed to send OTP. Please try again.'
        }
      }

      // In production, integrate with WhatsApp Business API
      // For demo, log the OTP
      console.log(`📱 WhatsApp OTP for ${phone}: ${otp}`)
      
      // Simulate WhatsApp message delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      return {
        success: true,
        message: 'OTP sent successfully to your WhatsApp'
      }
    } catch (error) {
      console.error('Send OTP error:', error)
      return {
        success: false,
        message: 'Failed to send OTP. Please try again.'
      }
    }
  }

  /**
   * Verify OTP and authenticate user
   */
  async verifyOTP(phone: string, otp: string): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
    try {
      // Find valid OTP
      const { data: otpRecord, error: otpError } = await supabase
        .from('otp_verifications')
        .select('*')
        .eq('phone', phone)
        .eq('otp', otp)
        .eq('is_used', false)
        .gte('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (otpError || !otpRecord) {
        return {
          success: false,
          error: 'Invalid or expired OTP'
        }
      }

      // Mark OTP as used
      await supabase
        .from('otp_verifications')
        .update({ is_used: true })
        .eq('id', otpRecord.id)

      // Create or get user
      const { data: user, error: userError } = await supabase
        .from('users')
        .upsert(
          { 
            phone, 
            is_verified: true,
            country_code: phone.startsWith('+91') ? '+91' : '+1'
          },
          { 
            onConflict: 'phone',
            ignoreDuplicates: false 
          }
        )
        .select()
        .single()

      if (userError || !user) {
        console.error('User creation error:', userError)
        return {
          success: false,
          error: 'Failed to create user account'
        }
      }

      // Create session (simplified - in production use proper JWT)
      const sessionData = {
        user_id: user.id,
        phone: user.phone,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      }

      // Store session in localStorage for demo
      if (typeof window !== 'undefined') {
        localStorage.setItem('shopabell_session', JSON.stringify(sessionData))
      }

      return {
        success: true,
        user: { ...user, session: sessionData }
      }
    } catch (error) {
      console.error('Verify OTP error:', error)
      return {
        success: false,
        error: 'Verification failed. Please try again.'
      }
    }
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      if (typeof window === 'undefined') return null

      const sessionStr = localStorage.getItem('shopabell_session')
      if (!sessionStr) return null

      const session = JSON.parse(sessionStr)
      
      // Check if session is expired
      if (new Date(session.expires_at) < new Date()) {
        this.logout()
        return null
      }

      // Fetch current user data
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user_id)
        .single()

      if (error || !user) {
        this.logout()
        return null
      }

      return { ...user, session }
    } catch (error) {
      console.error('Get current user error:', error)
      return null
    }
  }

  /**
   * Logout user
   */
  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('shopabell_session')
    }
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const user = await this.getCurrentUser()
    return user !== null
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, updates: Partial<User>): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)

      if (error) {
        return {
          success: false,
          error: 'Failed to update profile'
        }
      }

      return { success: true }
    } catch (error) {
      console.error('Update profile error:', error)
      return {
        success: false,
        error: 'Failed to update profile'
      }
    }
  }

  /**
   * Complete business onboarding
   */
  async completeOnboarding(userId: string, businessData: {
    business_name: string
    owner_name: string
    business_type: string
    business_address?: any
  }): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          ...businessData,
          onboarding_completed: true
        })
        .eq('id', userId)

      if (error) {
        return {
          success: false,
          error: 'Failed to complete onboarding'
        }
      }

      return { success: true }
    } catch (error) {
      console.error('Complete onboarding error:', error)
      return {
        success: false,
        error: 'Failed to complete onboarding'
      }
    }
  }

  /**
   * Private helper methods
   */
  private validatePhoneNumber(phone: string): boolean {
    // Indian phone number validation
    const indianPhoneRegex = /^\+91[6-9]\d{9}$/
    // Demo phone numbers for testing
    const demoPhones = ['+919999999991', '+919999999992', '+919999999993', '+919999999994']
    
    return indianPhoneRegex.test(phone) || demoPhones.includes(phone)
  }

  private generateOTP(): string {
    // For demo, use predictable OTP for demo phones
    const demoPhones = ['+919999999991', '+919999999992', '+919999999993', '+919999999994']
    return '123456' // Demo OTP for all users
    
    // In production, use random OTP:
    // return Math.floor(100000 + Math.random() * 900000).toString()
  }
}

// Export singleton instance
export const authService = new AuthService()