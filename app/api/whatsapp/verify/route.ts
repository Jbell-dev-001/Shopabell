// API endpoint for WhatsApp verification

import { NextRequest, NextResponse } from 'next/server'
import { whatsappOnboarding } from '@/lib/whatsapp/whatsapp-onboarding'

export async function POST(request: NextRequest) {
  try {
    const { sessionId, code } = await request.json()

    if (!sessionId || !code) {
      return NextResponse.json(
        { error: 'Session ID and verification code are required' },
        { status: 400 }
      )
    }

    const result = await whatsappOnboarding.verifyPhone(sessionId, code)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Phone number verified successfully'
    })
  } catch (error) {
    console.error('Verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}