-- Simple seed data for testing (without user dependencies)
-- This only seeds reference data and active businesses for homepage display

-- Insert initial cuisine types (if not exists)
INSERT INTO cuisine_types (name) VALUES
('Local Singaporean'),
('Chinese'),
('Western'),
('Coffee & Beverages'),
('Peranakan'),
('Indian')
ON CONFLICT (name) DO NOTHING;

-- Insert sample active businesses (using dummy UUIDs for owner_id)
-- In real usage, these would be created by authenticated business owners
INSERT INTO businesses (
  id, 
  owner_id, 
  business_name, 
  slug, 
  description, 
  specialty, 
  full_address, 
  district, 
  postal_code, 
  phone, 
  email, 
  price_range, 
  status
) VALUES
(
  '550e8400-e29b-41d4-a716-446655440001',
  '550e8400-e29b-41d4-a716-446655440010', -- dummy owner
  'Ah Ma''s Kitchen',
  'ah-mas-kitchen',
  'Traditional Peranakan recipes meet modern home dining. Authentic Nyonya kueh and dishes.',
  'Authentic Nyonya Kueh & Peranakan Dishes',
  'Blk 123 Toa Payoh Lorong 1, #01-456',
  'Central',
  '310123',
  '+65 9123 4567',
  'ahmaskitchen@example.com',
  '$$',
  'active'
),
(
  '550e8400-e29b-41d4-a716-446655440002',
  '550e8400-e29b-41d4-a716-446655440011', -- dummy owner
  'Brew & Bite Café',
  'brew-and-bite-cafe',
  'Artisan coffee meets Western brunch in our cozy setup. Specialty beans and hearty dishes.',
  'Artisan Coffee & Western Brunch',
  'Blk 456 Tampines Street 42, #02-123',
  'East',
  '520456',
  '+65 9234 5678',
  'hello@brewbite.example.com',
  '$$$',
  'active'
),
(
  '550e8400-e29b-41d4-a716-446655440003',
  '550e8400-e29b-41d4-a716-446655440012', -- dummy owner
  'Spice Route Home',
  'spice-route-home',
  'Authentic Indian home cooking with regional recipes. Made from scratch with traditional spices.',
  'Authentic Regional Indian Curries',
  'Blk 789 Jurong West Street 75, #03-234',
  'West',
  '640789',
  '+65 9345 6789',
  'spiceroute@example.com',
  '$',
  'active'
)
ON CONFLICT (id) DO NOTHING;

-- Link businesses with cuisine types
INSERT INTO business_cuisines (business_id, cuisine_id) VALUES
-- Ah Ma's Kitchen - Peranakan & Local
('550e8400-e29b-41d4-a716-446655440001', (SELECT id FROM cuisine_types WHERE name = 'Peranakan')),
('550e8400-e29b-41d4-a716-446655440001', (SELECT id FROM cuisine_types WHERE name = 'Local Singaporean')),

-- Brew & Bite - Western & Coffee
('550e8400-e29b-41d4-a716-446655440002', (SELECT id FROM cuisine_types WHERE name = 'Western')),
('550e8400-e29b-41d4-a716-446655440002', (SELECT id FROM cuisine_types WHERE name = 'Coffee & Beverages')),

-- Spice Route Home - Indian
('550e8400-e29b-41d4-a716-446655440003', (SELECT id FROM cuisine_types WHERE name = 'Indian'))
ON CONFLICT (business_id, cuisine_id) DO NOTHING;

-- Insert business hours
INSERT INTO business_hours (business_id, day_of_week, is_open, open_time, close_time) VALUES
-- Ah Ma's Kitchen hours (Mon-Sat)
('550e8400-e29b-41d4-a716-446655440001', 1, true, '09:00', '18:00'),
('550e8400-e29b-41d4-a716-446655440001', 2, true, '09:00', '18:00'),
('550e8400-e29b-41d4-a716-446655440001', 3, true, '09:00', '18:00'),
('550e8400-e29b-41d4-a716-446655440001', 4, true, '09:00', '18:00'),
('550e8400-e29b-41d4-a716-446655440001', 5, true, '09:00', '18:00'),
('550e8400-e29b-41d4-a716-446655440001', 6, true, '08:00', '19:00'),
('550e8400-e29b-41d4-a716-446655440001', 0, false, null, null),

-- Brew & Bite hours (Daily)
('550e8400-e29b-41d4-a716-446655440002', 1, true, '08:00', '17:00'),
('550e8400-e29b-41d4-a716-446655440002', 2, true, '08:00', '17:00'),
('550e8400-e29b-41d4-a716-446655440002', 3, true, '08:00', '17:00'),
('550e8400-e29b-41d4-a716-446655440002', 4, true, '08:00', '17:00'),
('550e8400-e29b-41d4-a716-446655440002', 5, true, '08:00', '17:00'),
('550e8400-e29b-41d4-a716-446655440002', 6, true, '08:00', '19:00'),
('550e8400-e29b-41d4-a716-446655440002', 0, true, '09:00', '17:00')
ON CONFLICT (business_id, day_of_week) DO NOTHING;

-- Insert menu categories
INSERT INTO menu_categories (business_id, name, display_order) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Signature Kueh', 1),
('550e8400-e29b-41d4-a716-446655440001', 'Main Dishes', 2),
('550e8400-e29b-41d4-a716-446655440002', 'Coffee & Beverages', 1),
('550e8400-e29b-41d4-a716-446655440002', 'Brunch Items', 2),
('550e8400-e29b-41d4-a716-446655440003', 'Curries & Mains', 1)
ON CONFLICT (business_id, name) DO NOTHING;

-- Insert sample menu items
INSERT INTO menu_items (id, business_id, category_id, name, description, price, display_order) VALUES
-- Ah Ma's Kitchen items
('650e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 
 (SELECT id FROM menu_categories WHERE business_id = '550e8400-e29b-41d4-a716-446655440001' AND name = 'Signature Kueh'),
 'Kueh Lapis', 'Traditional 9-layer steamed cake', 2.50, 1),
('650e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 
 (SELECT id FROM menu_categories WHERE business_id = '550e8400-e29b-41d4-a716-446655440001' AND name = 'Signature Kueh'),
 'Ondeh Ondeh', 'Pandan glutinous rice balls with gula melaka', 1.80, 2),
('650e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 
 (SELECT id FROM menu_categories WHERE business_id = '550e8400-e29b-41d4-a716-446655440001' AND name = 'Main Dishes'),
 'Ayam Buah Keluak', 'Chicken with black nuts in rich spicy gravy', 15.80, 1),
('650e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001', 
 (SELECT id FROM menu_categories WHERE business_id = '550e8400-e29b-41d4-a716-446655440001' AND name = 'Main Dishes'),
 'Laksa Lemak', 'Rich coconut curry noodle soup', 8.80, 2),

-- Brew & Bite items  
('650e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440002', 
 (SELECT id FROM menu_categories WHERE business_id = '550e8400-e29b-41d4-a716-446655440002' AND name = 'Coffee & Beverages'),
 'Signature Flat White', 'House blend espresso with steamed milk', 5.50, 1),
('650e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440002', 
 (SELECT id FROM menu_categories WHERE business_id = '550e8400-e29b-41d4-a716-446655440002' AND name = 'Brunch Items'),
 'Avocado Toast', 'Sourdough with smashed avocado and poached egg', 12.80, 1)
ON CONFLICT (id) DO NOTHING;