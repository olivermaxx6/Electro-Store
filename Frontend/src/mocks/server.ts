/**
 * Mock Service Worker (MSW) Configuration for Stripe Integration Tests
 * 
 * This file configures MSW to intercept API calls to the Django backend
 * and provide realistic responses for testing the Stripe integration.
 */

import { setupServer } from 'msw/node';
import { rest } from 'msw';

// Mock API responses for Stripe integration tests
export const handlers = [
  // Payment Intent Creation
  rest.post('http://127.0.0.1:8001/api/public/create-payment-intent/', (req, res, ctx) => {
    const body = req.body as any;
    
    // Validate request
    if (!body.amount || body.amount <= 0) {
      return res(
        ctx.status(400),
        ctx.json({ error: 'Invalid amount' })
      );
    }
    
    // Simulate successful payment intent creation
    return res(
      ctx.status(201),
      ctx.json({
        client_secret: `pi_test_${Date.now()}_secret_test${Math.random().toString(36).substr(2, 9)}`,
        payment_intent_id: `pi_test_${Date.now()}`
      })
    );
  }),

  // Order Creation
  rest.post('http://127.0.0.1:8001/api/public/orders/', (req, res, ctx) => {
    const body = req.body as any;
    
    // Validate required fields
    if (!body.cart_items || !body.total_price) {
      return res(
        ctx.status(400),
        ctx.json({ error: 'Missing required fields' })
      );
    }
    
    // Simulate successful order creation
    return res(
      ctx.status(201),
      ctx.json({
        tracking_id: `ORD-${Date.now()}`,
        status: 'confirmed',
        message: 'Order placed successfully',
        order_id: `order_${Date.now()}`
      })
    );
  }),

  // Store Settings
  rest.get('http://127.0.0.1:8001/api/public/store-settings/', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        store_name: 'Test Store',
        currency: 'GBP',
        tax_rate: 0,
        shipping_rate: 5.99,
        is_active: true
      })
    );
  }),

  // Stripe Webhook Endpoint
  rest.post('http://127.0.0.1:8001/api/public/stripe/webhook/', (req, res, ctx) => {
    const signature = req.headers.get('stripe-signature');
    
    if (!signature) {
      return res(
        ctx.status(400),
        ctx.json({ error: 'Missing signature' })
      );
    }
    
    // Simulate successful webhook processing
    return res(
      ctx.status(200),
      ctx.json({ status: 'success' })
    );
  }),

  // Health Check
  rest.get('http://127.0.0.1:8001/api/public/health/', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({ status: 'ok' })
    );
  }),

  // Products API
  rest.get('http://127.0.0.1:8001/api/public/products/', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        results: [
          {
            id: 1,
            name: 'Test Product',
            description: 'A test product for integration testing',
            price: 29.99,
            stock: 10,
            is_active: true,
            images: []
          }
        ],
        count: 1,
        next: null,
        previous: null
      })
    );
  }),

  // Categories API
  rest.get('http://127.0.0.1:8001/api/public/categories/', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        results: [
          {
            id: 1,
            name: 'Test Category',
            description: 'A test category',
            is_active: true
          }
        ],
        count: 1
      })
    );
  })
];

// Error scenarios for testing
export const errorHandlers = {
  // Payment Intent Creation Error
  paymentIntentError: rest.post('http://127.0.0.1:8001/api/public/create-payment-intent/', (req, res, ctx) => {
    return res(
      ctx.status(400),
      ctx.json({ error: 'Payment intent creation failed' })
    );
  }),

  // Order Creation Error
  orderCreationError: rest.post('http://127.0.0.1:8001/api/public/orders/', (req, res, ctx) => {
    return res(
      ctx.status(500),
      ctx.json({ error: 'Internal server error' })
    );
  }),

  // Network Error
  networkError: rest.post('http://127.0.0.1:8001/api/public/create-payment-intent/', (req, res, ctx) => {
    return res.networkError('Network error');
  }),

  // Timeout Error
  timeoutError: rest.post('http://127.0.0.1:8001/api/public/create-payment-intent/', (req, res, ctx) => {
    return res(ctx.delay('infinite'));
  })
};

// Setup MSW server
export const server = setupServer(...handlers);

// Utility functions for test setup
export const setupErrorScenario = (errorType: keyof typeof errorHandlers) => {
  server.use(errorHandlers[errorType]);
};

export const resetErrorScenario = () => {
  server.resetHandlers(...handlers);
};
