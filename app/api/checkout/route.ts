import { NextRequest, NextResponse } from 'next/server'
import { createServerClientForApi } from "@/lib/supabase-api"

// This would normally use Stripe SDK, but for MVP we'll simulate it
// import Stripe from 'stripe'
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(request: NextRequest) {
  try {
    console.log("💳 [VERCEL LOG] Checkout API called at:", new Date().toISOString())

    const supabase = createServerClientForApi()
    const body = await request.json()
    const { items, customerInfo, businessId } = body

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Items are required" },
        { status: 400 }
      )
    }

    if (!customerInfo || !customerInfo.name || !customerInfo.phone) {
      return NextResponse.json(
        { error: "Customer name and phone are required" },
        { status: 400 }
      )
    }

    if (!businessId) {
      return NextResponse.json(
        { error: "Business ID is required" },
        { status: 400 }
      )
    }

    // Calculate total from server-side prices (security - never trust client)
    let totalAmount = 0
    const orderItems = []

    for (const item of items) {
      // In real app, fetch actual menu item prices from database
      const serverPrice = parseFloat(item.price) // Mock - should be fetched from DB
      const itemTotal = serverPrice * item.quantity
      totalAmount += itemTotal

      orderItems.push({
        menu_item_id: item.id,
        item_name: item.name,
        item_price: serverPrice,
        quantity: item.quantity,
        subtotal: itemTotal,
        special_instructions: item.notes || null
      })
    }

    // For MVP, simulate payment processing
    // In production, this would create a Stripe Checkout Session:
    /*
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: items.map(item => ({
        price_data: {
          currency: 'sgd',
          product_data: {
            name: item.name,
          },
          unit_amount: Math.round(item.price * 100), // Stripe uses cents
        },
        quantity: item.quantity,
      })),
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/orders/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/cafe/${businessId}`,
      metadata: {
        businessId,
        customerName: customerInfo.name,
        customerPhone: customerInfo.phone,
      }
    })
    */

    // For now, create order directly (simulating successful payment)
    const orderNumber = `ORD-${Date.now()}`
    
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        business_id: businessId,
        customer_name: customerInfo.name,
        customer_phone: customerInfo.phone,
        customer_email: customerInfo.email || null,
        total_amount: totalAmount,
        status: 'pending', // Would be 'paid' after webhook confirmation
        notes: customerInfo.notes || null,
        pickup_time: customerInfo.pickupTime || null
      })
      .select()
      .single()

    if (orderError) {
      console.error("❌ [VERCEL LOG] Order creation error:", orderError)
      return NextResponse.json(
        { error: "Failed to create order" },
        { status: 500 }
      )
    }

    // Create order items
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(
        orderItems.map(item => ({
          order_id: order.id,
          ...item
        }))
      )

    if (itemsError) {
      console.error("❌ [VERCEL LOG] Order items creation error:", itemsError)
      return NextResponse.json(
        { error: "Failed to create order items" },
        { status: 500 }
      )
    }

    console.log("✅ [VERCEL LOG] Order created successfully:", orderNumber)

    // Return mock checkout session for MVP
    return NextResponse.json({
      sessionId: `cs_mock_${orderNumber}`,
      url: `/orders/success?order=${orderNumber}`,
      orderId: order.id,
      orderNumber,
      message: "Order created successfully (mock payment)",
      totalAmount
    })

  } catch (error) {
    console.error("❌ [VERCEL LOG] Checkout API error:", error)
    return NextResponse.json(
      { error: "Failed to process checkout" },
      { status: 500 }
    )
  }
}
