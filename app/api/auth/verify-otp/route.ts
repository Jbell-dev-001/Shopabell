import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'
import { phoneSchema, otpSchema } from '@/lib/auth/utils'

export async function POST(request: NextRequest) {
  try {
    const { phone, otp } = await request.json()

    // Validate inputs
    try {
      phoneSchema.parse(phone)
      otpSchema.parse(otp)
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Invalid phone number or OTP format' },
        { status: 400 }
      )
    }

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
      return NextResponse.json(
        { success: false, error: 'Invalid or expired OTP' },
        { status: 400 }
      )
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
      return NextResponse.json(
        { success: false, error: 'Failed to create user account' },
        { status: 500 }
      )
    }

    // Create session token (simplified for demo)
    const sessionData = {
      user_id: user.id,
      phone: user.phone,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    }

    return NextResponse.json({
      success: true,
      user: { ...user, session: sessionData }
    })

  } catch (error) {
    console.error('Verify OTP error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}