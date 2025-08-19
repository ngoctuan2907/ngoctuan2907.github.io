import { type NextRequest, NextResponse } from "next/server"
import { createServerClientForApi } from "@/lib/supabase-api"
import { z } from "zod"
import Stripe from "stripe"

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not configured')
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY)
}

const checkoutSchema = z.object({
  stakeholder_id: z.string().uuid("Invalid stakeholder ID"),
  plan: z.enum(['basic', 'pro', 'enterprise']),
  success_url: z.string().url("Invalid success URL").optional(),
  cancel_url: z.string().url("Invalid cancel URL").optional()
})

export async function POST(request: NextRequest) {
  try {
    const stripe = getStripe()
    const supabase = createServerClientForApi()
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = checkoutSchema.parse(body)

    // Check if user has permission to create subscription for this stakeholder
    const { data: membership } = await supabase
      .from('memberships')
      .select('role')
      .eq('user_id', user.id)
      .eq('stakeholder_id', validatedData.stakeholder_id)
      .eq('role', 'stakeholder_owner')
      .single()

    if (!membership) {
      return NextResponse.json({ 
        error: "Only stakeholder owners can create subscriptions" 
      }, { status: 403 })
    }

    // Get stakeholder details
    const { data: stakeholder, error: stakeholderError } = await supabase
      .from('stakeholders')
      .select('*')
      .eq('id', validatedData.stakeholder_id)
      .single()

    if (stakeholderError || !stakeholder) {
      return NextResponse.json({ error: "Stakeholder not found" }, { status: 404 })
    }

    // Get plan features for pricing (you'll need to add pricing to plan_features)
    const { data: planFeatures, error: planError } = await supabase
      .from('plan_features')
      .select('*')
      .eq('plan', validatedData.plan)
      .single()

    if (planError || !planFeatures) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 })
    }

    // Create or get Stripe customer
    let customerId = stakeholder.stripe_customer_id
    if (!customerId) {
      // Get or create Stripe customer
      const customer = await stripe.customers.create({
        name: stakeholder.name,
        metadata: {
          stakeholder_id: stakeholder.id,
          user_id: user.id
        }
      })
      customerId = customer.id

      // Update stakeholder with Stripe customer ID
      await supabase
        .from('stakeholders')
        .update({ stripe_customer_id: customerId })
        .eq('id', stakeholder.id)
    }

    // Define plan pricing (you might want to store this in database)
    const planPrices: Record<string, number> = {
      basic: 2900,    // $29.00 SGD per month
      pro: 9900,      // $99.00 SGD per month  
      enterprise: 29900 // $299.00 SGD per month
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      mode: 'subscription',
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      line_items: [
        {
          price_data: {
            currency: 'sgd',
            product_data: {
              name: `${validatedData.plan.charAt(0).toUpperCase() + validatedData.plan.slice(1)} Plan`,
              description: `Max ${planFeatures.max_shops} shops, ${planFeatures.ad_tier} ads`,
            },
            unit_amount: planPrices[validatedData.plan],
            recurring: {
              interval: 'month'
            }
          },
          quantity: 1
        }
      ],
      success_url: validatedData.success_url || `${process.env.NEXT_PUBLIC_SITE_URL}/business-dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: validatedData.cancel_url || `${process.env.NEXT_PUBLIC_SITE_URL}/pricing`,
      metadata: {
        stakeholder_id: validatedData.stakeholder_id,
        plan: validatedData.plan,
        user_id: user.id
      }
    })

    return NextResponse.json({
      success: true,
      checkout_url: session.url,
      session_id: session.id
    })

  } catch (error: any) {
    console.error("Error creating Stripe checkout:", error)
    
    if (error.name === "ZodError") {
      return NextResponse.json({
        error: "Invalid input data",
        details: error.errors
      }, { status: 400 })
    }

    return NextResponse.json({ 
      error: error.message || "Failed to create checkout session" 
    }, { status: 500 })
  }
}