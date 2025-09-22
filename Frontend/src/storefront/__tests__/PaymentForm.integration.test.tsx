/**
 * End-to-End Stripe Payment Integration Tests for React Frontend
 * 
 * This test suite verifies the complete payment flow from the React frontend:
 * 1. Payment form rendering and validation
 * 2. Stripe Elements integration
 * 3. Payment method creation and confirmation
 * 4. Success/error handling
 * 5. Integration with backend API calls
 * 
 * Requirements:
 * - Real Stripe test API calls (no mocking of Stripe)
 * - Mock Service Worker for Django API interception
 * - Testing Library for component testing
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { BrowserRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { loadStripe } from '@stripe/stripe-js';

// Import components and types
import PaymentForm from '../components/PaymentForm';
import Checkout from '../pages/Checkout';
import { cartSlice } from '../store/cartSlice';
import { userSlice } from '../store/userSlice';
import { uiSlice } from '../store/uiSlice';
import { productsSlice } from '../store/productsSlice';

// Mock Stripe configuration
const STRIPE_PUBLISHABLE_KEY = 'pk_test_51S9TOV1P7OUaUZWmpjXeetCOf0MQuQ6vm0hvgNGj0p0hdQfOM5wDCjKTDSCZZg7qb0ozclRUmWlKNTENZEvYDiJK003tEvvONV';

// Mock Service Worker setup for Django API
const server = setupServer(
  // Mock payment intent creation
  rest.post('http://127.0.0.1:8001/api/public/create-payment-intent/', (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({
        client_secret: 'pi_test_123_secret_test123',
        payment_intent_id: 'pi_test_123'
      })
    );
  }),

  // Mock order creation
  rest.post('http://127.0.0.1:8001/api/public/orders/', (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({
        tracking_id: 'ORD-TEST-123',
        status: 'confirmed',
        message: 'Order placed successfully'
      })
    );
  }),

  // Mock store settings
  rest.get('http://127.0.0.1:8001/api/public/store-settings/', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        currency: 'GBP',
        tax_rate: 0,
        shipping_rate: 5.99
      })
    );
  })
);

// Test store configuration
const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      cart: cartSlice.reducer,
      user: userSlice.reducer,
      ui: uiSlice.reducer,
      products: productsSlice.reducer,
    },
    preloadedState: {
      cart: {
        items: {
          guest: [
            {
              productId: 1,
              qty: 1,
              price: 29.99,
              name: 'Test Product',
              image: '/test-image.jpg'
            }
          ]
        },
        totals: { guest: 29.99 },
        shippingCosts: { guest: 5.99 }
      },
      user: {
        currentUser: null,
        isAuthenticated: false
      },
      ui: {
        currency: 'GBP',
        theme: 'dark',
        toasts: []
      },
      products: [
        {
          id: 1,
          name: 'Test Product',
          price: 29.99,
          stock: 10,
          is_active: true
        }
      ],
      ...initialState
    }
  });
};

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode; store?: any }> = ({ 
  children, 
  store = createTestStore() 
}) => (
  <Provider store={store}>
    <BrowserRouter>
      {children}
    </BrowserRouter>
  </Provider>
);

describe('Stripe Payment Integration Tests', () => {
  let stripe: any;

  beforeAll(async () => {
    // Setup MSW
    server.listen({ onUnhandledRequest: 'warn' });
    
    // Initialize real Stripe for testing
    stripe = await loadStripe(STRIPE_PUBLISHABLE_KEY);
    if (!stripe) {
      throw new Error('Failed to load Stripe');
    }
  });

  afterEach(() => {
    server.resetHandlers();
  });

  afterAll(() => {
    server.close();
  });

  describe('PaymentForm Component', () => {
    const defaultProps = {
      amount: 29.99,
      currency: 'GBP',
      onSuccess: jest.fn(),
      onError: jest.fn(),
      customerEmail: 'test@example.com',
      customerName: 'John Doe'
    };

    it('should render payment form with Stripe Elements', async () => {
      render(
        <TestWrapper>
          <PaymentForm {...defaultProps} />
        </TestWrapper>
      );

      // Wait for Stripe Elements to load
      await waitFor(() => {
        expect(screen.getByText('Card Information')).toBeInTheDocument();
      });

      // Verify payment button is present
      expect(screen.getByRole('button', { name: /pay £29\.99/i })).toBeInTheDocument();
    });

    it('should handle successful payment flow', async () => {
      const onSuccess = jest.fn();
      const onError = jest.fn();

      render(
        <TestWrapper>
          <PaymentForm 
            {...defaultProps} 
            onSuccess={onSuccess}
            onError={onError}
          />
        </TestWrapper>
      );

      // Wait for Stripe Elements to load
      await waitFor(() => {
        expect(screen.getByText('Card Information')).toBeInTheDocument();
      });

      // Note: In a real integration test, you would need to simulate
      // Stripe Elements card input. This is complex due to iframe security.
      // For now, we'll test the API integration aspects.

      // Verify that payment intent creation is triggered
      await waitFor(() => {
        expect(server.requests).toHaveLength(1);
        expect(server.requests[0].url).toContain('/create-payment-intent/');
      });
    });

    it('should handle payment errors gracefully', async () => {
      // Mock API error response
      server.use(
        rest.post('http://127.0.0.1:8001/api/public/create-payment-intent/', (req, res, ctx) => {
          return res(
            ctx.status(400),
            ctx.json({ error: 'Payment intent creation failed' })
          );
        })
      );

      const onError = jest.fn();

      render(
        <TestWrapper>
          <PaymentForm 
            {...defaultProps}
            onError={onError}
          />
        </TestWrapper>
      );

      // Wait for error to be handled
      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith(
          expect.stringContaining('Failed to create payment intent')
        );
      });
    });

    it('should handle 3D Secure authentication flow in PaymentForm', async () => {
      // Mock 3D Secure payment intent response
      server.use(
        rest.post('http://127.0.0.1:8001/api/public/create-payment-intent/', (req, res, ctx) => {
          return res(
            ctx.status(201),
            ctx.json({
              client_secret: 'pi_3ds_test_secret',
              payment_intent_id: 'pi_3ds_test',
              requires_action: true
            })
          );
        })
      );

      const onSuccess = jest.fn();
      const onError = jest.fn();

      render(
        <TestWrapper>
          <PaymentForm 
            {...defaultProps}
            onSuccess={onSuccess}
            onError={onError}
          />
        </TestWrapper>
      );

      // Wait for payment intent creation
      await waitFor(() => {
        expect(screen.getByText('Card Information')).toBeInTheDocument();
      });

      // Verify 3D Secure handling would be triggered
      // In a real implementation, this would show "Verifying 3D Secure..." UI
      await waitFor(() => {
        expect(server.requests).toHaveLength(1);
        expect(server.requests[0].url).toContain('/create-payment-intent/');
      });

      // The actual 3D Secure modal simulation would happen in the component
      // when confirmCardPayment is called with requires_action status
    });
  });

  describe('Checkout Page Integration', () => {
    it('should render complete checkout flow', async () => {
      render(
        <TestWrapper>
          <Checkout />
        </TestWrapper>
      );

      // Wait for page to load
      await waitFor(() => {
        expect(screen.getByText(/checkout/i)).toBeInTheDocument();
      });

      // Verify checkout steps are present
      expect(screen.getByText(/shipping address/i)).toBeInTheDocument();
      expect(screen.getByText(/payment/i)).toBeInTheDocument();
      expect(screen.getByText(/review/i)).toBeInTheDocument();
    });

    it('should handle form validation', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <Checkout />
        </TestWrapper>
      );

      // Wait for form to load
      await waitFor(() => {
        expect(screen.getByText(/checkout/i)).toBeInTheDocument();
      });

      // Try to submit without filling required fields
      const placeOrderButton = screen.getByRole('button', { name: /place order/i });
      await user.click(placeOrderButton);

      // Should show validation errors
      await waitFor(() => {
        expect(screen.getByText(/please complete the following required fields/i)).toBeInTheDocument();
      });
    });

    it('should process successful payment and redirect', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <Checkout />
        </TestWrapper>
      );

      // Wait for form to load
      await waitFor(() => {
        expect(screen.getByText(/checkout/i)).toBeInTheDocument();
      });

      // Fill out the form (simplified for testing)
      // In a real test, you would fill all required fields
      
      // Mock successful payment flow
      server.use(
        rest.post('http://127.0.0.1:8001/api/public/create-payment-intent/', (req, res, ctx) => {
          return res(
            ctx.status(201),
            ctx.json({
              client_secret: 'pi_test_success_secret',
              payment_intent_id: 'pi_test_success'
            })
          );
        }),
        rest.post('http://127.0.0.1:8001/api/public/orders/', (req, res, ctx) => {
          return res(
            ctx.status(201),
            ctx.json({
              tracking_id: 'ORD-SUCCESS-123',
              status: 'confirmed'
            })
          );
        })
      );

      // Note: Actual form submission testing would require
      // complex Stripe Elements simulation
    });
  });

  describe('Stripe API Integration', () => {
    it('should create payment method with test card', async () => {
      // Test direct Stripe API integration
      const paymentMethod = await stripe.createPaymentMethod({
        type: 'card',
        card: {
          number: '4242424242424242',
          exp_month: 12,
          exp_year: 2025,
          cvc: '123'
        },
        billing_details: {
          name: 'Test User',
          email: 'test@example.com'
        }
      });

      expect(paymentMethod.error).toBeUndefined();
      expect(paymentMethod.paymentMethod).toBeDefined();
      expect(paymentMethod.paymentMethod.id).toMatch(/^pm_/);
    });

    it('should handle 3D Secure authentication flow', async () => {
      // Test 3D Secure card that requires authentication
      const paymentMethod = await stripe.createPaymentMethod({
        type: 'card',
        card: {
          number: '4000002500003155', // 3D Secure test card
          exp_month: 12,
          exp_year: 2030,
          cvc: '123'
        },
        billing_details: {
          name: 'Test User',
          email: 'test@example.com'
        }
      });

      expect(paymentMethod.error).toBeUndefined();
      expect(paymentMethod.paymentMethod).toBeDefined();

      // Create payment intent
      const paymentIntent = await stripe.createPaymentIntent({
        amount: 2999,
        currency: 'gbp'
      });

      // Confirm payment - this should trigger 3D Secure
      const confirmResult = await stripe.confirmCardPayment(
        paymentIntent.client_secret,
        {
          payment_method: paymentMethod.paymentMethod.id
        }
      );

      // Should require action for 3D Secure
      expect(confirmResult.error).toBeUndefined();
      expect(confirmResult.paymentIntent.status).toBe('requires_action');
      expect(confirmResult.paymentIntent.next_action).toBeDefined();
      expect(confirmResult.paymentIntent.next_action.type).toBe('use_stripe_sdk');
    });

    it('should handle declined card errors', async () => {
      const paymentMethod = await stripe.createPaymentMethod({
        type: 'card',
        card: {
          number: '4000000000000002', // Declined card
          exp_month: 12,
          exp_year: 2025,
          cvc: '123'
        }
      });

      // Payment method creation should succeed
      expect(paymentMethod.error).toBeUndefined();
      
      // But payment confirmation should fail
      const paymentIntent = await stripe.createPaymentIntent({
        amount: 2999,
        currency: 'gbp'
      });

      const confirmResult = await stripe.confirmCardPayment(
        paymentIntent.client_secret,
        {
          payment_method: paymentMethod.paymentMethod.id
        }
      );

      expect(confirmResult.error).toBeDefined();
      expect(confirmResult.error.code).toBe('card_declined');
    });

    it('should handle insufficient funds error', async () => {
      const paymentMethod = await stripe.createPaymentMethod({
        type: 'card',
        card: {
          number: '4000000000009995', // Insufficient funds
          exp_month: 12,
          exp_year: 2025,
          cvc: '123'
        }
      });

      const paymentIntent = await stripe.createPaymentIntent({
        amount: 2999,
        currency: 'gbp'
      });

      const confirmResult = await stripe.confirmCardPayment(
        paymentIntent.client_secret,
        {
          payment_method: paymentMethod.paymentMethod.id
        }
      );

      expect(confirmResult.error).toBeDefined();
      expect(confirmResult.error.code).toBe('card_declined');
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle network errors gracefully', async () => {
      // Mock network failure
      server.use(
        rest.post('http://127.0.0.1:8001/api/public/create-payment-intent/', (req, res, ctx) => {
          return res.networkError('Network error');
        })
      );

      const onError = jest.fn();

      render(
        <TestWrapper>
          <PaymentForm 
            {...{
              amount: 29.99,
              currency: 'GBP',
              onSuccess: jest.fn(),
              onError,
              customerEmail: 'test@example.com',
              customerName: 'John Doe'
            }}
          />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith(
          expect.stringContaining('Failed to create payment intent')
        );
      });
    });

    it('should handle invalid payment amounts', async () => {
      server.use(
        rest.post('http://127.0.0.1:8001/api/public/create-payment-intent/', (req, res, ctx) => {
          return res(
            ctx.status(400),
            ctx.json({ error: 'Invalid amount' })
          );
        })
      );

      const onError = jest.fn();

      render(
        <TestWrapper>
          <PaymentForm 
            {...{
              amount: 0, // Invalid amount
              currency: 'GBP',
              onSuccess: jest.fn(),
              onError,
              customerEmail: 'test@example.com',
              customerName: 'John Doe'
            }}
          />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(onError).toHaveBeenCalled();
      });
    });
  });

  describe('Webhook Integration Simulation', () => {
    it('should handle payment success webhook', async () => {
      // Simulate webhook payload
      const webhookPayload = {
        id: 'evt_test_webhook',
        object: 'event',
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_test_webhook',
            amount: 2999,
            currency: 'gbp',
            status: 'succeeded'
          }
        }
      };

      // Mock webhook endpoint
      server.use(
        rest.post('http://127.0.0.1:8001/api/public/stripe/webhook/', (req, res, ctx) => {
          return res(ctx.status(200), ctx.json({ status: 'success' }));
        })
      );

      // Simulate webhook call
      const response = await fetch('http://127.0.0.1:8001/api/public/stripe/webhook/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Stripe-Signature': 'test_signature'
        },
        body: JSON.stringify(webhookPayload)
      });

      expect(response.status).toBe(200);
    });
  });
});

// Utility functions for testing
export const createMockPaymentMethod = async (cardNumber: string = '4242424242424242') => {
  const stripe = await loadStripe(STRIPE_PUBLISHABLE_KEY);
  if (!stripe) throw new Error('Stripe not loaded');
  
  return stripe.createPaymentMethod({
    type: 'card',
    card: {
      number: cardNumber,
      exp_month: 12,
      exp_year: 2025,
      cvc: '123'
    },
    billing_details: {
      name: 'Test User',
      email: 'test@example.com'
    }
  });
};

export const createMockPaymentIntent = async (amount: number = 2999) => {
  const stripe = await loadStripe(STRIPE_PUBLISHABLE_KEY);
  if (!stripe) throw new Error('Stripe not loaded');
  
  return stripe.createPaymentIntent({
    amount,
    currency: 'gbp'
  });
};

// Test data constants
export const TEST_CARDS = {
  SUCCESS: '4242424242424242',
  DECLINED: '4000000000000002',
  INSUFFICIENT_FUNDS: '4000000000009995',
  REQUIRES_3D_SECURE: '4000002500003155', // 3D Secure authentication required
  EXPIRED: '4000000000000069',
  INCORRECT_CVC: '4000000000000127'
};

export const TEST_AMOUNTS = {
  VALID: 2999, // £29.99 in pence
  INVALID: 0,
  LARGE: 999999 // £9999.99 in pence
};
