#!/usr/bin/env python3
"""
Test script to check current orders in the database and their API responses.
This will help verify if the phone number and payment status fields are working.
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

def test_current_orders():
    """Test current orders in the database"""
    print("🧪 Testing current orders in database...")
    
    # Get recent orders
    recent_orders = Order.objects.all().order_by('-created_at')[:5]
    
    if not recent_orders:
        print("❌ No orders found in database")
        return False
    
    print(f"📋 Found {len(recent_orders)} recent orders:")
    
    for order in recent_orders:
        print(f"\n   Order #{order.id}:")
        print(f"     Tracking ID: {order.tracking_id}")
        print(f"     Customer Email: {order.customer_email}")
        print(f"     Customer Phone: '{order.customer_phone}'")
        print(f"     Payment Status: '{order.payment_status}'")
        print(f"     Order Status: '{order.status}'")
        print(f"     Total Price: £{order.total_price}")
        print(f"     Created: {order.created_at}")
        
        # Test API serialization
        try:
            serializer = OrderSerializer(order)
            api_data = serializer.data
            
            print(f"     API Fields:")
            print(f"       - customer_phone in API: {'customer_phone' in api_data}")
            print(f"       - payment_status in API: {'payment_status' in api_data}")
            
            if 'customer_phone' in api_data:
                print(f"       - API customer_phone: '{api_data['customer_phone']}'")
            if 'payment_status' in api_data:
                print(f"       - API payment_status: '{api_data['payment_status']}'")
                
        except Exception as e:
            print(f"     ❌ API serialization error: {e}")
    
    return True

def test_api_endpoints():
    """Test API endpoints directly"""
    print("\n🧪 Testing API endpoints...")
    
    try:
        import requests
        
        # Test admin orders API
        print("   Testing admin orders API...")
        response = requests.get('http://127.0.0.1:8001/api/orders/', timeout=5)
        
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Admin API responded with {len(data)} orders")
            
            if data and len(data) > 0:
                first_order = data[0]
                print(f"   First order fields:")
                print(f"     - customer_phone: {'customer_phone' in first_order}")
                print(f"     - payment_status: {'payment_status' in first_order}")
                
                if 'customer_phone' in first_order:
                    print(f"     - customer_phone value: '{first_order['customer_phone']}'")
                if 'payment_status' in first_order:
                    print(f"     - payment_status value: '{first_order['payment_status']}'")
        else:
            print(f"   ❌ Admin API returned status {response.status_code}")
            
    except requests.exceptions.ConnectionError:
        print("   ⚠️ Could not connect to API server (make sure it's running)")
    except Exception as e:
        print(f"   ❌ API test error: {e}")
    
    return True

def main():
    """Run all tests"""
    print("🚀 Starting current orders test...")
    print("=" * 60)
    
    # Test current orders
    orders_success = test_current_orders()
    
    # Test API endpoints
    api_success = test_api_endpoints()
    
    print("\n" + "=" * 60)
    print("📊 Current Orders Test Results:")
    print(f"   Database Orders: {'✅ PASS' if orders_success else '❌ FAIL'}")
    print(f"   API Endpoints: {'✅ PASS' if api_success else '❌ FAIL'}")
    
    return 0

if __name__ == "__main__":
    sys.exit(main())
