#!/usr/bin/env python3
"""
Test Stripe Configuration
"""

import os
import sys
import django

# Set environment variables
os.environ['STRIPE_SECRET_KEY'] = 'your_stripe_secret_key_here'
os.environ['STRIPE_PUBLISHABLE_KEY'] = 'your_stripe_publishable_key_here'

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.conf import settings
import stripe

def test_stripe_config():
    print("🧪 Testing Stripe Configuration...")
    
    # Check environment variables
    print(f"Environment STRIPE_SECRET_KEY: {os.getenv('STRIPE_SECRET_KEY', 'NOT SET')[:20]}...")
    print(f"Environment STRIPE_PUBLISHABLE_KEY: {os.getenv('STRIPE_PUBLISHABLE_KEY', 'NOT SET')[:20]}...")
    
    # Check Django settings
    print(f"Django settings STRIPE_SECRET_KEY: {settings.STRIPE_SECRET_KEY[:20] if settings.STRIPE_SECRET_KEY else 'None'}...")
    print(f"Django settings STRIPE_PUBLISHABLE_KEY: {settings.STRIPE_PUBLISHABLE_KEY[:20] if settings.STRIPE_PUBLISHABLE_KEY else 'None'}...")
    
    # Test Stripe API
    try:
        stripe.api_key = settings.STRIPE_SECRET_KEY
        print(f"✅ Stripe API key set: {stripe.api_key[:20]}...")
        
        # Test Stripe connection
        if hasattr(stripe, 'checkout'):
            print("✅ Stripe checkout module available")
            if hasattr(stripe.checkout, 'Session'):
                print("✅ Stripe checkout Session available")
                
                # Try to create a test session
                test_session = stripe.checkout.Session.create(
                    payment_method_types=['card'],
                    line_items=[{
                        'price_data': {
                            'currency': 'gbp',
                            'product_data': {
                                'name': 'Test Product',
                            },
                            'unit_amount': 2000,  # £20.00
                        },
                        'quantity': 1,
                    }],
                    mode='payment',
                    success_url='http://127.0.0.1:5173/success',
                    cancel_url='http://127.0.0.1:5173/cancel',
                )
                print(f"✅ Test checkout session created: {test_session.id}")
                print(f"✅ Checkout URL: {test_session.url}")
                return True
            else:
                print("❌ Stripe checkout Session not available")
                return False
        else:
            print("❌ Stripe checkout module not available")
            return False
            
    except Exception as e:
        print(f"❌ Stripe test failed: {e}")
        return False

if __name__ == "__main__":
    success = test_stripe_config()
    sys.exit(0 if success else 1)
