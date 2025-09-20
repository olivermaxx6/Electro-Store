#!/usr/bin/env python3
"""
Comprehensive data seeding script for e-commerce platform.
Creates categories, brands, products, and services with realistic data.
"""

from django.core.management.base import BaseCommand
from django.db import transaction
from decimal import Decimal
import random
from adminpanel.models import (
    Category, Brand, Product, ProductImage, 
    ServiceCategory, Service, ServiceImage
)

class Command(BaseCommand):
    help = 'Seed the database with categories, brands, products, and services'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing data before seeding',
        )

    def handle(self, *args, **options):
        if options['clear']:
            self.stdout.write(self.style.WARNING('Clearing existing data...'))
            self.clear_data()
        
        self.stdout.write(self.style.SUCCESS('Starting data seeding...'))
        
        with transaction.atomic():
            # Create categories and subcategories
            categories = self.create_categories()
            
            # Create brands
            brands = self.create_brands()
            
            # Create products
            products = self.create_products(categories, brands)
            
            # Create discounted products
            discounted_products = self.create_discounted_products(categories, brands)
            
            # Create service categories
            service_categories = self.create_service_categories()
            
            # Create services
            services = self.create_services(service_categories)
            
        self.stdout.write(self.style.SUCCESS('Data seeding completed successfully!'))
        self.print_summary(categories, brands, products + discounted_products, service_categories, services)

    def clear_data(self):
        """Clear existing data"""
        ServiceImage.objects.all().delete()
        Service.objects.all().delete()
        ServiceCategory.objects.all().delete()
        ProductImage.objects.all().delete()
        Product.objects.all().delete()
        Brand.objects.all().delete()
        Category.objects.all().delete()

    def create_categories(self):
        """Create 10 main categories with subcategories"""
        self.stdout.write('Creating categories and subcategories...')
        
        categories_data = [
            {
                'name': 'Electronics',
                'subcategories': ['Smartphones', 'Laptops', 'Tablets', 'Headphones', 'Cameras']
            },
            {
                'name': 'Fashion',
                'subcategories': ['Men\'s Clothing', 'Women\'s Clothing', 'Shoes', 'Accessories', 'Jewelry']
            },
            {
                'name': 'Home & Garden',
                'subcategories': ['Furniture', 'Kitchen Appliances', 'Home Decor', 'Garden Tools', 'Lighting']
            },
            {
                'name': 'Sports & Outdoors',
                'subcategories': ['Fitness Equipment', 'Outdoor Gear', 'Sports Apparel', 'Camping', 'Water Sports']
            },
            {
                'name': 'Health & Beauty',
                'subcategories': ['Skincare', 'Makeup', 'Hair Care', 'Health Supplements', 'Personal Care']
            },
            {
                'name': 'Books & Media',
                'subcategories': ['Fiction', 'Non-Fiction', 'Educational', 'Music', 'Movies']
            },
            {
                'name': 'Toys & Games',
                'subcategories': ['Action Figures', 'Board Games', 'Educational Toys', 'Outdoor Toys', 'Video Games']
            },
            {
                'name': 'Automotive',
                'subcategories': ['Car Parts', 'Car Care', 'Motorcycle Gear', 'Tools', 'Accessories']
            },
            {
                'name': 'Food & Beverages',
                'subcategories': ['Snacks', 'Beverages', 'Cooking Ingredients', 'Organic Food', 'Supplements']
            },
            {
                'name': 'Office Supplies',
                'subcategories': ['Stationery', 'Computers', 'Printers', 'Furniture', 'Software']
            }
        ]
        
        categories = []
        for cat_data in categories_data:
            # Create main category
            main_category = Category.objects.create(name=cat_data['name'])
            categories.append(main_category)
            
            # Create subcategories
            for subcat_name in cat_data['subcategories']:
                subcategory = Category.objects.create(
                    name=subcat_name,
                    parent=main_category
                )
                categories.append(subcategory)
        
        self.stdout.write(f'Created {len(categories)} categories')
        return categories

    def create_brands(self):
        """Create 10 brands"""
        self.stdout.write('Creating brands...')
        
        brands_data = [
            'Apple', 'Samsung', 'Nike', 'Adidas', 'Sony',
            'Microsoft', 'Google', 'Amazon', 'Tesla', 'BMW'
        ]
        
        brands = []
        for brand_name in brands_data:
            brand = Brand.objects.create(name=brand_name)
            brands.append(brand)
        
        self.stdout.write(f'Created {len(brands)} brands')
        return brands

    def create_products(self, categories, brands):
        """Create 40 regular products"""
        self.stdout.write('Creating products...')
        
        products_data = [
            # Electronics
            {'name': 'iPhone 15 Pro', 'price': 999.99, 'brand': 'Apple', 'category': 'Smartphones', 'description': 'Latest iPhone with advanced camera system'},
            {'name': 'Samsung Galaxy S24', 'price': 899.99, 'brand': 'Samsung', 'category': 'Smartphones', 'description': 'Premium Android smartphone'},
            {'name': 'MacBook Pro M3', 'price': 1999.99, 'brand': 'Apple', 'category': 'Laptops', 'description': 'Professional laptop for creators'},
            {'name': 'Sony WH-1000XM5', 'price': 399.99, 'brand': 'Sony', 'category': 'Headphones', 'description': 'Industry-leading noise canceling headphones'},
            {'name': 'Sony A7R V', 'price': 3899.99, 'brand': 'Sony', 'category': 'Cameras', 'description': 'Professional mirrorless camera'},
            
            # Fashion
            {'name': 'Nike Air Max 270', 'price': 150.00, 'brand': 'Nike', 'category': 'Shoes', 'description': 'Comfortable running shoes'},
            {'name': 'Adidas Ultraboost 22', 'price': 180.00, 'brand': 'Adidas', 'category': 'Shoes', 'description': 'High-performance running shoes'},
            {'name': 'Nike Dri-FIT T-Shirt', 'price': 25.00, 'brand': 'Nike', 'category': 'Men\'s Clothing', 'description': 'Moisture-wicking athletic shirt'},
            {'name': 'Adidas Originals Hoodie', 'price': 65.00, 'brand': 'Adidas', 'category': 'Men\'s Clothing', 'description': 'Classic streetwear hoodie'},
            {'name': 'Nike Women\'s Leggings', 'price': 45.00, 'brand': 'Nike', 'category': 'Women\'s Clothing', 'description': 'Flexible workout leggings'},
            
            # Home & Garden
            {'name': 'Smart Coffee Maker', 'price': 299.99, 'brand': 'Amazon', 'category': 'Kitchen Appliances', 'description': 'WiFi-enabled coffee maker'},
            {'name': 'LED Desk Lamp', 'price': 89.99, 'brand': 'Amazon', 'category': 'Lighting', 'description': 'Adjustable LED desk lamp'},
            {'name': 'Garden Hose Set', 'price': 45.99, 'brand': 'Amazon', 'category': 'Garden Tools', 'description': '50ft expandable garden hose'},
            {'name': 'Modern Dining Table', 'price': 599.99, 'brand': 'Amazon', 'category': 'Furniture', 'description': 'Solid wood dining table'},
            {'name': 'Decorative Throw Pillows', 'price': 29.99, 'brand': 'Amazon', 'category': 'Home Decor', 'description': 'Set of 4 decorative pillows'},
            
            # Sports & Outdoors
            {'name': 'Yoga Mat Premium', 'price': 79.99, 'brand': 'Amazon', 'category': 'Fitness Equipment', 'description': 'Non-slip yoga mat'},
            {'name': 'Camping Tent 4-Person', 'price': 199.99, 'brand': 'Amazon', 'category': 'Camping', 'description': 'Waterproof camping tent'},
            {'name': 'Hiking Backpack', 'price': 129.99, 'brand': 'Amazon', 'category': 'Outdoor Gear', 'description': '40L hiking backpack'},
            {'name': 'Swimming Goggles', 'price': 24.99, 'brand': 'Amazon', 'category': 'Water Sports', 'description': 'Anti-fog swimming goggles'},
            {'name': 'Running Shorts', 'price': 35.00, 'brand': 'Nike', 'category': 'Sports Apparel', 'description': 'Lightweight running shorts'},
            
            # Health & Beauty
            {'name': 'Vitamin C Serum', 'price': 39.99, 'brand': 'Amazon', 'category': 'Skincare', 'description': 'Anti-aging vitamin C serum'},
            {'name': 'Hair Dryer Professional', 'price': 89.99, 'brand': 'Amazon', 'category': 'Hair Care', 'description': 'Ionic hair dryer'},
            {'name': 'Makeup Brush Set', 'price': 49.99, 'brand': 'Amazon', 'category': 'Makeup', 'description': 'Professional makeup brush set'},
            {'name': 'Protein Powder', 'price': 59.99, 'brand': 'Amazon', 'category': 'Health Supplements', 'description': 'Whey protein powder'},
            {'name': 'Electric Toothbrush', 'price': 79.99, 'brand': 'Amazon', 'category': 'Personal Care', 'description': 'Sonic electric toothbrush'},
            
            # Books & Media
            {'name': 'Programming Book', 'price': 49.99, 'brand': 'Amazon', 'category': 'Educational', 'description': 'Learn Python programming'},
            {'name': 'Fiction Novel', 'price': 14.99, 'brand': 'Amazon', 'category': 'Fiction', 'description': 'Bestselling fiction novel'},
            {'name': 'Bluetooth Speaker', 'price': 79.99, 'brand': 'Sony', 'category': 'Music', 'description': 'Portable Bluetooth speaker'},
            {'name': 'Movie Collection', 'price': 29.99, 'brand': 'Amazon', 'category': 'Movies', 'description': 'Classic movie collection'},
            {'name': 'History Book', 'price': 24.99, 'brand': 'Amazon', 'category': 'Non-Fiction', 'description': 'World history textbook'},
            
            # Toys & Games
            {'name': 'Action Figure Set', 'price': 39.99, 'brand': 'Amazon', 'category': 'Action Figures', 'description': 'Collectible action figures'},
            {'name': 'Board Game', 'price': 49.99, 'brand': 'Amazon', 'category': 'Board Games', 'description': 'Family board game'},
            {'name': 'Educational Toy', 'price': 29.99, 'brand': 'Amazon', 'category': 'Educational Toys', 'description': 'STEM learning toy'},
            {'name': 'Outdoor Play Set', 'price': 199.99, 'brand': 'Amazon', 'category': 'Outdoor Toys', 'description': 'Children\'s play set'},
            {'name': 'Gaming Console', 'price': 499.99, 'brand': 'Sony', 'category': 'Video Games', 'description': 'Latest gaming console'},
            
            # Automotive
            {'name': 'Car Air Filter', 'price': 24.99, 'brand': 'Amazon', 'category': 'Car Parts', 'description': 'High-quality air filter'},
            {'name': 'Car Wax Kit', 'price': 39.99, 'brand': 'Amazon', 'category': 'Car Care', 'description': 'Professional car wax kit'},
            {'name': 'Motorcycle Helmet', 'price': 199.99, 'brand': 'Amazon', 'category': 'Motorcycle Gear', 'description': 'Safety motorcycle helmet'},
            {'name': 'Tool Set', 'price': 89.99, 'brand': 'Amazon', 'category': 'Tools', 'description': 'Professional tool set'},
            {'name': 'Car Phone Mount', 'price': 19.99, 'brand': 'Amazon', 'category': 'Accessories', 'description': 'Magnetic phone mount'},
            
            # Food & Beverages
            {'name': 'Organic Snacks', 'price': 12.99, 'brand': 'Amazon', 'category': 'Snacks', 'description': 'Healthy organic snacks'},
            {'name': 'Energy Drink', 'price': 2.99, 'brand': 'Amazon', 'category': 'Beverages', 'description': 'Natural energy drink'},
            {'name': 'Cooking Spices', 'price': 8.99, 'brand': 'Amazon', 'category': 'Cooking Ingredients', 'description': 'Premium spice collection'},
            {'name': 'Organic Tea', 'price': 15.99, 'brand': 'Amazon', 'category': 'Organic Food', 'description': 'Organic herbal tea'},
            {'name': 'Protein Bars', 'price': 24.99, 'brand': 'Amazon', 'category': 'Supplements', 'description': 'High-protein energy bars'},
            
            # Office Supplies
            {'name': 'Wireless Mouse', 'price': 29.99, 'brand': 'Microsoft', 'category': 'Computers', 'description': 'Ergonomic wireless mouse'},
            {'name': 'Office Chair', 'price': 299.99, 'brand': 'Amazon', 'category': 'Furniture', 'description': 'Ergonomic office chair'},
            {'name': 'Printer Paper', 'price': 19.99, 'brand': 'Amazon', 'category': 'Stationery', 'description': 'Premium printer paper'},
            {'name': 'Software License', 'price': 99.99, 'brand': 'Microsoft', 'category': 'Software', 'description': 'Office software license'},
            {'name': 'Desk Organizer', 'price': 24.99, 'brand': 'Amazon', 'category': 'Stationery', 'description': 'Bamboo desk organizer'}
        ]
        
        products = []
        for product_data in products_data:
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
                    stock=random.randint(10, 100),
                    technical_specs={
                        'weight': f"{random.randint(100, 2000)}g",
                        'dimensions': f"{random.randint(10, 50)}x{random.randint(10, 50)}x{random.randint(5, 20)}cm",
                        'color': random.choice(['Black', 'White', 'Silver', 'Blue', 'Red']),
                        'material': random.choice(['Plastic', 'Metal', 'Fabric', 'Leather', 'Wood'])
                    }
                )
                products.append(product)
        
        self.stdout.write(f'Created {len(products)} products')
        return products

    def create_discounted_products(self, categories, brands):
        """Create 10 products with discounts"""
        self.stdout.write('Creating discounted products...')
        
        discounted_products_data = [
            {'name': 'iPhone 14 Pro (Clearance)', 'price': 899.99, 'discount': 20, 'brand': 'Apple', 'category': 'Smartphones'},
            {'name': 'Samsung Galaxy S23 (Sale)', 'price': 699.99, 'discount': 25, 'brand': 'Samsung', 'category': 'Smartphones'},
            {'name': 'MacBook Air M2 (Deal)', 'price': 1099.99, 'discount': 15, 'brand': 'Apple', 'category': 'Laptops'},
            {'name': 'Nike Air Jordan (Limited)', 'price': 120.00, 'discount': 30, 'brand': 'Nike', 'category': 'Shoes'},
            {'name': 'Sony PlayStation 5 (Bundle)', 'price': 449.99, 'discount': 10, 'brand': 'Sony', 'category': 'Video Games'},
            {'name': 'Adidas Ultraboost (Outlet)', 'price': 120.00, 'discount': 35, 'brand': 'Adidas', 'category': 'Shoes'},
            {'name': 'Microsoft Surface Pro (Refurb)', 'price': 799.99, 'discount': 20, 'brand': 'Microsoft', 'category': 'Laptops'},
            {'name': 'Tesla Model 3 Accessories', 'price': 199.99, 'discount': 25, 'brand': 'Tesla', 'category': 'Car Parts'},
            {'name': 'Google Pixel 7 (Flash Sale)', 'price': 499.99, 'discount': 30, 'brand': 'Google', 'category': 'Smartphones'},
            {'name': 'BMW Car Care Kit (Premium)', 'price': 89.99, 'discount': 15, 'brand': 'BMW', 'category': 'Car Care'}
        ]
        
        products = []
        for product_data in discounted_products_data:
            # Find brand and category
            brand = next((b for b in brands if b.name == product_data['brand']), None)
            category = next((c for c in categories if c.name == product_data['category']), None)
            
            if brand and category:
                product = Product.objects.create(
                    name=product_data['name'],
                    description=f"Special offer: {product_data['name']} with {product_data['discount']}% discount!",
                    price=Decimal(str(product_data['price'])),
                    discount_rate=Decimal(str(product_data['discount'])),
                    brand=brand,
                    category=category,
                    stock=random.randint(5, 50),
                    technical_specs={
                        'weight': f"{random.randint(100, 2000)}g",
                        'dimensions': f"{random.randint(10, 50)}x{random.randint(10, 50)}x{random.randint(5, 20)}cm",
                        'color': random.choice(['Black', 'White', 'Silver', 'Blue', 'Red']),
                        'material': random.choice(['Plastic', 'Metal', 'Fabric', 'Leather', 'Wood']),
                        'sale_type': 'Limited Time Offer'
                    }
                )
                products.append(product)
        
        self.stdout.write(f'Created {len(products)} discounted products')
        return products

    def create_service_categories(self):
        """Create 5 service categories"""
        self.stdout.write('Creating service categories...')
        
        service_categories_data = [
            {
                'name': 'Technology Services',
                'description': 'Professional technology solutions and support',
                'ordering': 1
            },
            {
                'name': 'Home Services',
                'description': 'Complete home improvement and maintenance services',
                'ordering': 2
            },
            {
                'name': 'Business Services',
                'description': 'Professional business solutions and consulting',
                'ordering': 3
            },
            {
                'name': 'Health & Wellness',
                'description': 'Personal health and wellness services',
                'ordering': 4
            },
            {
                'name': 'Creative Services',
                'description': 'Design, marketing, and creative solutions',
                'ordering': 5
            }
        ]
        
        service_categories = []
        for cat_data in service_categories_data:
            service_category = ServiceCategory.objects.create(
                name=cat_data['name'],
                description=cat_data['description'],
                ordering=cat_data['ordering']
            )
            service_categories.append(service_category)
        
        self.stdout.write(f'Created {len(service_categories)} service categories')
        return service_categories

    def create_services(self, service_categories):
        """Create 10 services"""
        self.stdout.write('Creating services...')
        
        services_data = [
            # Technology Services
            {
                'name': 'Website Development',
                'description': 'Professional website design and development',
                'price': 2500.00,
                'category': 'Technology Services',
                'overview': 'Complete website development from design to deployment',
                'included_features': ['Responsive Design', 'SEO Optimization', 'Content Management', 'E-commerce Integration'],
                'process_steps': [
                    {'step': 'Consultation', 'duration': '1 day'},
                    {'step': 'Design', 'duration': '3-5 days'},
                    {'step': 'Development', 'duration': '7-10 days'},
                    {'step': 'Testing', 'duration': '2-3 days'},
                    {'step': 'Deployment', 'duration': '1 day'}
                ],
                'key_features': ['Mobile Responsive', 'Fast Loading', 'SEO Ready', 'Secure'],
                'contact_info': {'phone': '+1-555-0123', 'email': 'tech@example.com'},
                'availability': 'Monday-Friday, 9AM-6PM'
            },
            {
                'name': 'IT Support',
                'description': '24/7 technical support and maintenance',
                'price': 150.00,
                'category': 'Technology Services',
                'overview': 'Comprehensive IT support for businesses',
                'included_features': ['Remote Support', 'System Maintenance', 'Security Updates', 'Backup Solutions'],
                'process_steps': [
                    {'step': 'Initial Assessment', 'duration': '1 day'},
                    {'step': 'Setup', 'duration': '2-3 days'},
                    {'step': 'Monitoring', 'duration': 'Ongoing'}
                ],
                'key_features': ['24/7 Support', 'Remote Access', 'Proactive Monitoring', 'Expert Technicians'],
                'contact_info': {'phone': '+1-555-0124', 'email': 'support@example.com'},
                'availability': '24/7 Support Available'
            },
            
            # Home Services
            {
                'name': 'House Cleaning',
                'description': 'Professional residential cleaning services',
                'price': 120.00,
                'category': 'Home Services',
                'overview': 'Thorough cleaning of your home',
                'included_features': ['Deep Cleaning', 'Window Cleaning', 'Carpet Cleaning', 'Kitchen Sanitization'],
                'process_steps': [
                    {'step': 'Assessment', 'duration': '30 minutes'},
                    {'step': 'Cleaning', 'duration': '2-4 hours'},
                    {'step': 'Inspection', 'duration': '15 minutes'}
                ],
                'key_features': ['Eco-Friendly Products', 'Insured Staff', 'Satisfaction Guarantee', 'Flexible Scheduling'],
                'contact_info': {'phone': '+1-555-0125', 'email': 'cleaning@example.com'},
                'availability': 'Monday-Saturday, 8AM-6PM'
            },
            {
                'name': 'Plumbing Services',
                'description': 'Professional plumbing repairs and installations',
                'price': 200.00,
                'category': 'Home Services',
                'overview': 'Expert plumbing solutions for your home',
                'included_features': ['Emergency Repairs', 'Installation', 'Maintenance', 'Leak Detection'],
                'process_steps': [
                    {'step': 'Diagnosis', 'duration': '30-60 minutes'},
                    {'step': 'Repair/Installation', 'duration': '1-3 hours'},
                    {'step': 'Testing', 'duration': '15 minutes'}
                ],
                'key_features': ['Licensed Plumbers', 'Emergency Service', 'Quality Parts', 'Warranty Included'],
                'contact_info': {'phone': '+1-555-0126', 'email': 'plumbing@example.com'},
                'availability': '24/7 Emergency Service'
            },
            
            # Business Services
            {
                'name': 'Business Consulting',
                'description': 'Strategic business planning and consulting',
                'price': 500.00,
                'category': 'Business Services',
                'overview': 'Expert business strategy and planning',
                'included_features': ['Strategic Planning', 'Market Analysis', 'Financial Planning', 'Growth Strategy'],
                'process_steps': [
                    {'step': 'Initial Consultation', 'duration': '2 hours'},
                    {'step': 'Analysis', 'duration': '1-2 weeks'},
                    {'step': 'Strategy Development', 'duration': '1 week'},
                    {'step': 'Implementation Plan', 'duration': '3-5 days'}
                ],
                'key_features': ['Expert Consultants', 'Custom Solutions', 'Proven Methods', 'Ongoing Support'],
                'contact_info': {'phone': '+1-555-0127', 'email': 'consulting@example.com'},
                'availability': 'Monday-Friday, 9AM-5PM'
            },
            {
                'name': 'Accounting Services',
                'description': 'Professional bookkeeping and accounting',
                'price': 300.00,
                'category': 'Business Services',
                'overview': 'Complete accounting and bookkeeping services',
                'included_features': ['Bookkeeping', 'Tax Preparation', 'Financial Reports', 'Payroll Services'],
                'process_steps': [
                    {'step': 'Setup', 'duration': '1 day'},
                    {'step': 'Data Entry', 'duration': 'Ongoing'},
                    {'step': 'Reporting', 'duration': 'Monthly'}
                ],
                'key_features': ['Certified Accountants', 'Accurate Records', 'Tax Compliance', 'Financial Insights'],
                'contact_info': {'phone': '+1-555-0128', 'email': 'accounting@example.com'},
                'availability': 'Monday-Friday, 8AM-6PM'
            },
            
            # Health & Wellness
            {
                'name': 'Personal Training',
                'description': 'One-on-one fitness training sessions',
                'price': 80.00,
                'category': 'Health & Wellness',
                'overview': 'Personalized fitness training program',
                'included_features': ['Custom Workouts', 'Nutrition Guidance', 'Progress Tracking', 'Motivation'],
                'process_steps': [
                    {'step': 'Assessment', 'duration': '1 hour'},
                    {'step': 'Program Design', 'duration': '1 day'},
                    {'step': 'Training Sessions', 'duration': 'Ongoing'}
                ],
                'key_features': ['Certified Trainers', 'Personalized Plans', 'Flexible Scheduling', 'Results Focused'],
                'contact_info': {'phone': '+1-555-0129', 'email': 'fitness@example.com'},
                'availability': 'Monday-Sunday, 6AM-9PM'
            },
            {
                'name': 'Massage Therapy',
                'description': 'Professional therapeutic massage services',
                'price': 100.00,
                'category': 'Health & Wellness',
                'overview': 'Relaxing and therapeutic massage treatments',
                'included_features': ['Swedish Massage', 'Deep Tissue', 'Hot Stone', 'Aromatherapy'],
                'process_steps': [
                    {'step': 'Consultation', 'duration': '15 minutes'},
                    {'step': 'Massage', 'duration': '60-90 minutes'},
                    {'step': 'Aftercare', 'duration': '15 minutes'}
                ],
                'key_features': ['Licensed Therapists', 'Relaxing Environment', 'Customized Treatment', 'Health Benefits'],
                'contact_info': {'phone': '+1-555-0130', 'email': 'massage@example.com'},
                'availability': 'Tuesday-Saturday, 10AM-8PM'
            },
            
            # Creative Services
            {
                'name': 'Graphic Design',
                'description': 'Professional graphic design services',
                'price': 200.00,
                'category': 'Creative Services',
                'overview': 'Creative design solutions for your brand',
                'included_features': ['Logo Design', 'Brand Identity', 'Marketing Materials', 'Web Graphics'],
                'process_steps': [
                    {'step': 'Briefing', 'duration': '1 hour'},
                    {'step': 'Concept Development', 'duration': '2-3 days'},
                    {'step': 'Design', 'duration': '3-5 days'},
                    {'step': 'Revisions', 'duration': '1-2 days'}
                ],
                'key_features': ['Creative Designers', 'Modern Styles', 'Brand Consistency', 'Multiple Formats'],
                'contact_info': {'phone': '+1-555-0131', 'email': 'design@example.com'},
                'availability': 'Monday-Friday, 9AM-6PM'
            },
            {
                'name': 'Digital Marketing',
                'description': 'Comprehensive digital marketing strategy',
                'price': 800.00,
                'category': 'Creative Services',
                'overview': 'Complete digital marketing solutions',
                'included_features': ['SEO Optimization', 'Social Media', 'Content Marketing', 'Analytics'],
                'process_steps': [
                    {'step': 'Strategy Development', 'duration': '1 week'},
                    {'step': 'Implementation', 'duration': '2-4 weeks'},
                    {'step': 'Monitoring', 'duration': 'Ongoing'},
                    {'step': 'Optimization', 'duration': 'Monthly'}
                ],
                'key_features': ['Expert Marketers', 'Data-Driven', 'ROI Focused', 'Multi-Channel'],
                'contact_info': {'phone': '+1-555-0132', 'email': 'marketing@example.com'},
                'availability': 'Monday-Friday, 9AM-6PM'
            }
        ]
        
        services = []
        for service_data in services_data:
            # Find service category
            service_category = next((sc for sc in service_categories if sc.name == service_data['category']), None)
            
            if service_category:
                service = Service.objects.create(
                    name=service_data['name'],
                    description=service_data['description'],
                    price=Decimal(str(service_data['price'])),
                    category=service_category,
                    overview=service_data['overview'],
                    included_features=service_data['included_features'],
                    process_steps=service_data['process_steps'],
                    key_features=service_data['key_features'],
                    contact_info=service_data['contact_info'],
                    availability=service_data['availability'],
                    rating=Decimal(str(random.uniform(4.0, 5.0))),
                    review_count=random.randint(10, 100),
                    view_count=random.randint(50, 500),
                    form_fields=[
                        {'label': 'Name', 'type': 'text', 'required': True},
                        {'label': 'Email', 'type': 'email', 'required': True},
                        {'label': 'Phone', 'type': 'tel', 'required': False},
                        {'label': 'Message', 'type': 'textarea', 'required': True}
                    ]
                )
                services.append(service)
        
        self.stdout.write(f'Created {len(services)} services')
        return services

    def print_summary(self, categories, brands, products, service_categories, services):
        """Print summary of created data"""
        self.stdout.write(self.style.SUCCESS('\n=== SEEDING SUMMARY ==='))
        self.stdout.write(f'Categories: {len(categories)}')
        self.stdout.write(f'Brands: {len(brands)}')
        self.stdout.write(f'Products: {len(products)}')
        self.stdout.write(f'Service Categories: {len(service_categories)}')
        self.stdout.write(f'Services: {len(services)}')
        
        # Show some examples
        self.stdout.write(self.style.SUCCESS('\n=== SAMPLE DATA ==='))
        self.stdout.write('Categories:')
        for cat in categories[:5]:
            self.stdout.write(f'  - {cat}')
        
        self.stdout.write('\nBrands:')
        for brand in brands:
            self.stdout.write(f'  - {brand}')
        
        self.stdout.write('\nProducts (first 5):')
        for product in products[:5]:
            self.stdout.write(f'  - {product.name} (${product.price})')
        
        self.stdout.write('\nServices:')
        for service in services:
            self.stdout.write(f'  - {service.name} (${service.price})')
