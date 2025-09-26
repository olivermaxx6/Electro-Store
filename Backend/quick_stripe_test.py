#!/usr/bin/env python3
"""
Quick Stripe Test
"""

import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.conf import settings
import stripe

def test_stripe():
    print("🧪 Quick Stripe Test...")
    
    # Check settings
    print(f"STRIPE_SECRET_KEY: {settings.STRIPE_SECRET_KEY[:20] if settings.STRIPE_SECRET_KEY else 'None'}...")
    print(f"STRIPE_PUBLISHABLE_KEY: {settings.STRIPE_PUBLISHABLE_KEY[:20] if settings.STRIPE_PUBLISHABLE_KEY else 'None'}...")
    
    if not settings.STRIPE_SECRET_KEY:
        print("❌ STRIPE_SECRET_KEY is None!")
        return False
    
    # Test Stripe
    try:
        stripe.api_key = settings.STRIPE_SECRET_KEY
        print("✅ Stripe API key set successfully")
        
        # Test checkout session creation
        session = stripe.checkout.Session.create(
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
        
        print(f"✅ Checkout session created: {session.id}")
        print(f"✅ Checkout URL: {session.url}")
        print("🎉 SUCCESS: Stripe is working correctly!")
        return True
        
    except Exception as e:
        print(f"❌ Stripe test failed: {e}")
        return False

if __name__ == "__main__":
    success = test_stripe()
    sys.exit(0 if success else 1)
