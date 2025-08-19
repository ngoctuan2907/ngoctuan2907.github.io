-- Generate slugs for existing businesses
-- This migration creates URL-friendly slugs from business names

-- Function to generate slug from business name
CREATE OR REPLACE FUNCTION generate_slug(business_name text) 
RETURNS text AS $$
BEGIN
  RETURN lower(
    regexp_replace(
      regexp_replace(
        regexp_replace(business_name, '[^a-zA-Z0-9\s\-]', '', 'g'),  -- Remove special chars
        '\s+', '-', 'g'  -- Replace spaces with hyphens
      ),
      '\-+', '-', 'g'  -- Replace multiple hyphens with single
    )
  );
END;
$$ LANGUAGE plpgsql;
-- Update businesses with generated slugs
UPDATE businesses 
SET slug = generate_slug(business_name) || '-' || LEFT(id::text, 8)
WHERE slug IS NULL OR slug = '';
-- Make sure slugs are unique by appending counter if needed
DO $$
DECLARE
  rec RECORD;
  base_slug text;
  final_slug text;
  counter int;
BEGIN
  FOR rec IN SELECT id, business_name, slug FROM businesses WHERE slug IS NOT NULL
  LOOP
    base_slug := rec.slug;
    final_slug := base_slug;
    counter := 1;
    
    -- Check if slug already exists for another business
    WHILE EXISTS (
      SELECT 1 FROM businesses 
      WHERE slug = final_slug AND id != rec.id
    ) LOOP
      final_slug := base_slug || '-' || counter;
      counter := counter + 1;
    END LOOP;
    
    -- Update if changed
    IF final_slug != rec.slug THEN
      UPDATE businesses SET slug = final_slug WHERE id = rec.id;
    END IF;
  END LOOP;
END $$;
-- Drop helper function
DROP FUNCTION generate_slug(text);
