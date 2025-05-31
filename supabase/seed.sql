-- Seed data for development

-- Insert test categories
INSERT INTO categories (name, slug, description, is_active, sort_order) VALUES
('Fashion & Clothing', 'fashion-clothing', 'Trendy fashion and clothing items', true, 1),
('Beauty & Cosmetics', 'beauty-cosmetics', 'Beauty products and cosmetics', true, 2),
('Electronics & Gadgets', 'electronics-gadgets', 'Electronic devices and gadgets', true, 3),
('Home & Kitchen', 'home-kitchen', 'Home decor and kitchen items', true, 4),
('Jewelry & Accessories', 'jewelry-accessories', 'Jewelry and fashion accessories', true, 5),
('Books & Stationery', 'books-stationery', 'Books and stationery items', true, 6),
('Sports & Fitness', 'sports-fitness', 'Sports equipment and fitness products', true, 7),
('Food & Beverages', 'food-beverages', 'Food items and beverages', true, 8);

-- Insert shipping rates for different couriers
INSERT INTO shipping_rates (courier_partner, service_type, zone, weight_from, weight_to, rate, cod_charges, fuel_surcharge, is_active, effective_from) VALUES
('Delhivery', 'standard', 'A', 0, 0.5, 45, 40, 5, true, CURRENT_DATE),
('Delhivery', 'standard', 'A', 0.5, 1, 55, 40, 5, true, CURRENT_DATE),
('Delhivery', 'standard', 'B', 0, 0.5, 55, 40, 5, true, CURRENT_DATE),
('Delhivery', 'express', 'A', 0, 0.5, 65, 40, 5, true, CURRENT_DATE),
('BlueDart', 'standard', 'A', 0, 0.5, 65, 40, 7, true, CURRENT_DATE),
('BlueDart', 'express', 'A', 0, 0.5, 85, 40, 7, true, CURRENT_DATE),
('DTDC', 'standard', 'A', 0, 0.5, 40, 40, 3, true, CURRENT_DATE),
('DTDC', 'standard', 'B', 0, 0.5, 50, 40, 3, true, CURRENT_DATE),
('India Post', 'standard', 'A', 0, 0.5, 30, 40, 0, true, CURRENT_DATE),
('India Post', 'standard', 'B', 0, 0.5, 35, 40, 0, true, CURRENT_DATE),
('Ecom Express', 'standard', 'A', 0, 0.5, 35, 40, 4, true, CURRENT_DATE),
('Xpressbees', 'standard', 'A', 0, 0.5, 40, 40, 4, true, CURRENT_DATE);

-- Note: For actual development, you would need to:
-- 1. Create test users through Supabase Auth
-- 2. Insert seller and buyer records linked to those auth users
-- 3. Create test products and orders

-- Example structure for when you have auth users:
-- INSERT INTO users (id, phone, name, email, role, language_preference) VALUES
-- ('auth-user-id-1', '+919876543210', 'Priya Fashion Store', 'priya@example.com', 'seller', 'hi'),
-- ('auth-user-id-2', '+919876543211', 'Raj Kumar', 'raj@example.com', 'buyer', 'en');

-- INSERT INTO sellers (id, business_name, business_category, store_slug, upi_id, pickup_address) VALUES
-- ('auth-user-id-1', 'Priya Fashion Store', 'Fashion & Clothing', 'priya-fashion', 'priya@paytm', 
--  '{"address": "123 MG Road", "city": "Bangalore", "state": "Karnataka", "pincode": "560001"}');

-- INSERT INTO buyers (id, default_address) VALUES
-- ('auth-user-id-2', '{"address": "456 Park Street", "city": "Mumbai", "state": "Maharashtra", "pincode": "400001"}');


