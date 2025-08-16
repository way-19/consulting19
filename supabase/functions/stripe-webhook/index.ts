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
    const shippingAddress = paymentIntent.shipping?.address ? {
      full_name: paymentIntent.shipping.name,
      address_line_1: paymentIntent.shipping.address.line1,
      address_line_2: paymentIntent.shipping.address.line2,
      city: paymentIntent.shipping.address.city,
      state_province: paymentIntent.shipping.address.state,
      postal_code: paymentIntent.shipping.address.postal_code,
      country: paymentIntent.shipping.address.country,
      phone: paymentIntent.shipping.phone,
      email: paymentIntent.receipt_email // Use receipt email from PI
    } : paymentIntent.metadata?.shipping_address ? JSON.parse(paymentIntent.metadata.shipping_address) : null;


    if (!orderId) {
      console.error('No order_id in payment intent metadata')
      return
    }

    // Update service order status
    const { error: orderError } = await supabase
      .from('virtual_mailbox_items') // Correct table name
      .update({
        status: 'pending', // Set to pending for consultant to ship
        payment_status: 'paid',
        shipping_address: shippingAddress // Save shipping address
      })
      .eq('id', orderId)

    if (orderError) {
      console.error('Error updating service order:', orderError)
      return
    }

    // Create payment record (if you have a dedicated payments table for mailbox items)
    // For now, we'll assume payment status is handled directly in virtual_mailbox_items

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
      .from('virtual_mailbox_items') // Correct table name
      .update({
        status: 'pending', // Keep as pending for retry
        payment_status: 'unpaid',
      })
      .eq('id', orderId)

    if (orderError) {
      console.error('Error updating service order:', orderError)
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
