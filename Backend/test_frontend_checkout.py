#!/usr/bin/env python3
"""
Test Frontend Checkout Flow
"""

import requests
import json

def test_frontend_checkout():
    print("🧪 Testing Frontend Checkout Flow...")
    
    # Test data that matches what the frontend sends
    checkout_data = {
        "cart_items": [
            {
                "product_id": 1,
                "quantity": 1,
                "unit_price": 25.99
            }
        ],
        "subtotal": 25.99,
        "shipping_cost": 5.99,
        "tax_amount": 2.60,
        "total_price": 34.58,
        "customer_email": "test@example.com",
        "customer_phone": "+1234567890",
        "shipping_address": {
            "firstName": "John",
            "lastName": "Doe",
            "email": "test@example.com",
            "phone": "+1234567890",
            "address1": "123 Test St",
            "city": "Test City",
            "state": "TS",
            "postcode": "12345",
            "country": "US"
        },
        "shipping_name": "Standard Shipping",
        "user_id": "guest"
    }
    
    try:
        print("📤 Sending request to checkout endpoint...")
        response = requests.post(
            "http://127.0.0.1:8001/api/public/create-checkout-session/",
            json=checkout_data,
            headers={
                "Content-Type": "application/json",
                "X-Requested-With": "XMLHttpRequest"
            },
            timeout=10
        )
        
        print(f"📡 Response status: {response.status_code}")
        
        if response.status_code == 201:
            data = response.json()
            print("✅ Checkout session created successfully!")
            print(f"📋 Session ID: {data.get('checkout_session_id', 'N/A')}")
            print(f"🔗 Checkout URL: {data.get('checkout_url', 'N/A')}")
            
            if data.get('checkout_url'):
                print("🎉 SUCCESS: Frontend should redirect to Stripe checkout!")
                return True
            else:
                print("❌ ERROR: No checkout URL in response")
                return False
        else:
            print(f"❌ ERROR: {response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ ERROR: Cannot connect to backend server")
        print("💡 Make sure Django server is running on port 8001")
        return False
    except Exception as e:
        print(f"❌ ERROR: {e}")
        return False

if __name__ == "__main__":
    success = test_frontend_checkout()
    if not success:
        print("\n🔧 TROUBLESHOOTING STEPS:")
        print("1. Stop the Django server (Ctrl+C in the terminal where it's running)")
        print("2. Set environment variables:")
        print("   $env:STRIPE_SECRET_KEY='your_stripe_secret_key_here'")
        print("   $env:STRIPE_PUBLISHABLE_KEY='your_stripe_publishable_key_here'")
        print("3. Restart Django server: python manage.py runserver 8001")
        print("4. Test again: python test_frontend_checkout.py")
