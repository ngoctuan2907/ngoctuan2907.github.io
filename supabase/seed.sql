-- Insert initial cuisine types
INSERT INTO cuisine_types (name) VALUES
('Local Singaporean'),
('Chinese'),
('Malay'),
('Indian'),
('Peranakan'),
('Western'),
('Japanese'),
('Korean'),
('Thai'),
('Vietnamese'),
('Italian'),
('Mexican'),
('Fusion'),
('Desserts & Sweets'),
('Coffee & Beverages'),
('Healthy & Organic');

-- Insert sample business owner users
INSERT INTO users (email, password_hash, first_name, last_name, phone, user_type) VALUES
('lim.ahma@gmail.com', '$2b$10$example_hash_1', 'Mei Ling', 'Lim', '+65 9123 4567', 'business_owner'),
('brew.bite.owner@gmail.com', '$2b$10$example_hash_2', 'David', 'Tan', '+65 9234 5678', 'business_owner'),
('spice.route@gmail.com', '$2b$10$example_hash_3', 'Priya', 'Sharma', '+65 9345 6789', 'business_owner'),
('noodle.nest@gmail.com', '$2b$10$example_hash_4', 'Wei Ming', 'Chen', '+65 9456 7890', 'business_owner');

-- Insert sample customer users
INSERT INTO users (email, password_hash, first_name, last_name, phone, user_type) VALUES
('sarah.tan@gmail.com', '$2b$10$example_hash_5', 'Sarah', 'Tan', '+65 8123 4567', 'customer'),
('david.lim@gmail.com', '$2b$10$example_hash_6', 'David', 'Lim', '+65 8234 5678', 'customer'),
('michelle.wong@gmail.com', '$2b$10$example_hash_7', 'Michelle', 'Wong', '+65 8345 6789', 'customer');

-- Insert sample businesses
INSERT INTO businesses (owner_id, business_name, slug, description, specialty, full_address, district, postal_code, phone, email, price_range, status, instagram_handle, whatsapp_number) VALUES
(
    (SELECT id FROM users WHERE email = 'lim.ahma@gmail.com'),
    'Ah Ma''s Kitchen',
    'ah-mas-kitchen',
    'Welcome to Ah Ma''s Kitchen, where traditional Peranakan recipes meet modern home dining. Started by Mrs. Lim in her HDB flat, we specialize in authentic Nyonya kueh and traditional dishes passed down through three generations.',
    'Authentic Nyonya Kueh & Traditional Peranakan Dishes',
    'Blk 123 Toa Payoh Lorong 1, #01-456, Singapore 310123',
    'Central',
    '310123',
    '+65 9123 4567',
    'ahmaskitchen@gmail.com',
    '$$',
    'active',
    '@ahmas_kitchen_sg',
    '+65 9123 4567'
),
(
    (SELECT id FROM users WHERE email = 'brew.bite.owner@gmail.com'),
    'Brew & Bite',
    'brew-and-bite',
    'Artisan coffee meets Western brunch in our cozy Tampines home setup. We focus on specialty coffee beans and hearty brunch dishes perfect for lazy weekends.',
    'Artisan Coffee & Western Brunch',
    'Blk 456 Tampines Street 42, #02-123, Singapore 520456',
    'East',
    '520456',
    '+65 9234 5678',
    'hello@brewandbite.sg',
    '$$$',
    'active',
    '@brew_bite_sg',
    '+65 9234 5678'
),
(
    (SELECT id FROM users WHERE email = 'spice.route@gmail.com'),
    'Spice Route Home',
    'spice-route-home',
    'Authentic Indian home cooking with recipes from different regions of India. Every curry is made from scratch with traditional spices and techniques.',
    'Authentic Regional Indian Curries',
    'Blk 789 Jurong West Street 75, #03-234, Singapore 640789',
    'West',
    '640789',
    '+65 9345 6789',
    'spiceroute@gmail.com',
    '$',
    'active',
    '@spice_route_home',
    '+65 9345 6789'
),
(
    (SELECT id FROM users WHERE email = 'noodle.nest@gmail.com'),
    'Noodle Nest',
    'noodle-nest',
    'Hand-pulled noodles and traditional Chinese comfort food made fresh daily. Watch the noodle-making process in our open kitchen setup.',
    'Hand-pulled Noodles & Chinese Comfort Food',
    'Blk 321 Ang Mo Kio Avenue 3, #01-567, Singapore 560321',
    'North',
    '560321',
    '+65 9456 7890',
    'noodlenest@gmail.com',
    '$$',
    'active',
    '@noodle_nest_sg',
    '+65 9456 7890'
);

-- Link businesses with cuisine types
INSERT INTO business_cuisines (business_id, cuisine_id) VALUES
-- Ah Ma's Kitchen - Peranakan & Local
((SELECT id FROM businesses WHERE slug = 'ah-mas-kitchen'), (SELECT id FROM cuisine_types WHERE name = 'Peranakan')),
((SELECT id FROM businesses WHERE slug = 'ah-mas-kitchen'), (SELECT id FROM cuisine_types WHERE name = 'Local Singaporean')),

-- Brew & Bite - Western & Coffee
((SELECT id FROM businesses WHERE slug = 'brew-and-bite'), (SELECT id FROM cuisine_types WHERE name = 'Western')),
((SELECT id FROM businesses WHERE slug = 'brew-and-bite'), (SELECT id FROM cuisine_types WHERE name = 'Coffee & Beverages')),

-- Spice Route Home - Indian
((SELECT id FROM businesses WHERE slug = 'spice-route-home'), (SELECT id FROM cuisine_types WHERE name = 'Indian')),

-- Noodle Nest - Chinese
((SELECT id FROM businesses WHERE slug = 'noodle-nest'), (SELECT id FROM cuisine_types WHERE name = 'Chinese'));

-- Insert business hours (Monday = 1, Sunday = 0)
INSERT INTO business_hours (business_id, day_of_week, is_open, open_time, close_time) VALUES
-- Ah Ma's Kitchen hours
((SELECT id FROM businesses WHERE slug = 'ah-mas-kitchen'), 1, true, '09:00', '18:00'), -- Monday
((SELECT id FROM businesses WHERE slug = 'ah-mas-kitchen'), 2, true, '09:00', '18:00'), -- Tuesday
((SELECT id FROM businesses WHERE slug = 'ah-mas-kitchen'), 3, true, '09:00', '18:00'), -- Wednesday
((SELECT id FROM businesses WHERE slug = 'ah-mas-kitchen'), 4, true, '09:00', '18:00'), -- Thursday
((SELECT id FROM businesses WHERE slug = 'ah-mas-kitchen'), 5, true, '09:00', '18:00'), -- Friday
((SELECT id FROM businesses WHERE slug = 'ah-mas-kitchen'), 6, true, '08:00', '19:00'), -- Saturday
((SELECT id FROM businesses WHERE slug = 'ah-mas-kitchen'), 0, false, null, null), -- Sunday

-- Brew & Bite hours
((SELECT id FROM businesses WHERE slug = 'brew-and-bite'), 1, true, '08:00', '17:00'),
((SELECT id FROM businesses WHERE slug = 'brew-and-bite'), 2, true, '08:00', '17:00'),
((SELECT id FROM businesses WHERE slug = 'brew-and-bite'), 3, true, '08:00', '17:00'),
((SELECT id FROM businesses WHERE slug = 'brew-and-bite'), 4, true, '08:00', '17:00'),
((SELECT id FROM businesses WHERE slug = 'brew-and-bite'), 5, true, '08:00', '17:00'),
((SELECT id FROM businesses WHERE slug = 'brew-and-bite'), 6, true, '08:00', '19:00'),
((SELECT id FROM businesses WHERE slug = 'brew-and-bite'), 0, true, '09:00', '17:00');

-- Insert sample menu categories and items for Ah Ma's Kitchen
INSERT INTO menu_categories (business_id, name, display_order) VALUES
((SELECT id FROM businesses WHERE slug = 'ah-mas-kitchen'), 'Signature Kueh', 1),
((SELECT id FROM businesses WHERE slug = 'ah-mas-kitchen'), 'Main Dishes', 2);

-- Insert menu items for Ah Ma's Kitchen
INSERT INTO menu_items (business_id, category_id, name, description, price, display_order) VALUES
-- Signature Kueh
((SELECT id FROM businesses WHERE slug = 'ah-mas-kitchen'), 
 (SELECT id FROM menu_categories WHERE business_id = (SELECT id FROM businesses WHERE slug = 'ah-mas-kitchen') AND name = 'Signature Kueh'),
 'Kueh Lapis', 'Traditional 9-layer steamed cake', 2.50, 1),
((SELECT id FROM businesses WHERE slug = 'ah-mas-kitchen'), 
 (SELECT id FROM menu_categories WHERE business_id = (SELECT id FROM businesses WHERE slug = 'ah-mas-kitchen') AND name = 'Signature Kueh'),
 'Ondeh Ondeh', 'Pandan glutinous rice balls with gula melaka', 1.80, 2),
((SELECT id FROM businesses WHERE slug = 'ah-mas-kitchen'), 
 (SELECT id FROM menu_categories WHERE business_id = (SELECT id FROM businesses WHERE slug = 'ah-mas-kitchen') AND name = 'Signature Kueh'),
 'Kueh Salat', 'Coconut custard on glutinous rice base', 3.20, 3),

-- Main Dishes
((SELECT id FROM businesses WHERE slug = 'ah-mas-kitchen'), 
 (SELECT id FROM menu_categories WHERE business_id = (SELECT id FROM businesses WHERE slug = 'ah-mas-kitchen') AND name = 'Main Dishes'),
 'Ayam Buah Keluak', 'Chicken with black nuts in rich spicy gravy', 15.80, 1),
((SELECT id FROM businesses WHERE slug = 'ah-mas-kitchen'), 
 (SELECT id FROM menu_categories WHERE business_id = (SELECT id FROM businesses WHERE slug = 'ah-mas-kitchen') AND name = 'Main Dishes'),
 'Laksa Lemak', 'Rich coconut curry noodle soup', 8.80, 2);

-- Insert sample reviews
INSERT INTO reviews (business_id, customer_id, rating, comment) VALUES
((SELECT id FROM businesses WHERE slug = 'ah-mas-kitchen'),
 (SELECT id FROM users WHERE email = 'sarah.tan@gmail.com'),
 5, 'Amazing authentic Peranakan food! The kueh lapis was exactly like my grandmother used to make. Mrs. Lim is so passionate about preserving these traditional recipes.'),
((SELECT id FROM businesses WHERE slug = 'ah-mas-kitchen'),
 (SELECT id FROM users WHERE email = 'david.lim@gmail.com'),
 5, 'Best laksa lemak I''ve had in Singapore! The flavors are so rich and authentic. Definitely ordering again.'),
((SELECT id FROM businesses WHERE slug = 'ah-mas-kitchen'),
 (SELECT id FROM users WHERE email = 'michelle.wong@gmail.com'),
 4, 'Love supporting local home businesses. The ondeh ondeh was perfect - just the right amount of sweetness. Will try more items next time!');
