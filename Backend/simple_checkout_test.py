#!/usr/bin/env python3
"""
Simple Stripe Checkout Test
"""

import requests
import json

def test_checkout():
    print("🧪 Testing Stripe checkout endpoint...")
    
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
        response = requests.post(
            "http://127.0.0.1:8001/api/public/create-checkout-session/",
            json=checkout_data,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        print(f"Status: {response.status_code}")
        if response.status_code == 201:
            data = response.json()
            print("✅ Success!")
            print(f"Session ID: {data.get('checkout_session_id', 'N/A')}")
            print(f"Checkout URL: {data.get('checkout_url', 'N/A')}")
        else:
            print(f"❌ Error: {response.text}")
    except Exception as e:
        print(f"❌ Exception: {e}")

if __name__ == "__main__":
    test_checkout()
