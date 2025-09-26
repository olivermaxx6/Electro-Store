#!/usr/bin/env python3
"""
Test Stripe in Django context
"""

import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

import stripe
from django.conf import settings

def test_stripe_in_django():
    """Test Stripe in Django context"""
    print("🔍 Testing Stripe in Django context...")
    print(f"✅ Stripe module: {stripe}")
    print(f"✅ Stripe type: {type(stripe)}")
    print(f"✅ Has checkout attribute: {hasattr(stripe, 'checkout')}")
    print(f"✅ Stripe checkout: {stripe.checkout}")
    print(f"✅ Stripe checkout type: {type(stripe.checkout)}")
    print(f"✅ Has Session attribute: {hasattr(stripe.checkout, 'Session')}")
    print(f"✅ Stripe Session: {stripe.checkout.Session}")
    print(f"✅ Stripe Session type: {type(stripe.checkout.Session)}")
    
    # Test API key
    stripe.api_key = settings.STRIPE_SECRET_KEY
    print(f"✅ API key set: {stripe.api_key[:20]}...")
    
    return True

if __name__ == "__main__":
    test_stripe_in_django()
