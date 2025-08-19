import { type NextRequest, NextResponse } from "next/server"
import { createServerClientForApi } from "@/lib/supabase-api"
import Stripe from "stripe"

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not configured')
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY)
}

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')!
    
    let event: Stripe.Event

    try {
      const stripe = getStripe()
      event = stripe.webhooks.constructEvent(body, signature, endpointSecret)
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const supabase = createServerClientForApi()

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        
        if (session.mode === 'subscription' && session.subscription) {
          const stakeholderId = session.metadata?.stakeholder_id
          const plan = session.metadata?.plan
          
          if (!stakeholderId || !plan) {
            console.error('Missing metadata in checkout session:', session.id)
            break
          }

          // Get the subscription details
          const stripe = getStripe()
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
          
          // Upsert subscription in database
          const { error: subscriptionError } = await supabase
            .from('subscriptions')
            .upsert({
              stakeholder_id: stakeholderId,
              plan: plan,
              status: 'active',
              stripe_subscription_id: subscription.id,
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString()
            }, {
              onConflict: 'stakeholder_id'
            })

          if (subscriptionError) {
            console.error('Error upserting subscription:', subscriptionError)
          } else {
            console.log('Subscription activated for stakeholder:', stakeholderId)
          }

          // Update stakeholder status to active
          const { error: stakeholderError } = await supabase
            .from('stakeholders')
            .update({ status: 'active' })
            .eq('id', stakeholderId)

          if (stakeholderError) {
            console.error('Error updating stakeholder status:', stakeholderError)
          }
        }
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        
        if (invoice.subscription) {
          // Update subscription status
          const { error } = await supabase
            .from('subscriptions')
            .update({ 
              status: 'active',
              current_period_end: new Date((invoice.lines.data[0]?.period?.end || 0) * 1000).toISOString()
            })
            .eq('stripe_subscription_id', invoice.subscription)

          if (error) {
            console.error('Error updating subscription on payment success:', error)
          }
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        
        if (invoice.subscription) {
          // Update subscription status to past_due
          const { error } = await supabase
            .from('subscriptions')
            .update({ status: 'past_due' })
            .eq('stripe_subscription_id', invoice.subscription)

          if (error) {
            console.error('Error updating subscription on payment failure:', error)
          }

          // Optionally, also update stakeholder status
          const { data: subscription } = await supabase
            .from('subscriptions')
            .select('stakeholder_id')
            .eq('stripe_subscription_id', invoice.subscription)
            .single()

          if (subscription) {
            await supabase
              .from('stakeholders')
              .update({ status: 'inactive' })
              .eq('id', subscription.stakeholder_id)
          }
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        
        // Update subscription status to canceled
        const { error } = await supabase
          .from('subscriptions')
          .update({ status: 'canceled' })
          .eq('stripe_subscription_id', subscription.id)

        if (error) {
          console.error('Error updating subscription on cancellation:', error)
        }

        // Update stakeholder status to inactive
        const { data: sub } = await supabase
          .from('subscriptions')
          .select('stakeholder_id')
          .eq('stripe_subscription_id', subscription.id)
          .single()

        if (sub) {
          await supabase
            .from('stakeholders')
            .update({ status: 'inactive' })
            .eq('id', sub.stakeholder_id)
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.json({ 
      error: error.message || 'Webhook handler failed' 
    }, { status: 500 })
  }
}