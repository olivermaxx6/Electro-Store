#!/usr/bin/env python
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from adminpanel.models import Brand, Category

# Create test brands
brand1, created = Brand.objects.get_or_create(name="Apple")
brand2, created = Brand.objects.get_or_create(name="Samsung")

# Create test categories
cat1, created = Category.objects.get_or_create(name="Electronics")
cat2, created = Category.objects.get_or_create(name="Laptops", parent=cat1)

print(f"Created brands: {brand1.id}, {brand2.id}")
print(f"Created categories: {cat1.id}, {cat2.id}")
