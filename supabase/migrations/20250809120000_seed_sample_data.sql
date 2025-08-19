-- Seed basic lookup data only (no user-dependent data)

-- Add some sample cuisine types (only using name since slug doesn't exist in the table)
INSERT INTO public.cuisine_types (name) VALUES 
  ('Local Singaporean'),
  ('Peranakan'),
  ('Malaysian'),
  ('Indian'),
  ('Asian Fusion'),
  ('Chinese'),
  ('Zi Char'),
  ('Western'),
  ('Thai'),
  ('Japanese'),
  ('Korean'),
  ('Vietnamese'),
  ('Italian'),
  ('Desserts'),
  ('Coffee')
ON CONFLICT (name) DO NOTHING;
