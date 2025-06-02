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
      analytics_events: {
        Row: {
          created_at: string
          event_data: Json | null
          event_type: string
          id: string
          ip_address: unknown | null
          session_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_data?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_data?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
      }
      chat_conversations: {
        Row: {
          created_at: string
          customer_id: string
          id: string
          is_active: boolean
          last_message_at: string
          seller_id: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          id?: string
          is_active?: boolean
          last_message_at?: string
          seller_id: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          id?: string
          is_active?: boolean
          last_message_at?: string
          seller_id?: string
        }
      }
      chat_messages: {
        Row: {
          conversation_id: string
          created_at: string
          id: string
          is_read: boolean
          message: string
          message_type: string
          metadata: Json | null
          sender_id: string
        }
        Insert: {
          conversation_id: string
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          message_type?: string
          metadata?: Json | null
          sender_id: string
        }
        Update: {
          conversation_id?: string
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          message_type?: string
          metadata?: Json | null
          sender_id?: string
        }
      }
      media_files: {
        Row: {
          created_at: string
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string | null
          id: string
          metadata: Json | null
          mime_type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          file_name: string
          file_path: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          metadata?: Json | null
          mime_type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          metadata?: Json | null
          mime_type?: string | null
          user_id?: string
        }
      }
      order_status_history: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          order_id: string
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          order_id: string
          status: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          order_id?: string
          status?: string
        }
      }
      orders: {
        Row: {
          confirmed_at: string | null
          created_at: string
          customer_id: string
          delivered_at: string | null
          id: string
          items: Json
          notes: string | null
          order_number: string
          payment_method: string | null
          payment_status: string
          payment_transaction_id: string | null
          seller_id: string
          shipped_at: string | null
          shipping_address: Json
          shipping_cost: number
          shipping_provider: string | null
          status: string
          subtotal: number
          total_amount: number
          tracking_number: string | null
          updated_at: string
        }
        Insert: {
          confirmed_at?: string | null
          created_at?: string
          customer_id: string
          delivered_at?: string | null
          id?: string
          items: Json
          notes?: string | null
          order_number: string
          payment_method?: string | null
          payment_status?: string
          payment_transaction_id?: string | null
          seller_id: string
          shipped_at?: string | null
          shipping_address: Json
          shipping_cost?: number
          shipping_provider?: string | null
          status?: string
          subtotal: number
          total_amount: number
          tracking_number?: string | null
          updated_at?: string
        }
        Update: {
          confirmed_at?: string | null
          created_at?: string
          customer_id?: string
          delivered_at?: string | null
          id?: string
          items?: Json
          notes?: string | null
          order_number?: string
          payment_method?: string | null
          payment_status?: string
          payment_transaction_id?: string | null
          seller_id?: string
          shipped_at?: string | null
          shipping_address?: Json
          shipping_cost?: number
          shipping_provider?: string | null
          status?: string
          subtotal?: number
          total_amount?: number
          tracking_number?: string | null
          updated_at?: string
        }
      }
      otp_verifications: {
        Row: {
          attempts: number
          created_at: string
          expires_at: string
          id: string
          is_used: boolean
          otp: string
          phone: string
        }
        Insert: {
          attempts?: number
          created_at?: string
          expires_at: string
          id?: string
          is_used?: boolean
          otp: string
          phone: string
        }
        Update: {
          attempts?: number
          created_at?: string
          expires_at?: string
          id?: string
          is_used?: boolean
          otp?: string
          phone?: string
        }
      }
      partnership_applications: {
        Row: {
          admin_notes: string | null
          business_description: string | null
          business_name: string
          business_type: string | null
          contact_name: string
          created_at: string
          email: string | null
          id: string
          monthly_revenue: string | null
          phone: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          website_url: string | null
        }
        Insert: {
          admin_notes?: string | null
          business_description?: string | null
          business_name: string
          business_type?: string | null
          contact_name: string
          created_at?: string
          email?: string | null
          id?: string
          monthly_revenue?: string | null
          phone: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          website_url?: string | null
        }
        Update: {
          admin_notes?: string | null
          business_description?: string | null
          business_name?: string
          business_type?: string | null
          contact_name?: string
          created_at?: string
          email?: string | null
          id?: string
          monthly_revenue?: string | null
          phone?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          website_url?: string | null
        }
      }
      product_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          parent_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          parent_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          parent_id?: string | null
        }
      }
      products: {
        Row: {
          ai_extracted_data: Json | null
          category: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          price: number
          source: string
          stock_quantity: number
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_extracted_data?: Json | null
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          price: number
          source?: string
          stock_quantity?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_extracted_data?: Json | null
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          price?: number
          source?: string
          stock_quantity?: number
          updated_at?: string
          user_id?: string
        }
      }
      shipping_zones: {
        Row: {
          base_rate: number
          created_at: string
          id: string
          is_active: boolean
          name: string
          per_kg_rate: number
          states: Json
        }
        Insert: {
          base_rate: number
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          per_kg_rate?: number
          states: Json
        }
        Update: {
          base_rate?: number
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          per_kg_rate?: number
          states?: Json
        }
      }
      users: {
        Row: {
          business_address: Json | null
          business_name: string | null
          business_type: string | null
          country_code: string
          created_at: string
          id: string
          is_verified: boolean
          onboarding_completed: boolean
          owner_name: string | null
          phone: string
          role: string
          updated_at: string
        }
        Insert: {
          business_address?: Json | null
          business_name?: string | null
          business_type?: string | null
          country_code?: string
          created_at?: string
          id?: string
          is_verified?: boolean
          onboarding_completed?: boolean
          owner_name?: string | null
          phone: string
          role?: string
          updated_at?: string
        }
        Update: {
          business_address?: Json | null
          business_name?: string | null
          business_type?: string | null
          country_code?: string
          created_at?: string
          id?: string
          is_verified?: boolean
          onboarding_completed?: boolean
          owner_name?: string | null
          phone?: string
          role?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_expired_otps: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      generate_order_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type User = Database['public']['Tables']['users']['Row']
export type Product = Database['public']['Tables']['products']['Row']
export type Order = Database['public']['Tables']['orders']['Row']
export type ChatMessage = Database['public']['Tables']['chat_messages']['Row']
export type ChatConversation = Database['public']['Tables']['chat_conversations']['Row']
export type AnalyticsEvent = Database['public']['Tables']['analytics_events']['Row']
export type PartnershipApplication = Database['public']['Tables']['partnership_applications']['Row']

export type InsertUser = Database['public']['Tables']['users']['Insert']
export type InsertProduct = Database['public']['Tables']['products']['Insert']
export type InsertOrder = Database['public']['Tables']['orders']['Insert']
export type InsertChatMessage = Database['public']['Tables']['chat_messages']['Insert']