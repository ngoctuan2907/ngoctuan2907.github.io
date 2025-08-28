-- Add Stripe-related columns to orders table for test mode implementation
-- Based on requirements in .github/req-for-stripe-test-mode1.md

-- Add columns for Stripe payment tracking
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_checkout_session_id TEXT,
ADD COLUMN IF NOT EXISTS payment_status TEXT CHECK(payment_status IN ('requires_payment','succeeded','failed','refunded')) DEFAULT 'requires_payment',
ADD COLUMN IF NOT EXISTS amount_total INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'sgd';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_stripe_payment_intent ON orders(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_orders_stripe_checkout_session ON orders(stripe_checkout_session_id);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);

-- Update existing orders to have proper currency and amount_total
UPDATE orders 
SET currency = 'sgd', 
    amount_total = CAST(total_amount * 100 AS INTEGER)
WHERE amount_total = 0;

-- Comment for future reference
COMMENT ON COLUMN orders.stripe_payment_intent_id IS 'Stripe PaymentIntent ID for tracking payments';
COMMENT ON COLUMN orders.stripe_checkout_session_id IS 'Stripe Checkout Session ID for tracking checkout flow';
COMMENT ON COLUMN orders.payment_status IS 'Payment status: requires_payment, succeeded, failed, refunded';
COMMENT ON COLUMN orders.amount_total IS 'Amount in currency minor units (cents for SGD)';
COMMENT ON COLUMN orders.currency IS 'Currency code (sgd, usd, etc)';