#!/usr/bin/env python3
"""
Comprehensive Stripe Checkout Test Script

This script tests the complete Stripe checkout flow to identify any issues
with the redirection process.
"""

import requests
import json
import time
import sys

# Configuration
BACKEND_URL = "http://127.0.0.1:8001"
FRONTEND_URL = "http://127.0.0.1:5173"

def test_backend_health():
    """Test if backend is running and accessible"""
    print("🔍 Testing backend health...")
    try:
        response = requests.get(f"{BACKEND_URL}/api/public/health/", timeout=10)
        if response.status_code == 200:
            print("✅ Backend is running and accessible")
            return True
        else:
            print(f"❌ Backend returned status {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Cannot reach backend: {e}")
        return False

def test_stripe_checkout_endpoint():
    """Test the Stripe checkout endpoint directly"""
    print("🔍 Testing Stripe checkout endpoint...")
    
    # Sample checkout data
    checkout_data = {
        "cart_items": [
            {
                "product_id": 49,
                "quantity": 2,
                "unit_price": 499.99
            }
        ],
        "subtotal": 999.98,
        "shipping_cost": 5.99,
        "tax_amount": 60.60,
        "total_price": 1066.57,
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
        response = requests.post(
            f"{BACKEND_URL}/api/public/create-checkout-session/",
            json=checkout_data,
            headers={
                "Content-Type": "application/json",
                "X-Requested-With": "XMLHttpRequest"
            },
            timeout=30
        )
        
        print(f"📡 Response status: {response.status_code}")
        
        if response.status_code == 201:
            data = response.json()
            print("✅ Checkout session created successfully")
            print(f"📋 Session ID: {data.get('checkout_session_id', 'N/A')}")
            print(f"🔗 Checkout URL: {data.get('checkout_url', 'N/A')}")
            print(f"📦 Order ID: {data.get('order_id', 'N/A')}")
            
            # Verify required fields
            if data.get('checkout_url'):
                print("✅ Checkout URL is present")
                return True
            else:
                print("❌ Checkout URL is missing")
                return False
        else:
            print(f"❌ Checkout session creation failed")
            print(f"📄 Response: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {e}")
        return False

def test_frontend_connectivity():
    """Test if frontend is accessible"""
    print("🔍 Testing frontend connectivity...")
    try:
        response = requests.get(f"{FRONTEND_URL}", timeout=10)
        if response.status_code == 200:
            print("✅ Frontend is accessible")
            return True
        else:
            print(f"❌ Frontend returned status {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Cannot reach frontend: {e}")
        return False

def test_stripe_configuration():
    """Test Stripe configuration in backend"""
    print("🔍 Testing Stripe configuration...")
    try:
        response = requests.get(f"{BACKEND_URL}/api/public/create-checkout-session/", timeout=10)
        if response.status_code == 200:
            data = response.json()
            if "stripe_module" in data:
                print("✅ Stripe module is loaded")
                return True
            else:
                print("❌ Stripe module not found in response")
                return False
        else:
            print(f"❌ Test endpoint returned status {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {e}")
        return False

def main():
    """Run all tests"""
    print("🚀 Starting comprehensive Stripe checkout tests...")
    print("=" * 60)
    
    tests = [
        ("Backend Health", test_backend_health),
        ("Stripe Configuration", test_stripe_configuration),
        ("Stripe Checkout Endpoint", test_stripe_checkout_endpoint),
        ("Frontend Connectivity", test_frontend_connectivity),
    ]
    
    results = []
    
    for test_name, test_func in tests:
        print(f"\n🧪 Running {test_name} test...")
        print("-" * 40)
        result = test_func()
        results.append((test_name, result))
        print()
    
    print("=" * 60)
    print("📊 Test Results Summary:")
    print("=" * 60)
    
    all_passed = True
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{test_name}: {status}")
        if not result:
            all_passed = False
    
    print("=" * 60)
    if all_passed:
        print("🎉 All tests passed! Stripe checkout should work correctly.")
        print("\n💡 Next steps:")
        print("1. Open the frontend in your browser")
        print("2. Add items to cart")
        print("3. Go to checkout")
        print("4. Fill out the form and click 'Place Order'")
        print("5. Check browser console for detailed logs")
    else:
        print("⚠️ Some tests failed. Please check the issues above.")
        print("\n🔧 Troubleshooting tips:")
        print("1. Ensure backend is running on port 8001")
        print("2. Ensure frontend is running on port 5173")
        print("3. Check Stripe API keys in backend settings")
        print("4. Verify network connectivity")
    
    return 0 if all_passed else 1

if __name__ == "__main__":
    sys.exit(main())
