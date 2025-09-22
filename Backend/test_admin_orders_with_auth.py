#!/usr/bin/env python3
"""
Test admin orders API with authentication
"""

import os
import sys
import django
import requests
import json

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from adminpanel.models import Order, User
from django.contrib.auth import get_user_model

def test_admin_orders_with_auth():
    print("🔐 Testing Admin Orders API with Authentication")
    print("=" * 60)
    
    # Try to find or create an admin user
    User = get_user_model()
    admin_user = User.objects.filter(is_staff=True).first()
    
    if not admin_user:
        print("❌ No admin user found. Creating one...")
        admin_user = User.objects.create_user(
            username='admin',
            email='admin@example.com',
            password='admin123',
            is_staff=True,
            is_superuser=True
        )
        print(f"✅ Created admin user: {admin_user.username}")
    
    print(f"👤 Using admin user: {admin_user.username}")
    
    # Login to get JWT token
    login_url = 'http://127.0.0.1:8001/api/auth/login/'
    login_data = {
        'username': admin_user.username,
        'password': 'admin123'
    }
    
    try:
        print("🔑 Logging in...")
        login_response = requests.post(login_url, json=login_data)
        
        if login_response.status_code == 200:
            login_result = login_response.json()
            token = login_result.get('access')
            
            if token:
                print("✅ Login successful!")
                print(f"   Token: {token[:50]}...")
                
                # Test admin orders API with token
                headers = {
                    'Authorization': f'Bearer {token}',
                    'Content-Type': 'application/json'
                }
                
                orders_url = 'http://127.0.0.1:8001/api/admin/orders/'
                print(f"\n📊 Fetching orders from: {orders_url}")
                
                orders_response = requests.get(orders_url, headers=headers)
                
                print(f"   Status Code: {orders_response.status_code}")
                
                if orders_response.status_code == 200:
                    orders_data = orders_response.json()
                    print(f"   ✅ Success! Found {len(orders_data)} orders")
                    
                    # Display order details
                    for i, order in enumerate(orders_data[:5], 1):  # Show first 5 orders
                        print(f"\n   📦 Order {i}:")
                        print(f"      ID: {order.get('id')}")
                        print(f"      Tracking ID: {order.get('tracking_id')}")
                        print(f"      Payment ID: {order.get('payment_id')}")
                        print(f"      Email: {order.get('customer_email')}")
                        print(f"      Status: {order.get('status')}")
                        print(f"      Payment Status: {order.get('payment_status')}")
                        print(f"      Total: ${order.get('total_price')}")
                        print(f"      Created: {order.get('created_at')}")
                    
                    if len(orders_data) > 5:
                        print(f"\n   ... and {len(orders_data) - 5} more orders")
                        
                else:
                    print(f"   ❌ Failed to fetch orders: {orders_response.status_code}")
                    print(f"   Response: {orders_response.text}")
                    
            else:
                print("❌ No access token received")
                print(f"   Response: {login_result}")
        else:
            print(f"❌ Login failed: {login_response.status_code}")
            print(f"   Response: {login_response.text}")
            
    except Exception as e:
        print(f"❌ Error: {e}")

def check_database_orders():
    print(f"\n📊 Database Order Summary:")
    print("=" * 40)
    
    total_orders = Order.objects.count()
    paid_orders = Order.objects.filter(payment_status='paid').count()
    confirmed_orders = Order.objects.filter(status='confirmed').count()
    pending_orders = Order.objects.filter(status='pending').count()
    
    print(f"   Total Orders: {total_orders}")
    print(f"   Paid Orders: {paid_orders}")
    print(f"   Confirmed Orders: {confirmed_orders}")
    print(f"   Pending Orders: {pending_orders}")
    
    # Show recent orders
    recent_orders = Order.objects.order_by('-created_at')[:5]
    print(f"\n   📋 Recent Orders:")
    for order in recent_orders:
        print(f"      ID {order.id}: {order.tracking_id} - {order.status} - ${order.total_price}")

if __name__ == "__main__":
    check_database_orders()
    test_admin_orders_with_auth()
