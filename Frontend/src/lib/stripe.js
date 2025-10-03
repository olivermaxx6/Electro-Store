// Stripe integration utilities
import { loadStripe } from '@stripe/stripe-js';

// Get Stripe publishable key from environment variables
const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_51S9TOV1P7OUaUZWmpjXeetCOf0MQuQ6vm0hvgNGj0p0hdQfOM5wDCjKTDSCZZg7qb0ozclRUmWlKNTENZEvYDiJK003tEvvONV';

// Initialize Stripe with error handling
let stripePromise = null;

// Get Stripe instance
export const getStripe = async () => {
  if (!stripePromise) {
    console.log('🔧 Initializing Stripe...');
    
    if (!STRIPE_PUBLISHABLE_KEY) {
      console.error('❌ Stripe publishable key is missing');
      return null;
    }
    
    if (!STRIPE_PUBLISHABLE_KEY.startsWith('pk_')) {
      console.error('❌ Invalid Stripe publishable key format');
      return null;
    }
    
    stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);
    
    stripePromise.then(stripe => {
      if (stripe) {
        console.log('✅ Stripe initialized successfully');
      } else {
        console.error('❌ Failed to initialize Stripe');
      }
    }).catch(error => {
      console.error('❌ Stripe initialization error:', error);
    });
  }
  
  return stripePromise;
};

// Test Stripe connectivity
export const testStripeConnection = async () => {
  try {
    console.log('🧪 Testing Stripe connection...');
    
    const stripe = await getStripe();
    
    if (!stripe) {
      console.error('❌ Stripe instance is null');
      return false;
    }
    
    // Test if Stripe methods are available
    if (typeof stripe.redirectToCheckout === 'function') {
      console.log('✅ Stripe redirectToCheckout method available');
      return true;
    } else {
      console.error('❌ Stripe redirectToCheckout method not available');
      return false;
    }
  } catch (error) {
    console.error('❌ Stripe connection test failed:', error);
    return false;
  }
};

// Check if Stripe is properly configured
export const isStripeConfigured = () => {
  return !!STRIPE_PUBLISHABLE_KEY && STRIPE_PUBLISHABLE_KEY.startsWith('pk_');
};

// Get Stripe configuration info
export const getStripeConfig = () => {
  return {
    publishableKey: STRIPE_PUBLISHABLE_KEY,
    isConfigured: isStripeConfigured(),
    keyPrefix: STRIPE_PUBLISHABLE_KEY.substring(0, 8) + '...'
  };
};

// Create payment intent
export const createPaymentIntent = async (amount, currency = 'gbp') => {
  try {
    const response = await fetch('http://127.0.0.1:8001/api/payments/create-intent/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100), // Convert to pence
        currency: currency.toLowerCase(),
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create payment intent');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
};

// Confirm payment
export const confirmPayment = async (paymentIntentId) => {
  try {
    const response = await fetch('http://127.0.0.1:8001/api/payments/confirm/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
      body: JSON.stringify({
        payment_intent_id: paymentIntentId,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to confirm payment');
    }

    return await response.json();
  } catch (error) {
    console.error('Error confirming payment:', error);
    throw error;
  }
};

// Handle payment errors
export const handlePaymentError = (error) => {
  console.error('Payment error:', error);
  
  if (error.type === 'card_error') {
    return `Card error: ${error.message}`;
  } else if (error.type === 'validation_error') {
    return `Validation error: ${error.message}`;
  } else {
    return 'An unexpected error occurred. Please try again.';
  }
};

export default {
  getStripe,
  createPaymentIntent,
  confirmPayment,
  handlePaymentError
};
