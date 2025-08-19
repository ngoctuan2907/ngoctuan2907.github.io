-- Reviews extras: columns + indexes
ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS title text,
  ADD COLUMN IF NOT EXISTS comment text,
  ADD COLUMN IF NOT EXISTS photos text[],
  ADD COLUMN IF NOT EXISTS verified boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS edit_token uuid,
  ADD COLUMN IF NOT EXISTS edit_expires timestamptz;
CREATE INDEX IF NOT EXISTS idx_reviews_business_id ON public.reviews(business_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON public.reviews(created_at);
CREATE INDEX IF NOT EXISTS idx_reviews_edit_expires ON public.reviews(edit_expires);
-- Owner reply (one per review)
DO $$ BEGIN
  CREATE TABLE IF NOT EXISTS public.review_replies (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id uuid NOT NULL UNIQUE REFERENCES public.reviews(id) ON DELETE CASCADE,
    owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    body text NOT NULL,
    created_at timestamptz DEFAULT now()
  );
EXCEPTION WHEN duplicate_table THEN NULL; END $$;
ALTER TABLE public.review_replies ENABLE ROW LEVEL SECURITY;
-- Helpful votes (toggle)
DO $$ BEGIN
  CREATE TABLE IF NOT EXISTS public.review_helpful (
    review_id uuid NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at timestamptz DEFAULT now(),
    PRIMARY KEY (review_id, user_id)
  );
EXCEPTION WHEN duplicate_table THEN NULL; END $$;
ALTER TABLE public.review_helpful ENABLE ROW LEVEL SECURITY;
-- Reports
DO $$ BEGIN
  CREATE TABLE IF NOT EXISTS public.review_reports (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id uuid NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reason text,
    created_at timestamptz DEFAULT now()
  );
EXCEPTION WHEN duplicate_table THEN NULL; END $$;
ALTER TABLE public.review_reports ENABLE ROW LEVEL SECURITY;
-- Helper function expected by APIs/policies
CREATE OR REPLACE FUNCTION public.owns_business(business_id uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.businesses b
    WHERE b.id = owns_business.business_id AND b.owner_id = auth.uid()
  );
$$;
-- Policies (use catalog checks instead of IF NOT EXISTS)
-- Reviews: public can read published reviews of active businesses
DO $$ BEGIN
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
END $$;
-- Customers can insert/update their own reviews
DO $$ BEGIN
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
END $$;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='reviews' AND policyname='customers_can_update_their_own_reviews'
  ) THEN
    CREATE POLICY customers_can_update_their_own_reviews ON public.reviews
      FOR UPDATE USING (auth.uid() = customer_id);
  END IF;
END $$;
-- Owners can read reviews of their own business
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='reviews' AND policyname='owners_can_view_business_reviews'
  ) THEN
    CREATE POLICY owners_can_view_business_reviews ON public.reviews
      FOR SELECT USING (public.owns_business(business_id));
  END IF;
END $$;
-- review_replies: only owners can insert/select their cafe replies
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='review_replies' AND policyname='reply_insert_owner'
  ) THEN
    CREATE POLICY reply_insert_owner ON public.review_replies
      FOR INSERT TO authenticated
      WITH CHECK (public.owns_business((SELECT r.business_id FROM public.reviews r WHERE r.id = review_id)));
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='review_replies' AND policyname='reply_select_public'
  ) THEN
    CREATE POLICY reply_select_public ON public.review_replies
      FOR SELECT USING (true);
  END IF;
END $$;
-- review_helpful: users can toggle their own vote
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='review_helpful' AND policyname='helpful_insert_self'
  ) THEN
    CREATE POLICY helpful_insert_self ON public.review_helpful
      FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='review_helpful' AND policyname='helpful_delete_self'
  ) THEN
    CREATE POLICY helpful_delete_self ON public.review_helpful
      FOR DELETE TO authenticated USING (auth.uid() = user_id);
  END IF;
END $$;
-- review_reports: anyone signed-in can insert; all can read (for moderation)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='review_reports' AND policyname='review_reports_insert_self'
  ) THEN
    CREATE POLICY review_reports_insert_self ON public.review_reports
      FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='review_reports' AND policyname='review_reports_select_all'
  ) THEN
    CREATE POLICY review_reports_select_all ON public.review_reports
      FOR SELECT USING (true);
  END IF;
END $$;
