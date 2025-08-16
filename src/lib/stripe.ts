import { loadStripe, Stripe } from '@stripe/stripe-js';

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_51QMSJJP6Qi3wZZ1TLOclz1K9XAJfECSPfwwIH1CxBiaexeN6shsDtR9PF7MyA5R1R8unGhsyKKT3t1RyYuCZ83gm00RGL54kae';

if (!stripePublishableKey) {
  console.warn('Stripe publishable key not found. Stripe features will be disabled.');
}

export const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

// Custom checkout integration - Building your own integration approach
export const createCustomCheckout = async (
  amount: number, 
  currency: string = 'USD', 
  metadata: any = {},
  returnUrl: string = window.location.origin
) => {
  try {
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100),
        currency: currency.toLowerCase(),
        metadata,
        success_url: `${returnUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${returnUrl}/payment-cancelled`
      })
    });

    if (!response.ok) {
      throw new Error('Failed to create checkout session');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
};

// Direct payment with card element (for custom forms)
export const processDirectPayment = async (
  stripe: Stripe,
  cardElement: any,
  amount: number,
  currency: string = 'USD',
  metadata: any = {}
) => {
  try {
    // Create payment intent
    const response = await fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100),
        currency: currency.toLowerCase(),
        metadata
      })
    });

    if (!response.ok) {
      throw new Error('Failed to create payment intent');
    }

    const { client_secret } = await response.json();

    // Confirm payment with Stripe
    const { error, paymentIntent } = await stripe.confirmCardPayment(client_secret, {
      payment_method: {
        card: cardElement,
        billing_details: {
          name: metadata.customer_name || 'Customer',
          email: metadata.shipping_address?.email || metadata.customer_email // Use shipping email if available
        }
      }
    });

    if (error) {
      throw new Error(error.message);
    }

    return { paymentIntent };
  } catch (error) {
    console.error('Error processing payment:', error);
    throw error;
  }
};
