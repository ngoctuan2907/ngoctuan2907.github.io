import { type NextRequest, NextResponse } from "next/server"
import { createServerClientForApi } from "@/lib/supabase-api"
import Stripe from "stripe"
import { z } from "zod"

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not configured')
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY)
}

const refundSchema = z.object({
  amount: z.number().min(0).optional(),
  reason: z.enum(['duplicate', 'fraudulent', 'requested_by_customer']).optional()
})

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const stripe = getStripe()
    const supabase = createServerClientForApi()
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const orderId = params.id
    const body = await request.json()
    const validatedData = refundSchema.parse(body)

    // Get order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        businesses!inner(
          stakeholder_id,
          business_name
        )
      `)
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Check if user has permission (business owner, staff, or platform admin)
    const { data: membership } = await supabase
      .from('memberships')
      .select('role, stakeholder_id, shop_id')
      .eq('user_id', user.id)
      .or(`stakeholder_id.eq.${order.businesses.stakeholder_id},shop_id.eq.${order.business_id}`)
      .single()

    const { data: isAdmin } = await supabase
      .from('platform_admins')
      .select('user_id')
      .eq('user_id', user.id)
      .single()

    if (!membership && !isAdmin) {
      return NextResponse.json({ 
        error: "Only business owners, staff, or admins can process refunds" 
      }, { status: 403 })
    }

    // Check if order can be refunded
    if (order.payment_status !== 'succeeded') {
      return NextResponse.json({ 
        error: `Cannot refund order with payment status: ${order.payment_status}` 
      }, { status: 400 })
    }

    if (!order.stripe_payment_intent_id) {
      return NextResponse.json({ 
        error: "No payment intent found for this order" 
      }, { status: 400 })
    }

    if (order.payment_status === 'refunded') {
      return NextResponse.json({ 
        error: "Order is already refunded" 
      }, { status: 400 })
    }

    // Create refund with Stripe
    const refundParams: Stripe.RefundCreateParams = {
      payment_intent: order.stripe_payment_intent_id
    }

    if (validatedData.amount) {
      refundParams.amount = Math.round(validatedData.amount * 100) // Convert to cents
    }

    if (validatedData.reason) {
      refundParams.reason = validatedData.reason
    }

    const refund = await stripe.refunds.create(refundParams)

    console.log('Refund created:', refund.id, 'for order:', orderId)

    // Note: We don't update the order status here - the webhook will handle it
    // when we receive the refund.succeeded or charge.refunded event

    return NextResponse.json({
      success: true,
      refund_id: refund.id,
      amount: refund.amount,
      currency: refund.currency,
      status: refund.status,
      message: 'Refund initiated successfully'
    })

  } catch (error: any) {
    console.error("Error processing refund:", error)
    
    if (error.name === "ZodError") {
      return NextResponse.json({
        error: "Invalid input data",
        details: error.errors
      }, { status: 400 })
    }

    if (error.type === 'StripeCardError' || error.type === 'StripeInvalidRequestError') {
      return NextResponse.json({
        error: error.message
      }, { status: 400 })
    }

    return NextResponse.json({ 
      error: error.message || "Failed to process refund" 
    }, { status: 500 })
  }
}