#!/usr/bin/env python3
"""
Additional product seeding script.
Adds 20 more products across all categories and brands.
"""

from django.core.management.base import BaseCommand
from django.db import transaction
from decimal import Decimal
import random
from adminpanel.models import Category, Brand, Product

class Command(BaseCommand):
    help = 'Seed additional products to existing inventory'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Adding 20 more products...'))
        
        with transaction.atomic():
            # Get existing categories and brands
            categories = list(Category.objects.all())
            brands = list(Brand.objects.all())
            
            if not categories or not brands:
                self.stdout.write(self.style.ERROR('No categories or brands found. Please run seed_data first.'))
                return
            
            # Create additional products
            products = self.create_additional_products(categories, brands)
            
        self.stdout.write(self.style.SUCCESS('Additional products added successfully!'))
        self.print_summary(products)

    def create_additional_products(self, categories, brands):
        """Create 20 additional products"""
        
        additional_products_data = [
            # Electronics - More variety
            {'name': 'iPad Pro 12.9"', 'price': 1099.99, 'brand': 'Apple', 'category': 'Tablets', 'description': 'Professional tablet for creative work'},
            {'name': 'Samsung Galaxy Tab S9', 'price': 799.99, 'brand': 'Samsung', 'category': 'Tablets', 'description': 'Premium Android tablet'},
            {'name': 'Microsoft Surface Laptop', 'price': 1299.99, 'brand': 'Microsoft', 'category': 'Laptops', 'description': 'Sleek Windows laptop'},
            {'name': 'Google Pixel Buds Pro', 'price': 199.99, 'brand': 'Google', 'category': 'Headphones', 'description': 'Wireless earbuds with noise cancellation'},
            {'name': 'Sony WF-1000XM4', 'price': 279.99, 'brand': 'Sony', 'category': 'Headphones', 'description': 'Premium wireless earbuds'},
            
            # Fashion - More items
            {'name': 'Nike Air Force 1', 'price': 90.00, 'brand': 'Nike', 'category': 'Shoes', 'description': 'Classic basketball sneakers'},
            {'name': 'Adidas Stan Smith', 'price': 85.00, 'brand': 'Adidas', 'category': 'Shoes', 'description': 'Iconic tennis shoes'},
            {'name': 'Nike Women\'s Sports Bra', 'price': 35.00, 'brand': 'Nike', 'category': 'Women\'s Clothing', 'description': 'High-support sports bra'},
            {'name': 'Adidas Men\'s Track Jacket', 'price': 75.00, 'brand': 'Adidas', 'category': 'Men\'s Clothing', 'description': 'Classic track jacket'},
            {'name': 'Nike Women\'s Running Shoes', 'price': 120.00, 'brand': 'Nike', 'category': 'Shoes', 'description': 'Lightweight running shoes'},
            
            # Home & Garden - More variety
            {'name': 'Smart Home Hub', 'price': 149.99, 'brand': 'Amazon', 'category': 'Home Decor', 'description': 'Central smart home controller'},
            {'name': 'Robot Vacuum Cleaner', 'price': 299.99, 'brand': 'Amazon', 'category': 'Kitchen Appliances', 'description': 'Automatic floor cleaning robot'},
            {'name': 'Garden Sprinkler System', 'price': 89.99, 'brand': 'Amazon', 'category': 'Garden Tools', 'description': 'Automated garden watering system'},
            {'name': 'Smart Doorbell', 'price': 199.99, 'brand': 'Amazon', 'category': 'Home Decor', 'description': 'WiFi-enabled video doorbell'},
            {'name': 'Air Purifier', 'price': 179.99, 'brand': 'Amazon', 'category': 'Home Decor', 'description': 'HEPA air purification system'},
            
            # Sports & Outdoors - More equipment
            {'name': 'Dumbbell Set', 'price': 129.99, 'brand': 'Amazon', 'category': 'Fitness Equipment', 'description': 'Adjustable dumbbell set'},
            {'name': 'Camping Sleeping Bag', 'price': 79.99, 'brand': 'Amazon', 'category': 'Camping', 'description': 'Warm weather sleeping bag'},
            {'name': 'Yoga Block Set', 'price': 24.99, 'brand': 'Amazon', 'category': 'Fitness Equipment', 'description': 'Eco-friendly yoga blocks'},
            {'name': 'Water Bottle Insulated', 'price': 29.99, 'brand': 'Amazon', 'category': 'Sports Apparel', 'description': 'Stainless steel water bottle'},
            {'name': 'Resistance Bands Set', 'price': 19.99, 'brand': 'Amazon', 'category': 'Fitness Equipment', 'description': 'Multi-level resistance bands'},
            
            # Health & Beauty - More products
            {'name': 'Face Moisturizer', 'price': 34.99, 'brand': 'Amazon', 'category': 'Skincare', 'description': 'Anti-aging face moisturizer'},
            {'name': 'Hair Straightener', 'price': 89.99, 'brand': 'Amazon', 'category': 'Hair Care', 'description': 'Professional hair straightener'},
            {'name': 'Makeup Mirror LED', 'price': 59.99, 'brand': 'Amazon', 'category': 'Makeup', 'description': 'LED makeup mirror with magnification'},
            {'name': 'Essential Oils Set', 'price': 39.99, 'brand': 'Amazon', 'category': 'Personal Care', 'description': 'Aromatherapy essential oils'},
            {'name': 'Vitamin D3 Supplements', 'price': 24.99, 'brand': 'Amazon', 'category': 'Health Supplements', 'description': 'High-potency vitamin D3'},
            
            # Books & Media - More variety
            {'name': 'Kindle Paperwhite', 'price': 139.99, 'brand': 'Amazon', 'category': 'Educational', 'description': 'E-reader with built-in light'},
            {'name': 'Bluetooth Headphones', 'price': 79.99, 'brand': 'Sony', 'category': 'Music', 'description': 'Wireless over-ear headphones'},
            {'name': 'Documentary Collection', 'price': 39.99, 'brand': 'Amazon', 'category': 'Movies', 'description': 'Educational documentary series'},
            {'name': 'Language Learning Book', 'price': 19.99, 'brand': 'Amazon', 'category': 'Educational', 'description': 'Complete language learning guide'},
            {'name': 'Music Streaming Service', 'price': 9.99, 'brand': 'Amazon', 'category': 'Music', 'description': 'Monthly music streaming subscription'},
            
            # Toys & Games - More options
            {'name': 'LEGO Creator Set', 'price': 89.99, 'brand': 'Amazon', 'category': 'Educational Toys', 'description': 'Creative building blocks set'},
            {'name': 'Puzzle Game Collection', 'price': 34.99, 'brand': 'Amazon', 'category': 'Board Games', 'description': 'Brain-teasing puzzle games'},
            {'name': 'Remote Control Car', 'price': 79.99, 'brand': 'Amazon', 'category': 'Action Figures', 'description': 'High-speed RC car'},
            {'name': 'Educational Science Kit', 'price': 49.99, 'brand': 'Amazon', 'category': 'Educational Toys', 'description': 'STEM science experiment kit'},
            {'name': 'Gaming Headset', 'price': 129.99, 'brand': 'Sony', 'category': 'Video Games', 'description': 'Professional gaming headset'},
            
            # Automotive - More parts
            {'name': 'Car Battery Charger', 'price': 69.99, 'brand': 'Amazon', 'category': 'Car Parts', 'description': 'Smart car battery charger'},
            {'name': 'Car Floor Mats', 'price': 45.99, 'brand': 'Amazon', 'category': 'Car Care', 'description': 'Weather-resistant floor mats'},
            {'name': 'Motorcycle Jacket', 'price': 159.99, 'brand': 'Amazon', 'category': 'Motorcycle Gear', 'description': 'Protective motorcycle jacket'},
            {'name': 'Car Phone Charger', 'price': 24.99, 'brand': 'Amazon', 'category': 'Accessories', 'description': 'Fast wireless car charger'},
            {'name': 'Tire Pressure Gauge', 'price': 15.99, 'brand': 'Amazon', 'category': 'Tools', 'description': 'Digital tire pressure monitor'},
            
            # Food & Beverages - More options
            {'name': 'Organic Coffee Beans', 'price': 18.99, 'brand': 'Amazon', 'category': 'Beverages', 'description': 'Premium organic coffee beans'},
            {'name': 'Protein Shake Mix', 'price': 34.99, 'brand': 'Amazon', 'category': 'Supplements', 'description': 'Whey protein shake powder'},
            {'name': 'Healthy Snack Mix', 'price': 12.99, 'brand': 'Amazon', 'category': 'Snacks', 'description': 'Nut and dried fruit mix'},
            {'name': 'Green Tea Collection', 'price': 22.99, 'brand': 'Amazon', 'category': 'Organic Food', 'description': 'Premium green tea selection'},
            {'name': 'Cooking Oil Set', 'price': 28.99, 'brand': 'Amazon', 'category': 'Cooking Ingredients', 'description': 'Premium cooking oils collection'},
            
            # Office Supplies - More items
            {'name': 'Wireless Keyboard', 'price': 79.99, 'brand': 'Microsoft', 'category': 'Computers', 'description': 'Ergonomic wireless keyboard'},
            {'name': 'Standing Desk Converter', 'price': 199.99, 'brand': 'Amazon', 'category': 'Furniture', 'description': 'Adjustable standing desk'},
            {'name': 'Laser Printer', 'price': 149.99, 'brand': 'Amazon', 'category': 'Printers', 'description': 'Monochrome laser printer'},
            {'name': 'Desk Lamp LED', 'price': 49.99, 'brand': 'Amazon', 'category': 'Stationery', 'description': 'USB-charging LED desk lamp'},
            {'name': 'Office Software Suite', 'price': 149.99, 'brand': 'Microsoft', 'category': 'Software', 'description': 'Complete office productivity suite'}
        ]
        
        products = []
        for product_data in additional_products_data:
            # Find brand and category
            brand = next((b for b in brands if b.name == product_data['brand']), None)
            category = next((c for c in categories if c.name == product_data['category']), None)
            
            if brand and category:
                product = Product.objects.create(
                    name=product_data['name'],
                    description=product_data['description'],
                    price=Decimal(str(product_data['price'])),
                    brand=brand,
                    category=category,
                    stock=random.randint(15, 150),
                    technical_specs={
                        'weight': f"{random.randint(50, 3000)}g",
                        'dimensions': f"{random.randint(5, 60)}x{random.randint(5, 60)}x{random.randint(2, 30)}cm",
                        'color': random.choice(['Black', 'White', 'Silver', 'Blue', 'Red', 'Green', 'Gray']),
                        'material': random.choice(['Plastic', 'Metal', 'Fabric', 'Leather', 'Wood', 'Glass', 'Ceramic']),
                        'warranty': random.choice(['1 Year', '2 Years', '3 Years', 'Lifetime']),
                        'origin': random.choice(['USA', 'China', 'Germany', 'Japan', 'South Korea'])
                    }
                )
                products.append(product)
        
        self.stdout.write(f'Created {len(products)} additional products')
        return products

    def print_summary(self, products):
        """Print summary of created products"""
        self.stdout.write(self.style.SUCCESS('\n=== ADDITIONAL PRODUCTS SUMMARY ==='))
        
        # Group by category
        categories = {}
        brands = {}
        
        for product in products:
            cat_name = product.category.name
            brand_name = product.brand.name
            
            if cat_name not in categories:
                categories[cat_name] = []
            categories[cat_name].append(product)
            
            if brand_name not in brands:
                brands[brand_name] = []
            brands[brand_name].append(product)
        
        self.stdout.write('\nProducts by Category:')
        for cat_name, cat_products in categories.items():
            self.stdout.write(f'  {cat_name}: {len(cat_products)} products')
            for product in cat_products[:2]:  # Show first 2 products
                self.stdout.write(f'    - {product.name} (${product.price})')
        
        self.stdout.write('\nProducts by Brand:')
        for brand_name, brand_products in brands.items():
            self.stdout.write(f'  {brand_name}: {len(brand_products)} products')
        
        self.stdout.write(f'\nTotal additional products: {len(products)}')
        self.stdout.write('All products have been added to existing inventory!')
