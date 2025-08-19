-- ============================================================================
-- RLS Security Migration (clean, safe replacement)
-- Addresses Supabase Security Advisor Issues
-- Date: 2025-08-03
-- ============================================================================

-- 0. Helper functions (placed in public to avoid schema permission issues)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_id = auth.uid() AND user_type = 'admin'
    );
END;
$$;
CREATE OR REPLACE FUNCTION public.is_business_owner()
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_id = auth.uid() AND user_type = 'business_owner'
    );
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
-- 1. Fix the function search path vulnerability by replacing it in-place
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
-- 2. Enable Row Level Security (RLS) on all relevant tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_cuisines ENABLE ROW LEVEL SECURITY;
ALTER TABLE cuisine_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_views ENABLE ROW LEVEL SECURITY;
-- 3. Policies for user_profiles
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_policy p
        JOIN pg_catalog.pg_class c ON p.polrelid = c.oid
        WHERE c.relname = 'user_profiles' AND p.polname = 'users_can_view_their_own_profile'
    ) THEN
        EXECUTE format($f$
            CREATE POLICY "users_can_view_their_own_profile" ON user_profiles
                FOR SELECT USING (auth.uid() = user_id)
        $f$);
    END IF;
END;
$$;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_policy p
        JOIN pg_catalog.pg_class c ON p.polrelid = c.oid
        WHERE c.relname = 'user_profiles' AND p.polname = 'users_can_insert_their_own_profile'
    ) THEN
        EXECUTE format($f$
            CREATE POLICY "users_can_insert_their_own_profile" ON user_profiles
                FOR INSERT WITH CHECK (auth.uid() = user_id)
        $f$);
    END IF;
END;
$$;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_policy p
        JOIN pg_catalog.pg_class c ON p.polrelid = c.oid
        WHERE c.relname = 'user_profiles' AND p.polname = 'users_can_update_their_own_profile'
    ) THEN
        EXECUTE format($f$
            CREATE POLICY "users_can_update_their_own_profile" ON user_profiles
                FOR UPDATE USING (auth.uid() = user_id)
        $f$);
    END IF;
END;
$$;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_policy p
        JOIN pg_catalog.pg_class c ON p.polrelid = c.oid
        WHERE c.relname = 'user_profiles' AND p.polname = 'admins_can_view_all_profiles'
    ) THEN
        EXECUTE format($f$
            CREATE POLICY "admins_can_view_all_profiles" ON user_profiles
                FOR SELECT USING (public.is_admin())
        $f$);
    END IF;
END;
$$;
-- 4. Policies for businesses
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_policy p
        JOIN pg_catalog.pg_class c ON p.polrelid = c.oid
        WHERE c.relname = 'businesses' AND p.polname = 'public_can_view_active_businesses'
    ) THEN
        EXECUTE format($f$
            CREATE POLICY "public_can_view_active_businesses" ON businesses
                FOR SELECT USING (status = 'active')
        $f$);
    END IF;
END;
$$;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_policy p
        JOIN pg_catalog.pg_class c ON p.polrelid = c.oid
        WHERE c.relname = 'businesses' AND p.polname = 'owners_can_view_their_businesses'
    ) THEN
        EXECUTE format($f$
            CREATE POLICY "owners_can_view_their_businesses" ON businesses
                FOR SELECT USING (auth.uid() = owner_id)
        $f$);
    END IF;
END;
$$;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_policy p
        JOIN pg_catalog.pg_class c ON p.polrelid = c.oid
        WHERE c.relname = 'businesses' AND p.polname = 'owners_can_insert_their_businesses'
    ) THEN
        EXECUTE format($f$
            CREATE POLICY "owners_can_insert_their_businesses" ON businesses
                FOR INSERT WITH CHECK (
                    auth.uid() = owner_id AND
                    EXISTS (
                        SELECT 1 FROM user_profiles up
                        WHERE up.user_id = auth.uid() AND up.user_type = 'business_owner'
                    )
                )
        $f$);
    END IF;
END;
$$;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_policy p
        JOIN pg_catalog.pg_class c ON p.polrelid = c.oid
        WHERE c.relname = 'businesses' AND p.polname = 'owners_can_update_their_businesses'
    ) THEN
        EXECUTE format($f$
            CREATE POLICY "owners_can_update_their_businesses" ON businesses
                FOR UPDATE USING (auth.uid() = owner_id)
        $f$);
    END IF;
END;
$$;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_policy p
        JOIN pg_catalog.pg_class c ON p.polrelid = c.oid
        WHERE c.relname = 'businesses' AND p.polname = 'admins_can_manage_all_businesses'
    ) THEN
        EXECUTE format($f$
            CREATE POLICY "admins_can_manage_all_businesses" ON businesses
                FOR ALL USING (public.is_admin())
        $f$);
    END IF;
END;
$$;
-- 5. Reference data: cuisine_types
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_policy p
        JOIN pg_catalog.pg_class c ON p.polrelid = c.oid
        WHERE c.relname = 'cuisine_types' AND p.polname = 'public_can_view_cuisine_types'
    ) THEN
        EXECUTE format($f$
            CREATE POLICY "public_can_view_cuisine_types" ON cuisine_types
                FOR SELECT USING (true)
        $f$);
    END IF;
END;
$$;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_policy p
        JOIN pg_catalog.pg_class c ON p.polrelid = c.oid
        WHERE c.relname = 'cuisine_types' AND p.polname = 'admins_can_manage_cuisine_types'
    ) THEN
        EXECUTE format($f$
            CREATE POLICY "admins_can_manage_cuisine_types" ON cuisine_types
                FOR ALL USING (public.is_admin())
        $f$);
    END IF;
END;
$$;
-- 6. business_cuisines
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_policy p
        JOIN pg_catalog.pg_class c ON p.polrelid = c.oid
        WHERE c.relname = 'business_cuisines' AND p.polname = 'public_can_view_business_cuisines'
    ) THEN
        EXECUTE format($f$
            CREATE POLICY "public_can_view_business_cuisines" ON business_cuisines
                FOR SELECT USING (
                    EXISTS (
                        SELECT 1 FROM businesses b
                        WHERE b.id = business_id AND b.status = 'active'
                    )
                )
        $f$);
    END IF;
END;
$$;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_policy p
        JOIN pg_catalog.pg_class c ON p.polrelid = c.oid
        WHERE c.relname = 'business_cuisines' AND p.polname = 'owners_can_manage_their_business_cuisines'
    ) THEN
        EXECUTE format($f$
            CREATE POLICY "owners_can_manage_their_business_cuisines" ON business_cuisines
                FOR ALL USING (
                    EXISTS (
                        SELECT 1 FROM businesses b
                        WHERE b.id = business_id AND b.owner_id = auth.uid()
                    )
                )
        $f$);
    END IF;
END;
$$;
-- 7. business_hours
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_policy p
        JOIN pg_catalog.pg_class c ON p.polrelid = c.oid
        WHERE c.relname = 'business_hours' AND p.polname = 'public_can_view_business_hours'
    ) THEN
        EXECUTE format($f$
            CREATE POLICY "public_can_view_business_hours" ON business_hours
                FOR SELECT USING (
                    EXISTS (
                        SELECT 1 FROM businesses b
                        WHERE b.id = business_id AND b.status = 'active'
                    )
                )
        $f$);
    END IF;
END;
$$;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_policy p
        JOIN pg_catalog.pg_class c ON p.polrelid = c.oid
        WHERE c.relname = 'business_hours' AND p.polname = 'owners_can_manage_their_business_hours'
    ) THEN
        EXECUTE format($f$
            CREATE POLICY "owners_can_manage_their_business_hours" ON business_hours
                FOR ALL USING (
                    EXISTS (
                        SELECT 1 FROM businesses b
                        WHERE b.id = business_id AND b.owner_id = auth.uid()
                    )
                )
        $f$);
    END IF;
END;
$$;
-- 8. menu_categories
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_policy p
        JOIN pg_catalog.pg_class c ON p.polrelid = c.oid
        WHERE c.relname = 'menu_categories' AND p.polname = 'public_can_view_menu_categories'
    ) THEN
        EXECUTE format($f$
            CREATE POLICY "public_can_view_menu_categories" ON menu_categories
                FOR SELECT USING (
                    EXISTS (
                        SELECT 1 FROM businesses b
                        WHERE b.id = business_id AND b.status = 'active'
                    )
                )
        $f$);
    END IF;
END;
$$;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_policy p
        JOIN pg_catalog.pg_class c ON p.polrelid = c.oid
        WHERE c.relname = 'menu_categories' AND p.polname = 'owners_can_manage_menu_categories'
    ) THEN
        EXECUTE format($f$
            CREATE POLICY "owners_can_manage_menu_categories" ON menu_categories
                FOR ALL USING (
                    EXISTS (
                        SELECT 1 FROM businesses b
                        WHERE b.id = business_id AND b.owner_id = auth.uid()
                    )
                )
        $f$);
    END IF;
END;
$$;
-- 9. menu_items
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_catalog.pg_policy p
        JOIN pg_catalog.pg_class c ON p.polrelid = c.oid
        WHERE c.relname = 'menu_items' AND p.polname = 'public_can_view_available_menu_items'
    ) THEN
        EXECUTE format($f$
            CREATE POLICY "public_can_view_available_menu_items" ON menu_items
                FOR SELECT USING (
                    is_available = true AND
                    EXISTS (
                        SELECT 1 FROM businesses b
                        WHERE b.id = business_id AND b.status = 'active'
                    )
                )
        $f$);
    END IF;
END;
$$;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_catalog.pg_policy p
        JOIN pg_catalog.pg_class c ON p.polrelid = c.oid
        WHERE c.relname = 'menu_items' AND p.polname = 'owners_can_view_all_their_menu_items'
    ) THEN
        EXECUTE format($f$
            CREATE POLICY "owners_can_view_all_their_menu_items" ON menu_items
                FOR SELECT USING (
                    EXISTS (
                        SELECT 1 FROM businesses b
                        WHERE b.id = business_id AND b.owner_id = auth.uid()
                    )
                )
        $f$);
    END IF;
END;
$$;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_catalog.pg_policy p
        JOIN pg_catalog.pg_class c ON p.polrelid = c.oid
        WHERE c.relname = 'menu_items' AND p.polname = 'owners_can_insert_their_menu_items'
    ) THEN
        EXECUTE format($f$
            CREATE POLICY "owners_can_insert_their_menu_items" ON menu_items
                FOR INSERT WITH CHECK (
                    EXISTS (
                        SELECT 1 FROM businesses b
                        WHERE b.id = business_id AND b.owner_id = auth.uid()
                    )
                )
        $f$);
    END IF;
END;
$$;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_catalog.pg_policy p
        JOIN pg_catalog.pg_class c ON p.polrelid = c.oid
        WHERE c.relname = 'menu_items' AND p.polname = 'owners_can_update_their_menu_items'
    ) THEN
        EXECUTE format($f$
            CREATE POLICY "owners_can_update_their_menu_items" ON menu_items
                FOR UPDATE USING (
                    EXISTS (
                        SELECT 1 FROM businesses b
                        WHERE b.id = business_id AND b.owner_id = auth.uid()
                    )
                )
        $f$);
    END IF;
END;
$$;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_catalog.pg_policy p
        JOIN pg_catalog.pg_class c ON p.polrelid = c.oid
        WHERE c.relname = 'menu_items' AND p.polname = 'owners_can_delete_their_menu_items'
    ) THEN
        EXECUTE format($f$
            CREATE POLICY "owners_can_delete_their_menu_items" ON menu_items
                FOR DELETE USING (
                    EXISTS (
                        SELECT 1 FROM businesses b
                        WHERE b.id = business_id AND b.owner_id = auth.uid()
                    )
                )
        $f$);
    END IF;
END;
$$;
-- 10. business_images
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_policy p
        JOIN pg_catalog.pg_class c ON p.polrelid = c.oid
        WHERE c.relname = 'business_images' AND p.polname = 'public_can_view_business_images'
    ) THEN
        EXECUTE format($f$
            CREATE POLICY "public_can_view_business_images" ON business_images
                FOR SELECT USING (
                    EXISTS (
                        SELECT 1 FROM businesses b
                        WHERE b.id = business_id AND b.status = 'active'
                    )
                )
        $f$);
    END IF;
END;
$$;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_policy p
        JOIN pg_catalog.pg_class c ON p.polrelid = c.oid
        WHERE c.relname = 'business_images' AND p.polname = 'owners_can_manage_their_business_images'
    ) THEN
        EXECUTE format($f$
            CREATE POLICY "owners_can_manage_their_business_images" ON business_images
                FOR ALL USING (
                    EXISTS (
                        SELECT 1 FROM businesses b
                        WHERE b.id = business_id AND b.owner_id = auth.uid()
                    )
                )
        $f$);
    END IF;
END;
$$;
-- 11. reviews
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_policy p
        JOIN pg_catalog.pg_class c ON p.polrelid = c.oid
        WHERE c.relname = 'reviews' AND p.polname = 'public_can_view_published_reviews'
    ) THEN
        EXECUTE format($f$
            CREATE POLICY "public_can_view_published_reviews" ON reviews
                FOR SELECT USING (
                    status = 'published' AND
                    EXISTS (
                        SELECT 1 FROM businesses b
                        WHERE b.id = business_id AND b.status = 'active'
                    )
                )
        $f$);
    END IF;
END;
$$;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_policy p
        JOIN pg_catalog.pg_class c ON p.polrelid = c.oid
        WHERE c.relname = 'reviews' AND p.polname = 'customers_can_view_their_own_reviews'
    ) THEN
        EXECUTE format($f$
            CREATE POLICY "customers_can_view_their_own_reviews" ON reviews
                FOR SELECT USING (auth.uid() = customer_id)
        $f$);
    END IF;
END;
$$;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_policy p
        JOIN pg_catalog.pg_class c ON p.polrelid = c.oid
        WHERE c.relname = 'reviews' AND p.polname = 'customers_can_insert_reviews'
    ) THEN
        EXECUTE format($f$
            CREATE POLICY "customers_can_insert_reviews" ON reviews
                FOR INSERT WITH CHECK (
                    auth.uid() = customer_id AND
                    EXISTS (
                        SELECT 1 FROM businesses b
                        WHERE b.id = business_id AND b.status = 'active'
                    ) AND
                    EXISTS (
                        SELECT 1 FROM user_profiles up
                        WHERE up.user_id = auth.uid() AND up.user_type = 'customer'
                    )
                )
        $f$);
    END IF;
END;
$$;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_policy p
        JOIN pg_catalog.pg_class c ON p.polrelid = c.oid
        WHERE c.relname = 'reviews' AND p.polname = 'customers_can_update_their_own_reviews'
    ) THEN
        EXECUTE format($f$
            CREATE POLICY "customers_can_update_their_own_reviews" ON reviews
                FOR UPDATE USING (auth.uid() = customer_id)
        $f$);
    END IF;
END;
$$;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_policy p
        JOIN pg_catalog.pg_class c ON p.polrelid = c.oid
        WHERE c.relname = 'reviews' AND p.polname = 'owners_can_view_business_reviews'
    ) THEN
        EXECUTE format($f$
            CREATE POLICY "owners_can_view_business_reviews" ON reviews
                FOR SELECT USING (
                    EXISTS (
                        SELECT 1 FROM businesses b
                        WHERE b.id = business_id AND b.owner_id = auth.uid()
                    )
                )
        $f$);
    END IF;
END;
$$;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_policy p
        JOIN pg_catalog.pg_class c ON p.polrelid = c.oid
        WHERE c.relname = 'reviews' AND p.polname = 'admins_can_manage_all_reviews'
    ) THEN
        EXECUTE format($f$
            CREATE POLICY "admins_can_manage_all_reviews" ON reviews
                FOR ALL USING (public.is_admin())
        $f$);
    END IF;
END;
$$;
-- 12. orders
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_policy p
        JOIN pg_catalog.pg_class c ON p.polrelid = c.oid
        WHERE c.relname = 'orders' AND p.polname = 'customers_can_view_their_own_orders'
    ) THEN
        EXECUTE format($f$
            CREATE POLICY "customers_can_view_their_own_orders" ON orders
                FOR SELECT USING (auth.uid() = customer_id)
        $f$);
    END IF;
END;
$$;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_policy p
        JOIN pg_catalog.pg_class c ON p.polrelid = c.oid
        WHERE c.relname = 'orders' AND p.polname = 'customers_can_insert_their_own_orders'
    ) THEN
        EXECUTE format($f$
            CREATE POLICY "customers_can_insert_their_own_orders" ON orders
                FOR INSERT WITH CHECK (
                    auth.uid() = customer_id AND
                    EXISTS (
                        SELECT 1 FROM businesses b
                        WHERE b.id = business_id AND b.status = 'active'
                    )
                )
        $f$);
    END IF;
END;
$$;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_policy p
        JOIN pg_catalog.pg_class c ON p.polrelid = c.oid
        WHERE c.relname = 'orders' AND p.polname = 'owners_can_view_their_business_orders'
    ) THEN
        EXECUTE format($f$
            CREATE POLICY "owners_can_view_their_business_orders" ON orders
                FOR SELECT USING (
                    EXISTS (
                        SELECT 1 FROM businesses b
                        WHERE b.id = business_id AND b.owner_id = auth.uid()
                    )
                )
        $f$);
    END IF;
END;
$$;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_policy p
        JOIN pg_catalog.pg_class c ON p.polrelid = c.oid
        WHERE c.relname = 'orders' AND p.polname = 'owners_can_update_order_status'
    ) THEN
        EXECUTE format($f$
            CREATE POLICY "owners_can_update_order_status" ON orders
                FOR UPDATE USING (
                    EXISTS (
                        SELECT 1 FROM businesses b
                        WHERE b.id = business_id AND b.owner_id = auth.uid()
                    )
                )
        $f$);
    END IF;
END;
$$;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_policy p
        JOIN pg_catalog.pg_class c ON p.polrelid = c.oid
        WHERE c.relname = 'orders' AND p.polname = 'admins_can_view_all_orders'
    ) THEN
        EXECUTE format($f$
            CREATE POLICY "admins_can_view_all_orders" ON orders
                FOR SELECT USING (public.is_admin())
        $f$);
    END IF;
END;
$$;
-- 13. order_items
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_policy p
        JOIN pg_catalog.pg_class c ON p.polrelid = c.oid
        WHERE c.relname = 'order_items' AND p.polname = 'customers_can_view_their_order_items'
    ) THEN
        EXECUTE format($f$
            CREATE POLICY "customers_can_view_their_order_items" ON order_items
                FOR SELECT USING (
                    EXISTS (
                        SELECT 1 FROM orders o
                        WHERE o.id = order_id AND o.customer_id = auth.uid()
                    )
                )
        $f$);
    END IF;
END;
$$;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_policy p
        JOIN pg_catalog.pg_class c ON p.polrelid = c.oid
        WHERE c.relname = 'order_items' AND p.polname = 'customers_can_insert_order_items'
    ) THEN
        EXECUTE format($f$
            CREATE POLICY "customers_can_insert_order_items" ON order_items
                FOR INSERT WITH CHECK (
                    EXISTS (
                        SELECT 1 FROM orders o
                        WHERE o.id = order_id AND o.customer_id = auth.uid()
                    )
                )
        $f$);
    END IF;
END;
$$;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_policy p
        JOIN pg_catalog.pg_class c ON p.polrelid = c.oid
        WHERE c.relname = 'order_items' AND p.polname = 'owners_can_view_business_order_items'
    ) THEN
        EXECUTE format($f$
            CREATE POLICY "owners_can_view_business_order_items" ON order_items
                FOR SELECT USING (
                    EXISTS (
                        SELECT 1 FROM orders o
                        JOIN businesses b ON b.id = o.business_id
                        WHERE o.id = order_id AND b.owner_id = auth.uid()
                    )
                )
        $f$);
    END IF;
END;
$$;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_policy p
        JOIN pg_catalog.pg_class c ON p.polrelid = c.oid
        WHERE c.relname = 'order_items' AND p.polname = 'admins_can_view_all_order_items'
    ) THEN
        EXECUTE format($f$
            CREATE POLICY "admins_can_view_all_order_items" ON order_items
                FOR SELECT USING (public.is_admin())
        $f$);
    END IF;
END;
$$;
-- 14. business_views (analytics)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_policy p
        JOIN pg_catalog.pg_class c ON p.polrelid = c.oid
        WHERE c.relname = 'business_views' AND p.polname = 'allow_anonymous_view_tracking'
    ) THEN
        EXECUTE format($f$
            CREATE POLICY "allow_anonymous_view_tracking" ON business_views
                FOR INSERT WITH CHECK (
                    EXISTS (
                        SELECT 1 FROM businesses b
                        WHERE b.id = business_id AND b.status = 'active'
                    )
                )
        $f$);
    END IF;
END;
$$;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_policy p
        JOIN pg_catalog.pg_class c ON p.polrelid = c.oid
        WHERE c.relname = 'business_views' AND p.polname = 'owners_can_view_their_business_analytics'
    ) THEN
        EXECUTE format($f$
            CREATE POLICY "owners_can_view_their_business_analytics" ON business_views
                FOR SELECT USING (
                    EXISTS (
                        SELECT 1 FROM businesses b
                        WHERE b.id = business_id AND b.owner_id = auth.uid()
                    )
                )
        $f$);
    END IF;
END;
$$;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_policy p
        JOIN pg_catalog.pg_class c ON p.polrelid = c.oid
        WHERE c.relname = 'business_views' AND p.polname = 'admins_can_view_all_business_analytics'
    ) THEN
        EXECUTE format($f$
            CREATE POLICY "admins_can_view_all_business_analytics" ON business_views
                FOR SELECT USING (public.is_admin())
        $f$);
    END IF;
END;
$$;
-- 15. Grants for authenticated / anon users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON cuisine_types TO authenticated;
GRANT SELECT, INSERT, UPDATE ON user_profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON businesses TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON business_cuisines TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON business_hours TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON menu_categories TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON menu_items TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON business_images TO authenticated;
GRANT SELECT, INSERT, UPDATE ON reviews TO authenticated;
GRANT SELECT, INSERT ON orders TO authenticated;
GRANT SELECT, INSERT ON order_items TO authenticated;
GRANT INSERT ON business_views TO authenticated, anon;
GRANT SELECT ON business_views TO authenticated;
-- 16. Comments for documentation
COMMENT ON TABLE user_profiles IS 'User profiles with RLS - users can only access their own data';
COMMENT ON TABLE businesses IS 'Business profiles with RLS - public read for active, owners manage their own';
COMMENT ON TABLE reviews IS 'Reviews with RLS - public read published, customers manage their own';
COMMENT ON TABLE orders IS 'Orders with RLS - customers and business owners see relevant orders only';
COMMENT ON TABLE business_views IS 'Analytics with RLS - business owners see their own data only';
-- Migration complete
DO $$
BEGIN
    RAISE NOTICE 'RLS Security Migration completed successfully at %', NOW();
    RAISE NOTICE 'All tables now have Row Level Security enabled with appropriate policies';
    RAISE NOTICE 'Function search_path vulnerability has been fixed';
END;
$$;
