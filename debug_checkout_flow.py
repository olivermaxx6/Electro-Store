#!/usr/bin/env python3
"""
Debug the actual checkout flow to see what's happening
"""
import requests
import json

def test_checkout_with_real_data():
    print("🔍 Debugging Checkout Flow")
    print("=" * 40)
    
    # First, let's get a real product ID from the database
    print("1. Getting available products...")
    try:
        # Try to get products from the public API
        products_response = requests.get("http://127.0.0.1:8001/api/public/products/", timeout=10)
        if products_response.status_code == 200:
            products = products_response.json()
            if products and len(products) > 0:
                product = products[0]
                product_id = product['id']
                product_name = product['name']
                product_price = product['price']
                print(f"   ✅ Found product: {product_name} (ID: {product_id}, Price: £{product_price})")
            else:
                print("   ❌ No products found in API response")
                return False
        else:
            print(f"   ❌ Failed to get products: {products_response.status_code}")
            return False
    except Exception as e:
        print(f"   ❌ Error getting products: {e}")
        return False
    
    print("\n2. Testing checkout with real product...")
    
    # Test checkout with real product data
    test_data = {
        "cart_items": [
            {
                "product_id": product_id,
                "quantity": 1,
                "unit_price": float(product_price)
            }
        ],
        "subtotal": float(product_price),
        "shipping_cost": 5.00,
        "tax_amount": 2.00,
        "total_price": float(product_price) + 5.00 + 2.00,
        "customer_email": "test@example.com",
        "customer_phone": "1234567890",
        "shipping_address": {
            "firstName": "Test",
            "lastName": "User",
            "email": "test@example.com",
            "phone": "1234567890",
            "address1": "123 Test St",
            "city": "Test City",
            "state": "Test State",
            "postcode": "12345"
        },
        "shipping_name": "Standard Shipping",
        "user_id": "guest"
    }
    
    try:
        print(f"   📤 Sending checkout request...")
        print(f"   📋 Product: {product_name} - £{product_price}")
        print(f"   💰 Total: £{test_data['total_price']}")
        
        response = requests.post(
            "http://127.0.0.1:8001/api/public/create-checkout-session/",
            headers={
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            },
            json=test_data,
            timeout=30
        )
        
        print(f"\n3. API Response:")
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 201:
            result = response.json()
            print("   ✅ SUCCESS!")
            print(f"   Session ID: {result.get('checkout_session_id', 'N/A')}")
            print(f"   Checkout URL: {result.get('checkout_url', 'N/A')}")
            print(f"   Order ID: {result.get('order_id', 'N/A')}")
            
            # Check if the checkout URL looks correct
            checkout_url = result.get('checkout_url', '')
            if checkout_url.startswith('https://checkout.stripe.com/'):
                print("   ✅ Checkout URL is external Stripe URL")
                return True
            else:
                print(f"   ❌ Checkout URL doesn't look like Stripe: {checkout_url}")
                return False
        else:
            print(f"   ❌ FAILED: {response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("   ❌ CONNECTION ERROR: Django server not running on port 8001")
        print("   Please start the server with: python manage.py runserver 127.0.0.1:8001")
        return False
    except Exception as e:
        print(f"   ❌ ERROR: {e}")
        return False

def main():
    success = test_checkout_with_real_data()
    
    print("\n" + "=" * 40)
    if success:
        print("🎉 Checkout API is working correctly!")
        print("   The issue might be in the frontend JavaScript.")
        print("   Check browser console for errors when clicking Place Order.")
    else:
        print("❌ Checkout API has issues.")
        print("   Fix the backend issues first.")
    
    print("\n🔍 Next steps:")
    print("1. Open browser console (F12)")
    print("2. Go to http://localhost:5173/checkout")
    print("3. Fill out the form and click Place Order")
    print("4. Check console for any error messages")

if __name__ == "__main__":
    main()
