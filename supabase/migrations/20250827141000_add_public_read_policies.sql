-- Add public read policies for businesses and menu items
-- This allows the homepage to show active businesses without authentication

-- Drop existing policies first to avoid conflicts
DO $$ BEGIN
    DROP POLICY IF EXISTS public_read_active_businesses ON businesses;
EXCEPTION
    WHEN undefined_object THEN NULL;
END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS public_read_menu_items ON menu_items;
EXCEPTION
    WHEN undefined_object THEN NULL;
END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS public_read_cuisine_types ON cuisine_types;
EXCEPTION
    WHEN undefined_object THEN NULL;
END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS public_read_business_cuisines ON business_cuisines;
EXCEPTION
    WHEN undefined_object THEN NULL;
END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS public_read_business_hours ON business_hours;
EXCEPTION
    WHEN undefined_object THEN NULL;
END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS public_read_reviews ON reviews;
EXCEPTION
    WHEN undefined_object THEN NULL;
END $$;

-- Allow public to read active businesses
CREATE POLICY public_read_active_businesses
ON businesses FOR SELECT USING (status = 'active');

-- Allow public to read menu items (for businesses that are active)
CREATE POLICY public_read_menu_items
ON menu_items FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM businesses b 
    WHERE b.id = menu_items.business_id 
    AND b.status = 'active'
  )
);

-- Allow public to read cuisine types (reference data)
CREATE POLICY public_read_cuisine_types
ON cuisine_types FOR SELECT USING (true);

-- Allow public to read business cuisines
CREATE POLICY public_read_business_cuisines
ON business_cuisines FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM businesses b 
    WHERE b.id = business_cuisines.business_id 
    AND b.status = 'active'
  )
);

-- Allow public to read business hours
CREATE POLICY public_read_business_hours
ON business_hours FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM businesses b 
    WHERE b.id = business_hours.business_id 
    AND b.status = 'active'
  )
);

-- Allow public to read reviews (but not write/update/delete)
CREATE POLICY public_read_reviews
ON reviews FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM businesses b 
    WHERE b.id = reviews.business_id 
    AND b.status = 'active'
  )
);