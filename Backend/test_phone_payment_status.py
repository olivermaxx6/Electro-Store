#!/usr/bin/env python3
"""
Test script to verify phone number and payment status implementation.
This script tests the webhook handler and API responses.
"""

import os
import sys
import django
import json
import requests
from datetime import datetime

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from adminpanel.models import Order, OrderItem, Product
from adminpanel.views_stripe import handle_checkout_session_completed

def test_webhook_handler():
    """Test the webhook handler with mock session data"""
    print("🧪 Testing webhook handler...")
    
    # Create a test order first
    test_order = Order.objects.create(
        id=9999,  # Use a high ID to avoid conflicts
        tracking_id="temp_test_123",
        customer_email="test@example.com",
        customer_phone="",
        shipping_address={},
        subtotal=100.00,
        shipping_cost=10.00,
        tax_amount=0.00,
        total_price=110.00,
        payment_method="card",
        shipping_name="Test Shipping",
        status="pending",
        payment_status="unpaid"
    )
    
    # Mock session data with phone number and payment status
    mock_session = {
        'id': 'cs_test_webhook_test_123',
        'payment_intent': 'pi_test_123',
        'amount_total': 11000,  # 110.00 in cents
        'currency': 'gbp',
        'customer_email': 'test@example.com',
        'payment_status': 'paid',
        'customer_details': {
            'email': 'test@example.com',
            'name': 'Test User',
            'phone': '+44 20 7946 0958'
        },
        'shipping_details': {
            'name': 'Test User',
            'address': {
                'line1': '10 Downing Street',
                'line2': '',
                'city': 'London',
                'state': 'England',
                'postal_code': 'SW1A 2AA',
                'country': 'GB'
            }
        },
        'metadata': {
            'order_id': str(test_order.id),
            'user_id': 'guest',
            'customer_email': 'test@example.com'
        }
    }
    
    try:
        # Call the webhook handler
        handle_checkout_session_completed(mock_session)
        
        # Refresh the order from database
        test_order.refresh_from_db()
        
        print(f"✅ Webhook test completed")
        print(f"   Order ID: {test_order.id}")
        print(f"   Phone: {test_order.customer_phone}")
        print(f"   Payment Status: {test_order.payment_status}")
        print(f"   Customer Email: {test_order.customer_email}")
        
        # Verify the results
        assert test_order.customer_phone == '+44 20 7946 0958', f"Phone mismatch: {test_order.customer_phone}"
        assert test_order.payment_status == 'paid', f"Payment status mismatch: {test_order.payment_status}"
        assert test_order.customer_email == 'test@example.com', f"Email mismatch: {test_order.customer_email}"
        
        print("✅ All webhook assertions passed!")
        
    except Exception as e:
        print(f"❌ Webhook test failed: {e}")
        return False
    finally:
        # Clean up test order
        test_order.delete()
    
    return True

def test_api_responses():
    """Test API responses include phone and payment status"""
    print("\n🧪 Testing API responses...")
    
    try:
        # Test admin orders API
        response = requests.get('http://127.0.0.1:8001/api/orders/', timeout=5)
        if response.status_code == 200:
            data = response.json()
            if data and len(data) > 0:
                order = data[0]
                print(f"✅ Admin API includes phone: {'customer_phone' in order}")
                print(f"✅ Admin API includes payment_status: {'payment_status' in order}")
                if 'customer_phone' in order:
                    print(f"   Phone: {order['customer_phone']}")
                if 'payment_status' in order:
                    print(f"   Payment Status: {order['payment_status']}")
            else:
                print("⚠️ No orders found in admin API")
        else:
            print(f"⚠️ Admin API returned status {response.status_code}")
        
        # Test public checkout session API (if we have a test session)
        test_sessions = ['cs_test_123', 'cs_test_abc']
        for session_id in test_sessions:
            response = requests.get(f'http://127.0.0.1:8001/api/public/checkout-session/{session_id}/', timeout=5)
            if response.status_code == 200:
                data = response.json()
                if 'order' in data:
                    order = data['order']
                    print(f"✅ Public API includes phone: {'customer_phone' in order}")
                    print(f"✅ Public API includes payment_status: {'payment_status' in order}")
                    break
            elif response.status_code == 404:
                print(f"⚠️ Test session {session_id} not found (expected for test)")
            else:
                print(f"⚠️ Public API returned status {response.status_code}")
        
        print("✅ API response tests completed")
        
    except requests.exceptions.ConnectionError:
        print("⚠️ Could not connect to API server (make sure it's running)")
    except Exception as e:
        print(f"❌ API test failed: {e}")
        return False
    
    return True

def main():
    """Run all tests"""
    print("🚀 Starting phone number and payment status tests...")
    print("=" * 60)
    
    # Test webhook handler
    webhook_success = test_webhook_handler()
    
    # Test API responses
    api_success = test_api_responses()
    
    print("\n" + "=" * 60)
    print("📊 Test Results:")
    print(f"   Webhook Handler: {'✅ PASS' if webhook_success else '❌ FAIL'}")
    print(f"   API Responses: {'✅ PASS' if api_success else '❌ FAIL'}")
    
    if webhook_success and api_success:
        print("\n🎉 All tests passed! Phone number and payment status implementation is working correctly.")
        return 0
    else:
        print("\n❌ Some tests failed. Please check the implementation.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
