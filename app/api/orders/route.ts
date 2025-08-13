import { type NextRequest, NextResponse } from "next/server"
import { createServerClientForApi } from "@/lib/supabase-api"

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const supabase = createServerClientForApi()
  try {
    const body = await request.json()
    const {
      business_id,
      customer_id,
      customer_name,
      customer_phone,
      customer_email,
      items,
      total_amount,
      notes,
      pickup_time,
    } = body

    // Generate order number
    const orderNumber = `ORD-${Date.now().toString().slice(-6)}`

    // Create order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        order_number: orderNumber,
        business_id,
        customer_id,
        customer_name,
        customer_phone,
        customer_email,
        total_amount,
        notes,
        pickup_time,
        status: "pending",
      })
      .select()
      .single()

    if (orderError) throw orderError

    // Create order items
    const orderItems = items.map((item: any) => ({
      order_id: order.id,
      menu_item_id: item.menu_item_id,
      item_name: item.name,
      item_price: item.price,
      quantity: item.quantity,
      subtotal: item.price * item.quantity,
      special_instructions: item.special_instructions,
    }))

    const { error: itemsError } = await supabase.from("order_items").insert(orderItems)

    if (itemsError) throw itemsError

    return NextResponse.json({ order }, { status: 201 })
  } catch (error) {
    console.error("Error creating order:", error)
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
  }
}
