-- Analytics functions for business dashboard
-- Based on peer-suggestion.md recommendations

-- Function to get monthly revenue for a business
CREATE OR REPLACE FUNCTION stats_revenue_by_month(
  p_business_id UUID,
  p_from TIMESTAMP WITH TIME ZONE,
  p_to TIMESTAMP WITH TIME ZONE
)
RETURNS TABLE(
  month DATE,
  orders BIGINT,
  revenue NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    date_trunc('month', o.created_at)::DATE as month,
    COUNT(*) as orders,
    SUM(o.total_amount) as revenue
  FROM orders o
  WHERE o.business_id = p_business_id
    AND o.status IN ('confirmed', 'preparing', 'ready', 'completed')
    AND o.created_at >= p_from 
    AND o.created_at < p_to
  GROUP BY date_trunc('month', o.created_at)
  ORDER BY month;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get product revenue for a business  
CREATE OR REPLACE FUNCTION stats_product_revenue(
  p_business_id UUID,
  p_from TIMESTAMP WITH TIME ZONE,
  p_to TIMESTAMP WITH TIME ZONE
)
RETURNS TABLE(
  item_id UUID,
  name VARCHAR,
  units BIGINT,
  revenue NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    oi.menu_item_id as item_id,
    oi.item_name as name,
    SUM(oi.quantity) as units,
    SUM(oi.quantity * oi.item_price) as revenue
  FROM order_items oi
  JOIN orders o ON o.id = oi.order_id
  WHERE o.business_id = p_business_id
    AND o.status IN ('confirmed', 'preparing', 'ready', 'completed')
    AND o.created_at >= p_from 
    AND o.created_at < p_to
  GROUP BY oi.menu_item_id, oi.item_name
  ORDER BY revenue DESC
  LIMIT 50;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get day-of-week statistics
CREATE OR REPLACE FUNCTION stats_dow(
  p_business_id UUID,
  p_from TIMESTAMP WITH TIME ZONE,
  p_to TIMESTAMP WITH TIME ZONE
)
RETURNS TABLE(
  dow INTEGER,
  orders BIGINT,
  revenue NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    EXTRACT(dow FROM o.created_at)::INTEGER as dow,
    COUNT(*) as orders,
    SUM(o.total_amount) as revenue
  FROM orders o
  WHERE o.business_id = p_business_id
    AND o.status IN ('confirmed', 'preparing', 'ready', 'completed')
    AND o.created_at >= p_from 
    AND o.created_at < p_to
  GROUP BY EXTRACT(dow FROM o.created_at)
  ORDER BY dow;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get hour-of-day statistics (with timezone support)
CREATE OR REPLACE FUNCTION stats_hour(
  p_business_id UUID,
  p_from TIMESTAMP WITH TIME ZONE,
  p_to TIMESTAMP WITH TIME ZONE,
  p_tz TEXT DEFAULT 'Asia/Singapore'
)
RETURNS TABLE(
  hour INTEGER,
  orders BIGINT,
  revenue NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    EXTRACT(hour FROM o.created_at AT TIME ZONE p_tz)::INTEGER as hour,
    COUNT(*) as orders,
    SUM(o.total_amount) as revenue
  FROM orders o
  WHERE o.business_id = p_business_id
    AND o.status IN ('confirmed', 'preparing', 'ready', 'completed')
    AND o.created_at >= p_from 
    AND o.created_at < p_to
  GROUP BY EXTRACT(hour FROM o.created_at AT TIME ZONE p_tz)
  ORDER BY hour;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get daily statistics for charts
CREATE OR REPLACE FUNCTION stats_daily(
  p_business_id UUID,
  p_from TIMESTAMP WITH TIME ZONE,
  p_to TIMESTAMP WITH TIME ZONE
)
RETURNS TABLE(
  date DATE,
  orders BIGINT,
  revenue NUMERIC,
  views BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    o.date::DATE,
    COALESCE(o.orders, 0) as orders,
    COALESCE(o.revenue, 0) as revenue,
    COALESCE(v.views, 0) as views
  FROM (
    SELECT
      date_trunc('day', o.created_at)::DATE as date,
      COUNT(*) as orders,
      SUM(o.total_amount) as revenue
    FROM orders o
    WHERE o.business_id = p_business_id
      AND o.status IN ('confirmed', 'preparing', 'ready', 'completed')
      AND o.created_at >= p_from 
      AND o.created_at < p_to
    GROUP BY date_trunc('day', o.created_at)
  ) o
  FULL OUTER JOIN (
    SELECT
      date_trunc('day', bv.viewed_at)::DATE as date,
      COUNT(*) as views
    FROM business_views bv
    WHERE bv.business_id = p_business_id
      AND bv.viewed_at >= p_from 
      AND bv.viewed_at < p_to
    GROUP BY date_trunc('day', bv.viewed_at)
  ) v ON o.date = v.date
  WHERE o.date IS NOT NULL OR v.date IS NOT NULL
  ORDER BY COALESCE(o.date, v.date);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get customer analytics
CREATE OR REPLACE FUNCTION stats_customers(
  p_business_id UUID,
  p_from TIMESTAMP WITH TIME ZONE,
  p_to TIMESTAMP WITH TIME ZONE
)
RETURNS TABLE(
  new_customers BIGINT,
  returning_customers BIGINT,
  total_customers BIGINT
) AS $$
BEGIN
  RETURN QUERY
  WITH customer_stats AS (
    SELECT 
      o.customer_id,
      MIN(o.created_at) as first_order_date,
      COUNT(*) as order_count
    FROM orders o
    WHERE o.business_id = p_business_id
      AND o.status IN ('confirmed', 'preparing', 'ready', 'completed')
    GROUP BY o.customer_id
  ),
  period_customers AS (
    SELECT 
      cs.customer_id,
      cs.first_order_date,
      cs.order_count,
      CASE 
        WHEN cs.first_order_date >= p_from AND cs.first_order_date < p_to THEN 'new'
        ELSE 'returning'
      END as customer_type
    FROM customer_stats cs
    JOIN orders o ON o.customer_id = cs.customer_id
    WHERE o.business_id = p_business_id
      AND o.created_at >= p_from 
      AND o.created_at < p_to
      AND o.status IN ('confirmed', 'preparing', 'ready', 'completed')
    GROUP BY cs.customer_id, cs.first_order_date, cs.order_count
  )
  SELECT
    SUM(CASE WHEN pc.customer_type = 'new' THEN 1 ELSE 0 END) as new_customers,
    SUM(CASE WHEN pc.customer_type = 'returning' THEN 1 ELSE 0 END) as returning_customers,
    COUNT(DISTINCT pc.customer_id) as total_customers
  FROM period_customers pc;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add timezone column to businesses (for proper timezone handling)
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'Asia/Singapore';

-- Grant permissions for the functions
GRANT EXECUTE ON FUNCTION stats_revenue_by_month TO authenticated;
GRANT EXECUTE ON FUNCTION stats_product_revenue TO authenticated;
GRANT EXECUTE ON FUNCTION stats_dow TO authenticated;
GRANT EXECUTE ON FUNCTION stats_hour TO authenticated;
GRANT EXECUTE ON FUNCTION stats_daily TO authenticated;
GRANT EXECUTE ON FUNCTION stats_customers TO authenticated;
