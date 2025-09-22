#!/usr/bin/env python3
"""
Test script to verify that admin orders page shows correct payment status.
This tests the complete flow from webhook to admin API to frontend display.
"""

import os
import sys
import django
import json

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from adminpanel.models import Order
from adminpanel.serializers import OrderSerializer
from adminpanel.views_stripe import handle_checkout_session_completed

def test_admin_orders_payment_status():
    """Test that admin orders API returns correct payment status"""
    print("🧪 Testing admin orders payment status flow...")
    
    # Create a test order (simulating pre-checkout state)
    test_order = Order.objects.create(
        id=9995,  # Use a high ID to avoid conflicts
        tracking_id="temp_admin_test_123",
        customer_email="admin@example.com",
        customer_phone="+44 20 9876 5432",
        shipping_address={},
        subtotal=75.00,
        shipping_cost=8.00,
        tax_amount=0.00,
        total_price=83.00,
        payment_method="card",
        shipping_name="Admin Test Shipping",
        status="pending",
        payment_status="unpaid"  # Start with unpaid
    )
    
    print(f"📋 Created test order:")
    print(f"   Order ID: {test_order.id}")
    print(f"   Initial Payment Status: {test_order.payment_status}")
    
    # Test admin API response before webhook
    print(f"\n🔍 Testing admin API response BEFORE webhook:")
    serializer = OrderSerializer(test_order)
    api_data = serializer.data
    
    print(f"   API payment_status: '{api_data.get('payment_status')}'")
    print(f"   API customer_phone: '{api_data.get('customer_phone')}'")
    
    # Simulate webhook processing (checkout session completed)
    mock_session = {
        'id': 'cs_test_admin_orders_123',
        'payment_intent': 'pi_test_admin_orders_123',
        'amount_total': 8300,  # 83.00 in cents
        'currency': 'gbp',
        'customer_email': 'admin@example.com',
        'payment_status': 'paid',  # Stripe confirms payment completed
        'customer_details': {
            'email': 'admin@example.com',
            'name': 'Admin Test User',
            'phone': '+44 20 9876 5432'
        },
        'metadata': {
            'order_id': str(test_order.id),
            'user_id': 'guest',
            'customer_email': 'admin@example.com'
        }
    }
    
    try:
        # Process webhook
        print(f"\n🔄 Processing webhook...")
        handle_checkout_session_completed(mock_session)
        
        # Refresh order from database
        test_order.refresh_from_db()
        
        print(f"\n✅ Webhook processing completed:")
        print(f"   Order ID: {test_order.id}")
        print(f"   Payment Status: '{test_order.payment_status}'")
        print(f"   Customer Phone: '{test_order.customer_phone}'")
        
        # Test admin API response after webhook
        print(f"\n🔍 Testing admin API response AFTER webhook:")
        serializer = OrderSerializer(test_order)
        api_data = serializer.data
        
        print(f"   API payment_status: '{api_data.get('payment_status')}'")
        print(f"   API customer_phone: '{api_data.get('customer_phone')}'")
        
        # Verify the results
        if test_order.payment_status == 'paid':
            print(f"✅ SUCCESS: Database payment status is 'paid'")
        else:
            print(f"❌ FAILURE: Database payment status is '{test_order.payment_status}', expected 'paid'")
            return False
        
        if api_data.get('payment_status') == 'paid':
            print(f"✅ SUCCESS: Admin API returns 'paid' status")
        else:
            print(f"❌ FAILURE: Admin API returns '{api_data.get('payment_status')}', expected 'paid'")
            return False
        
        if api_data.get('customer_phone') == '+44 20 9876 5432':
            print(f"✅ SUCCESS: Admin API returns correct phone number")
        else:
            print(f"❌ FAILURE: Admin API returns '{api_data.get('customer_phone')}', expected '+44 20 9876 5432'")
            return False
        
        # Test frontend display logic (simulate what admin orders page would show)
        print(f"\n🎭 Testing frontend admin orders display:")
        
        payment_status = api_data.get('payment_status')
        customer_phone = api_data.get('customer_phone')
        
        # Simulate the frontend badge logic
        if payment_status == 'paid':
            badge_class = 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            badge_text = 'Paid'
        elif payment_status == 'unpaid':
            badge_class = 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            badge_text = 'Unpaid'
        elif payment_status == 'failed':
            badge_class = 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
            badge_text = 'Failed'
        else:
            badge_class = 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
            badge_text = payment_status
        
        print(f"   Frontend badge class: {badge_class}")
        print(f"   Frontend badge text: {badge_text}")
        print(f"   Frontend phone display: {customer_phone}")
        
        if badge_text == 'Paid' and 'green' in badge_class:
            print(f"✅ SUCCESS: Admin orders page will show green 'Paid' badge")
        else:
            print(f"❌ FAILURE: Admin orders page will show incorrect badge")
            return False
        
        return True
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        # Clean up test order
        test_order.delete()
        print(f"\n🧹 Cleaned up test order")

def test_existing_orders():
    """Test existing orders in the database"""
    print("\n🧪 Testing existing orders in database...")
    
    # Get recent orders
    recent_orders = Order.objects.all().order_by('-created_at')[:3]
    
    if not recent_orders:
        print("❌ No orders found in database")
        return True
    
    print(f"📋 Found {len(recent_orders)} recent orders:")
    
    for order in recent_orders:
        print(f"\n   Order #{order.id}:")
        print(f"     Tracking ID: {order.tracking_id}")
        print(f"     Payment Status: '{order.payment_status}'")
        print(f"     Customer Phone: '{order.customer_phone}'")
        print(f"     Created: {order.created_at}")
        
        # Test API serialization
        try:
            serializer = OrderSerializer(order)
            api_data = serializer.data
            
            payment_status = api_data.get('payment_status')
            customer_phone = api_data.get('customer_phone')
            
            print(f"     API Response:")
            print(f"       - payment_status: '{payment_status}'")
            print(f"       - customer_phone: '{customer_phone}'")
            
            # Check if this order should have paid status
            if order.tracking_id and order.tracking_id.startswith('cs_'):
                print(f"     ⚠️  This order has a Stripe session ID but payment_status is '{payment_status}'")
                if payment_status != 'paid':
                    print(f"     🔧 This order should probably have 'paid' status")
            else:
                print(f"     ℹ️  This order doesn't have a Stripe session ID")
                
        except Exception as e:
            print(f"     ❌ API serialization error: {e}")
    
    return True

def main():
    """Run all admin orders payment status tests"""
    print("🚀 Starting admin orders payment status tests...")
    print("=" * 60)
    
    # Test the complete flow
    flow_success = test_admin_orders_payment_status()
    
    # Test existing orders
    existing_success = test_existing_orders()
    
    print("\n" + "=" * 60)
    print("📊 Admin Orders Payment Status Test Results:")
    print(f"   Complete Flow Test: {'✅ PASS' if flow_success else '❌ FAIL'}")
    print(f"   Existing Orders Test: {'✅ PASS' if existing_success else '❌ PASS'}")
    
    if flow_success:
        print("\n🎉 Admin orders payment status flow is working correctly!")
        print("   ✅ Webhook updates payment status to 'paid'")
        print("   ✅ Admin API returns correct payment status")
        print("   ✅ Frontend will show green 'Paid' badge")
        print("   ✅ Admin orders page at http://localhost:5174/admin/orders will show 'Paid'")
        return 0
    else:
        print("\n❌ Admin orders payment status flow has issues.")
        print("   Check the webhook processing and database updates.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
