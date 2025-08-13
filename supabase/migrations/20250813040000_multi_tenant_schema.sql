-- Multi-tenant, role-based, subscription-gated schema
-- Based on the requirements in .github/task-overview.md

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Platform admins table (your accounts with full access)
CREATE TABLE platform_admins (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Stakeholders table (companies/people who pay for subscriptions)
CREATE TABLE stakeholders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  stripe_customer_id TEXT,
  status TEXT NOT NULL DEFAULT 'inactive' CHECK (status IN ('inactive', 'active')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Update shops table to reference stakeholders (migration from owner_id to stakeholder_id)
ALTER TABLE businesses ADD COLUMN stakeholder_id UUID REFERENCES stakeholders(id) ON DELETE CASCADE;
ALTER TABLE businesses ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT TRUE;

-- Create role enum for memberships
CREATE TYPE role_name AS ENUM ('stakeholder_owner', 'staff', 'clerk');

-- Memberships table (maps users to roles & scopes)
CREATE TABLE memberships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stakeholder_id UUID REFERENCES stakeholders(id) ON DELETE CASCADE,
  shop_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  role role_name NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Ensure unique combinations for role assignments
  UNIQUE (user_id, role, COALESCE(stakeholder_id, '00000000-0000-0000-0000-000000000000'), 
          COALESCE(shop_id, '00000000-0000-0000-0000-000000000000'))
);

-- Subscriptions table (one per stakeholder, Stripe-driven)
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stakeholder_id UUID NOT NULL REFERENCES stakeholders(id) ON DELETE CASCADE,
  plan TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'past_due', 'canceled')),
  current_period_end TIMESTAMPTZ,
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Plan features table (entitlements per plan)
CREATE TABLE plan_features (
  plan TEXT PRIMARY KEY,
  max_shops INT NOT NULL,
  ad_tier TEXT NOT NULL CHECK (ad_tier IN ('none', 'standard', 'top'))
);

-- Vouchers table (per shop)
CREATE TABLE vouchers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percent', 'amount')),
  discount_value NUMERIC NOT NULL,
  valid_from TIMESTAMPTZ,
  valid_to TIMESTAMPTZ,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Advertisements table (per shop, controls homepage ticker)
CREATE TABLE advertisements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  tier TEXT NOT NULL CHECK (tier IN ('standard', 'top')),
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ NOT NULL,
  priority INT NOT NULL DEFAULT 0,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert default plan features
INSERT INTO plan_features (plan, max_shops, ad_tier) VALUES
  ('basic', 1, 'none'),
  ('pro', 5, 'standard'),
  ('enterprise', 50, 'top');

-- Helper functions for RLS
CREATE OR REPLACE FUNCTION is_platform_admin(uid UUID)
RETURNS BOOLEAN LANGUAGE SQL STABLE AS
$$ SELECT EXISTS(SELECT 1 FROM platform_admins WHERE user_id = uid) $$;

-- Function to check shop quota
CREATE OR REPLACE FUNCTION can_create_shop(_stakeholder UUID)
RETURNS BOOLEAN LANGUAGE SQL STABLE AS $$
  SELECT COALESCE(pf.max_shops, 0) > (
    SELECT COUNT(*) FROM businesses s WHERE s.stakeholder_id = _stakeholder
  )
  FROM subscriptions sub
  JOIN plan_features pf ON pf.plan = sub.plan
  WHERE sub.stakeholder_id = _stakeholder
    AND sub.status = 'active'
$$;

-- Trigger function to check shop quota
CREATE OR REPLACE FUNCTION trg_check_shop_quota()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.stakeholder_id IS NOT NULL AND NOT can_create_shop(NEW.stakeholder_id) THEN
    RAISE EXCEPTION 'Shop quota exceeded for stakeholder %', NEW.stakeholder_id;
  END IF;
  RETURN NEW;
END$$;

-- Create trigger for shop quota
DROP TRIGGER IF EXISTS tg_shop_quota ON businesses;
CREATE TRIGGER tg_shop_quota BEFORE INSERT ON businesses
FOR EACH ROW EXECUTE PROCEDURE trg_check_shop_quota();

-- Enable RLS on new tables
ALTER TABLE stakeholders ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE advertisements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for stakeholders
CREATE POLICY sel_stakeholder ON stakeholders
FOR SELECT USING (
  is_platform_admin(auth.uid())
  OR EXISTS(
    SELECT 1 FROM memberships m
    WHERE m.stakeholder_id = stakeholders.id
      AND m.user_id = auth.uid()
  )
);

CREATE POLICY ins_stakeholder ON stakeholders
FOR INSERT WITH CHECK (is_platform_admin(auth.uid()));

CREATE POLICY upd_stakeholder ON stakeholders
FOR UPDATE USING (
  is_platform_admin(auth.uid())
  OR EXISTS(
    SELECT 1 FROM memberships m
    WHERE m.stakeholder_id = stakeholders.id
      AND m.user_id = auth.uid()
      AND m.role IN ('stakeholder_owner', 'staff')
  )
);

-- Update RLS policies for businesses (shops)
DROP POLICY IF EXISTS sel_shops ON businesses;
CREATE POLICY sel_shops ON businesses
FOR SELECT USING (
  is_platform_admin(auth.uid())
  OR EXISTS ( -- stakeholder scope
    SELECT 1 FROM memberships m
    WHERE m.user_id = auth.uid()
      AND (m.stakeholder_id = businesses.stakeholder_id
           OR m.shop_id = businesses.id)
  )
  OR businesses.is_active = TRUE  -- public listing
);

DROP POLICY IF EXISTS ins_shops ON businesses;
CREATE POLICY ins_shops ON businesses
FOR INSERT WITH CHECK (
  is_platform_admin(auth.uid())
  OR EXISTS(
    SELECT 1 FROM memberships m
    WHERE m.user_id = auth.uid()
      AND m.role IN ('stakeholder_owner', 'staff')
      AND m.stakeholder_id = businesses.stakeholder_id
  )
);

DROP POLICY IF EXISTS upd_shops ON businesses;
CREATE POLICY upd_shops ON businesses
FOR UPDATE USING (
  is_platform_admin(auth.uid())
  OR EXISTS(
    SELECT 1 FROM memberships m
    WHERE m.user_id = auth.uid()
      AND (
        (m.role IN ('stakeholder_owner', 'staff') AND m.stakeholder_id = businesses.stakeholder_id)
        OR (m.role = 'clerk' AND m.shop_id = businesses.id)
      )
  )
);

DROP POLICY IF EXISTS del_shops ON businesses;
CREATE POLICY del_shops ON businesses
FOR DELETE USING (
  is_platform_admin(auth.uid())
  OR EXISTS(
    SELECT 1 FROM memberships m
    WHERE m.user_id = auth.uid()
      AND m.role IN ('stakeholder_owner', 'staff')
      AND m.stakeholder_id = businesses.stakeholder_id
  )
);

-- RLS Policies for memberships
CREATE POLICY sel_memberships ON memberships
FOR SELECT USING (
  is_platform_admin(auth.uid())
  OR user_id = auth.uid()
  OR EXISTS(
    SELECT 1 FROM memberships m2
    WHERE m2.user_id = auth.uid()
      AND m2.role IN ('stakeholder_owner', 'staff')
      AND (
        (memberships.stakeholder_id IS NOT NULL AND m2.stakeholder_id = memberships.stakeholder_id)
        OR (memberships.shop_id IS NOT NULL AND EXISTS(
          SELECT 1 FROM businesses b
          WHERE b.id = memberships.shop_id
            AND b.stakeholder_id = m2.stakeholder_id
        ))
      )
  )
);

CREATE POLICY ins_memberships ON memberships
FOR INSERT WITH CHECK (
  is_platform_admin(auth.uid())
  OR EXISTS(
    SELECT 1 FROM memberships m
    WHERE m.user_id = auth.uid()
      AND m.role IN ('stakeholder_owner', 'staff')
      AND (
        (NEW.stakeholder_id IS NOT NULL AND m.stakeholder_id = NEW.stakeholder_id)
        OR (NEW.shop_id IS NOT NULL AND EXISTS(
          SELECT 1 FROM businesses b
          WHERE b.id = NEW.shop_id
            AND b.stakeholder_id = m.stakeholder_id
        ))
      )
  )
);

-- RLS Policies for vouchers
CREATE POLICY sel_vouchers ON vouchers
FOR SELECT USING (
  is_platform_admin(auth.uid())
  OR EXISTS(
    SELECT 1 FROM memberships m
    JOIN businesses b ON b.id = vouchers.shop_id
    WHERE m.user_id = auth.uid()
      AND (
        (m.role IN ('stakeholder_owner', 'staff') AND m.stakeholder_id = b.stakeholder_id)
        OR (m.role = 'clerk' AND m.shop_id = vouchers.shop_id)
      )
  )
  OR vouchers.active = TRUE -- public can see active vouchers
);

CREATE POLICY ins_vouchers ON vouchers
FOR INSERT WITH CHECK (
  is_platform_admin(auth.uid())
  OR EXISTS(
    SELECT 1 FROM memberships m
    JOIN businesses b ON b.id = NEW.shop_id
    WHERE m.user_id = auth.uid()
      AND (
        (m.role IN ('stakeholder_owner', 'staff') AND m.stakeholder_id = b.stakeholder_id)
        OR (m.role = 'clerk' AND m.shop_id = NEW.shop_id)
      )
  )
);

-- RLS Policies for advertisements
CREATE POLICY sel_advertisements ON advertisements
FOR SELECT USING (
  is_platform_admin(auth.uid())
  OR EXISTS(
    SELECT 1 FROM memberships m
    JOIN businesses b ON b.id = advertisements.shop_id
    WHERE m.user_id = auth.uid()
      AND (m.stakeholder_id = b.stakeholder_id OR m.shop_id = advertisements.shop_id)
  )
  OR NOW() BETWEEN advertisements.start_at AND advertisements.end_at -- public can see active ads
);

CREATE POLICY ins_advertisements ON advertisements
FOR INSERT WITH CHECK (
  is_platform_admin(auth.uid())
  OR EXISTS(
    SELECT 1 FROM memberships m
    JOIN businesses b ON b.id = NEW.shop_id
    WHERE m.user_id = auth.uid()
      AND m.role IN ('stakeholder_owner', 'staff')
      AND m.stakeholder_id = b.stakeholder_id
  )
);

-- Create indexes for performance
CREATE INDEX idx_stakeholders_status ON stakeholders(status);
CREATE INDEX idx_memberships_user_id ON memberships(user_id);
CREATE INDEX idx_memberships_stakeholder_id ON memberships(stakeholder_id);
CREATE INDEX idx_memberships_shop_id ON memberships(shop_id);
CREATE INDEX idx_subscriptions_stakeholder_id ON subscriptions(stakeholder_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_vouchers_shop_id ON vouchers(shop_id);
CREATE INDEX idx_vouchers_active ON vouchers(active);
CREATE INDEX idx_advertisements_shop_id ON advertisements(shop_id);
CREATE INDEX idx_advertisements_dates ON advertisements(start_at, end_at);
CREATE INDEX idx_businesses_stakeholder_id ON businesses(stakeholder_id);
