#!/usr/bin/env python3
"""
Test script to debug the create-order-checkout API endpoint
"""
import requests
import json

def test_order_creation():
    """Test the order creation API endpoint"""
    
    # Test data
    test_order_data = {
        "cart_items": [
            {
                "product_id": "18",
                "name": "Test Product",
                "price": 549.99,
                "quantity": 1,
                "image": ""
            }
        ],
        "customer_email": "test@example.com",
        "customer_name": "Test User",
        "customer_phone": "1234567890",
        "shipping_address": {
            "firstName": "Test",
            "lastName": "User",
            "address": "123 Test Street",
            "address2": "",
            "city": "Test City",
            "state": "Test State",
            "zipCode": "12345",
            "country": "United Kingdom"
        },
        "billing_address": {
            "firstName": "Test",
            "lastName": "User",
            "address": "123 Test Street",
            "address2": "",
            "city": "Test City",
            "state": "Test State",
            "zipCode": "12345",
            "country": "United Kingdom"
        },
        "subtotal": 549.99,
        "shipping_cost": 5.00,
        "tax_amount": 16.50,
        "total_price": 571.49,
        "shipping_method": "standard"
    }
    
    print("🧪 Testing Order Creation API...")
    print(f"📦 Order Data: {json.dumps(test_order_data, indent=2)}")
    
    try:
        # Make the API call
        response = requests.post(
            'http://127.0.0.1:8001/api/public/create-order-checkout/',
            headers={
                'Content-Type': 'application/json',
            },
            json=test_order_data,
            timeout=30
        )
        
        print(f"\n📊 Response Status: {response.status_code}")
        print(f"📊 Response Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Success! Response: {json.dumps(data, indent=2)}")
            
            if 'checkout_url' in data:
                print(f"\n🔗 Checkout URL: {data['checkout_url']}")
                print("✅ Order creation successful! You can now test the Stripe checkout.")
            else:
                print("⚠️ No checkout URL in response")
                
        else:
            print(f"❌ Error! Status: {response.status_code}")
            try:
                error_data = response.json()
                print(f"❌ Error Response: {json.dumps(error_data, indent=2)}")
            except:
                print(f"❌ Error Response (text): {response.text}")
                
    except requests.exceptions.ConnectionError:
        print("❌ Connection Error: Cannot connect to backend server")
        print("   Make sure the backend is running on http://127.0.0.1:8001")
    except requests.exceptions.Timeout:
        print("❌ Timeout Error: Request took too long")
    except Exception as e:
        print(f"❌ Unexpected Error: {str(e)}")

if __name__ == "__main__":
    test_order_creation()
