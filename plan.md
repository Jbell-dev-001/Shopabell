# 🚀 ShopAbell Complete Development Plan
## End-to-End Implementation Guide for Claude Code

---

## **📋 Project Overview**

### **Vision Statement**
Build the world's first AI-powered social commerce operating system that transforms any social media creator into a professional e-commerce business in under 30 seconds.

### **Core Value Proposition**
- **30-second WhatsApp onboarding** (simulated interface)
- **AI livestream-to-catalog** conversion (simple screenshot + crop)
- **Revolutionary "sell" command** for instant checkout
- **Direct instant payments** to seller accounts
- **Automated shipping** with multi-courier selection
- **Complete analytics** and business intelligence

---

## **🏗️ Technical Architecture**

### **Stack Overview**
```
Frontend: Next.js 14 + TypeScript + Tailwind CSS
Database: Supabase (PostgreSQL + Real-time + Storage + Auth)
Deployment: Vercel
AI Processing: Client-side JavaScript (no external APIs)
Simulations: WhatsApp UI, Decentro, Shiprocket (all built-in)
```

### **Project Structure**
```
shopabell/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication pages
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   └── onboard/page.tsx     # WhatsApp simulation
│   ├── (dashboard)/             # Seller dashboard
│   │   ├── dashboard/
│   │   │   ├── page.tsx         # Main dashboard
│   │   │   ├── products/        # Product management
│   │   │   ├── orders/          # Order management
│   │   │   ├── chats/           # Chat interface
│   │   │   ├── livestream/      # Livestream features
│   │   │   ├── analytics/       # Analytics dashboard
│   │   │   └── settings/        # Account settings
│   │   └── layout.tsx
│   ├── (store)/                 # Buyer-facing store
│   │   ├── store/[slug]/        # Store pages
│   │   ├── product/[id]/        # Product pages
│   │   ├── cart/                # Shopping cart
│   │   └── checkout/            # Checkout flow
│   ├── (admin)/                 # Admin panel
│   │   └── admin/               # Admin features
│   ├── api/                     # API routes
│   │   ├── auth/                # Authentication
│   │   ├── products/            # Product CRUD
│   │   ├── orders/              # Order management
│   │   ├── chat/                # Chat system
│   │   ├── payments/            # Payment simulation
│   │   ├── shipping/            # Shipping simulation
│   │   ├── whatsapp/            # WhatsApp simulation
│   │   └── webhooks/            # Webhook handlers
│   ├── components/              # Reusable components
│   │   ├── ui/                  # Base UI components
│   │   ├── forms/               # Form components
│   │   ├── dashboard/           # Dashboard components
│   │   ├── store/               # Store components
│   │   ├── chat/                # Chat components
│   │   └── whatsapp/            # WhatsApp UI components
│   ├── lib/                     # Utilities and helpers
│   │   ├── supabase/            # Supabase client
│   │   ├── utils/               # General utilities
│   │   ├── hooks/               # Custom React hooks
│   │   ├── ai/                  # Client-side AI processing
│   │   ├── validations/         # Form validations
│   │   └── simulations/         # API simulations
│   ├── styles/                  # CSS files
│   │   └── globals.css
│   ├── public/                  # Static assets
│   │   ├── images/
│   │   ├── icons/
│   │   └── fonts/
│   └── types/                   # TypeScript definitions
├── components.json              # Shadcn/ui config
├── tailwind.config.js           # Tailwind configuration
├── next.config.js               # Next.js configuration
├── package.json
├── tsconfig.json
└── README.md
```

---

## **🗄️ Complete Database Schema**

### **Supabase Setup**
```sql
-- Enable Row Level Security and Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE users, sellers, products, orders, chats, chat_messages;

-- Users table (Base user information)
CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    phone VARCHAR(15) UNIQUE NOT NULL,
    name VARCHAR(100),
    email VARCHAR(255),
    role VARCHAR(20) DEFAULT 'buyer' CHECK (role IN ('seller', 'buyer', 'admin', 'group_admin')),
    language_preference VARCHAR(5) DEFAULT 'en',
    profile_image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_verified BOOLEAN DEFAULT FALSE,
    verification_documents JSONB DEFAULT '[]',
    device_info JSONB DEFAULT '{}',
    timezone VARCHAR(50) DEFAULT 'Asia/Kolkata',
    app_version VARCHAR(20)
);

-- Sellers table (Seller-specific information)
CREATE TABLE sellers (
    id UUID REFERENCES users(id) PRIMARY KEY,
    business_name VARCHAR(255) NOT NULL,
    business_category VARCHAR(100),
    upi_id VARCHAR(255),
    bank_account VARCHAR(50),
    ifsc_code VARCHAR(20),
    pan_number VARCHAR(20),
    aadhaar_number TEXT, -- encrypted
    gstin VARCHAR(20),
    pickup_address JSONB NOT NULL,
    virtual_account_number VARCHAR(50),
    virtual_upi_id VARCHAR(255),
    subscription_plan VARCHAR(20) DEFAULT 'free' CHECK (subscription_plan IN ('free', 'basic', 'premium')),
    subscription_expires DATE,
    subscription_payment_history JSONB DEFAULT '[]',
    onboarding_completed BOOLEAN DEFAULT FALSE,
    onboarding_step INTEGER DEFAULT 0,
    verification_status VARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
    store_slug VARCHAR(100) UNIQUE NOT NULL,
    store_theme VARCHAR(50) DEFAULT 'default',
    store_settings JSONB DEFAULT '{}',
    business_hours JSONB DEFAULT '{"always_open": true}',
    auto_reply_enabled BOOLEAN DEFAULT FALSE,
    auto_reply_message TEXT,
    commission_rate DECIMAL(5,2) DEFAULT 3.00,
    referred_by UUID REFERENCES users(id),
    total_sales DECIMAL(12,2) DEFAULT 0,
    total_orders INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    last_live_session TIMESTAMP WITH TIME ZONE,
    preferred_couriers JSONB DEFAULT '[]',
    shipping_settings JSONB DEFAULT '{}',
    tax_settings JSONB DEFAULT '{}'
);

-- Buyers table (Buyer-specific information)
CREATE TABLE buyers (
    id UUID REFERENCES users(id) PRIMARY KEY,
    default_address JSONB,
    saved_addresses JSONB DEFAULT '[]',
    payment_methods JSONB DEFAULT '[]',
    wishlist JSONB DEFAULT '[]',
    order_history_count INTEGER DEFAULT 0,
    total_spent DECIMAL(12,2) DEFAULT 0,
    loyalty_points INTEGER DEFAULT 0,
    preferred_categories JSONB DEFAULT '[]',
    last_order_date DATE,
    notification_preferences JSONB DEFAULT '{"sms": true, "whatsapp": true, "email": true}'
);

-- Categories table
CREATE TABLE categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    parent_id UUID REFERENCES categories(id),
    description TEXT,
    image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    commission_rate DECIMAL(5,2) DEFAULT 3.00,
    product_count INTEGER DEFAULT 0
);

-- Products table
CREATE TABLE products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    seller_id UUID REFERENCES sellers(id) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    short_description VARCHAR(500),
    price DECIMAL(10,2) NOT NULL,
    original_price DECIMAL(10,2),
    cost_price DECIMAL(10,2),
    images JSONB DEFAULT '[]',
    variants JSONB DEFAULT '[]',
    stock_quantity INTEGER DEFAULT 0,
    reserved_stock INTEGER DEFAULT 0,
    low_stock_threshold INTEGER DEFAULT 5,
    category_id UUID REFERENCES categories(id),
    subcategory VARCHAR(100),
    tags JSONB DEFAULT '[]',
    brand VARCHAR(100),
    model VARCHAR(100),
    weight DECIMAL(8,2) DEFAULT 0,
    dimensions JSONB DEFAULT '{"length": 0, "width": 0, "height": 0}',
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    created_from VARCHAR(20) DEFAULT 'manual' CHECK (created_from IN ('manual', 'livestream', 'import', 'whatsapp', 'social')),
    livestream_session_id UUID,
    source_timestamp BIGINT,
    source_url TEXT,
    seo_title VARCHAR(255),
    seo_description TEXT,
    meta_keywords JSONB DEFAULT '[]',
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    share_count INTEGER DEFAULT 0,
    conversion_rate DECIMAL(5,2) DEFAULT 0,
    last_sold_at TIMESTAMP WITH TIME ZONE,
    featured_until TIMESTAMP WITH TIME ZONE,
    discount_percentage DECIMAL(5,2) DEFAULT 0,
    discount_start_date DATE,
    discount_end_date DATE,
    shipping_cost DECIMAL(8,2) DEFAULT 0,
    cod_available BOOLEAN DEFAULT TRUE,
    return_policy TEXT,
    warranty_info TEXT,
    care_instructions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product variants table
CREATE TABLE product_variants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    variant_type VARCHAR(50) NOT NULL, -- color, size, style
    variant_value VARCHAR(100) NOT NULL,
    price_adjustment DECIMAL(8,2) DEFAULT 0,
    stock_quantity INTEGER DEFAULT 0,
    sku VARCHAR(100) UNIQUE,
    image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE
);

-- Livestream sessions table
CREATE TABLE livestream_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    seller_id UUID REFERENCES sellers(id) NOT NULL,
    session_name VARCHAR(255),
    session_description TEXT,
    start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_time TIMESTAMP WITH TIME ZONE,
    scheduled_start TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'recording' CHECK (status IN ('scheduled', 'recording', 'processing', 'completed', 'cancelled')),
    platform VARCHAR(20) DEFAULT 'facebook' CHECK (platform IN ('facebook', 'instagram', 'youtube', 'whatsapp_status')),
    platform_url TEXT,
    total_products_captured INTEGER DEFAULT 0,
    screenshots_count INTEGER DEFAULT 0,
    processing_progress INTEGER DEFAULT 0,
    viewer_count INTEGER DEFAULT 0,
    peak_viewers INTEGER DEFAULT 0,
    total_orders INTEGER DEFAULT 0,
    total_revenue DECIMAL(12,2) DEFAULT 0,
    engagement_rate DECIMAL(5,2) DEFAULT 0,
    conversion_rate DECIMAL(5,2) DEFAULT 0,
    recording_file_url TEXT,
    thumbnail_url TEXT,
    ai_processing_logs JSONB DEFAULT '[]',
    session_settings JSONB DEFAULT '{}',
    pinned_comment TEXT,
    chat_logs JSONB DEFAULT '[]'
);

-- Livestream products table
CREATE TABLE livestream_products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES livestream_sessions(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    timestamp_captured INTEGER NOT NULL,
    duration_shown INTEGER DEFAULT 0,
    screenshot_url TEXT NOT NULL,
    ai_confidence_score DECIMAL(3,2) DEFAULT 0,
    manual_verification BOOLEAN DEFAULT FALSE,
    orders_generated INTEGER DEFAULT 0,
    views_during_show INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
CREATE TABLE orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_number VARCHAR(20) UNIQUE NOT NULL,
    buyer_id UUID REFERENCES buyers(id) NOT NULL,
    seller_id UUID REFERENCES sellers(id) NOT NULL,
    product_id UUID REFERENCES products(id) NOT NULL,
    variant_id UUID REFERENCES product_variants(id),
    quantity INTEGER DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(8,2) DEFAULT 0,
    shipping_cost DECIMAL(8,2) DEFAULT 0,
    tax_amount DECIMAL(8,2) DEFAULT 0,
    platform_fee DECIMAL(8,2) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50),
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded', 'cancelled')),
    payment_transaction_id VARCHAR(255),
    payment_gateway VARCHAR(50),
    shipping_address JSONB NOT NULL,
    billing_address JSONB,
    order_status VARCHAR(30) DEFAULT 'pending' CHECK (order_status IN ('pending', 'confirmed', 'processing', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned')),
    tracking_number VARCHAR(100),
    courier_partner VARCHAR(100),
    estimated_delivery DATE,
    actual_delivery TIMESTAMP WITH TIME ZONE,
    chat_context JSONB DEFAULT '{}',
    created_via VARCHAR(20) DEFAULT 'direct_buy' CHECK (created_via IN ('chat', 'direct_buy', 'whatsapp', 'app', 'website')),
    seller_notes TEXT,
    buyer_notes TEXT,
    cancellation_reason TEXT,
    return_reason TEXT,
    return_status VARCHAR(20) DEFAULT 'not_requested' CHECK (return_status IN ('not_requested', 'requested', 'approved', 'rejected', 'picked_up', 'refunded')),
    delivery_attempts INTEGER DEFAULT 0,
    cod_amount DECIMAL(10,2),
    cod_collection_status VARCHAR(20) DEFAULT 'pending' CHECK (cod_collection_status IN ('pending', 'collected', 'failed')),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    review_images JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chats table
CREATE TABLE chats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    buyer_id UUID REFERENCES buyers(id) NOT NULL,
    seller_id UUID REFERENCES sellers(id) NOT NULL,
    product_id UUID REFERENCES products(id),
    order_id UUID REFERENCES orders(id),
    chat_type VARCHAR(20) DEFAULT 'product_inquiry' CHECK (chat_type IN ('product_inquiry', 'order_support', 'general')),
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_message_by UUID REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'archived', 'order_created', 'resolved')),
    unread_count_buyer INTEGER DEFAULT 0,
    unread_count_seller INTEGER DEFAULT 0,
    is_starred BOOLEAN DEFAULT FALSE,
    priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    auto_replies_count INTEGER DEFAULT 0,
    human_intervention_required BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat messages table
CREATE TABLE chat_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id) NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'audio', 'video', 'product', 'order', 'system')),
    content TEXT NOT NULL,
    media_url TEXT,
    metadata JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    edited_at TIMESTAMP WITH TIME ZONE,
    reply_to_message_id UUID REFERENCES chat_messages(id)
);

-- Admin partnerships table
CREATE TABLE admin_partnerships (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_user_id UUID REFERENCES users(id) NOT NULL,
    group_name VARCHAR(255) NOT NULL,
    group_platform VARCHAR(20) CHECK (group_platform IN ('facebook', 'whatsapp', 'telegram', 'instagram')),
    group_url TEXT,
    group_member_count INTEGER DEFAULT 0,
    referral_code VARCHAR(20) UNIQUE NOT NULL,
    commission_rate DECIMAL(4,2) DEFAULT 0.50,
    total_referrals INTEGER DEFAULT 0,
    active_referrals INTEGER DEFAULT 0,
    total_gmv DECIMAL(15,2) DEFAULT 0,
    total_commission_earned DECIMAL(10,2) DEFAULT 0,
    pending_commission DECIMAL(10,2) DEFAULT 0,
    paid_commission DECIMAL(10,2) DEFAULT 0,
    last_payout_date DATE,
    payout_method VARCHAR(50),
    payout_details JSONB DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'terminated')),
    performance_tier VARCHAR(20) DEFAULT 'bronze' CHECK (performance_tier IN ('bronze', 'silver', 'gold', 'platinum')),
    bonus_eligibility BOOLEAN DEFAULT TRUE,
    monthly_targets JSONB DEFAULT '{}',
    marketing_materials_access BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('order', 'payment', 'shipping', 'chat', 'system', 'marketing')),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    channels JSONB DEFAULT '["app"]', -- app, email, sms, whatsapp
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE,
    action_url TEXT,
    expires_at TIMESTAMP WITH TIME ZONE
);

-- Analytics events table
CREATE TABLE analytics_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    session_id VARCHAR(255),
    event_type VARCHAR(100) NOT NULL,
    event_data JSONB DEFAULT '{}',
    page_url TEXT,
    referrer TEXT,
    user_agent TEXT,
    ip_address INET,
    device_type VARCHAR(20) CHECK (device_type IN ('mobile', 'tablet', 'desktop')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_products_seller_id ON products(seller_id);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_orders_buyer_id ON orders(buyer_id);
CREATE INDEX idx_orders_seller_id ON orders(seller_id);
CREATE INDEX idx_orders_status ON orders(order_status);
CREATE INDEX idx_chat_messages_chat_id ON chat_messages(chat_id);
CREATE INDEX idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_type ON analytics_events(event_type);

-- Set up Row Level Security policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE buyers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Sellers can manage own products" ON products FOR ALL USING (seller_id = auth.uid());
CREATE POLICY "Orders visible to buyer and seller" ON orders FOR SELECT USING (buyer_id = auth.uid() OR seller_id = auth.uid());
CREATE POLICY "Chat messages visible to participants" ON chat_messages FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM chats 
        WHERE chats.id = chat_messages.chat_id 
        AND (chats.buyer_id = auth.uid() OR chats.seller_id = auth.uid())
    )
);

-- Insert default categories
INSERT INTO categories (name, slug, description) VALUES
('Fashion & Clothing', 'fashion', 'Clothes, accessories, and fashion items'),
('Beauty & Cosmetics', 'beauty', 'Beauty products and cosmetics'),
('Electronics & Gadgets', 'electronics', 'Electronic devices and gadgets'),
('Home & Kitchen', 'home-kitchen', 'Home appliances and kitchen items'),
('Jewelry & Accessories', 'jewelry', 'Jewelry and fashion accessories'),
('Books & Stationery', 'books', 'Books, stationery, and educational materials'),
('Sports & Fitness', 'sports', 'Sports equipment and fitness products'),
('Food & Beverages', 'food', 'Food items and beverages');
```

---

## **🎨 Design System Implementation**

### **Tailwind Configuration**
```javascript
// tailwind.config.js
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          900: '#1e3a8a'
        },
        accent: {
          purple: {
            500: '#8b5cf6',
            600: '#7c3aed',
            700: '#6d28d9'
          },
          green: {
            500: '#22c55e',
            600: '#16a34a'
          },
          orange: {
            500: '#f59e0b',
            600: '#d97706'
          }
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Poppins', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 3s infinite',
        'fade-in': 'fadeIn 0.8s ease-out',
        'slide-up': 'slideUp 0.8s ease-out'
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' }
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { transform: 'translateY(30px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        }
      }
    },
  },
  plugins: [],
}
```

### **Component Library Structure**
```typescript
// components/ui/button.tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
}

// components/ui/card.tsx
interface CardProps {
  className?: string;
  children: React.ReactNode;
}

// components/ui/input.tsx
interface InputProps {
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  label?: string;
}
```

---

## **📱 WhatsApp Onboarding Simulation**

### **WhatsApp UI Components**
```typescript
// components/whatsapp/WhatsAppContainer.tsx
export function WhatsAppContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-md mx-auto bg-gray-100 min-h-screen">
      {/* WhatsApp Header */}
      <div className="bg-green-600 text-white p-4 flex items-center space-x-3">
        <button className="text-white">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
          <span className="text-sm font-bold text-gray-700">SA</span>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold">ShopAbell</h3>
          <p className="text-xs opacity-80">Online</p>
        </div>
        <button className="text-white">
          <Phone className="w-5 h-5" />
        </button>
        <button className="text-white">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>
      
      {/* Chat Area */}
      <div className="flex-1 bg-chat-pattern bg-opacity-10 p-4">
        {children}
      </div>
      
      {/* Input Area */}
      <div className="bg-gray-50 p-4 flex items-center space-x-2">
        <button className="text-gray-500">
          <Paperclip className="w-5 h-5" />
        </button>
        <div className="flex-1 bg-white rounded-full px-4 py-2 flex items-center space-x-2">
          <input 
            type="text" 
            placeholder="Type a message..."
            className="flex-1 outline-none"
            disabled
          />
          <button className="text-gray-500">
            <Smile className="w-5 h-5" />
          </button>
        </div>
        <button className="bg-green-600 text-white p-2 rounded-full">
          <Mic className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

// components/whatsapp/ChatMessage.tsx
interface ChatMessageProps {
  message: string;
  sender: 'bot' | 'user';
  timestamp?: string;
  showOptions?: string[];
  onOptionClick?: (option: string) => void;
}

export function ChatMessage({ message, sender, timestamp, showOptions, onOptionClick }: ChatMessageProps) {
  return (
    <div className={`flex ${sender === 'user' ? 'justify-end' : 'justify-start'} mb-2`}>
      <div className={`max-w-xs rounded-lg p-3 ${
        sender === 'user' 
          ? 'bg-green-500 text-white rounded-br-sm' 
          : 'bg-white text-gray-800 rounded-bl-sm shadow-sm'
      }`}>
        <p className="text-sm">{message}</p>
        {showOptions && (
          <div className="mt-2 space-y-1">
            {showOptions.map((option, index) => (
              <button
                key={index}
                onClick={() => onOptionClick?.(option)}
                className="block w-full text-left p-2 text-xs bg-blue-50 text-blue-700 rounded border hover:bg-blue-100 transition-colors"
              >
                {option}
              </button>
            ))}
          </div>
        )}
        <p className={`text-xs mt-1 ${
          sender === 'user' ? 'text-green-100' : 'text-gray-500'
        }`}>
          {timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
}
```

### **Onboarding Flow Logic**
```typescript
// app/(auth)/onboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { WhatsAppContainer, ChatMessage } from '@/components/whatsapp';

interface OnboardingStep {
  id: string;
  botMessage: string;
  options?: string[];
  inputType?: 'text' | 'select' | 'phone' | 'upi';
  validation?: (value: string) => boolean;
  errorMessage?: string;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    botMessage: 'Welcome to ShopAbell! 🎉\n\nI\'ll help you set up your store in just 30 seconds.\n\nWhat\'s your business name?',
    inputType: 'text',
    validation: (value) => value.length >= 2,
    errorMessage: 'Business name must be at least 2 characters'
  },
  {
    id: 'category',
    botMessage: 'Great! What do you sell? Choose your category:',
    options: [
      '1️⃣ Fashion & Clothing',
      '2️⃣ Beauty & Cosmetics', 
      '3️⃣ Electronics & Gadgets',
      '4️⃣ Home & Kitchen',
      '5️⃣ Jewelry & Accessories',
      '6️⃣ Books & Stationery',
      '7️⃣ Sports & Fitness',
      '8️⃣ Food & Beverages'
    ],
    inputType: 'select'
  },
  {
    id: 'upi',
    botMessage: 'Perfect! Now share your UPI ID to receive payments instantly:',
    inputType: 'upi',
    validation: (value) => /^[\w.-]+@[\w.-]+$/.test(value),
    errorMessage: 'Please enter a valid UPI ID (e.g., yourname@paytm)'
  },
  {
    id: 'address',
    botMessage: 'Share your pickup address (where we\'ll collect orders):',
    inputType: 'text',
    validation: (value) => value.length >= 10,
    errorMessage: 'Please enter a complete address'
  },
  {
    id: 'phone',
    botMessage: 'What\'s your business contact number?',
    inputType: 'phone',
    validation: (value) => /^[6-9]\d{9}$/.test(value.replace(/\D/g, '')),
    errorMessage: 'Please enter a valid 10-digit mobile number'
  },
  {
    id: 'complete',
    botMessage: '🎉 Congratulations! Your store is ready!\n\n✅ Store: shopabell.com/{store_slug}\n✅ Payments: {upi_id}\n✅ Ready to sell!\n\nDownload our app to start selling:',
    options: ['📱 Download App', '🌐 Open Store', '📊 View Dashboard']
  }
];

export default function OnboardPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [messages, setMessages] = useState<Array<{
    message: string;
    sender: 'bot' | 'user';
    timestamp: string;
    options?: string[];
  }>>([]);
  const [userData, setUserData] = useState<Record<string, string>>({});
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    // Show initial message with delay to simulate real WhatsApp
    setTimeout(() => {
      showBotMessage(ONBOARDING_STEPS[0]);
    }, 1000);
  }, []);

  const showBotMessage = (step: OnboardingStep) => {
    setIsTyping(true);
    
    // Simulate typing delay
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        message: step.botMessage.replace('{store_slug}', generateStoreSlug(userData.businessName))
                                .replace('{upi_id}', userData.upiId || ''),
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        options: step.options
      }]);
    }, Math.random() * 2000 + 1000); // 1-3 seconds typing
  };

  const handleUserResponse = (response: string) => {
    const step = ONBOARDING_STEPS[currentStep];
    
    // Add user message
    setMessages(prev => [...prev, {
      message: response,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);

    // Validate input if needed
    if (step.validation && !step.validation(response)) {
      setTimeout(() => {
        setMessages(prev => [...prev, {
          message: step.errorMessage || 'Please provide a valid input.',
          sender: 'bot',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      }, 500);
      return;
    }

    // Store user data
    const newUserData = { ...userData };
    switch (step.id) {
      case 'welcome':
        newUserData.businessName = response;
        break;
      case 'category':
        newUserData.category = response;
        break;
      case 'upi':
        newUserData.upiId = response;
        break;
      case 'address':
        newUserData.address = response;
        break;
      case 'phone':
        newUserData.phone = response;
        break;
    }
    setUserData(newUserData);

    // Move to next step
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        showBotMessage(ONBOARDING_STEPS[currentStep + 1]);
      }, 1000);
    } else {
      // Complete onboarding
      completeOnboarding(newUserData);
    }
  };

  const completeOnboarding = async (data: Record<string, string>) => {
    try {
      const response = await fetch('/api/auth/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: data.businessName,
          category: data.category,
          upiId: data.upiId,
          address: data.address,
          phone: data.phone
        })
      });

      if (response.ok) {
        const result = await response.json();
        // Redirect to dashboard or app download
        window.location.href = '/dashboard';
      }
    } catch (error) {
      console.error('Onboarding failed:', error);
    }
  };

  const generateStoreSlug = (businessName?: string) => {
    if (!businessName) return 'your-store';
    return businessName.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 30);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <WhatsAppContainer>
        <div className="space-y-2 pb-20">
          {messages.map((msg, index) => (
            <ChatMessage
              key={index}
              message={msg.message}
              sender={msg.sender}
              timestamp={msg.timestamp}
              showOptions={msg.options}
              onOptionClick={handleUserResponse}
            />
          ))}
          
          {isTyping && (
            <div className="flex justify-start mb-2">
              <div className="bg-white text-gray-800 rounded-lg rounded-bl-sm shadow-sm p-3 max-w-xs">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Interface */}
        {currentStep < ONBOARDING_STEPS.length - 1 && !isTyping && (
          <OnboardingInput
            step={ONBOARDING_STEPS[currentStep]}
            onSubmit={handleUserResponse}
          />
        )}
      </WhatsAppContainer>
    </div>
  );
}

// components/whatsapp/OnboardingInput.tsx
interface OnboardingInputProps {
  step: OnboardingStep;
  onSubmit: (value: string) => void;
}

function OnboardingInput({ step, onSubmit }: OnboardingInputProps) {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSubmit(inputValue.trim());
      setInputValue('');
    }
  };

  if (step.options) {
    return null; // Options are handled by ChatMessage component
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          <div className="flex-1 bg-white rounded-full px-4 py-2 flex items-center space-x-2">
            <input
              type={step.inputType === 'phone' ? 'tel' : 'text'}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={getPlaceholder(step.inputType)}
              className="flex-1 outline-none"
              autoFocus
            />
          </div>
          <button
            type="submit"
            disabled={!inputValue.trim()}
            className="bg-green-600 text-white p-2 rounded-full disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}

function getPlaceholder(inputType?: string): string {
  switch (inputType) {
    case 'phone': return 'Enter mobile number';
    case 'upi': return 'yourname@paytm';
    case 'text': default: return 'Type your answer...';
  }
}
```

---

## **🤖 Client-Side AI Processing**

### **Simple Image Processing**
```typescript
// lib/ai/imageProcessor.ts
export class SimpleImageProcessor {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d')!;
  }

  async captureScreenshot(): Promise<string> {
    try {
      // For livestream simulation, we'll use a mock approach
      // In real implementation, this would capture actual screen
      return this.generateMockScreenshot();
    } catch (error) {
      console.error('Screenshot capture failed:', error);
      throw error;
    }
  }

  cropImage(imageData: string, cropPercent: number = 0.1): Promise<string> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const cropX = img.width * cropPercent;
        const cropY = img.height * cropPercent;
        const cropWidth = img.width * (1 - 2 * cropPercent);
        const cropHeight = img.height * (1 - 2 * cropPercent);

        this.canvas.width = cropWidth;
        this.canvas.height = cropHeight;
        
        this.ctx.drawImage(
          img, 
          cropX, cropY, cropWidth, cropHeight,
          0, 0, cropWidth, cropHeight
        );
        
        resolve(this.canvas.toDataURL('image/jpeg', 0.8));
      };
      img.src = imageData;
    });
  }

  resizeImage(imageData: string, targetWidth: number, targetHeight: number): Promise<string> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        this.canvas.width = targetWidth;
        this.canvas.height = targetHeight;
        
        this.ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
        resolve(this.canvas.toDataURL('image/jpeg', 0.8));
      };
      img.src = imageData;
    });
  }

  enhanceImage(imageData: string): Promise<string> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        this.canvas.width = img.width;
        this.canvas.height = img.height;
        
        this.ctx.drawImage(img, 0, 0);
        
        // Simple brightness/contrast enhancement
        const imageDataObj = this.ctx.getImageData(0, 0, img.width, img.height);
        const data = imageDataObj.data;
        
        for (let i = 0; i < data.length; i += 4) {
          data[i] = Math.min(255, data[i] * 1.1);     // Red
          data[i + 1] = Math.min(255, data[i + 1] * 1.1); // Green
          data[i + 2] = Math.min(255, data[i + 2] * 1.1); // Blue
        }
        
        this.ctx.putImageData(imageDataObj, 0, 0);
        resolve(this.canvas.toDataURL('image/jpeg', 0.8));
      };
      img.src = imageData;
    });
  }

  generateImageHash(imageData: string): string {
    // Simple hash based on image content
    let hash = 0;
    for (let i = 0; i < imageData.length; i++) {
      const char = imageData.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }

  isDuplicate(hash: string, recentHashes: string[]): boolean {
    return recentHashes.includes(hash);
  }

  private generateMockScreenshot(): string {
    // Generate a mock product image for demo purposes
    this.canvas.width = 500;
    this.canvas.height = 500;
    
    // Create gradient background
    const gradient = this.ctx.createLinearGradient(0, 0, 500, 500);
    gradient.addColorStop(0, '#f3f4f6');
    gradient.addColorStop(1, '#e5e7eb');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, 500, 500);
    
    // Draw mock product (rectangle)
    this.ctx.fillStyle = '#3b82f6';
    this.ctx.fillRect(100, 150, 300, 200);
    
    // Add some text
    this.ctx.fillStyle = '#1f2937';
    this.ctx.font = 'bold 24px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('Sample Product', 250, 250);
    
    return this.canvas.toDataURL('image/jpeg', 0.8);
  }
}

// lib/ai/livestreamProcessor.ts
export class LivestreamProcessor {
  private processor: SimpleImageProcessor;
  private isRecording: boolean = false;
  private captureInterval: number | null = null;
  private sessionId: string;
  private productCount: number = 0;
  private recentHashes: string[] = [];

  constructor(sessionId: string) {
    this.processor = new SimpleImageProcessor();
    this.sessionId = sessionId;
  }

  async startRecording(): Promise<void> {
    if (this.isRecording) return;
    
    this.isRecording = true;
    this.captureInterval = window.setInterval(() => {
      this.captureAndProcess();
    }, 5000); // Every 5 seconds
  }

  stopRecording(): void {
    this.isRecording = false;
    if (this.captureInterval) {
      clearInterval(this.captureInterval);
      this.captureInterval = null;
    }
  }

  private async captureAndProcess(): Promise<void> {
    try {
      // Capture screenshot
      const rawImage = await this.processor.captureScreenshot();
      
      // Process image
      const croppedImage = await this.processor.cropImage(rawImage, 0.1);
      const resizedImage = await this.processor.resizeImage(croppedImage, 500, 500);
      const enhancedImage = await this.processor.enhanceImage(resizedImage);
      
      // Check for duplicates
      const imageHash = this.processor.generateImageHash(enhancedImage);
      if (this.processor.isDuplicate(imageHash, this.recentHashes)) {
        return; // Skip duplicate
      }
      
      // Update recent hashes
      this.recentHashes.push(imageHash);
      if (this.recentHashes.length > 5) {
        this.recentHashes.shift();
      }
      
      // Save product
      await this.saveProduct(enhancedImage, imageHash);
      
      // Update UI
      this.productCount++;
      this.updateWidget();
      
    } catch (error) {
      console.error('Processing failed:', error);
    }
  }

  private async saveProduct(imageData: string, hash: string): Promise<void> {
    try {
      // Convert to blob for upload
      const response = await fetch(imageData);
      const blob = await response.blob();
      
      // Upload to Supabase Storage
      const filename = `livestream-${this.sessionId}-${Date.now()}.jpg`;
      const { data: uploadData, error: uploadError } = await window.supabase.storage
        .from('livestream-captures')
        .upload(filename, blob);
      
      if (uploadError) throw uploadError;
      
      // Create product record
      const { data, error } = await window.supabase
        .from('products')
        .insert({
          seller_id: this.getCurrentUserId(),
          name: `Product ${this.productCount + 1}`,
          description: `Captured from livestream at ${new Date().toLocaleTimeString()}`,
          price: 0, // Seller sets manually
          images: [uploadData.path],
          category_id: null,
          created_from: 'livestream',
          livestream_session_id: this.sessionId,
          source_timestamp: Date.now(),
          is_active: false // Inactive until seller reviews
        });
      
      if (error) throw error;
      
    } catch (error) {
      console.error('Save product failed:', error);
      throw error;
    }
  }

  private updateWidget(): void {
    // Dispatch custom event to update UI
    window.dispatchEvent(new CustomEvent('livestream-update', {
      detail: {
        productCount: this.productCount,
        lastCapture: new Date().toLocaleTimeString()
      }
    }));
  }

  private getCurrentUserId(): string {
    // Get current user ID from auth context
    return window.supabase.auth.getUser()?.data?.user?.id || '';
  }

  getStats() {
    return {
      isRecording: this.isRecording,
      productCount: this.productCount,
      sessionId: this.sessionId
    };
  }
}
```

### **Livestream Widget Component**
```typescript
// components/livestream/LivestreamWidget.tsx
'use client';

import { useState, useEffect } from 'react';
import { LivestreamProcessor } from '@/lib/ai/livestreamProcessor';

interface LivestreamWidgetProps {
  sessionId: string;
  onClose?: () => void;
}

export function LivestreamWidget({ sessionId, onClose }: LivestreamWidgetProps) {
  const [processor, setProcessor] = useState<LivestreamProcessor | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [stats, setStats] = useState({
    productCount: 0,
    lastCapture: '',
    sessionDuration: 0
  });
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const newProcessor = new LivestreamProcessor(sessionId);
    setProcessor(newProcessor);

    // Listen for updates
    const handleUpdate = (event: CustomEvent) => {
      setStats(prev => ({
        ...prev,
        productCount: event.detail.productCount,
        lastCapture: event.detail.lastCapture
      }));
    };

    window.addEventListener('livestream-update', handleUpdate as EventListener);
    
    return () => {
      newProcessor.stopRecording();
      window.removeEventListener('livestream-update', handleUpdate as EventListener);
    };
  }, [sessionId]);

  const toggleRecording = async () => {
    if (!processor) return;

    if (isRecording) {
      processor.stopRecording();
      setIsRecording(false);
    } else {
      try {
        await processor.startRecording();
        setIsRecording(true);
      } catch (error) {
        console.error('Failed to start recording:', error);
        alert('Failed to start recording. Please check permissions.');
      }
    }
  };

  const handleManualCapture = () => {
    // Trigger manual capture
    if (processor && isRecording) {
      processor['captureAndProcess'](); // Access private method for manual trigger
    }
  };

  return (
    <div 
      className="fixed z-50 bg-white rounded-2xl shadow-xl border border-gray-200 p-4 min-w-[240px] select-none"
      style={{ 
        left: position.x, 
        top: position.y,
        backdropFilter: 'blur(10px)',
        background: 'rgba(255, 255, 255, 0.95)'
      }}
      onMouseDown={(e) => {
        setIsDragging(true);
        const startX = e.clientX - position.x;
        const startY = e.clientY - position.y;

        const handleMouseMove = (e: MouseEvent) => {
          setPosition({
            x: e.clientX - startX,
            y: e.clientY - startY
          });
        };

        const handleMouseUp = () => {
          setIsDragging(false);
          document.removeEventListener('mousemove', handleMouseMove);
          document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}`}></div>
          <span className="text-sm font-semibold text-gray-700">
            {isRecording ? 'Recording' : 'Stopped'}
          </span>
        </div>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Stats */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-600">Products</span>
          <span className="text-sm font-bold text-blue-600">{stats.productCount}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-600">Quality</span>
          <span className="text-sm font-medium text-green-600">High</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-600">Last</span>
          <span className="text-sm font-medium text-gray-700">
            {stats.lastCapture || '--:--'}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex space-x-2">
        <button
          onClick={handleManualCapture}
          disabled={!isRecording}
          className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          📷 Manual
        </button>
        <button
          onClick={toggleRecording}
          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
            isRecording
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          {isRecording ? '⏹️ Stop' : '▶️ Start'}
        </button>
      </div>

      {/* Progress indicator */}
      {isRecording && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <span className="text-xs text-blue-600 ml-2">Processing...</span>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## **💬 Chat System Implementation**

### **Chat Interface Components**
```typescript
// components/chat/ChatInterface.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  message_type: 'text' | 'image' | 'product' | 'order' | 'system';
  metadata?: any;
  created_at: string;
  is_read: boolean;
}

interface ChatInterfaceProps {
  chatId: string;
  currentUserId: string;
  userRole: 'seller' | 'buyer';
}

export function ChatInterface({ chatId, currentUserId, userRole }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    fetchMessages();
    subscribeToMessages();
    subscribeToTyping();
  }, [chatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });

    if (data) {
      setMessages(data);
    }
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel(`chat-${chatId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `chat_id=eq.${chatId}`
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const subscribeToTyping = () => {
    const channel = supabase
      .channel(`typing-${chatId}`)
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        if (payload.user_id !== currentUserId) {
          setOtherUserTyping(payload.typing);
          if (payload.typing) {
            setTimeout(() => setOtherUserTyping(false), 3000);
          }
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const messageContent = newMessage.trim();
    setNewMessage('');

    // Check if this is a sell command
    if (userRole === 'seller' && isSellCommand(messageContent)) {
      await handleSellCommand(messageContent);
      return;
    }

    // Send regular message
    const { error } = await supabase
      .from('chat_messages')
      .insert({
        chat_id: chatId,
        sender_id: currentUserId,
        content: messageContent,
        message_type: 'text'
      });

    if (error) {
      console.error('Failed to send message:', error);
    }
  };

  const isSellCommand = (message: string): boolean => {
    return /^sell\s+\d+/i.test(message);
  };

  const handleSellCommand = async (command: string) => {
    const result = parseSellCommand(command);
    
    if (result) {
      // Create checkout
      const checkoutData = await createCheckout(result);
      
      // Send system message with checkout
      await supabase
        .from('chat_messages')
        .insert({
          chat_id: chatId,
          sender_id: currentUserId,
          content: `Checkout created for ₹${result.amount}`,
          message_type: 'order',
          metadata: {
            checkout_id: checkoutData.id,
            amount: result.amount,
            variants: result.variants
          }
        });
    }
  };

  const parseSellCommand = (command: string) => {
    const match = command.match(/^sell\s+(\d+)(?:\s+(.+))?$/i);
    if (!match) return null;

    const amount = parseInt(match[1]);
    const variants = match[2] ? parseVariants(match[2]) : {};

    return { amount, variants };
  };

  const parseVariants = (variantString: string) => {
    const variants: Record<string, string> = {};
    const tokens = variantString.split(/\s+/);
    
    // Simple parsing - can be enhanced
    tokens.forEach(token => {
      if (['red', 'blue', 'green', 'black', 'white'].includes(token.toLowerCase())) {
        variants.color = token;
      } else if (['xs', 's', 'm', 'l', 'xl', 'xxl'].includes(token.toLowerCase())) {
        variants.size = token.toUpperCase();
      }
    });

    return variants;
  };

  const createCheckout = async (orderData: { amount: number; variants: Record<string, string> }) => {
    const { data, error } = await supabase
      .from('orders')
      .insert({
        buyer_id: userRole === 'buyer' ? currentUserId : 'temp-buyer',
        seller_id: userRole === 'seller' ? currentUserId : 'temp-seller',
        product_id: 'temp-product', // Get from chat context
        total_amount: orderData.amount,
        platform_fee: orderData.amount * 0.03,
        order_status: 'pending',
        payment_status: 'pending',
        chat_context: { variants: orderData.variants }
      })
      .select()
      .single();

    return data;
  };

  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      supabase.channel(`typing-${chatId}`).send({
        type: 'broadcast',
        event: 'typing',
        payload: {const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      supabase.channel(`typing-${chatId}`).send({
        type: 'broadcast',
        event: 'typing',
        payload: {
          user_id: currentUserId,
          typing: true
        }
      });

      setTimeout(() => {
        setIsTyping(false);
        supabase.channel(`typing-${chatId}`).send({
          type: 'broadcast',
          event: 'typing',
          payload: {
            user_id: currentUserId,
            typing: false
          }
        });
      }, 1000);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Chat Header */}
      <div className="border-b border-gray-200 p-4 flex items-center space-x-3">
        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
          {userRole === 'seller' ? 'B' : 'S'}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">
            {userRole === 'seller' ? 'Customer' : 'Seller'}
          </h3>
          <p className="text-sm text-gray-500">
            {otherUserTyping ? 'typing...' : 'Online'}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            isOwn={message.sender_id === currentUserId}
            userRole={userRole}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              handleTyping();
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                sendMessage();
              }
            }}
            placeholder={userRole === 'seller' ? 'Type message or "sell 599"...' : 'Type your message...'}
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim()}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
        {userRole === 'seller' && (
          <div className="mt-2 text-xs text-gray-500">
            💡 Tip: Type "sell 599" to create instant checkout for ₹599
          </div>
        )}
      </div>
    </div>
  );
}

// components/chat/MessageBubble.tsx
interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  userRole: 'seller' | 'buyer';
}

function MessageBubble({ message, isOwn, userRole }: MessageBubbleProps) {
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (message.message_type === 'order') {
    return (
      <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
        <div className="max-w-xs bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="text-sm font-semibold text-green-800 mb-2">
            🛒 Checkout Created
          </div>
          <div className="text-lg font-bold text-green-700 mb-1">
            ₹{message.metadata?.amount}
          </div>
          {message.metadata?.variants && (
            <div className="text-xs text-green-600 mb-2">
              {Object.entries(message.metadata.variants).map(([key, value]) => (
                <span key={key} className="mr-2">
                  {key}: {value}
                </span>
              ))}
            </div>
          )}
          <button className="w-full bg-green-600 text-white py-2 px-4 rounded text-sm font-semibold hover:bg-green-700">
            💳 Pay Now
          </button>
          <div className="text-xs text-gray-500 mt-2 text-center">
            {formatTime(message.created_at)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-xs rounded-lg p-3 ${
        isOwn
          ? 'bg-blue-500 text-white'
          : 'bg-gray-100 text-gray-900'
      }`}>
        <p className="text-sm">{message.content}</p>
        <div className={`text-xs mt-1 ${
          isOwn ? 'text-blue-100' : 'text-gray-500'
        }`}>
          {formatTime(message.created_at)}
          {isOwn && (
            <span className="ml-1">
              {message.is_read ? '✓✓' : '✓'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

---

## **🛒 Order Management System**

### **Order Processing Flow**
```typescript
// lib/orders/orderProcessor.ts
export class OrderProcessor {
  private supabase = createClient();

  async createOrder(orderData: {
    buyerId: string;
    sellerId: string;
    productId: string;
    quantity: number;
    unitPrice: number;
    shippingAddress: any;
    paymentMethod: string;
    chatContext?: any;
  }) {
    const orderNumber = this.generateOrderNumber();
    const platformFee = orderData.unitPrice * orderData.quantity * 0.03;
    const shippingCost = await this.calculateShipping(orderData);
    const totalAmount = (orderData.unitPrice * orderData.quantity) + shippingCost;

    const { data, error } = await this.supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        buyer_id: orderData.buyerId,
        seller_id: orderData.sellerId,
        product_id: orderData.productId,
        quantity: orderData.quantity,
        unit_price: orderData.unitPrice,
        shipping_cost: shippingCost,
        platform_fee: platformFee,
        total_amount: totalAmount,
        payment_method: orderData.paymentMethod,
        shipping_address: orderData.shippingAddress,
        order_status: 'pending',
        payment_status: 'pending',
        chat_context: orderData.chatContext || {},
        created_via: 'chat'
      })
      .select()
      .single();

    if (error) throw error;

    // Trigger payment processing
    await this.initiatePayment(data.id, totalAmount);

    return data;
  }

  private generateOrderNumber(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 5);
    return `SA${timestamp}${random}`.toUpperCase();
  }

  private async calculateShipping(orderData: any): Promise<number> {
    // Simulate shipping cost calculation
    const baseRate = 50;
    const weightMultiplier = Math.ceil(orderData.quantity / 2);
    return baseRate * weightMultiplier;
  }

  private async initiatePayment(orderId: string, amount: number) {
    // Simulate payment initiation
    // In real implementation, this would integrate with payment gateway
    return {
      orderId,
      amount,
      paymentUrl: `/checkout/${orderId}`,
      status: 'initiated'
    };
  }

  async processPayment(orderId: string, paymentData: {
    transactionId: string;
    status: 'success' | 'failed';
    method: string;
  }) {
    const { error } = await this.supabase
      .from('orders')
      .update({
        payment_status: paymentData.status === 'success' ? 'completed' : 'failed',
        payment_transaction_id: paymentData.transactionId,
        order_status: paymentData.status === 'success' ? 'confirmed' : 'pending'
      })
      .eq('id', orderId);

    if (error) throw error;

    if (paymentData.status === 'success') {
      await this.processPostPayment(orderId);
    }
  }

  private async processPostPayment(orderId: string) {
    // 1. Generate shipping label
    await this.generateShippingLabel(orderId);
    
    // 2. Update inventory
    await this.updateInventory(orderId);
    
    // 3. Send notifications
    await this.sendOrderNotifications(orderId);
  }

  private async generateShippingLabel(orderId: string) {
    // Simulate shipping label generation
    const trackingNumber = `SA${Date.now().toString(36).toUpperCase()}`;
    const courierPartner = this.selectBestCourier();

    await this.supabase
      .from('orders')
      .update({
        tracking_number: trackingNumber,
        courier_partner: courierPartner,
        order_status: 'processing'
      })
      .eq('id', orderId);

    return { trackingNumber, courierPartner };
  }

  private selectBestCourier(): string {
    const couriers = ['Delhivery', 'BlueDart', 'DTDC', 'Xpressbees'];
    return couriers[Math.floor(Math.random() * couriers.length)];
  }

  private async updateInventory(orderId: string) {
    // Get order details and update product inventory
    const { data: order } = await this.supabase
      .from('orders')
      .select('product_id, quantity')
      .eq('id', orderId)
      .single();

    if (order) {
      await this.supabase.rpc('update_product_inventory', {
        product_id: order.product_id,
        quantity_sold: order.quantity
      });
    }
  }

  private async sendOrderNotifications(orderId: string) {
    // Send notifications to buyer and seller
    const { data: order } = await this.supabase
      .from('orders')
      .select(`
        *,
        buyer:buyers(name, phone),
        seller:sellers(business_name, phone),
        product:products(name)
      `)
      .eq('id', orderId)
      .single();

    if (order) {
      // Buyer notification
      await this.supabase
        .from('notifications')
        .insert({
          user_id: order.buyer_id,
          type: 'order',
          title: 'Order Confirmed',
          message: `Your order ${order.order_number} has been confirmed`,
          data: { order_id: orderId }
        });

      // Seller notification
      await this.supabase
        .from('notifications')
        .insert({
          user_id: order.seller_id,
          type: 'order',
          title: 'New Order',
          message: `You have a new order ${order.order_number}`,
          data: { order_id: orderId }
        });
    }
  }
}
```

### **Order Dashboard Component**
```typescript
// app/(dashboard)/dashboard/orders/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Order {
  id: string;
  order_number: string;
  total_amount: number;
  order_status: string;
  payment_status: string;
  created_at: string;
  buyer: { name: string; phone: string };
  product: { name: string };
  tracking_number?: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  const fetchOrders = async () => {
    setLoading(true);
    
    let query = supabase
      .from('orders')
      .select(`
        *,
        buyer:buyers(name, phone),
        product:products(name)
      `)
      .order('created_at', { ascending: false });

    if (filter !== 'all') {
      query = query.eq('order_status', filter);
    }

    const { data, error } = await query;
    
    if (data) {
      setOrders(data);
    }
    setLoading(false);
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ order_status: newStatus })
      .eq('id', orderId);

    if (!error) {
      fetchOrders();
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-purple-100 text-purple-800',
      shipped: 'bg-green-100 text-green-800',
      delivered: 'bg-green-200 text-green-900',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <div className="flex space-x-2">
          {['all', 'pending', 'confirmed', 'shipped', 'delivered'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filter === status
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading orders...</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {order.order_number}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(order.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {order.buyer.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.buyer.phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {order.product.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      ₹{order.total_amount.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.order_status)}`}>
                      {order.order_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-2">
                      {order.order_status === 'confirmed' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'processing')}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Process
                        </button>
                      )}
                      {order.order_status === 'processing' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'shipped')}
                          className="text-green-600 hover:text-green-900"
                        >
                          Ship
                        </button>
                      )}
                      <button className="text-gray-600 hover:text-gray-900">
                        View
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
```

---

## **📊 Analytics Dashboard**

### **Analytics Data Processing**
```typescript
// lib/analytics/analyticsProcessor.ts
export class AnalyticsProcessor {
  private supabase = createClient();

  async getDashboardMetrics(sellerId: string, dateRange: { from: Date; to: Date }) {
    const metrics = await Promise.all([
      this.getRevenueMetrics(sellerId, dateRange),
      this.getOrderMetrics(sellerId, dateRange),
      this.getProductMetrics(sellerId, dateRange),
      this.getCustomerMetrics(sellerId, dateRange),
      this.getLivestreamMetrics(sellerId, dateRange)
    ]);

    return {
      revenue: metrics[0],
      orders: metrics[1],
      products: metrics[2],
      customers: metrics[3],
      livestream: metrics[4]
    };
  }

  private async getRevenueMetrics(sellerId: string, dateRange: { from: Date; to: Date }) {
    const { data } = await this.supabase
      .from('orders')
      .select('total_amount, created_at, order_status')
      .eq('seller_id', sellerId)
      .eq('payment_status', 'completed')
      .gte('created_at', dateRange.from.toISOString())
      .lte('created_at', dateRange.to.toISOString());

    const totalRevenue = data?.reduce((sum, order) => sum + order.total_amount, 0) || 0;
    const todayRevenue = data?.filter(order => 
      new Date(order.created_at).toDateString() === new Date().toDateString()
    ).reduce((sum, order) => sum + order.total_amount, 0) || 0;

    // Calculate growth
    const yesterdayRevenue = await this.getYesterdayRevenue(sellerId);
    const growthPercentage = yesterdayRevenue > 0 
      ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100 
      : 0;

    return {
      total: totalRevenue,
      today: todayRevenue,
      growth: growthPercentage,
      dailyData: this.groupByDate(data || [], 'total_amount')
    };
  }

  private async getOrderMetrics(sellerId: string, dateRange: { from: Date; to: Date }) {
    const { data } = await this.supabase
      .from('orders')
      .select('id, created_at, order_status')
      .eq('seller_id', sellerId)
      .gte('created_at', dateRange.from.toISOString())
      .lte('created_at', dateRange.to.toISOString());

    const totalOrders = data?.length || 0;
    const pendingOrders = data?.filter(order => order.order_status === 'pending').length || 0;
    const shippedOrders = data?.filter(order => order.order_status === 'shipped').length || 0;
    const deliveredOrders = data?.filter(order => order.order_status === 'delivered').length || 0;

    return {
      total: totalOrders,
      pending: pendingOrders,
      shipped: shippedOrders,
      delivered: deliveredOrders,
      conversionRate: this.calculateConversionRate(sellerId, dateRange)
    };
  }

  private async getProductMetrics(sellerId: string, dateRange: { from: Date; to: Date }) {
    const { data: products } = await this.supabase
      .from('products')
      .select(`
        id, name, view_count, stock_quantity,
        orders:orders(quantity)
      `)
      .eq('seller_id', sellerId);

    const totalProducts = products?.length || 0;
    const lowStockProducts = products?.filter(p => p.stock_quantity < 5).length || 0;
    
    // Calculate best selling products
    const productSales = products?.map(product => ({
      ...product,
      totalSold: product.orders.reduce((sum: number, order: any) => sum + order.quantity, 0)
    })).sort((a, b) => b.totalSold - a.totalSold) || [];

    return {
      total: totalProducts,
      lowStock: lowStockProducts,
      bestSelling: productSales.slice(0, 5),
      outOfStock: products?.filter(p => p.stock_quantity === 0).length || 0
    };
  }

  private async getCustomerMetrics(sellerId: string, dateRange: { from: Date; to: Date }) {
    const { data } = await this.supabase
      .from('orders')
      .select('buyer_id, created_at')
      .eq('seller_id', sellerId)
      .eq('payment_status', 'completed')
      .gte('created_at', dateRange.from.toISOString())
      .lte('created_at', dateRange.to.toISOString());

    const uniqueCustomers = new Set(data?.map(order => order.buyer_id)).size;
    const repeatCustomers = this.calculateRepeatCustomers(data || []);

    return {
      total: uniqueCustomers,
      repeat: repeatCustomers,
      repeatRate: uniqueCustomers > 0 ? (repeatCustomers / uniqueCustomers) * 100 : 0
    };
  }

  private async getLivestreamMetrics(sellerId: string, dateRange: { from: Date; to: Date }) {
    const { data: sessions } = await this.supabase
      .from('livestream_sessions')
      .select(`
        id, total_products_captured, total_orders, total_revenue,
        conversion_rate, viewer_count, peak_viewers
      `)
      .eq('seller_id', sellerId)
      .gte('start_time', dateRange.from.toISOString())
      .lte('start_time', dateRange.to.toISOString());

    const totalSessions = sessions?.length || 0;
    const totalProductsCaptured = sessions?.reduce((sum, session) => sum + session.total_products_captured, 0) || 0;
    const avgConversionRate = sessions?.length > 0 
      ? sessions.reduce((sum, session) => sum + session.conversion_rate, 0) / sessions.length 
      : 0;

    return {
      totalSessions,
      totalProductsCaptured,
      avgConversionRate,
      totalViewers: sessions?.reduce((sum, session) => sum + session.viewer_count, 0) || 0
    };
  }

  private async getYesterdayRevenue(sellerId: string): Promise<number> {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const startOfDay = new Date(yesterday.setHours(0, 0, 0, 0));
    const endOfDay = new Date(yesterday.setHours(23, 59, 59, 999));

    const { data } = await this.supabase
      .from('orders')
      .select('total_amount')
      .eq('seller_id', sellerId)
      .eq('payment_status', 'completed')
      .gte('created_at', startOfDay.toISOString())
      .lte('created_at', endOfDay.toISOString());

    return data?.reduce((sum, order) => sum + order.total_amount, 0) || 0;
  }

  private groupByDate(data: any[], valueField: string) {
    const grouped = data.reduce((acc, item) => {
      const date = new Date(item.created_at).toDateString();
      if (!acc[date]) acc[date] = 0;
      acc[date] += item[valueField];
      return acc;
    }, {});

    return Object.entries(grouped).map(([date, value]) => ({
      date: new Date(date),
      value: value as number
    }));
  }

  private calculateRepeatCustomers(orders: any[]): number {
    const customerOrderCounts = orders.reduce((acc, order) => {
      acc[order.buyer_id] = (acc[order.buyer_id] || 0) + 1;
      return acc;
    }, {});

    return Object.values(customerOrderCounts).filter((count: any) => count > 1).length;
  }

  private async calculateConversionRate(sellerId: string, dateRange: { from: Date; to: Date }): Promise<number> {
    // Simple conversion rate calculation
    // In a real implementation, this would track visits vs purchases
    return Math.random() * 5 + 1; // Mock 1-6% conversion rate
  }
}
```

### **Analytics Dashboard Component**
```typescript
// app/(dashboard)/dashboard/analytics/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { AnalyticsProcessor } from '@/lib/analytics/analyticsProcessor';

export default function AnalyticsPage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    to: new Date()
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, [dateRange]);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const processor = new AnalyticsProcessor();
      const sellerId = 'current-seller-id'; // Get from auth context
      const data = await processor.getDashboardMetrics(sellerId, dateRange);
      setMetrics(data);
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    }
    setLoading(false);
  };

  if (loading) {
    return <div className="p-6">Loading analytics...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <div className="flex space-x-2">
          <button className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm">
            Last 30 Days
          </button>
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm">
            Export Report
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Today's Revenue"
          value={`₹${metrics.revenue.today.toLocaleString()}`}
          change={metrics.revenue.growth}
          icon="💰"
        />
        <MetricCard
          title="Total Orders"
          value={metrics.orders.total.toString()}
          change={5.2}
          icon="📦"
        />
        <MetricCard
          title="Conversion Rate"
          value={`${metrics.orders.conversionRate.toFixed(1)}%`}
          change={0.3}
          icon="📈"
        />
        <MetricCard
          title="Active Products"
          value={metrics.products.total.toString()}
          change={2}
          icon="🛍️"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Revenue Trend</h3>
          <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
            <span className="text-gray-500">Revenue Chart Placeholder</span>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Order Status</h3>
          <div className="space-y-3">
            <OrderStatusItem
              status="Pending"
              count={metrics.orders.pending}
              color="bg-yellow-500"
            />
            <OrderStatusItem
              status="Shipped"
              count={metrics.orders.shipped}
              color="bg-blue-500"
            />
            <OrderStatusItem
              status="Delivered"
              count={metrics.orders.delivered}
              color="bg-green-500"
            />
          </div>
        </div>
      </div>

      {/* Best Selling Products */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Best Selling Products</h3>
        <div className="space-y-3">
          {metrics.products.bestSelling.map((product: any, index: number) => (
            <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <div className="flex items-center space-x-3">
                <span className="w-6 h-6 bg-blue-500 text-white text-sm rounded-full flex items-center justify-center">
                  {index + 1}
                </span>
                <span className="font-medium">{product.name}</span>
              </div>
              <span className="text-gray-600">{product.totalSold} sold</span>
            </div>
          ))}
        </div>
      </div>

      {/* Livestream Analytics */}
      {metrics.livestream.totalSessions > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Livestream Performance</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {metrics.livestream.totalSessions}
              </div>
              <div className="text-sm text-gray-600">Total Sessions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {metrics.livestream.totalProductsCaptured}
              </div>
              <div className="text-sm text-gray-600">Products Captured</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {metrics.livestream.avgConversionRate.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Avg Conversion</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string;
  change: number;
  icon: string;
}

function MetricCard({ title, value, change, icon }: MetricCardProps) {
  const isPositive = change >= 0;
  
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <div className={`flex items-center text-sm ${
            isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            <span>{isPositive ? '↗' : '↘'}</span>
            <span className="ml-1">{Math.abs(change).toFixed(1)}%</span>
          </div>
        </div>
        <div className="text-3xl">{icon}</div>
      </div>
    </div>
  );
}

interface OrderStatusItemProps {
  status: string;
  count: number;
  color: string;
}

function OrderStatusItem({ status, count, color }: OrderStatusItemProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className={`w-3 h-3 rounded-full ${color}`}></div>
        <span className="text-gray-700">{status}</span>
      </div>
      <span className="font-semibold text-gray-900">{count}</span>
    </div>
  );
}
```

---

## **🔌 API Integration Simulations**

### **Payment Gateway Simulation**
```typescript
// lib/simulations/paymentGateway.ts
export class PaymentGatewaySimulator {
  static async processPayment(paymentData: {
    amount: number;
    method: string;
    orderId: string;
    customerDetails: any;
  }) {
    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simulate 95% success rate
    const isSuccess = Math.random() > 0.05;

    if (isSuccess) {
      return {
        status: 'success',
        transactionId: `TXN_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        amount: paymentData.amount,
        method: paymentData.method,
        timestamp: new Date().toISOString()
      };
    } else {
      return {
        status: 'failed',
        error: 'Payment failed due to insufficient funds',
        timestamp: new Date().toISOString()
      };
    }
  }

  static async createVirtualAccount(sellerData: {
    businessName: string;
    upiId: string;
    phone: string;
  }) {
    const accountNumber = Math.floor(1000000000 + Math.random() * 9000000000).toString();
    const virtualUpiId = `${sellerData.businessName.toLowerCase().replace(/\s+/g, '-')}-${Math.random().toString(36).substring(7)}@shopabell`;

    return {
      accountNumber,
      ifscCode: 'FAKE0SHOPABELL',
      virtualUpiId,
      qrCode: `upi://pay?pa=${virtualUpiId}&pn=${sellerData.businessName}`,
      status: 'active'
    };
  }

  static async verifyPayment(transactionId: string) {
    // Simulate verification delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
      transactionId,
      status: 'verified',
      amount: Math.floor(Math.random() * 5000) + 100,
      timestamp: new Date().toISOString()
    };
  }
}

// lib/simulations/shippingProvider.ts
export class ShippingProviderSimulator {
  private static couriers = [
    { name: 'Delhivery', baseRate: 45, multiplier: 1.0, reliability: 0.95 },
    { name: 'BlueDart', baseRate: 65, multiplier: 1.2, reliability: 0.98 },
    { name: 'DTDC', baseRate: 50, multiplier: 1.1, reliability: 0.90 },
    { name: 'Xpressbees', baseRate: 42, multiplier: 0.95, reliability: 0.88 }
  ];

  static async getShippingRates(shipmentData: {
    fromPincode: string;
    toPincode: string;
    weight: number;
    codRequired: boolean;
  }) {
    const rates = this.couriers.map(courier => {
      const baseRate = courier.baseRate;
      const weightMultiplier = Math.ceil(shipmentData.weight / 500);
      const codCharges = shipmentData.codRequired ? 40 : 0;
      const distanceMultiplier = this.calculateDistanceMultiplier(
        shipmentData.fromPincode, 
        shipmentData.toPincode
      );

      const totalRate = (baseRate * weightMultiplier * distanceMultiplier) + codCharges;

      return {
        courierName: courier.name,
        rate: Math.round(totalRate),
        estimatedDays: Math.ceil(Math.random() * 5) + 1,
        reliability: courier.reliability,
        codAvailable: true
      };
    });

    return rates.sort((a, b) => a.rate - b.rate);
  }

  static async generateAWB(shipmentData: {
    courierName: string;
    orderDetails: any;
  }) {
    const awbNumber = `${shipmentData.courierName.substring(0, 3).toUpperCase()}${Date.now().toString().slice(-8)}`;
    
    return {
      awbNumber,
      courierName: shipmentData.courierName,
      expectedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      trackingUrl: `https://track.shopabell.com/${awbNumber}`,
      labelUrl: `/api/shipping/label/${awbNumber}`
    };
  }

  static async trackShipment(awbNumber: string) {
    const statuses = [
      'Order created',
      'Pickup scheduled',
      'Picked up',
      'In transit',
      'Out for delivery',
      'Delivered'
    ];

    const currentStatus = Math.floor(Math.random() * statuses.length);
    
    return {
      awbNumber,
      currentStatus: statuses[currentStatus],
      statusHistory: statuses.slice(0, currentStatus + 1).map((status, index) => ({
        status,
        timestamp: new Date(Date.now() - (statuses.length - index) * 24 * 60 * 60 * 1000),
        location: this.getRandomLocation()
      })),
      estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
    };
  }

  private static calculateDistanceMultiplier(fromPin: string, toPin: string): number {
    // Simple distance calculation based on pin code difference
    const diff = Math.abs(parseInt(fromPin.substring(0, 3)) - parseInt(toPin.substring(0, 3)));
    return 1 + (diff / 1000);
  }

  private static getRandomLocation(): string {
    const locations = [
      'Mumbai Hub', 'Delhi Hub', 'Bangalore Hub', 'Chennai Hub',
      'Local Facility', 'Distribution Center', 'Last Mile Hub'
    ];
    return locations[Math.floor(Math.random() * locations.length)];
  }
}

// lib/simulations/notificationService.ts
export class NotificationServiceSimulator {
  static async sendSMS(to: string, message: string) {
    console.log(`SMS to ${to}: ${message}`);
    
    // Simulate SMS sending delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      status: 'sent',
      messageId: `SMS_${Date.now()}`,
      timestamp: new Date().toISOString()
    };
  }

  static async sendWhatsApp(to: string, message: string, template?: string) {
    console.log(`WhatsApp to ${to}: ${message}`);
    
    // Simulate WhatsApp sending delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return {
      status: 'sent',
      messageId: `WA_${Date.now()}`,
      timestamp: new Date().toISOString()
    };
  }

  static async sendEmail(to: string, subject: string, body: string) {
    console.log(`Email to ${to}: ${subject}`);
    
    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      status: 'sent',
      messageId: `EMAIL_${Date.now()}`,
      timestamp: new Date().toISOString()
    };
  }

  static async sendPushNotification(userId: string, title: string, body: string) {
    console.log(`Push to ${userId}: ${title} - ${body}`);
    
    return {
      status: 'sent',
      notificationId: `PUSH_${Date.now()}`,
      timestamp: new Date().toISOString()
    };
  }
}
```

---

## **🧪 Comprehensive Testing Implementation**

### **E2E Testing Setup**
```typescript
// cypress/e2e/complete-seller-journey.cy.ts
describe('Complete Seller Journey', () => {
  it('should onboard seller and process first sale', () => {
    // WhatsApp Onboarding
    cy.visit('/onboard');
    cy.get('[data-testid="business-name-input"]').type('Test Fashion Store');
    cy.get('[data-testid="category-fashion"]').click();
    cy.get('[data-testid="upi-input"]').type('test@paytm');
    cy.get('[data-testid="address-input"]').type('123 Test Street, Bangalore');
    cy.get('[data-testid="phone-input"]').type('9876543210');
    cy.get('[data-testid="complete-onboarding"]').click();

    // Verify dashboard access
    cy.url().should('include', '/dashboard');
    cy.get('[data-testid="welcome-message"]').should('contain', 'Test Fashion Store');

    // Add first product
    cy.get('[data-testid="add-product"]').click();
    cy.get('[data-testid="product-name"]').type('Blue Shirt');
    cy.get('[data-testid="product-price"]').type('599');
    cy.get('[data-testid="product-description"]').type('Beautiful blue shirt');
    cy.get('[data-testid="image-upload"]').selectFile('cypress/fixtures/blue-shirt.jpg');
    cy.get('[data-testid="save-product"]').click();

    // Verify product created
    cy.get('[data-testid="product-card"]').should('be.visible');

    // Simulate buyer interaction
    cy.visit('/store/test-fashion-store');
    cy.get('[data-testid="product-card"]').click();
    cy.get('[data-testid="chat-seller"]').click();

    // Chat conversation
    cy.get('[data-testid="message-input"]').type('Is this available?');
    cy.get('[data-testid="send-message"]').click();

    // Switch to seller view
    cy.visit('/dashboard/chats');
    cy.get('[data-testid="chat-conversation"]').click();
    cy.get('[data-testid="message-input"]').type('sell 599');
    cy.get('[data-testid="send-message"]').click();

    // Verify checkout created
    cy.get('[data-testid="checkout-created"]').should('be.visible');

    // Complete purchase as buyer
    cy.visit('/checkout/test-order-id');
    cy.get('[data-testid="buyer-name"]').type('Test Buyer');
    cy.get('[data-testid="buyer-phone"]').type('8765432109');
    cy.get('[data-testid="shipping-address"]').type('456 Buyer Street, Delhi');
    cy.get('[data-testid="place-order"]').click();

    // Verify order success
    cy.get('[data-testid="order-success"]').should('be.visible');

    // Check seller dashboard
    cy.visit('/dashboard');
    cy.get('[data-testid="new-orders"]').should('contain', '1');
    cy.get('[data-testid="today-revenue"]').should('contain', '₹599');
  });
});

// cypress/e2e/livestream-workflow.cy.ts
describe('Livestream Workflow', () => {
  beforeEach(() => {
    cy.loginAsSeller('test@example.com');
  });

  it('should capture products during livestream and convert to sales', () => {
    // Start livestream session
    cy.visit('/dashboard/livestream');
    cy.get('[data-testid="start-livestream"]').click();
    cy.get('[data-testid="session-name"]').type('Evening Fashion Show');
    cy.get('[data-testid="begin-recording"]').click();

    // Verify widget appears
    cy.get('[data-testid="livestream-widget"]').should('be.visible');
    cy.get('[data-testid="recording-status"]').should('contain', 'Recording');

    // Simulate product captures
    cy.tick(5000); // Mock 5 seconds
    cy.get('[data-testid="products-captured"]').should('contain', '1');

    cy.tick(5000);
    cy.get('[data-testid="products-captured"]').should('contain', '2');

    // Stop recording
    cy.get('[data-testid="stop-recording"]').click();

    // Review captured products
    cy.visit('/dashboard/livestream/sessions/current');
    cy.get('[data-testid="captured-product"]').should('have.length.at.least', 2);

    // Activate products
    cy.get('[data-testid="product-1"]').click();
    cy.get('[data-testid="edit-product"]').click();
    cy.get('[data-testid="product-name"]').clear().type('Red Dress');
    cy.get('[data-testid="product-price"]').type('1299');
    cy.get('[data-testid="activate-product"]').click();

    // Verify product is live
    cy.visit('/store/test-seller');
    cy.get('[data-testid="product-red-dress"]').should('be.visible');
  });
});
```

### **Component Testing**
```typescript
// cypress/component/WhatsAppOnboarding.cy.tsx
import { WhatsAppOnboarding } from '../../components/whatsapp/WhatsAppOnboarding';

describe('WhatsApp Onboarding Component', () => {
  it('should complete onboarding flow', () => {
    cy.mount(<WhatsAppOnboarding />);

    // Initial message
    cy.get('[data-testid="bot-message"]').should('contain', 'Welcome to ShopAbell');

    // Business name input
    cy.get('[data-testid="text-input"]').type('Test Store');
    cy.get('[data-testid="send-button"]').click();

    // Category selection
    cy.get('[data-testid="option-1"]').click();

    // UPI input
    cy.get('[data-testid="text-input"]').type('test@paytm');
    cy.get('[data-testid="send-button"]').click();

    // Verify completion
    cy.get('[data-testid="onboarding-complete"]').should('be.visible');
  });

  it('should validate UPI format', () => {
    cy.mount(<WhatsAppOnboarding />);
    
    // Navigate to UPI step
    cy.get('[data-testid="text-input"]').type('Test Store');
    cy.get('[data-testid="send-button"]').click();
    cy.get('[data-testid="option-1"]').click();

    // Invalid UPI
    cy.get('[data-testid="text-input"]').type('invalid-upi');
    cy.get('[data-testid="send-button"]').click();

    // Should show error
    cy.get('[data-testid="error-message"]').should('contain', 'valid UPI ID');
  });
});

// cypress/component/ChatInterface.cy.tsx
import { ChatInterface } from '../../components/chat/ChatInterface';

describe('Chat Interface Component', () => {
  it('should handle sell command correctly', () => {
    cy.mount(
      <ChatInterface 
        chatId="test-chat" 
        currentUserId="seller-1" 
        userRole="seller" 
      />
    );

    // Send sell command
    cy.get('[data-testid="message-input"]').type('sell 599');
    cy.get('[data-testid="send-button"]').click();

    // Verify checkout created
    cy.get('[data-testid="checkout-message"]').should('be.visible');
    cy.get('[data-testid="checkout-amount"]').should('contain', '₹599');
  });

  it('should parse complex sell commands', () => {
    cy.mount(
      <ChatInterface 
        chatId="test-chat" 
        currentUserId="seller-1" 
        userRole="seller" 
      />
    );

    // Complex sell command
    cy.get('[data-testid="message-input"]').type('sell 799 red L');
    cy.get('[data-testid="send-button"]').click();

    // Verify variants parsed
    cy.get('[data-testid="checkout-variants"]').should('contain', 'red');
    cy.get('[data-testid="checkout-variants"]').should('contain', 'L');
  });
});
```

### **API Testing**
```typescript
// cypress/e2e/api/orders.cy.ts
describe('Orders API', () => {
  it('should create order successfully', () => {
    cy.request('POST', '/api/orders/create', {
      buyerId: 'buyer-1',
      sellerId: 'seller-1',
      productId: 'product-1',
      quantity: 1,
      unitPrice: 599,
      shippingAddress: {
        name: 'Test User',
        address: '123 Test St',
        city: 'Bangalore',
        pincode: '560001'
      },
      paymentMethod: 'UPI'
    }).then((response) => {
      expect(response.status).to.eq(201);
      expect(response.body.data.order_number).to.exist;
      expect(response.body.data.total_amount).to.eq(599);
    });
  });

  it('should handle payment processing', () => {
    // Create order first
    cy.request('POST', '/api/orders/create', {
      buyerId: 'buyer-1',
      sellerId: 'seller-1',
      productId: 'product-1',
      quantity: 1,
      unitPrice: 599
    }).then((orderResponse) => {
      const orderId = orderResponse.body.data.id;

      // Process payment
      cy.request('POST', `/api/orders/${orderId}/payment`, {
        transactionId: 'txn_test_123',
        status: 'success',
        method: 'UPI'
      }).then((paymentResponse) => {
        expect(paymentResponse.status).to.eq(200);
        expect(paymentResponse.body.data.payment_status).to.eq('completed');
      });
    });
  });
});

// cypress/e2e/api/products.cy.ts
describe('Products API', () => {
  it('should create product successfully', () => {
    cy.request('POST', '/api/products/create', {
      name: 'Test Product',
      price: 999,
      description: 'Test description',
      category: 'fashion',
      images: ['test-image.jpg'],
      stock_quantity: 10
    }).then((response) => {
      expect(response.status).to.eq(201);
      expect(response.body.data.name).to.eq('Test Product');
      expect(response.body.data.price).to.eq(999);
    });
  });

  it('should validate required fields', () => {
    cy.request({
      method: 'POST',
      url: '/api/products/create',
      body: {
        name: '',
        price: -100
      },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(400);
      expect(response.body.errors).to.include('Name is required');
      expect(response.body.errors).to.include('Price must be positive');
    });
  });
});
```

---

## **🚀 Deployment Configuration**

### **Vercel Configuration**
```json
// vercel.json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase-url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase-anon-key",
    "SUPABASE_SERVICE_ROLE_KEY": "@supabase-service-key"
  },
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/$1"
    }
  ]
}
```

### **Environment Variables**
```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-key

# App Configuration
NEXT_PUBLIC_APP_URL=https://shopabell.vercel.app
NEXT_PUBLIC_APP_ENV=production

# Simulation Flags (set to false when integrating real services)
SIMULATE_WHATSAPP=true
SIMULATE_PAYMENTS=true
SIMULATE_SHIPPING=true
SIMULATE_SMS=true

# Real API Keys (when ready to integrate)
WHATSAPP_ACCESS_TOKEN=your-whatsapp-token
DECENTRO_CLIENT_ID=your-decentro-client-id
DECENTRO_CLIENT_SECRET=your-decentro-client-secret
SHIPROCKET_EMAIL=your-shiprocket-email
SHIPROCKET_PASSWORD=your-shiprocket-password
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
```

### **Package.json Configuration**
```json
{
  "name": "shopabell",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:e2e": "cypress run",
    "test:e2e:open": "cypress open",
    "test:component": "cypress run --component",
    "db:reset": "supabase db reset",
    "db:migrate": "supabase migration up",
    "db:seed": "node scripts/seed.js",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "next": "14.0.0",
    "react": "18.2.0",
    "react-dom": "18.2.0",
    "@supabase/supabase-js": "^2.38.0",
    "@supabase/ssr": "^0.0.10",
    "typescript": "5.2.2",
    "tailwindcss": "3.3.5",
    "@headlessui/react": "^1.7.17",
    "@heroicons/react": "^2.0.18",
    "lucide-react": "^0.294.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0",
    "zod": "^3.22.4",
    "react-hook-form": "^7.47.0",
    "@hookform/resolvers": "^3.3.2",
    "date-fns": "^2.30.0",
    "recharts": "^2.8.0",
    "html2canvas": "^1.4.1",
    "crypto-js": "^4.2.0"
  },
  "devDependencies": {
    "@types/node": "20.8.9",
    "@types/react": "18.2.33",
    "@types/react-dom": "18.2.14",
    "@types/crypto-js": "^4.2.1",
    "eslint": "8.52.0",
    "eslint-config-next": "14.0.0",
    "autoprefixer": "10.4.16",
    "postcss": "8.4.31",
    "vitest": "^0.34.6",
    "@vitejs/plugin-react": "^4.1.0",
    "jsdom": "^22.1.0",
    "@testing-library/react": "^13.4.0",
    "@testing-library/jest-dom": "^6.1.4",
    "cypress": "^13.4.0",
    "@cypress/react18": "^2.0.1",
    "@cypress/webpack-dev-server": "^3.7.0"
  }
}
```

---

## **📝 Implementation Checklist**

### **Phase 1: Foundation (Week 1-2)**
- [ ] Next.js 14 project setup with TypeScript
- [ ] Supabase project creation and database schema
- [ ] Tailwind CSS configuration with custom design system
- [ ] Authentication system with Supabase Auth
- [ ] Basic routing structure (auth, dashboard, store, admin)
- [ ] Core UI components library
- [ ] WhatsApp onboarding simulation interface

### **Phase 2: Core Features (Week 3-4)**
- [ ] Product management system (CRUD operations)
- [ ] Image upload and processing with Supabase Storage
- [ ] Simple livestream widget with screenshot simulation
- [ ] Client-side image processing (crop, resize, enhance)
- [ ] Chat system with real-time messaging
- [ ] "Sell" command parser and checkout generation
- [ ] Order management system

### **Phase 3: Business Logic (Week 5-6)**
- [ ] Payment system simulation with Decentro-like interface
- [ ] Shipping integration simulation with courier selection
- [ ] Inventory management and stock tracking
- [ ] Analytics dashboard with key metrics
- [ ] Notification system (in-app, email simulation)
- [ ] Admin partnership program

### **Phase 4: Advanced Features (Week 7-8)**
- [ ] Multi-channel product sync
- [ ] Advanced chat features (typing indicators, read receipts)
- [ ] Livestream session management and analytics
- [ ] Product import from URLs and social media
- [ ] Bulk operations and CSV import/export
- [ ] Performance optimization and caching

### **Phase 5: Testing & Deployment (Week 9-10)**
- [ ] Comprehensive E2E testing with Cypress
- [ ] Component testing for all UI components
- [ ] API testing for all endpoints
- [ ] Performance testing and optimization
- [ ] Security testing and vulnerability assessment
- [ ] Vercel deployment configuration
- [ ] Database performance optimization
- [ ] Error monitoring and logging setup

### **Phase 6: Integration Preparation (Week 11-12)**
- [ ] Real WhatsApp Business API integration preparation
- [ ] De# 🚀 ShopAbell Complete Development Plan
## End-to-End Implementation Guide for Claude Code

---

## **📋 Project Overview**

### **Vision Statement**
Build the world's first AI-powered social commerce operating system that transforms any social media creator into a professional e-commerce business in under 30 seconds.

### **Core Value Proposition**
- **30-second WhatsApp onboarding** (simulated interface)
- **AI livestream-to-catalog** conversion (simple screenshot + crop)
- **Revolutionary "sell" command** for instant checkout
- **Direct instant payments** to seller accounts
- **Automated shipping** with multi-courier selection
- **Complete analytics** and business intelligence

---

## **🏗️ Technical Architecture**

### **Stack Overview**
```
Frontend: Next.js 14 + TypeScript + Tailwind CSS
Database: Supabase (PostgreSQL + Real-time + Storage + Auth)
Deployment: Vercel
AI Processing: Client-side JavaScript (no external APIs)
Simulations: WhatsApp UI, Decentro, Shiprocket (all built-in)
```

### **Project Structure**
```
shopabell/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication pages
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   └── onboard/page.tsx     # WhatsApp simulation
│   ├── (dashboard)/             # Seller dashboard
│   │   ├── dashboard/
│   │   │   ├── page.tsx         # Main dashboard
│   │   │   ├── products/        # Product management
│   │   │   ├── orders/          # Order management
│   │   │   ├── chats/           # Chat interface
│   │   │   ├── livestream/      # Livestream features
│   │   │   ├── analytics/       # Analytics dashboard
│   │   │   └── settings/        # Account settings
│   │   └── layout.tsx
│   ├── (store)/                 # Buyer-facing store
│   │   ├── store/[slug]/        # Store pages
│   │   ├── product/[id]/        # Product pages
│   │   ├── cart/                # Shopping cart
│   │   └── checkout/            # Checkout flow
│   ├── (admin)/                 # Admin panel
│   │   └── admin/               # Admin features
│   ├── api/                     # API routes
│   │   ├── auth/                # Authentication
│   │   ├── products/            # Product CRUD
│   │   ├── orders/              # Order management
│   │   ├── chat/                # Chat system
│   │   ├── payments/            # Payment simulation
│   │   ├── shipping/            # Shipping simulation
│   │   ├── whatsapp/            # WhatsApp simulation
│   │   └── webhooks/            # Webhook handlers
│   ├── components/              # Reusable components
│   │   ├── ui/                  # Base UI components
│   │   ├── forms/               # Form components
│   │   ├── dashboard/           # Dashboard components
│   │   ├── store/               # Store components
│   │   ├── chat/                # Chat components
│   │   └── whatsapp/            # WhatsApp UI components
│   ├── lib/                     # Utilities and helpers
│   │   ├── supabase/            # Supabase client
│   │   ├── utils/               # General utilities
│   │   ├── hooks/               # Custom React hooks
│   │   ├── ai/                  # Client-side AI processing
│   │   ├── validations/         # Form validations
│   │   └── simulations/         # API simulations
│   ├── styles/                  # CSS files
│   │   └── globals.css
│   ├── public/                  # Static assets
│   │   ├── images/
│   │   ├── icons/
│   │   └── fonts/
│   └── types/                   # TypeScript definitions
├── components.json              # Shadcn/ui config
├── tailwind.config.js           # Tailwind configuration
├── next.config.js               # Next.js configuration
├── package.json
├── tsconfig.json
└── README.md
```

---

## **🗄️ Complete Database Schema**

### **Supabase Setup**
```sql
-- Enable Row Level Security and Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE users, sellers, products, orders, chats, chat_messages;

-- Users table (Base user information)
CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    phone VARCHAR(15) UNIQUE NOT NULL,
    name VARCHAR(100),
    email VARCHAR(255),
    role VARCHAR(20) DEFAULT 'buyer' CHECK (role IN ('seller', 'buyer', 'admin', 'group_admin')),
    language_preference VARCHAR(5) DEFAULT 'en',
    profile_image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_verified BOOLEAN DEFAULT FALSE,
    verification_documents JSONB DEFAULT '[]',
    device_info JSONB DEFAULT '{}',
    timezone VARCHAR(50) DEFAULT 'Asia/Kolkata',
    app_version VARCHAR(20)
);

-- Sellers table (Seller-specific information)
CREATE TABLE sellers (
    id UUID REFERENCES users(id) PRIMARY KEY,
    business_name VARCHAR(255) NOT NULL,
    business_category VARCHAR(100),
    upi_id VARCHAR(255),
    bank_account VARCHAR(50),
    ifsc_code VARCHAR(20),
    pan_number VARCHAR(20),
    aadhaar_number TEXT, -- encrypted
    gstin VARCHAR(20),
    pickup_address JSONB NOT NULL,
    virtual_account_number VARCHAR(50),
    virtual_upi_id VARCHAR(255),
    subscription_plan VARCHAR(20) DEFAULT 'free' CHECK (subscription_plan IN ('free', 'basic', 'premium')),
    subscription_expires DATE,
    subscription_payment_history JSONB DEFAULT '[]',
    onboarding_completed BOOLEAN DEFAULT FALSE,
    onboarding_step INTEGER DEFAULT 0,
    verification_status VARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
    store_slug VARCHAR(100) UNIQUE NOT NULL,
    store_theme VARCHAR(50) DEFAULT 'default',
    store_settings JSONB DEFAULT '{}',
    business_hours JSONB DEFAULT '{"always_open": true}',
    auto_reply_enabled BOOLEAN DEFAULT FALSE,
    auto_reply_message TEXT,
    commission_rate DECIMAL(5,2) DEFAULT 3.00,
    referred_by UUID REFERENCES users(id),
    total_sales DECIMAL(12,2) DEFAULT 0,
    total_orders INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    last_live_session TIMESTAMP WITH TIME ZONE,
    preferred_couriers JSONB DEFAULT '[]',
    shipping_settings JSONB DEFAULT '{}',
    tax_settings JSONB DEFAULT '{}'
);

-- Buyers table (Buyer-specific information)
CREATE TABLE buyers (
    id UUID REFERENCES users(id) PRIMARY KEY,
    default_address JSONB,
    saved_addresses JSONB DEFAULT '[]',
    payment_methods JSONB DEFAULT '[]',
    wishlist JSONB DEFAULT '[]',
    order_history_count INTEGER DEFAULT 0,
    total_spent DECIMAL(12,2) DEFAULT 0,
    loyalty_points INTEGER DEFAULT 0,
    preferred_categories JSONB DEFAULT '[]',
    last_order_date DATE,
    notification_preferences JSONB DEFAULT '{"sms": true, "whatsapp": true, "email": true}'
);

-- Categories table
CREATE TABLE categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    parent_id UUID REFERENCES categories(id),
    description TEXT,
    image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    commission_rate DECIMAL(5,2) DEFAULT 3.00,
    product_count INTEGER DEFAULT 0
);

-- Products table
CREATE TABLE products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    seller_id UUID REFERENCES sellers(id) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    short_description VARCHAR(500),
    price DECIMAL(10,2) NOT NULL,
    original_price DECIMAL(10,2),
    cost_price DECIMAL(10,2),
    images JSONB DEFAULT '[]',
    variants JSONB DEFAULT '[]',
    stock_quantity INTEGER DEFAULT 0,
    reserved_stock INTEGER DEFAULT 0,
    low_stock_threshold INTEGER DEFAULT 5,
    category_id UUID REFERENCES categories(id),
    subcategory VARCHAR(100),
    tags JSONB DEFAULT '[]',
    brand VARCHAR(100),
    model VARCHAR(100),
    weight DECIMAL(8,2) DEFAULT 0,
    dimensions JSONB DEFAULT '{"length": 0, "width": 0, "height": 0}',
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    created_from VARCHAR(20) DEFAULT 'manual' CHECK (created_from IN ('manual', 'livestream', 'import', 'whatsapp', 'social')),
    livestream_session_id UUID,
    source_timestamp BIGINT,
    source_url TEXT,
    seo_title VARCHAR(255),
    seo_description TEXT,
    meta_keywords JSONB DEFAULT '[]',
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    share_count INTEGER DEFAULT 0,
    conversion_rate DECIMAL(5,2) DEFAULT 0,
    last_sold_at TIMESTAMP WITH TIME ZONE,
    featured_until TIMESTAMP WITH TIME ZONE,
    discount_percentage DECIMAL(5,2) DEFAULT 0,
    discount_start_date DATE,
    discount_end_date DATE,
    shipping_cost DECIMAL(8,2) DEFAULT 0,
    cod_available BOOLEAN DEFAULT TRUE,
    return_policy TEXT,
    warranty_info TEXT,
    care_instructions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product variants table
CREATE TABLE product_variants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    variant_type VARCHAR(50) NOT NULL, -- color, size, style
    variant_value VARCHAR(100) NOT NULL,
    price_adjustment DECIMAL(8,2) DEFAULT 0,
    stock_quantity INTEGER DEFAULT 0,
    sku VARCHAR(100) UNIQUE,
    image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE
);

-- Livestream sessions table
CREATE TABLE livestream_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    seller_id UUID REFERENCES sellers(id) NOT NULL,
    session_name VARCHAR(255),
    session_description TEXT,
    start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_time TIMESTAMP WITH TIME ZONE,
    scheduled_start TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'recording' CHECK (status IN ('scheduled', 'recording', 'processing', 'completed', 'cancelled')),
    platform VARCHAR(20) DEFAULT 'facebook' CHECK (platform IN ('facebook', 'instagram', 'youtube', 'whatsapp_status')),
    platform_url TEXT,
    total_products_captured INTEGER DEFAULT 0,
    screenshots_count INTEGER DEFAULT 0,
    processing_progress INTEGER DEFAULT 0,
    viewer_count INTEGER DEFAULT 0,
    peak_viewers INTEGER DEFAULT 0,
    total_orders INTEGER DEFAULT 0,
    total_revenue DECIMAL(12,2) DEFAULT 0,
    engagement_rate DECIMAL(5,2) DEFAULT 0,
    conversion_rate DECIMAL(5,2) DEFAULT 0,
    recording_file_url TEXT,
    thumbnail_url TEXT,
    ai_processing_logs JSONB DEFAULT '[]',
    session_settings JSONB DEFAULT '{}',
    pinned_comment TEXT,
    chat_logs JSONB DEFAULT '[]'
);

-- Livestream products table
CREATE TABLE livestream_products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES livestream_sessions(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    timestamp_captured INTEGER NOT NULL,
    duration_shown INTEGER DEFAULT 0,
    screenshot_url TEXT NOT NULL,
    ai_confidence_score DECIMAL(3,2) DEFAULT 0,
    manual_verification BOOLEAN DEFAULT FALSE,
    orders_generated INTEGER DEFAULT 0,
    views_during_show INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
CREATE TABLE orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_number VARCHAR(20) UNIQUE NOT NULL,
    buyer_id UUID REFERENCES buyers(id) NOT NULL,
    seller_id UUID REFERENCES sellers(id) NOT NULL,
    product_id UUID REFERENCES products(id) NOT NULL,
    variant_id UUID REFERENCES product_variants(id),
    quantity INTEGER DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(8,2) DEFAULT 0,
    shipping_cost DECIMAL(8,2) DEFAULT 0,
    tax_amount DECIMAL(8,2) DEFAULT 0,
    platform_fee DECIMAL(8,2) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50),
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded', 'cancelled')),
    payment_transaction_id VARCHAR(255),
    payment_gateway VARCHAR(50),
    shipping_address JSONB NOT NULL,
    billing_address JSONB,
    order_status VARCHAR(30) DEFAULT 'pending' CHECK (order_status IN ('pending', 'confirmed', 'processing', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned')),
    tracking_number VARCHAR(100),
    courier_partner VARCHAR(100),
    estimated_delivery DATE,
    actual_delivery TIMESTAMP WITH TIME ZONE,
    chat_context JSONB DEFAULT '{}',
    created_via VARCHAR(20) DEFAULT 'direct_buy' CHECK (created_via IN ('chat', 'direct_buy', 'whatsapp', 'app', 'website')),
    seller_notes TEXT,
    buyer_notes TEXT,
    cancellation_reason TEXT,
    return_reason TEXT,
    return_status VARCHAR(20) DEFAULT 'not_requested' CHECK (return_status IN ('not_requested', 'requested', 'approved', 'rejected', 'picked_up', 'refunded')),
    delivery_attempts INTEGER DEFAULT 0,
    cod_amount DECIMAL(10,2),
    cod_collection_status VARCHAR(20) DEFAULT 'pending' CHECK (cod_collection_status IN ('pending', 'collected', 'failed')),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    review_images JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chats table
CREATE TABLE chats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    buyer_id UUID REFERENCES buyers(id) NOT NULL,
    seller_id UUID REFERENCES sellers(id) NOT NULL,
    product_id UUID REFERENCES products(id),
    order_id UUID REFERENCES orders(id),
    chat_type VARCHAR(20) DEFAULT 'product_inquiry' CHECK (chat_type IN ('product_inquiry', 'order_support', 'general')),
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_message_by UUID REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'archived', 'order_created', 'resolved')),
    unread_count_buyer INTEGER DEFAULT 0,
    unread_count_seller INTEGER DEFAULT 0,
    is_starred BOOLEAN DEFAULT FALSE,
    priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    auto_replies_count INTEGER DEFAULT 0,
    human_intervention_required BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat messages table
CREATE TABLE chat_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id) NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'audio', 'video', 'product', 'order', 'system')),
    content TEXT NOT NULL,
    media_url TEXT,
    metadata JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    edited_at TIMESTAMP WITH TIME ZONE,
    reply_to_message_id UUID REFERENCES chat_messages(id)
);

-- Admin partnerships table
CREATE TABLE admin_partnerships (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_user_id UUID REFERENCES users(id) NOT NULL,
    group_name VARCHAR(255) NOT NULL,
    group_platform VARCHAR(20) CHECK (group_platform IN ('facebook', 'whatsapp', 'telegram', 'instagram')),
    group_url TEXT,
    group_member_count INTEGER DEFAULT 0,
    referral_code VARCHAR(20) UNIQUE NOT NULL,
    commission_rate DECIMAL(4,2) DEFAULT 0.50,
    total_referrals INTEGER DEFAULT 0,
    active_referrals INTEGER DEFAULT 0,
    total_gmv DECIMAL(15,2) DEFAULT 0,
    total_commission_earned DECIMAL(10,2) DEFAULT 0,
    pending_commission DECIMAL(10,2) DEFAULT 0,
    paid_commission DECIMAL(10,2) DEFAULT 0,
    last_payout_date DATE,
    payout_method VARCHAR(50),
    payout_details JSONB DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'terminated')),
    performance_tier VARCHAR(20) DEFAULT 'bronze' CHECK (performance_tier IN ('bronze', 'silver', 'gold', 'platinum')),
    bonus_eligibility BOOLEAN DEFAULT TRUE,
    monthly_targets JSONB DEFAULT '{}',
    marketing_materials_access BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('order', 'payment', 'shipping', 'chat', 'system', 'marketing')),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    channels JSONB DEFAULT '["app"]', -- app, email, sms, whatsapp
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE,
    action_url TEXT,
    expires_at TIMESTAMP WITH TIME ZONE
);

-- Analytics events table
CREATE TABLE analytics_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    session_id VARCHAR(255),
    event_type VARCHAR(100) NOT NULL,
    event_data JSONB DEFAULT '{}',
    page_url TEXT,
    referrer TEXT,
    user_agent TEXT,
    ip_address INET,
    device_type VARCHAR(20) CHECK (device_type IN ('mobile', 'tablet', 'desktop')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_products_seller_id ON products(seller_id);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_orders_buyer_id ON orders(buyer_id);
CREATE INDEX idx_orders_seller_id ON orders(seller_id);
CREATE INDEX idx_orders_status ON orders(order_status);
CREATE INDEX idx_chat_messages_chat_id ON chat_messages(chat_id);
CREATE INDEX idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_type ON analytics_events(event_type);

-- Set up Row Level Security policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE buyers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Sellers can manage own products" ON products FOR ALL USING (seller_id = auth.uid());
CREATE POLICY "Orders visible to buyer and seller" ON orders FOR SELECT USING (buyer_id = auth.uid() OR seller_id = auth.uid());
CREATE POLICY "Chat messages visible to participants" ON chat_messages FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM chats 
        WHERE chats.id = chat_messages.chat_id 
        AND (chats.buyer_id = auth.uid() OR chats.seller_id = auth.uid())
    )
);

-- Insert default categories
INSERT INTO categories (name, slug, description) VALUES
('Fashion & Clothing', 'fashion', 'Clothes, accessories, and fashion items'),
('Beauty & Cosmetics', 'beauty', 'Beauty products and cosmetics'),
('Electronics & Gadgets', 'electronics', 'Electronic devices and gadgets'),
('Home & Kitchen', 'home-kitchen', 'Home appliances and kitchen items'),
('Jewelry & Accessories', 'jewelry', 'Jewelry and fashion accessories'),
('Books & Stationery', 'books', 'Books, stationery, and educational materials'),
('Sports & Fitness', 'sports', 'Sports equipment and fitness products'),
('Food & Beverages', 'food', 'Food items and beverages');
```

---

## **🎨 Design System Implementation**

### **Tailwind Configuration**
```javascript
// tailwind.config.js
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          900: '#1e3a8a'
        },
        accent: {
          purple: {
            500: '#8b5cf6',
            600: '#7c3aed',
            700: '#6d28d9'
          },
          green: {
            500: '#22c55e',
            600: '#16a34a'
          },
          orange: {
            500: '#f59e0b',
            600: '#d97706'
          }
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Poppins', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 3s infinite',
        'fade-in': 'fadeIn 0.8s ease-out',
        'slide-up': 'slideUp 0.8s ease-out'
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' }
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { transform: 'translateY(30px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        }
      }
    },
  },
  plugins: [],
}
```

### **Component Library Structure**
```typescript
// components/ui/button.tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
}

// components/ui/card.tsx
interface CardProps {
  className?: string;
  children: React.ReactNode;
}

// components/ui/input.tsx
interface InputProps {
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  label?: string;
}
```

---

## **📱 WhatsApp Onboarding Simulation**

### **WhatsApp UI Components**
```typescript
// components/whatsapp/WhatsAppContainer.tsx
export function WhatsAppContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-md mx-auto bg-gray-100 min-h-screen">
      {/* WhatsApp Header */}
      <div className="bg-green-600 text-white p-4 flex items-center space-x-3">
        <button className="text-white">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
          <span className="text-sm font-bold text-gray-700">SA</span>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold">ShopAbell</h3>
          <p className="text-xs opacity-80">Online</p>
        </div>
        <button className="text-white">
          <Phone className="w-5 h-5" />
        </button>
        <button className="text-white">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>
      
      {/* Chat Area */}
      <div className="flex-1 bg-chat-pattern bg-opacity-10 p-4">
        {children}
      </div>
      
      {/* Input Area */}
      <div className="bg-gray-50 p-4 flex items-center space-x-2">
        <button className="text-gray-500">
          <Paperclip className="w-5 h-5" />
        </button>
        <div className="flex-1 bg-white rounded-full px-4 py-2 flex items-center space-x-2">
          <input 
            type="text" 
            placeholder="Type a message..."
            className="flex-1 outline-none"
            disabled
          />
          <button className="text-gray-500">
            <Smile className="w-5 h-5" />
          </button>
        </div>
        <button className="bg-green-600 text-white p-2 rounded-full">
          <Mic className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

// components/whatsapp/ChatMessage.tsx
interface ChatMessageProps {
  message: string;
  sender: 'bot' | 'user';
  timestamp?: string;
  showOptions?: string[];
  onOptionClick?: (option: string) => void;
}

export function ChatMessage({ message, sender, timestamp, showOptions, onOptionClick }: ChatMessageProps) {
  return (
    <div className={`flex ${sender === 'user' ? 'justify-end' : 'justify-start'} mb-2`}>
      <div className={`max-w-xs rounded-lg p-3 ${
        sender === 'user' 
          ? 'bg-green-500 text-white rounded-br-sm' 
          : 'bg-white text-gray-800 rounded-bl-sm shadow-sm'
      }`}>
        <p className="text-sm">{message}</p>
        {showOptions && (
          <div className="mt-2 space-y-1">
            {showOptions.map((option, index) => (
              <button
                key={index}
                onClick={() => onOptionClick?.(option)}
                className="block w-full text-left p-2 text-xs bg-blue-50 text-blue-700 rounded border hover:bg-blue-100 transition-colors"
              >
                {option}
              </button>
            ))}
          </div>
        )}
        <p className={`text-xs mt-1 ${
          sender === 'user' ? 'text-green-100' : 'text-gray-500'
        }`}>
          {timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
}
```

### **Onboarding Flow Logic**
```typescript
// app/(auth)/onboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { WhatsAppContainer, ChatMessage } from '@/components/whatsapp';

interface OnboardingStep {
  id: string;
  botMessage: string;
  options?: string[];
  inputType?: 'text' | 'select' | 'phone' | 'upi';
  validation?: (value: string) => boolean;
  errorMessage?: string;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    botMessage: 'Welcome to ShopAbell! 🎉\n\nI\'ll help you set up your store in just 30 seconds.\n\nWhat\'s your business name?',
    inputType: 'text',
    validation: (value) => value.length >= 2,
    errorMessage: 'Business name must be at least 2 characters'
  },
  {
    id: 'category',
    botMessage: 'Great! What do you sell? Choose your category:',
    options: [
      '1️⃣ Fashion & Clothing',
      '2️⃣ Beauty & Cosmetics', 
      '3️⃣ Electronics & Gadgets',
      '4️⃣ Home & Kitchen',
      '5️⃣ Jewelry & Accessories',
      '6️⃣ Books & Stationery',
      '7️⃣ Sports & Fitness',
      '8️⃣ Food & Beverages'
    ],
    inputType: 'select'
  },
  {
    id: 'upi',
    botMessage: 'Perfect! Now share your UPI ID to receive payments instantly:',
    inputType: 'upi',
    validation: (value) => /^[\w.-]+@[\w.-]+$/.test(value),
    errorMessage: 'Please enter a valid UPI ID (e.g., yourname@paytm)'
  },
  {
    id: 'address',
    botMessage: 'Share your pickup address (where we\'ll collect orders):',
    inputType: 'text',
    validation: (value) => value.length >= 10,
    errorMessage: 'Please enter a complete address'
  },
  {
    id: 'phone',
    botMessage: 'What\'s your business contact number?',
    inputType: 'phone',
    validation: (value) => /^[6-9]\d{9}$/.test(value.replace(/\D/g, '')),
    errorMessage: 'Please enter a valid 10-digit mobile number'
  },
  {
    id: 'complete',
    botMessage: '🎉 Congratulations! Your store is ready!\n\n✅ Store: shopabell.com/{store_slug}\n✅ Payments: {upi_id}\n✅ Ready to sell!\n\nDownload our app to start selling:',
    options: ['📱 Download App', '🌐 Open Store', '📊 View Dashboard']
  }
];

export default function OnboardPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [messages, setMessages] = useState<Array<{
    message: string;
    sender: 'bot' | 'user';
    timestamp: string;
    options?: string[];
  }>>([]);
  const [userData, setUserData] = useState<Record<string, string>>({});
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    // Show initial message with delay to simulate real WhatsApp
    setTimeout(() => {
      showBotMessage(ONBOARDING_STEPS[0]);
    }, 1000);
  }, []);

  const showBotMessage = (step: OnboardingStep) => {
    setIsTyping(true);
    
    // Simulate typing delay
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        message: step.botMessage.replace('{store_slug}', generateStoreSlug(userData.businessName))
                                .replace('{upi_id}', userData.upiId || ''),
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        options: step.options
      }]);
    }, Math.random() * 2000 + 1000); // 1-3 seconds typing
  };

  const handleUserResponse = (response: string) => {
    const step = ONBOARDING_STEPS[currentStep];
    
    // Add user message
    setMessages(prev => [...prev, {
      message: response,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);

    // Validate input if needed
    if (step.validation && !step.validation(response)) {
      setTimeout(() => {
        setMessages(prev => [...prev, {
          message: step.errorMessage || 'Please provide a valid input.',
          sender: 'bot',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      }, 500);
      return;
    }

    // Store user data
    const newUserData = { ...userData };
    switch (step.id) {
      case 'welcome':
        newUserData.businessName = response;
        break;
      case 'category':
        newUserData.category = response;
        break;
      case 'upi':
        newUserData.upiId = response;
        break;
      case 'address':
        newUserData.address = response;
        break;
      case 'phone':
        newUserData.phone = response;
        break;
    }
    setUserData(newUserData);

    // Move to next step
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        showBotMessage(ONBOARDING_STEPS[currentStep + 1]);
      }, 1000);
    } else {
      // Complete onboarding
      completeOnboarding(newUserData);
    }
  };

  const completeOnboarding = async (data: Record<string, string>) => {
    try {
      const response = await fetch('/api/auth/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: data.businessName,
          category: data.category,
          upiId: data.upiId,
          address: data.address,
          phone: data.phone
        })
      });

      if (response.ok) {
        const result = await response.json();
        // Redirect to dashboard or app download
        window.location.href = '/dashboard';
      }
    } catch (error) {
      console.error('Onboarding failed:', error);
    }
  };

  const generateStoreSlug = (businessName?: string) => {
    if (!businessName) return 'your-store';
    return businessName.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 30);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <WhatsAppContainer>
        <div className="space-y-2 pb-20">
          {messages.map((msg, index) => (
            <ChatMessage
              key={index}
              message={msg.message}
              sender={msg.sender}
              timestamp={msg.timestamp}
              showOptions={msg.options}
              onOptionClick={handleUserResponse}
            />
          ))}
          
          {isTyping && (
            <div className="flex justify-start mb-2">
              <div className="bg-white text-gray-800 rounded-lg rounded-bl-sm shadow-sm p-3 max-w-xs">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Interface */}
        {currentStep < ONBOARDING_STEPS.length - 1 && !isTyping && (
          <OnboardingInput
            step={ONBOARDING_STEPS[currentStep]}
            onSubmit={handleUserResponse}
          />
        )}
      </WhatsAppContainer>
    </div>
  );
}

// components/whatsapp/OnboardingInput.tsx
interface OnboardingInputProps {
  step: OnboardingStep;
  onSubmit: (value: string) => void;
}

function OnboardingInput({ step, onSubmit }: OnboardingInputProps) {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSubmit(inputValue.trim());
      setInputValue('');
    }
  };

  if (step.options) {
    return null; // Options are handled by ChatMessage component
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          <div className="flex-1 bg-white rounded-full px-4 py-2 flex items-center space-x-2">
            <input
              type={step.inputType === 'phone' ? 'tel' : 'text'}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={getPlaceholder(step.inputType)}
              className="flex-1 outline-none"
              autoFocus
            />
          </div>
          <button
            type="submit"
            disabled={!inputValue.trim()}
            className="bg-green-600 text-white p-2 rounded-full disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}

function getPlaceholder(inputType?: string): string {
  switch (inputType) {
    case 'phone': return 'Enter mobile number';
    case 'upi': return 'yourname@paytm';
    case 'text': default: return 'Type your answer...';
  }
}
```

---

## **🤖 Client-Side AI Processing**

### **Simple Image Processing**
```typescript
// lib/ai/imageProcessor.ts
export class SimpleImageProcessor {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d')!;
  }

  async captureScreenshot(): Promise<string> {
    try {
      // For livestream simulation, we'll use a mock approach
      // In real implementation, this would capture actual screen
      return this.generateMockScreenshot();
    } catch (error) {
      console.error('Screenshot capture failed:', error);
      throw error;
    }
  }

  cropImage(imageData: string, cropPercent: number = 0.1): Promise<string> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const cropX = img.width * cropPercent;
        const cropY = img.height * cropPercent;
        const cropWidth = img.width * (1 - 2 * cropPercent);
        const cropHeight = img.height * (1 - 2 * cropPercent);

        this.canvas.width = cropWidth;
        this.canvas.height = cropHeight;
        
        this.ctx.drawImage(
          img, 
          cropX, cropY, cropWidth, cropHeight,
          0, 0, cropWidth, cropHeight
        );
        
        resolve(this.canvas.toDataURL('image/jpeg', 0.8));
      };
      img.src = imageData;
    });
  }

  resizeImage(imageData: string, targetWidth: number, targetHeight: number): Promise<string> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        this.canvas.width = targetWidth;
        this.canvas.height = targetHeight;
        
        this.ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
        resolve(this.canvas.toDataURL('image/jpeg', 0.8));
      };
      img.src = imageData;
    });
  }

  enhanceImage(imageData: string): Promise<string> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        this.canvas.width = img.width;
        this.canvas.height = img.height;
        
        this.ctx.drawImage(img, 0, 0);
        
        // Simple brightness/contrast enhancement
        const imageDataObj = this.ctx.getImageData(0, 0, img.width, img.height);
        const data = imageDataObj.data;
        
        for (let i = 0; i < data.length; i += 4) {
          data[i] = Math.min(255, data[i] * 1.1);     // Red
          data[i + 1] = Math.min(255, data[i + 1] * 1.1); // Green
          data[i + 2] = Math.min(255, data[i + 2] * 1.1); // Blue
        }
        
        this.ctx.putImageData(imageDataObj, 0, 0);
        resolve(this.canvas.toDataURL('image/jpeg', 0.8));
      };
      img.src = imageData;
    });
  }

  generateImageHash(imageData: string): string {
    // Simple hash based on image content
    let hash = 0;
    for (let i = 0; i < imageData.length; i++) {
      const char = imageData.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }

  isDuplicate(hash: string, recentHashes: string[]): boolean {
    return recentHashes.includes(hash);
  }

  private generateMockScreenshot(): string {
    // Generate a mock product image for demo purposes
    this.canvas.width = 500;
    this.canvas.height = 500;
    
    // Create gradient background
    const gradient = this.ctx.createLinearGradient(0, 0, 500, 500);
    gradient.addColorStop(0, '#f3f4f6');
    gradient.addColorStop(1, '#e5e7eb');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, 500, 500);
    
    // Draw mock product (rectangle)
    this.ctx.fillStyle = '#3b82f6';
    this.ctx.fillRect(100, 150, 300, 200);
    
    // Add some text
    this.ctx.fillStyle = '#1f2937';
    this.ctx.font = 'bold 24px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('Sample Product', 250, 250);
    
    return this.canvas.toDataURL('image/jpeg', 0.8);
  }
}

// lib/ai/livestreamProcessor.ts
export class LivestreamProcessor {
  private processor: SimpleImageProcessor;
  private isRecording: boolean = false;
  private captureInterval: number | null = null;
  private sessionId: string;
  private productCount: number = 0;
  private recentHashes: string[] = [];

  constructor(sessionId: string) {
    this.processor = new SimpleImageProcessor();
    this.sessionId = sessionId;
  }

  async startRecording(): Promise<void> {
    if (this.isRecording) return;
    
    this.isRecording = true;
    this.captureInterval = window.setInterval(() => {
      this.captureAndProcess();
    }, 5000); // Every 5 seconds
  }

  stopRecording(): void {
    this.isRecording = false;
    if (this.captureInterval) {
      clearInterval(this.captureInterval);
      this.captureInterval = null;
    }
  }

  private async captureAndProcess(): Promise<void> {
    try {
      // Capture screenshot
      const rawImage = await this.processor.captureScreenshot();
      
      // Process image
      const croppedImage = await this.processor.cropImage(rawImage, 0.1);
      const resizedImage = await this.processor.resizeImage(croppedImage, 500, 500);
      const enhancedImage = await this.processor.enhanceImage(resizedImage);
      
      // Check for duplicates
      const imageHash = this.processor.generateImageHash(enhancedImage);
      if (this.processor.isDuplicate(imageHash, this.recentHashes)) {
        return; // Skip duplicate
      }
      
      // Update recent hashes
      this.recentHashes.push(imageHash);
      if (this.recentHashes.length > 5) {
        this.recentHashes.shift();
      }
      
      // Save product
      await this.saveProduct(enhancedImage, imageHash);
      
      // Update UI
      this.productCount++;
      this.updateWidget();
      
    } catch (error) {
      console.error('Processing failed:', error);
    }
  }

  private async saveProduct(imageData: string, hash: string): Promise<void> {
    try {
      // Convert to blob for upload
      const response = await fetch(imageData);
      const blob = await response.blob();
      
      // Upload to Supabase Storage
      const filename = `livestream-${this.sessionId}-${Date.now()}.jpg`;
      const { data: uploadData, error: uploadError } = await window.supabase.storage
        .from('livestream-captures')
        .upload(filename, blob);
      
      if (uploadError) throw uploadError;
      
      // Create product record
      const { data, error } = await window.supabase
        .from('products')
        .insert({
          seller_id: this.getCurrentUserId(),
          name: `Product ${this.productCount + 1}`,
          description: `Captured from livestream at ${new Date().toLocaleTimeString()}`,
          price: 0, // Seller sets manually
          images: [uploadData.path],
          category_id: null,
          created_from: 'livestream',
          livestream_session_id: this.sessionId,
          source_timestamp: Date.now(),
          is_active: false // Inactive until seller reviews
        });
      
      if (error) throw error;
      
    } catch (error) {
      console.error('Save product failed:', error);
      throw error;
    }
  }

  private updateWidget(): void {
    // Dispatch custom event to update UI
    window.dispatchEvent(new CustomEvent('livestream-update', {
      detail: {
        productCount: this.productCount,
        lastCapture: new Date().toLocaleTimeString()
      }
    }));
  }

  private getCurrentUserId(): string {
    // Get current user ID from auth context
    return window.supabase.auth.getUser()?.data?.user?.id || '';
  }

  getStats() {
    return {
      isRecording: this.isRecording,
      productCount: this.productCount,
      sessionId: this.sessionId
    };
  }
}
```

### **Livestream Widget Component**
```typescript
// components/livestream/LivestreamWidget.tsx
'use client';

import { useState, useEffect } from 'react';
import { LivestreamProcessor } from '@/lib/ai/livestreamProcessor';

interface LivestreamWidgetProps {
  sessionId: string;
  onClose?: () => void;
}

export function LivestreamWidget({ sessionId, onClose }: LivestreamWidgetProps) {
  const [processor, setProcessor] = useState<LivestreamProcessor | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [stats, setStats] = useState({
    productCount: 0,
    lastCapture: '',
    sessionDuration: 0
  });
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const newProcessor = new LivestreamProcessor(sessionId);
    setProcessor(newProcessor);

    // Listen for updates
    const handleUpdate = (event: CustomEvent) => {
      setStats(prev => ({
        ...prev,
        productCount: event.detail.productCount,
        lastCapture: event.detail.lastCapture
      }));
    };

    window.addEventListener('livestream-update', handleUpdate as EventListener);
    
    return () => {
      newProcessor.stopRecording();
      window.removeEventListener('livestream-update', handleUpdate as EventListener);
    };
  }, [sessionId]);

  const toggleRecording = async () => {
    if (!processor) return;

    if (isRecording) {
      processor.stopRecording();
      setIsRecording(false);
    } else {
      try {
        await processor.startRecording();
        setIsRecording(true);
      } catch (error) {
        console.error('Failed to start recording:', error);
        alert('Failed to start recording. Please check permissions.');
      }
    }
  };

  const handleManualCapture = () => {
    // Trigger manual capture
    if (processor && isRecording) {
      processor['captureAndProcess'](); // Access private method for manual trigger
    }
  };

  return (
    <div 
      className="fixed z-50 bg-white rounded-2xl shadow-xl border border-gray-200 p-4 min-w-[240px] select-none"
      style={{ 
        left: position.x, 
        top: position.y,
        backdropFilter: 'blur(10px)',
        background: 'rgba(255, 255, 255, 0.95)'
      }}
      onMouseDown={(e) => {
        setIsDragging(true);
        const startX = e.clientX - position.x;
        const startY = e.clientY - position.y;

        const handleMouseMove = (e: MouseEvent) => {
          setPosition({
            x: e.clientX - startX,
            y: e.clientY - startY
          });
        };

        const handleMouseUp = () => {
          setIsDragging(false);
          document.removeEventListener('mousemove', handleMouseMove);
          document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}`}></div>
          <span className="text-sm font-semibold text-gray-700">
            {isRecording ? 'Recording' : 'Stopped'}
          </span>
        </div>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Stats */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-600">Products</span>
          <span className="text-sm font-bold text-blue-600">{stats.productCount}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-600">Quality</span>
          <span className="text-sm font-medium text-green-600">High</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-600">Last</span>
          <span className="text-sm font-medium text-gray-700">
            {stats.lastCapture || '--:--'}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex space-x-2">
        <button
          onClick={handleManualCapture}
          disabled={!isRecording}
          className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          📷 Manual
        </button>
        <button
          onClick={toggleRecording}
          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
            isRecording
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          {isRecording ? '⏹️ Stop' : '▶️ Start'}
        </button>
      </div>

      {/* Progress indicator */}
      {isRecording && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <span className="text-xs text-blue-600 ml-2">Processing...</span>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## **💬 Chat System Implementation**

### **Chat Interface Components**
```typescript
// components/chat/ChatInterface.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  message_type: 'text' | 'image' | 'product' | 'order' | 'system';
  metadata?: any;
  created_at: string;
  is_read: boolean;
}

interface ChatInterfaceProps {
  chatId: string;
  currentUserId: string;
  userRole: 'seller' | 'buyer';
}

export function ChatInterface({ chatId, currentUserId, userRole }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    fetchMessages();
    subscribeToMessages();
    subscribeToTyping();
  }, [chatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });

    if (data) {
      setMessages(data);
    }
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel(`chat-${chatId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `chat_id=eq.${chatId}`
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const subscribeToTyping = () => {
    const channel = supabase
      .channel(`typing-${chatId}`)
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        if (payload.user_id !== currentUserId) {
          setOtherUserTyping(payload.typing);
          if (payload.typing) {
            setTimeout(() => setOtherUserTyping(false), 3000);
          }
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const messageContent = newMessage.trim();
    setNewMessage('');

    // Check if this is a sell command
    if (userRole === 'seller' && isSellCommand(messageContent)) {
      await handleSellCommand(messageContent);
      return;
    }

    // Send regular message
    const { error } = await supabase
      .from('chat_messages')
      .insert({
        chat_id: chatId,
        sender_id: currentUserId,
        content: messageContent,
        message_type: 'text'
      });

    if (error) {
      console.error('Failed to send message:', error);
    }
  };

  const isSellCommand = (message: string): boolean => {
    return /^sell\s+\d+/i.test(message);
  };

  const handleSellCommand = async (command: string) => {
    const result = parseSellCommand(command);
    
    if (result) {
      // Create checkout
      const checkoutData = await createCheckout(result);
      
      // Send system message with checkout
      await supabase
        .from('chat_messages')
        .insert({
          chat_id: chatId,
          sender_id: currentUserId,
          content: `Checkout created for ₹${result.amount}`,
          message_type: 'order',
          metadata: {
            checkout_id: checkoutData.id,
            amount: result.amount,
            variants: result.variants
          }
        });
    }
  };

  const parseSellCommand = (command: string) => {
    const match = command.match(/^sell\s+(\d+)(?:\s+(.+))?$/i);
    if (!match) return null;

    const amount = parseInt(match[1]);
    const variants = match[2] ? parseVariants(match[2]) : {};

    return { amount, variants };
  };

  const parseVariants = (variantString: string) => {
    const variants: Record<string, string> = {};
    const tokens = variantString.split(/\s+/);
    
    // Simple parsing - can be enhanced
    tokens.forEach(token => {
      if (['red', 'blue', 'green', 'black', 'white'].includes(token.toLowerCase())) {
        variants.color = token;
      } else if (['xs', 's', 'm', 'l', 'xl', 'xxl'].includes(token.toLowerCase())) {
        variants.size = token.toUpperCase();
      }
    });

    return variants;
  };

  const createCheckout = async (orderData: { amount: number; variants: Record<string, string> }) => {
    const { data, error } = await supabase
      .from('orders')
      .insert({
        buyer_id: userRole === 'buyer' ? currentUserId : 'temp-buyer',
        seller_id: userRole === 'seller' ? currentUserId : 'temp-seller',
        product_id: 'temp-product', // Get from chat context
        total_amount: orderData.amount,
        platform_fee: orderData.amount * 0.03,
        order_status: 'pending',
        payment_status: 'pending',
        chat_context: { variants: orderData.variants }
      })
      .select()
      .single();

    return data;
  };

  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      supabase.channel(`typing-${chatId}`).send({
        type: 'broadcast',
        event: 'typing',
        payload: {const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      supabase.channel(`typing-${chatId}`).send({
        type: 'broadcast',
        event: 'typing',
        payload: {
          user_id: currentUserId,
          typing: true
        }
      });

      setTimeout(() => {
        setIsTyping(false);
        supabase.channel(`typing-${chatId}`).send({
          type: 'broadcast',
          event: 'typing',
          payload: {
            user_id: currentUserId,
            typing: false
          }
        });
      }, 1000);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Chat Header */}
      <div className="border-b border-gray-200 p-4 flex items-center space-x-3">
        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
          {userRole === 'seller' ? 'B' : 'S'}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">
            {userRole === 'seller' ? 'Customer' : 'Seller'}
          </h3>
          <p className="text-sm text-gray-500">
            {otherUserTyping ? 'typing...' : 'Online'}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            isOwn={message.sender_id === currentUserId}
            userRole={userRole}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              handleTyping();
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                sendMessage();
              }
            }}
            placeholder={userRole === 'seller' ? 'Type message or "sell 599"...' : 'Type your message...'}
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim()}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
        {userRole === 'seller' && (
          <div className="mt-2 text-xs text-gray-500">
            💡 Tip: Type "sell 599" to create instant checkout for ₹599
          </div>
        )}
      </div>
    </div>
  );
}

// components/chat/MessageBubble.tsx
interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  userRole: 'seller' | 'buyer';
}

function MessageBubble({ message, isOwn, userRole }: MessageBubbleProps) {
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (message.message_type === 'order') {
    return (
      <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
        <div className="max-w-xs bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="text-sm font-semibold text-green-800 mb-2">
            🛒 Checkout Created
          </div>
          <div className="text-lg font-bold text-green-700 mb-1">
            ₹{message.metadata?.amount}
          </div>
          {message.metadata?.variants && (
            <div className="text-xs text-green-600 mb-2">
              {Object.entries(message.metadata.variants).map(([key, value]) => (
                <span key={key} className="mr-2">
                  {key}: {value}
                </span>
              ))}
            </div>
          )}
          <button className="w-full bg-green-600 text-white py-2 px-4 rounded text-sm font-semibold hover:bg-green-700">
            💳 Pay Now
          </button>
          <div className="text-xs text-gray-500 mt-2 text-center">
            {formatTime(message.created_at)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-xs rounded-lg p-3 ${
        isOwn
          ? 'bg-blue-500 text-white'
          : 'bg-gray-100 text-gray-900'
      }`}>
        <p className="text-sm">{message.content}</p>
        <div className={`text-xs mt-1 ${
          isOwn ? 'text-blue-100' : 'text-gray-500'
        }`}>
          {formatTime(message.created_at)}
          {isOwn && (
            <span className="ml-1">
              {message.is_read ? '✓✓' : '✓'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

---

## **🛒 Order Management System**

### **Order Processing Flow**
```typescript
// lib/orders/orderProcessor.ts
export class OrderProcessor {
  private supabase = createClient();

  async createOrder(orderData: {
    buyerId: string;
    sellerId: string;
    productId: string;
    quantity: number;
    unitPrice: number;
    shippingAddress: any;
    paymentMethod: string;
    chatContext?: any;
  }) {
    const orderNumber = this.generateOrderNumber();
    const platformFee = orderData.unitPrice * orderData.quantity * 0.03;
    const shippingCost = await this.calculateShipping(orderData);
    const totalAmount = (orderData.unitPrice * orderData.quantity) + shippingCost;

    const { data, error } = await this.supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        buyer_id: orderData.buyerId,
        seller_id: orderData.sellerId,
        product_id: orderData.productId,
        quantity: orderData.quantity,
        unit_price: orderData.unitPrice,
        shipping_cost: shippingCost,
        platform_fee: platformFee,
        total_amount: totalAmount,
        payment_method: orderData.paymentMethod,
        shipping_address: orderData.shippingAddress,
        order_status: 'pending',
        payment_status: 'pending',
        chat_context: orderData.chatContext || {},
        created_via: 'chat'
      })
      .select()
      .single();

    if (error) throw error;

    // Trigger payment processing
    await this.initiatePayment(data.id, totalAmount);

    return data;
  }

  private generateOrderNumber(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 5);
    return `SA${timestamp}${random}`.toUpperCase();
  }

  private async calculateShipping(orderData: any): Promise<number> {
    // Simulate shipping cost calculation
    const baseRate = 50;
    const weightMultiplier = Math.ceil(orderData.quantity / 2);
    return baseRate * weightMultiplier;
  }

  private async initiatePayment(orderId: string, amount: number) {
    // Simulate payment initiation
    // In real implementation, this would integrate with payment gateway
    return {
      orderId,
      amount,
      paymentUrl: `/checkout/${orderId}`,
      status: 'initiated'
    };
  }

  async processPayment(orderId: string, paymentData: {
    transactionId: string;
    status: 'success' | 'failed';
    method: string;
  }) {
    const { error } = await this.supabase
      .from('orders')
      .update({
        payment_status: paymentData.status === 'success' ? 'completed' : 'failed',
        payment_transaction_id: paymentData.transactionId,
        order_status: paymentData.status === 'success' ? 'confirmed' : 'pending'
      })
      .eq('id', orderId);

    if (error) throw error;

    if (paymentData.status === 'success') {
      await this.processPostPayment(orderId);
    }
  }

  private async processPostPayment(orderId: string) {
    // 1. Generate shipping label
    await this.generateShippingLabel(orderId);
    
    // 2. Update inventory
    await this.updateInventory(orderId);
    
    // 3. Send notifications
    await this.sendOrderNotifications(orderId);
  }

  private async generateShippingLabel(orderId: string) {
    // Simulate shipping label generation
    const trackingNumber = `SA${Date.now().toString(36).toUpperCase()}`;
    const courierPartner = this.selectBestCourier();

    await this.supabase
      .from('orders')
      .update({
        tracking_number: trackingNumber,
        courier_partner: courierPartner,
        order_status: 'processing'
      })
      .eq('id', orderId);

    return { trackingNumber, courierPartner };
  }

  private selectBestCourier(): string {
    const couriers = ['Delhivery', 'BlueDart', 'DTDC', 'Xpressbees'];
    return couriers[Math.floor(Math.random() * couriers.length)];
  }

  private async updateInventory(orderId: string) {
    // Get order details and update product inventory
    const { data: order } = await this.supabase
      .from('orders')
      .select('product_id, quantity')
      .eq('id', orderId)
      .single();

    if (order) {
      await this.supabase.rpc('update_product_inventory', {
        product_id: order.product_id,
        quantity_sold: order.quantity
      });
    }
  }

  private async sendOrderNotifications(orderId: string) {
    // Send notifications to buyer and seller
    const { data: order } = await this.supabase
      .from('orders')
      .select(`
        *,
        buyer:buyers(name, phone),
        seller:sellers(business_name, phone),
        product:products(name)
      `)
      .eq('id', orderId)
      .single();

    if (order) {
      // Buyer notification
      await this.supabase
        .from('notifications')
        .insert({
          user_id: order.buyer_id,
          type: 'order',
          title: 'Order Confirmed',
          message: `Your order ${order.order_number} has been confirmed`,
          data: { order_id: orderId }
        });

      // Seller notification
      await this.supabase
        .from('notifications')
        .insert({
          user_id: order.seller_id,
          type: 'order',
          title: 'New Order',
          message: `You have a new order ${order.order_number}`,
          data: { order_id: orderId }
        });
    }
  }
}
```

### **Order Dashboard Component**
```typescript
// app/(dashboard)/dashboard/orders/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Order {
  id: string;
  order_number: string;
  total_amount: number;
  order_status: string;
  payment_status: string;
  created_at: string;
  buyer: { name: string; phone: string };
  product: { name: string };
  tracking_number?: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  const fetchOrders = async () => {
    setLoading(true);
    
    let query = supabase
      .from('orders')
      .select(`
        *,
        buyer:buyers(name, phone),
        product:products(name)
      `)
      .order('created_at', { ascending: false });

    if (filter !== 'all') {
      query = query.eq('order_status', filter);
    }

    const { data, error } = await query;
    
    if (data) {
      setOrders(data);
    }
    setLoading(false);
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ order_status: newStatus })
      .eq('id', orderId);

    if (!error) {
      fetchOrders();
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-purple-100 text-purple-800',
      shipped: 'bg-green-100 text-green-800',
      delivered: 'bg-green-200 text-green-900',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <div className="flex space-x-2">
          {['all', 'pending', 'confirmed', 'shipped', 'delivered'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filter === status
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading orders...</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {order.order_number}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(order.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {order.buyer.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.buyer.phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {order.product.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      ₹{order.total_amount.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.order_status)}`}>
                      {order.order_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-2">
                      {order.order_status === 'confirmed' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'processing')}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Process
                        </button>
                      )}
                      {order.order_status === 'processing' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'shipped')}
                          className="text-green-600 hover:text-green-900"
                        >
                          Ship
                        </button>
                      )}
                      <button className="text-gray-600 hover:text-gray-900">
                        View
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
```

---

## **📊 Analytics Dashboard**

### **Analytics Data Processing**
```typescript
// lib/analytics/analyticsProcessor.ts
export class AnalyticsProcessor {
  private supabase = createClient();

  async getDashboardMetrics(sellerId: string, dateRange: { from: Date; to: Date }) {
    const metrics = await Promise.all([
      this.getRevenueMetrics(sellerId, dateRange),
      this.getOrderMetrics(sellerId, dateRange),
      this.getProductMetrics(sellerId, dateRange),
      this.getCustomerMetrics(sellerId, dateRange),
      this.getLivestreamMetrics(sellerId, dateRange)
    ]);

    return {
      revenue: metrics[0],
      orders: metrics[1],
      products: metrics[2],
      customers: metrics[3],
      livestream: metrics[4]
    };
  }

  private async getRevenueMetrics(sellerId: string, dateRange: { from: Date; to: Date }) {
    const { data } = await this.supabase
      .from('orders')
      .select('total_amount, created_at, order_status')
      .eq('seller_id', sellerId)
      .eq('payment_status', 'completed')
      .gte('created_at', dateRange.from.toISOString())
      .lte('created_at', dateRange.to.toISOString());

    const totalRevenue = data?.reduce((sum, order) => sum + order.total_amount, 0) || 0;
    const todayRevenue = data?.filter(order => 
      new Date(order.created_at).toDateString() === new Date().toDateString()
    ).reduce((sum, order) => sum + order.total_amount, 0) || 0;

    // Calculate growth
    const yesterdayRevenue = await this.getYesterdayRevenue(sellerId);
    const growthPercentage = yesterdayRevenue > 0 
      ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100 
      : 0;

    return {
      total: totalRevenue,
      today: todayRevenue,
      growth: growthPercentage,
      dailyData: this.groupByDate(data || [], 'total_amount')
    };
  }

  private async getOrderMetrics(sellerId: string, dateRange: { from: Date; to: Date }) {
    const { data } = await this.supabase
      .from('orders')
      .select('id, created_at, order_status')
      .eq('seller_id', sellerId)
      .gte('created_at', dateRange.from.toISOString())
      .lte('created_at', dateRange.to.toISOString());

    const totalOrders = data?.length || 0;
    const pendingOrders = data?.filter(order => order.order_status === 'pending').length || 0;
    const shippedOrders = data?.filter(order => order.order_status === 'shipped').length || 0;
    const deliveredOrders = data?.filter(order => order.order_status === 'delivered').length || 0;

    return {
      total: totalOrders,
      pending: pendingOrders,
      shipped: shippedOrders,
      delivered: deliveredOrders,
      conversionRate: this.calculateConversionRate(sellerId, dateRange)
    };
  }

  private async getProductMetrics(sellerId: string, dateRange: { from: Date; to: Date }) {
    const { data: products } = await this.supabase
      .from('products')
      .select(`
        id, name, view_count, stock_quantity,
        orders:orders(quantity)
      `)
      .eq('seller_id', sellerId);

    const totalProducts = products?.length || 0;
    const lowStockProducts = products?.filter(p => p.stock_quantity < 5).length || 0;
    
    // Calculate best selling products
    const productSales = products?.map(product => ({
      ...product,
      totalSold: product.orders.reduce((sum: number, order: any) => sum + order.quantity, 0)
    })).sort((a, b) => b.totalSold - a.totalSold) || [];

    return {
      total: totalProducts,
      lowStock: lowStockProducts,
      bestSelling: productSales.slice(0, 5),
      outOfStock: products?.filter(p => p.stock_quantity === 0).length || 0
    };
  }

  private async getCustomerMetrics(sellerId: string, dateRange: { from: Date; to: Date }) {
    const { data } = await this.supabase
      .from('orders')
      .select('buyer_id, created_at')
      .eq('seller_id', sellerId)
      .eq('payment_status', 'completed')
      .gte('created_at', dateRange.from.toISOString())
      .lte('created_at', dateRange.to.toISOString());

    const uniqueCustomers = new Set(data?.map(order => order.buyer_id)).size;
    const repeatCustomers = this.calculateRepeatCustomers(data || []);

    return {
      total: uniqueCustomers,
      repeat: repeatCustomers,
      repeatRate: uniqueCustomers > 0 ? (repeatCustomers / uniqueCustomers) * 100 : 0
    };
  }

  private async getLivestreamMetrics(sellerId: string, dateRange: { from: Date; to: Date }) {
    const { data: sessions } = await this.supabase
      .from('livestream_sessions')
      .select(`
        id, total_products_captured, total_orders, total_revenue,
        conversion_rate, viewer_count, peak_viewers
      `)
      .eq('seller_id', sellerId)
      .gte('start_time', dateRange.from.toISOString())
      .lte('start_time', dateRange.to.toISOString());

    const totalSessions = sessions?.length || 0;
    const totalProductsCaptured = sessions?.reduce((sum, session) => sum + session.total_products_captured, 0) || 0;
    const avgConversionRate = sessions?.length > 0 
      ? sessions.reduce((sum, session) => sum + session.conversion_rate, 0) / sessions.length 
      : 0;

    return {
      totalSessions,
      totalProductsCaptured,
      avgConversionRate,
      totalViewers: sessions?.reduce((sum, session) => sum + session.viewer_count, 0) || 0
    };
  }

  private async getYesterdayRevenue(sellerId: string): Promise<number> {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const startOfDay = new Date(yesterday.setHours(0, 0, 0, 0));
    const endOfDay = new Date(yesterday.setHours(23, 59, 59, 999));

    const { data } = await this.supabase
      .from('orders')
      .select('total_amount')
      .eq('seller_id', sellerId)
      .eq('payment_status', 'completed')
      .gte('created_at', startOfDay.toISOString())
      .lte('created_at', endOfDay.toISOString());

    return data?.reduce((sum, order) => sum + order.total_amount, 0) || 0;
  }

  private groupByDate(data: any[], valueField: string) {
    const grouped = data.reduce((acc, item) => {
      const date = new Date(item.created_at).toDateString();
      if (!acc[date]) acc[date] = 0;
      acc[date] += item[valueField];
      return acc;
    }, {});

    return Object.entries(grouped).map(([date, value]) => ({
      date: new Date(date),
      value: value as number
    }));
  }

  private calculateRepeatCustomers(orders: any[]): number {
    const customerOrderCounts = orders.reduce((acc, order) => {
      acc[order.buyer_id] = (acc[order.buyer_id] || 0) + 1;
      return acc;
    }, {});

    return Object.values(customerOrderCounts).filter((count: any) => count > 1).length;
  }

  private async calculateConversionRate(sellerId: string, dateRange: { from: Date; to: Date }): Promise<number> {
    // Simple conversion rate calculation
    // In a real implementation, this would track visits vs purchases
    return Math.random() * 5 + 1; // Mock 1-6% conversion rate
  }
}
```

### **Analytics Dashboard Component**
```typescript
// app/(dashboard)/dashboard/analytics/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { AnalyticsProcessor } from '@/lib/analytics/analyticsProcessor';

export default function AnalyticsPage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    to: new Date()
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, [dateRange]);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const processor = new AnalyticsProcessor();
      const sellerId = 'current-seller-id'; // Get from auth context
      const data = await processor.getDashboardMetrics(sellerId, dateRange);
      setMetrics(data);
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    }
    setLoading(false);
  };

  if (loading) {
    return <div className="p-6">Loading analytics...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <div className="flex space-x-2">
          <button className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm">
            Last 30 Days
          </button>
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm">
            Export Report
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Today's Revenue"
          value={`₹${metrics.revenue.today.toLocaleString()}`}
          change={metrics.revenue.growth}
          icon="💰"
        />
        <MetricCard
          title="Total Orders"
          value={metrics.orders.total.toString()}
          change={5.2}
          icon="📦"
        />
        <MetricCard
          title="Conversion Rate"
          value={`${metrics.orders.conversionRate.toFixed(1)}%`}
          change={0.3}
          icon="📈"
        />
        <MetricCard
          title="Active Products"
          value={metrics.products.total.toString()}
          change={2}
          icon="🛍️"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Revenue Trend</h3>
          <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
            <span className="text-gray-500">Revenue Chart Placeholder</span>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Order Status</h3>
          <div className="space-y-3">
            <OrderStatusItem
              status="Pending"
              count={metrics.orders.pending}
              color="bg-yellow-500"
            />
            <OrderStatusItem
              status="Shipped"
              count={metrics.orders.shipped}
              color="bg-blue-500"
            />
            <OrderStatusItem
              status="Delivered"
              count={metrics.orders.delivered}
              color="bg-green-500"
            />
          </div>
        </div>
      </div>

      {/* Best Selling Products */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Best Selling Products</h3>
        <div className="space-y-3">
          {metrics.products.bestSelling.map((product: any, index: number) => (
            <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <div className="flex items-center space-x-3">
                <span className="w-6 h-6 bg-blue-500 text-white text-sm rounded-full flex items-center justify-center">
                  {index + 1}
                </span>
                <span className="font-medium">{product.name}</span>
              </div>
              <span className="text-gray-600">{product.totalSold} sold</span>
            </div>
          ))}
        </div>
      </div>

      {/* Livestream Analytics */}
      {metrics.livestream.totalSessions > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Livestream Performance</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {metrics.livestream.totalSessions}
              </div>
              <div className="text-sm text-gray-600">Total Sessions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {metrics.livestream.totalProductsCaptured}
              </div>
              <div className="text-sm text-gray-600">Products Captured</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {metrics.livestream.avgConversionRate.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Avg Conversion</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string;
  change: number;
  icon: string;
}

function MetricCard({ title, value, change, icon }: MetricCardProps) {
  const isPositive = change >= 0;
  
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <div className={`flex items-center text-sm ${
            isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            <span>{isPositive ? '↗' : '↘'}</span>
            <span className="ml-1">{Math.abs(change).toFixed(1)}%</span>
          </div>
        </div>
        <div className="text-3xl">{icon}</div>
      </div>
    </div>
  );
}

interface OrderStatusItemProps {
  status: string;
  count: number;
  color: string;
}

function OrderStatusItem({ status, count, color }: OrderStatusItemProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className={`w-3 h-3 rounded-full ${color}`}></div>
        <span className="text-gray-700">{status}</span>
      </div>
      <span className="font-semibold text-gray-900">{count}</span>
    </div>
  );
}
```

---

## **🔌 API Integration Simulations**

### **Payment Gateway Simulation**
```typescript
// lib/simulations/paymentGateway.ts
export class PaymentGatewaySimulator {
  static async processPayment(paymentData: {
    amount: number;
    method: string;
    orderId: string;
    customerDetails: any;
  }) {
    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simulate 95% success rate
    const isSuccess = Math.random() > 0.05;

    if (isSuccess) {
      return {
        status: 'success',
        transactionId: `TXN_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        amount: paymentData.amount,
        method: paymentData.method,
        timestamp: new Date().toISOString()
      };
    } else {
      return {
        status: 'failed',
        error: 'Payment failed due to insufficient funds',
        timestamp: new Date().toISOString()
      };
    }
  }

  static async createVirtualAccount(sellerData: {
    businessName: string;
    upiId: string;
    phone: string;
  }) {
    const accountNumber = Math.floor(1000000000 + Math.random() * 9000000000).toString();
    const virtualUpiId = `${sellerData.businessName.toLowerCase().replace(/\s+/g, '-')}-${Math.random().toString(36).substring(7)}@shopabell`;

    return {
      accountNumber,
      ifscCode: 'FAKE0SHOPABELL',
      virtualUpiId,
      qrCode: `upi://pay?pa=${virtualUpiId}&pn=${sellerData.businessName}`,
      status: 'active'
    };
  }

  static async verifyPayment(transactionId: string) {
    // Simulate verification delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
      transactionId,
      status: 'verified',
      amount: Math.floor(Math.random() * 5000) + 100,
      timestamp: new Date().toISOString()
    };
  }
}

// lib/simulations/shippingProvider.ts
export class ShippingProviderSimulator {
  private static couriers = [
    { name: 'Delhivery', baseRate: 45, multiplier: 1.0, reliability: 0.95 },
    { name: 'BlueDart', baseRate: 65, multiplier: 1.2, reliability: 0.98 },
    { name: 'DTDC', baseRate: 50, multiplier: 1.1, reliability: 0.90 },
    { name: 'Xpressbees', baseRate: 42, multiplier: 0.95, reliability: 0.88 }
  ];

  static async getShippingRates(shipmentData: {
    fromPincode: string;
    toPincode: string;
    weight: number;
    codRequired: boolean;
  }) {
    const rates = this.couriers.map(courier => {
      const baseRate = courier.baseRate;
      const weightMultiplier = Math.ceil(shipmentData.weight / 500);
      const codCharges = shipmentData.codRequired ? 40 : 0;
      const distanceMultiplier = this.calculateDistanceMultiplier(
        shipmentData.fromPincode, 
        shipmentData.toPincode
      );

      const totalRate = (baseRate * weightMultiplier * distanceMultiplier) + codCharges;

      return {
        courierName: courier.name,
        rate: Math.round(totalRate),
        estimatedDays: Math.ceil(Math.random() * 5) + 1,
        reliability: courier.reliability,
        codAvailable: true
      };
    });

    return rates.sort((a, b) => a.rate - b.rate);
  }

  static async generateAWB(shipmentData: {
    courierName: string;
    orderDetails: any;
  }) {
    const awbNumber = `${shipmentData.courierName.substring(0, 3).toUpperCase()}${Date.now().toString().slice(-8)}`;
    
    return {
      awbNumber,
      courierName: shipmentData.courierName,
      expectedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      trackingUrl: `https://track.shopabell.com/${awbNumber}`,
      labelUrl: `/api/shipping/label/${awbNumber}`
    };
  }

  static async trackShipment(awbNumber: string) {
    const statuses = [
      'Order created',
      'Pickup scheduled',
      'Picked up',
      'In transit',
      'Out for delivery',
      'Delivered'
    ];

    const currentStatus = Math.floor(Math.random() * statuses.length);
    
    return {
      awbNumber,
      currentStatus: statuses[currentStatus],
      statusHistory: statuses.slice(0, currentStatus + 1).map((status, index) => ({
        status,
        timestamp: new Date(Date.now() - (statuses.length - index) * 24 * 60 * 60 * 1000),
        location: this.getRandomLocation()
      })),
      estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
    };
  }

  private static calculateDistanceMultiplier(fromPin: string, toPin: string): number {
    // Simple distance calculation based on pin code difference
    const diff = Math.abs(parseInt(fromPin.substring(0, 3)) - parseInt(toPin.substring(0, 3)));
    return 1 + (diff / 1000);
  }

  private static getRandomLocation(): string {
    const locations = [
      'Mumbai Hub', 'Delhi Hub', 'Bangalore Hub', 'Chennai Hub',
      'Local Facility', 'Distribution Center', 'Last Mile Hub'
    ];
    return locations[Math.floor(Math.random() * locations.length)];
  }
}

// lib/simulations/notificationService.ts
export class NotificationServiceSimulator {
  static async sendSMS(to: string, message: string) {
    console.log(`SMS to ${to}: ${message}`);
    
    // Simulate SMS sending delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      status: 'sent',
      messageId: `SMS_${Date.now()}`,
      timestamp: new Date().toISOString()
    };
  }

  static async sendWhatsApp(to: string, message: string, template?: string) {
    console.log(`WhatsApp to ${to}: ${message}`);
    
    // Simulate WhatsApp sending delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return {
      status: 'sent',
      messageId: `WA_${Date.now()}`,
      timestamp: new Date().toISOString()
    };
  }

  static async sendEmail(to: string, subject: string, body: string) {
    console.log(`Email to ${to}: ${subject}`);
    
    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      status: 'sent',
      messageId: `EMAIL_${Date.now()}`,
      timestamp: new Date().toISOString()
    };
  }

  static async sendPushNotification(userId: string, title: string, body: string) {
    console.log(`Push to ${userId}: ${title} - ${body}`);
    
    return {
      status: 'sent',
      notificationId: `PUSH_${Date.now()}`,
      timestamp: new Date().toISOString()
    };
  }
}
```

---

## **🧪 Comprehensive Testing Implementation**

### **E2E Testing Setup**
```typescript
// cypress/e2e/complete-seller-journey.cy.ts
describe('Complete Seller Journey', () => {
  it('should onboard seller and process first sale', () => {
    // WhatsApp Onboarding
    cy.visit('/onboard');
    cy.get('[data-testid="business-name-input"]').type('Test Fashion Store');
    cy.get('[data-testid="category-fashion"]').click();
    cy.get('[data-testid="upi-input"]').type('test@paytm');
    cy.get('[data-testid="address-input"]').type('123 Test Street, Bangalore');
    cy.get('[data-testid="phone-input"]').type('9876543210');
    cy.get('[data-testid="complete-onboarding"]').click();

    // Verify dashboard access
    cy.url().should('include', '/dashboard');
    cy.get('[data-testid="welcome-message"]').should('contain', 'Test Fashion Store');

    // Add first product
    cy.get('[data-testid="add-product"]').click();
    cy.get('[data-testid="product-name"]').type('Blue Shirt');
    cy.get('[data-testid="product-price"]').type('599');
    cy.get('[data-testid="product-description"]').type('Beautiful blue shirt');
    cy.get('[data-testid="image-upload"]').selectFile('cypress/fixtures/blue-shirt.jpg');
    cy.get('[data-testid="save-product"]').click();

    // Verify product created
    cy.get('[data-testid="product-card"]').should('be.visible');

    // Simulate buyer interaction
    cy.visit('/store/test-fashion-store');
    cy.get('[data-testid="product-card"]').click();
    cy.get('[data-testid="chat-seller"]').click();

    // Chat conversation
    cy.get('[data-testid="message-input"]').type('Is this available?');
    cy.get('[data-testid="send-message"]').click();

    // Switch to seller view
    cy.visit('/dashboard/chats');
    cy.get('[data-testid="chat-conversation"]').click();
    cy.get('[data-testid="message-input"]').type('sell 599');
    cy.get('[data-testid="send-message"]').click();

    // Verify checkout created
    cy.get('[data-testid="checkout-created"]').should('be.visible');

    // Complete purchase as buyer
    cy.visit('/checkout/test-order-id');
    cy.get('[data-testid="buyer-name"]').type('Test Buyer');
    cy.get('[data-testid="buyer-phone"]').type('8765432109');
    cy.get('[data-testid="shipping-address"]').type('456 Buyer Street, Delhi');
    cy.get('[data-testid="place-order"]').click();

    // Verify order success
    cy.get('[data-testid="order-success"]').should('be.visible');

    // Check seller dashboard
    cy.visit('/dashboard');
    cy.get('[data-testid="new-orders"]').should('contain', '1');
    cy.get('[data-testid="today-revenue"]').should('contain', '₹599');
  });
});

// cypress/e2e/livestream-workflow.cy.ts
describe('Livestream Workflow', () => {
  beforeEach(() => {
    cy.loginAsSeller('test@example.com');
  });

  it('should capture products during livestream and convert to sales', () => {
    // Start livestream session
    cy.visit('/dashboard/livestream');
    cy.get('[data-testid="start-livestream"]').click();
    cy.get('[data-testid="session-name"]').type('Evening Fashion Show');
    cy.get('[data-testid="begin-recording"]').click();

    // Verify widget appears
    cy.get('[data-testid="livestream-widget"]').should('be.visible');
    cy.get('[data-testid="recording-status"]').should('contain', 'Recording');

    // Simulate product captures
    cy.tick(5000); // Mock 5 seconds
    cy.get('[data-testid="products-captured"]').should('contain', '1');

    cy.tick(5000);
    cy.get('[data-testid="products-captured"]').should('contain', '2');

    // Stop recording
    cy.get('[data-testid="stop-recording"]').click();

    // Review captured products
    cy.visit('/dashboard/livestream/sessions/current');
    cy.get('[data-testid="captured-product"]').should('have.length.at.least', 2);

    // Activate products
    cy.get('[data-testid="product-1"]').click();
    cy.get('[data-testid="edit-product"]').click();
    cy.get('[data-testid="product-name"]').clear().type('Red Dress');
    cy.get('[data-testid="product-price"]').type('1299');
    cy.get('[data-testid="activate-product"]').click();

    // Verify product is live
    cy.visit('/store/test-seller');
    cy.get('[data-testid="product-red-dress"]').should('be.visible');
  });
});
```

### **Component Testing**
```typescript
// cypress/component/WhatsAppOnboarding.cy.tsx
import { WhatsAppOnboarding } from '../../components/whatsapp/WhatsAppOnboarding';

describe('WhatsApp Onboarding Component', () => {
  it('should complete onboarding flow', () => {
    cy.mount(<WhatsAppOnboarding />);

    // Initial message
    cy.get('[data-testid="bot-message"]').should('contain', 'Welcome to ShopAbell');

    // Business name input
    cy.get('[data-testid="text-input"]').type('Test Store');
    cy.get('[data-testid="send-button"]').click();

    // Category selection
    cy.get('[data-testid="option-1"]').click();

    // UPI input
    cy.get('[data-testid="text-input"]').type('test@paytm');
    cy.get('[data-testid="send-button"]').click();

    // Verify completion
    cy.get('[data-testid="onboarding-complete"]').should('be.visible');
  });

  it('should validate UPI format', () => {
    cy.mount(<WhatsAppOnboarding />);
    
    // Navigate to UPI step
    cy.get('[data-testid="text-input"]').type('Test Store');
    cy.get('[data-testid="send-button"]').click();
    cy.get('[data-testid="option-1"]').click();

    // Invalid UPI
    cy.get('[data-testid="text-input"]').type('invalid-upi');
    cy.get('[data-testid="send-button"]').click();

    // Should show error
    cy.get('[data-testid="error-message"]').should('contain', 'valid UPI ID');
  });
});

// cypress/component/ChatInterface.cy.tsx
import { ChatInterface } from '../../components/chat/ChatInterface';

describe('Chat Interface Component', () => {
  it('should handle sell command correctly', () => {
    cy.mount(
      <ChatInterface 
        chatId="test-chat" 
        currentUserId="seller-1" 
        userRole="seller" 
      />
    );

    // Send sell command
    cy.get('[data-testid="message-input"]').type('sell 599');
    cy.get('[data-testid="send-button"]').click();

    // Verify checkout created
    cy.get('[data-testid="checkout-message"]').should('be.visible');
    cy.get('[data-testid="checkout-amount"]').should('contain', '₹599');
  });

  it('should parse complex sell commands', () => {
    cy.mount(
      <ChatInterface 
        chatId="test-chat" 
        currentUserId="seller-1" 
        userRole="seller" 
      />
    );

    // Complex sell command
    cy.get('[data-testid="message-input"]').type('sell 799 red L');
    cy.get('[data-testid="send-button"]').click();

    // Verify variants parsed
    cy.get('[data-testid="checkout-variants"]').should('contain', 'red');
    cy.get('[data-testid="checkout-variants"]').should('contain', 'L');
  });
});
```

### **API Testing**
```typescript
// cypress/e2e/api/orders.cy.ts
describe('Orders API', () => {
  it('should create order successfully', () => {
    cy.request('POST', '/api/orders/create', {
      buyerId: 'buyer-1',
      sellerId: 'seller-1',
      productId: 'product-1',
      quantity: 1,
      unitPrice: 599,
      shippingAddress: {
        name: 'Test User',
        address: '123 Test St',
        city: 'Bangalore',
        pincode: '560001'
      },
      paymentMethod: 'UPI'
    }).then((response) => {
      expect(response.status).to.eq(201);
      expect(response.body.data.order_number).to.exist;
      expect(response.body.data.total_amount).to.eq(599);
    });
  });

  it('should handle payment processing', () => {
    // Create order first
    cy.request('POST', '/api/orders/create', {
      buyerId: 'buyer-1',
      sellerId: 'seller-1',
      productId: 'product-1',
      quantity: 1,
      unitPrice: 599
    }).then((orderResponse) => {
      const orderId = orderResponse.body.data.id;

      // Process payment
      cy.request('POST', `/api/orders/${orderId}/payment`, {
        transactionId: 'txn_test_123',
        status: 'success',
        method: 'UPI'
      }).then((paymentResponse) => {
        expect(paymentResponse.status).to.eq(200);
        expect(paymentResponse.body.data.payment_status).to.eq('completed');
      });
    });
  });
});

// cypress/e2e/api/products.cy.ts
describe('Products API', () => {
  it('should create product successfully', () => {
    cy.request('POST', '/api/products/create', {
      name: 'Test Product',
      price: 999,
      description: 'Test description',
      category: 'fashion',
      images: ['test-image.jpg'],
      stock_quantity: 10
    }).then((response) => {
      expect(response.status).to.eq(201);
      expect(response.body.data.name).to.eq('Test Product');
      expect(response.body.data.price).to.eq(999);
    });
  });

  it('should validate required fields', () => {
    cy.request({
      method: 'POST',
      url: '/api/products/create',
      body: {
        name: '',
        price: -100
      },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(400);
      expect(response.body.errors).to.include('Name is required');
      expect(response.body.errors).to.include('Price must be positive');
    });
  });
});
```

---

## **🚀 Deployment Configuration**

### **Vercel Configuration**
```json
// vercel.json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase-url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase-anon-key",
    "SUPABASE_SERVICE_ROLE_KEY": "@supabase-service-key"
  },
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/$1"
    }
  ]
}
```

### **Environment Variables**
```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-key

# App Configuration
NEXT_PUBLIC_APP_URL=https://shopabell.vercel.app
NEXT_PUBLIC_APP_ENV=production

# Simulation Flags (set to false when integrating real services)
SIMULATE_WHATSAPP=true
SIMULATE_PAYMENTS=true
SIMULATE_SHIPPING=true
SIMULATE_SMS=true

# Real API Keys (when ready to integrate)
WHATSAPP_ACCESS_TOKEN=your-whatsapp-token
DECENTRO_CLIENT_ID=your-decentro-client-id
DECENTRO_CLIENT_SECRET=your-decentro-client-secret
SHIPROCKET_EMAIL=your-shiprocket-email
SHIPROCKET_PASSWORD=your-shiprocket-password
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
```

### **Package.json Configuration**
```json
{
  "name": "shopabell",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:e2e": "cypress run",
    "test:e2e:open": "cypress open",
    "test:component": "cypress run --component",
    "db:reset": "supabase db reset",
    "db:migrate": "supabase migration up",
    "db:seed": "node scripts/seed.js",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "next": "14.0.0",
    "react": "18.2.0",
    "react-dom": "18.2.0",
    "@supabase/supabase-js": "^2.38.0",
    "@supabase/ssr": "^0.0.10",
    "typescript": "5.2.2",
    "tailwindcss": "3.3.5",
    "@headlessui/react": "^1.7.17",
    "@heroicons/react": "^2.0.18",
    "lucide-react": "^0.294.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0",
    "zod": "^3.22.4",
    "react-hook-form": "^7.47.0",
    "@hookform/resolvers": "^3.3.2",
    "date-fns": "^2.30.0",
    "recharts": "^2.8.0",
    "html2canvas": "^1.4.1",
    "crypto-js": "^4.2.0"
  },
  "devDependencies": {
    "@types/node": "20.8.9",
    "@types/react": "18.2.33",
    "@types/react-dom": "18.2.14",
    "@types/crypto-js": "^4.2.1",
    "eslint": "8.52.0",
    "eslint-config-next": "14.0.0",
    "autoprefixer": "10.4.16",
    "postcss": "8.4.31",
    "vitest": "^0.34.6",
    "@vitejs/plugin-react": "^4.1.0",
    "jsdom": "^22.1.0",
    "@testing-library/react": "^13.4.0",
    "@testing-library/jest-dom": "^6.1.4",
    "cypress": "^13.4.0",
    "@cypress/react18": "^2.0.1",
    "@cypress/webpack-dev-server": "^3.7.0"
  }
}
```

---

## **📝 Implementation Checklist**

### **Phase 1: Foundation (Week 1-2)**
- [ ] Next.js 14 project setup with TypeScript
- [ ] Supabase project creation and database schema
- [ ] Tailwind CSS configuration with custom design system
- [ ] Authentication system with Supabase Auth
- [ ] Basic routing structure (auth, dashboard, store, admin)
- [ ] Core UI components library
- [ ] WhatsApp onboarding simulation interface

### **Phase 2: Core Features (Week 3-4)**
- [ ] Product management system (CRUD operations)
- [ ] Image upload and processing with Supabase Storage
- [ ] Simple livestream widget with screenshot simulation
- [ ] Client-side image processing (crop, resize, enhance)
- [ ] Chat system with real-time messaging
- [ ] "Sell" command parser and checkout generation
- [ ] Order management system

### **Phase 3: Business Logic (Week 5-6)**
- [ ] Payment system simulation with Decentro-like interface
- [ ] Shipping integration simulation with courier selection
- [ ] Inventory management and stock tracking
- [ ] Analytics dashboard with key metrics
- [ ] Notification system (in-app, email simulation)
- [ ] Admin partnership program

### **Phase 4: Advanced Features (Week 7-8)**
- [ ] Multi-channel product sync
- [ ] Advanced chat features (typing indicators, read receipts)
- [ ] Livestream session management and analytics
- [ ] Product import from URLs and social media
- [ ] Bulk operations and CSV import/export
- [ ] Performance optimization and caching

### **Phase 5: Testing & Deployment (Week 9-10)**
- [ ] Comprehensive E2E testing with Cypress
- [ ] Component testing for all UI components
- [ ] API testing for all endpoints
- [ ] Performance testing and optimization
- [ ] Security testing and vulnerability assessment
- [ ] Vercel deployment configuration
- [ ] Database performance optimization
- [ ] Error monitoring and logging setup

### **Phase 6: Integration Preparation (Week 11-12)**
- [ ] Real WhatsApp Business API integration preparation
- [ ] Decentro payment gateway integration setup
- [ ] Shiprocket shipping API integration
- [ ] SMS service integration (Twilio/MSG91)
- [ ] Email service setup (SendGrid/AWS SES)
- [ ] Production environment configuration
- [ ] SSL certificate and domain setup
- [ ] Database backup and recovery setup

---

## **🔄 Migration Strategy for Real Services**

### **WhatsApp Business API Migration**
```typescript
// lib/integrations/whatsapp.ts
export class WhatsAppService {
  private isSimulation = process.env.SIMULATE_WHATSAPP === 'true';

  async sendMessage(to: string, message: string, template?: string) {
    if (this.isSimulation) {
      return WhatsAppSimulator.sendMessage(to, message);
    }
    
    // Real WhatsApp Business API implementation
    const response = await fetch(`${process.env.WHATSAPP_API_URL}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: to,
        type: 'text',
        text: { body: message }
      })
    });

    return response.json();
  }

  async createWebhook() {
    if (this.isSimulation) {
      console.log('Webhook simulation - no real webhook created');
      return;
    }

    // Real webhook setup with Meta
    const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/whatsapp`;
    // Implementation for webhook registration
  }
}
```

### **Payment Gateway Migration**
```typescript
// lib/integrations/payments.ts
export class PaymentService {
  private isSimulation = process.env.SIMULATE_PAYMENTS === 'true';

  async createVirtualAccount(sellerData: any) {
    if (this.isSimulation) {
      return PaymentGatewaySimulator.createVirtualAccount(sellerData);
    }

    // Real Decentro API implementation
    const response = await fetch(`${process.env.DECENTRO_API_URL}/v2/kyc/virtual_account`, {
      method: 'POST',
      headers: {
        'client_id': process.env.DECENTRO_CLIENT_ID!,
        'client_secret': process.env.DECENTRO_CLIENT_SECRET!,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        reference_id: `seller_${sellerData.id}`,
        name: sellerData.business_name,
        mobile: sellerData.phone,
        email: sellerData.email,
        purpose_message: "Payments for ShopAbell Store"
      })
    });

    return response.json();
  }

  async verifyPayment(transactionId: string) {
    if (this.isSimulation) {
      return PaymentGatewaySimulator.verifyPayment(transactionId);
    }

    // Real Decentro verification
    const response = await fetch(`${process.env.DECENTRO_API_URL}/v2/payments/verify`, {
      method: 'POST',
      headers: {
        'client_id': process.env.DECENTRO_CLIENT_ID!,
        'client_secret': process.env.DECENTRO_CLIENT_SECRET!,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        transaction_id: transactionId
      })
    });

    return response.json();
  }
}
```

### **Shipping Service Migration**
```typescript
// lib/integrations/shipping.ts
export class ShippingService {
  private isSimulation = process.env.SIMULATE_SHIPPING === 'true';

  async getShippingRates(shipmentData: any) {
    if (this.isSimulation) {
      return ShippingProviderSimulator.getShippingRates(shipmentData);
    }

    // Real Shiprocket API implementation
    const token = await this.authenticateShiprocket();
    
    const response = await fetch(`${process.env.SHIPROCKET_API_URL}/v1/external/courier/serviceability/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      params: new URLSearchParams({
        pickup_postcode: shipmentData.fromPincode,
        delivery_postcode: shipmentData.toPincode,
        weight: shipmentData.weight.toString(),
        cod: shipmentData.codRequired ? '1' : '0'
      })
    });

    return response.json();
  }

  private async authenticateShiprocket() {
    const response = await fetch(`${process.env.SHIPROCKET_API_URL}/v1/external/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: process.env.SHIPROCKET_EMAIL,
        password: process.env.SHIPROCKET_PASSWORD
      })
    });

    const result = await response.json();
    return result.token;
  }
}
```

---

## **📊 Performance Optimization Strategy**

### **Database Optimization**
```sql
-- Create additional performance indexes
CREATE INDEX CONCURRENTLY idx_orders_seller_status ON orders(seller_id, order_status);
CREATE INDEX CONCURRENTLY idx_products_seller_active ON products(seller_id, is_active);
CREATE INDEX CONCURRENTLY idx_chat_messages_chat_created ON chat_messages(chat_id, created_at);
CREATE INDEX CONCURRENTLY idx_analytics_user_type ON analytics_events(user_id, event_type);

-- Optimize frequent queries with materialized views
CREATE MATERIALIZED VIEW seller_analytics AS
SELECT 
  seller_id,
  COUNT(*) as total_orders,
  SUM(total_amount) as total_revenue,
  AVG(total_amount) as avg_order_value,
  COUNT(DISTINCT buyer_id) as unique_customers
FROM orders 
WHERE payment_status = 'completed'
GROUP BY seller_id;

-- Refresh materialized view every hour
CREATE OR REPLACE FUNCTION refresh_seller_analytics()
RETURNS void AS $
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY seller_analytics;
END;
$ LANGUAGE plpgsql;

-- Create stored procedures for complex operations
CREATE OR REPLACE FUNCTION update_product_inventory(
  product_id UUID,
  quantity_sold INTEGER
)
RETURNS void AS $
BEGIN
  UPDATE products 
  SET 
    stock_quantity = GREATEST(0, stock_quantity - quantity_sold),
    last_sold_at = NOW()
  WHERE id = product_id;
  
  -- Log inventory change
  INSERT INTO inventory_logs (product_id, change_type, quantity_changed, quantity_after)
  SELECT 
    product_id, 
    'sale', 
    -quantity_sold, 
    stock_quantity
  FROM products WHERE id = product_id;
END;
$ LANGUAGE plpgsql;
```

### **Frontend Performance**
```typescript
// lib/hooks/useOptimizedQuery.ts
import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

export function useOptimizedQuery<T>(
  table: string,
  select: string = '*',
  filters: Record<string, any> = {},
  options: { 
    cache?: boolean;
    realtime?: boolean;
    pagination?: { page: number; limit: number };
  } = {}
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  // Cache key generation
  const cacheKey = `${table}_${JSON.stringify(filters)}_${select}`;

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Check cache first
      if (options.cache) {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const { data: cachedData, timestamp } = JSON.parse(cached);
          // Use cache if less than 5 minutes old
          if (Date.now() - timestamp < 5 * 60 * 1000) {
            setData(cachedData);
            setLoading(false);
            return;
          }
        }
      }

      let query = supabase.from(table).select(select);

      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          query = query.in(key, value);
        } else {
          query = query.eq(key, value);
        }
      });

      // Apply pagination
      if (options.pagination) {
        const { page, limit } = options.pagination;
        const from = (page - 1) * limit;
        const to = from + limit - 1;
        query = query.range(from, to);
      }

      const { data: fetchedData, error } = await query;

      if (error) throw error;

      setData(fetchedData || []);

      // Cache the result
      if (options.cache) {
        localStorage.setItem(cacheKey, JSON.stringify({
          data: fetchedData,
          timestamp: Date.now()
        }));
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [table, select, filters, options]);

  useEffect(() => {
    fetchData();

    // Set up real-time subscription if requested
    if (options.realtime) {
      const channel = supabase
        .channel(`realtime-${table}`)
        .on('postgres_changes', 
          { event: '*', schema: 'public', table },
          () => {
            fetchData();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [fetchData, options.realtime]);

  return { data, loading, error, refetch: fetchData };
}

// lib/utils/imageOptimization.ts
export class ImageOptimizer {
  static async compressImage(file: File, quality: number = 0.8): Promise<Blob> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions (max 1200px width)
        const maxWidth = 1200;
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
        const newWidth = img.width * ratio;
        const newHeight = img.height * ratio;

        canvas.width = newWidth;
        canvas.height = newHeight;

        // Draw and compress
        ctx.drawImage(img, 0, 0, newWidth, newHeight);
        canvas.toBlob(resolve, 'image/jpeg', quality);
      };

      img.src = URL.createObjectURL(file);
    });
  }

  static async generateThumbnail(file: File, size: number = 200): Promise<Blob> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();

      img.onload = () => {
        canvas.width = size;
        canvas.height = size;

        // Calculate crop area for square thumbnail
        const minDimension = Math.min(img.width, img.height);
        const cropX = (img.width - minDimension) / 2;
        const cropY = (img.height - minDimension) / 2;

        ctx.drawImage(
          img, 
          cropX, cropY, minDimension, minDimension,
          0, 0, size, size
        );

        canvas.toBlob(resolve, 'image/jpeg', 0.7);
      };

      img.src = URL.createObjectURL(file);
    });
  }
}
```

---

## **🔐 Security Implementation**

### **Authentication & Authorization**
```typescript
// lib/auth/rbac.ts
export enum Permission {
  // Product permissions
  PRODUCTS_CREATE = 'products:create',
  PRODUCTS_READ = 'products:read',
  PRODUCTS_UPDATE = 'products:update',
  PRODUCTS_DELETE = 'products:delete',
  
  // Order permissions
  ORDERS_READ = 'orders:read',
  ORDERS_UPDATE = 'orders:update',
  ORDERS_CREATE = 'orders:create',
  
  // Chat permissions
  CHATS_READ = 'chats:read',
  CHATS_SEND = 'chats:send',
  
  // Admin permissions
  ADMIN_USERS = 'admin:users',
  ADMIN_ANALYTICS = 'admin:analytics',
  ADMIN_SETTINGS = 'admin:settings'
}

export const ROLE_PERMISSIONS = {
  buyer: [
    Permission.PRODUCTS_READ,
    Permission.ORDERS_READ,
    Permission.ORDERS_CREATE,
    Permission.CHATS_READ,
    Permission.CHATS_SEND
  ],
  seller: [
    Permission.PRODUCTS_CREATE,
    Permission.PRODUCTS_READ,
    Permission.PRODUCTS_UPDATE,
    Permission.PRODUCTS_DELETE,
    Permission.ORDERS_READ,
    Permission.ORDERS_UPDATE,
    Permission.CHATS_READ,
    Permission.CHATS_SEND
  ],
  admin: Object.values(Permission),
  group_admin: [
    Permission.ADMIN_ANALYTICS,
    Permission.ORDERS_READ,
    Permission.PRODUCTS_READ
  ]
};

export function hasPermission(userRole: string, permission: Permission): boolean {
  const rolePermissions = ROLE_PERMISSIONS[userRole as keyof typeof ROLE_PERMISSIONS];
  return rolePermissions?.includes(permission) || false;
}

// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Protect dashboard routes
  if (req.nextUrl.pathname.startsWith('/dashboard')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    // Check user role for specific routes
    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (req.nextUrl.pathname.startsWith('/admin') && user?.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  }

  // Protect API routes
  if (req.nextUrl.pathname.startsWith('/api/')) {
    // Allow public API routes
    const publicRoutes = ['/api/auth', '/api/webhooks'];
    const isPublicRoute = publicRoutes.some(route => 
      req.nextUrl.pathname.startsWith(route)
    );

    if (!isPublicRoute && !session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
  }

  return res;
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/:path*', '/admin/:path*']
};
```

### **Input Validation**
```typescript
// lib/validations/schemas.ts
import { z } from 'zod';

export const productSchema = z.object({
  name: z.string()
    .min(1, 'Product name is required')
    .max(255, 'Product name must be less than 255 characters')
    .regex(/^[a-zA-Z0-9\s\-.,&'()]+$/, 'Product name contains invalid characters'),
  
  description: z.string()
    .max(5000, 'Description must be less than 5000 characters')
    .optional(),
  
  price: z.number()
    .positive('Price must be positive')
    .max(1000000, 'Price must be less than ₹10,00,000'),
  
  category_id: z.string().uuid('Invalid category'),
  
  images: z.array(z.string().url())
    .min(1, 'At least one image is required')
    .max(10, 'Maximum 10 images allowed'),
  
  stock_quantity: z.number()
    .int('Stock must be a whole number')
    .min(0, 'Stock cannot be negative'),
  
  variants: z.array(z.object({
    type: z.string(),
    value: z.string(),
    price_adjustment: z.number().default(0)
  })).optional()
});

export const orderSchema = z.object({
  product_id: z.string().uuid('Invalid product ID'),
  quantity: z.number().int().positive().max(100),
  shipping_address: z.object({
    name: z.string().min(1).max(100),
    address: z.string().min(10).max(500),
    city: z.string().min(1).max(100),
    state: z.string().min(1).max(100),
    pincode: z.string().regex(/^\d{6}$/, 'Invalid pincode'),
    phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid phone number')
  }),
  payment_method: z.enum(['UPI', 'CARD', 'BANK_TRANSFER', 'COD'])
});

export const userRegistrationSchema = z.object({
  phone: z.string()
    .regex(/^[6-9]\d{9}$/, 'Invalid phone number'),
  
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces'),
  
  email: z.string()
    .email('Invalid email address')
    .optional(),
  
  business_name: z.string()
    .min(2, 'Business name must be at least 2 characters')
    .max(255, 'Business name must be less than 255 characters')
    .optional(),
  
  upi_id: z.string()
    .regex(/^[\w.-]+@[\w.-]+$/, 'Invalid UPI ID format')
    .optional()
});

// API route validation helper
export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }
    throw error;
  }
}
```

### **Rate Limiting**
```typescript
// lib/security/rateLimiting.ts
import { LRUCache } from 'lru-cache';

interface RateLimitOptions {
  interval: number; // Time window in milliseconds
  uniqueTokenPerInterval: number; // Max requests per interval
}

const rateLimiters = new Map<string, LRUCache<string, number>>();

export function rateLimit(options: RateLimitOptions) {
  return {
    check: (limit: number, token: string) => 
      new Promise<void>((resolve, reject) => {
        const key = `${options.interval}_${options.uniqueTokenPerInterval}`;
        
        if (!rateLimiters.has(key)) {
          rateLimiters.set(key, new LRUCache({
            max: options.uniqueTokenPerInterval,
            ttl: options.interval
          }));
        }

        const tokenCache = rateLimiters.get(key)!;
        const tokenCount = tokenCache.get(token) || 0;

        if (tokenCount >= limit) {
          reject(new Error('Rate limit exceeded'));
          return;
        }

        tokenCache.set(token, tokenCount + 1);
        resolve();
      })
  };
}

// Usage in API routes
const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500 // Max 500 unique IPs per minute
});

export async function withRateLimit(
  req: Request, 
  limit: number = 10,
  getToken: (req: Request) => string = (req) => getClientIP(req)
) {
  try {
    await limiter.check(limit, getToken(req));
  } catch {
    throw new Response('Rate limit exceeded', { status: 429 });
  }
}

function getClientIP(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  const realIP = req.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP.trim();
  }
  
  return 'unknown';
}
```

---

## **📱 Progressive Web App Implementation**

### **PWA Configuration**
```typescript
// next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts',
        expiration: {
          maxEntries: 4,
          maxAgeSeconds: 365 * 24 * 60 * 60 // 365 days
        }
      }
    },
    {
      urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 24 * 60 * 60 // 24 hours
        }
      }
    }
  ]
});

module.exports = withPWA({
  // Next.js config
});

// public/manifest.json
{
  "name": "ShopAbell - Social Commerce Platform",
  "short_name": "ShopAbell",
  "description": "Transform your social media into a complete e-commerce business",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3b82f6",
  "orientation": "portrait-primary",
  "categories": ["business", "shopping", "social"],
  "lang": "en",
  "dir": "ltr",
  "icons": [
    {
      "src": "/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable any"
    }
  ],
  "screenshots": [
    {
      "src": "/screenshots/mobile-1.png",
      "sizes": "390x844",
      "type": "image/png",
      "form_factor": "narrow"
    },
    {
      "src": "/screenshots/desktop-1.png",
      "sizes": "1920x1080",
      "type": "image/png",
      "form_factor": "wide"
    }
  ],
  "shortcuts": [
    {
      "name": "Add Product",
      "short_name": "Add Product",
      "description": "Quickly add a new product",
      "url": "/dashboard/products/new",
      "icons": [{ "src": "/icons/add-product.png", "sizes": "96x96" }]
    },
    {
      "name": "Orders",
      "short_name": "Orders",
      "description": "View your orders",
      "url": "/dashboard/orders",
      "icons": [{ "src": "/icons/orders.png", "sizes": "96x96" }]
    }
  ]
}
```

### **Offline Support**
```typescript
// lib/offline/offlineManager.ts
export class OfflineManager {
  private static instance: OfflineManager;
  private isOnline: boolean = navigator.onLine;
  private pendingActions: Array<{
    id: string;
    type: string;
    data: any;
    timestamp: number;
  }> = [];

  static getInstance(): OfflineManager {
    if (!OfflineManager.instance) {
      OfflineManager.instance = new OfflineManager();
    }
    return OfflineManager.instance;
  }

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.handleOnline.bind(this));
      window.addEventListener('offline', this.handleOffline.bind(this));
      this.loadPendingActions();
    }
  }

  private handleOnline() {
    this.isOnline = true;
    this.syncPendingActions();
  }

  private handleOffline() {
    this.isOnline = false;
  }

  addPendingAction(type: string, data: any) {
    const action = {
      id: crypto.randomUUID(),
      type,
      data,
      timestamp: Date.now()
    };

    this.pendingActions.push(action);
    this.savePendingActions();

    if (this.isOnline) {
      this.syncPendingActions();
    }
  }

  private async syncPendingActions() {
    const actionsToSync = [...this.pendingActions];
    
    for (const action of actionsToSync) {
      try {
        await this.executeAction(action);
        this.removePendingAction(action.id);
      } catch (error) {
        console.error(`Failed to sync action ${action.id}:`, error);
      }
    }
  }

  private async executeAction(action: any) {
    switch (action.type) {
      case 'CREATE_PRODUCT':
        await fetch('/api/products/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(action.data)
        });
        break;
      
      case 'UPDATE_ORDER':
        await fetch(`/api/orders/${action.data.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(action.data)
        });
        break;
      
      case 'SEND_MESSAGE':
        await fetch('/api/chat/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(action.data)
        });
        break;
    }
  }

  private removePendingAction(id: string) {
    this.pendingActions = this.pendingActions.filter(action => action.id !== id);
    this.savePendingActions();
  }

  private savePendingActions() {
    localStorage.setItem('shopabell_pending_actions', JSON.stringify(this.pendingActions));
  }

  private loadPendingActions() {
    const saved = localStorage.getItem('shopabell_pending_actions');
    if (saved) {
      this.pendingActions = JSON.parse(saved);
    }
  }

  getConnectionStatus() {
    return {
      isOnline: this.isOnline,
      pendingActions: this.pendingActions.length
    };
  }
}
```

---

## **🔍 Monitoring & Observability**

### **Error Tracking**
```typescript
// lib/monitoring/errorTracking.ts
export class ErrorTracker {
  private static isProduction = process.env.NODE_ENV === 'production';

  static captureException(error: Error, context?: Record<string, any>) {
    const errorData = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : 'server',
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
      context: context || {}
    };

    // Log to console in development
    if (!this.isProduction) {
      console.error('Error captured:', errorData);
    }

    // Send to monitoring service in production
    if (this.isProduction) {
      this.sendToMonitoringService(errorData);
    }

    // Store in local storage for offline scenarios
    this.storeLocalError(errorData);
  }

  private static async sendToMonitoringService(errorData: any) {
    try {
      await fetch('/api/monitoring/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorData)
      });
    } catch (err) {
      console.error('Failed to send error to monitoring service:', err);
    }
  }

  private static storeLocalError(errorData: any) {
    try {
      const existingErrors = JSON.parse(localStorage.getItem('shopabell_errors') || '[]');
      existingErrors.push(errorData);
      
      // Keep only last 10 errors
      const recentErrors = existingErrors.slice(-10);
      localStorage.setItem('shopabell_errors', JSON.stringify(recentErrors));
    } catch (err) {
      console.error('Failed to store error locally:', err);
    }
  }

  static getLocalErrors() {
    try {
      return JSON.parse(localStorage.getItem('shopabell_errors') || '[]');
    } catch {
      return [];
    }
  }

  static clearLocalErrors() {
    localStorage.removeItem('shopabell_errors');
  }
}

// Global error boundary
// app/error.tsx
'use client';

import { useEffect } from 'react';
import { ErrorTracker } from '@/lib/monitoring/errorTracking';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    ErrorTracker.captureException(error, {
      boundary: 'global',
      digest: error.digest
    });
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
        <div className="text-red-500 text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong!</h2>
        <p className="text-gray-600 mb-6">
          We've been notified about this error and will fix it soon.
        </p>
        <div className="space-y-3">
          <button
            onClick={reset}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Try again
          </button>
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
```

### **Performance Monitoring**
```typescript
// lib/monitoring/performance.ts
export class PerformanceMonitor {
  private static metrics: Array<{
    name: string;
    value: number;
    timestamp: number;
  }> = [];

  static trackPageLoad(pageName: string) {
    if (typeof window !== 'undefined') {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      const metrics = {
        page: pageName,
        loadTime: navigation.loadEventEnd - navigation.loadEventStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        firstContentfulPaint: this.getFirstContentfulPaint(),
        largestContentfulPaint: this.getLargestContentfulPaint(),
        cumulativeLayoutShift: this.getCumulativeLayoutShift(),
        timestamp: Date.now()
      };

      this.recordMetric('page_load', metrics);
    }
  }

  static trackUserInteraction(action: string, duration?: number) {
    const metric = {
      action,
      duration: duration || 0,
      timestamp: Date.now()
    };

    this.recordMetric('user_interaction', metric);
  }

  static trackAPICall(endpoint: string, duration: number, status: number) {
    const metric = {
      endpoint,
      duration,
      status,
      timestamp: Date.now()
    };

    this.recordMetric('api_call', metric);
  }

  private static recordMetric(type: string, data: any) {
    const metric = {
      name: type,
      value: data,
      timestamp: Date.now()
    };

    this.metrics.push(metric);

    // Keep only last 100 metrics
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100);
    }

    // Send to analytics in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToAnalytics(metric);
    }
  }

  private static async sendToAnalytics(metric: any) {
    try {
      await fetch('/api/analytics/performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metric)
      });
    } catch (error) {
      console.error('Failed to send performance metric:', error);
    }
  }

  private static getFirstContentfulPaint(): number {
    const entries = performance.getEntriesByName('first-contentful-paint');
    return entries.length > 0 ? entries[0].startTime : 0;
  }

  private static getLargestContentfulPaint(): number {
    return new Promise((resolve) => {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        resolve(lastEntry.startTime);
        observer.disconnect();
      });
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    });
  }

  private static getCumulativeLayoutShift(): number {
    return new Promise((resolve) => {
      let clsValue = 0;
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }
        resolve(clsValue);
      });
      observer.observe({ entryTypes: ['layout-shift'] });
    });
  }

  static getMetrics() {
    return this.metrics;
  }
}
```

---

## **🚀 Final Implementation Summary**

This comprehensive development plan provides everything needed to build ShopAbell end-to-end using **Claude Code**. The implementation includes:

### **✅ Complete Feature Set**
- **30-second WhatsApp onboarding** with realistic simulation
- **AI livestream-to-catalog** with simple screenshot processing
- **Revolutionary "sell" command** for instant checkout creation
- **Direct payment system** with instant settlements
- **Automated shipping** with multi-courier selection
- **Complete analytics** and business intelligence
- **Admin partnership program** for viral growth

### **✅ Production-Ready Architecture**
- **Next.js 14** with App Router and TypeScript
- **Supabase** for database, authentication, storage, and real-time
- **Tailwind CSS** with custom design system
- **Client-side AI** processing for cost efficiency
- **Progressive Web App** with offline support
- **Comprehensive testing** strategy

### **✅ Scalable Design**
- **Microservices-ready** API structure
- **Database optimization** with proper indexing
- **Caching strategies** for performance
- **Real-time features** with Supabase
- **Mobile-first** responsive design
- **Security best practices** throughout

### **✅ Migration-Ready Integrations**
- **WhatsApp Business API** integration preparation
- **Decentro payment gateway** swap capability
- **Shiprocket shipping** API compatibility
- **SMS/Email services** integration ready
- **Environment-based** simulation flags

### **✅ Business Success Metrics**
- **3% platform fee** with instant settlements
- **Shipping arbitrage** revenue model
- **Admin partnerships** for growth
- **Complete automation** for scalability
- **Trust-first design** for user confidence

This plan enables building a **complete, production-ready social commerce platform** that can onboard sellers in 30 seconds, convert livestreams to catalogs automatically, and process orders seamlessly - all while maintaining the flexibility to upgrade to real third-party services as the business grows.

**Ready for Claude Code implementation! 🚀**# 🚀 ShopAbell Complete Development Plan
## End-to-End Implementation Guide for Claude Code

---

## **📋 Project Overview**

### **Vision Statement**
Build the world's first AI-powered social commerce operating system that transforms any social media creator into a professional e-commerce business in under 30 seconds.

### **Core Value Proposition**
- **30-second WhatsApp onboarding** (simulated interface)
- **AI livestream-to-catalog** conversion (simple screenshot + crop)
- **Revolutionary "sell" command** for instant checkout
- **Direct instant payments** to seller accounts
- **Automated shipping** with multi-courier selection
- **Complete analytics** and business intelligence

---

## **🏗️ Technical Architecture**

### **Stack Overview**
```
Frontend: Next.js 14 + TypeScript + Tailwind CSS
Database: Supabase (PostgreSQL + Real-time + Storage + Auth)
Deployment: Vercel
AI Processing: Client-side JavaScript (no external APIs)
Simulations: WhatsApp UI, Decentro, Shiprocket (all built-in)
```

### **Project Structure**
```
shopabell/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication pages
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   └── onboard/page.tsx     # WhatsApp simulation
│   ├── (dashboard)/             # Seller dashboard
│   │   ├── dashboard/
│   │   │   ├── page.tsx         # Main dashboard
│   │   │   ├── products/        # Product management
│   │   │   ├── orders/          # Order management
│   │   │   ├── chats/           # Chat interface
│   │   │   ├── livestream/      # Livestream features
│   │   │   ├── analytics/       # Analytics dashboard
│   │   │   └── settings/        # Account settings
│   │   └── layout.tsx
│   ├── (store)/                 # Buyer-facing store
│   │   ├── store/[slug]/        # Store pages
│   │   ├── product/[id]/        # Product pages
│   │   ├── cart/                # Shopping cart
│   │   └── checkout/            # Checkout flow
│   ├── (admin)/                 # Admin panel
│   │   └── admin/               # Admin features
│   ├── api/                     # API routes
│   │   ├── auth/                # Authentication
│   │   ├── products/            # Product CRUD
│   │   ├── orders/              # Order management
│   │   ├── chat/                # Chat system
│   │   ├── payments/            # Payment simulation
│   │   ├── shipping/            # Shipping simulation
│   │   ├── whatsapp/            # WhatsApp simulation
│   │   └── webhooks/            # Webhook handlers
│   ├── components/              # Reusable components
│   │   ├── ui/                  # Base UI components
│   │   ├── forms/               # Form components
│   │   ├── dashboard/           # Dashboard components
│   │   ├── store/               # Store components
│   │   ├── chat/                # Chat components
│   │   └── whatsapp/            # WhatsApp UI components
│   ├── lib/                     # Utilities and helpers
│   │   ├── supabase/            # Supabase client
│   │   ├── utils/               # General utilities
│   │   ├── hooks/               # Custom React hooks
│   │   ├── ai/                  # Client-side AI processing
│   │   ├── validations/         # Form validations
│   │   └── simulations/         # API simulations
│   ├── styles/                  # CSS files
│   │   └── globals.css
│   ├── public/                  # Static assets
│   │   ├── images/
│   │   ├── icons/
│   │   └── fonts/
│   └── types/                   # TypeScript definitions
├── components.json              # Shadcn/ui config
├── tailwind.config.js           # Tailwind configuration
├── next.config.js               # Next.js configuration
├── package.json
├── tsconfig.json
└── README.md
```

---

## **🗄️ Complete Database Schema**

### **Supabase Setup**
```sql
-- Enable Row Level Security and Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE users, sellers, products, orders, chats, chat_messages;

-- Users table (Base user information)
CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    phone VARCHAR(15) UNIQUE NOT NULL,
    name VARCHAR(100),
    email VARCHAR(255),
    role VARCHAR(20) DEFAULT 'buyer' CHECK (role IN ('seller', 'buyer', 'admin', 'group_admin')),
    language_preference VARCHAR(5) DEFAULT 'en',
    profile_image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_verified BOOLEAN DEFAULT FALSE,
    verification_documents JSONB DEFAULT '[]',
    device_info JSONB DEFAULT '{}',
    timezone VARCHAR(50) DEFAULT 'Asia/Kolkata',
    app_version VARCHAR(20)
);

-- Sellers table (Seller-specific information)
CREATE TABLE sellers (
    id UUID REFERENCES users(id) PRIMARY KEY,
    business_name VARCHAR(255) NOT NULL,
    business_category VARCHAR(100),
    upi_id VARCHAR(255),
    bank_account VARCHAR(50),
    ifsc_code VARCHAR(20),
    pan_number VARCHAR(20),
    aadhaar_number TEXT, -- encrypted
    gstin VARCHAR(20),
    pickup_address JSONB NOT NULL,
    virtual_account_number VARCHAR(50),
    virtual_upi_id VARCHAR(255),
    subscription_plan VARCHAR(20) DEFAULT 'free' CHECK (subscription_plan IN ('free', 'basic', 'premium')),
    subscription_expires DATE,
    subscription_payment_history JSONB DEFAULT '[]',
    onboarding_completed BOOLEAN DEFAULT FALSE,
    onboarding_step INTEGER DEFAULT 0,
    verification_status VARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
    store_slug VARCHAR(100) UNIQUE NOT NULL,
    store_theme VARCHAR(50) DEFAULT 'default',
    store_settings JSONB DEFAULT '{}',
    business_hours JSONB DEFAULT '{"always_open": true}',
    auto_reply_enabled BOOLEAN DEFAULT FALSE,
    auto_reply_message TEXT,
    commission_rate DECIMAL(5,2) DEFAULT 3.00,
    referred_by UUID REFERENCES users(id),
    total_sales DECIMAL(12,2) DEFAULT 0,
    total_orders INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    last_live_session TIMESTAMP WITH TIME ZONE,
    preferred_couriers JSONB DEFAULT '[]',
    shipping_settings JSONB DEFAULT '{}',
    tax_settings JSONB DEFAULT '{}'
);

-- Buyers table (Buyer-specific information)
CREATE TABLE buyers (
    id UUID REFERENCES users(id) PRIMARY KEY,
    default_address JSONB,
    saved_addresses JSONB DEFAULT '[]',
    payment_methods JSONB DEFAULT '[]',
    wishlist JSONB DEFAULT '[]',
    order_history_count INTEGER DEFAULT 0,
    total_spent DECIMAL(12,2) DEFAULT 0,
    loyalty_points INTEGER DEFAULT 0,
    preferred_categories JSONB DEFAULT '[]',
    last_order_date DATE,
    notification_preferences JSONB DEFAULT '{"sms": true, "whatsapp": true, "email": true}'
);

-- Categories table
CREATE TABLE categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    parent_id UUID REFERENCES categories(id),
    description TEXT,
    image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    commission_rate DECIMAL(5,2) DEFAULT 3.00,
    product_count INTEGER DEFAULT 0
);

-- Products table
CREATE TABLE products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    seller_id UUID REFERENCES sellers(id) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    short_description VARCHAR(500),
    price DECIMAL(10,2) NOT NULL,
    original_price DECIMAL(10,2),
    cost_price DECIMAL(10,2),
    images JSONB DEFAULT '[]',
    variants JSONB DEFAULT '[]',
    stock_quantity INTEGER DEFAULT 0,
    reserved_stock INTEGER DEFAULT 0,
    low_stock_threshold INTEGER DEFAULT 5,
    category_id UUID REFERENCES categories(id),
    subcategory VARCHAR(100),
    tags JSONB DEFAULT '[]',
    brand VARCHAR(100),
    model VARCHAR(100),
    weight DECIMAL(8,2) DEFAULT 0,
    dimensions JSONB DEFAULT '{"length": 0, "width": 0, "height": 0}',
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    created_from VARCHAR(20) DEFAULT 'manual' CHECK (created_from IN ('manual', 'livestream', 'import', 'whatsapp', 'social')),
    livestream_session_id UUID,
    source_timestamp BIGINT,
    source_url TEXT,
    seo_title VARCHAR(255),
    seo_description TEXT,
    meta_keywords JSONB DEFAULT '[]',
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    share_count INTEGER DEFAULT 0,
    conversion_rate DECIMAL(5,2) DEFAULT 0,
    last_sold_at TIMESTAMP WITH TIME ZONE,
    featured_until TIMESTAMP WITH TIME ZONE,
    discount_percentage DECIMAL(5,2) DEFAULT 0,
    discount_start_date DATE,
    discount_end_date DATE,
    shipping_cost DECIMAL(8,2) DEFAULT 0,
    cod_available BOOLEAN DEFAULT TRUE,
    return_policy TEXT,
    warranty_info TEXT,
    care_instructions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product variants table
CREATE TABLE product_variants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    variant_type VARCHAR(50) NOT NULL, -- color, size, style
    variant_value VARCHAR(100) NOT NULL,
    price_adjustment DECIMAL(8,2) DEFAULT 0,
    stock_quantity INTEGER DEFAULT 0,
    sku VARCHAR(100) UNIQUE,
    image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE
);

-- Livestream sessions table
CREATE TABLE livestream_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    seller_id UUID REFERENCES sellers(id) NOT NULL,
    session_name VARCHAR(255),
    session_description TEXT,
    start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_time TIMESTAMP WITH TIME ZONE,
    scheduled_start TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'recording' CHECK (status IN ('scheduled', 'recording', 'processing', 'completed', 'cancelled')),
    platform VARCHAR(20) DEFAULT 'facebook' CHECK (platform IN ('facebook', 'instagram', 'youtube', 'whatsapp_status')),
    platform_url TEXT,
    total_products_captured INTEGER DEFAULT 0,
    screenshots_count INTEGER DEFAULT 0,
    processing_progress INTEGER DEFAULT 0,
    viewer_count INTEGER DEFAULT 0,
    peak_viewers INTEGER DEFAULT 0,
    total_orders INTEGER DEFAULT 0,
    total_revenue DECIMAL(12,2) DEFAULT 0,
    engagement_rate DECIMAL(5,2) DEFAULT 0,
    conversion_rate DECIMAL(5,2) DEFAULT 0,
    recording_file_url TEXT,
    thumbnail_url TEXT,
    ai_processing_logs JSONB DEFAULT '[]',
    session_settings JSONB DEFAULT '{}',
    pinned_comment TEXT,
    chat_logs JSONB DEFAULT '[]'
);

-- Livestream products table
CREATE TABLE livestream_products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES livestream_sessions(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    timestamp_captured INTEGER NOT NULL,
    duration_shown INTEGER DEFAULT 0,
    screenshot_url TEXT NOT NULL,
    ai_confidence_score DECIMAL(3,2) DEFAULT 0,
    manual_verification BOOLEAN DEFAULT FALSE,
    orders_generated INTEGER DEFAULT 0,
    views_during_show INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
CREATE TABLE orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_number VARCHAR(20) UNIQUE NOT NULL,
    buyer_id UUID REFERENCES buyers(id) NOT NULL,
    seller_id UUID REFERENCES sellers(id) NOT NULL,
    product_id UUID REFERENCES products(id) NOT NULL,
    variant_id UUID REFERENCES product_variants(id),
    quantity INTEGER DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(8,2) DEFAULT 0,
    shipping_cost DECIMAL(8,2) DEFAULT 0,
    tax_amount DECIMAL(8,2) DEFAULT 0,
    platform_fee DECIMAL(8,2) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50),
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded', 'cancelled')),
    payment_transaction_id VARCHAR(255),
    payment_gateway VARCHAR(50),
    shipping_address JSONB NOT NULL,
    billing_address JSONB,
    order_status VARCHAR(30) DEFAULT 'pending' CHECK (order_status IN ('pending', 'confirmed', 'processing', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned')),
    tracking_number VARCHAR(100),
    courier_partner VARCHAR(100),
    estimated_delivery DATE,
    actual_delivery TIMESTAMP WITH TIME ZONE,
    chat_context JSONB DEFAULT '{}',
    created_via VARCHAR(20) DEFAULT 'direct_buy' CHECK (created_via IN ('chat', 'direct_buy', 'whatsapp', 'app', 'website')),
    seller_notes TEXT,
    buyer_notes TEXT,
    cancellation_reason TEXT,
    return_reason TEXT,
    return_status VARCHAR(20) DEFAULT 'not_requested' CHECK (return_status IN ('not_requested', 'requested', 'approved', 'rejected', 'picked_up', 'refunded')),
    delivery_attempts INTEGER DEFAULT 0,
    cod_amount DECIMAL(10,2),
    cod_collection_status VARCHAR(20) DEFAULT 'pending' CHECK (cod_collection_status IN ('pending', 'collected', 'failed')),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    review_images JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chats table
CREATE TABLE chats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    buyer_id UUID REFERENCES buyers(id) NOT NULL,
    seller_id UUID REFERENCES sellers(id) NOT NULL,
    product_id UUID REFERENCES products(id),
    order_id UUID REFERENCES orders(id),
    chat_type VARCHAR(20) DEFAULT 'product_inquiry' CHECK (chat_type IN ('product_inquiry', 'order_support', 'general')),
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_message_by UUID REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'archived', 'order_created', 'resolved')),
    unread_count_buyer INTEGER DEFAULT 0,
    unread_count_seller INTEGER DEFAULT 0,
    is_starred BOOLEAN DEFAULT FALSE,
    priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    auto_replies_count INTEGER DEFAULT 0,
    human_intervention_required BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat messages table
CREATE TABLE chat_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id) NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'audio', 'video', 'product', 'order', 'system')),
    content TEXT NOT NULL,
    media_url TEXT,
    metadata JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    edited_at TIMESTAMP WITH TIME ZONE,
    reply_to_message_id UUID REFERENCES chat_messages(id)
);

-- Admin partnerships table
CREATE TABLE admin_partnerships (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_user_id UUID REFERENCES users(id) NOT NULL,
    group_name VARCHAR(255) NOT NULL,
    group_platform VARCHAR(20) CHECK (group_platform IN ('facebook', 'whatsapp', 'telegram', 'instagram')),
    group_url TEXT,
    group_member_count INTEGER DEFAULT 0,
    referral_code VARCHAR(20) UNIQUE NOT NULL,
    commission_rate DECIMAL(4,2) DEFAULT 0.50,
    total_referrals INTEGER DEFAULT 0,
    active_referrals INTEGER DEFAULT 0,
    total_gmv DECIMAL(15,2) DEFAULT 0,
    total_commission_earned DECIMAL(10,2) DEFAULT 0,
    pending_commission DECIMAL(10,2) DEFAULT 0,
    paid_commission DECIMAL(10,2) DEFAULT 0,
    last_payout_date DATE,
    payout_method VARCHAR(50),
    payout_details JSONB DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'terminated')),
    performance_tier VARCHAR(20) DEFAULT 'bronze' CHECK (performance_tier IN ('bronze', 'silver', 'gold', 'platinum')),
    bonus_eligibility BOOLEAN DEFAULT TRUE,
    monthly_targets JSONB DEFAULT '{}',
    marketing_materials_access BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('order', 'payment', 'shipping', 'chat', 'system', 'marketing')),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    channels JSONB DEFAULT '["app"]', -- app, email, sms, whatsapp
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE,
    action_url TEXT,
    expires_at TIMESTAMP WITH TIME ZONE
);

-- Analytics events table
CREATE TABLE analytics_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    session_id VARCHAR(255),
    event_type VARCHAR(100) NOT NULL,
    event_data JSONB DEFAULT '{}',
    page_url TEXT,
    referrer TEXT,
    user_agent TEXT,
    ip_address INET,
    device_type VARCHAR(20) CHECK (device_type IN ('mobile', 'tablet', 'desktop')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_products_seller_id ON products(seller_id);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_orders_buyer_id ON orders(buyer_id);
CREATE INDEX idx_orders_seller_id ON orders(seller_id);
CREATE INDEX idx_orders_status ON orders(order_status);
CREATE INDEX idx_chat_messages_chat_id ON chat_messages(chat_id);
CREATE INDEX idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_type ON analytics_events(event_type);

-- Set up Row Level Security policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE buyers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Sellers can manage own products" ON products FOR ALL USING (seller_id = auth.uid());
CREATE POLICY "Orders visible to buyer and seller" ON orders FOR SELECT USING (buyer_id = auth.uid() OR seller_id = auth.uid());
CREATE POLICY "Chat messages visible to participants" ON chat_messages FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM chats 
        WHERE chats.id = chat_messages.chat_id 
        AND (chats.buyer_id = auth.uid() OR chats.seller_id = auth.uid())
    )
);

-- Insert default categories
INSERT INTO categories (name, slug, description) VALUES
('Fashion & Clothing', 'fashion', 'Clothes, accessories, and fashion items'),
('Beauty & Cosmetics', 'beauty', 'Beauty products and cosmetics'),
('Electronics & Gadgets', 'electronics', 'Electronic devices and gadgets'),
('Home & Kitchen', 'home-kitchen', 'Home appliances and kitchen items'),
('Jewelry & Accessories', 'jewelry', 'Jewelry and fashion accessories'),
('Books & Stationery', 'books', 'Books, stationery, and educational materials'),
('Sports & Fitness', 'sports', 'Sports equipment and fitness products'),
('Food & Beverages', 'food', 'Food items and beverages');
```

---

## **🎨 Design System Implementation**

### **Tailwind Configuration**
```javascript
// tailwind.config.js
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          900: '#1e3a8a'
        },
        accent: {
          purple: {
            500: '#8b5cf6',
            600: '#7c3aed',
            700: '#6d28d9'
          },
          green: {
            500: '#22c55e',
            600: '#16a34a'
          },
          orange: {
            500: '#f59e0b',
            600: '#d97706'
          }
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Poppins', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 3s infinite',
        'fade-in': 'fadeIn 0.8s ease-out',
        'slide-up': 'slideUp 0.8s ease-out'
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' }
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { transform: 'translateY(30px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        }
      }
    },
  },
  plugins: [],
}
```

### **Component Library Structure**
```typescript
// components/ui/button.tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
}

// components/ui/card.tsx
interface CardProps {
  className?: string;
  children: React.ReactNode;
}

// components/ui/input.tsx
interface InputProps {
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  label?: string;
}
```

---

## **📱 WhatsApp Onboarding Simulation**

### **WhatsApp UI Components**
```typescript
// components/whatsapp/WhatsAppContainer.tsx
export function WhatsAppContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-md mx-auto bg-gray-100 min-h-screen">
      {/* WhatsApp Header */}
      <div className="bg-green-600 text-white p-4 flex items-center space-x-3">
        <button className="text-white">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
          <span className="text-sm font-bold text-gray-700">SA</span>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold">ShopAbell</h3>
          <p className="text-xs opacity-80">Online</p>
        </div>
        <button className="text-white">
          <Phone className="w-5 h-5" />
        </button>
        <button className="text-white">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>
      
      {/* Chat Area */}
      <div className="flex-1 bg-chat-pattern bg-opacity-10 p-4">
        {children}
      </div>
      
      {/* Input Area */}
      <div className="bg-gray-50 p-4 flex items-center space-x-2">
        <button className="text-gray-500">
          <Paperclip className="w-5 h-5" />
        </button>
        <div className="flex-1 bg-white rounded-full px-4 py-2 flex items-center space-x-2">
          <input 
            type="text" 
            placeholder="Type a message..."
            className="flex-1 outline-none"
            disabled
          />
          <button className="text-gray-500">
            <Smile className="w-5 h-5" />
          </button>
        </div>
        <button className="bg-green-600 text-white p-2 rounded-full">
          <Mic className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

// components/whatsapp/ChatMessage.tsx
interface ChatMessageProps {
  message: string;
  sender: 'bot' | 'user';
  timestamp?: string;
  showOptions?: string[];
  onOptionClick?: (option: string) => void;
}

export function ChatMessage({ message, sender, timestamp, showOptions, onOptionClick }: ChatMessageProps) {
  return (
    <div className={`flex ${sender === 'user' ? 'justify-end' : 'justify-start'} mb-2`}>
      <div className={`max-w-xs rounded-lg p-3 ${
        sender === 'user' 
          ? 'bg-green-500 text-white rounded-br-sm' 
          : 'bg-white text-gray-800 rounded-bl-sm shadow-sm'
      }`}>
        <p className="text-sm">{message}</p>
        {showOptions && (
          <div className="mt-2 space-y-1">
            {showOptions.map((option, index) => (
              <button
                key={index}
                onClick={() => onOptionClick?.(option)}
                className="block w-full text-left p-2 text-xs bg-blue-50 text-blue-700 rounded border hover:bg-blue-100 transition-colors"
              >
                {option}
              </button>
            ))}
          </div>
        )}
        <p className={`text-xs mt-1 ${
          sender === 'user' ? 'text-green-100' : 'text-gray-500'
        }`}>
          {timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
}
```

### **Onboarding Flow Logic**
```typescript
// app/(auth)/onboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { WhatsAppContainer, ChatMessage } from '@/components/whatsapp';

interface OnboardingStep {
  id: string;
  botMessage: string;
  options?: string[];
  inputType?: 'text' | 'select' | 'phone' | 'upi';
  validation?: (value: string) => boolean;
  errorMessage?: string;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    botMessage: 'Welcome to ShopAbell! 🎉\n\nI\'ll help you set up your store in just 30 seconds.\n\nWhat\'s your business name?',
    inputType: 'text',
    validation: (value) => value.length >= 2,
    errorMessage: 'Business name must be at least 2 characters'
  },
  {
    id: 'category',
    botMessage: 'Great! What do you sell? Choose your category:',
    options: [
      '1️⃣ Fashion & Clothing',
      '2️⃣ Beauty & Cosmetics', 
      '3️⃣ Electronics & Gadgets',
      '4️⃣ Home & Kitchen',
      '5️⃣ Jewelry & Accessories',
      '6️⃣ Books & Stationery',
      '7️⃣ Sports & Fitness',
      '8️⃣ Food & Beverages'
    ],
    inputType: 'select'
  },
  {
    id: 'upi',
    botMessage: 'Perfect! Now share your UPI ID to receive payments instantly:',
    inputType: 'upi',
    validation: (value) => /^[\w.-]+@[\w.-]+$/.test(value),
    errorMessage: 'Please enter a valid UPI ID (e.g., yourname@paytm)'
  },
  {
    id: 'address',
    botMessage: 'Share your pickup address (where we\'ll collect orders):',
    inputType: 'text',
    validation: (value) => value.length >= 10,
    errorMessage: 'Please enter a complete address'
  },
  {
    id: 'phone',
    botMessage: 'What\'s your business contact number?',
    inputType: 'phone',
    validation: (value) => /^[6-9]\d{9}$/.test(value.replace(/\D/g, '')),
    errorMessage: 'Please enter a valid 10-digit mobile number'
  },
  {
    id: 'complete',
    botMessage: '🎉 Congratulations! Your store is ready!\n\n✅ Store: shopabell.com/{store_slug}\n✅ Payments: {upi_id}\n✅ Ready to sell!\n\nDownload our app to start selling:',
    options: ['📱 Download App', '🌐 Open Store', '📊 View Dashboard']
  }
];

export default function OnboardPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [messages, setMessages] = useState<Array<{
    message: string;
    sender: 'bot' | 'user';
    timestamp: string;
    options?: string[];
  }>>([]);
  const [userData, setUserData] = useState<Record<string, string>>({});
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    // Show initial message with delay to simulate real WhatsApp
    setTimeout(() => {
      showBotMessage(ONBOARDING_STEPS[0]);
    }, 1000);
  }, []);

  const showBotMessage = (step: OnboardingStep) => {
    setIsTyping(true);
    
    // Simulate typing delay
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        message: step.botMessage.replace('{store_slug}', generateStoreSlug(userData.businessName))
                                .replace('{upi_id}', userData.upiId || ''),
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        options: step.options
      }]);
    }, Math.random() * 2000 + 1000); // 1-3 seconds typing
  };

  const handleUserResponse = (response: string) => {
    const step = ONBOARDING_STEPS[currentStep];
    
    // Add user message
    setMessages(prev => [...prev, {
      message: response,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);

    // Validate input if needed
    if (step.validation && !step.validation(response)) {
      setTimeout(() => {
        setMessages(prev => [...prev, {
          message: step.errorMessage || 'Please provide a valid input.',
          sender: 'bot',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      }, 500);
      return;
    }

    // Store user data
    const newUserData = { ...userData };
    switch (step.id) {
      case 'welcome':
        newUserData.businessName = response;
        break;
      case 'category':
        newUserData.category = response;
        break;
      case 'upi':
        newUserData.upiId = response;
        break;
      case 'address':
        newUserData.address = response;
        break;
      case 'phone':
        newUserData.phone = response;
        break;
    }
    setUserData(newUserData);

    // Move to next step
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        showBotMessage(ONBOARDING_STEPS[currentStep + 1]);
      }, 1000);
    } else {
      // Complete onboarding
      completeOnboarding(newUserData);
    }
  };

  const completeOnboarding = async (data: Record<string, string>) => {
    try {
      const response = await fetch('/api/auth/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: data.businessName,
          category: data.category,
          upiId: data.upiId,
          address: data.address,
          phone: data.phone
        })
      });

      if (response.ok) {
        const result = await response.json();
        // Redirect to dashboard or app download
        window.location.href = '/dashboard';
      }
    } catch (error) {
      console.error('Onboarding failed:', error);
    }
  };

  const generateStoreSlug = (businessName?: string) => {
    if (!businessName) return 'your-store';
    return businessName.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 30);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <WhatsAppContainer>
        <div className="space-y-2 pb-20">
          {messages.map((msg, index) => (
            <ChatMessage
              key={index}
              message={msg.message}
              sender={msg.sender}
              timestamp={msg.timestamp}
              showOptions={msg.options}
              onOptionClick={handleUserResponse}
            />
          ))}
          
          {isTyping && (
            <div className="flex justify-start mb-2">
              <div className="bg-white text-gray-800 rounded-lg rounded-bl-sm shadow-sm p-3 max-w-xs">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Interface */}
        {currentStep < ONBOARDING_STEPS.length - 1 && !isTyping && (
          <OnboardingInput
            step={ONBOARDING_STEPS[currentStep]}
            onSubmit={handleUserResponse}
          />
        )}
      </WhatsAppContainer>
    </div>
  );
}

// components/whatsapp/OnboardingInput.tsx
interface OnboardingInputProps {
  step: OnboardingStep;
  onSubmit: (value: string) => void;
}

function OnboardingInput({ step, onSubmit }: OnboardingInputProps) {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSubmit(inputValue.trim());
      setInputValue('');
    }
  };

  if (step.options) {
    return null; // Options are handled by ChatMessage component
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          <div className="flex-1 bg-white rounded-full px-4 py-2 flex items-center space-x-2">
            <input
              type={step.inputType === 'phone' ? 'tel' : 'text'}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={getPlaceholder(step.inputType)}
              className="flex-1 outline-none"
              autoFocus
            />
          </div>
          <button
            type="submit"
            disabled={!inputValue.trim()}
            className="bg-green-600 text-white p-2 rounded-full disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}

function getPlaceholder(inputType?: string): string {
  switch (inputType) {
    case 'phone': return 'Enter mobile number';
    case 'upi': return 'yourname@paytm';
    case 'text': default: return 'Type your answer...';
  }
}
```

---

## **🤖 Client-Side AI Processing**

### **Simple Image Processing**
```typescript
// lib/ai/imageProcessor.ts
export class SimpleImageProcessor {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d')!;
  }

  async captureScreenshot(): Promise<string> {
    try {
      // For livestream simulation, we'll use a mock approach
      // In real implementation, this would capture actual screen
      return this.generateMockScreenshot();
    } catch (error) {
      console.error('Screenshot capture failed:', error);
      throw error;
    }
  }

  cropImage(imageData: string, cropPercent: number = 0.1): Promise<string> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const cropX = img.width * cropPercent;
        const cropY = img.height * cropPercent;
        const cropWidth = img.width * (1 - 2 * cropPercent);
        const cropHeight = img.height * (1 - 2 * cropPercent);

        this.canvas.width = cropWidth;
        this.canvas.height = cropHeight;
        
        this.ctx.drawImage(
          img, 
          cropX, cropY, cropWidth, cropHeight,
          0, 0, cropWidth, cropHeight
        );
        
        resolve(this.canvas.toDataURL('image/jpeg', 0.8));
      };
      img.src = imageData;
    });
  }

  resizeImage(imageData: string, targetWidth: number, targetHeight: number): Promise<string> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        this.canvas.width = targetWidth;
        this.canvas.height = targetHeight;
        
        this.ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
        resolve(this.canvas.toDataURL('image/jpeg', 0.8));
      };
      img.src = imageData;
    });
  }

  enhanceImage(imageData: string): Promise<string> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        this.canvas.width = img.width;
        this.canvas.height = img.height;
        
        this.ctx.drawImage(img, 0, 0);
        
        // Simple brightness/contrast enhancement
        const imageDataObj = this.ctx.getImageData(0, 0, img.width, img.height);
        const data = imageDataObj.data;
        
        for (let i = 0; i < data.length; i += 4) {
          data[i] = Math.min(255, data[i] * 1.1);     // Red
          data[i + 1] = Math.min(255, data[i + 1] * 1.1); // Green
          data[i + 2] = Math.min(255, data[i + 2] * 1.1); // Blue
        }
        
        this.ctx.putImageData(imageDataObj, 0, 0);
        resolve(this.canvas.toDataURL('image/jpeg', 0.8));
      };
      img.src = imageData;
    });
  }

  generateImageHash(imageData: string): string {
    // Simple hash based on image content
    let hash = 0;
    for (let i = 0; i < imageData.length; i++) {
      const char = imageData.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }

  isDuplicate(hash: string, recentHashes: string[]): boolean {
    return recentHashes.includes(hash);
  }

  private generateMockScreenshot(): string {
    // Generate a mock product image for demo purposes
    this.canvas.width = 500;
    this.canvas.height = 500;
    
    // Create gradient background
    const gradient = this.ctx.createLinearGradient(0, 0, 500, 500);
    gradient.addColorStop(0, '#f3f4f6');
    gradient.addColorStop(1, '#e5e7eb');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, 500, 500);
    
    // Draw mock product (rectangle)
    this.ctx.fillStyle = '#3b82f6';
    this.ctx.fillRect(100, 150, 300, 200);
    
    // Add some text
    this.ctx.fillStyle = '#1f2937';
    this.ctx.font = 'bold 24px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('Sample Product', 250, 250);
    
    return this.canvas.toDataURL('image/jpeg', 0.8);
  }
}

// lib/ai/livestreamProcessor.ts
export class LivestreamProcessor {
  private processor: SimpleImageProcessor;
  private isRecording: boolean = false;
  private captureInterval: number | null = null;
  private sessionId: string;
  private productCount: number = 0;
  private recentHashes: string[] = [];

  constructor(sessionId: string) {
    this.processor = new SimpleImageProcessor();
    this.sessionId = sessionId;
  }

  async startRecording(): Promise<void> {
    if (this.isRecording) return;
    
    this.isRecording = true;
    this.captureInterval = window.setInterval(() => {
      this.captureAndProcess();
    }, 5000); // Every 5 seconds
  }

  stopRecording(): void {
    this.isRecording = false;
    if (this.captureInterval) {
      clearInterval(this.captureInterval);
      this.captureInterval = null;
    }
  }

  private async captureAndProcess(): Promise<void> {
    try {
      // Capture screenshot
      const rawImage = await this.processor.captureScreenshot();
      
      // Process image
      const croppedImage = await this.processor.cropImage(rawImage, 0.1);
      const resizedImage = await this.processor.resizeImage(croppedImage, 500, 500);
      const enhancedImage = await this.processor.enhanceImage(resizedImage);
      
      // Check for duplicates
      const imageHash = this.processor.generateImageHash(enhancedImage);
      if (this.processor.isDuplicate(imageHash, this.recentHashes)) {
        return; // Skip duplicate
      }
      
      // Update recent hashes
      this.recentHashes.push(imageHash);
      if (this.recentHashes.length > 5) {
        this.recentHashes.shift();
      }
      
      // Save product
      await this.saveProduct(enhancedImage, imageHash);
      
      // Update UI
      this.productCount++;
      this.updateWidget();
      
    } catch (error) {
      console.error('Processing failed:', error);
    }
  }

  private async saveProduct(imageData: string, hash: string): Promise<void> {
    try {
      // Convert to blob for upload
      const response = await fetch(imageData);
      const blob = await response.blob();
      
      // Upload to Supabase Storage
      const filename = `livestream-${this.sessionId}-${Date.now()}.jpg`;
      const { data: uploadData, error: uploadError } = await window.supabase.storage
        .from('livestream-captures')
        .upload(filename, blob);
      
      if (uploadError) throw uploadError;
      
      // Create product record
      const { data, error } = await window.supabase
        .from('products')
        .insert({
          seller_id: this.getCurrentUserId(),
          name: `Product ${this.productCount + 1}`,
          description: `Captured from livestream at ${new Date().toLocaleTimeString()}`,
          price: 0, // Seller sets manually
          images: [uploadData.path],
          category_id: null,
          created_from: 'livestream',
          livestream_session_id: this.sessionId,
          source_timestamp: Date.now(),
          is_active: false // Inactive until seller reviews
        });
      
      if (error) throw error;
      
    } catch (error) {
      console.error('Save product failed:', error);
      throw error;
    }
  }

  private updateWidget(): void {
    // Dispatch custom event to update UI
    window.dispatchEvent(new CustomEvent('livestream-update', {
      detail: {
        productCount: this.productCount,
        lastCapture: new Date().toLocaleTimeString()
      }
    }));
  }

  private getCurrentUserId(): string {
    // Get current user ID from auth context
    return window.supabase.auth.getUser()?.data?.user?.id || '';
  }

  getStats() {
    return {
      isRecording: this.isRecording,
      productCount: this.productCount,
      sessionId: this.sessionId
    };
  }
}
```

### **Livestream Widget Component**
```typescript
// components/livestream/LivestreamWidget.tsx
'use client';

import { useState, useEffect } from 'react';
import { LivestreamProcessor } from '@/lib/ai/livestreamProcessor';

interface LivestreamWidgetProps {
  sessionId: string;
  onClose?: () => void;
}

export function LivestreamWidget({ sessionId, onClose }: LivestreamWidgetProps) {
  const [processor, setProcessor] = useState<LivestreamProcessor | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [stats, setStats] = useState({
    productCount: 0,
    lastCapture: '',
    sessionDuration: 0
  });
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const newProcessor = new LivestreamProcessor(sessionId);
    setProcessor(newProcessor);

    // Listen for updates
    const handleUpdate = (event: CustomEvent) => {
      setStats(prev => ({
        ...prev,
        productCount: event.detail.productCount,
        lastCapture: event.detail.lastCapture
      }));
    };

    window.addEventListener('livestream-update', handleUpdate as EventListener);
    
    return () => {
      newProcessor.stopRecording();
      window.removeEventListener('livestream-update', handleUpdate as EventListener);
    };
  }, [sessionId]);

  const toggleRecording = async () => {
    if (!processor) return;

    if (isRecording) {
      processor.stopRecording();
      setIsRecording(false);
    } else {
      try {
        await processor.startRecording();
        setIsRecording(true);
      } catch (error) {
        console.error('Failed to start recording:', error);
        alert('Failed to start recording. Please check permissions.');
      }
    }
  };

  const handleManualCapture = () => {
    // Trigger manual capture
    if (processor && isRecording) {
      processor['captureAndProcess'](); // Access private method for manual trigger
    }
  };

  return (
    <div 
      className="fixed z-50 bg-white rounded-2xl shadow-xl border border-gray-200 p-4 min-w-[240px] select-none"
      style={{ 
        left: position.x, 
        top: position.y,
        backdropFilter: 'blur(10px)',
        background: 'rgba(255, 255, 255, 0.95)'
      }}
      onMouseDown={(e) => {
        setIsDragging(true);
        const startX = e.clientX - position.x;
        const startY = e.clientY - position.y;

        const handleMouseMove = (e: MouseEvent) => {
          setPosition({
            x: e.clientX - startX,
            y: e.clientY - startY
          });
        };

        const handleMouseUp = () => {
          setIsDragging(false);
          document.removeEventListener('mousemove', handleMouseMove);
          document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}`}></div>
          <span className="text-sm font-semibold text-gray-700">
            {isRecording ? 'Recording' : 'Stopped'}
          </span>
        </div>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Stats */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-600">Products</span>
          <span className="text-sm font-bold text-blue-600">{stats.productCount}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-600">Quality</span>
          <span className="text-sm font-medium text-green-600">High</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-600">Last</span>
          <span className="text-sm font-medium text-gray-700">
            {stats.lastCapture || '--:--'}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex space-x-2">
        <button
          onClick={handleManualCapture}
          disabled={!isRecording}
          className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          📷 Manual
        </button>
        <button
          onClick={toggleRecording}
          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
            isRecording
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          {isRecording ? '⏹️ Stop' : '▶️ Start'}
        </button>
      </div>

      {/* Progress indicator */}
      {isRecording && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <span className="text-xs text-blue-600 ml-2">Processing...</span>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## **💬 Chat System Implementation**

### **Chat Interface Components**
```typescript
// components/chat/ChatInterface.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  message_type: 'text' | 'image' | 'product' | 'order' | 'system';
  metadata?: any;
  created_at: string;
  is_read: boolean;
}

interface ChatInterfaceProps {
  chatId: string;
  currentUserId: string;
  userRole: 'seller' | 'buyer';
}

export function ChatInterface({ chatId, currentUserId, userRole }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    fetchMessages();
    subscribeToMessages();
    subscribeToTyping();
  }, [chatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });

    if (data) {
      setMessages(data);
    }
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel(`chat-${chatId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `chat_id=eq.${chatId}`
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const subscribeToTyping = () => {
    const channel = supabase
      .channel(`typing-${chatId}`)
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        if (payload.user_id !== currentUserId) {
          setOtherUserTyping(payload.typing);
          if (payload.typing) {
            setTimeout(() => setOtherUserTyping(false), 3000);
          }
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const messageContent = newMessage.trim();
    setNewMessage('');

    // Check if this is a sell command
    if (userRole === 'seller' && isSellCommand(messageContent)) {
      await handleSellCommand(messageContent);
      return;
    }

    // Send regular message
    const { error } = await supabase
      .from('chat_messages')
      .insert({
        chat_id: chatId,
        sender_id: currentUserId,
        content: messageContent,
        message_type: 'text'
      });

    if (error) {
      console.error('Failed to send message:', error);
    }
  };

  const isSellCommand = (message: string): boolean => {
    return /^sell\s+\d+/i.test(message);
  };

  const handleSellCommand = async (command: string) => {
    const result = parseSellCommand(command);
    
    if (result) {
      // Create checkout
      const checkoutData = await createCheckout(result);
      
      // Send system message with checkout
      await supabase
        .from('chat_messages')
        .insert({
          chat_id: chatId,
          sender_id: currentUserId,
          content: `Checkout created for ₹${result.amount}`,
          message_type: 'order',
          metadata: {
            checkout_id: checkoutData.id,
            amount: result.amount,
            variants: result.variants
          }
        });
    }
  };

  const parseSellCommand = (command: string) => {
    const match = command.match(/^sell\s+(\d+)(?:\s+(.+))?$/i);
    if (!match) return null;

    const amount = parseInt(match[1]);
    const variants = match[2] ? parseVariants(match[2]) : {};

    return { amount, variants };
  };

  const parseVariants = (variantString: string) => {
    const variants: Record<string, string> = {};
    const tokens = variantString.split(/\s+/);
    
    // Simple parsing - can be enhanced
    tokens.forEach(token => {
      if (['red', 'blue', 'green', 'black', 'white'].includes(token.toLowerCase())) {
        variants.color = token;
      } else if (['xs', 's', 'm', 'l', 'xl', 'xxl'].includes(token.toLowerCase())) {
        variants.size = token.toUpperCase();
      }
    });

    return variants;
  };

  const createCheckout = async (orderData: { amount: number; variants: Record<string, string> }) => {
    const { data, error } = await supabase
      .from('orders')
      .insert({
        buyer_id: userRole === 'buyer' ? currentUserId : 'temp-buyer',
        seller_id: userRole === 'seller' ? currentUserId : 'temp-seller',
        product_id: 'temp-product', // Get from chat context
        total_amount: orderData.amount,
        platform_fee: orderData.amount * 0.03,
        order_status: 'pending',
        payment_status: 'pending',
        chat_context: { variants: orderData.variants }
      })
      .select()
      .single();

    return data;
  };

  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      supabase.channel(`typing-${chatId}`).send({
        type: 'broadcast',
        event: 'typing',
        payload: {
        # 📋 Complete Feature List - ShopAbell Platform

## **🎯 Core Features**

### **1. WhatsApp Onboarding System**
- 30-second complete onboarding flow
- Multi-language support (10 Indian languages)
- Voice input simulation
- Real-time WhatsApp UI simulation
- Business information collection
- Category selection (8 predefined categories)
- UPI ID validation and setup
- Address and contact collection
- Automatic store creation
- Virtual account generation
- Magic login link generation
- Onboarding progress tracking
- Step validation and error handling
- Session timeout management
- Mobile-optimized interface

### **2. AI Livestream-to-Catalog System**
- Real-time screenshot capture (every 5 seconds)
- Client-side image processing
- Automatic image cropping and enhancement
- Background removal and cleanup
- Image quality optimization
- Duplicate detection using image hashing
- Product numbering and organization
- Timestamp-based cataloging
- Manual capture option
- Processing progress tracking
- Draggable livestream widget
- Session management and analytics
- Batch product activation
- Quality scoring and filtering
- Storage optimization

### **3. Product Management System**
#### **Multiple Product Creation Methods:**
- Manual photo upload with multi-image support
- WhatsApp bulk upload with smart parsing
- URL import from e-commerce sites
- Social media post import
- Livestream automatic capture

#### **Product Features:**
- Rich product information (name, description, price)
- Multiple image support with optimization
- Variant management (size, color, style)
- Inventory tracking and low stock alerts
- Category and subcategory organization
- SEO optimization (title, description, keywords)
- Bulk operations and CSV import/export
- Product activation/deactivation
- Featured product management
- Pricing and discount management
- Weight and dimension tracking
- Care instructions and warranty info

### **4. Revolutionary Chat Commerce System**
#### **Chat Interface:**
- Real-time messaging with Supabase
- Product context in conversations
- Typing indicators and read receipts
- Message status tracking
- Multi-media message support
- Voice message simulation
- Chat history and archiving

#### **"Sell" Command System:**
- Basic command: `sell 599`
- Advanced commands with variants: `sell 599 red L`
- Quantity handling: `sell 599 x2`
- Payment method preference: `sell 599 cod`
- Discount application: `sell 599 50off`
- Instant checkout generation
- Order context management
- Command parsing and validation

#### **Communication Features:**
- WhatsApp Business integration simulation
- SMS notifications for critical updates
- Email integration for detailed communications
- Auto-reply system with customizable messages
- Chat prioritization and filtering
- Bulk message operations

### **5. Complete Payment System**
#### **Virtual Banking Infrastructure:**
- Unique virtual account generation
- Custom UPI ID creation (@shopabell)
- QR code generation for payments
- Payment link creation and sharing

#### **Universal Payment Methods:**
- UPI (all apps: GPay, PhonePe, Paytm, BHIM, etc.)
- Bank transfers (IMPS, NEFT, RTGS)
- Debit/Credit cards with 3D secure
- Digital wallets (Paytm, MobiKwik, Amazon Pay)
- Cash on Delivery with extra charges
- Buy Now Pay Later (BNPL) integration

#### **Payment Processing:**
- Real-time payment verification
- Instant settlement simulation
- Payment status tracking
- Failed payment retry mechanism
- Refund and cancellation handling
- Transaction history and receipts
- Fee calculation and transparency

### **6. Automated Shipping System**
#### **Multi-Courier Integration:**
- Delhivery, BlueDart, DTDC, Xpressbees
- Ecom Express, India Post, Shadowfax
- Intelligent courier selection algorithm
- Rate comparison and optimization
- Service area validation

#### **Shipping Features:**
- Automatic AWB generation
- Shipping label creation and printing
- Pickup scheduling and management
- Real-time tracking with status updates
- Delivery attempt tracking
- Exception handling and resolution
- Bulk shipping operations
- COD collection management

#### **Shipping Arbitrage:**
- Bulk rate negotiations
- Margin calculation and optimization
- Transparent pricing for sellers
- Revenue generation through shipping

### **7. Order Management System**
#### **Order Processing:**
- Complete order lifecycle management
- Status tracking (pending → delivered)
- Automated inventory updates
- Customer communication at each stage
- Delivery proof capture
- Return and refund processing

#### **Order Features:**
- Multi-channel order consolidation
- Bulk order operations
- Order filtering and search
- Export capabilities
- Performance analytics
- Customer service integration

### **8. Analytics & Business Intelligence**
#### **Seller Dashboard Metrics:**
- Real-time revenue tracking
- Order count and status breakdown
- Customer acquisition metrics
- Product performance analysis
- Conversion rate optimization
- Peak selling time identification

#### **Advanced Analytics:**
- Livestream performance tracking
- Customer lifetime value calculation
- Inventory turnover analysis
- Seasonal trend identification
- Competitor benchmarking
- Profitability analysis

#### **Reporting Features:**
- Daily/weekly/monthly reports
- Exportable data formats
- Custom date range analysis
- Automated insights generation
- Performance recommendations
- Growth forecasting

### **9. Admin Partnership Program**
#### **Partnership Management:**
- Facebook group admin onboarding
- Referral code generation and tracking
- Commission structure management
- Performance tier system (Bronze to Platinum)

#### **Admin Dashboard:**
- Real-time referral tracking
- Commission calculation and payouts
- Performance analytics and leaderboards
- Marketing materials provision
- Training and support resources

#### **Revenue Sharing:**
- 0.5% base commission rate
- Tiered commission structure
- Monthly bonus eligibility
- Performance-based incentives

## **🛠️ Technical Features**

### **10. Authentication & Security**
- Phone number-based authentication
- OTP verification system
- Role-based access control (RBAC)
- JWT token management
- Session management and security
- Password-less login system
- Multi-factor authentication support

### **11. Database Architecture**
- 15+ optimized tables with proper relationships
- Row Level Security (RLS) policies
- Real-time subscriptions
- Automated backups and recovery
- Performance indexing
- Data encryption and privacy protection

### **12. Real-time Features**
- Live chat messaging
- Order status updates
- Inventory change notifications
- Analytics data streaming
- Typing indicators and presence
- Live collaboration features

### **13. File Management**
- Supabase Storage integration
- Image optimization and compression
- Multiple format support
- CDN delivery optimization
- Automatic thumbnail generation
- File size and format validation

### **14. API Architecture**
- RESTful API design
- Rate limiting and throttling
- Input validation and sanitization
- Error handling and logging
- API documentation and versioning
- Webhook support for integrations

## **🎨 User Experience Features**

### **15. Design System**
- Modern, trust-first design language
- Mobile-first responsive design
- Accessibility compliance (WCAG)
- Dark mode support preparation
- Custom color palette and typography
- Consistent component library

### **16. Mobile Optimization**
- Progressive Web App (PWA)
- Offline functionality
- Touch-friendly interface
- Bottom navigation for mobile
- Swipe gestures and interactions
- App-like experience

### **17. Multi-language Support**
- 10 Indian languages support
- Right-to-left (RTL) language preparation
- Voice input in regional languages
- Automatic language detection
- Localized number and currency formatting

### **18. Notification System**
- In-app notifications
- Push notification support
- SMS notifications for critical updates
- Email notifications for reports
- WhatsApp notifications integration
- Notification preferences management

## **🔧 Integration & Simulation Features**

### **19. Third-party Integrations (Simulated)**
- WhatsApp Business API simulation
- Decentro payment gateway simulation
- Shiprocket shipping API simulation
- SMS service provider simulation
- Email service integration preparation

### **20. Migration-Ready Architecture**
- Environment-based configuration
- Feature flag system for simulations
- API format compatibility
- Seamless service swapping capability
- Zero-downtime migration support

## **📊 Analytics & Monitoring**

### **21. Performance Monitoring**
- Page load time tracking
- API response time monitoring
- Error tracking and reporting
- User interaction analytics
- Core Web Vitals monitoring

### **22. Business Intelligence**
- Revenue forecasting
- Customer behavior analysis
- Product performance optimization
- Market trend identification
- Competitive analysis tools

## **🧪 Testing & Quality Assurance**

### **23. Comprehensive Testing**
- End-to-end user journey testing
- Component-level testing
- API integration testing
- Performance and load testing
- Security vulnerability testing
- Cross-browser compatibility testing
- Mobile device testing

### **24. Quality Control**
- Automated code quality checks
- Continuous integration pipeline
- Deployment automation
- Error monitoring and alerting
- Performance benchmarking

## **🚀 Deployment & DevOps**

### **25. Infrastructure**
- Vercel deployment configuration
- Supabase database and storage
- CDN optimization
- SSL certificate management
- Domain configuration
- Environment management

### **26. Scalability Features**
- Auto-scaling capabilities
- Database performance optimization
- Caching strategies implementation
- Load balancing preparation
- Microservices architecture readiness

## **📱 Progressive Web App Features**

### **27. PWA Capabilities**
- Offline functionality
- App installation prompts
- Background sync
- Push notifications
- App shortcuts and icons
- Splash screen customization

### **28. Cross-Platform Support**
- iOS Safari optimization
- Android Chrome optimization
- Desktop browser support
- Tablet interface adaptation
- Keyboard navigation support

---

## **📈 Business Features Summary**

### **Revenue Streams:**
- 3% transaction fee on all sales
- Shipping arbitrage (₹25 average per order)
- Premium subscription tiers
- Admin partnership commissions
- Payment infrastructure cross-selling

### **Growth Features:**
- Viral referral system
- Community-driven expansion
- Influencer partnership program
- Social media integration
- Content marketing tools

### **Trust & Safety:**
- Seller verification system
- Buyer protection guarantee
- Secure payment processing
- Order tracking and insurance
- Dispute resolution mechanism
- Customer support system

---

**Total Feature Count: 200+ features and sub-features** covering every aspect of building, deploying, and scaling a complete social commerce platform! 🚀
make sure the whole product is functional for demonstration and all the features and workflow are working and are exactly same the real - also add option of uploading recorded video to catalog
   feature in the livestream to catalog feature section - create and display demo accounts populate with fashion apparel and jewellery India specific realistic data