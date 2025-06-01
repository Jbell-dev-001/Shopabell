-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create enum types
CREATE TYPE user_role AS ENUM ('seller', 'buyer', 'admin', 'group_admin');
CREATE TYPE subscription_plan AS ENUM ('free', 'basic', 'premium');
CREATE TYPE verification_status AS ENUM ('pending', 'verified', 'rejected');
CREATE TYPE product_source AS ENUM ('manual', 'livestream', 'import', 'whatsapp', 'social');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded', 'cancelled');
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'processing', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned');
CREATE TYPE created_via AS ENUM ('chat', 'direct_buy', 'whatsapp', 'app', 'website');
CREATE TYPE return_status AS ENUM ('not_requested', 'requested', 'approved', 'rejected', 'picked_up', 'refunded');
CREATE TYPE cod_status AS ENUM ('pending', 'collected', 'failed');
CREATE TYPE chat_type AS ENUM ('product_inquiry', 'order_support', 'general');
CREATE TYPE chat_status AS ENUM ('active', 'archived', 'order_created', 'resolved');
CREATE TYPE priority_level AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE livestream_status AS ENUM ('scheduled', 'recording', 'processing', 'completed', 'cancelled');
CREATE TYPE livestream_platform AS ENUM ('facebook', 'instagram', 'youtube', 'whatsapp_status');
CREATE TYPE shipping_status AS ENUM ('created', 'picked_up', 'in_transit', 'delivered', 'returned', 'cancelled');
CREATE TYPE onboarding_step AS ENUM ('verification', 'business_details', 'store_setup', 'first_product', 'completed');

-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255),
    email VARCHAR(255),
    role user_role DEFAULT 'buyer' NOT NULL,
    language_preference VARCHAR(10) DEFAULT 'en' NOT NULL,
    profile_image TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_active TIMESTAMPTZ,
    is_verified BOOLEAN DEFAULT FALSE NOT NULL,
    verification_documents JSONB,
    device_info JSONB,
    timezone VARCHAR(50),
    app_version VARCHAR(20)
);

-- Create onboarding_sessions table
CREATE TABLE onboarding_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    step onboarding_step NOT NULL,
    data JSONB DEFAULT '{}' NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create sellers table
CREATE TABLE sellers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone VARCHAR(20) UNIQUE NOT NULL,
    business_name VARCHAR(255) NOT NULL,
    business_type VARCHAR(100) NOT NULL,
    owner_name VARCHAR(255) NOT NULL,
    business_address TEXT NOT NULL,
    gst_number VARCHAR(30),
    bank_account_number VARCHAR(50) NOT NULL,
    ifsc_code VARCHAR(15) NOT NULL,
    pan_number VARCHAR(20) NOT NULL,
    store_name VARCHAR(255) NOT NULL,
    store_description TEXT,
    store_logo TEXT,
    store_slug VARCHAR(100) UNIQUE,
    upi_id VARCHAR(100),
    virtual_account_number VARCHAR(20),
    virtual_upi_id VARCHAR(100),
    subscription_plan subscription_plan DEFAULT 'free' NOT NULL,
    subscription_expires DATE,
    subscription_payment_history JSONB,
    onboarding_completed BOOLEAN DEFAULT FALSE NOT NULL,
    onboarding_completed_at TIMESTAMPTZ,
    verification_status verification_status DEFAULT 'pending' NOT NULL,
    store_theme VARCHAR(50) DEFAULT 'default' NOT NULL,
    store_settings JSONB,
    business_hours JSONB,
    auto_reply_enabled BOOLEAN DEFAULT FALSE NOT NULL,
    auto_reply_message TEXT,
    commission_rate DECIMAL(5,2) DEFAULT 3.0 NOT NULL,
    total_sales DECIMAL(12,2) DEFAULT 0 NOT NULL,
    total_orders INTEGER DEFAULT 0 NOT NULL,
    rating DECIMAL(3,2) DEFAULT 0 NOT NULL,
    review_count INTEGER DEFAULT 0 NOT NULL,
    last_live_session TIMESTAMPTZ,
    preferred_couriers JSONB,
    shipping_settings JSONB,
    tax_settings JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create stores table
CREATE TABLE stores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    logo_url TEXT,
    banner_url TEXT,
    theme VARCHAR(50) DEFAULT 'default' NOT NULL,
    settings JSONB DEFAULT '{}' NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create buyers table
CREATE TABLE buyers (
    id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    default_address JSONB,
    saved_addresses JSONB,
    payment_methods JSONB,
    wishlist UUID[],
    order_history_count INTEGER DEFAULT 0 NOT NULL,
    total_spent DECIMAL(12,2) DEFAULT 0 NOT NULL,
    loyalty_points INTEGER DEFAULT 0 NOT NULL,
    preferred_categories JSONB,
    last_order_date DATE,
    notification_preferences JSONB
);

-- Create categories table
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    parent_id UUID REFERENCES categories(id),
    description TEXT,
    image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    sort_order INTEGER DEFAULT 0 NOT NULL,
    commission_rate DECIMAL(5,2) DEFAULT 5.0 NOT NULL,
    product_count INTEGER DEFAULT 0 NOT NULL
);

-- Create products table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    short_description VARCHAR(500),
    price DECIMAL(10,2) NOT NULL,
    original_price DECIMAL(10,2),
    cost_price DECIMAL(10,2),
    images JSONB,
    variants JSONB,
    stock_quantity INTEGER DEFAULT 0 NOT NULL,
    reserved_stock INTEGER DEFAULT 0 NOT NULL,
    low_stock_threshold INTEGER DEFAULT 5 NOT NULL,
    category VARCHAR(100),
    subcategory VARCHAR(100),
    tags JSONB,
    brand VARCHAR(100),
    model VARCHAR(100),
    weight DECIMAL(10,3),
    dimensions JSONB,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    is_featured BOOLEAN DEFAULT FALSE NOT NULL,
    created_from product_source DEFAULT 'manual' NOT NULL,
    livestream_session_id UUID,
    source_timestamp INTEGER,
    source_url TEXT,
    seo_title VARCHAR(255),
    seo_description TEXT,
    meta_keywords JSONB,
    view_count INTEGER DEFAULT 0 NOT NULL,
    like_count INTEGER DEFAULT 0 NOT NULL,
    share_count INTEGER DEFAULT 0 NOT NULL,
    conversion_rate DECIMAL(5,2) DEFAULT 0 NOT NULL,
    last_sold_at TIMESTAMPTZ,
    featured_until TIMESTAMPTZ,
    discount_percentage DECIMAL(5,2),
    discount_start_date DATE,
    discount_end_date DATE,
    shipping_cost DECIMAL(10,2),
    cod_available BOOLEAN DEFAULT TRUE NOT NULL,
    return_policy TEXT,
    warranty_info TEXT,
    care_instructions TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create product_variants table
CREATE TABLE product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    variant_type VARCHAR(50) NOT NULL,
    variant_value VARCHAR(100) NOT NULL,
    price_adjustment DECIMAL(10,2) DEFAULT 0 NOT NULL,
    stock_quantity INTEGER DEFAULT 0 NOT NULL,
    sku VARCHAR(100) UNIQUE,
    image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE NOT NULL
);

-- Create livestream_sessions table
CREATE TABLE livestream_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
    session_name VARCHAR(255) NOT NULL,
    session_description TEXT,
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    scheduled_start TIMESTAMPTZ,
    status livestream_status DEFAULT 'scheduled' NOT NULL,
    platform livestream_platform NOT NULL,
    platform_url TEXT,
    total_products_captured INTEGER DEFAULT 0 NOT NULL,
    screenshots_count INTEGER DEFAULT 0 NOT NULL,
    processing_progress INTEGER DEFAULT 0 NOT NULL,
    viewer_count INTEGER DEFAULT 0 NOT NULL,
    peak_viewers INTEGER DEFAULT 0 NOT NULL,
    total_orders INTEGER DEFAULT 0 NOT NULL,
    total_revenue DECIMAL(12,2) DEFAULT 0 NOT NULL,
    engagement_rate DECIMAL(5,2) DEFAULT 0 NOT NULL,
    conversion_rate DECIMAL(5,2) DEFAULT 0 NOT NULL,
    recording_file_url TEXT,
    thumbnail_url TEXT,
    ai_processing_logs JSONB,
    session_settings JSONB,
    pinned_comment TEXT,
    chat_logs JSONB
);

-- Create livestream_products table
CREATE TABLE livestream_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES livestream_sessions(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    timestamp INTEGER NOT NULL,
    duration_shown INTEGER,
    screenshot_url TEXT,
    ai_confidence_score DECIMAL(3,2),
    manual_verification BOOLEAN DEFAULT FALSE NOT NULL,
    orders_generated INTEGER DEFAULT 0 NOT NULL,
    views_during_show INTEGER DEFAULT 0 NOT NULL
);

-- Create orders table
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(20) UNIQUE NOT NULL,
    buyer_id UUID NOT NULL REFERENCES buyers(id),
    seller_id UUID NOT NULL REFERENCES sellers(id),
    product_id UUID NOT NULL REFERENCES products(id),
    variant_id UUID REFERENCES product_variants(id),
    quantity INTEGER DEFAULT 1 NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) DEFAULT 0 NOT NULL,
    shipping_cost DECIMAL(10,2) DEFAULT 0 NOT NULL,
    tax_amount DECIMAL(10,2) DEFAULT 0 NOT NULL,
    platform_fee DECIMAL(10,2) DEFAULT 0 NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    payment_status payment_status DEFAULT 'pending' NOT NULL,
    payment_transaction_id VARCHAR(100),
    payment_gateway VARCHAR(50),
    shipping_address JSONB NOT NULL,
    billing_address JSONB,
    order_status order_status DEFAULT 'pending' NOT NULL,
    tracking_number VARCHAR(100),
    courier_partner VARCHAR(50),
    estimated_delivery DATE,
    actual_delivery TIMESTAMPTZ,
    chat_context JSONB,
    created_via created_via DEFAULT 'app' NOT NULL,
    seller_notes TEXT,
    buyer_notes TEXT,
    cancellation_reason TEXT,
    return_reason TEXT,
    return_status return_status,
    delivery_attempts INTEGER DEFAULT 0 NOT NULL,
    cod_amount DECIMAL(10,2),
    cod_collection_status cod_status,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    review_images JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create chats table
CREATE TABLE chats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    buyer_id UUID NOT NULL REFERENCES buyers(id),
    seller_id UUID NOT NULL REFERENCES sellers(id),
    product_id UUID REFERENCES products(id),
    order_id UUID REFERENCES orders(id),
    chat_type chat_type DEFAULT 'general' NOT NULL,
    messages JSONB DEFAULT '[]'::jsonb NOT NULL,
    last_message_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_message_by UUID NOT NULL REFERENCES users(id),
    status chat_status DEFAULT 'active' NOT NULL,
    unread_count_buyer INTEGER DEFAULT 0 NOT NULL,
    unread_count_seller INTEGER DEFAULT 0 NOT NULL,
    is_starred BOOLEAN DEFAULT FALSE NOT NULL,
    priority priority_level DEFAULT 'medium' NOT NULL,
    auto_replies_count INTEGER DEFAULT 0 NOT NULL,
    human_intervention_required BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create chat_messages table for better performance
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id),
    message_type VARCHAR(20) DEFAULT 'text' NOT NULL,
    content TEXT NOT NULL,
    media_url TEXT,
    metadata JSONB,
    is_read BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    edited_at TIMESTAMPTZ,
    reply_to_message_id UUID REFERENCES chat_messages(id)
);

-- Create admin_partnerships table
CREATE TABLE admin_partnerships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_user_id UUID NOT NULL REFERENCES users(id),
    group_name VARCHAR(255) NOT NULL,
    group_platform VARCHAR(50) NOT NULL,
    group_url TEXT,
    group_member_count INTEGER DEFAULT 0 NOT NULL,
    referral_code VARCHAR(20) UNIQUE NOT NULL,
    commission_rate DECIMAL(5,2) DEFAULT 0.5 NOT NULL,
    total_referrals INTEGER DEFAULT 0 NOT NULL,
    active_referrals INTEGER DEFAULT 0 NOT NULL,
    total_gmv DECIMAL(12,2) DEFAULT 0 NOT NULL,
    total_commission_earned DECIMAL(12,2) DEFAULT 0 NOT NULL,
    pending_commission DECIMAL(12,2) DEFAULT 0 NOT NULL,
    paid_commission DECIMAL(12,2) DEFAULT 0 NOT NULL,
    last_payout_date DATE,
    payout_method VARCHAR(50),
    payout_details JSONB,
    status VARCHAR(20) DEFAULT 'active' NOT NULL,
    performance_tier VARCHAR(20) DEFAULT 'bronze' NOT NULL,
    bonus_eligibility BOOLEAN DEFAULT FALSE NOT NULL,
    monthly_targets JSONB,
    marketing_materials_access BOOLEAN DEFAULT TRUE NOT NULL
);

-- Create notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    channels JSONB DEFAULT '["app"]'::jsonb NOT NULL,
    is_read BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    read_at TIMESTAMPTZ,
    action_url TEXT,
    expires_at TIMESTAMPTZ
);

-- Create analytics_events table
CREATE TABLE analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    session_id VARCHAR(100),
    event_type VARCHAR(100) NOT NULL,
    event_data JSONB,
    page_url TEXT,
    referrer TEXT,
    user_agent TEXT,
    ip_address INET,
    device_type VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create inventory_logs table
CREATE TABLE inventory_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id),
    variant_id UUID REFERENCES product_variants(id),
    change_type VARCHAR(50) NOT NULL,
    quantity_before INTEGER NOT NULL,
    quantity_after INTEGER NOT NULL,
    quantity_changed INTEGER NOT NULL,
    reason VARCHAR(255),
    reference_id UUID,
    changed_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    notes TEXT
);

-- Create shipping_rates table
CREATE TABLE shipping_rates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    courier_partner VARCHAR(50) NOT NULL,
    service_type VARCHAR(50) NOT NULL,
    zone VARCHAR(50) NOT NULL,
    weight_from DECIMAL(10,3) NOT NULL,
    weight_to DECIMAL(10,3) NOT NULL,
    rate DECIMAL(10,2) NOT NULL,
    cod_charges DECIMAL(10,2) DEFAULT 0 NOT NULL,
    fuel_surcharge DECIMAL(5,2) DEFAULT 0 NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    effective_from DATE NOT NULL,
    effective_to DATE
);

-- Create payment_transactions table
CREATE TABLE payment_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id),
    transaction_id VARCHAR(100) UNIQUE NOT NULL,
    gateway_transaction_id VARCHAR(100),
    payment_method VARCHAR(50) NOT NULL,
    gateway VARCHAR(50) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR' NOT NULL,
    status payment_status DEFAULT 'pending' NOT NULL,
    gateway_response JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    completed_at TIMESTAMPTZ,
    refund_amount DECIMAL(10,2),
    refund_reason TEXT,
    fees DECIMAL(10,2) DEFAULT 0 NOT NULL
);

-- Create reviews_and_ratings table
CREATE TABLE reviews_and_ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id),
    product_id UUID NOT NULL REFERENCES products(id),
    buyer_id UUID NOT NULL REFERENCES buyers(id),
    seller_id UUID NOT NULL REFERENCES sellers(id),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    review_images JSONB,
    review_videos JSONB,
    is_verified_purchase BOOLEAN DEFAULT TRUE NOT NULL,
    helpful_count INTEGER DEFAULT 0 NOT NULL,
    reported_count INTEGER DEFAULT 0 NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' NOT NULL,
    seller_response TEXT,
    seller_response_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create coupons_and_offers table
CREATE TABLE coupons_and_offers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID REFERENCES sellers(id),
    code VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    discount_type VARCHAR(20) NOT NULL,
    discount_value DECIMAL(10,2) NOT NULL,
    minimum_order_value DECIMAL(10,2) DEFAULT 0 NOT NULL,
    maximum_discount DECIMAL(10,2),
    usage_limit_total INTEGER,
    usage_limit_per_user INTEGER DEFAULT 1 NOT NULL,
    used_count INTEGER DEFAULT 0 NOT NULL,
    valid_from TIMESTAMPTZ NOT NULL,
    valid_until TIMESTAMPTZ NOT NULL,
    applicable_products UUID[],
    applicable_categories JSONB,
    applicable_to VARCHAR(20) DEFAULT 'all' NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_by UUID NOT NULL REFERENCES users(id)
);

-- Create wishlist table
CREATE TABLE wishlist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    buyer_id UUID NOT NULL REFERENCES buyers(id),
    product_id UUID NOT NULL REFERENCES products(id),
    added_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    price_when_added DECIMAL(10,2) NOT NULL,
    notify_price_drop BOOLEAN DEFAULT TRUE NOT NULL,
    notify_back_in_stock BOOLEAN DEFAULT TRUE NOT NULL,
    UNIQUE(buyer_id, product_id)
);

-- Create cart table
CREATE TABLE cart (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    buyer_id UUID NOT NULL REFERENCES buyers(id),
    product_id UUID NOT NULL REFERENCES products(id),
    variant_id UUID REFERENCES product_variants(id),
    quantity INTEGER DEFAULT 1 NOT NULL,
    added_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE(buyer_id, product_id, variant_id)
);

-- Create indexes for performance
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_sellers_store_slug ON sellers(store_slug);
CREATE INDEX idx_products_seller_id ON products(seller_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_active_category ON products(is_active, category);
CREATE INDEX idx_products_featured ON products(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_orders_buyer_id ON orders(buyer_id);
CREATE INDEX idx_orders_seller_id ON orders(seller_id);
CREATE INDEX idx_orders_status ON orders(order_status);
CREATE INDEX idx_orders_status_created ON orders(order_status, created_at);
CREATE INDEX idx_chats_buyer_seller ON chats(buyer_id, seller_id);
CREATE INDEX idx_chat_messages_chat_id ON chat_messages(chat_id);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX idx_analytics_events_user_type ON analytics_events(user_id, event_type);
CREATE INDEX idx_wishlist_buyer_product ON wishlist(buyer_id, product_id);
CREATE INDEX idx_cart_buyer ON cart(buyer_id);

-- Create update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update timestamp trigger to relevant tables
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_chats_updated_at BEFORE UPDATE ON chats FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cart_updated_at BEFORE UPDATE ON cart FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE buyers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can view their own data
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid() = id);

-- Sellers can manage their own data
CREATE POLICY "Sellers can view own data" ON sellers FOR SELECT USING (id = auth.uid());
CREATE POLICY "Sellers can update own data" ON sellers FOR UPDATE USING (id = auth.uid());
CREATE POLICY "Sellers can manage own products" ON products FOR ALL USING (seller_id = auth.uid());

-- Buyers can view their own data
CREATE POLICY "Buyers can view own data" ON buyers FOR SELECT USING (id = auth.uid());
CREATE POLICY "Buyers can update own data" ON buyers FOR UPDATE USING (id = auth.uid());
CREATE POLICY "Buyers can view all active products" ON products FOR SELECT USING (is_active = TRUE);

-- Orders visible to buyer and seller
CREATE POLICY "Orders visible to buyer and seller" ON orders FOR SELECT USING (buyer_id = auth.uid() OR seller_id = auth.uid());
CREATE POLICY "Buyers can create orders" ON orders FOR INSERT WITH CHECK (buyer_id = auth.uid());
CREATE POLICY "Order updates by buyer or seller" ON orders FOR UPDATE USING (buyer_id = auth.uid() OR seller_id = auth.uid());

-- Chats visible to participants
CREATE POLICY "Chats visible to participants" ON chats FOR SELECT USING (buyer_id = auth.uid() OR seller_id = auth.uid());
CREATE POLICY "Chat messages visible to participants" ON chat_messages FOR SELECT USING (
    chat_id IN (SELECT id FROM chats WHERE buyer_id = auth.uid() OR seller_id = auth.uid())
);

-- Notifications visible to recipient
CREATE POLICY "Notifications visible to recipient" ON notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (user_id = auth.uid());

-- Wishlist and cart policies
CREATE POLICY "Wishlist visible to owner" ON wishlist FOR ALL USING (buyer_id = auth.uid());
CREATE POLICY "Cart visible to owner" ON cart FOR ALL USING (buyer_id = auth.uid());

-- Create shipping_labels table
CREATE TABLE shipping_labels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    tracking_number VARCHAR(50) UNIQUE NOT NULL,
    courier_id VARCHAR(50) NOT NULL,
    courier_name VARCHAR(100) NOT NULL,
    service_type VARCHAR(50) NOT NULL,
    from_address JSONB NOT NULL,
    to_address JSONB NOT NULL,
    package_weight DECIMAL(10,2) NOT NULL,
    shipping_cost DECIMAL(10,2) NOT NULL,
    cod_amount DECIMAL(10,2),
    label_url TEXT NOT NULL,
    status shipping_status DEFAULT 'created' NOT NULL,
    estimated_delivery_days INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Add shipping tracking fields to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_number VARCHAR(50);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_status VARCHAR(50) DEFAULT 'pending';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_cost DECIMAL(10,2) DEFAULT 0;

-- Create indexes for shipping
CREATE INDEX idx_shipping_labels_order_id ON shipping_labels(order_id);
CREATE INDEX idx_shipping_labels_tracking_number ON shipping_labels(tracking_number);
CREATE INDEX idx_shipping_labels_status ON shipping_labels(status);
CREATE INDEX idx_orders_tracking_number ON orders(tracking_number);

-- Enable RLS for shipping tables
ALTER TABLE shipping_labels ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for shipping
CREATE POLICY "Shipping labels visible to order participants" ON shipping_labels FOR SELECT USING (
    order_id IN (SELECT id FROM orders WHERE buyer_id = auth.uid() OR seller_id = auth.uid())
);
CREATE POLICY "Sellers can manage shipping labels" ON shipping_labels FOR ALL USING (
    order_id IN (SELECT id FROM orders WHERE seller_id = auth.uid())
);

-- Create function to update shipping label timestamps
CREATE OR REPLACE FUNCTION update_shipping_label_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language plpgsql;

-- Create trigger for shipping label updates
CREATE TRIGGER update_shipping_labels_updated_at
    BEFORE UPDATE ON shipping_labels
    FOR EACH ROW
    EXECUTE FUNCTION update_shipping_label_updated_at();

-- Create partnership_applications table
CREATE TABLE partnership_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    business_type VARCHAR(50) CHECK (business_type IN ('individual', 'small_business', 'enterprise', 'influencer')) NOT NULL,
    business_category VARCHAR(100) NOT NULL,
    business_description TEXT NOT NULL,
    website_url TEXT,
    social_media_links JSONB DEFAULT '{}',
    expected_monthly_sales DECIMAL(12,2) NOT NULL DEFAULT 0,
    commission_preference INTEGER NOT NULL DEFAULT 3,
    referral_code VARCHAR(50),
    documents JSONB DEFAULT '{}',
    status VARCHAR(20) CHECK (status IN ('pending', 'under_review', 'approved', 'rejected')) DEFAULT 'pending',
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    reviewed_at TIMESTAMPTZ,
    reviewed_by VARCHAR(255)
);

-- Create partners table
CREATE TABLE partners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    partnership_application_id UUID NOT NULL REFERENCES partnership_applications(id) ON DELETE CASCADE,
    partner_code VARCHAR(50) UNIQUE NOT NULL,
    commission_rate DECIMAL(5,2) NOT NULL DEFAULT 2.0,
    tier VARCHAR(20) CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')) DEFAULT 'bronze',
    total_sales DECIMAL(12,2) NOT NULL DEFAULT 0,
    total_commission DECIMAL(12,2) NOT NULL DEFAULT 0,
    monthly_sales DECIMAL(12,2) NOT NULL DEFAULT 0,
    referral_count INTEGER NOT NULL DEFAULT 0,
    performance_score INTEGER NOT NULL DEFAULT 100,
    features_enabled JSONB DEFAULT '{
        "advanced_analytics": false,
        "priority_support": false,
        "custom_branding": false,
        "api_access": false,
        "bulk_operations": false
    }',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create commission_payments table
CREATE TABLE commission_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    amount DECIMAL(10,2) NOT NULL,
    commission_rate DECIMAL(5,2) NOT NULL,
    status VARCHAR(20) CHECK (status IN ('pending', 'paid', 'cancelled')) DEFAULT 'pending',
    payment_method VARCHAR(50),
    payment_reference VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    paid_at TIMESTAMPTZ
);

-- Add referral tracking to orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS referred_by VARCHAR(50);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS partner_commission DECIMAL(10,2) DEFAULT 0;

-- Create indexes for partnerships
CREATE INDEX idx_partnership_applications_status ON partnership_applications(status);
CREATE INDEX idx_partnership_applications_created_at ON partnership_applications(created_at);
CREATE INDEX idx_partners_tier ON partners(tier);
CREATE INDEX idx_partners_partner_code ON partners(partner_code);
CREATE INDEX idx_partners_total_sales ON partners(total_sales);
CREATE INDEX idx_commission_payments_partner_id ON commission_payments(partner_id);
CREATE INDEX idx_commission_payments_status ON commission_payments(status);
CREATE INDEX idx_orders_referred_by ON orders(referred_by);

-- Enable RLS for partnership tables
ALTER TABLE partnership_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE commission_payments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for partnerships
CREATE POLICY "Partnership applications viewable by applicant and admin" ON partnership_applications 
    FOR SELECT USING (email = auth.jwt() ->> 'email' OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Anyone can submit partnership applications" ON partnership_applications 
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Only admins can update partnership applications" ON partnership_applications 
    FOR UPDATE USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Partners can view their own data" ON partners 
    FOR SELECT USING (
        partnership_application_id IN (
            SELECT id FROM partnership_applications 
            WHERE email = auth.jwt() ->> 'email'
        ) OR auth.jwt() ->> 'role' = 'admin'
    );

CREATE POLICY "Commission payments visible to partner and admin" ON commission_payments 
    FOR SELECT USING (
        partner_id IN (
            SELECT p.id FROM partners p
            JOIN partnership_applications pa ON p.partnership_application_id = pa.id
            WHERE pa.email = auth.jwt() ->> 'email'
        ) OR auth.jwt() ->> 'role' = 'admin'
    );

-- Create function to update partner stats
CREATE OR REPLACE FUNCTION update_partner_stats()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language plpgsql;

-- Create trigger for partner updates
CREATE TRIGGER update_partners_updated_at
    BEFORE UPDATE ON partners
    FOR EACH ROW
    EXECUTE FUNCTION update_partner_stats();