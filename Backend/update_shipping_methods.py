#!/usr/bin/env python
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from adminpanel.models import Order

def update_shipping_methods():
    """Update existing orders with default shipping method"""
    orders = Order.objects.filter(shipping_method__isnull=True) | Order.objects.filter(shipping_method='')
    count = orders.count()
    
    print(f"Found {count} orders without shipping method")
    
    # Update orders with default shipping method
    updated = orders.update(shipping_method='standard')
    print(f"Updated {updated} orders with 'standard' shipping method")
    
    # Verify the update
    remaining = Order.objects.filter(shipping_method__isnull=True).count() + Order.objects.filter(shipping_method='').count()
    print(f"Remaining orders without shipping method: {remaining}")
    
    # Show some examples
    print("\nSample orders with shipping method:")
    for order in Order.objects.all()[:5]:
        print(f"Order {order.id}: {order.shipping_method}")

if __name__ == '__main__':
    update_shipping_methods()
