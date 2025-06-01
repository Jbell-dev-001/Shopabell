// WhatsApp Business API client for seller onboarding and messaging

export interface WhatsAppMessage {
  from: string
  to: string
  type: 'text' | 'media' | 'interactive' | 'template'
  text?: {
    body: string
  }
  media?: {
    url: string
    caption?: string
  }
  interactive?: {
    type: 'button' | 'list'
    header?: string
    body: string
    buttons?: Array<{
      id: string
      title: string
    }>
    list?: {
      sections: Array<{
        title: string
        rows: Array<{
          id: string
          title: string
          description?: string
        }>
      }>
    }
  }
  template?: {
    name: string
    language: string
    components: any[]
  }
}

export interface WhatsAppWebhookData {
  object: string
  entry: Array<{
    id: string
    changes: Array<{
      value: {
        messaging_product: string
        metadata: {
          display_phone_number: string
          phone_number_id: string
        }
        contacts?: Array<{
          profile: {
            name: string
          }
          wa_id: string
        }>
        messages?: Array<{
          from: string
          id: string
          timestamp: string
          type: string
          text?: {
            body: string
          }
          image?: {
            id: string
            mime_type: string
            sha256: string
          }
          voice?: {
            id: string
            mime_type: string
          }
          button?: {
            text: string
            payload: string
          }
          interactive?: {
            type: string
            button_reply?: {
              id: string
              title: string
            }
            list_reply?: {
              id: string
              title: string
              description: string
            }
          }
        }>
        statuses?: Array<{
          id: string
          status: 'sent' | 'delivered' | 'read' | 'failed'
          timestamp: string
          recipient_id: string
        }>
      }
      field: string
    }>
  }>
}

export class WhatsAppClient {
  private baseUrl = 'https://graph.facebook.com/v18.0'
  private accessToken: string
  private phoneNumberId: string

  constructor(accessToken: string, phoneNumberId: string) {
    this.accessToken = accessToken
    this.phoneNumberId = phoneNumberId
  }

  // Send a WhatsApp message
  async sendMessage(message: WhatsAppMessage): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/${this.phoneNumberId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(message)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to send message')
      }

      return {
        success: true,
        messageId: data.messages?.[0]?.id
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // Send welcome message to new seller
  async sendWelcomeMessage(phoneNumber: string, sellerName: string): Promise<boolean> {
    const message: WhatsAppMessage = {
      from: this.phoneNumberId,
      to: phoneNumber,
      type: 'template',
      template: {
        name: 'seller_welcome',
        language: 'en',
        components: [
          {
            type: 'body',
            parameters: [
              {
                type: 'text',
                text: sellerName
              }
            ]
          }
        ]
      }
    }

    const result = await this.sendMessage(message)
    return result.success
  }

  // Send onboarding instructions
  async sendOnboardingInstructions(phoneNumber: string): Promise<boolean> {
    const message: WhatsAppMessage = {
      from: this.phoneNumberId,
      to: phoneNumber,
      type: 'interactive',
      interactive: {
        type: 'button',
        header: '🛍️ Welcome to ShopAbell!',
        body: 'Let\'s set up your store in just a few steps:\n\n1️⃣ Upload your first product\n2️⃣ Add product details\n3️⃣ Start selling!\n\nWhat would you like to do first?',
        buttons: [
          {
            id: 'upload_product',
            title: '📷 Upload Product'
          },
          {
            id: 'view_dashboard',
            title: '📊 View Dashboard'
          }
        ]
      }
    }

    const result = await this.sendMessage(message)
    return result.success
  }

  // Send verification code
  async sendVerificationCode(phoneNumber: string, code: string): Promise<boolean> {
    const message: WhatsAppMessage = {
      from: this.phoneNumberId,
      to: phoneNumber,
      type: 'text',
      text: {
        body: `🔐 Your ShopAbell verification code is: ${code}\n\nThis code will expire in 10 minutes. Don't share this code with anyone.`
      }
    }

    const result = await this.sendMessage(message)
    return result.success
  }

  // Send order notification to seller
  async sendOrderNotification(phoneNumber: string, orderDetails: any): Promise<boolean> {
    const message: WhatsAppMessage = {
      from: this.phoneNumberId,
      to: phoneNumber,
      type: 'text',
      text: {
        body: `🎉 New Order Received!\n\nOrder #${orderDetails.id}\nProduct: ${orderDetails.productName}\nQuantity: ${orderDetails.quantity}\nAmount: ₹${orderDetails.amount}\nCustomer: ${orderDetails.customerName}\n\nLogin to your dashboard to process this order.`
      }
    }

    const result = await this.sendMessage(message)
    return result.success
  }

  // Send payment confirmation
  async sendPaymentConfirmation(phoneNumber: string, paymentDetails: any): Promise<boolean> {
    const message: WhatsAppMessage = {
      from: this.phoneNumberId,
      to: phoneNumber,
      type: 'text',
      text: {
        body: `💰 Payment Received!\n\nOrder #${paymentDetails.orderId}\nAmount: ₹${paymentDetails.amount}\nPayment Method: ${paymentDetails.method}\n\nFunds will be transferred to your account within 24 hours.`
      }
    }

    const result = await this.sendMessage(message)
    return result.success
  }

  // Send shipping reminder
  async sendShippingReminder(phoneNumber: string, orderDetails: any): Promise<boolean> {
    const message: WhatsAppMessage = {
      from: this.phoneNumberId,
      to: phoneNumber,
      type: 'interactive',
      interactive: {
        type: 'button',
        header: '📦 Ship Your Order',
        body: `Order #${orderDetails.id} is ready to ship!\n\nCustomer: ${orderDetails.customerName}\nAddress: ${orderDetails.shippingAddress}\n\nPlease confirm shipment:`,
        buttons: [
          {
            id: `ship_${orderDetails.id}`,
            title: '✅ Mark as Shipped'
          },
          {
            id: `delay_${orderDetails.id}`,
            title: '⏰ Need More Time'
          }
        ]
      }
    }

    const result = await this.sendMessage(message)
    return result.success
  }

  // Mark message as read
  async markAsRead(messageId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/${this.phoneNumberId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          status: 'read',
          message_id: messageId
        })
      })

      return response.ok
    } catch (error) {
      console.error('Failed to mark message as read:', error)
      return false
    }
  }

  // Get media from WhatsApp
  async getMedia(mediaId: string): Promise<{ url?: string; error?: string }> {
    try {
      // First get media info
      const infoResponse = await fetch(`${this.baseUrl}/${mediaId}`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      })

      if (!infoResponse.ok) {
        throw new Error('Failed to get media info')
      }

      const mediaInfo = await infoResponse.json()

      // Then get the actual media
      const mediaResponse = await fetch(mediaInfo.url, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      })

      if (!mediaResponse.ok) {
        throw new Error('Failed to download media')
      }

      return { url: mediaInfo.url }
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
}

// Singleton instance
let whatsappClient: WhatsAppClient | null = null

export function getWhatsAppClient(): WhatsAppClient {
  if (!whatsappClient) {
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN || 'demo_token'
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || 'demo_phone_id'

    // Only throw error in production or when actually using WhatsApp features
    if ((!accessToken || accessToken === 'demo_token') && process.env.NODE_ENV === 'production') {
      console.warn('WhatsApp credentials not configured - using demo mode')
    }

    whatsappClient = new WhatsAppClient(accessToken, phoneNumberId)
  }

  return whatsappClient
}