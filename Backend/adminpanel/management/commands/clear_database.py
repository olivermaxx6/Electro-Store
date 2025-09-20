# -*- coding: utf-8 -*-
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from adminpanel.models import (
    Brand, Category, Product, ProductImage, Order, OrderItem,
    ServiceCategory, Service, ServiceImage, ServiceInquiry,
    Review, ServiceReview, WebsiteContent, StoreSettings,
    ChatRoom, ChatMessage, Contact, ServiceQuery
)


class Command(BaseCommand):
    help = 'Clear all data from the database except admin users'

    def handle(self, *args, **options):
        self.stdout.write("Starting database cleanup...")
        
        # Count admin users before clearing
        admin_users = User.objects.filter(is_superuser=True).count()
        staff_users = User.objects.filter(is_staff=True).count()
        self.stdout.write(f"Found {admin_users} superusers and {staff_users} staff users (these will be preserved)")
        
        # Clear all non-admin data
        models_to_clear = [
            (ServiceQuery, "Service Queries"),
            (Contact, "Contact Messages"),
            (ChatMessage, "Chat Messages"),
            (ChatRoom, "Chat Rooms"),
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
                self.stdout.write(f"Cleared {count} {name}")
                total_cleared += count
            else:
                self.stdout.write(f"No {name} to clear")
        
        # Clear regular users (non-admin, non-staff)
        regular_users = User.objects.filter(is_superuser=False, is_staff=False)
        regular_user_count = regular_users.count()
        if regular_user_count > 0:
            regular_users.delete()
            self.stdout.write(f"Cleared {regular_user_count} regular users")
            total_cleared += regular_user_count
        else:
            self.stdout.write("No regular users to clear")
        
        self.stdout.write(self.style.SUCCESS(f"\nDatabase cleanup complete!"))
        self.stdout.write(f"Total records cleared: {total_cleared}")
        self.stdout.write(f"Admin users preserved: {User.objects.filter(is_superuser=True).count()}")
        self.stdout.write(f"Staff users preserved: {User.objects.filter(is_staff=True).count()}")
