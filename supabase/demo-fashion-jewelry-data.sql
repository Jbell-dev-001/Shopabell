-- Create demo seller accounts with Indian fashion and jewelry data
-- Password for all demo accounts: Demo123!

-- Create demo users
INSERT INTO users (id, phone, name, email, role, language_preference, is_verified, timezone) VALUES
-- Fashion Sellers
('11111111-1111-1111-1111-111111111111', '+919876543210', 'Priya Fashion House', 'priya@shopabell.demo', 'seller', 'en', true, 'Asia/Kolkata'),
('22222222-2222-2222-2222-222222222222', '+919876543211', 'Ananya Boutique', 'ananya@shopabell.demo', 'seller', 'en', true, 'Asia/Kolkata'),
('33333333-3333-3333-3333-333333333333', '+919876543212', 'Kavya Ethnic Wear', 'kavya@shopabell.demo', 'seller', 'hi', true, 'Asia/Kolkata'),
-- Jewelry Sellers
('44444444-4444-4444-4444-444444444444', '+919876543213', 'Lakshmi Jewellers', 'lakshmi@shopabell.demo', 'seller', 'en', true, 'Asia/Kolkata'),
('55555555-5555-5555-5555-555555555555', '+919876543214', 'Royal Gems', 'royal@shopabell.demo', 'seller', 'en', true, 'Asia/Kolkata'),
('66666666-6666-6666-6666-666666666666', '+919876543215', 'Sona Jewels', 'sona@shopabell.demo', 'seller', 'hi', true, 'Asia/Kolkata'),
-- Mixed Fashion & Jewelry
('77777777-7777-7777-7777-777777777777', '+919876543216', 'Meera Collections', 'meera@shopabell.demo', 'seller', 'en', true, 'Asia/Kolkata');

-- Create seller profiles
INSERT INTO sellers (
  id, business_name, business_category, upi_id, bank_account, ifsc_code, 
  pickup_address, onboarding_completed, verification_status, store_slug, 
  store_theme, commission_rate, total_sales, total_orders, rating
) VALUES
-- Priya Fashion House
('11111111-1111-1111-1111-111111111111', 'Priya Fashion House', 'Fashion & Clothing', 
'priya.fashion@paytm', '1234567890', 'HDFC0001234',
'{"address_line1": "Shop No. 45, Karol Bagh Market", "address_line2": "Near Metro Station", "city": "New Delhi", "state": "Delhi", "pincode": "110005", "phone": "+919876543210"}',
true, 'verified', 'priya-fashion', 'modern', 2.5, 2500000.00, 850, 4.8),

-- Ananya Boutique
('22222222-2222-2222-2222-222222222222', 'Ananya Boutique', 'Fashion & Clothing',
'ananya.boutique@gpay', '2345678901', 'ICIC0001234',
'{"address_line1": "Brigade Road", "address_line2": "Commercial Street", "city": "Bangalore", "state": "Karnataka", "pincode": "560001", "phone": "+919876543211"}',
true, 'verified', 'ananya-boutique', 'elegant', 2.5, 1800000.00, 620, 4.7),

-- Kavya Ethnic Wear
('33333333-3333-3333-3333-333333333333', 'Kavya Ethnic Wear', 'Fashion & Clothing',
'kavya.ethnic@phonepe', '3456789012', 'SBIN0001234',
'{"address_line1": "Chandni Chowk", "address_line2": "Old Delhi", "city": "Delhi", "state": "Delhi", "pincode": "110006", "phone": "+919876543212"}',
true, 'verified', 'kavya-ethnic', 'traditional', 2.5, 3200000.00, 1100, 4.9),

-- Lakshmi Jewellers
('44444444-4444-4444-4444-444444444444', 'Lakshmi Jewellers', 'Jewelry & Accessories',
'lakshmi.jewels@paytm', '4567890123', 'HDFC0005678',
'{"address_line1": "Zaveri Bazaar", "address_line2": "Kalbadevi", "city": "Mumbai", "state": "Maharashtra", "pincode": "400002", "phone": "+919876543213"}',
true, 'verified', 'lakshmi-jewellers', 'luxury', 3.0, 5500000.00, 450, 4.9),

-- Royal Gems
('55555555-5555-5555-5555-555555555555', 'Royal Gems', 'Jewelry & Accessories',
'royal.gems@gpay', '5678901234', 'AXIS0001234',
'{"address_line1": "Jubilee Hills", "address_line2": "Road No. 36", "city": "Hyderabad", "state": "Telangana", "pincode": "500033", "phone": "+919876543214"}',
true, 'verified', 'royal-gems', 'premium', 3.0, 4200000.00, 380, 4.8),

-- Sona Jewels
('66666666-6666-6666-6666-666666666666', 'Sona Jewels', 'Jewelry & Accessories',
'sona.jewels@phonepe', '6789012345', 'ICIC0009876',
'{"address_line1": "Johari Bazaar", "address_line2": "Pink City", "city": "Jaipur", "state": "Rajasthan", "pincode": "302001", "phone": "+919876543215"}',
true, 'verified', 'sona-jewels', 'traditional', 3.0, 3800000.00, 520, 4.7),

-- Meera Collections
('77777777-7777-7777-7777-777777777777', 'Meera Collections', 'Fashion & Jewelry',
'meera.collections@paytm', '7890123456', 'SBIN0009876',
'{"address_line1": "MG Road", "address_line2": "Near City Mall", "city": "Pune", "state": "Maharashtra", "pincode": "411001", "phone": "+919876543216"}',
true, 'verified', 'meera-collections', 'modern', 2.8, 2900000.00, 720, 4.8);

-- Create products for Fashion Sellers

-- Priya Fashion House Products
INSERT INTO products (
  id, seller_id, name, description, short_description, price, original_price,
  images, stock_quantity, category, subcategory, tags, is_active, is_featured,
  created_from, view_count, rating, cod_available
) VALUES
-- Sarees
('p1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111',
'Banarasi Silk Saree - Royal Blue', 
'Exquisite handwoven Banarasi silk saree with intricate gold zari work. Perfect for weddings and special occasions. The saree features traditional motifs and a rich pallu design.',
'Premium Banarasi silk saree with gold zari',
8999, 12999,
'["https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&h=400&fit=crop"]',
15, 'Fashion & Clothing', 'Sarees', '["banarasi", "silk", "wedding", "blue", "gold", "traditional"]',
true, true, 'manual', 1250, 4.8, true),

('p1111111-1111-1111-1111-111111111112', '11111111-1111-1111-1111-111111111111',
'Designer Georgette Saree - Pink', 
'Beautiful designer georgette saree with sequin work and embroidered border. Lightweight and comfortable for parties and festivities.',
'Designer georgette saree with sequin work',
3499, 4999,
'["https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=400&h=400&fit=crop"]',
25, 'Fashion & Clothing', 'Sarees', '["georgette", "designer", "pink", "party", "sequin"]',
true, false, 'manual', 890, 4.7, true),

-- Lehengas
('p1111111-1111-1111-1111-111111111113', '11111111-1111-1111-1111-111111111111',
'Bridal Lehenga Set - Red & Gold', 
'Stunning bridal lehenga with heavy embroidery, including blouse and dupatta. Made with premium fabric and adorned with stones and zardozi work.',
'Heavy bridal lehenga set with embroidery',
24999, 34999,
'["https://images.unsplash.com/photo-1583391733956-3f6c2784777e2?w=400&h=400&fit=crop"]',
5, 'Fashion & Clothing', 'Lehengas', '["bridal", "lehenga", "red", "gold", "wedding", "heavy"]',
true, true, 'manual', 2100, 4.9, true),

-- Ananya Boutique Products
('p2222222-2222-2222-2222-222222222221', '22222222-2222-2222-2222-222222222222',
'Anarkali Suit - Peacock Blue', 
'Elegant floor-length Anarkali suit with intricate thread work. Made from premium chanderi fabric with matching dupatta and bottom.',
'Floor-length Anarkali with thread work',
5999, 7999,
'["https://images.unsplash.com/photo-1594463750939-ebb28c3f7f75?w=400&h=400&fit=crop"]',
20, 'Fashion & Clothing', 'Suits', '["anarkali", "chanderi", "blue", "party", "elegant"]',
true, true, 'manual', 1450, 4.8, true),

('p2222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222',
'Designer Kurti Set - Mustard Yellow', 
'Contemporary designer kurti with palazzo pants. Features block print design with mirror work details. Perfect for casual and office wear.',
'Designer kurti set with palazzo',
2499, 3499,
'["https://images.unsplash.com/photo-1594463750939-ebb28c3f7f75?w=400&h=400&fit=crop"]',
35, 'Fashion & Clothing', 'Kurtis', '["kurti", "palazzo", "yellow", "casual", "office"]',
true, false, 'manual', 980, 4.6, true),

-- Kavya Ethnic Wear Products
('p3333333-3333-3333-3333-333333333331', '33333333-3333-3333-3333-333333333333',
'Traditional Bandhani Saree', 
'Authentic Rajasthani bandhani saree in vibrant colors. Hand-tied and dyed using traditional techniques. Includes matching blouse piece.',
'Rajasthani bandhani saree',
4999, 6999,
'["https://images.unsplash.com/photo-1569234817966-a9e3e7c572a4?w=400&h=400&fit=crop"]',
18, 'Fashion & Clothing', 'Sarees', '["bandhani", "rajasthani", "traditional", "handmade", "ethnic"]',
true, true, 'manual', 1680, 4.7, true),

('p3333333-3333-3333-3333-333333333332', '33333333-3333-3333-3333-333333333333',
'Punjabi Patiala Suit', 
'Vibrant Punjabi patiala suit with phulkari embroidery. Includes kurta, patiala salwar, and dupatta. Perfect for festivals and celebrations.',
'Punjabi patiala suit with phulkari',
3999, 5499,
'["https://images.unsplash.com/photo-1583391733956-3fc78276477e2?w=400&h=400&fit=crop"]',
22, 'Fashion & Clothing', 'Suits', '["punjabi", "patiala", "phulkari", "festival", "vibrant"]',
true, false, 'manual', 1120, 4.8, true);

-- Create products for Jewelry Sellers

-- Lakshmi Jewellers Products
INSERT INTO products (
  id, seller_id, name, description, short_description, price, original_price,
  images, stock_quantity, category, subcategory, tags, is_active, is_featured,
  created_from, view_count, rating, cod_available
) VALUES
-- Gold Jewelry
('p4444444-4444-4444-4444-444444444441', '44444444-4444-4444-4444-444444444444',
'22k Gold Temple Necklace Set', 
'Traditional South Indian temple jewelry necklace set. Made with 22k gold, featuring intricate Lakshmi pendant and matching earrings. Weight: 45 grams.',
'22k gold temple necklace with earrings',
185000, 195000,
'["https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&h=400&fit=crop"]',
3, 'Jewelry & Accessories', 'Necklaces', '["gold", "temple", "necklace", "22k", "traditional", "wedding"]',
true, true, 'manual', 3200, 4.9, false),

('p4444444-4444-4444-4444-444444444442', '44444444-4444-4444-4444-444444444444',
'Gold Kangan Set (4 pieces)', 
'Set of 4 traditional gold kangans (bangles) with intricate filigree work. 22k gold, total weight 60 grams. Perfect for brides.',
'22k gold kangan set - 4 pieces',
245000, 260000,
'["https://images.unsplash.com/photo-1515655540225-7b156402c4e5?w=400&h=400&fit=crop"]',
5, 'Jewelry & Accessories', 'Bangles', '["gold", "kangan", "bangles", "22k", "bridal", "traditional"]',
true, true, 'manual', 2850, 4.9, false),

-- Royal Gems Products
('p5555555-5555-5555-5555-555555555551', '55555555-5555-5555-5555-555555555555',
'Diamond Solitaire Ring', 
'Elegant solitaire diamond ring in 18k white gold setting. Features 1 carat VVS1 clarity diamond with excellent cut. IGI certified.',
'1 carat diamond solitaire ring',
325000, 350000,
'["https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&h=400&fit=crop"]',
2, 'Jewelry & Accessories', 'Rings', '["diamond", "solitaire", "ring", "18k", "engagement", "certified"]',
true, true, 'manual', 4100, 5.0, false),

('p5555555-5555-5555-5555-555555555552', '55555555-5555-5555-5555-555555555555',
'Emerald & Diamond Necklace', 
'Luxurious necklace featuring natural Zambian emeralds surrounded by diamonds. Set in 18k gold. Total emerald weight: 12 carats.',
'Emerald and diamond necklace in 18k gold',
450000, 480000,
'["https://images.unsplash.com/photo-1599643478518-a784e52dc4c9?w=400&h=400&fit=crop"]',
1, 'Jewelry & Accessories', 'Necklaces', '["emerald", "diamond", "necklace", "luxury", "18k", "premium"]',
true, true, 'manual', 3500, 4.9, false),

-- Sona Jewels Products
('p6666666-6666-6666-6666-666666666661', '66666666-6666-6666-6666-666666666666',
'Kundan Choker Set', 
'Rajasthani kundan choker necklace with matching earrings and maang tikka. Handcrafted with premium quality kundans and pearls.',
'Kundan choker set with earrings & tikka',
28000, 35000,
'["https://images.unsplash.com/photo-1573408301185-9236cc8a8d45?w=400&h=400&fit=crop"]',
8, 'Jewelry & Accessories', 'Necklaces', '["kundan", "choker", "rajasthani", "pearls", "wedding", "traditional"]',
true, true, 'manual', 2400, 4.8, true),

('p6666666-6666-6666-6666-666666666662', '66666666-6666-6666-6666-666666666666',
'Silver Oxidized Anklets', 
'Beautiful oxidized silver anklets (payal) with ghungroo bells. Traditional Rajasthani design with intricate patterns. Sold as pair.',
'Oxidized silver anklets with bells',
1899, 2499,
'["https://images.unsplash.com/photo-1543294001-3e15d4afa15d?w=400&h=400&fit=crop"]',
25, 'Jewelry & Accessories', 'Anklets', '["silver", "oxidized", "anklets", "payal", "traditional", "bells"]',
true, false, 'manual', 1850, 4.7, true),

-- Meera Collections Products (Mixed)
('p7777777-7777-7777-7777-777777777771', '77777777-7777-7777-7777-777777777777',
'Designer Saree with Jewelry Set', 
'Exclusive combo: Designer net saree with matching artificial jewelry set including necklace, earrings, and bangles. Perfect wedding guest outfit.',
'Saree and jewelry combo set',
12999, 16999,
'["https://images.unsplash.com/photo-1569234817966-a9e3e7c572a4?w=400&h=400&fit=crop"]',
10, 'Fashion & Jewelry', 'Combo Sets', '["saree", "jewelry", "combo", "wedding", "designer", "complete-set"]',
true, true, 'manual', 2200, 4.8, true),

('p7777777-7777-7777-7777-777777777772', '77777777-7777-7777-7777-777777777777',
'Indo-Western Gown with Accessories', 
'Modern Indo-Western gown with traditional jewelry accents. Includes statement necklace and earrings. Perfect fusion wear for receptions.',
'Indo-Western gown with jewelry',
8999, 11999,
'["https://images.unsplash.com/photo-1594463750939-ebb28c3f7f75?w=400&h=400&fit=crop"]',
12, 'Fashion & Jewelry', 'Fusion Wear', '["gown", "indo-western", "fusion", "modern", "reception", "jewelry"]',
true, false, 'manual', 1600, 4.7, true);

-- Create some livestream sessions for demo sellers
INSERT INTO livestream_sessions (
  id, seller_id, session_name, session_description, start_time, end_time,
  status, platform, total_products_captured, total_orders, total_revenue
) VALUES
('ls111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111',
'Diwali Collection Live', 'Showcasing our exclusive Diwali collection sarees',
NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days' + INTERVAL '2 hours',
'completed', 'facebook', 8, 12, 85000),

('ls222222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444444',
'Gold Jewelry Showcase', 'Traditional gold jewelry designs for wedding season',
NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days' + INTERVAL '1.5 hours',
'completed', 'instagram', 6, 4, 750000),

('ls333333-3333-3333-3333-333333333333', '77777777-7777-7777-7777-777777777777',
'Weekend Fashion Sale', 'Live demonstration of our latest fashion and jewelry combos',
NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day' + INTERVAL '3 hours',
'completed', 'youtube', 12, 18, 145000);

-- Create demo buyers
INSERT INTO users (id, phone, name, email, role, is_verified) VALUES
('b1111111-1111-1111-1111-111111111111', '+919988776655', 'Rahul Kumar', 'rahul@demo.com', 'buyer', true),
('b2222222-2222-2222-2222-222222222222', '+919988776656', 'Sneha Sharma', 'sneha@demo.com', 'buyer', true),
('b3333333-3333-3333-3333-333333333333', '+919988776657', 'Amit Patel', 'amit@demo.com', 'buyer', true);

INSERT INTO buyers (id, total_spent, order_history_count) VALUES
('b1111111-1111-1111-1111-111111111111', 125000, 8),
('b2222222-2222-2222-2222-222222222222', 85000, 5),
('b3333333-3333-3333-3333-333333333333', 195000, 12);

-- Create some recent orders
INSERT INTO orders (
  id, order_number, buyer_id, seller_id, product_id, quantity,
  unit_price, total_amount, payment_method, payment_status, order_status,
  shipping_address, created_via, created_at
) VALUES
('o1111111-1111-1111-1111-111111111111', 'ORD-2024-0001',
'b1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111',
'p1111111-1111-1111-1111-111111111111', 1, 8999, 8999,
'upi', 'completed', 'delivered',
'{"name": "Rahul Kumar", "phone": "+919988776655", "address": "123 MG Road", "city": "Delhi", "state": "Delhi", "pincode": "110001"}',
'chat', NOW() - INTERVAL '3 days'),

('o2222222-2222-2222-2222-222222222222', 'ORD-2024-0002',
'b2222222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444444',
'p4444444-4444-4444-4444-444444444441', 1, 185000, 185000,
'bank_transfer', 'completed', 'processing',
'{"name": "Sneha Sharma", "phone": "+919988776656", "address": "456 Brigade Road", "city": "Bangalore", "state": "Karnataka", "pincode": "560001"}',
'direct_buy', NOW() - INTERVAL '1 day');