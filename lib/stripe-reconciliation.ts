import { createServerClientForApi } from "@/lib/supabase-api"
import Stripe from "stripe"

// Test reconciliation script for Stripe payments
// This would typically be run as a cron job or manually

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not configured')
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY)
}

interface ReconciliationReport {
  date: string
  totalOrders: number
  totalStripeCharges: number
  matchedPayments: number
  mismatches: Array<{
    orderId: string
    paymentIntentId?: string
    orderStatus: string
    orderAmount: number
    stripeStatus?: string
    stripeAmount?: number
    issue: string
  }>
}

export async function reconcilePayments(dateFrom: Date, dateTo: Date): Promise<ReconciliationReport> {
  const stripe = getStripe()
  const supabase = createServerClientForApi()

  console.log(`🔍 Starting reconciliation for ${dateFrom.toISOString()} to ${dateTo.toISOString()}`)

  // Get orders from database for the date range
  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select('*')
    .gte('created_at', dateFrom.toISOString())
    .lte('created_at', dateTo.toISOString())
    .not('stripe_payment_intent_id', 'is', null)

  if (ordersError) {
    throw new Error(`Failed to fetch orders: ${ordersError.message}`)
  }

  // Get charges from Stripe for the date range
  const charges = await stripe.charges.list({
    created: {
      gte: Math.floor(dateFrom.getTime() / 1000),
      lte: Math.floor(dateTo.getTime() / 1000),
    },
    limit: 100,
  })

  const report: ReconciliationReport = {
    date: new Date().toISOString(),
    totalOrders: orders.length,
    totalStripeCharges: charges.data.length,
    matchedPayments: 0,
    mismatches: []
  }

  console.log(`📊 Found ${orders.length} orders and ${charges.data.length} charges`)

  // Create lookup maps
  const ordersByPaymentIntent = new Map()
  const chargesByPaymentIntent = new Map()

  orders.forEach(order => {
    if (order.stripe_payment_intent_id) {
      ordersByPaymentIntent.set(order.stripe_payment_intent_id, order)
    }
  })

  charges.data.forEach(charge => {
    if (charge.payment_intent) {
      chargesByPaymentIntent.set(charge.payment_intent, charge)
    }
  })

  // Check orders against charges
  for (const order of orders) {
    if (!order.stripe_payment_intent_id) {
      report.mismatches.push({
        orderId: order.id,
        orderStatus: order.payment_status,
        orderAmount: order.amount_total,
        issue: 'No payment intent ID'
      })
      continue
    }

    const charge = chargesByPaymentIntent.get(order.stripe_payment_intent_id)
    
    if (!charge) {
      report.mismatches.push({
        orderId: order.id,
        paymentIntentId: order.stripe_payment_intent_id,
        orderStatus: order.payment_status,
        orderAmount: order.amount_total,
        issue: 'No matching Stripe charge found'
      })
      continue
    }

    // Check if amounts match (orders are in cents, charges are in cents)
    const orderAmount = order.amount_total
    const chargeAmount = charge.amount

    if (orderAmount !== chargeAmount) {
      report.mismatches.push({
        orderId: order.id,
        paymentIntentId: order.stripe_payment_intent_id,
        orderStatus: order.payment_status,
        orderAmount: orderAmount,
        stripeStatus: charge.status,
        stripeAmount: chargeAmount,
        issue: `Amount mismatch: order ${orderAmount} vs charge ${chargeAmount}`
      })
      continue
    }

    // Check if statuses align
    const expectedOrderStatus = charge.status === 'succeeded' ? 'succeeded' : 
                               charge.refunded ? 'refunded' : 'failed'
    
    if (order.payment_status !== expectedOrderStatus) {
      report.mismatches.push({
        orderId: order.id,
        paymentIntentId: order.stripe_payment_intent_id,
        orderStatus: order.payment_status,
        orderAmount: orderAmount,
        stripeStatus: charge.status,
        stripeAmount: chargeAmount,
        issue: `Status mismatch: order ${order.payment_status} vs expected ${expectedOrderStatus}`
      })
      continue
    }

    report.matchedPayments++
  }

  // Check for orphaned charges (charges without orders)
  for (const charge of charges.data) {
    if (!charge.payment_intent || !ordersByPaymentIntent.has(charge.payment_intent)) {
      report.mismatches.push({
        orderId: 'N/A',
        paymentIntentId: charge.payment_intent as string,
        orderStatus: 'N/A',
        orderAmount: 0,
        stripeStatus: charge.status,
        stripeAmount: charge.amount,
        issue: 'Charge without matching order'
      })
    }
  }

  console.log(`✅ Reconciliation complete: ${report.matchedPayments} matched, ${report.mismatches.length} mismatches`)

  return report
}

// Export for use in API routes or scripts
export default reconcilePayments