import { type NextRequest, NextResponse } from "next/server"
import { createServerClientForApi } from "@/lib/supabase-api"
import { createSupabaseAdmin } from "@/lib/supabase-server"
import Stripe from "stripe"

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not configured')
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-02-24.acacia', // Pin to specific API version
  })
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

    // Use service-role client for DB writes to bypass RLS
    const supabase = createSupabaseAdmin()
    const supabaseApi = createServerClientForApi()

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        
        if (session.mode === 'subscription' && session.subscription) {
          // Handle subscription payments (existing code)
          const stakeholderId = session.metadata?.stakeholder_id
          const plan = session.metadata?.plan
          
          if (!stakeholderId || !plan) {
            console.error('Missing metadata in checkout session:', session.id)
            break
          }

          // Get the subscription details
          const stripe = getStripe()
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
          
          // Upsert subscription in database using service-role client
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

          // Update stakeholder status to active using service-role client
          const { error: stakeholderError } = await supabase
            .from('stakeholders')
            .update({ status: 'active' })
            .eq('id', stakeholderId)

          if (stakeholderError) {
            console.error('Error updating stakeholder status:', stakeholderError)
          }
        } else if (session.mode === 'payment') {
          // Handle one-time payments for orders
          const orderId = session.metadata?.order_id
          
          if (!orderId) {
            console.log(`Missing order_id in checkout session metadata: ${session.id}. This is expected for Stripe CLI fixture events - ignoring.`)
            break
          }

          const startTime = Date.now()

          // Check if order already succeeded (idempotency)
          const { data: existingOrder } = await supabase
            .from('orders')
            .select('payment_status')
            .eq('id', orderId)
            .single()

          if (existingOrder?.payment_status === 'succeeded') {
            console.log('Order payment already succeeded, skipping update:', orderId, 'Event ID:', event.id)
            break
          }

          // Get the payment intent details
          const paymentIntentId = session.payment_intent as string
          
          // Update order status to succeeded using service-role client
          const { data: updatedRows, error: orderError } = await supabase
            .from('orders')
            .update({ 
              payment_status: 'succeeded',
              stripe_payment_intent_id: paymentIntentId,
              stripe_checkout_session_id: session.id,
              amount_total: session.amount_total || 0,
              currency: session.currency || 'sgd',
              status: 'confirmed' // Also update order status to confirmed
            })
            .eq('id', orderId)
            .select('id')

          const elapsed = Date.now() - startTime

          if (orderError) {
            console.error('Error updating order on payment success:', {
              eventId: event.id,
              orderId,
              type: 'checkout.session.completed',
              error: orderError.message,
              elapsedMs: elapsed
            })
          } else if (!updatedRows || updatedRows.length === 0) {
            console.error('Warning: No rows updated for order payment success:', {
              eventId: event.id,
              orderId,
              type: 'checkout.session.completed',
              paymentIntentId,
              elapsedMs: elapsed
            })
          } else {
            console.log('Order payment succeeded:', {
              eventId: event.id,
              orderId,
              paymentIntentId,
              type: 'checkout.session.completed',
              rowsAffected: updatedRows.length,
              elapsedMs: elapsed
            })
          }
        }
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        const startTime = Date.now()
        
        // Find order by payment intent ID and update status to failed using service-role client
        const { data: updatedRows, error: orderError } = await supabase
          .from('orders')
          .update({ 
            payment_status: 'failed',
            status: 'cancelled' // Also update order status to cancelled
          })
          .eq('stripe_payment_intent_id', paymentIntent.id)
          .select('id')

        const elapsed = Date.now() - startTime

        if (orderError) {
          console.error('Error updating order on payment failure:', {
            eventId: event.id,
            paymentIntentId: paymentIntent.id,
            type: 'payment_intent.payment_failed',
            error: orderError.message,
            elapsedMs: elapsed
          })
        } else if (!updatedRows || updatedRows.length === 0) {
          console.error('Warning: No rows updated for payment failure:', {
            eventId: event.id,
            paymentIntentId: paymentIntent.id,
            type: 'payment_intent.payment_failed',
            elapsedMs: elapsed
          })
        } else {
          console.log('Order payment failed:', {
            eventId: event.id,
            paymentIntentId: paymentIntent.id,
            type: 'payment_intent.payment_failed',
            rowsAffected: updatedRows.length,
            elapsedMs: elapsed
          })
        }
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        
        if (invoice.subscription) {
          // Update subscription status using service-role client
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
          // Update subscription status to past_due using service-role client
          const { error } = await supabase
            .from('subscriptions')
            .update({ status: 'past_due' })
            .eq('stripe_subscription_id', invoice.subscription)

          if (error) {
            console.error('Error updating subscription on payment failure:', error)
          }

          // Optionally, also update stakeholder status using service-role client
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

      case 'charge.refunded': 
      case 'refund.created': {
        // Handle refund events - update order status to refunded
        const refund = event.data.object as Stripe.Refund
        const paymentIntentId = refund.payment_intent as string
        const startTime = Date.now()
        
        if (paymentIntentId) {
          const { data: updatedRows, error: orderError } = await supabase
            .from('orders')
            .update({ 
              payment_status: 'refunded',
              status: 'cancelled' // Also update order status
            })
            .eq('stripe_payment_intent_id', paymentIntentId)
            .select('id')

          const elapsed = Date.now() - startTime

          if (orderError) {
            console.error('Error updating order on refund:', {
              eventId: event.id,
              paymentIntentId,
              refundId: refund.id,
              type: event.type,
              error: orderError.message,
              elapsedMs: elapsed
            })
          } else if (!updatedRows || updatedRows.length === 0) {
            console.error('Warning: No rows updated for refund:', {
              eventId: event.id,
              paymentIntentId,
              refundId: refund.id,
              type: event.type,
              elapsedMs: elapsed
            })
          } else {
            console.log('Order refunded:', {
              eventId: event.id,
              paymentIntentId,
              refundId: refund.id,
              type: event.type,
              rowsAffected: updatedRows.length,
              elapsedMs: elapsed
            })
          }
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        
        // Update subscription status to canceled using service-role client
        const { error } = await supabase
          .from('subscriptions')
          .update({ status: 'canceled' })
          .eq('stripe_subscription_id', subscription.id)

        if (error) {
          console.error('Error updating subscription on cancellation:', error)
        }

        // Update stakeholder status to inactive using service-role client
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