import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@14.21.0'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Initialize Stripe and Supabase
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    })

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the signature from headers
    const signature = req.headers.get('stripe-signature')
    if (!signature) {
      throw new Error('Missing stripe-signature header')
    }

    // Get raw body
    const body = await req.text()
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')

    if (!webhookSecret) {
      throw new Error('Missing webhook secret')
    }

    // Verify webhook signature
    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return new Response('Webhook signature verification failed', { status: 400 })
    }

    console.log('Received webhook event:', event.type)

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        await handlePaymentSuccess(supabase, paymentIntent)
        break

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object as Stripe.PaymentIntent
        await handlePaymentFailure(supabase, failedPayment)
        break

      case 'invoice.payment_succeeded':
        const invoice = event.data.object as Stripe.Invoice
        await handleInvoicePayment(supabase, invoice)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return new Response(
      JSON.stringify({ received: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Webhook error:', error)
    
    return new Response(
      JSON.stringify({
        error: error.message || 'Webhook processing failed'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})

async function handlePaymentSuccess(supabase: any, paymentIntent: Stripe.PaymentIntent) {
  try {
    const orderId = paymentIntent.metadata?.order_id

    if (!orderId) {
      console.error('No order_id in payment intent metadata')
      return
    }

    // Update service order status
    const { error: orderError } = await supabase
      .from('service_orders')
      .update({
        status: 'paid',
        stripe_payment_intent_id: paymentIntent.id
      })
      .eq('id', orderId)

    if (orderError) {
      console.error('Error updating service order:', orderError)
      return
    }

    // Create payment record
    const { error: paymentError } = await supabase
      .from('service_payments')
      .insert([{
        order_id: orderId,
        stripe_payment_intent_id: paymentIntent.id,
        stripe_charge_id: paymentIntent.latest_charge,
        amount: paymentIntent.amount / 100, // Convert from cents
        currency: paymentIntent.currency.toUpperCase(),
        status: 'succeeded',
        payment_method: paymentIntent.payment_method_types[0] || 'card'
      }])

    if (paymentError) {
      console.error('Error creating payment record:', paymentError)
    }

    console.log(`Payment succeeded for order ${orderId}`)
  } catch (error) {
    console.error('Error handling payment success:', error)
  }
}

async function handlePaymentFailure(supabase: any, paymentIntent: Stripe.PaymentIntent) {
  try {
    const orderId = paymentIntent.metadata?.order_id

    if (!orderId) {
      console.error('No order_id in payment intent metadata')
      return
    }

    // Update service order status
    const { error: orderError } = await supabase
      .from('service_orders')
      .update({
        status: 'pending', // Keep as pending for retry
        stripe_payment_intent_id: paymentIntent.id
      })
      .eq('id', orderId)

    if (orderError) {
      console.error('Error updating service order:', orderError)
    }

    // Create failed payment record
    const { error: paymentError } = await supabase
      .from('service_payments')
      .insert([{
        order_id: orderId,
        stripe_payment_intent_id: paymentIntent.id,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency.toUpperCase(),
        status: 'failed',
        payment_method: paymentIntent.payment_method_types[0] || 'card'
      }])

    if (paymentError) {
      console.error('Error creating failed payment record:', paymentError)
    }

    console.log(`Payment failed for order ${orderId}`)
  } catch (error) {
    console.error('Error handling payment failure:', error)
  }
}

async function handleInvoicePayment(supabase: any, invoice: Stripe.Invoice) {
  try {
    // Handle accounting invoice payments
    const invoiceNumber = invoice.metadata?.invoice_number

    if (!invoiceNumber) {
      console.error('No invoice_number in invoice metadata')
      return
    }

    // Update accounting invoice status
    const { error } = await supabase
      .from('accounting_invoices')
      .update({
        status: 'paid',
        stripe_invoice_id: invoice.id
      })
      .eq('invoice_number', invoiceNumber)

    if (error) {
      console.error('Error updating accounting invoice:', error)
    }

    console.log(`Invoice payment succeeded for ${invoiceNumber}`)
  } catch (error) {
    console.error('Error handling invoice payment:', error)
  }
}