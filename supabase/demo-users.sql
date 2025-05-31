-- Demo users for ShopAbell testing
-- Run this in your Supabase SQL Editor

-- Insert demo users
INSERT INTO users (id, phone, name, email, role, is_verified, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', '+919876543210', 'Priya Sharma', 'priya@shopabell.demo', 'seller', true, NOW()),
('550e8400-e29b-41d4-a716-446655440002', '+919876543211', 'Rajesh Kumar', 'rajesh@shopabell.demo', 'seller', true, NOW()),
('550e8400-e29b-41d4-a716-446655440003', '+919876543212', 'Anita Verma', 'anita@shopabell.demo', 'seller', true, NOW()),
('550e8400-e29b-41d4-a716-446655440004', '+919876543220', 'Vikram Singh', 'vikram@shopabell.demo', 'buyer', true, NOW()),
('550e8400-e29b-41d4-a716-446655440005', '+919876543221', 'Meera Patel', 'meera@shopabell.demo', 'buyer', true, NOW()),
('550e8400-e29b-41d4-a716-446655440006', '+919876543200', 'Admin User', 'admin@shopabell.demo', 'admin', true, NOW())
ON CONFLICT (phone) DO NOTHING;

-- Insert demo sellers
INSERT INTO sellers (id, business_name, business_category, subscription_plan, is_verified, store_slug, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Fashion Junction', 'Fashion & Apparel', 'premium', true, 'fashion-junction', NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'Tech Mart', 'Electronics', 'basic', true, 'tech-mart', NOW()),
('550e8400-e29b-41d4-a716-446655440003', 'Healthy Bites', 'Food & Beverages', 'free', true, 'healthy-bites', NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert demo buyers
INSERT INTO buyers (id, delivery_address, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440004', '{"street": "123 Main St", "city": "Mumbai", "state": "Maharashtra", "pincode": "400001"}', NOW()),
('550e8400-e29b-41d4-a716-446655440005', '{"street": "456 Park Ave", "city": "Delhi", "state": "Delhi", "pincode": "110001"}', NOW())
ON CONFLICT (id) DO NOTHING;

-- Verify the data was inserted
SELECT 'Users inserted:' as info, count(*) as count FROM users WHERE phone LIKE '+91987654%';
SELECT 'Sellers inserted:' as info, count(*) as count FROM sellers WHERE id IN (
  SELECT id FROM users WHERE phone LIKE '+91987654%' AND role = 'seller'
);
SELECT 'Buyers inserted:' as info, count(*) as count FROM buyers WHERE id IN (
  SELECT id FROM users WHERE phone LIKE '+91987654%' AND role = 'buyer'
);