interface SellCommandResult {
  isValid: boolean
  price?: number
  quantity?: number
  variants?: Record<string, string>
  discount?: {
    type: 'percentage' | 'fixed'
    value: number
  }
  paymentMethod?: 'cod' | 'upi' | 'card'
  error?: string
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
  
  // Color detection
  const colors = ['red', 'blue', 'green', 'yellow', 'black', 'white', 'pink', 'purple', 'orange', 'brown', 'grey', 'gray']
  for (const color of colors) {
    if (remaining.includes(color)) {
      variants.color = color
      remaining = remaining.replace(color, '').trim()
    }
  }
  
  // Size detection
  const sizes = ['xs', 'small', 'medium', 'large', 'xl', 'xxl', 'xxxl', 's', 'm', 'l']
  for (const size of sizes) {
    if (remaining.includes(size)) {
      variants.size = size.toUpperCase()
      remaining = remaining.replace(size, '').trim()
    }
  }
  
  // Material detection
  const materials = ['cotton', 'silk', 'polyester', 'wool', 'leather', 'denim', 'linen']
  for (const material of materials) {
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