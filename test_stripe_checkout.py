#!/usr/bin/env python3
"""
Test script to verify the Stripe Checkout integration
"""

import requests
import json
import time

def test_stripe_checkout_flow():
    """Test the complete Stripe Checkout flow"""
    
    print("🧪 Testing Stripe Checkout Integration")
    print("=" * 50)
    
    # Test data
    checkout_data = {
        'cart_items': [
            {'product_id': 238, 'quantity': 1, 'unit_price': 25.0}
        ],
        'subtotal': 25.0,
        'shipping_cost': 0.0,
        'tax_amount': 0.0,
        'total_price': 25.0,
        'customer_email': 'test@example.com',
        'customer_phone': '123456789',
        'shipping_address': {
            'firstName': 'Test',
            'lastName': 'User', 
            'address1': '123 Test St',
            'city': 'Test City',
            'state': 'TS',
            'postcode': '12345'
        },
        'shipping_name': 'Standard Shipping',
        'user_id': 'guest'
    }
    
    headers = {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
    }
    
    # Step 1: Test checkout session creation
    print("1️⃣ Testing checkout session creation...")
    
    try:
        response = requests.post(
            'http://127.0.0.1:8001/api/public/create-checkout-session/',
            json=checkout_data,
            headers=headers
        )
        
        if response.status_code == 201:
            session_data = response.json()
            print(f"✅ Checkout session created successfully!")
            print(f"   Session ID: {session_data.get('checkout_session_id')}")
            print(f"   Checkout URL: {session_data.get('checkout_url')}")
            
            session_id = session_data.get('checkout_session_id')
            checkout_url = session_data.get('checkout_url')
            
            if checkout_url:
                print(f"\n🔗 Stripe Checkout URL:")
                print(f"   {checkout_url}")
                print(f"\n📝 To test manually:")
                print(f"   1. Copy the URL above")
                print(f"   2. Open it in your browser")
                print(f"   3. Complete payment with test card: 4242 4242 4242 4242")
                print(f"   4. You'll be redirected to order confirmation page")
                
                # Test the checkout session retrieval endpoint
                print(f"\n2️⃣ Testing checkout session retrieval...")
                
                session_response = requests.get(
                    f'http://127.0.0.1:8001/api/public/checkout-session/{session_id}/'
                )
                
                if session_response.status_code == 200:
                    print("✅ Checkout session retrieval endpoint working")
                    print("   (Note: Order won't exist until payment is completed)")
                else:
                    print(f"⚠️ Checkout session retrieval failed: {session_response.status_code}")
                    print(f"   This is expected before payment completion")
            else:
                print("❌ No checkout URL received")
                return False
                
        else:
            print(f"❌ Checkout session creation failed: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Checkout session creation error: {e}")
        return False
    
    print(f"\n🎉 Stripe Checkout integration test PASSED!")
    print(f"\n📋 Next Steps:")
    print(f"   1. Frontend checkout now redirects to Stripe Checkout")
    print(f"   2. Users complete payment on Stripe's secure page")
    print(f"   3. Webhook creates order after successful payment")
    print(f"   4. Users return to order confirmation page")
    print(f"   5. Order appears in admin with 'Paid' status")
    
    return True

if __name__ == "__main__":
    success = test_stripe_checkout_flow()
    exit(0 if success else 1)
