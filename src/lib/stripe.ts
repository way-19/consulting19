// src/lib/stripe.ts
import type { Stripe, StripeCardElement } from '@stripe/stripe-js';
import { supabase } from './supabase';

type Meta = Record<string, any>;

/**
 * Client-side ödeme akışı:
 * 1) Supabase Edge Function (create-payment-intent) ile client_secret al
 * 2) stripe.confirmCardPayment ile kartı doğrula
 */
export async function processDirectPayment(
  stripe: Stripe,
  cardElement: StripeCardElement,
  amount: number,
  currency: string,
  metadata: Meta = {}
): Promise<{ paymentIntent: Stripe.PaymentIntent | null }> {
  if (!stripe) throw new Error('Stripe not initialized');

  // 1) Ödeme niyeti oluştur (önce Supabase Edge Function dene)
  let clientSecret: string | undefined;

  try {
    const { data, error } = await supabase.functions.invoke('create-payment-intent', {
      body: { amount, currency, metadata },
    });
    if (error) throw error;
    clientSecret = data?.clientSecret || data?.client_secret;
  } catch {
    // Fallback: Next/Express API endpoint'iniz varsa deneyin
    const res = await fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, currency, metadata }),
    });
    if (res.ok) {
      const json = await res.json();
      clientSecret = json.clientSecret || json.client_secret;
    }
  }

  if (!clientSecret) {
    throw new Error('Could not obtain payment intent client secret');
  }

  // 2) Kartla ödeme doğrulaması
  const result = await stripe.confirmCardPayment(clientSecret, {
    payment_method: {
      card: cardElement,
      billing_details: {
        name: metadata.customer_name || 'Customer',
      },
    },
  });

  if (result.error) {
    throw new Error(result.error.message || 'Payment failed');
  }

  return { paymentIntent: result.paymentIntent };
}