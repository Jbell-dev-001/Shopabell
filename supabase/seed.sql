-- Demo data for ShopAbell
-- Insert demo users for testing

-- Demo sellers
INSERT INTO users (id, phone, country_code, is_verified, business_name, owner_name, business_type, onboarding_completed, role) VALUES
  ('11111111-1111-1111-1111-111111111111', '+919999999991', '+91', true, 'Fashion Forward', 'Priya Sharma', 'Fashion', true, 'seller'),
  ('22222222-2222-2222-2222-222222222222', '+919999999992', '+91', true, 'Sparkle Jewelry', 'Raj Patel', 'Jewelry', true, 'seller'),
  ('33333333-3333-3333-3333-333333333333', '+919999999993', '+91', true, 'Tech Hub', 'Ankit Verma', 'Electronics', true, 'seller'),
  ('44444444-4444-4444-4444-444444444444', '+919999999994', '+91', true, 'Home Decor Plus', 'Meera Singh', 'Home Decor', true, 'seller');

-- Demo customers
INSERT INTO users (id, phone, country_code, is_verified, owner_name, role) VALUES
  ('55555555-5555-5555-5555-555555555555', '+919876543210', '+91', true, 'Arjun Kumar', 'customer'),
  ('66666666-6666-6666-6666-666666666666', '+919876543211', '+91', true, 'Sneha Reddy', 'customer'),
  ('77777777-7777-7777-7777-777777777777', '+919876543212', '+91', true, 'Rohit Gupta', 'customer');

-- Demo products for Fashion Forward
INSERT INTO products (id, user_id, name, description, price, category, stock_quantity, source, ai_extracted_data) VALUES
  ('prod-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 
   'Cotton Kurti', 'Beautiful embroidered cotton kurti perfect for casual wear', 
   1299.00, 'Fashion', 25, 'manual', 
   '{"colors": ["Blue", "Red", "Green"], "sizes": ["S", "M", "L", "XL"], "material": "Cotton"}'),
   
  ('prod-1111-1111-1111-111111111112', '11111111-1111-1111-1111-111111111111', 
   'Silk Saree', 'Elegant silk saree with traditional border design', 
   4999.00, 'Fashion', 10, 'livestream', 
   '{"colors": ["Gold", "Maroon"], "sizes": ["Free Size"], "material": "Silk", "occasion": "Festival"}'),
   
  ('prod-1111-1111-1111-111111111113', '11111111-1111-1111-1111-111111111111', 
   'Denim Jeans', 'Comfortable slim-fit denim jeans for men', 
   1899.00, 'Fashion', 30, 'manual', 
   '{"colors": ["Blue", "Black"], "sizes": ["28", "30", "32", "34", "36"], "fit": "Slim"}');

-- Demo products for Sparkle Jewelry
INSERT INTO products (id, user_id, name, description, price, category, stock_quantity, source, ai_extracted_data) VALUES
  ('prod-2222-2222-2222-222222222221', '22222222-2222-2222-2222-222222222222', 
   'Gold Necklace', 'Traditional 22K gold necklace with intricate design', 
   45000.00, 'Jewelry', 5, 'manual', 
   '{"material": "22K Gold", "weight": "15g", "type": "Traditional"}'),
   
  ('prod-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 
   'Silver Earrings', 'Elegant silver earrings with pearl drops', 
   2500.00, 'Jewelry', 15, 'video', 
   '{"material": "Sterling Silver", "gemstone": "Pearl", "type": "Drop Earrings"}'),
   
  ('prod-2222-2222-2222-222222222223', '22222222-2222-2222-2222-222222222222', 
   'Diamond Ring', 'Beautiful solitaire diamond ring', 
   85000.00, 'Jewelry', 3, 'manual', 
   '{"material": "18K Gold", "gemstone": "Diamond", "carat": "1.5", "cut": "Round"}');

-- Demo products for Tech Hub
INSERT INTO products (id, user_id, name, description, price, category, stock_quantity, source, ai_extracted_data) VALUES
  ('prod-3333-3333-3333-333333333331', '33333333-3333-3333-3333-333333333333', 
   'Smartphone', 'Latest Android smartphone with 128GB storage', 
   25999.00, 'Electronics', 20, 'manual', 
   '{"brand": "Generic", "storage": "128GB", "ram": "8GB", "camera": "48MP"}'),
   
  ('prod-3333-3333-3333-333333333332', '33333333-3333-3333-3333-333333333333', 
   'Wireless Earbuds', 'True wireless earbuds with noise cancellation', 
   3999.00, 'Electronics', 50, 'livestream', 
   '{"features": ["Noise Cancellation", "Wireless", "Touch Controls"], "battery": "24 hours"}'),
   
  ('prod-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 
   'Laptop', 'Gaming laptop with RTX graphics', 
   75999.00, 'Electronics', 8, 'manual', 
   '{"processor": "Intel i7", "ram": "16GB", "storage": "512GB SSD", "graphics": "RTX 4060"}');

-- Demo chat conversations
INSERT INTO chat_conversations (id, seller_id, customer_id, last_message_at) VALUES
  ('chat-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', '55555555-5555-5555-5555-555555555555', NOW() - INTERVAL '2 hours'),
  ('chat-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', '66666666-6666-6666-6666-666666666666', NOW() - INTERVAL '1 day'),
  ('chat-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', '77777777-7777-7777-7777-777777777777', NOW() - INTERVAL '3 hours');

-- Demo chat messages
INSERT INTO chat_messages (conversation_id, sender_id, message, message_type, created_at) VALUES
  -- Fashion Forward conversation
  ('chat-1111-1111-1111-111111111111', '55555555-5555-5555-5555-555555555555', 
   'Hi! I saw your cotton kurti. Is it available in medium size?', 'text', NOW() - INTERVAL '2 hours'),
  ('chat-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 
   'Yes! The cotton kurti is available in medium size. Would you like to place an order?', 'text', NOW() - INTERVAL '2 hours' + INTERVAL '5 minutes'),
  ('chat-1111-1111-1111-111111111111', '55555555-5555-5555-5555-555555555555', 
   'sell cotton kurti 1299', 'sell_command', NOW() - INTERVAL '1 hour' + INTERVAL '30 minutes'),
   
  -- Sparkle Jewelry conversation
  ('chat-2222-2222-2222-222222222222', '66666666-6666-6666-6666-666666666666', 
   'Hello! Can you tell me more about the silver earrings?', 'text', NOW() - INTERVAL '1 day'),
  ('chat-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 
   'These are sterling silver earrings with natural pearls. Very elegant design!', 'text', NOW() - INTERVAL '1 day' + INTERVAL '10 minutes'),
   
  -- Tech Hub conversation
  ('chat-3333-3333-3333-333333333333', '77777777-7777-7777-7777-777777777777', 
   'Is the smartphone still available? What''s the warranty?', 'text', NOW() - INTERVAL '3 hours'),
  ('chat-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 
   'Yes, it''s available! Comes with 1 year manufacturer warranty.', 'text', NOW() - INTERVAL '3 hours' + INTERVAL '15 minutes');

-- Demo orders
INSERT INTO orders (id, order_number, seller_id, customer_id, items, subtotal, shipping_cost, total_amount, status, payment_method, payment_status, shipping_address) VALUES
  ('order-1111-1111-1111-111111111111', 'ORD-A1B2C3D4-20240602', 
   '11111111-1111-1111-1111-111111111111', '55555555-5555-5555-5555-555555555555',
   '[{"product_id": "prod-1111-1111-1111-111111111111", "name": "Cotton Kurti", "price": 1299.00, "quantity": 1}]',
   1299.00, 50.00, 1349.00, 'confirmed', 'upi', 'paid',
   '{"name": "Arjun Kumar", "phone": "+919876543210", "address": "123 MG Road", "city": "Bangalore", "state": "KA", "pincode": "560001"}'),
   
  ('order-2222-2222-2222-222222222222', 'ORD-E5F6G7H8-20240601', 
   '22222222-2222-2222-2222-222222222222', '66666666-6666-6666-6666-666666666666',
   '[{"product_id": "prod-2222-2222-2222-222222222222", "name": "Silver Earrings", "price": 2500.00, "quantity": 1}]',
   2500.00, 75.00, 2575.00, 'shipped', 'card', 'paid',
   '{"name": "Sneha Reddy", "phone": "+919876543211", "address": "456 Park Street", "city": "Hyderabad", "state": "TG", "pincode": "500001"}');

-- Demo analytics events
INSERT INTO analytics_events (user_id, event_type, event_data) VALUES
  ('11111111-1111-1111-1111-111111111111', 'product_viewed', '{"product_id": "prod-1111-1111-1111-111111111111"}'),
  ('11111111-1111-1111-1111-111111111111', 'order_created', '{"order_id": "order-1111-1111-1111-111111111111", "amount": 1349.00}'),
  ('22222222-2222-2222-2222-222222222222', 'product_created', '{"product_id": "prod-2222-2222-2222-222222222221", "source": "manual"}'),
  ('33333333-3333-3333-3333-333333333333', 'chat_message_sent', '{"conversation_id": "chat-3333-3333-3333-333333333333"}'),
  ('55555555-5555-5555-5555-555555555555', 'order_placed', '{"order_id": "order-1111-1111-1111-111111111111", "amount": 1349.00}');

-- Demo partnership applications
INSERT INTO partnership_applications (business_name, contact_name, phone, email, business_type, monthly_revenue, business_description, status) VALUES
  ('Elite Fashion Store', 'Kavita Mehta', '+919988776655', 'kavita@elitefashion.com', 'Fashion Retail', '5-10 Lakhs', 
   'Premium fashion boutique specializing in designer wear for women', 'pending'),
  ('Gadget World', 'Vikram Singh', '+919988776656', 'vikram@gadgetworld.com', 'Electronics', '10-25 Lakhs', 
   'Electronics retailer with focus on latest gadgets and accessories', 'approved'),
  ('Organic Foods Co', 'Ravi Krishnan', '+919988776657', 'ravi@organicfoods.com', 'Food & Beverages', '2-5 Lakhs', 
   'Organic food products and healthy snacks distributor', 'pending');