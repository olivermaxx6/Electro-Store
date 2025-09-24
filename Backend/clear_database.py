#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Script to clear all data from the database except admin users.
This will remove all products, services, categories, orders, reviews, etc.
but preserve admin users and superusers.
"""

import os
import sys
import django

# Add the project directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth.models import User
from adminpanel.models import (
    Brand, Category, Product, ProductImage, Order, OrderItem,
    ServiceCategory, Service, ServiceImage, ServiceInquiry,
    Review, ServiceReview, WebsiteContent, StoreSettings,
    Contact, ServiceQuery
)

def clear_database():
    """Clear all data except admin users"""
    print("🗑️  Starting database cleanup...")
    
    # Count admin users before clearing
    admin_users = User.objects.filter(is_superuser=True).count()
    staff_users = User.objects.filter(is_staff=True).count()
    print(f"📊 Found {admin_users} superusers and {staff_users} staff users (these will be preserved)")
    
    # Clear all non-admin data
    models_to_clear = [
        (ServiceQuery, "Service Queries"),
        (Contact, "Contact Messages"),
        (ServiceReview, "Service Reviews"),
        (Review, "Product Reviews"),
        (ServiceInquiry, "Service Inquiries"),
        (OrderItem, "Order Items"),
        (Order, "Orders"),
        (ProductImage, "Product Images"),
        (ServiceImage, "Service Images"),
        (Product, "Products"),
        (Service, "Services"),
        (ServiceCategory, "Service Categories"),
        (Category, "Categories"),
        (Brand, "Brands"),
        (WebsiteContent, "Website Content"),
        (StoreSettings, "Store Settings"),
    ]
    
    total_cleared = 0
    for model, name in models_to_clear:
        count = model.objects.count()
        if count > 0:
            model.objects.all().delete()
            print(f"✅ Cleared {count} {name}")
            total_cleared += count
        else:
            print(f"ℹ️  No {name} to clear")
    
    # Clear regular users (non-admin, non-staff)
    regular_users = User.objects.filter(is_superuser=False, is_staff=False)
    regular_user_count = regular_users.count()
    if regular_user_count > 0:
        regular_users.delete()
        print(f"✅ Cleared {regular_user_count} regular users")
        total_cleared += regular_user_count
    else:
        print("ℹ️  No regular users to clear")
    
    print(f"\n🎉 Database cleanup complete!")
    print(f"📊 Total records cleared: {total_cleared}")
    print(f"👑 Admin users preserved: {User.objects.filter(is_superuser=True).count()}")
    print(f"👨‍💼 Staff users preserved: {User.objects.filter(is_staff=True).count()}")

if __name__ == "__main__":
    try:
        clear_database()
    except Exception as e:
        print(f"❌ Error clearing database: {e}")
        sys.exit(1)
