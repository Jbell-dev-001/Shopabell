// Enhanced type definitions for Supabase queries

export interface BuyerWithUser {
  id: string
  users: {
    name: string
    phone: string
  }
}

export interface ProductWithDetails {
  id: string
  name: string
  images: string[]
  category?: string
}

export interface PartnerWithApplication {
  id: string
  partnership_application_id: string
  partner_code: string
  commission_rate: number
  tier: string
  total_sales: number
  total_commission: number
  monthly_sales: number
  created_at: string
  features_enabled: {
    advanced_analytics: boolean
    priority_support: boolean
    custom_branding: boolean
    api_access: boolean
    bulk_operations: boolean
  }
  partnership_application?: {
    business_name: string
    contact_person: string
    email: string
    phone: string
    business_category: string
  }
}

export interface ChatWithRelations {
  id: string
  buyer_id: string
  seller_id: string
  product_id: string | null
  last_message_at: string
  status: string
  unread_count_seller: number
  priority: string
  buyer?: BuyerWithUser
  product?: ProductWithDetails
  last_message?: {
    content: string
    message_type: string
  }
}

export interface OrderWithRelations {
  id: string
  order_number: string
  created_at: string
  buyer_id: string
  product_id: string
  quantity: number
  total_amount: number
  order_status: string
  payment_status: string
  shipping_address: any
  tracking_number?: string
  shipping_status?: string
  shipping_cost?: number
  buyer?: BuyerWithUser
  product?: ProductWithDetails
}