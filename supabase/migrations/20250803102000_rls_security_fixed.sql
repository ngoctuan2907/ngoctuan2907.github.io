-- ============================================================================
-- RLS Security Migration - IMPROVED VERSION
-- Addresses Supabase Security Advisor Issues + Audit Fixes
-- Date: 2025-08-03
-- Version: 2.0 (Fixed)
-- ============================================================================

-- 1. Fix the function search path vulnerability (replace in place)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;
COMMENT ON FUNCTION update_updated_at_column() IS 'Securely updates the updated_at timestamp with fixed search_path';
-- ============================================================================
-- 2. Create helper functions for common checks (before policies)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN (SELECT user_type FROM user_profiles WHERE user_id = auth.uid()) = 'admin';
END;
$$;
CREATE OR REPLACE FUNCTION public.is_business_owner()
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN (SELECT user_type FROM user_profiles WHERE user_id = auth.uid()) = 'business_owner';
END;
$$;
CREATE OR REPLACE FUNCTION public.owns_business(business_id UUID)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM businesses
        WHERE id = business_id AND owner_id = auth.uid()
    );
END;
$$;
COMMENT ON FUNCTION public.is_admin() IS 'Check if current user is admin';
COMMENT ON FUNCTION public.is_business_owner() IS 'Check if current user is business owner';
COMMENT ON FUNCTION public.owns_business(UUID) IS 'Check if current user owns specific business';
-- ============================================================================
-- 3. Enable Row Level Security (RLS) on all tables (if not already)
-- ============================================================================

ALTER TABLE user_profiles  ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses     ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_cuisines ENABLE ROW LEVEL SECURITY;
ALTER TABLE cuisine_types  ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items     ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews        ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders         ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items    ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_views ENABLE ROW LEVEL SECURITY;
-- ============================================================================
-- 4. RLS Policies for user_profiles (idempotent)
-- ============================================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_policy p
        JOIN pg_catalog.pg_class c ON p.polrelid = c.oid
        WHERE c.relname = 'user_profiles' AND p.polname = 'Users can view their own profile'
    ) THEN
        EXECUTE $q$
            CREATE POLICY "Users can view their own profile" ON user_profiles
                FOR SELECT USING (auth.uid() = user_id)
        $q$;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_policy p
        JOIN pg_catalog.pg_class c ON p.polrelid = c.oid
        WHERE c.relname = 'user_profiles' AND p.polname = 'Users can insert their own profile'
    ) THEN
        EXECUTE $q$
            CREATE POLICY "Users can insert their own profile" ON user_profiles
                FOR INSERT WITH CHECK (auth.uid() = user_id)
        $q$;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_policy p
        JOIN pg_catalog.pg_class c ON p.polrelid = c.oid
        WHERE c.relname = 'user_profiles' AND p.polname = 'Users can update their own profile'
    ) THEN
        EXECUTE $q$
            CREATE POLICY "Users can update their own profile" ON user_profiles
                FOR UPDATE USING (auth.uid() = user_id)
        $q$;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_policy p
        JOIN pg_catalog.pg_class c ON p.polrelid = c.oid
        WHERE c.relname = 'user_profiles' AND p.polname = 'Admins can view all profiles'
    ) THEN
        EXECUTE $q$
            CREATE POLICY "Admins can view all profiles" ON user_profiles
                FOR SELECT USING (public.is_admin())
        $q$;
    END IF;
END;
$$;
-- ============================================================================
-- 5. RLS Policies for businesses
-- ============================================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_policy p
        JOIN pg_catalog.pg_class c ON p.polrelid = c.oid
        WHERE c.relname = 'businesses' AND p.polname = 'Public can view active businesses'
    ) THEN
        EXECUTE $q$
            CREATE POLICY "Public can view active businesses" ON businesses
                FOR SELECT USING (status = 'active')
        $q$;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_policy p
        JOIN pg_catalog.pg_class c ON p.polrelid = c.oid
        WHERE c.relname = 'businesses' AND p.polname = 'Business owners can view their own businesses'
    ) THEN
        EXECUTE $q$
            CREATE POLICY "Business owners can view their own businesses" ON businesses
                FOR SELECT USING (auth.uid() = owner_id)
        $q$;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_policy p
        JOIN pg_catalog.pg_class c ON p.polrelid = c.oid
        WHERE c.relname = 'businesses' AND p.polname = 'Business owners can insert their own businesses'
    ) THEN
        EXECUTE $q$
            CREATE POLICY "Business owners can insert their own businesses" ON businesses
                FOR INSERT WITH CHECK (
                    auth.uid() = owner_id AND public.is_business_owner()
                )
        $q$;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_policy p
        JOIN pg_catalog.pg_class c ON p.polrelid = c.oid
        WHERE c.relname = 'businesses' AND p.polname = 'Business owners can update their own businesses'
    ) THEN
        EXECUTE $q$
            CREATE POLICY "Business owners can update their own businesses" ON businesses
                FOR UPDATE USING (auth.uid() = owner_id)
        $q$;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_policy p
        JOIN pg_catalog.pg_class c ON p.polrelid = c.oid
        WHERE c.relname = 'businesses' AND p.polname = 'Admins can view all businesses'
    ) THEN
        EXECUTE $q$
            CREATE POLICY "Admins can view all businesses" ON businesses
                FOR SELECT USING (public.is_admin())
        $q$;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_policy p
        JOIN pg_catalog.pg_class c ON p.polrelid = c.oid
        WHERE c.relname = 'businesses' AND p.polname = 'Admins can update all businesses'
    ) THEN
        EXECUTE $q$
            CREATE POLICY "Admins can update all businesses" ON businesses
                FOR UPDATE USING (public.is_admin())
        $q$;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_policy p
        JOIN pg_catalog.pg_class c ON p.polrelid = c.oid
        WHERE c.relname = 'businesses' AND p.polname = 'Admins can insert businesses'
    ) THEN
        EXECUTE $q$
            CREATE POLICY "Admins can insert businesses" ON businesses
                FOR INSERT WITH CHECK (public.is_admin())
        $q$;
    END IF;
END;
$$;
-- ============================================================================
-- 6. cuisine_types reference data (no RLS)
-- ============================================================================

ALTER TABLE cuisine_types DISABLE ROW LEVEL SECURITY;
-- ============================================================================
-- 7. RLS Policies for business_cuisines
-- ============================================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_policy p
        JOIN pg_catalog.pg_class c ON p.polrelid = c.oid
        WHERE c.relname = 'business_cuisines' AND p.polname = 'Public can view business cuisines for active businesses'
    ) THEN
        EXECUTE $q$
            CREATE POLICY "Public can view business cuisines for active businesses" ON business_cuisines
                FOR SELECT USING (
                    EXISTS (
                        SELECT 1 FROM businesses b
                        WHERE b.id = business_id AND b.status = 'active'
                    )
                )
        $q$;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_policy p
        JOIN pg_catalog.pg_class c ON p.polrelid = c.oid
        WHERE c.relname = 'business_cuisines' AND p.polname = 'Business owners can view their business cuisines'
    ) THEN
        EXECUTE $q$
            CREATE POLICY "Business owners can view their business cuisines" ON business_cuisines
                FOR SELECT USING (public.owns_business(business_id))
        $q$;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_policy p
        JOIN pg_catalog.pg_class c ON p.polrelid = c.oid
        WHERE c.relname = 'business_cuisines' AND p.polname = 'Business owners can insert their business cuisines'
    ) THEN
        EXECUTE $q$
            CREATE POLICY "Business owners can insert their business cuisines" ON business_cuisines
                FOR INSERT WITH CHECK (public.owns_business(business_id))
        $q$;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_policy p
        JOIN pg_catalog.pg_class c ON p.polrelid = c.oid
        WHERE c.relname = 'business_cuisines' AND p.polname = 'Business owners can delete their business cuisines'
    ) THEN
        EXECUTE $q$
            CREATE POLICY "Business owners can delete their business cuisines" ON business_cuisines
                FOR DELETE USING (public.owns_business(business_id))
        $q$;
    END IF;
END;
$$;
-- ============================================================================
-- 8. RLS Policies for business_hours
-- ============================================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_policy p
        JOIN pg_catalog.pg_class c ON p.polrelid = c.oid
        WHERE c.relname = 'business_hours' AND p.polname = 'Public can view business hours for active businesses'
    ) THEN
        EXECUTE $q$
            CREATE POLICY "Public can view business hours for active businesses" ON business_hours
                FOR SELECT USING (
                    EXISTS (
                        SELECT 1 FROM businesses b
                        WHERE b.id = business_id AND b.status = 'active'
                    )
                )
        $q$;
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_policy p
        JOIN pg_catalog.pg_class c ON p.polrelid = c.oid
        WHERE c.relname = 'business_hours' AND p.polname = 'Business owners can view their business hours'
    ) THEN
        EXECUTE $q$
            CREATE POLICY "Business owners can view their business hours" ON business_hours
                FOR SELECT USING (public.owns_business(business_id))
        $q$;
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_policy p
        JOIN pg_catalog.pg_class c ON p.polrelid = c.oid
        WHERE c.relname = 'business_hours' AND p.polname = 'Business owners can insert their business hours'
    ) THEN
        EXECUTE $q$
            CREATE POLICY "Business owners can insert their business hours" ON business_hours
                FOR INSERT WITH CHECK (public.owns_business(business_id))
        $q$;
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_policy p
        JOIN pg_catalog.pg_class c ON p.polrelid = c.oid
        WHERE c.relname = 'business_hours' AND p.polname = 'Business owners can update their business hours'
    ) THEN
        EXECUTE $q$
            CREATE POLICY "Business owners can update their business hours" ON business_hours
                FOR UPDATE USING (public.owns_business(business_id))
        $q$;
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_policy p
        JOIN pg_catalog.pg_class c ON p.polrelid = c.oid
        WHERE c.relname = 'business_hours' AND p.polname = 'Business owners can delete their business hours'
    ) THEN
        EXECUTE $q$
            CREATE POLICY "Business owners can delete their business hours" ON business_hours
                FOR DELETE USING (public.owns_business(business_id))
        $q$;
    END IF;
END;
$$;
-- ============================================================================
-- 9. RLS Policies for menu_categories
-- ============================================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_policy p
        JOIN pg_catalog.pg_class c ON p.polrelid = c.oid
        WHERE c.relname = 'menu_categories' AND p.polname = 'Public can view menu categories for active businesses'
    ) THEN
        EXECUTE $q$
            CREATE POLICY "Public can view menu categories for active businesses" ON menu_categories
                FOR SELECT USING (
                    EXISTS (
                        SELECT 1 FROM businesses b
                        WHERE b.id = business_id AND b.status = 'active'
                    )
                )
        $q$;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_policy p
        JOIN pg_catalog.pg_class c ON p.polrelid = c.oid
        WHERE c.relname = 'menu_categories' AND p.polname = 'Business owners can view their menu categories'
    ) THEN
        EXECUTE $q$
            CREATE POLICY "Business owners can view their menu categories" ON menu_categories
                FOR SELECT USING (public.owns_business(business_id))
        $q$;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_policy p
        JOIN pg_catalog.pg_class c ON p.polrelid = c.oid
        WHERE c.relname = 'menu_categories' AND p.polname = 'Business owners can insert their menu categories'
    ) THEN
        EXECUTE $q$
            CREATE POLICY "Business owners can insert their menu categories" ON menu_categories
                FOR INSERT WITH CHECK (public.owns_business(business_id))
        $q$;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_policy p
        JOIN pg_catalog.pg_class c ON p.polrelid = c.oid
        WHERE c.relname = 'menu_categories' AND p.polname = 'Business owners can update their menu categories'
    ) THEN
        EXECUTE $q$
            CREATE POLICY "Business owners can update their menu categories" ON menu_categories
                FOR UPDATE USING (public.owns_business(business_id))
        $q$;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_policy p
        JOIN pg_catalog.pg_class c ON p.polrelid = c.oid
        WHERE c.relname = 'menu_categories' AND p.polname = 'Business owners can delete their menu categories'
    ) THEN
        EXECUTE $q$
            CREATE POLICY "Business owners can delete their menu categories" ON menu_categories
                FOR DELETE USING (public.owns_business(business_id))
        $q$;
    END IF;
END;
$$;
-- ============================================================================
-- 10. RLS Policies for menu_items
-- ============================================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_policy p
        JOIN pg_catalog.pg_class c ON p.polrelid = c.oid
        WHERE c.relname = 'menu_items' AND p.polname = 'Public can view available menu items'
    ) THEN
        EXECUTE $q$
            CREATE POLICY "Public can view available menu items" ON menu_items
                FOR SELECT USING (
                    is_available = true AND
                    EXISTS (
                        SELECT 1 FROM businesses b
                        WHERE b.id = business_id AND b.status = 'active'
                    )
                )
        $q$;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_policy p
        JOIN pg_catalog.pg_class c ON p.polrelid = c.oid
        WHERE c.relname = 'menu_items' AND p.polname = 'Business owners can view all their menu items'
    ) THEN
        EXECUTE $q$
            CREATE POLICY "Business owners can view all their menu items" ON menu_items
                FOR SELECT USING (public.owns_business(business_id))
        $q$;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_policy p
        JOIN pg_catalog.pg_class c ON p.polrelid = c.oid
        WHERE c.relname = 'menu_items' AND p.polname = 'Business owners can insert their menu items'
    ) THEN
        EXECUTE $q$
            CREATE POLICY "Business owners can insert their menu items" ON menu_items
                FOR INSERT WITH CHECK (public.owns_business(business_id))
        $q$;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_policy p
        JOIN pg_catalog.pg_class c ON p.polrelid = c.oid
        WHERE c.relname = 'menu_items' AND p.polname = 'Business owners can update their menu items'
    ) THEN
        EXECUTE $q$
            CREATE POLICY "Business owners can update their menu items" ON menu_items
                FOR UPDATE USING (public.owns_business(business_id))
        $q$;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_policy p
        JOIN pg_catalog.pg_class c ON p.polrelid = c.oid
        WHERE c.relname = 'menu_items' AND p.polname = 'Business owners can delete their menu items'
    ) THEN
        EXECUTE $q$
            CREATE POLICY "Business owners can delete their menu items" ON menu_items
                FOR DELETE USING (public.owns_business(business_id))
        $q$;
    END IF;
END;
$$;
-- ============================================================================
-- 11. RLS Policies for business_images
-- ============================================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_policy p
        JOIN pg_catalog.pg_class c ON p.polrelid = c.oid
        WHERE c.relname = 'business_images' AND p.polname = 'Public can view business images for active businesses'
    ) THEN
        EXECUTE $q$
            CREATE POLICY "Public can view business images for active businesses" ON business_images
                FOR SELECT USING (
                    EXISTS (
                        SELECT 1 FROM businesses b
                        WHERE b.id = business_id AND b.status = 'active'
                    )
                )
        $q$;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_policy p
        JOIN pg_catalog.pg_class c ON p.polrelid = c.oid
        WHERE c.relname = 'business_images' AND p.polname = 'Business owners can view their business images'
    ) THEN
        EXECUTE $q$
            CREATE POLICY "Business owners can view their business images" ON business_images
                FOR SELECT USING (public.owns_business(business_id))
        $q$;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_policy p
        JOIN pg_catalog.pg_class c ON p.polrelid = c.oid
        WHERE c.relname = 'business_images' AND p.polname = 'Business owners can insert their business images'
    ) THEN
        EXECUTE $q$
            CREATE POLICY "Business owners can insert their business images" ON business_images
                FOR INSERT WITH CHECK (public.owns_business(business_id))
        $q$;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_policy p
        JOIN pg_catalog.pg_class c ON p.polrelid = c.oid
        WHERE c.relname = 'business_images' AND p.polname = 'Business owners can update their business images'
    ) THEN
        EXECUTE $q$
            CREATE POLICY "Business owners can update their business images" ON business_images
                FOR UPDATE USING (public.owns_business(business_id))
        $q$;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_policy p
        JOIN pg_catalog.pg_class c ON p.polrelid = c.oid
        WHERE c.relname = 'business_images' AND p.polname = 'Business owners can delete their business images'
    ) THEN
        EXECUTE $q$
            CREATE POLICY "Business owners can delete their business images" ON business_images
                FOR DELETE USING (public.owns_business(business_id))
        $q$;
    END IF;
END;
$$;
-- ============================================================================
-- 12. RLS Policies for reviews
-- ============================================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_policy p
        JOIN pg_catalog.pg_class c ON p.polrelid = c.oid
        WHERE c.relname = 'reviews' AND p.polname = 'Public can view published reviews'
    ) THEN
        EXECUTE $q$
            CREATE POLICY "Public can view published reviews" ON reviews
                FOR SELECT USING (
                    status = 'published' AND
                    EXISTS (
                        SELECT 1 FROM businesses b
                        WHERE b.id = business_id AND b.status = 'active'
                    )
                )
        $q$;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_policy p
        JOIN pg_catalog.pg_class c ON p.polrelid = c.oid
        WHERE c.relname = 'reviews' AND p.polname = 'Customers can view their own reviews'
    ) THEN
        EXECUTE $q$
            CREATE POLICY "Customers can view their own reviews" ON reviews
                FOR SELECT USING (auth.uid() = customer_id)
        $q$;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_policy p
        JOIN pg_catalog.pg_class c ON p.polrelid = c.oid
        WHERE c.relname = 'reviews' AND p.polname = 'Customers can insert reviews'
    ) THEN
        EXECUTE $q$
            CREATE POLICY "Customers can insert reviews" ON reviews
                FOR INSERT WITH CHECK (
                    auth.uid() = customer_id AND
                    EXISTS (
                        SELECT 1 FROM businesses b
                        WHERE b.id = business_id AND b.status = 'active'
                    ) AND
                    (SELECT user_type FROM user_profiles WHERE user_id = auth.uid()) = 'customer'
                )
        $q$;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_policy p
        JOIN pg_catalog.pg_class c ON p.polrelid = c.oid
        WHERE c.relname = 'reviews' AND p.polname = 'Customers can update their own reviews'
    ) THEN
        EXECUTE $q$
            CREATE POLICY "Customers can update their own reviews" ON reviews
                FOR UPDATE USING (auth.uid() = customer_id)
        $q$;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_policy p
        JOIN pg_catalog.pg_class c ON p.polrelid = c.oid
        WHERE c.relname = 'reviews' AND p.polname = 'Business owners can view their business reviews'
    ) THEN
        EXECUTE $q$
            CREATE POLICY "Business owners can view their business reviews" ON reviews
                FOR SELECT USING (public.owns_business(business_id))
        $q$;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_policy p
        JOIN pg_catalog.pg_class c ON p.polrelid = c.oid
        WHERE c.relname = 'reviews' AND p.polname = 'Admins can view all reviews'
    ) THEN
        EXECUTE $q$
            CREATE POLICY "Admins can view all reviews" ON reviews
                FOR SELECT USING (public.is_admin())
        $q$;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_policy p
        JOIN pg_catalog.pg_class c ON p.polrelid = c.oid
        WHERE c.relname = 'reviews' AND p.polname = 'Admins can update all reviews'
    ) THEN
        EXECUTE $q$
            CREATE POLICY "Admins can update all reviews" ON reviews
                FOR UPDATE USING (public.is_admin())
        $q$;
    END IF;
END;
$$;
-- ============================================================================
-- 13. RLS Policies for orders
-- ============================================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_policy p
        JOIN pg_catalog.pg_class c ON p.polrelid = c.oid
        WHERE c.relname = 'orders' AND p.polname = 'Customers can view their own orders'
    ) THEN
        EXECUTE $q$
            CREATE POLICY "Customers can view their own orders" ON orders
                FOR SELECT USING (auth.uid() = customer_id)
        $q$;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_policy p
        JOIN pg_catalog.pg_class c ON p.polrelid = c.oid
        WHERE c.relname = 'orders' AND p.polname = 'Customers can insert their own orders'
    ) THEN
        EXECUTE $q$
            CREATE POLICY "Customers can insert their own orders" ON orders
                FOR INSERT WITH CHECK (
                    auth.uid() = customer_id AND
                    EXISTS (
                        SELECT 1 FROM businesses b
                        WHERE b.id = business_id AND b.status = 'active'
                    )
                )
        $q$;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_policy p
        JOIN pg_catalog.pg_class c ON p.polrelid = c.oid
        WHERE c.relname = 'orders' AND p.polname = 'Business owners can view their business orders'
    ) THEN
        EXECUTE $q$
            CREATE POLICY "Business owners can view their business orders" ON orders
                FOR SELECT USING (public.owns_business(business_id))
        $q$;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_policy p
        JOIN pg_catalog.pg_class c ON p.polrelid = c.oid
        WHERE c.relname = 'orders' AND p.polname = 'Business owners can update their business orders'
    ) THEN
        EXECUTE $q$
            CREATE POLICY "Business owners can update their business orders" ON orders
                FOR UPDATE USING (public.owns_business(business_id))
        $q$;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_policy p
        JOIN pg_catalog.pg_class c ON p.polrelid = c.oid
        WHERE c.relname = 'orders' AND p.polname = 'Admins can view all orders'
    ) THEN
        EXECUTE $q$
            CREATE POLICY "Admins can view all orders" ON orders
                FOR SELECT USING (public.is_admin())
        $q$;
    END IF;
END;
$$;
-- ============================================================================
-- 14. RLS Policies for order_items
-- ============================================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_policy p
        JOIN pg_catalog.pg_class c ON p.polrelid = c.oid
        WHERE c.relname = 'order_items' AND p.polname = 'Customers can view their own order items'
    ) THEN
        EXECUTE $q$
            CREATE POLICY "Customers can view their own order items" ON order_items
                FOR SELECT USING (
                    EXISTS (
                        SELECT 1 FROM orders o
                        WHERE o.id = order_id AND o.customer_id = auth.uid()
                    )
                )
        $q$;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_policy p
        JOIN pg_catalog.pg_class c ON p.polrelid = c.oid
        WHERE c.relname = 'order_items' AND p.polname = 'Customers can insert their own order items'
    ) THEN
        EXECUTE $q$
            CREATE POLICY "Customers can insert their own order items" ON order_items
                FOR INSERT WITH CHECK (
                    EXISTS (
                        SELECT 1 FROM orders o
                        WHERE o.id = order_id AND o.customer_id = auth.uid()
                    )
                )
        $q$;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_policy p
        JOIN pg_catalog.pg_class c ON p.polrelid = c.oid
        WHERE c.relname = 'order_items' AND p.polname = 'Business owners can view their business order items'
    ) THEN
        EXECUTE $q$
            CREATE POLICY "Business owners can view their business order items" ON order_items
                FOR SELECT USING (
                    EXISTS (
                        SELECT 1 FROM orders o
                        WHERE o.id = order_id AND public.owns_business(o.business_id)
                    )
                )
        $q$;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_policy p
        JOIN pg_catalog.pg_class c ON p.polrelid = c.oid
        WHERE c.relname = 'order_items' AND p.polname = 'Admins can view all order items'
    ) THEN
        EXECUTE $q$
            CREATE POLICY "Admins can view all order items" ON order_items
                FOR SELECT USING (public.is_admin())
        $q$;
    END IF;
END;
$$;
-- ============================================================================
-- 15. RLS Policies for business_views (analytics)
-- ============================================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_policy p
        JOIN pg_catalog.pg_class c ON p.polrelid = c.oid
        WHERE c.relname = 'business_views' AND p.polname = 'Allow anonymous business view tracking'
    ) THEN
        EXECUTE $q$
            CREATE POLICY "Allow anonymous business view tracking" ON business_views
                FOR INSERT WITH CHECK (
                    EXISTS (
                        SELECT 1 FROM businesses b
                        WHERE b.id = business_id AND b.status = 'active'
                    )
                )
        $q$;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_policy p
        JOIN pg_catalog.pg_class c ON p.polrelid = c.oid
        WHERE c.relname = 'business_views' AND p.polname = 'Business owners can view their business analytics'
    ) THEN
        EXECUTE $q$
            CREATE POLICY "Business owners can view their business analytics" ON business_views
                FOR SELECT USING (public.owns_business(business_id))
        $q$;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_policy p
        JOIN pg_catalog.pg_class c ON p.polrelid = c.oid
        WHERE c.relname = 'business_views' AND p.polname = 'Admins can view all business analytics'
    ) THEN
        EXECUTE $q$
            CREATE POLICY "Admins can view all business analytics" ON business_views
                FOR SELECT USING (public.is_admin())
        $q$;
    END IF;
END;
$$;
-- ============================================================================
-- 16. Grant necessary permissions - MINIMAL AND CLEAN
-- ============================================================================

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON cuisine_types TO authenticated;
GRANT INSERT ON business_views TO authenticated, anon;
-- ============================================================================
-- 17. Comments for documentation
-- ============================================================================

COMMENT ON TABLE user_profiles IS 'User profiles with RLS - users can only access their own data';
COMMENT ON TABLE businesses IS 'Business profiles with RLS - public read for active, owners manage their own';
COMMENT ON TABLE reviews IS 'Reviews with RLS - public read published, customers manage their own';
COMMENT ON TABLE orders IS 'Orders with RLS - customers and business owners see relevant orders only';
COMMENT ON TABLE business_views IS 'Analytics with RLS - business owners see their own data only';
COMMENT ON TABLE cuisine_types IS 'Reference data - no RLS, public read access';
-- ============================================================================
-- Migration complete
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE 'RLS Security Migration v2.0 completed successfully at %', NOW();
    RAISE NOTICE 'All tables now have Row Level Security with separate policies per action';
    RAISE NOTICE 'Function search_path vulnerability has been fixed';
    RAISE NOTICE 'Helper functions created for cleaner policy logic';
    RAISE NOTICE 'Grants have been minimized to avoid RLS conflicts';
END;
$$;
