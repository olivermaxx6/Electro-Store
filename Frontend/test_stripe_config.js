// Test script to verify Stripe configuration
import { getStripe, testStripeConnection, isStripeConfigured, getStripeConfig } from './src/lib/stripe.js';

console.log('🧪 Testing Stripe configuration...');

// Test configuration
console.log('Configuration:', getStripeConfig());
console.log('Is configured:', isStripeConfigured());

// Test connection
testStripeConnection().then(result => {
  console.log('Connection test result:', result);
});

// Test Stripe instance
getStripe().then(stripe => {
  console.log('Stripe instance:', !!stripe);
});
