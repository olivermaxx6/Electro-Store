/**
 * Test Setup Configuration for Stripe Integration Tests
 * 
 * This file configures the testing environment for Stripe integration tests,
 * including MSW setup, Stripe configuration, and global test utilities.
 */

import '@testing-library/jest-dom';
import { beforeAll, afterEach, afterAll } from '@testing-library/jest-dom';
import { server } from './mocks/server';

// Configure Stripe for testing
const STRIPE_PUBLISHABLE_KEY = 'pk_test_51S9TOV1P7OUaUZWmpjXeetCOf0MQuQ6vm0hvgNGj0p0hdQfOM5wDCjKTDSCZZg7qb0ozclRUmWlKNTENZEvYDiJK003tEvvONV';

// Global test configuration
beforeAll(() => {
  // Start MSW server
  server.listen({ onUnhandledRequest: 'warn' });
  
  // Configure global Stripe settings
  (global as any).STRIPE_PUBLISHABLE_KEY = STRIPE_PUBLISHABLE_KEY;
  
  // Mock window.matchMedia for responsive tests
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(), // deprecated
      removeListener: jest.fn(), // deprecated
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
  
  // Mock IntersectionObserver
  global.IntersectionObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  }));
  
  // Mock ResizeObserver
  global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  }));
});

afterEach(() => {
  // Reset MSW handlers
  server.resetHandlers();
  
  // Clear all mocks
  jest.clearAllMocks();
  
  // Clear localStorage
  localStorage.clear();
  
  // Clear sessionStorage
  sessionStorage.clear();
});

afterAll(() => {
  // Close MSW server
  server.close();
});

// Global test utilities
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toHaveClass(className: string): R;
      toHaveTextContent(text: string | RegExp): R;
    }
  }
}

// Export test utilities
export const TEST_CARDS = {
  SUCCESS: '4242424242424242',
  DECLINED: '4000000000000002',
  INSUFFICIENT_FUNDS: '4000000000009995',
  REQUIRES_3D_SECURE: '4000002500003155',
  EXPIRED: '4000000000000069',
  INCORRECT_CVC: '4000000000000127'
};

export const TEST_AMOUNTS = {
  VALID: 2999, // £29.99 in pence
  INVALID: 0,
  LARGE: 999999, // £9999.99 in pence
  MINIMUM: 50 // £0.50 in pence (Stripe minimum)
};

export const TEST_METADATA = {
  ORDER_ID: 'test_order_123',
  CUSTOMER_EMAIL: 'test@example.com',
  CUSTOMER_NAME: 'Test User'
};
