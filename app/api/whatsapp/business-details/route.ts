// API endpoint for saving business details

import { NextRequest, NextResponse } from 'next/server'
import { whatsappOnboarding } from '@/lib/whatsapp/whatsapp-onboarding'

export async function POST(request: NextRequest) {
  try {
    const { sessionId, businessDetails } = await request.json()

    if (!sessionId || !businessDetails) {
      return NextResponse.json(
        { error: 'Session ID and business details are required' },
        { status: 400 }
      )
    }

    const result = await whatsappOnboarding.saveBusinessDetails(sessionId, businessDetails)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Business details saved successfully'
    })
  } catch (error) {
    console.error('Business details error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}