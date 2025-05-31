import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateOTP, storeOTP, sendOTP } from '@/lib/auth/utils'

// WhatsApp webhook verification
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token === process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN) {
    console.log('WhatsApp webhook verified')
    return new NextResponse(challenge, { status: 200 })
  }

  return NextResponse.json({ error: 'Invalid verification token' }, { status: 403 })
}

// Handle incoming WhatsApp messages
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const supabase = await createClient()

    // Process each message
    if (body.entry && body.entry.length > 0) {
      for (const entry of body.entry) {
        const changes = entry.changes || []
        
        for (const change of changes) {
          if (change.field === 'messages') {
            const messages = change.value.messages || []
            
            for (const message of messages) {
              await processWhatsAppMessage(message, supabase)
            }
          }
        }
      }
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('WhatsApp webhook error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function processWhatsAppMessage(message: any, supabase: any) {
  const phone = message.from
  const text = message.text?.body?.toLowerCase() || ''
  
  // Check if user exists
  const { data: existingUser } = await supabase
    .from('users')
    .select('*')
    .eq('phone', `+${phone}`)
    .single()

  if (!existingUser) {
    // Start onboarding flow
    await sendWhatsAppMessage(phone, getWelcomeMessage())
    await createOnboardingSession(phone, supabase)
  } else {
    // Handle existing user messages
    // TODO: Implement chat commerce logic
    await sendWhatsAppMessage(phone, "Welcome back! How can I help you today?")
  }
}

async function createOnboardingSession(phone: string, supabase: any) {
  // Store onboarding session in a temporary table or cache
  // This is a simplified version - in production, use Redis or similar
  const sessionData = {
    phone: `+${phone}`,
    step: 'language_selection',
    data: {},
    created_at: new Date().toISOString()
  }
  
  // For now, we'll store in localStorage or a temporary table
  console.log('Created onboarding session:', sessionData)
}

async function sendWhatsAppMessage(to: string, message: string) {
  // In production, this would call the actual WhatsApp Business API
  console.log(`[WhatsApp Simulation] Sending to ${to}: ${message}`)
  
  // Simulate API call
  const mockResponse = {
    messaging_product: 'whatsapp',
    to,
    type: 'text',
    text: { body: message }
  }
  
  return mockResponse
}

function getWelcomeMessage(): string {
  return `🎉 Welcome to ShopAbell!

Transform your business with India's smartest commerce platform.

Please choose your language:
1️⃣ English
2️⃣ हिंदी
3️⃣ বাংলা
4️⃣ தமிழ்
5️⃣ తెలుగు

Reply with a number (1-5)`
}

// Onboarding flow messages
const onboardingMessages = {
  business_name: "What's your business name? 🏪",
  business_category: `What do you sell? Choose one:

1️⃣ Fashion & Clothing
2️⃣ Beauty & Cosmetics
3️⃣ Electronics & Gadgets
4️⃣ Home & Kitchen
5️⃣ Jewelry & Accessories
6️⃣ Books & Stationery
7️⃣ Sports & Fitness
8️⃣ Food & Beverages

Reply with a number (1-8)`,
  pickup_address: "Please share your pickup address for orders (where we'll collect products from)",
  upi_id: "Share your UPI ID to receive instant payments (Example: yourname@paytm)",
  success: `🎉 Congratulations! Your ShopAbell store is ready!

🔗 Your store: shopabell.com/{store_slug}
💰 Payment UPI: {upi_id}@shopabell
📱 Download app: {app_link}

Start adding products now! Reply 'HELP' anytime for assistance.`
}