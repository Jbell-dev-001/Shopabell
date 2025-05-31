export interface ShippingAddress {
  name: string
  phone: string
  address_line_1: string
  address_line_2?: string
  city: string
  state: string
  pincode: string
}

export interface ShippingRate {
  courier_id: string
  courier_name: string
  service_type: string
  estimated_delivery_days: number
  cost: number
  cod_available: boolean
  tracking_available: boolean
}

export interface CourierPartner {
  id: string
  name: string
  logo: string
  services: string[]
  cod_limit: number
  weight_limit_kg: number
}

// Simulated courier partners
const COURIER_PARTNERS: CourierPartner[] = [
  {
    id: 'bluedart',
    name: 'BlueDart Express',
    logo: '/couriers/bluedart.png',
    services: ['express', 'surface'],
    cod_limit: 50000,
    weight_limit_kg: 10
  },
  {
    id: 'delhivery',
    name: 'Delhivery',
    logo: '/couriers/delhivery.png',
    services: ['express', 'surface', 'cod'],
    cod_limit: 25000,
    weight_limit_kg: 20
  },
  {
    id: 'ekart',
    name: 'Ekart Logistics',
    logo: '/couriers/ekart.png',
    services: ['standard', 'express', 'cod'],
    cod_limit: 15000,
    weight_limit_kg: 15
  },
  {
    id: 'dtdc',
    name: 'DTDC Express',
    logo: '/couriers/dtdc.png',
    services: ['express', 'economy'],
    cod_limit: 30000,
    weight_limit_kg: 12
  }
]

// Distance calculation (simplified)
function calculateDistance(fromPincode: string, toPincode: string): number {
  // Simulate distance based on pincode difference
  const from = parseInt(fromPincode)
  const to = parseInt(toPincode)
  const diff = Math.abs(from - to)
  
  if (diff < 50) return 50 + Math.random() * 100 // 50-150 km
  if (diff < 100) return 150 + Math.random() * 200 // 150-350 km
  if (diff < 500) return 350 + Math.random() * 500 // 350-850 km
  return 850 + Math.random() * 1000 // 850-1850 km
}

// Weight-based pricing
function calculateBaseCost(distance: number, weight: number, serviceType: string): number {
  let baseCost = 0
  
  // Distance factor
  if (distance < 100) baseCost = 40
  else if (distance < 500) baseCost = 60
  else if (distance < 1000) baseCost = 80
  else baseCost = 120
  
  // Weight factor
  baseCost += Math.ceil(weight) * 10
  
  // Service type factor
  switch (serviceType) {
    case 'express':
      baseCost *= 1.5
      break
    case 'surface':
    case 'economy':
      baseCost *= 0.8
      break
    default:
      baseCost *= 1.0
  }
  
  return Math.round(baseCost)
}

export function calculateShippingRates(
  fromPincode: string,
  toPincode: string,
  weight: number, // in kg
  codAmount?: number
): ShippingRate[] {
  const distance = calculateDistance(fromPincode, toPincode)
  const rates: ShippingRate[] = []
  
  COURIER_PARTNERS.forEach(courier => {
    courier.services.forEach(service => {
      // Check weight limit
      if (weight > courier.weight_limit_kg) return
      
      // Check COD limit
      const codAvailable = service === 'cod' || 
        Boolean(codAmount && codAmount <= courier.cod_limit)
      
      const baseCost = calculateBaseCost(distance, weight, service)
      
      // Add courier-specific markup
      let finalCost = baseCost
      switch (courier.id) {
        case 'bluedart':
          finalCost *= 1.2 // Premium pricing
          break
        case 'delhivery':
          finalCost *= 1.1
          break
        case 'ekart':
          finalCost *= 0.9 // Competitive pricing
          break
        case 'dtdc':
          finalCost *= 1.0
          break
      }
      
      // COD charges
      if (codAmount && codAvailable) {
        finalCost += Math.max(20, codAmount * 0.02) // 2% COD charges, min ₹20
      }
      
      // Estimate delivery days
      let deliveryDays = 1
      if (distance < 100) deliveryDays = service === 'express' ? 1 : 2
      else if (distance < 500) deliveryDays = service === 'express' ? 2 : 4
      else if (distance < 1000) deliveryDays = service === 'express' ? 3 : 6
      else deliveryDays = service === 'express' ? 4 : 8
      
      rates.push({
        courier_id: courier.id,
        courier_name: courier.name,
        service_type: service,
        estimated_delivery_days: deliveryDays,
        cost: Math.round(finalCost),
        cod_available: codAvailable,
        tracking_available: true
      })
    })
  })
  
  // Sort by cost
  return rates.sort((a, b) => a.cost - b.cost)
}

export function getCourierById(courierId: string): CourierPartner | undefined {
  return COURIER_PARTNERS.find(c => c.id === courierId)
}

export function validatePincode(pincode: string): boolean {
  // Indian pincode validation
  return /^[1-9][0-9]{5}$/.test(pincode)
}

export function estimatePackageWeight(items: Array<{quantity: number, weight?: number}>): number {
  // Default weight assumptions if not provided
  const totalWeight = items.reduce((sum, item) => {
    const itemWeight = item.weight || 0.5 // Default 500g per item
    return sum + (item.quantity * itemWeight)
  }, 0)
  
  // Add packaging weight (100g minimum)
  return Math.max(0.1, totalWeight + 0.1)
}

export function generateTrackingNumber(courierId: string): string {
  const prefix = courierId.toUpperCase().substring(0, 3)
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  
  return `${prefix}${timestamp}${random}`
}