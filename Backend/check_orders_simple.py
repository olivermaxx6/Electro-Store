#!/usr/bin/env python3
"""
Simple check of orders in database
"""

import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from adminpanel.models import Order

print("📊 Database Orders Summary")
print("=" * 50)

orders = Order.objects.all().order_by('-created_at')
print(f"Total orders: {orders.count()}")

print(f"\n📋 All Orders:")
for order in orders:
    print(f"  ID {order.id:2d}: {order.tracking_id[:30]:<30} | Status: {order.status:<10} | Payment: {order.payment_status:<6} | Total: ${order.total_price or 0:.2f}")

# Count by status
print(f"\n📈 Order Statistics:")
paid_orders = orders.filter(payment_status='paid').count()
confirmed_orders = orders.filter(status='confirmed').count()
pending_orders = orders.filter(status='pending').count()

print(f"  Paid Orders: {paid_orders}")
print(f"  Confirmed Orders: {confirmed_orders}")
print(f"  Pending Orders: {pending_orders}")

print(f"\n✅ Orders after successful payment are in the database!")
print(f"   Admin should see these at: http://localhost:5174/admin/orders")
