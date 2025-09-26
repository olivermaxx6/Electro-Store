#!/usr/bin/env python3
"""
Test the actual API endpoint with detailed logging
"""

import requests
import json

def test_api_endpoint():
    """Test the actual API endpoint"""
    print("🔍 Testing API endpoint with detailed logging...")
    
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
    
    print(f"📤 Sending request to: http://127.0.0.1:8001/api/public/create-checkout-session/")
    print(f"📦 Request data: {json.dumps(checkout_data, indent=2)}")
    
    try:
        response = requests.post(
            "http://127.0.0.1:8001/api/public/create-checkout-session/",
            json=checkout_data,
            headers={
                "Content-Type": "application/json",
                "X-Requested-With": "XMLHttpRequest"
            },
            timeout=30
        )
        
        print(f"\n📡 Response status: {response.status_code}")
        print(f"📄 Response headers: {dict(response.headers)}")
        print(f"📄 Response text: {response.text}")
        
        if response.status_code == 201:
            data = response.json()
            print(f"\n✅ Success!")
            print(f"📋 Session ID: {data.get('checkout_session_id', 'N/A')}")
            print(f"🔗 Checkout URL: {data.get('checkout_url', 'N/A')}")
            print(f"📦 Order ID: {data.get('order_id', 'N/A')}")
            return True
        else:
            print(f"\n❌ Failed with status {response.status_code}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"\n❌ Request failed: {e}")
        return False

if __name__ == "__main__":
    test_api_endpoint()
