-- Add Stripe payment columns to orders table (idempotent)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS stripe_payment_intent_id text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS stripe_checkout_session_id text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status text
  CHECK (payment_status in ('requires_payment','succeeded','failed','refunded'))
  DEFAULT 'requires_payment';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS amount_total integer NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'sgd';

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_stripe_payment_intent_id ON orders(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_orders_stripe_checkout_session_id ON orders(stripe_checkout_session_id);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);

-- Migrate existing data
UPDATE orders 
SET payment_status = 'succeeded' 
WHERE status = 'completed' AND payment_status IS NULL;

UPDATE orders 
SET payment_status = 'requires_payment' 
WHERE status IN ('pending', 'confirmed') AND payment_status IS NULL;

UPDATE orders 
SET currency = 'sgd' 
WHERE currency IS NULL;

UPDATE orders 
SET amount_total = CAST(total_amount * 100 AS INTEGER) 
WHERE amount_total = 0 AND total_amount > 0;