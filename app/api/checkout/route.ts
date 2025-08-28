// app/api/checkout/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import Stripe from "stripe";
import { createServerClientForApi } from "@/lib/supabase-api";
import { requireValidBusiness, requireItemsBelongToBusiness, AuthorizationError } from "@/lib/authz";

export const dynamic = "force-dynamic";

const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY is not configured");
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-02-24.acacia', // Pin to specific API version
  });
};

const schema = z.object({
  businessId: z.string().uuid(),
  items: z.array(z.object({
    id: z.string(),  // Allow any string ID in test mode, UUID otherwise  
    quantity: z.number().int().positive(),
    notes: z.string().max(500).optional(),
    // For test mode only
    name: z.string().optional(),
    price: z.number().optional(),
  })).min(1),
  customerInfo: z.object({
    name: z.string().min(1),
    phone: z.string().min(3),
    email: z.string().email(),
    pickupTime: z.string().optional(),
    notes: z.string().optional(),
  }),
  testMode: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerClientForApi();
    
    // Support both cookie-based and Bearer token authentication
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined;
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    
    // First validate with relaxed schema to get testMode
    const relaxedSchema = z.object({
      testMode: z.boolean().optional(),
      businessId: z.string().uuid(),
      items: z.array(z.object({
        id: z.string(),  
        quantity: z.number().int().positive(),
        notes: z.string().max(500).optional(),
        name: z.string().optional(),
        price: z.number().optional(),
      })).min(1),
      customerInfo: z.object({
        name: z.string().min(1),
        phone: z.string().min(3),
        email: z.string().email(),
        pickupTime: z.string().optional(),
        notes: z.string().optional(),
      }),
    });
    
    const relaxed = relaxedSchema.parse(body);
    
    // In normal mode, validate that item IDs are UUIDs
    if (!relaxed.testMode) {
      for (const item of relaxed.items) {
        if (!z.string().uuid().safeParse(item.id).success) {
          return NextResponse.json({ error: "Menu item IDs must be valid UUIDs in production mode" }, { status: 400 });
        }
      }
    }
    
    const { businessId, items, customerInfo, testMode } = relaxed;

    // Use centralized authz helper to validate business exists
    try {
      await requireValidBusiness(businessId)
    } catch (error) {
      if (error instanceof AuthorizationError) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }
      throw error
    }

    // DEV-only test mode to bypass menu validation
    if (testMode && process.env.NODE_ENV !== 'production') {
      // Create a service role client for test mode to bypass RLS
      const { createClient } = await import('@supabase/supabase-js');
      const serviceSupabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );
      // Compute amount from client-provided test items (names/prices)
      const amountCents = Math.round(
        items.reduce((sum, it) => sum + ((it.price || 0) * it.quantity), 0) * 100
      );

      if (!amountCents || amountCents <= 0) {
        return NextResponse.json({ error: "Invalid test items total" }, { status: 400 });
      }

      // Create a minimal order row for testing
      // Generate a shorter unique order number (max 20 chars)
      const orderNumber = `TST${Date.now().toString().slice(-10)}`; // TST + 10 digit timestamp
      
      const { data: orderRow, error: orderErr } = await serviceSupabase
        .from('orders')
        .insert({
          business_id: businessId,
          customer_id: user.id,
          order_number: orderNumber,
          status: "pending",
          total_amount: amountCents / 100,
          amount_total: amountCents,
          currency: "sgd",
          customer_name: customerInfo.name,
          customer_email: customerInfo.email,
          customer_phone: customerInfo.phone,
          notes: customerInfo.notes ?? null,
          payment_status: "requires_payment"
        })
        .select('id')
        .single();

      if (orderErr || !orderRow) throw orderErr || new Error("Cannot create test order");
      const orderId = orderRow.id;

      // Create Stripe Checkout Session (test keys)
      const stripe = getStripe();
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        line_items: items.map((it, idx) => ({
          price_data: {
            currency: "sgd",
            product_data: { name: it.name || `Test Item ${idx + 1}` },
            unit_amount: Math.round((it.price || 5.0) * 100),
          },
          quantity: it.quantity
        })),
        allow_promotion_codes: true,
        success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/orders/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/orders/cancelled?order=${orderId}`,
        metadata: {
          order_id: orderId,
          customer_id: user.id,
          business_id: businessId,
          test_mode: "true"
        },
      });

      // Save session id on order
      await serviceSupabase
        .from('orders')
        .update({ stripe_checkout_session_id: session.id })
        .eq('id', orderId);

      return NextResponse.json({ 
        success: true, 
        order_id: orderId, 
        checkout_url: session.url, 
        session_id: session.id,
        test_mode: true
      });
    }

    // Normal mode: validate menu items belong to business
    // 1) Use centralized authz helper to validate all items belong to this business
    const itemIds = items.map(i => i.id);
    try {
      await requireItemsBelongToBusiness(itemIds, businessId)
    } catch (error) {
      if (error instanceof AuthorizationError) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }
      throw error
    }

    // 2) Load menu items from DB for pricing
    const { data: dbItems, error: itemsErr } = await supabase
      .from("menu_items")
      .select("id, name, price")
      .in("id", itemIds);

    if (itemsErr) throw itemsErr;
    if (!dbItems || dbItems.length !== itemIds.length) {
      return NextResponse.json({ error: "One or more menu items are invalid" }, { status: 400 });
    }

    // 3) Compute totals from DB prices (never trust client)
    const priceById = new Map(dbItems.map(mi => [mi.id, Number(mi.price)])); // price in SGD
    const amountCents = items.reduce((sum, it) => {
      const unit = priceById.get(it.id);
      if (unit == null) throw new Error("Price not found");
      return sum + Math.round(unit * 100) * it.quantity;
    }, 0);

    // 4) Create order row (status pending), then order_items rows
    // Generate a shorter unique order number (max 20 chars)
    const orderNumber = `ORD${Date.now().toString().slice(-12)}`; // ORD + 12 digit timestamp
    
    const { data: orderRow, error: ordErr } = await supabase
      .from("orders")
      .insert({
        business_id: businessId,
        customer_id: user.id,
        order_number: orderNumber,
        status: "pending",
        total_amount: amountCents / 100,     // keep your existing column in SGD
        amount_total: amountCents,           // new, in cents for Stripe parity
        currency: "sgd",
        customer_name: customerInfo.name,
        customer_email: customerInfo.email,
        customer_phone: customerInfo.phone,
        notes: customerInfo.notes ?? null,
        payment_status: "requires_payment",
      })
      .select("id")
      .single();

    if (ordErr || !orderRow) throw ordErr || new Error("Cannot create order");
    const orderId = orderRow.id;

    // 4b) Insert order_items (if you have this table)
    await supabase.from("order_items").insert(
      items.map(it => ({
        order_id: orderId,
        menu_item_id: it.id,
        quantity: it.quantity,
        notes: it.notes ?? null
      }))
    );

    // 5) Create Stripe Checkout Session (test keys)
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: dbItems.map(mi => {
        const qty = items.find(x => x.id === mi.id)!.quantity;
        return {
          price_data: {
            currency: "sgd",
            product_data: { name: mi.name },
            unit_amount: Math.round(Number(mi.price) * 100),
          },
          quantity: qty
        };
      }),
      allow_promotion_codes: true,
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/orders/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/orders/cancelled?order=${orderId}`,
      metadata: {
        order_id: orderId,
        customer_id: user.id,
        business_id: businessId,
      },
    });

    // 6) Save session id on order
    await supabase
      .from("orders")
      .update({ stripe_checkout_session_id: session.id, payment_status: "requires_payment" })
      .eq("id", orderId);

    return NextResponse.json({ success: true, order_id: orderId, checkout_url: session.url, session_id: session.id });
  } catch (err: any) {
    if (err?.name === "ZodError") {
      return NextResponse.json({ error: "Invalid input data", details: err.errors }, { status: 400 });
    }
    console.error("Order checkout error:", err);
    return NextResponse.json({ error: err?.message || "Failed to create checkout session" }, { status: 500 });
  }
}
