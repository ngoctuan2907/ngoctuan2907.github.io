-- Minimal seed data that works with foreign key constraints
-- Only seeds reference data and avoids auth.users dependencies

-- Insert cuisine types (reference data)
INSERT INTO cuisine_types (name) VALUES
('Local Singaporean'),
('Chinese'),  
('Western'),
('Coffee & Beverages'),
('Peranakan'),
('Indian')
ON CONFLICT (name) DO NOTHING;

-- Insert plan features for subscription testing
INSERT INTO plan_features (plan, max_shops, ad_tier) VALUES
('basic', 1, 'none'),
('pro', 5, 'standard'), 
('enterprise', 20, 'top')
ON CONFLICT (plan) DO NOTHING;

-- Note: We cannot seed businesses, users, or other entities that depend on auth.users
-- These will be created via the API when real users authenticate
-- For testing, we use test mode which bypasses these validations