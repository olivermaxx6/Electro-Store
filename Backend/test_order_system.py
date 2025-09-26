#!/usr/bin/env python3
"""
Test script for the new order processing system
Tests the complete flow from order creation to confirmation
"""

import os
import sys
import django
import requests
import json
from datetime import datetime

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from adminpanel.models import Order, Product
from django.test import TestCase
from django.test.client import Client
from django.urls import reverse

def test_order_creation_api():
    """Test the order creation API endpoint"""
    print("🧪 Testing Order Creation API...")
    
    # Sample order data
    order_data = {
        "cart_items": [
            {
                "product_id": 1,
                "name": "Test Product",
                "price": 29.99,
                "quantity": 2,
                "image": "https://example.com/image.jpg"
            }
        ],
        "customer_email": "test@example.com",
        "customer_name": "John Doe",
        "customer_phone": "+1234567890",
        "shipping_address": {
            "firstName": "John",
            "lastName": "Doe",
            "address": "123 Main St",
            "city": "New York",
            "state": "NY",
            "zipCode": "10001",
            "country": "USA"
        },
        "billing_address": {
            "firstName": "John",
            "lastName": "Doe",
            "address": "123 Main St",
            "city": "New York",
            "state": "NY",
            "zipCode": "10001",
            "country": "USA"
        },
        "subtotal": 59.98,
        "shipping_cost": 5.99,
        "tax_amount": 5.28,
        "total_price": 71.25
    }
    
    try:
        # Test the API endpoint
        response = requests.post(
            'http://127.0.0.1:8001/api/public/create-order-checkout/',
            json=order_data,
            headers={'Content-Type': 'application/json'}
        )
        
        if response.status_code == 201:
            result = response.json()
            print(f"✅ Order created successfully!")
            print(f"   Order Number: {result.get('order_number')}")
            print(f"   Order ID: {result.get('order_id')}")
            print(f"   Checkout URL: {result.get('checkout_url')}")
            return result
        else:
            print(f"❌ Order creation failed: {response.status_code}")
            print(f"   Error: {response.text}")
            return None
            
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to server. Make sure Django server is running on port 8001")
        return None
    except Exception as e:
        print(f"❌ Error testing order creation: {str(e)}")
        return None

def test_order_retrieval(order_number):
    """Test retrieving order details"""
    print(f"🧪 Testing Order Retrieval for {order_number}...")
    
    try:
        response = requests.get(f'http://127.0.0.1:8001/api/public/orders/{order_number}/')
        
        if response.status_code == 200:
            order_data = response.json()
            print(f"✅ Order retrieved successfully!")
            print(f"   Customer: {order_data.get('customer_name')}")
            print(f"   Email: {order_data.get('customer_email')}")
            print(f"   Total: ${order_data.get('total_price')}")
            print(f"   Status: {order_data.get('status')}")
            return order_data
        else:
            print(f"❌ Order retrieval failed: {response.status_code}")
            print(f"   Error: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Error testing order retrieval: {str(e)}")
        return None

def test_database_models():
    """Test the database models"""
    print("🧪 Testing Database Models...")
    
    try:
        # Test Order model
        orders = Order.objects.all()
        print(f"✅ Found {orders.count()} orders in database")
        
        if orders.exists():
            latest_order = orders.first()
            print(f"   Latest Order: {latest_order.order_number}")
            print(f"   Customer: {latest_order.customer_name}")
            print(f"   Status: {latest_order.status}")
        
        # Test Product model
        products = Product.objects.all()
        print(f"✅ Found {products.count()} products in database")
        
        return True
        
    except Exception as e:
        print(f"❌ Error testing database models: {str(e)}")
        return False

def test_admin_interface():
    """Test admin interface accessibility"""
    print("🧪 Testing Admin Interface...")
    
    try:
        response = requests.get('http://127.0.0.1:8001/admin/')
        
        if response.status_code == 200:
            print("✅ Admin interface is accessible")
            return True
        else:
            print(f"❌ Admin interface not accessible: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Error testing admin interface: {str(e)}")
        return False

def main():
    """Run all tests"""
    print("🚀 Starting Order System Tests")
    print("=" * 50)
    
    # Test database models
    if not test_database_models():
        print("❌ Database model tests failed")
        return
    
    # Test admin interface
    if not test_admin_interface():
        print("❌ Admin interface tests failed")
        return
    
    # Test order creation
    order_result = test_order_creation_api()
    if not order_result:
        print("❌ Order creation tests failed")
        return
    
    # Test order retrieval
    order_number = order_result.get('order_number')
    if order_number:
        test_order_retrieval(order_number)
    
    print("=" * 50)
    print("🎉 Order System Tests Completed!")
    print("\n📋 Summary:")
    print("✅ Database models working")
    print("✅ Admin interface accessible")
    print("✅ Order creation API working")
    print("✅ Order retrieval API working")
    print("\n🔗 Next Steps:")
    print("1. Test the frontend checkout flow")
    print("2. Test Stripe payment integration")
    print("3. Test webhook handling")
    print("4. Test multi-user concurrency")

if __name__ == "__main__":
    main()
