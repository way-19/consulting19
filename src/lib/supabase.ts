import React, { useState, useEffect } from 'react';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { CreditCard, Lock, CheckCircle, AlertTriangle, X } from 'lucide-react';
import { processDirectPayment } from '../lib/stripe';
import { trackBusinessEvent } from '../utils/analytics'; // Import analytics

const stripePromise = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
  : null;

interface ShippingAddress {
  full_name: string;
  company_name?: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state_province: string;
  postal_code: string;
  country: string;
  phone: string;
  email: string;
}

interface CheckoutFormProps {
  amount: number;
  currency: string;
  orderId: string;
  orderDetails: {
    serviceName: string;
    consultantName: string;
    deliveryTime: number;
  };
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
  onCancel: () => void;
  shippingAddress?: ShippingAddress;
  onAddressChange?: (address: ShippingAddress) => void;
  showAddressForm?: boolean;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({
  amount,
  currency,
  orderId,
  orderDetails,
  onSuccess,
  onError,
  onCancel,
  shippingAddress,
  onAddressChange,
  showAddressForm = false
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError(null);

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      setError('Card element not found');
      setProcessing(false);
      return;
    }

    try {
      const { paymentIntent } = await processDirectPayment(
        stripe,
        cardElement,
        amount,
        currency,
        {
          order_id: orderId,
          service_name: orderDetails.serviceName,
          consultant_name: orderDetails.consultantName,
          customer_name: shippingAddress?.full_name || orderDetails.consultantName,
          shipping_address: shippingAddress
        }
      );

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Track successful payment
        trackBusinessEvent.paymentCompleted(amount, currency, orderDetails.serviceName, paymentIntent.id);
        
        onSuccess(paymentIntent.id);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment processing failed';
      setError(errorMessage);
      onError(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
        fontFamily: 'system-ui, -apple-system, sans-serif',
      },
      invalid: {
        color: '#9e2146',
      },
    },
    hidePostalCode: false,
  };

  return (
    <div className="max-w-md mx-auto">
      {/* Shipping Address Form */}
      {showAddressForm && shippingAddress && onAddressChange && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Address</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                <input
                  type="text"
                  required
                  value={shippingAddress.full_name}
                  onChange={(e) => onAddressChange({ ...shippingAddress, full_name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                <input
                  type="tel"
                  required
                  value={shippingAddress.phone}
                  onChange={(e) => onAddressChange({ ...shippingAddress, phone: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="+90 555 123 4567"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
              <input
                type="email"
                required
                value={shippingAddress.email}
                onChange={(e) => onAddressChange({ ...shippingAddress, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="email@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 1 *</label>
              <input
                type="text"
                required
                value={shippingAddress.address_line_1}
                onChange={(e) => onAddressChange({ ...shippingAddress, address_line_1: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Street, Avenue, Building No"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 2 (Optional)</label>
              <input
                type="text"
                value={shippingAddress.address_line_2 || ''}
                onChange={(e) => onAddressChange({ ...shippingAddress, address_line_2: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Floor, Apartment No"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                <input
                  type="text"
                  required
                  value={shippingAddress.city}
                  onChange={(e) => onAddressChange({ ...shippingAddress, city: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Istanbul"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">State/Province *</label>
                <input
                  type="text"
                  required
                  value={shippingAddress.state_province}
                  onChange={(e) => onAddressChange({ ...shippingAddress, state_province: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Istanbul"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code *</label>
                <input
                  type="text"
                  required
                  value={shippingAddress.postal_code}
                  onChange={(e) => onAddressChange({ ...shippingAddress, postal_code: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="34000"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Country *</label>
              <input
                type="text"
                required
                value={shippingAddress.country}
                onChange={(e) => onAddressChange({ ...shippingAddress, country: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Turkey"
              />
            </div>
          </div>
        </div>
      )}

      {/* Order Summary */}
      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Service:</span>
            <span className="font-medium text-gray-900">{orderDetails.serviceName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Consultant:</span>
            <span className="font-medium text-gray-900">{orderDetails.consultantName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Delivery Time:</span>
            <span className="font-medium text-gray-900">{orderDetails.deliveryTime} days</span>
          </div>
          <div className="border-t border-gray-200 pt-3">
            <div className="flex justify-between">
              <span className="text-lg font-semibold text-gray-900">Total:</span>
              <span className="text-lg font-bold text-green-600">
                ${amount.toLocaleString()} {currency}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Card Information
          </label>
          <div className="border border-gray-300 rounded-lg p-4 bg-white">
            <CardElement options={cardElementOptions} />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Lock className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Güvenli Ödeme</span>
          </div>
          <p className="text-xs text-blue-800">
            Ödeme bilgileriniz şifrelenir ve güvenlidir. Ödeme işlemi için Stripe kullanıyoruz.
          </p>
        </div>

        <div className="mb-4">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-3">Ödeme yöntemini seçin:</p>
            <button
              type="submit"
              disabled={!stripe || processing}
              className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {processing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Ödeme İşleniyor...</span>
                </>
              ) : (
                <>
                  <CreditCard className="h-5 w-5" />
                  <span>Ödemeyi Tamamla</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

interface StripeCheckoutProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  currency: string;
  orderId: string;
  orderDetails: {
    serviceName: string;
    consultantName: string;
    deliveryTime: number;
  };
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
  shippingAddress?: ShippingAddress;
  onAddressChange?: (address: ShippingAddress) => void;
  showAddressForm?: boolean;
}

const StripeCheckout: React.FC<StripeCheckoutProps> = ({
  isOpen,
  onClose,
  amount,
  currency,
  orderId,
  orderDetails,
  onSuccess,
  onError,
  shippingAddress,
  onAddressChange,
  showAddressForm
}) => {
  // Check if Stripe is available
  if (!stripePromise) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
          <div className="text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Payment System Ready</h2>
            <p className="text-gray-600 mb-4">
              Using Stripe test environment with your custom integration.
            </p>
            <button
              onClick={onClose}
              className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Complete Payment</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <Elements stripe={stripePromise}>
            <CheckoutForm
              amount={amount}
              currency={currency}
              orderId={orderId}
              orderDetails={orderDetails}
              onSuccess={onSuccess}
              onError={onError}
              onCancel={onClose}
              shippingAddress={shippingAddress}
              onAddressChange={onAddressChange}
              showAddressForm={showAddressForm}
            />
          </Elements>
        </div>
      </div>
    </div>
  );
};

export default StripeCheckout;
