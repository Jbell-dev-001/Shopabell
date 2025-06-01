// API endpoint for completing onboarding

import { NextRequest, NextResponse } from 'next/server'
import { whatsappOnboarding } from '@/lib/whatsapp/whatsapp-onboarding'

export async function POST(request: NextRequest) {
  try {
    const { sessionId, storeDetails } = await request.json()

    if (!sessionId || !storeDetails) {
      return NextResponse.json(
        { error: 'Session ID and store details are required' },
        { status: 400 }
      )
    }

    const result = await whatsappOnboarding.completeOnboarding(sessionId, storeDetails)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      sellerId: result.sellerId,
      message: 'Onboarding completed successfully! Welcome to ShopAbell!'
    })
  } catch (error) {
    console.error('Complete onboarding error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}