#!/usr/bin/env python3
"""
Debug script to test the checkout flow step by step
"""

import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

import stripe
from django.conf import settings
from adminpanel.models import Product, Order, OrderItem

def test_stripe_import():
    """Test Stripe import and configuration"""
    print("🔍 Testing Stripe import...")
    try:
        print(f"✅ Stripe imported successfully")
        print(f"✅ Has checkout: {hasattr(stripe, 'checkout')}")
        print(f"✅ Has Session: {hasattr(stripe.checkout, 'Session')}")
        
        # Test API key
        stripe.api_key = settings.STRIPE_SECRET_KEY
        print(f"✅ API key set: {stripe.api_key[:20]}...")
        
        return True
    except Exception as e:
        print(f"❌ Stripe import failed: {e}")
        return False

def test_product_lookup():
    """Test product lookup"""
    print("\n🔍 Testing product lookup...")
    try:
        products = Product.objects.all()
        print(f"✅ Total products: {products.count()}")
        
        # Test with product ID 49
        try:
            product = Product.objects.get(id=49)
            print(f"✅ Product 49 found: {product.name} - ${product.price}")
            return True
        except Product.DoesNotExist:
            print(f"❌ Product 49 not found")
            return False
            
    except Exception as e:
        print(f"❌ Product lookup failed: {e}")
        return False

def test_checkout_session_creation():
    """Test creating a checkout session"""
    print("\n🔍 Testing checkout session creation...")
    try:
        # Get a product
        product = Product.objects.get(id=49)
        
        # Create line items
        line_items = [{
            'price_data': {
                'currency': 'gbp',
                'product_data': {
                    'name': product.name,
                },
                'unit_amount': int(float(product.price) * 100),
            },
            'quantity': 2,
        }]
        
        print(f"✅ Line items prepared: {len(line_items)} items")
        
        # Create checkout session
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=line_items,
            mode='payment',
            customer_email='test@example.com',
            success_url='http://127.0.0.1:5173/order-confirmation/{CHECKOUT_SESSION_ID}',
            cancel_url='http://127.0.0.1:5173/checkout?cancelled=true',
        )
        
        print(f"✅ Checkout session created: {checkout_session.id}")
        print(f"✅ Checkout URL: {checkout_session.url}")
        
        return True
        
    except Exception as e:
        print(f"❌ Checkout session creation failed: {e}")
        import traceback
        print(f"❌ Traceback: {traceback.format_exc()}")
        return False

def main():
    print("🚀 Starting checkout flow debug...")
    print("=" * 50)
    
    # Test 1: Stripe import
    stripe_ok = test_stripe_import()
    
    # Test 2: Product lookup
    product_ok = test_product_lookup()
    
    # Test 3: Checkout session creation
    if stripe_ok and product_ok:
        session_ok = test_checkout_session_creation()
    else:
        print("\n⏭️ Skipping checkout session test due to previous failures")
        session_ok = False
    
    print("\n" + "=" * 50)
    print("📊 Debug Results:")
    print(f"Stripe Import: {'✅ PASS' if stripe_ok else '❌ FAIL'}")
    print(f"Product Lookup: {'✅ PASS' if product_ok else '❌ FAIL'}")
    print(f"Session Creation: {'✅ PASS' if session_ok else '❌ FAIL'}")
    
    if all([stripe_ok, product_ok, session_ok]):
        print("\n🎉 All tests passed! Checkout should work.")
    else:
        print("\n⚠️ Some tests failed. Check the issues above.")

if __name__ == "__main__":
    main()
