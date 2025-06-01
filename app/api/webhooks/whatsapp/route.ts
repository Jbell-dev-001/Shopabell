import { NextRequest, NextResponse } from 'next/server'
import { whatsappOnboarding } from '@/lib/whatsapp/whatsapp-onboarding'
import type { WhatsAppWebhookData } from '@/lib/whatsapp/whatsapp-client'

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
    const body: WhatsAppWebhookData = await request.json()
    console.log('WhatsApp webhook received:', JSON.stringify(body, null, 2))

    // Process incoming messages
    if (body.object === 'whatsapp_business_account') {
      for (const entry of body.entry) {
        for (const change of entry.changes) {
          if (change.field === 'messages' && change.value.messages) {
            for (const message of change.value.messages) {
              const phoneNumber = message.from
              let messageText = ''

              // Extract message text based on type
              if (message.type === 'text' && message.text) {
                messageText = message.text.body
              } else if (message.type === 'button' && message.button) {
                messageText = message.button.text
              } else if (message.type === 'interactive' && message.interactive) {
                if (message.interactive.button_reply) {
                  messageText = message.interactive.button_reply.title
                } else if (message.interactive.list_reply) {
                  messageText = message.interactive.list_reply.title
                }
              }

              if (messageText && phoneNumber) {
                // Process the message through onboarding system
                await whatsappOnboarding.processWebhookMessage(phoneNumber, messageText)
              }
            }
          }

          // Handle message status updates
          if (change.field === 'messages' && change.value.statuses) {
            for (const status of change.value.statuses) {
              console.log(`Message ${status.id} status: ${status.status}`)
              // Handle delivery confirmations, read receipts, etc.
            }
          }
        }
      }
    }

    return NextResponse.json({ status: 'ok' })
  } catch (error) {
    console.error('WhatsApp webhook error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}