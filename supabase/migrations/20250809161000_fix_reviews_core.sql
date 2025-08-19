-- Simplified production review system migration
-- Focus on fixing what we need for the real implementation

-- Add missing columns to reviews table if they don't exist
DO $$ 
BEGIN
  -- Add title column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'reviews' AND column_name = 'title'
  ) THEN
    ALTER TABLE reviews ADD COLUMN title text;
  END IF;

  -- Add photos array column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'reviews' AND column_name = 'photos'
  ) THEN
    ALTER TABLE reviews ADD COLUMN photos text[];
  END IF;

  -- Add verified column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'reviews' AND column_name = 'verified'
  ) THEN
    ALTER TABLE reviews ADD COLUMN verified boolean DEFAULT false;
  END IF;

  -- Add edit_token column for 15-minute edit window
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'reviews' AND column_name = 'edit_token'
  ) THEN
    ALTER TABLE reviews ADD COLUMN edit_token uuid;
  END IF;

  -- Add edit_expires timestamp for edit window
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'reviews' AND column_name = 'edit_expires'
  ) THEN
    ALTER TABLE reviews ADD COLUMN edit_expires timestamptz;
  END IF;
END $$;
-- Create indexes for performance if they don't exist
CREATE INDEX IF NOT EXISTS idx_reviews_business_id ON reviews(business_id);
CREATE INDEX IF NOT EXISTS idx_reviews_customer_id ON reviews(customer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at);
CREATE INDEX IF NOT EXISTS idx_reviews_verified ON reviews(verified);
-- Create a function to get review statistics
CREATE OR REPLACE FUNCTION get_review_stats(business_uuid uuid)
RETURNS TABLE (
  total_reviews bigint,
  average_rating numeric,
  rating_1 bigint,
  rating_2 bigint,
  rating_3 bigint,
  rating_4 bigint,
  rating_5 bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT 
    COUNT(*) as total_reviews,
    ROUND(AVG(rating), 2) as average_rating,
    COUNT(*) FILTER (WHERE rating = 1) as rating_1,
    COUNT(*) FILTER (WHERE rating = 2) as rating_2,
    COUNT(*) FILTER (WHERE rating = 3) as rating_3,
    COUNT(*) FILTER (WHERE rating = 4) as rating_4,
    COUNT(*) FILTER (WHERE rating = 5) as rating_5
  FROM reviews 
  WHERE business_id = business_uuid 
  AND status = 'published';
$$;
