-- Add Stripe-related fields to orders table for payment reconciliation
-- This migration adds the fields needed to track Stripe payments

ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS stripe_checkout_session_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT,
ADD COLUMN IF NOT EXISTS payment_status TEXT CHECK (payment_status IN ('requires_payment', 'succeeded', 'failed', 'refunded')) DEFAULT 'requires_payment',
ADD COLUMN IF NOT EXISTS amount_total INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'sgd';

-- Add indexes for better performance on Stripe fields
CREATE INDEX IF NOT EXISTS idx_orders_stripe_checkout_session_id ON orders(stripe_checkout_session_id);
CREATE INDEX IF NOT EXISTS idx_orders_stripe_payment_intent_id ON orders(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);

-- Update existing orders to have default payment status
UPDATE orders 
SET payment_status = 'requires_payment', 
    amount_total = ROUND(total_amount * 100)::INTEGER,
    currency = 'sgd'
WHERE payment_status IS NULL;