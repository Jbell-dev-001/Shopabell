-- ShopAbell Database Schema
-- Phone-based authentication system with comprehensive e-commerce features

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table with phone-based auth
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone VARCHAR(20) UNIQUE NOT NULL,
  country_code VARCHAR(5) DEFAULT '+91',
  is_verified BOOLEAN DEFAULT FALSE,
  business_name VARCHAR(255),
  owner_name VARCHAR(255),
  business_type VARCHAR(50),
  business_address JSONB,
  role VARCHAR(20) DEFAULT 'seller' CHECK (role IN ('seller', 'customer', 'admin')),
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- OTP management for phone verification
CREATE TABLE otp_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone VARCHAR(20) NOT NULL,
  otp VARCHAR(6) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  is_used BOOLEAN DEFAULT FALSE,
  attempts INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products with AI-extracted data support
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  image_url TEXT,
  category VARCHAR(100),
  stock_quantity INTEGER DEFAULT 0 CHECK (stock_quantity >= 0),
  ai_extracted_data JSONB,
  source VARCHAR(20) DEFAULT 'manual' CHECK (source IN ('manual', 'livestream', 'video', 'chat_command')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat conversations
CREATE TABLE chat_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(seller_id, customer_id)
);

-- Chat messages with sell command support
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'sell_command', 'order_update')),
  metadata JSONB,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders with comprehensive tracking
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(20) UNIQUE NOT NULL,
  seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  items JSONB NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL CHECK (subtotal >= 0),
  shipping_cost DECIMAL(10,2) DEFAULT 0 CHECK (shipping_cost >= 0),
  total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  payment_method VARCHAR(50),
  payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_transaction_id VARCHAR(100),
  shipping_address JSONB NOT NULL,
  tracking_number VARCHAR(100),
  shipping_provider VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ
);

-- Order status history for tracking
CREATE TABLE order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analytics events for business insights
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  event_type VARCHAR(50) NOT NULL,
  event_data JSONB,
  session_id VARCHAR(100),
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Partnership applications
CREATE TABLE partnership_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name VARCHAR(255) NOT NULL,
  contact_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  business_type VARCHAR(100),
  monthly_revenue VARCHAR(50),
  business_description TEXT,
  website_url VARCHAR(255),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- File uploads and media management
CREATE TABLE media_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  mime_type VARCHAR(100),
  file_type VARCHAR(20) CHECK (file_type IN ('image', 'video', 'document')),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Shipping rates and zones
CREATE TABLE shipping_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  states JSONB NOT NULL, -- Array of state codes
  base_rate DECIMAL(8,2) NOT NULL CHECK (base_rate >= 0),
  per_kg_rate DECIMAL(8,2) DEFAULT 0 CHECK (per_kg_rate >= 0),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Product categories for better organization
CREATE TABLE product_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES product_categories(id),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_business_type ON users(business_type);
CREATE INDEX idx_otp_phone_expires ON otp_verifications(phone, expires_at);
CREATE INDEX idx_products_user_active ON products(user_id, is_active);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_chat_messages_conversation ON chat_messages(conversation_id, created_at);
CREATE INDEX idx_orders_seller ON orders(seller_id, created_at);
CREATE INDEX idx_orders_customer ON orders(customer_id, created_at);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_analytics_user_type ON analytics_events(user_id, event_type, created_at);

-- Functions and triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate order numbers
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
BEGIN
    RETURN 'ORD-' || UPPER(ENCODE(GEN_RANDOM_BYTES(4), 'hex')) || '-' || 
           TO_CHAR(NOW(), 'YYYYMMDD');
END;
$$ LANGUAGE plpgsql;

-- Function to clean expired OTPs
CREATE OR REPLACE FUNCTION cleanup_expired_otps()
RETURNS void AS $$
BEGIN
    DELETE FROM otp_verifications 
    WHERE expires_at < NOW() - INTERVAL '1 day';
END;
$$ LANGUAGE plpgsql;

-- Insert default categories
INSERT INTO product_categories (name, description) VALUES
  ('Fashion', 'Clothing, footwear, and accessories'),
  ('Jewelry', 'Rings, necklaces, earrings, and precious items'),
  ('Electronics', 'Phones, laptops, gadgets, and electronic accessories'),
  ('Home Decor', 'Furniture, decorative items, and home accessories'),
  ('Food & Beverages', 'Packaged foods, beverages, and snacks'),
  ('Beauty & Health', 'Cosmetics, skincare, and health products'),
  ('Sports & Fitness', 'Sports equipment, fitness gear, and outdoor items'),
  ('Books & Education', 'Books, educational materials, and stationery'),
  ('Toys & Games', 'Children toys, games, and entertainment'),
  ('Other', 'Miscellaneous products');

-- Insert default shipping zones (Indian states)
INSERT INTO shipping_zones (name, states, base_rate, per_kg_rate) VALUES
  ('Metro Cities', '["DL", "MH", "KA", "TN", "WB"]', 50.00, 20.00),
  ('Tier 1 Cities', '["GJ", "RJ", "UP", "MP", "HR", "PB"]', 75.00, 25.00),
  ('Tier 2 Cities', '["OR", "JH", "CG", "UK", "HP", "JK"]', 100.00, 30.00),
  ('Remote Areas', '["NE", "AR", "AS", "MN", "MZ", "NL", "SK", "TR"]', 150.00, 40.00);

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can only see and update their own data
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid()::text = id::text);

-- Products: owners can manage, others can view active products
CREATE POLICY "Product owners can manage" ON products
    FOR ALL USING (auth.uid()::text = user_id::text);

CREATE POLICY "Anyone can view active products" ON products
    FOR SELECT USING (is_active = true);

-- Chat: participants can view and send messages
CREATE POLICY "Chat participants can view conversations" ON chat_conversations
    FOR SELECT USING (
        auth.uid()::text = seller_id::text OR 
        auth.uid()::text = customer_id::text
    );

CREATE POLICY "Chat participants can view messages" ON chat_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM chat_conversations 
            WHERE id = conversation_id 
            AND (seller_id::text = auth.uid()::text OR customer_id::text = auth.uid()::text)
        )
    );

-- Orders: sellers and customers can view their orders
CREATE POLICY "Order participants can view" ON orders
    FOR SELECT USING (
        auth.uid()::text = seller_id::text OR 
        auth.uid()::text = customer_id::text
    );

-- Analytics: users can view their own events
CREATE POLICY "Users can view own analytics" ON analytics_events
    FOR SELECT USING (auth.uid()::text = user_id::text);