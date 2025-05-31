export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          phone: string
          name: string | null
          email: string | null
          role: 'seller' | 'buyer' | 'admin' | 'group_admin'
          language_preference: string
          profile_image: string | null
          created_at: string
          last_active: string | null
          is_verified: boolean
          verification_documents: Json | null
          device_info: Json | null
          timezone: string | null
          app_version: string | null
        }
        Insert: {
          id?: string
          phone: string
          name?: string | null
          email?: string | null
          role?: 'seller' | 'buyer' | 'admin' | 'group_admin'
          language_preference?: string
          profile_image?: string | null
          created_at?: string
          last_active?: string | null
          is_verified?: boolean
          verification_documents?: Json | null
          device_info?: Json | null
          timezone?: string | null
          app_version?: string | null
        }
        Update: {
          id?: string
          phone?: string
          name?: string | null
          email?: string | null
          role?: 'seller' | 'buyer' | 'admin' | 'group_admin'
          language_preference?: string
          profile_image?: string | null
          created_at?: string
          last_active?: string | null
          is_verified?: boolean
          verification_documents?: Json | null
          device_info?: Json | null
          timezone?: string | null
          app_version?: string | null
        }
      }
      sellers: {
        Row: {
          id: string
          business_name: string
          business_category: string
          upi_id: string | null
          bank_account: string | null
          ifsc_code: string | null
          pan_number: string | null
          aadhaar_number: string | null
          gstin: string | null
          pickup_address: Json | null
          virtual_account_number: string | null
          virtual_upi_id: string | null
          subscription_plan: 'free' | 'basic' | 'premium'
          subscription_expires: string | null
          subscription_payment_history: Json | null
          onboarding_completed: boolean
          onboarding_step: number
          verification_status: 'pending' | 'verified' | 'rejected'
          store_slug: string
          store_theme: string
          store_settings: Json | null
          business_hours: Json | null
          auto_reply_enabled: boolean
          auto_reply_message: string | null
          commission_rate: number
          referred_by: string | null
          total_sales: number
          total_orders: number
          rating: number
          review_count: number
          last_live_session: string | null
          preferred_couriers: Json | null
          shipping_settings: Json | null
          tax_settings: Json | null
        }
        Insert: {
          id: string
          business_name: string
          business_category: string
          upi_id?: string | null
          bank_account?: string | null
          ifsc_code?: string | null
          pan_number?: string | null
          aadhaar_number?: string | null
          gstin?: string | null
          pickup_address?: Json | null
          virtual_account_number?: string | null
          virtual_upi_id?: string | null
          subscription_plan?: 'free' | 'basic' | 'premium'
          subscription_expires?: string | null
          subscription_payment_history?: Json | null
          onboarding_completed?: boolean
          onboarding_step?: number
          verification_status?: 'pending' | 'verified' | 'rejected'
          store_slug: string
          store_theme?: string
          store_settings?: Json | null
          business_hours?: Json | null
          auto_reply_enabled?: boolean
          auto_reply_message?: string | null
          commission_rate?: number
          referred_by?: string | null
          total_sales?: number
          total_orders?: number
          rating?: number
          review_count?: number
          last_live_session?: string | null
          preferred_couriers?: Json | null
          shipping_settings?: Json | null
          tax_settings?: Json | null
        }
        Update: {
          id?: string
          business_name?: string
          business_category?: string
          upi_id?: string | null
          bank_account?: string | null
          ifsc_code?: string | null
          pan_number?: string | null
          aadhaar_number?: string | null
          gstin?: string | null
          pickup_address?: Json | null
          virtual_account_number?: string | null
          virtual_upi_id?: string | null
          subscription_plan?: 'free' | 'basic' | 'premium'
          subscription_expires?: string | null
          subscription_payment_history?: Json | null
          onboarding_completed?: boolean
          onboarding_step?: number
          verification_status?: 'pending' | 'verified' | 'rejected'
          store_slug?: string
          store_theme?: string
          store_settings?: Json | null
          business_hours?: Json | null
          auto_reply_enabled?: boolean
          auto_reply_message?: string | null
          commission_rate?: number
          referred_by?: string | null
          total_sales?: number
          total_orders?: number
          rating?: number
          review_count?: number
          last_live_session?: string | null
          preferred_couriers?: Json | null
          shipping_settings?: Json | null
          tax_settings?: Json | null
        }
      }
      products: {
        Row: {
          id: string
          seller_id: string
          name: string
          description: string | null
          short_description: string | null
          price: number
          original_price: number | null
          cost_price: number | null
          images: Json | null
          variants: Json | null
          stock_quantity: number
          reserved_stock: number
          low_stock_threshold: number
          category: string | null
          subcategory: string | null
          tags: Json | null
          brand: string | null
          model: string | null
          weight: number | null
          dimensions: Json | null
          is_active: boolean
          is_featured: boolean
          created_from: 'manual' | 'livestream' | 'import' | 'whatsapp' | 'social'
          livestream_session_id: string | null
          source_timestamp: number | null
          source_url: string | null
          seo_title: string | null
          seo_description: string | null
          meta_keywords: Json | null
          view_count: number
          like_count: number
          share_count: number
          conversion_rate: number
          last_sold_at: string | null
          featured_until: string | null
          discount_percentage: number | null
          discount_start_date: string | null
          discount_end_date: string | null
          shipping_cost: number | null
          cod_available: boolean
          return_policy: string | null
          warranty_info: string | null
          care_instructions: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          seller_id: string
          name: string
          description?: string | null
          short_description?: string | null
          price: number
          original_price?: number | null
          cost_price?: number | null
          images?: Json | null
          variants?: Json | null
          stock_quantity?: number
          reserved_stock?: number
          low_stock_threshold?: number
          category?: string | null
          subcategory?: string | null
          tags?: Json | null
          brand?: string | null
          model?: string | null
          weight?: number | null
          dimensions?: Json | null
          is_active?: boolean
          is_featured?: boolean
          created_from?: 'manual' | 'livestream' | 'import' | 'whatsapp' | 'social'
          livestream_session_id?: string | null
          source_timestamp?: number | null
          source_url?: string | null
          seo_title?: string | null
          seo_description?: string | null
          meta_keywords?: Json | null
          view_count?: number
          like_count?: number
          share_count?: number
          conversion_rate?: number
          last_sold_at?: string | null
          featured_until?: string | null
          discount_percentage?: number | null
          discount_start_date?: string | null
          discount_end_date?: string | null
          shipping_cost?: number | null
          cod_available?: boolean
          return_policy?: string | null
          warranty_info?: string | null
          care_instructions?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          seller_id?: string
          name?: string
          description?: string | null
          short_description?: string | null
          price?: number
          original_price?: number | null
          cost_price?: number | null
          images?: Json | null
          variants?: Json | null
          stock_quantity?: number
          reserved_stock?: number
          low_stock_threshold?: number
          category?: string | null
          subcategory?: string | null
          tags?: Json | null
          brand?: string | null
          model?: string | null
          weight?: number | null
          dimensions?: Json | null
          is_active?: boolean
          is_featured?: boolean
          created_from?: 'manual' | 'livestream' | 'import' | 'whatsapp' | 'social'
          livestream_session_id?: string | null
          source_timestamp?: number | null
          source_url?: string | null
          seo_title?: string | null
          seo_description?: string | null
          meta_keywords?: Json | null
          view_count?: number
          like_count?: number
          share_count?: number
          conversion_rate?: number
          last_sold_at?: string | null
          featured_until?: string | null
          discount_percentage?: number | null
          discount_start_date?: string | null
          discount_end_date?: string | null
          shipping_cost?: number | null
          cod_available?: boolean
          return_policy?: string | null
          warranty_info?: string | null
          care_instructions?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          order_number: string
          buyer_id: string
          seller_id: string
          product_id: string
          variant_id: string | null
          quantity: number
          unit_price: number
          discount_amount: number
          shipping_cost: number
          tax_amount: number
          platform_fee: number
          total_amount: number
          payment_method: string
          payment_status: 'pending' | 'completed' | 'failed' | 'refunded' | 'cancelled'
          payment_transaction_id: string | null
          payment_gateway: string | null
          shipping_address: Json
          billing_address: Json | null
          order_status: 'pending' | 'confirmed' | 'processing' | 'packed' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'returned'
          tracking_number: string | null
          courier_partner: string | null
          estimated_delivery: string | null
          actual_delivery: string | null
          chat_context: Json | null
          created_via: 'chat' | 'direct_buy' | 'whatsapp' | 'app' | 'website'
          seller_notes: string | null
          buyer_notes: string | null
          cancellation_reason: string | null
          return_reason: string | null
          return_status: 'not_requested' | 'requested' | 'approved' | 'rejected' | 'picked_up' | 'refunded' | null
          delivery_attempts: number
          cod_amount: number | null
          cod_collection_status: 'pending' | 'collected' | 'failed' | null
          rating: number | null
          review: string | null
          review_images: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_number: string
          buyer_id: string
          seller_id: string
          product_id: string
          variant_id?: string | null
          quantity?: number
          unit_price: number
          discount_amount?: number
          shipping_cost?: number
          tax_amount?: number
          platform_fee?: number
          total_amount: number
          payment_method: string
          payment_status?: 'pending' | 'completed' | 'failed' | 'refunded' | 'cancelled'
          payment_transaction_id?: string | null
          payment_gateway?: string | null
          shipping_address: Json
          billing_address?: Json | null
          order_status?: 'pending' | 'confirmed' | 'processing' | 'packed' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'returned'
          tracking_number?: string | null
          courier_partner?: string | null
          estimated_delivery?: string | null
          actual_delivery?: string | null
          chat_context?: Json | null
          created_via?: 'chat' | 'direct_buy' | 'whatsapp' | 'app' | 'website'
          seller_notes?: string | null
          buyer_notes?: string | null
          cancellation_reason?: string | null
          return_reason?: string | null
          return_status?: 'not_requested' | 'requested' | 'approved' | 'rejected' | 'picked_up' | 'refunded' | null
          delivery_attempts?: number
          cod_amount?: number | null
          cod_collection_status?: 'pending' | 'collected' | 'failed' | null
          rating?: number | null
          review?: string | null
          review_images?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_number?: string
          buyer_id?: string
          seller_id?: string
          product_id?: string
          variant_id?: string | null
          quantity?: number
          unit_price?: number
          discount_amount?: number
          shipping_cost?: number
          tax_amount?: number
          platform_fee?: number
          total_amount?: number
          payment_method?: string
          payment_status?: 'pending' | 'completed' | 'failed' | 'refunded' | 'cancelled'
          payment_transaction_id?: string | null
          payment_gateway?: string | null
          shipping_address?: Json
          billing_address?: Json | null
          order_status?: 'pending' | 'confirmed' | 'processing' | 'packed' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'returned'
          tracking_number?: string | null
          courier_partner?: string | null
          estimated_delivery?: string | null
          actual_delivery?: string | null
          chat_context?: Json | null
          created_via?: 'chat' | 'direct_buy' | 'whatsapp' | 'app' | 'website'
          seller_notes?: string | null
          buyer_notes?: string | null
          cancellation_reason?: string | null
          return_reason?: string | null
          return_status?: 'not_requested' | 'requested' | 'approved' | 'rejected' | 'picked_up' | 'refunded' | null
          delivery_attempts?: number
          cod_amount?: number | null
          cod_collection_status?: 'pending' | 'collected' | 'failed' | null
          rating?: number | null
          review?: string | null
          review_images?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      chats: {
        Row: {
          id: string
          buyer_id: string
          seller_id: string
          product_id: string | null
          order_id: string | null
          chat_type: 'product_inquiry' | 'order_support' | 'general'
          messages: Json
          last_message_at: string
          last_message_by: string
          status: 'active' | 'archived' | 'order_created' | 'resolved'
          unread_count_buyer: number
          unread_count_seller: number
          is_starred: boolean
          priority: 'low' | 'medium' | 'high' | 'urgent'
          auto_replies_count: number
          human_intervention_required: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          buyer_id: string
          seller_id: string
          product_id?: string | null
          order_id?: string | null
          chat_type?: 'product_inquiry' | 'order_support' | 'general'
          messages?: Json
          last_message_at?: string
          last_message_by: string
          status?: 'active' | 'archived' | 'order_created' | 'resolved'
          unread_count_buyer?: number
          unread_count_seller?: number
          is_starred?: boolean
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          auto_replies_count?: number
          human_intervention_required?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          buyer_id?: string
          seller_id?: string
          product_id?: string | null
          order_id?: string | null
          chat_type?: 'product_inquiry' | 'order_support' | 'general'
          messages?: Json
          last_message_at?: string
          last_message_by?: string
          status?: 'active' | 'archived' | 'order_created' | 'resolved'
          unread_count_buyer?: number
          unread_count_seller?: number
          is_starred?: boolean
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          auto_replies_count?: number
          human_intervention_required?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}