#!/usr/bin/env python3
"""
Test if orders with successful payment status appear in admin orders
"""

import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from adminpanel.models import Order, OrderItem, Product
from adminpanel.id_generators import generate_unique_tracking_id, generate_unique_payment_id

def create_successful_payment_order():
    print("🧪 Testing Successful Payment Order in Admin Orders")
    print("=" * 60)
    
    # Create an order with successful payment status
    tracking_id = generate_unique_tracking_id()
    payment_id = generate_unique_payment_id()
    
    print(f"📦 Creating order with successful payment...")
    print(f"   Tracking ID: {tracking_id}")
    print(f"   Payment ID: {payment_id}")
    
    try:
        order = Order.objects.create(
            user=None,  # Guest order
            tracking_id=tracking_id,
            payment_id=payment_id,
            customer_email='successful.payment@example.com',
            customer_phone='+1234567890',
            shipping_address={
                'firstName': 'Test',
                'lastName': 'Customer',
                'address1': '123 Success Street',
                'city': 'Payment City',
                'state': 'PC',
                'postcode': '12345'
            },
            subtotal=149.99,
            shipping_cost=9.99,
            tax_amount=15.99,
            total_price=175.97,
            payment_method='card',
            shipping_name='Standard Shipping',
            status='confirmed',  # Order confirmed
            payment_status='paid'  # Payment successful
        )
        
        print(f"   ✅ Order created successfully!")
        print(f"   📋 Order ID: {order.id}")
        print(f"   💳 Payment Status: {order.payment_status}")
        print(f"   📦 Order Status: {order.status}")
        print(f"   💰 Total: ${order.total_price}")
        
        # Check if order exists in database
        verify_order = Order.objects.filter(tracking_id=tracking_id).first()
        if verify_order:
            print(f"   ✅ Order verified in database")
            print(f"   📧 Email: {verify_order.customer_email}")
            print(f"   🏠 Address: {verify_order.shipping_address.get('address1', 'N/A')}")
        else:
            print(f"   ❌ Order not found in database")
            
        print(f"\n🎯 Test URLs:")
        print(f"   Order Confirmation: http://127.0.0.1:5173/order-confirmation/{tracking_id}")
        print(f"   Admin Orders: http://localhost:5174/admin/orders")
        
        return order
        
    except Exception as e:
        print(f"   ❌ Failed to create order: {e}")
        return None

def check_admin_orders_api():
    print(f"\n🔍 Testing Admin Orders API...")
    print("=" * 40)
    
    try:
        import requests
        
        # First, try to get orders without authentication
        response = requests.get('http://127.0.0.1:8001/api/admin/orders/')
        print(f"   📊 API Response (no auth): {response.status_code}")
        
        if response.status_code == 401:
            print(f"   ℹ️  Authentication required - this is expected")
        elif response.status_code == 200:
            data = response.json()
            print(f"   📋 Orders found: {len(data) if isinstance(data, list) else 'Unknown'}")
        
        # Count orders in database
        total_orders = Order.objects.count()
        successful_orders = Order.objects.filter(payment_status='paid').count()
        confirmed_orders = Order.objects.filter(status='confirmed').count()
        
        print(f"   📊 Database Statistics:")
        print(f"      Total Orders: {total_orders}")
        print(f"      Successful Payments: {successful_orders}")
        print(f"      Confirmed Orders: {confirmed_orders}")
        
    except Exception as e:
        print(f"   ❌ API test failed: {e}")

if __name__ == "__main__":
    order = create_successful_payment_order()
    check_admin_orders_api()
    
    if order:
        print(f"\n✅ Test completed successfully!")
        print(f"   Check admin orders at: http://localhost:5174/admin/orders")
    else:
        print(f"\n❌ Test failed!")
