-- Comprehensive Production Review System Migration
-- This migration creates the complete review system per requirements
-- Addressing all issues from .github/bugs-in-review-and-logout-features.md

-- 1. Add missing columns to reviews table safely
ALTER TABLE public.reviews 
ADD COLUMN IF NOT EXISTS title text,
ADD COLUMN IF NOT EXISTS photos text[],
ADD COLUMN IF NOT EXISTS verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS edit_token uuid,
ADD COLUMN IF NOT EXISTS edit_expires timestamptz;
-- 2. Create review_replies table
CREATE TABLE IF NOT EXISTS public.review_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id uuid UNIQUE NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
-- 3. Create review_helpful table for voting
CREATE TABLE IF NOT EXISTS public.review_helpful (
  review_id uuid NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (review_id, user_id)
);
-- 4. Ensure review_reports table has proper columns
ALTER TABLE public.review_reports 
ADD COLUMN IF NOT EXISTS details text,
ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
ADD COLUMN IF NOT EXISTS reviewed_at timestamptz,
ADD COLUMN IF NOT EXISTS reviewed_by uuid REFERENCES auth.users(id);
-- Make reason NOT NULL if it exists but is nullable
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='review_reports' AND column_name='reason' AND is_nullable='YES') THEN
    UPDATE public.review_reports SET reason = 'No reason provided' WHERE reason IS NULL;
    ALTER TABLE public.review_reports ALTER COLUMN reason SET NOT NULL;
  END IF;
END $$;
-- 5. Generate slugs for businesses that don't have them
UPDATE public.businesses 
SET slug = lower(
  regexp_replace(
    regexp_replace(business_name, '[^a-zA-Z0-9\s\-]', '', 'g'),
    '\s+', '-', 'g'
  )
) || '-' || substring(id::text, 1, 8)
WHERE slug IS NULL OR slug = '';
-- 6. Create business ownership helper function
CREATE OR REPLACE FUNCTION public.owns_business(business_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.businesses 
    WHERE id = business_id AND owner_id = auth.uid()
  );
$$;
-- 7. Enable RLS on all review tables
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_helpful ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_reports ENABLE ROW LEVEL SECURITY;
-- 8. Create RLS policies only if they don't exist
DO $$
BEGIN
  -- Reviews policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'reviews' AND policyname = 'Reviews are publicly readable') THEN
    CREATE POLICY "Reviews are publicly readable" ON public.reviews
      FOR SELECT USING (status = 'published');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'reviews' AND policyname = 'Users can create their own reviews') THEN
    CREATE POLICY "Users can create their own reviews" ON public.reviews
      FOR INSERT WITH CHECK (auth.uid() = customer_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'reviews' AND policyname = 'Users can edit their own reviews') THEN
    CREATE POLICY "Users can edit their own reviews" ON public.reviews
      FOR UPDATE USING (
        auth.uid() = customer_id AND 
        (edit_expires IS NULL OR edit_expires > now())
      );
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'reviews' AND policyname = 'Business owners can read their reviews') THEN
    CREATE POLICY "Business owners can read their reviews" ON public.reviews
      FOR SELECT USING (public.owns_business(business_id));
  END IF;

  -- Review replies policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'review_replies' AND policyname = 'Review replies are publicly readable') THEN
    CREATE POLICY "Review replies are publicly readable" ON public.review_replies
      FOR SELECT USING (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'review_replies' AND policyname = 'Business owners can reply to their reviews') THEN
    CREATE POLICY "Business owners can reply to their reviews" ON public.review_replies
      FOR INSERT WITH CHECK (
        auth.uid() = owner_id AND
        EXISTS (
          SELECT 1 FROM public.reviews r 
          JOIN public.businesses b ON r.business_id = b.id 
          WHERE r.id = review_id AND b.owner_id = auth.uid()
        )
      );
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'review_replies' AND policyname = 'Business owners can update their replies') THEN
    CREATE POLICY "Business owners can update their replies" ON public.review_replies
      FOR UPDATE USING (auth.uid() = owner_id);
  END IF;

  -- Review helpful policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'review_helpful' AND policyname = 'Helpful votes are publicly readable') THEN
    CREATE POLICY "Helpful votes are publicly readable" ON public.review_helpful
      FOR SELECT USING (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'review_helpful' AND policyname = 'Users can vote helpful') THEN
    CREATE POLICY "Users can vote helpful" ON public.review_helpful
      FOR ALL USING (auth.uid() = user_id);
  END IF;

  -- Review reports policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'review_reports' AND policyname = 'Users can report reviews') THEN
    CREATE POLICY "Users can report reviews" ON public.review_reports
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'review_reports' AND policyname = 'Users can read their own reports') THEN
    CREATE POLICY "Users can read their own reports" ON public.review_reports
      FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;
-- 9. Create performance indexes
CREATE INDEX IF NOT EXISTS idx_reviews_business_id_status ON public.reviews(business_id, status);
CREATE INDEX IF NOT EXISTS idx_reviews_customer_id ON public.reviews(customer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON public.reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON public.reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_verified ON public.reviews(verified);
CREATE INDEX IF NOT EXISTS idx_review_replies_review_id ON public.review_replies(review_id);
CREATE INDEX IF NOT EXISTS idx_review_helpful_review_id ON public.review_helpful(review_id);
CREATE INDEX IF NOT EXISTS idx_review_reports_status ON public.review_reports(status);
CREATE INDEX IF NOT EXISTS idx_businesses_slug ON public.businesses(slug);
CREATE INDEX IF NOT EXISTS idx_businesses_status ON public.businesses(status);
-- 10. Create functions for review system
CREATE OR REPLACE FUNCTION public.set_review_edit_expires()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.edit_expires = NEW.created_at + interval '15 minutes';
  RETURN NEW;
END;
$$;
-- Create trigger for edit window
DROP TRIGGER IF EXISTS set_review_edit_expires_trigger ON public.reviews;
CREATE TRIGGER set_review_edit_expires_trigger
  BEFORE INSERT ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.set_review_edit_expires();
-- 11. Create function to set verified status based on orders
CREATE OR REPLACE FUNCTION public.set_review_verified()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.orders
    WHERE customer_id = NEW.customer_id
    AND business_id = NEW.business_id
    AND status = 'completed'
  ) THEN
    NEW.verified = true;
  END IF;
  
  RETURN NEW;
END;
$$;
-- Create trigger for verified status
DROP TRIGGER IF EXISTS set_review_verified_trigger ON public.reviews;
CREATE TRIGGER set_review_verified_trigger
  BEFORE INSERT ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.set_review_verified();
-- 12. Create aggregation function for review stats
CREATE OR REPLACE FUNCTION public.get_review_stats(business_uuid uuid)
RETURNS TABLE (
  total_reviews bigint,
  average_rating numeric(3,2),
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
  FROM public.reviews 
  WHERE business_id = business_uuid 
  AND status = 'published';
$$;
