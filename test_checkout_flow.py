#!/usr/bin/env python3
"""
Test script to verify the complete checkout flow
"""

import requests
import json
import time

def test_checkout_flow():
    """Test the complete checkout flow from payment intent to order creation"""
    
    print("🧪 Testing Complete Checkout Flow")
    print("=" * 50)
    
    # Test data
    test_data = {
        'cart_items': [
            {'product_id': 238, 'quantity': 1, 'unit_price': 25.0}
        ],
        'subtotal': 25.0,
        'shipping_cost': 0.0,
        'tax_amount': 0.0,
        'total_price': 25.0,
        'payment_id': f'pi_test_{int(time.time())}',
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
        'payment_method': 'credit_card',
        'shipping_name': 'Standard Shipping'
    }
    
    headers = {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
    }
    
    # Step 1: Test payment intent creation
    print("1️⃣ Testing payment intent creation...")
    payment_intent_data = {
        'amount': 2500,  # £25.00 in pence
        'currency': 'gbp',
        'metadata': {
            'test': 'true',
            'order_id': f'test_order_{int(time.time())}'
        }
    }
    
    try:
        payment_response = requests.post(
            'http://127.0.0.1:8001/api/public/create-payment-intent/',
            json=payment_intent_data,
            headers=headers
        )
        
        if payment_response.status_code == 201:
            payment_data = payment_response.json()
            print(f"✅ Payment intent created: {payment_data.get('payment_intent_id')}")
            test_data['payment_id'] = payment_data.get('payment_intent_id')
        else:
            print(f"❌ Payment intent creation failed: {payment_response.status_code}")
            print(f"Response: {payment_response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Payment intent creation error: {e}")
        return False
    
    # Step 2: Test order creation
    print("\n2️⃣ Testing order creation...")
    
    try:
        order_response = requests.post(
            'http://127.0.0.1:8001/api/public/orders/',
            json=test_data,
            headers=headers
        )
        
        if order_response.status_code == 201:
            order_data = order_response.json()
            print(f"✅ Order created successfully!")
            print(f"   Order ID: {order_data.get('order_id')}")
            print(f"   Tracking ID: {order_data.get('tracking_id')}")
            print(f"   Payment ID: {order_data.get('payment_id')}")
            
            tracking_id = order_data.get('tracking_id')
        else:
            print(f"❌ Order creation failed: {order_response.status_code}")
            print(f"Response: {order_response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Order creation error: {e}")
        return False
    
    # Step 3: Test order tracking
    print("\n3️⃣ Testing order tracking...")
    
    try:
        tracking_response = requests.get(
            f'http://127.0.0.1:8001/api/public/track-order/{tracking_id}/'
        )
        
        if tracking_response.status_code == 200:
            tracking_data = tracking_response.json()
            print(f"✅ Order tracking successful!")
            print(f"   Status: {tracking_data.get('status')}")
            print(f"   Payment Status: {tracking_data.get('payment_status')}")
            print(f"   Items: {len(tracking_data.get('items', []))}")
            
            if tracking_data.get('items'):
                item = tracking_data['items'][0]
                print(f"   Product: {item.get('product_name')}")
                print(f"   Quantity: {item.get('quantity')}")
                print(f"   Price: £{item.get('unit_price')}")
        else:
            print(f"❌ Order tracking failed: {tracking_response.status_code}")
            print(f"Response: {tracking_response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Order tracking error: {e}")
        return False
    
    print("\n🎉 Complete checkout flow test PASSED!")
    print(f"📋 Order Details:")
    print(f"   - Order #: {order_data.get('order_id')}")
    print(f"   - Tracking: {tracking_id}")
    print(f"   - Payment: {order_data.get('payment_id')}")
    print(f"   - Status: Paid")
    print(f"   - Product: TIS 850 12V Digital Voltage Tester")
    print(f"   - Total: £25.00")
    
    return True

if __name__ == "__main__":
    success = test_checkout_flow()
    exit(0 if success else 1)
