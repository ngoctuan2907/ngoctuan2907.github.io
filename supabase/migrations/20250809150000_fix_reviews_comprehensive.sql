-- Fix Reviews API and Database Schema Issues
-- This migration addresses all the issues identified in the bug report

-- First, add missing columns to reviews table if they don't exist
DO $$ BEGIN
  -- Add title column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reviews' AND column_name = 'title') THEN
    ALTER TABLE public.reviews ADD COLUMN title text;
  END IF;
  
  -- Add photos column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reviews' AND column_name = 'photos') THEN
    ALTER TABLE public.reviews ADD COLUMN photos text[];
  END IF;
  
  -- Add verified column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reviews' AND column_name = 'verified') THEN
    ALTER TABLE public.reviews ADD COLUMN verified boolean DEFAULT false;
  END IF;
  
  -- Add edit_token column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reviews' AND column_name = 'edit_token') THEN
    ALTER TABLE public.reviews ADD COLUMN edit_token uuid;
  END IF;
  
  -- Add edit_expires column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reviews' AND column_name = 'edit_expires') THEN
    ALTER TABLE public.reviews ADD COLUMN edit_expires timestamptz;
  END IF;
END $$;
-- Create indexes for performance if they don't exist
CREATE INDEX IF NOT EXISTS idx_reviews_business_id ON public.reviews(business_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON public.reviews(created_at);
CREATE INDEX IF NOT EXISTS idx_reviews_edit_expires ON public.reviews(edit_expires);
-- Create review_replies table if it doesn't exist
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'review_replies') THEN
    CREATE TABLE public.review_replies (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      review_id uuid UNIQUE NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
      owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      body text NOT NULL,
      created_at timestamptz DEFAULT now()
    );
    ALTER TABLE public.review_replies ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;
-- Create review_helpful table if it doesn't exist
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'review_helpful') THEN
    CREATE TABLE public.review_helpful (
      review_id uuid NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
      user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      created_at timestamptz DEFAULT now(),
      PRIMARY KEY (review_id, user_id)
    );
    ALTER TABLE public.review_helpful ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;
-- Create review_reports table if it doesn't exist
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'review_reports') THEN
    CREATE TABLE public.review_reports (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      review_id uuid NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
      user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      reason text,
      created_at timestamptz DEFAULT now()
    );
    ALTER TABLE public.review_reports ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;
-- Create or replace the helper function with proper security
CREATE OR REPLACE FUNCTION public.owns_business(business_id uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER SET search_path = public, pg_temp AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.businesses b
    WHERE b.id = owns_business.business_id AND b.owner_id = auth.uid()
  );
$$;
-- Create policies using catalog checks (no IF NOT EXISTS on CREATE POLICY)
DO $$ BEGIN
  -- Reviews policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='reviews' AND policyname='public_can_view_published_reviews'
  ) THEN
    CREATE POLICY public_can_view_published_reviews ON public.reviews
      FOR SELECT USING (
        status = 'published' AND EXISTS (
          SELECT 1 FROM public.businesses b WHERE b.id = business_id AND b.status = 'active'
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='reviews' AND policyname='customers_can_insert_reviews'
  ) THEN
    CREATE POLICY customers_can_insert_reviews ON public.reviews
      FOR INSERT WITH CHECK (
        auth.uid() = customer_id AND EXISTS (
          SELECT 1 FROM public.businesses b WHERE b.id = business_id AND b.status = 'active'
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='reviews' AND policyname='customers_can_update_their_own_reviews'
  ) THEN
    CREATE POLICY customers_can_update_their_own_reviews ON public.reviews
      FOR UPDATE USING (auth.uid() = customer_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='reviews' AND policyname='owners_can_view_business_reviews'
  ) THEN
    CREATE POLICY owners_can_view_business_reviews ON public.reviews
      FOR SELECT USING (public.owns_business(business_id));
  END IF;

  -- Review replies policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='review_replies' AND policyname='reply_insert_owner'
  ) THEN
    CREATE POLICY reply_insert_owner ON public.review_replies
      FOR INSERT TO authenticated
      WITH CHECK (public.owns_business((SELECT r.business_id FROM public.reviews r WHERE r.id = review_id)));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='review_replies' AND policyname='reply_select_public'
  ) THEN
    CREATE POLICY reply_select_public ON public.review_replies FOR SELECT USING (true);
  END IF;

  -- Review helpful policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='review_helpful' AND policyname='helpful_insert_self'
  ) THEN
    CREATE POLICY helpful_insert_self ON public.review_helpful FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='review_helpful' AND policyname='helpful_delete_self'
  ) THEN
    CREATE POLICY helpful_delete_self ON public.review_helpful FOR DELETE TO authenticated USING (auth.uid() = user_id);
  END IF;

  -- Review reports policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='review_reports' AND policyname='review_reports_insert_self'
  ) THEN
    CREATE POLICY review_reports_insert_self ON public.review_reports FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='review_reports' AND policyname='review_reports_select_all'
  ) THEN
    CREATE POLICY review_reports_select_all ON public.review_reports FOR SELECT USING (true);
  END IF;
END $$;
