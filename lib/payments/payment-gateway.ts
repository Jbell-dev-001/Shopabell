// Decentro-style payment gateway simulation

// Simple UUID generator for demo purposes
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

export interface PaymentRequest {
  amount: number
  currency?: string
  orderId: string
  customerPhone: string
  customerName: string
  paymentMethod: 'upi' | 'card' | 'netbanking' | 'wallet'
  upiId?: string
  cardDetails?: {
    number: string
    expiry: string
    cvv: string
  }
}

export interface PaymentResponse {
  success: boolean
  transactionId: string
  gatewayTransactionId: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  amount: number
  fees: number
  netAmount: number
  timestamp: string
  message?: string
  errorCode?: string
}

export interface VirtualAccount {
  accountNumber: string
  ifscCode: string
  bankName: string
  upiId: string
  qrCode: string
}

export class PaymentGateway {
  private static readonly PROCESSING_FEE_PERCENTAGE = 2.5 // 2.5% processing fee
  private static readonly MIN_PROCESSING_FEE = 1 // Minimum ₹1 fee
  private static readonly MAX_PROCESSING_FEE = 100 // Maximum ₹100 fee
  
  // Simulate payment processing
  static async processPayment(request: PaymentRequest): Promise<PaymentResponse> {
    // Simulate network delay
    await PaymentGateway.simulateDelay(1000, 3000)
    
    const transactionId = `TXN${Date.now()}${Math.random().toString(36).substr(2, 9)}`.toUpperCase()
    const gatewayTransactionId = `DCTR${generateUUID().replace(/-/g, '').substr(0, 16)}`.toUpperCase()
    
    // Calculate fees
    const fees = this.calculateProcessingFee(request.amount)
    const netAmount = request.amount - fees
    
    // Simulate different payment outcomes
    const successRate = 0.95 // 95% success rate
    const isSuccess = Math.random() < successRate
    
    if (!isSuccess) {
      // Simulate different failure scenarios
      const failureReasons = [
        { code: 'INSUFFICIENT_BALANCE', message: 'Insufficient balance in account' },
        { code: 'PAYMENT_DECLINED', message: 'Payment declined by bank' },
        { code: 'TECHNICAL_ERROR', message: 'Technical error, please try again' },
        { code: 'TIMEOUT', message: 'Payment timeout, please retry' }
      ]
      
      const reason = failureReasons[Math.floor(Math.random() * failureReasons.length)]
      
      return {
        success: false,
        transactionId,
        gatewayTransactionId,
        status: 'failed',
        amount: request.amount,
        fees: 0,
        netAmount: request.amount,
        timestamp: new Date().toISOString(),
        message: reason.message,
        errorCode: reason.code
      }
    }
    
    // Successful payment
    return {
      success: true,
      transactionId,
      gatewayTransactionId,
      status: 'completed',
      amount: request.amount,
      fees,
      netAmount,
      timestamp: new Date().toISOString(),
      message: 'Payment successful'
    }
  }
  
  // Generate virtual account for seller
  static generateVirtualAccount(sellerId: string, businessName: string): VirtualAccount {
    const accountNumber = `VA${Date.now().toString().substr(-10)}`
    const upiId = `${businessName.toLowerCase().replace(/\s+/g, '')}.${accountNumber}@decentro`
    
    return {
      accountNumber,
      ifscCode: 'DCTR0001234',
      bankName: 'Decentro Virtual Bank',
      upiId,
      qrCode: `upi://pay?pa=${upiId}&pn=${encodeURIComponent(businessName)}&cu=INR`
    }
  }
  
  // Check payment status
  static async checkPaymentStatus(transactionId: string): Promise<PaymentResponse> {
    await PaymentGateway.simulateDelay(500, 1000)
    
    // Simulate status check
    return {
      success: true,
      transactionId,
      gatewayTransactionId: `DCTR${generateUUID().replace(/-/g, '').substr(0, 16)}`.toUpperCase(),
      status: 'completed',
      amount: 0, // Would be fetched from database in real implementation
      fees: 0,
      netAmount: 0,
      timestamp: new Date().toISOString(),
      message: 'Payment completed successfully'
    }
  }
  
  // Initiate refund
  static async initiateRefund(
    originalTransactionId: string,
    amount: number,
    reason: string
  ): Promise<{
    success: boolean
    refundId: string
    status: string
    message: string
  }> {
    await PaymentGateway.simulateDelay(1000, 2000)
    
    const refundId = `RFD${Date.now()}${Math.random().toString(36).substr(2, 9)}`.toUpperCase()
    
    return {
      success: true,
      refundId,
      status: 'processing',
      message: 'Refund initiated successfully. Amount will be credited in 3-5 business days.'
    }
  }
  
  // Generate payment link
  static generatePaymentLink(
    orderId: string,
    amount: number,
    description: string,
    expiryHours: number = 24
  ): {
    paymentLink: string
    linkId: string
    expiresAt: string
  } {
    const linkId = `LINK${Date.now()}${Math.random().toString(36).substr(2, 9)}`.toUpperCase()
    const expiresAt = new Date(Date.now() + expiryHours * 60 * 60 * 1000).toISOString()
    
    return {
      paymentLink: `https://pay.shopabell.com/${linkId}`,
      linkId,
      expiresAt
    }
  }
  
  // Calculate processing fee
  private static calculateProcessingFee(amount: number): number {
    const percentageFee = amount * (this.PROCESSING_FEE_PERCENTAGE / 100)
    return Math.min(
      Math.max(percentageFee, this.MIN_PROCESSING_FEE),
      this.MAX_PROCESSING_FEE
    )
  }
  
  // Simulate network delay
  public static simulateDelay(min: number, max: number): Promise<void> {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min
    return new Promise(resolve => setTimeout(resolve, delay))
  }
  
  // Validate UPI ID
  static validateUpiId(upiId: string): boolean {
    const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/
    return upiRegex.test(upiId)
  }
  
  // Validate card details
  static validateCardDetails(cardDetails: any): {
    isValid: boolean
    errors: string[]
  } {
    const errors: string[] = []
    
    // Validate card number (simplified Luhn check)
    if (!cardDetails.number || !/^\d{16}$/.test(cardDetails.number.replace(/\s/g, ''))) {
      errors.push('Invalid card number')
    }
    
    // Validate expiry
    if (!cardDetails.expiry || !/^(0[1-9]|1[0-2])\/\d{2}$/.test(cardDetails.expiry)) {
      errors.push('Invalid expiry date (MM/YY)')
    }
    
    // Validate CVV
    if (!cardDetails.cvv || !/^\d{3,4}$/.test(cardDetails.cvv)) {
      errors.push('Invalid CVV')
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }
}

// Settlement service for sellers
export class SettlementService {
  static async getSettlementSummary(sellerId: string, dateRange?: {
    from: Date
    to: Date
  }): Promise<{
    totalSales: number
    totalFees: number
    netAmount: number
    pendingSettlement: number
    settledAmount: number
    nextSettlementDate: string
    settlements: Array<{
      id: string
      amount: number
      date: string
      status: string
      bankReference: string
    }>
  }> {
    await PaymentGateway.simulateDelay(500, 1000)
    
    // Simulated data
    const totalSales = 125000
    const totalFees = 3125
    const netAmount = totalSales - totalFees
    const settledAmount = 100000
    const pendingSettlement = netAmount - settledAmount
    
    return {
      totalSales,
      totalFees,
      netAmount,
      pendingSettlement,
      settledAmount,
      nextSettlementDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      settlements: [
        {
          id: 'SET001',
          amount: 50000,
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'completed',
          bankReference: 'DCTR2024010101'
        },
        {
          id: 'SET002',
          amount: 50000,
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'completed',
          bankReference: 'DCTR2024010501'
        }
      ]
    }
  }
}