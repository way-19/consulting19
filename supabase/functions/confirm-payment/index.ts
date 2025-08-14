import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface ConfirmPaymentRequest {
  payment_intent_id: string;
  order_id: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Initialize Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Parse request body
    const { payment_intent_id, order_id }: ConfirmPaymentRequest = await req.json()

    if (!payment_intent_id || !order_id) {
      throw new Error('Missing required parameters')
    }

    // Update order status to paid
    const { error: orderError } = await supabase
      .from('service_orders')
      .update({
        status: 'paid',
        stripe_payment_intent_id: payment_intent_id
      })
      .eq('id', order_id)

    if (orderError) {
      throw new Error(`Failed to update order: ${orderError.message}`)
    }

    // Get order details for notification
    const { data: orderData } = await supabase
      .from('service_orders')
      .select(`
        *,
        service:service_id (
          title,
          consultant:consultant_id (
            full_name,
            email
          )
        )
      `)
      .eq('id', order_id)
      .single()

    // Create notification for consultant
    if (orderData?.consultant_id) {
      await supabase
        .from('notifications')
        .insert([{
          user_id: orderData.consultant_id,
          type: 'payment_received',
          title: 'Payment Received',
          message: `Payment received for order ${orderData.invoice_number}`,
          priority: 'normal',
          related_table: 'service_orders',
          related_id: order_id
        }])
    }

    // Create notification for client
    if (orderData?.client_id) {
      await supabase
        .from('notifications')
        .insert([{
          user_id: orderData.client_id,
          type: 'payment_confirmed',
          title: 'Payment Confirmed',
          message: `Your payment for ${orderData.service?.title} has been confirmed`,
          priority: 'normal',
          related_table: 'service_orders',
          related_id: order_id
        }])
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Payment confirmed successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Payment confirmation error:', error)
    
    return new Response(
      JSON.stringify({
        error: error.message || 'Failed to confirm payment'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})