#!/usr/bin/env python3
"""
Debug script to test webhook data extraction and order updates.
This will help identify why phone numbers and payment status aren't showing up correctly.
"""

import os
import sys
import django
import json
from datetime import datetime

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from adminpanel.models import Order, OrderItem, Product
from adminpanel.views_stripe import handle_checkout_session_completed

def test_webhook_with_realistic_data():
    """Test webhook with realistic Stripe session data"""
    print("🧪 Testing webhook with realistic Stripe session data...")
    
    # Create a test order first
    test_order = Order.objects.create(
        id=9998,  # Use a high ID to avoid conflicts
        tracking_id="temp_debug_test_123",
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
    
    # Mock realistic Stripe session data
    mock_session = {
        'id': 'cs_test_debug_realistic_123',
        'payment_intent': {
            'id': 'pi_test_debug_123',
            'status': 'succeeded'
        },
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
            'phone': '+44 20 7946 0958',  # Also in shipping details
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
            'customer_email': 'test@example.com',
            'customer_phone': '+44 20 7946 0958'  # Also in metadata
        }
    }
    
    print(f"📋 Mock session data:")
    print(json.dumps(mock_session, indent=2, default=str))
    
    try:
        # Call the webhook handler
        print("\n🔄 Calling webhook handler...")
        handle_checkout_session_completed(mock_session)
        
        # Refresh the order from database
        test_order.refresh_from_db()
        
        print(f"\n✅ Webhook test completed")
        print(f"   Order ID: {test_order.id}")
        print(f"   Phone: '{test_order.customer_phone}'")
        print(f"   Payment Status: '{test_order.payment_status}'")
        print(f"   Customer Email: '{test_order.customer_email}'")
        print(f"   Tracking ID: '{test_order.tracking_id}'")
        print(f"   Payment ID: '{test_order.payment_id}'")
        
        # Verify the results
        expected_phone = '+44 20 7946 0958'
        expected_payment_status = 'paid'
        
        if test_order.customer_phone == expected_phone:
            print(f"✅ Phone number correctly extracted: {test_order.customer_phone}")
        else:
            print(f"❌ Phone number mismatch: expected '{expected_phone}', got '{test_order.customer_phone}'")
            
        if test_order.payment_status == expected_payment_status:
            print(f"✅ Payment status correctly extracted: {test_order.payment_status}")
        else:
            print(f"❌ Payment status mismatch: expected '{expected_payment_status}', got '{test_order.payment_status}'")
        
        # Test API response
        print(f"\n🔍 Testing API response...")
        from adminpanel.serializers import OrderSerializer
        serializer = OrderSerializer(test_order)
        api_data = serializer.data
        
        print(f"   API includes customer_phone: {'customer_phone' in api_data}")
        print(f"   API includes payment_status: {'payment_status' in api_data}")
        if 'customer_phone' in api_data:
            print(f"   API customer_phone: '{api_data['customer_phone']}'")
        if 'payment_status' in api_data:
            print(f"   API payment_status: '{api_data['payment_status']}'")
        
        return True
        
    except Exception as e:
        print(f"❌ Webhook test failed: {e}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        # Clean up test order
        test_order.delete()
        print(f"\n🧹 Cleaned up test order")

def test_minimal_webhook_data():
    """Test webhook with minimal data to see what happens"""
    print("\n🧪 Testing webhook with minimal data...")
    
    # Create a test order first
    test_order = Order.objects.create(
        id=9997,  # Use a high ID to avoid conflicts
        tracking_id="temp_minimal_test_123",
        customer_email="minimal@example.com",
        customer_phone="",
        shipping_address={},
        subtotal=50.00,
        shipping_cost=5.00,
        tax_amount=0.00,
        total_price=55.00,
        payment_method="card",
        shipping_name="Minimal Shipping",
        status="pending",
        payment_status="unpaid"
    )
    
    # Mock minimal Stripe session data (like what might actually come from Stripe)
    mock_session = {
        'id': 'cs_test_minimal_123',
        'payment_intent': 'pi_test_minimal_123',
        'amount_total': 5500,  # 55.00 in cents
        'currency': 'gbp',
        'customer_email': 'minimal@example.com',
        'payment_status': 'paid',
        'metadata': {
            'order_id': str(test_order.id),
            'user_id': 'guest',
            'customer_email': 'minimal@example.com'
        }
    }
    
    print(f"📋 Minimal session data:")
    print(json.dumps(mock_session, indent=2, default=str))
    
    try:
        # Call the webhook handler
        print("\n🔄 Calling webhook handler...")
        handle_checkout_session_completed(mock_session)
        
        # Refresh the order from database
        test_order.refresh_from_db()
        
        print(f"\n✅ Minimal webhook test completed")
        print(f"   Order ID: {test_order.id}")
        print(f"   Phone: '{test_order.customer_phone}'")
        print(f"   Payment Status: '{test_order.payment_status}'")
        print(f"   Customer Email: '{test_order.customer_email}'")
        
        return True
        
    except Exception as e:
        print(f"❌ Minimal webhook test failed: {e}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        # Clean up test order
        test_order.delete()
        print(f"\n🧹 Cleaned up minimal test order")

def main():
    """Run all debug tests"""
    print("🚀 Starting webhook data debug tests...")
    print("=" * 60)
    
    # Test with realistic data
    realistic_success = test_webhook_with_realistic_data()
    
    # Test with minimal data
    minimal_success = test_webhook_with_minimal_data()
    
    print("\n" + "=" * 60)
    print("📊 Debug Test Results:")
    print(f"   Realistic Data Test: {'✅ PASS' if realistic_success else '❌ FAIL'}")
    print(f"   Minimal Data Test: {'✅ PASS' if minimal_success else '❌ FAIL'}")
    
    if realistic_success and minimal_success:
        print("\n🎉 All debug tests passed!")
        return 0
    else:
        print("\n❌ Some debug tests failed. Check the logs above for details.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
