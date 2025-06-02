import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'
import { phoneSchema } from '@/lib/auth/utils'

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json()

    // Validate phone number
    try {
      phoneSchema.parse(phone)
    } catch (error) {
      return NextResponse.json(
        { success: false, message: 'Invalid phone number format' },
        { status: 400 }
      )
    }

    // Generate OTP (demo: always 123456 for testing)
    const otp = '123456'
    
    // Store OTP in database with 10-minute expiry
    const { error } = await supabase
      .from('otp_verifications')
      .insert({
        phone,
        otp,
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString()
      })

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { success: false, message: 'Failed to send OTP' },
        { status: 500 }
      )
    }

    // In production, integrate with WhatsApp Business API
    console.log(`📱 WhatsApp OTP for ${phone}: ${otp}`)

    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully to your WhatsApp'
    })

  } catch (error) {
    console.error('Send OTP error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}