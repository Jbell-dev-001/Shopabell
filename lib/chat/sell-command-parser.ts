export interface SellCommandResult {
  isValid: boolean
  price?: number
  quantity?: number
  variants?: Record<string, string>
  discount?: {
    type: 'percentage' | 'fixed'
    value: number
  }
  paymentMethod?: 'cod' | 'upi' | 'card'
  shipping?: {
    express?: boolean
    address?: string
  }
  error?: string
}

// Enhanced patterns for Indian market
const INDIAN_SIZES = {
  clothing: ['xs', 's', 'm', 'l', 'xl', 'xxl', 'xxxl', 'free size', 'one size', '32', '34', '36', '38', '40', '42', '44'],
  jewelry: ['adjustable', 'free size', '2.4', '2.6', '2.8', '16', '17', '18', '19', '20', '21', '22'],
  footwear: ['6', '7', '8', '9', '10', '11', '36', '37', '38', '39', '40', '41', '42']
}

const INDIAN_COLORS = {
  traditional: ['gold', 'silver', 'maroon', 'mehendi', 'turquoise', 'coral', 'ivory', 'beige'],
  modern: ['red', 'blue', 'green', 'yellow', 'black', 'white', 'pink', 'purple', 'orange', 'brown', 'grey', 'gray'],
  patterns: ['floral', 'printed', 'embroidered', 'sequined', 'plain', 'striped']
}

const MATERIALS = {
  clothing: ['cotton', 'silk', 'polyester', 'wool', 'leather', 'denim', 'linen', 'georgette', 'chiffon', 'velvet', 'satin', 'rayon'],
  jewelry: ['gold', 'silver', 'brass', 'copper', 'oxidized', 'german silver', 'kundan', 'pearl', 'diamond', 'gemstone']
}

export function parseSellCommand(message: string): SellCommandResult {
  // Normalize the message
  const normalized = message.toLowerCase().trim()
  
  // Check if it's a sell command
  if (!normalized.startsWith('sell ')) {
    return { isValid: false, error: 'Not a sell command' }
  }
  
  // Remove 'sell ' prefix
  const commandParts = normalized.slice(5).trim()
  
  // Extract price (required)
  const priceMatch = commandParts.match(/^(\d+(?:\.\d{1,2})?)/);
  if (!priceMatch) {
    return { isValid: false, error: 'Price is required' }
  }
  
  const price = parseFloat(priceMatch[1])
  if (price <= 0) {
    return { isValid: false, error: 'Price must be positive' }
  }
  
  let remaining = commandParts.slice(priceMatch[0].length).trim()
  
  const result: SellCommandResult = {
    isValid: true,
    price,
    quantity: 1
  }
  
  // Extract quantity variations
  const quantityPatterns = [
    /x(\d+)/,           // x2, x3
    /qty\s*(\d+)/,      // qty 2
    /(\d+)\s*pcs/,      // 2pcs
    /(\d+)\s*pieces?/   // 2 pieces
  ]
  
  for (const pattern of quantityPatterns) {
    const match = remaining.match(pattern)
    if (match) {
      result.quantity = parseInt(match[1])
      remaining = remaining.replace(match[0], '').trim()
      break
    }
  }
  
  // Extract variants (color, size, material)
  const variants: Record<string, string> = {}
  
  // Color detection (enhanced for Indian market)
  const allColors = [...INDIAN_COLORS.traditional, ...INDIAN_COLORS.modern, ...INDIAN_COLORS.patterns]
  for (const color of allColors) {
    if (remaining.includes(color)) {
      variants.color = color
      remaining = remaining.replace(color, '').trim()
    }
  }
  
  // Size detection (enhanced)
  const allSizes = [...INDIAN_SIZES.clothing, ...INDIAN_SIZES.jewelry, ...INDIAN_SIZES.footwear]
  for (const size of allSizes) {
    const sizePattern = new RegExp(`\\b${size}\\b`, 'i')
    if (sizePattern.test(remaining)) {
      variants.size = size.toUpperCase()
      remaining = remaining.replace(sizePattern, '').trim()
    }
  }
  
  // Material detection (enhanced)
  const allMaterials = [...MATERIALS.clothing, ...MATERIALS.jewelry]
  for (const material of allMaterials) {
    if (remaining.includes(material)) {
      variants.material = material
      remaining = remaining.replace(material, '').trim()
    }
  }
  
  if (Object.keys(variants).length > 0) {
    result.variants = variants
  }
  
  // Extract discount
  const percentDiscountMatch = remaining.match(/(\d+)%\s*off/)
  const fixedDiscountMatch = remaining.match(/(\d+)\s*off/)
  
  if (percentDiscountMatch) {
    result.discount = {
      type: 'percentage',
      value: parseInt(percentDiscountMatch[1])
    }
    remaining = remaining.replace(percentDiscountMatch[0], '').trim()
  } else if (fixedDiscountMatch) {
    result.discount = {
      type: 'fixed',
      value: parseInt(fixedDiscountMatch[1])
    }
    remaining = remaining.replace(fixedDiscountMatch[0], '').trim()
  }
  
  // Extract payment method preference
  if (remaining.includes('cod')) {
    result.paymentMethod = 'cod'
  } else if (remaining.includes('upi')) {
    result.paymentMethod = 'upi'
  } else if (remaining.includes('card')) {
    result.paymentMethod = 'card'
  }
  
  // Extract shipping preferences
  if (remaining.includes('express') || remaining.includes('fast')) {
    result.shipping = { express: true }
  }
  
  return result
}

// Helper function to extract product details from natural language
export function extractProductFromMessage(message: string): {
  productRef?: string
  description?: string
} {
  const result: any = {}
  
  // Check for "this" or "that" references
  if (message.includes('this') || message.includes('that')) {
    result.productRef = 'context'
  }
  
  // Check for specific product references
  const productPatterns = [
    /product #?(\d+)/i,
    /item #?(\d+)/i,
    /#(\d+)/
  ]
  
  for (const pattern of productPatterns) {
    const match = message.match(pattern)
    if (match) {
      result.productRef = match[1]
      break
    }
  }
  
  // Extract descriptive terms
  const descriptiveWords = message.split(' ').filter(word => 
    word.length > 3 && !['sell', 'this', 'that', 'with', 'for'].includes(word)
  )
  
  if (descriptiveWords.length > 0) {
    result.description = descriptiveWords.join(' ')
  }
  
  return result
}

export function generateOrderFromCommand(
  command: SellCommandResult,
  productId: string,
  buyerId: string,
  sellerId: string
): any {
  if (!command.isValid || !command.price) {
    throw new Error('Invalid command')
  }
  
  const basePrice = command.price
  let finalPrice = basePrice * (command.quantity || 1)
  
  // Apply discount
  if (command.discount) {
    if (command.discount.type === 'percentage') {
      finalPrice = finalPrice * (1 - command.discount.value / 100)
    } else {
      finalPrice = Math.max(0, finalPrice - command.discount.value)
    }
  }
  
  return {
    product_id: productId,
    buyer_id: buyerId,
    seller_id: sellerId,
    quantity: command.quantity || 1,
    unit_price: basePrice,
    discount_amount: basePrice * (command.quantity || 1) - finalPrice,
    total_amount: finalPrice,
    payment_method: command.paymentMethod || 'upi',
    variants: command.variants || null,
    created_via: 'chat'
  }
}