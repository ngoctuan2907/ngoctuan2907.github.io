-- Production Review System Migration
-- This creates the complete review system with all features and proper relationships

-- 1. Ensure the reviews table has all required columns
DO $$
BEGIN
  -- Add title column if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='reviews' AND column_name='title') THEN
    ALTER TABLE public.reviews ADD COLUMN title text;
  END IF;
  
  -- Add photos column if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='reviews' AND column_name='photos') THEN
    ALTER TABLE public.reviews ADD COLUMN photos text[];
  END IF;
  
  -- Add verified column if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='reviews' AND column_name='verified') THEN
    ALTER TABLE public.reviews ADD COLUMN verified boolean DEFAULT false;
  END IF;
  
  -- Add edit_token column if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='reviews' AND column_name='edit_token') THEN
    ALTER TABLE public.reviews ADD COLUMN edit_token uuid;
  END IF;
  
  -- Add edit_expires column if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='reviews' AND column_name='edit_expires') THEN
    ALTER TABLE public.reviews ADD COLUMN edit_expires timestamptz;
  END IF;
END $$;
-- 2. Create review_replies table for owner responses
CREATE TABLE IF NOT EXISTS public.review_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id uuid NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(review_id) -- One reply per review
);
-- 3. Create review_helpful table for helpful votes
CREATE TABLE IF NOT EXISTS public.review_helpful (
  review_id uuid NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (review_id, user_id)
);
-- 4. Extend review_reports table with additional columns
DO $$
BEGIN
  -- Add details column if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='review_reports' AND column_name='details') THEN
    ALTER TABLE public.review_reports ADD COLUMN details text;
  END IF;
  
  -- Add status column if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='review_reports' AND column_name='status') THEN
    ALTER TABLE public.review_reports ADD COLUMN status text DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed'));
  END IF;
  
  -- Add reviewed_at column if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='review_reports' AND column_name='reviewed_at') THEN
    ALTER TABLE public.review_reports ADD COLUMN reviewed_at timestamptz;
  END IF;
  
  -- Add reviewed_by column if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='review_reports' AND column_name='reviewed_by') THEN
    ALTER TABLE public.review_reports ADD COLUMN reviewed_by uuid REFERENCES auth.users(id);
  END IF;
  
  -- Make reason column NOT NULL if it isn't already
  UPDATE public.review_reports SET reason = 'No reason provided' WHERE reason IS NULL;
  ALTER TABLE public.review_reports ALTER COLUMN reason SET NOT NULL;
END $$;
-- 5. Create helper function to check business ownership
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
-- 6. Enable RLS on all review-related tables
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_helpful ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_reports ENABLE ROW LEVEL SECURITY;
-- 7. Create RLS policies for reviews (only if not exists)
DO $$
BEGIN
  -- Reviews: Everyone can read published reviews
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'reviews' AND policyname = 'Reviews are publicly readable') THEN
    CREATE POLICY "Reviews are publicly readable" ON public.reviews
      FOR SELECT USING (status = 'published');
  END IF;
  
  -- Reviews: Authenticated users can insert their own reviews
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'reviews' AND policyname = 'Users can create their own reviews') THEN
    CREATE POLICY "Users can create their own reviews" ON public.reviews
      FOR INSERT WITH CHECK (auth.uid() = customer_id);
  END IF;
  
  -- Reviews: Users can update their own reviews within edit window
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'reviews' AND policyname = 'Users can edit their own reviews') THEN
    CREATE POLICY "Users can edit their own reviews" ON public.reviews
      FOR UPDATE USING (
        auth.uid() = customer_id AND 
        (edit_expires IS NULL OR edit_expires > now())
      );
  END IF;
  
  -- Reviews: Business owners can read all reviews for their businesses
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'reviews' AND policyname = 'Business owners can read their reviews') THEN
    CREATE POLICY "Business owners can read their reviews" ON public.reviews
      FOR SELECT USING (public.owns_business(business_id));
  END IF;
END $$;
-- 8. Create RLS policies for review_replies (only if not exists)
DO $$
BEGIN
  -- Reply: Everyone can read replies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'review_replies' AND policyname = 'Review replies are publicly readable') THEN
    CREATE POLICY "Review replies are publicly readable" ON public.review_replies
      FOR SELECT USING (true);
  END IF;
  
  -- Reply: Business owners can create replies for their business reviews
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
  
  -- Reply: Business owners can update their own replies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'review_replies' AND policyname = 'Business owners can update their replies') THEN
    CREATE POLICY "Business owners can update their replies" ON public.review_replies
      FOR UPDATE USING (auth.uid() = owner_id);
  END IF;
END $$;
-- 9. Create RLS policies for review_helpful (only if not exists)
DO $$
BEGIN
  -- Helpful: Everyone can read helpful counts
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'review_helpful' AND policyname = 'Helpful votes are publicly readable') THEN
    CREATE POLICY "Helpful votes are publicly readable" ON public.review_helpful
      FOR SELECT USING (true);
  END IF;
  
  -- Helpful: Authenticated users can vote
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'review_helpful' AND policyname = 'Users can vote helpful') THEN
    CREATE POLICY "Users can vote helpful" ON public.review_helpful
      FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;
-- 10. Create RLS policies for review_reports (only if not exists)
DO $$
BEGIN
  -- Reports: Users can create reports
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'review_reports' AND policyname = 'Users can report reviews') THEN
    CREATE POLICY "Users can report reviews" ON public.review_reports
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  
  -- Reports: Users can read their own reports
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'review_reports' AND policyname = 'Users can read their own reports') THEN
    CREATE POLICY "Users can read their own reports" ON public.review_reports
      FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;
-- 11. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_reviews_business_id_status ON public.reviews(business_id, status);
CREATE INDEX IF NOT EXISTS idx_reviews_customer_id ON public.reviews(customer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON public.reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON public.reviews(rating);
CREATE INDEX IF NOT EXISTS idx_review_replies_review_id ON public.review_replies(review_id);
CREATE INDEX IF NOT EXISTS idx_review_helpful_review_id ON public.review_helpful(review_id);
CREATE INDEX IF NOT EXISTS idx_review_reports_status ON public.review_reports(status);
-- 12. Create trigger to automatically set edit_expires on insert
CREATE OR REPLACE FUNCTION public.set_review_edit_expires()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Set edit window to 15 minutes from creation
  NEW.edit_expires = NEW.created_at + interval '15 minutes';
  RETURN NEW;
END;
$$;
-- Create trigger only if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_review_edit_expires_trigger') THEN
    CREATE TRIGGER set_review_edit_expires_trigger
      BEFORE INSERT ON public.reviews
      FOR EACH ROW
      EXECUTE FUNCTION public.set_review_edit_expires();
  END IF;
END $$;
-- 13. Create trigger to set verified status based on completed orders
CREATE OR REPLACE FUNCTION public.set_review_verified()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check if customer has completed orders for this business
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
-- Create trigger only if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_review_verified_trigger') THEN
    CREATE TRIGGER set_review_verified_trigger
      BEFORE INSERT ON public.reviews
      FOR EACH ROW
      EXECUTE FUNCTION public.set_review_verified();
  END IF;
END $$;
