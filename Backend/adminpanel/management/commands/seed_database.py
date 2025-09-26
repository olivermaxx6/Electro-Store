# -*- coding: utf-8 -*-
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.core.files import File
from decimal import Decimal
from datetime import datetime, timedelta
import os
from adminpanel.models import (
    Brand, Category, Product, ProductImage, ServiceCategory, Service, ServiceImage,
    Review, ServiceReview, WebsiteContent, StoreSettings
)


class Command(BaseCommand):
    help = 'Seed the database with comprehensive ecommerce data'

    def add_arguments(self, parser):
        parser.add_argument(
            '--anime-image',
            type=str,
            help='Path to anime.jpg image file',
            default='../anime.jpg'
        )
        parser.add_argument(
            '--german-image',
            type=str,
            help='Path to German.png image file',
            default='../German.png'
        )

    def copy_anime_image(self, anime_source):
        """Copy anime.jpg to media directory for use in seeding"""
        anime_dest = os.path.join(os.path.dirname(__file__), '..', '..', '..', 'media', 'anime.jpg')
        
        # Create media directory if it doesn't exist
        os.makedirs(os.path.dirname(anime_dest), exist_ok=True)
        
        if os.path.exists(anime_source):
            import shutil
            shutil.copy2(anime_source, anime_dest)
            self.stdout.write(f"Copied anime.jpg to {anime_dest}")
            return anime_dest
        else:
            self.stdout.write(f"anime.jpg not found at {anime_source}")
            return None

    def copy_german_image(self, german_source):
        """Copy German.png to media directory for use in seeding services"""
        german_dest = os.path.join(os.path.dirname(__file__), '..', '..', '..', 'media', 'German.png')
        os.makedirs(os.path.dirname(german_dest), exist_ok=True)
        if os.path.exists(german_source):
            import shutil
            shutil.copy2(german_source, german_dest)
            self.stdout.write(f"Copied German.png to {german_dest}")
            return german_dest
        else:
            self.stdout.write(f"German.png not found at {german_source}")
            return None

    def create_brands(self):
        """Create popular brands"""
        brands_data = [
            {"name": "Apple", "slug": "apple"},
            {"name": "Samsung", "slug": "samsung"},
            {"name": "Sony", "slug": "sony"},
            {"name": "LG", "slug": "lg"},
            {"name": "Dell", "slug": "dell"},
            {"name": "HP", "slug": "hp"},
            {"name": "Nike", "slug": "nike"},
            {"name": "Adidas", "slug": "adidas"},
            {"name": "Canon", "slug": "canon"},
            {"name": "Nikon", "slug": "nikon"},
            {"name": "Microsoft", "slug": "microsoft"},
            {"name": "Intel", "slug": "intel"},
            {"name": "AMD", "slug": "amd"},
            {"name": "NVIDIA", "slug": "nvidia"},
            {"name": "Corsair", "slug": "corsair"},
            {"name": "KitchenAid", "slug": "kitchenaid"},
            {"name": "Peloton", "slug": "peloton"},
        ]
        
        brands = []
        for brand_data in brands_data:
            brand, created = Brand.objects.get_or_create(
                name=brand_data["name"],
                defaults={"slug": brand_data["slug"]}
            )
            brands.append(brand)
            if created:
                self.stdout.write(f"Created brand: {brand.name}")
        
        return brands

    def create_categories(self):
        """Create product categories and subcategories"""
        categories_data = [
            {
                "name": "Electronics",
                "children": [
                    "Smartphones", "Laptops", "Tablets", "Headphones", "Speakers",
                    "Cameras", "Gaming Consoles", "Smart Watches", "Accessories"
                ]
            },
            {
                "name": "Computers",
                "children": [
                    "Desktop PCs", "Laptops", "Monitors", "Keyboards", "Mice",
                    "Webcams", "Printers", "Storage Devices", "Networking"
                ]
            },
            {
                "name": "Fashion",
                "children": [
                    "Men's Clothing", "Women's Clothing", "Shoes", "Bags",
                    "Jewelry", "Watches", "Sunglasses", "Accessories"
                ]
            },
            {
                "name": "Home & Garden",
                "children": [
                    "Furniture", "Kitchen Appliances", "Home Decor", "Garden Tools",
                    "Lighting", "Bedding", "Bathroom", "Storage"
                ]
            },
            {
                "name": "Sports & Outdoors",
                "children": [
                    "Fitness Equipment", "Outdoor Gear", "Sports Clothing",
                    "Team Sports", "Water Sports", "Winter Sports", "Camping"
                ]
            },
            {
                "name": "Books & Media",
                "children": [
                    "Books", "Movies", "Music", "Video Games", "Magazines",
                    "Educational Materials", "Audiobooks", "E-books"
                ]
            }
        ]
        
        categories = []
        for cat_data in categories_data:
            # Create parent category
            parent, created = Category.objects.get_or_create(
                name=cat_data["name"],
                parent=None
            )
            categories.append(parent)
            if created:
                self.stdout.write(f"Created category: {parent.name}")
            
            # Create subcategories
            for child_name in cat_data["children"]:
                child, created = Category.objects.get_or_create(
                    name=child_name,
                    parent=parent
                )
                categories.append(child)
                if created:
                    self.stdout.write(f"Created subcategory: {parent.name} / {child.name}")
        
        return categories

    def create_products(self, brands, categories, anime_path):
        """Create products with detailed information"""
        products_data = [
            # Electronics - Smartphones
            {
                "name": "iPhone 15 Pro Max",
                "description": "The most advanced iPhone with titanium design, A17 Pro chip, and professional camera system.",
                "price": Decimal("1199.99"),
                "discount_rate": Decimal("5.00"),
                "stock": 50,
                "brand": "Apple",
                "category": "Smartphones",
                "isNew": True,
                "is_top_selling": True,
                "technical_specs": {
                    "display": "6.7-inch Super Retina XDR",
                    "processor": "A17 Pro chip",
                    "storage": "256GB",
                    "camera": "48MP Main, 12MP Ultra Wide, 12MP Telephoto",
                    "battery": "Up to 29 hours video playback",
                    "colors": ["Natural Titanium", "Blue Titanium", "White Titanium", "Black Titanium"]
                }
            },
            {
                "name": "Samsung Galaxy S24 Ultra",
                "description": "Premium Android smartphone with S Pen, advanced AI features, and professional-grade camera.",
                "price": Decimal("1299.99"),
                "discount_rate": Decimal("8.00"),
                "stock": 45,
                "brand": "Samsung",
                "category": "Smartphones",
                "isNew": True,
                "is_top_selling": True,
                "technical_specs": {
                    "display": "6.8-inch Dynamic AMOLED 2X",
                    "processor": "Snapdragon 8 Gen 3",
                    "storage": "512GB",
                    "camera": "200MP Main, 50MP Periscope, 12MP Ultra Wide",
                    "battery": "5000mAh",
                    "colors": ["Titanium Black", "Titanium Gray", "Titanium Violet", "Titanium Yellow"]
                }
            },
            {
                "name": "Sony WH-1000XM5",
                "description": "Industry-leading noise canceling headphones with exceptional sound quality and comfort.",
                "price": Decimal("399.99"),
                "discount_rate": Decimal("10.00"),
                "stock": 30,
                "brand": "Sony",
                "category": "Headphones",
                "isNew": False,
                "is_top_selling": True,
                "technical_specs": {
                    "driver": "30mm dynamic drivers",
                    "frequency_response": "4Hz-40kHz",
                    "battery": "30 hours with ANC",
                    "connectivity": "Bluetooth 5.2, NFC, 3.5mm jack",
                    "weight": "250g",
                    "colors": ["Black", "Silver"]
                }
            },
            # Computers - Laptops
            {
                "name": "MacBook Pro 16-inch M3 Max",
                "description": "Professional laptop with M3 Max chip, Liquid Retina XDR display, and all-day battery life.",
                "price": Decimal("2499.99"),
                "discount_rate": Decimal("3.00"),
                "stock": 25,
                "brand": "Apple",
                "category": "Laptops",
                "isNew": True,
                "is_top_selling": False,
                "technical_specs": {
                    "processor": "Apple M3 Max",
                    "memory": "36GB unified memory",
                    "storage": "1TB SSD",
                    "display": "16.2-inch Liquid Retina XDR",
                    "battery": "Up to 22 hours",
                    "ports": "3x Thunderbolt 4, HDMI, SDXC, MagSafe 3"
                }
            },
            {
                "name": "Dell XPS 15",
                "description": "Premium Windows laptop with stunning 4K display and powerful Intel Core i7 processor.",
                "price": Decimal("1899.99"),
                "discount_rate": Decimal("12.00"),
                "stock": 35,
                "brand": "Dell",
                "category": "Laptops",
                "isNew": False,
                "is_top_selling": True,
                "technical_specs": {
                    "processor": "Intel Core i7-13700H",
                    "memory": "32GB DDR5",
                    "storage": "1TB NVMe SSD",
                    "display": "15.6-inch 4K OLED",
                    "graphics": "NVIDIA GeForce RTX 4060",
                    "battery": "86Wh"
                }
            },
            # Fashion - Shoes
            {
                "name": "Nike Air Jordan 1 Retro High",
                "description": "Classic basketball-inspired sneaker with premium leather construction and iconic design.",
                "price": Decimal("170.00"),
                "discount_rate": Decimal("15.00"),
                "stock": 100,
                "brand": "Nike",
                "category": "Shoes",
                "isNew": False,
                "is_top_selling": True,
                "technical_specs": {
                    "material": "Premium leather upper",
                    "sole": "Rubber outsole",
                    "closure": "Lace-up",
                    "style": "High-top",
                    "colors": ["Black/White", "Red/White", "Blue/White"],
                    "sizes": "7-13"
                }
            },
            {
                "name": "Adidas Ultraboost 22",
                "description": "Running shoe with responsive Boost midsole and Primeknit upper for ultimate comfort.",
                "price": Decimal("190.00"),
                "discount_rate": Decimal("20.00"),
                "stock": 80,
                "brand": "Adidas",
                "category": "Shoes",
                "isNew": True,
                "is_top_selling": False,
                "technical_specs": {
                    "midsole": "Boost technology",
                    "upper": "Primeknit material",
                    "outsole": "Continental rubber",
                    "weight": "310g (size 9)",
                    "drop": "10mm",
                    "colors": ["Core Black", "Cloud White", "Solar Red"]
                }
            },
            # Home & Garden - Kitchen Appliances
            {
                "name": "KitchenAid Stand Mixer",
                "description": "Professional-grade stand mixer with 5-quart stainless steel bowl and multiple attachments.",
                "price": Decimal("399.99"),
                "discount_rate": Decimal("25.00"),
                "stock": 20,
                "brand": "KitchenAid",
                "category": "Kitchen Appliances",
                "isNew": False,
                "is_top_selling": True,
                "technical_specs": {
                    "capacity": "5-quart stainless steel bowl",
                    "power": "300W motor",
                    "attachments": "Dough hook, flat beater, wire whip",
                    "colors": ["Empire Red", "Pearl Chrome", "Onyx Black"],
                    "dimensions": "14.5 x 8.5 x 10.5 inches",
                    "weight": "25 lbs"
                }
            },
            # Sports & Outdoors - Fitness Equipment
            {
                "name": "Peloton Bike+",
                "description": "Premium indoor cycling bike with 24-inch rotating touchscreen and live classes.",
                "price": Decimal("2495.00"),
                "discount_rate": Decimal("5.00"),
                "stock": 15,
                "brand": "Peloton",
                "category": "Fitness Equipment",
                "isNew": True,
                "is_top_selling": False,
                "technical_specs": {
                    "display": "24-inch HD rotating touchscreen",
                    "resistance": "100 levels of resistance",
                    "connectivity": "WiFi, Bluetooth",
                    "dimensions": "59 x 22 x 53 inches",
                    "weight_capacity": "297 lbs",
                    "colors": ["Black", "White"]
                }
            },
            # Books & Media - Video Games
            {
                "name": "PlayStation 5 Console",
                "description": "Next-generation gaming console with ultra-high-speed SSD and immersive 3D audio.",
                "price": Decimal("499.99"),
                "discount_rate": Decimal("0.00"),
                "stock": 10,
                "brand": "Sony",
                "category": "Gaming Consoles",
                "isNew": False,
                "is_top_selling": True,
                "technical_specs": {
                    "cpu": "AMD Zen 2-based CPU",
                    "gpu": "AMD RDNA 2-based GPU",
                    "memory": "16GB GDDR6",
                    "storage": "825GB SSD",
                    "optical_drive": "4K UHD Blu-ray",
                    "connectivity": "WiFi 6, Bluetooth 5.1"
                }
            }
        ]
        
        products = []
        
        for product_data in products_data:
            # Find brand and category
            brand = next((b for b in brands if b.name == product_data["brand"]), None)
            category = next((c for c in categories if c.name == product_data["category"]), None)
            
            if not brand or not category:
                self.stdout.write(f"  Skipping product {product_data['name']} - brand or category not found")
                continue
            
            # Create product
            product, created = Product.objects.get_or_create(
                name=product_data["name"],
                defaults={
                    "description": product_data["description"],
                    "price": product_data["price"],
                    "discount_rate": product_data["discount_rate"],
                    "stock": product_data["stock"],
                    "brand": brand,
                    "category": category,
                    "isNew": product_data["isNew"],
                    "is_top_selling": product_data["is_top_selling"],
                    "technical_specs": product_data["technical_specs"]
                }
            )
            
            if created:
                self.stdout.write(f" Created product: {product.name}")
                
                # Add product image using anime.jpg
                if anime_path and os.path.exists(anime_path):
                    with open(anime_path, 'rb') as f:
                        product_image = ProductImage.objects.create(product=product)
                        product_image.image.save('anime.jpg', File(f), save=True)
                        self.stdout.write(f"   Added image to {product.name}")
            
            products.append(product)
        
        return products

    def create_service_categories(self):
        """Create service categories"""
        service_categories_data = [
            {
                "name": "Technical Support",
                "description": "Professional technical assistance and troubleshooting services",
                "ordering": 1
            },
            {
                "name": "Installation & Setup",
                "description": "Product installation, configuration, and setup services",
                "ordering": 2
            },
            {
                "name": "Repair & Maintenance",
                "description": "Device repair, maintenance, and upgrade services",
                "ordering": 3
            },
            {
                "name": "Consulting Services",
                "description": "Expert consultation for technology decisions and implementations",
                "ordering": 4
            },
            {
                "name": "Training & Education",
                "description": "Training programs and educational workshops",
                "ordering": 5
            }
        ]
        
        service_categories = []
        for cat_data in service_categories_data:
            category, created = ServiceCategory.objects.get_or_create(
                name=cat_data["name"],
                defaults={
                    "description": cat_data["description"],
                    "ordering": cat_data["ordering"]
                }
            )
            service_categories.append(category)
            if created:
                self.stdout.write(f" Created service category: {category.name}")
        
        # Ensure at least one subcategory exists under Consulting Services
        consulting_parent = next((c for c in service_categories if c.name == "Consulting Services"), None)
        if consulting_parent:
            subcat_name = "Data & Analytics"
            subcat, created = ServiceCategory.objects.get_or_create(
                name=subcat_name,
                parent=consulting_parent,
                defaults={
                    "description": "Consulting for data, BI and analytics",
                    "ordering": consulting_parent.ordering + 1
                }
            )
            if created:
                self.stdout.write(f" Created service subcategory: {consulting_parent.name} / {subcat.name}")
            # Include subcategory in the returned list so services can attach to it
            service_categories.append(subcat)
        
        return service_categories

    def create_services(self, service_categories, anime_path, german_path):
        """Create services with detailed information"""
        services_data = [
            {
                "name": "Computer Repair & Diagnostics",
                "description": "Professional computer repair services including hardware diagnostics, virus removal, and system optimization.",
                "price": Decimal("89.99"),
                "category": "Repair & Maintenance",
                "rating": Decimal("4.8"),
                "review_count": 156,
                "overview": "Our expert technicians provide comprehensive computer repair services. We diagnose and fix hardware issues, remove malware, optimize system performance, and ensure your computer runs smoothly.",
                "included_features": [
                    "Hardware diagnostics and testing",
                    "Virus and malware removal",
                    "System optimization and cleanup",
                    "Driver updates and installation",
                    "Data recovery assistance",
                    "Performance tuning"
                ],
                "process_steps": [
                    {"step": "Initial Assessment", "duration": "15 minutes"},
                    {"step": "Diagnostic Testing", "duration": "30 minutes"},
                    {"step": "Repair Implementation", "duration": "1-2 hours"},
                    {"step": "Quality Testing", "duration": "15 minutes"},
                    {"step": "Final Delivery", "duration": "10 minutes"}
                ],
                "key_features": [
                    "Same-day service available",
                    "Free diagnostic assessment",
                    "90-day warranty on repairs",
                    "Expert certified technicians",
                    "Transparent pricing"
                ],
                "contact_info": {
                    "phone": "+1-555-0123",
                    "email": "repair@sppix.com"
                },
                "availability": "Monday-Friday: 9AM-6PM, Saturday: 10AM-4PM"
            },
            {
                "name": "Smartphone Screen Replacement",
                "description": "Professional smartphone screen replacement service with genuine parts and warranty.",
                "price": Decimal("129.99"),
                "category": "Repair & Maintenance",
                "rating": Decimal("4.9"),
                "review_count": 89,
                "overview": "Get your smartphone screen replaced by our certified technicians using genuine parts. We support all major brands including iPhone, Samsung, Google Pixel, and more.",
                "included_features": [
                    "Genuine OEM parts",
                    "Professional installation",
                    "Screen calibration",
                    "Touch sensitivity testing",
                    "Water resistance testing",
                    "6-month warranty"
                ],
                "process_steps": [
                    {"step": "Device Assessment", "duration": "10 minutes"},
                    {"step": "Screen Removal", "duration": "20 minutes"},
                    {"step": "New Screen Installation", "duration": "30 minutes"},
                    {"step": "Testing & Calibration", "duration": "15 minutes"}
                ],
                "key_features": [
                    "Same-day service",
                    "Genuine parts guarantee",
                    "6-month warranty",
                    "All major brands supported",
                    "Professional installation"
                ],
                "contact_info": {
                    "phone": "+1-555-0124",
                    "email": "screen@sppix.com"
                },
                "availability": "Monday-Sunday: 9AM-8PM"
            },
            {
                "name": "Home Network Setup",
                "description": "Complete home network installation and configuration for optimal internet connectivity.",
                "price": Decimal("199.99"),
                "category": "Installation & Setup",
                "rating": Decimal("4.7"),
                "review_count": 67,
                "overview": "Our network specialists will set up your home network infrastructure, configure routers, extenders, and ensure optimal coverage throughout your home.",
                "included_features": [
                    "Router installation and configuration",
                    "WiFi extender setup",
                    "Network security configuration",
                    "Device connectivity testing",
                    "Speed optimization",
                    "Network documentation"
                ],
                "process_steps": [
                    {"step": "Site Survey", "duration": "30 minutes"},
                    {"step": "Equipment Installation", "duration": "1 hour"},
                    {"step": "Network Configuration", "duration": "45 minutes"},
                    {"step": "Testing & Optimization", "duration": "30 minutes"}
                ],
                "key_features": [
                    "Custom network design",
                    "Professional installation",
                    "Security optimization",
                    "Performance tuning",
                    "Ongoing support"
                ],
                "contact_info": {
                    "phone": "+1-555-0125",
                    "email": "network@sppix.com"
                },
                "availability": "Monday-Friday: 8AM-6PM"
            },
            {
                "name": "Smart Home Installation",
                "description": "Complete smart home setup including smart lights, thermostats, security systems, and voice assistants.",
                "price": Decimal("399.99"),
                "category": "Installation & Setup",
                "rating": Decimal("4.6"),
                "review_count": 43,
                "overview": "Transform your home into a smart home with our comprehensive installation service. We'll set up smart devices, create automation routines, and ensure everything works seamlessly together.",
                "included_features": [
                    "Smart device installation",
                    "Hub configuration",
                    "Automation setup",
                    "Voice assistant integration",
                    "Mobile app configuration",
                    "User training"
                ],
                "process_steps": [
                    {"step": "Home Assessment", "duration": "45 minutes"},
                    {"step": "Device Installation", "duration": "2-3 hours"},
                    {"step": "System Configuration", "duration": "1 hour"},
                    {"step": "Testing & Training", "duration": "30 minutes"}
                ],
                "key_features": [
                    "Custom smart home design",
                    "Professional installation",
                    "Integration with existing systems",
                    "User training included",
                    "Ongoing support"
                ],
                "contact_info": {
                    "phone": "+1-555-0126",
                    "email": "smarthome@sppix.com"
                },
                "availability": "Monday-Friday: 9AM-5PM"
            },
            {
                "name": "IT Consulting Services",
                "description": "Expert IT consulting for businesses looking to optimize their technology infrastructure.",
                "price": Decimal("150.00"),
                "category": "Consulting Services",
                "rating": Decimal("4.8"),
                "review_count": 34,
                "overview": "Our certified IT consultants provide strategic technology guidance to help businesses optimize their IT infrastructure, improve security, and enhance productivity.",
                "included_features": [
                    "IT infrastructure assessment",
                    "Security audit and recommendations",
                    "Technology roadmap development",
                    "Cost optimization analysis",
                    "Implementation planning",
                    "Ongoing consultation"
                ],
                "process_steps": [
                    {"step": "Initial Consultation", "duration": "1 hour"},
                    {"step": "Infrastructure Assessment", "duration": "2-4 hours"},
                    {"step": "Report Generation", "duration": "2 hours"},
                    {"step": "Recommendation Presentation", "duration": "1 hour"}
                ],
                "key_features": [
                    "Certified consultants",
                    "Comprehensive assessment",
                    "Custom recommendations",
                    "Implementation support",
                    "ROI analysis"
                ],
                "contact_info": {
                    "phone": "+1-555-0127",
                    "email": "consulting@sppix.com"
                },
                "availability": "Monday-Friday: 9AM-6PM"
            }
        ]
        
        services = []
        
        # Duplicate a specific subcategory with variants to ensure at least 10 services in one subcategory
        # Place all consulting variants under a real subcategory under Consulting Services
        base_subcategory = "Data & Analytics"
        consulting_variants = [
            {"name": "Data Analytics Consulting", "price": Decimal("500.00")},
            {"name": "Cloud Migration Consulting", "price": Decimal("650.00")},
            {"name": "Cybersecurity Assessment", "price": Decimal("700.00")},
            {"name": "DevOps Transformation", "price": Decimal("600.00")},
            {"name": "AI/ML Strategy", "price": Decimal("900.00")},
            {"name": "ERP Implementation Advisory", "price": Decimal("1200.00")},
            {"name": "CRM Optimization", "price": Decimal("800.00")},
            {"name": "Data Governance Setup", "price": Decimal("750.00")},
            {"name": "IT Compliance & Audit", "price": Decimal("650.00")},
            {"name": "Business Intelligence Dashboards", "price": Decimal("550.00")},
        ]

        standard_overview = "Detailed service overview and description..."
        standard_description = "Describe your service in detail..."
        standard_included = [
            "Data collection and integration setup",
            "Custom dashboard development",
            "Predictive analytics models",
        ]
        standard_process = [
            {"step": "Data Discovery", "duration": "3-5 days", "description": "Identify data sources and business requirements"},
            {"step": "Data Integration", "duration": "1 week", "description": "Set up data pipelines and integration systems"},
        ]
        standard_keys = [
            "Data Visualization",
            "Predictive Analytics",
            "Custom Dashboards",
            "Real-time Reports",
        ]

        for variant in consulting_variants:
            services_data.append({
                "name": variant["name"],
                "description": standard_description,
                "price": variant["price"],
                "category": base_subcategory,
                "rating": Decimal("4.7"),
                "review_count": 0,
                "overview": standard_overview,
                "included_features": standard_included,
                "process_steps": standard_process,
                "key_features": standard_keys,
                "contact_info": {"phone": "+1 (555) 123-4567", "email": "support@example.com"},
                "availability": "Available 24/7, Monday to Friday, etc."
            })

        for service_data in services_data:
            # Find service category
            category = next((c for c in service_categories if c.name == service_data["category"]), None)
            
            if not category:
                self.stdout.write(f"  Skipping service {service_data['name']} - category not found")
                continue
            
            # Create service
            service, created = Service.objects.get_or_create(
                name=service_data["name"],
                defaults={
                    "description": service_data["description"],
                    "price": service_data["price"],
                    "category": category,
                    "rating": service_data["rating"],
                    "review_count": service_data["review_count"],
                    "overview": service_data["overview"],
                    "included_features": service_data["included_features"],
                    "process_steps": service_data["process_steps"],
                    "key_features": service_data["key_features"],
                    "contact_info": service_data["contact_info"],
                    "availability": service_data["availability"]
                }
            )
            
            if created:
                self.stdout.write(f" Created service: {service.name}")
                
                # Add service image using German.png if available, else fallback to anime.jpg
                if german_path and os.path.exists(german_path):
                    with open(german_path, 'rb') as f:
                        service_image = ServiceImage.objects.create(service=service)
                        service_image.image.save('German.png', File(f), save=True)
                        self.stdout.write(f"   Added German.png image to {service.name}")
                elif anime_path and os.path.exists(anime_path):
                    with open(anime_path, 'rb') as f:
                        service_image = ServiceImage.objects.create(service=service)
                        service_image.image.save('anime.jpg', File(f), save=True)
                        self.stdout.write(f"   Added image to {service.name}")
            
            services.append(service)
        
        return services

    def create_reviews(self, products, services):
        """Create sample reviews for products and services"""
        # Sample review data
        product_reviews_data = [
            {"product": "iPhone 15 Pro Max", "author": "John Smith", "rating": 5, "comment": "Amazing phone! The camera quality is outstanding and the battery life is incredible."},
            {"product": "iPhone 15 Pro Max", "author": "Sarah Johnson", "rating": 4, "comment": "Great phone overall, but the price is quite high. Still worth it for the features."},
            {"product": "Samsung Galaxy S24 Ultra", "author": "Mike Chen", "rating": 5, "comment": "The S Pen is fantastic and the camera zoom is unbelievable. Highly recommended!"},
            {"product": "Sony WH-1000XM5", "author": "Emily Davis", "rating": 5, "comment": "Best noise-canceling headphones I've ever used. Sound quality is exceptional."},
            {"product": "MacBook Pro 16-inch M3 Max", "author": "David Wilson", "rating": 5, "comment": "Incredible performance for video editing. The M3 Max chip is a game-changer."},
            {"product": "Nike Air Jordan 1 Retro High", "author": "Alex Rodriguez", "rating": 4, "comment": "Classic design and great quality. Very comfortable for daily wear."},
            {"product": "PlayStation 5 Console", "author": "Chris Brown", "rating": 5, "comment": "Next-gen gaming at its finest. The SSD makes loading times almost non-existent."}
        ]
        
        service_reviews_data = [
            {"service": "Computer Repair & Diagnostics", "author": "Lisa Anderson", "rating": 5, "comment": "Excellent service! Fixed my laptop quickly and professionally."},
            {"service": "Smartphone Screen Replacement", "author": "Tom Wilson", "rating": 5, "comment": "Fast and professional screen replacement. My phone looks brand new!"},
            {"service": "Home Network Setup", "author": "Jennifer Lee", "rating": 4, "comment": "Great network setup service. WiFi coverage is now perfect throughout the house."},
            {"service": "Smart Home Installation", "author": "Robert Taylor", "rating": 5, "comment": "Amazing smart home setup. Everything works seamlessly together."},
            {"service": "IT Consulting Services", "author": "Maria Garcia", "rating": 5, "comment": "Professional IT consulting that helped optimize our business technology."}
        ]
        
        # Create product reviews
        for review_data in product_reviews_data:
            product = next((p for p in products if p.name == review_data["product"]), None)
            if product:
                review, created = Review.objects.get_or_create(
                    product=product,
                    author_name=review_data["author"],
                    defaults={
                        "rating": review_data["rating"],
                        "comment": review_data["comment"]
                    }
                )
                if created:
                    self.stdout.write(f" Created review for {product.name} by {review_data['author']}")
        
        # Create service reviews
        for review_data in service_reviews_data:
            service = next((s for s in services if s.name == review_data["service"]), None)
            if service:
                review, created = ServiceReview.objects.get_or_create(
                    service=service,
                    author_name=review_data["author"],
                    defaults={
                        "rating": review_data["rating"],
                        "comment": review_data["comment"],
                        "service_quality": review_data["rating"],
                        "communication": review_data["rating"],
                        "timeliness": review_data["rating"],
                        "value_for_money": review_data["rating"]
                    }
                )
                if created:
                    self.stdout.write(f" Created service review for {service.name} by {review_data['author']}")

    def create_store_settings(self, anime_path):
        """Create store settings and website content"""
        
        # Create StoreSettings
        store_settings, created = StoreSettings.objects.get_or_create(
            store_name="sppix",
            defaults={
                "currency": "USD",
                "tax_rate": Decimal("8.5"),
                "shipping_rate": Decimal("9.99"),
                "street_address": "123 Tech Street",
                "city": "San Francisco",
                "postcode": "94105",
                "country": "United States",
                "phone": "+1-555-0123",
                "email": "info@sppix.com",
                "monday_friday_hours": "9:00 AM - 6:00 PM",
                "saturday_hours": "10:00 AM - 4:00 PM",
                "sunday_hours": "Closed"
            }
        )
        
        if created:
            self.stdout.write(" Created store settings")
            
            # Add store logo using anime.jpg
            if anime_path and os.path.exists(anime_path):
                with open(anime_path, 'rb') as f:
                    store_settings.store_logo.save('anime.jpg', File(f), save=True)
                    self.stdout.write("   Added store logo")
        
        # Create WebsiteContent
        website_content, created = WebsiteContent.objects.get_or_create(
            id=1,
            defaults={
                "banner1_text": "Welcome to sppix - Your Tech Destination",
                "banner1_link": "/products",
                "banner2_text": "New Arrivals - Latest Technology",
                "banner2_link": "/products?new=true",
                "banner3_text": "Top Selling Products",
                "banner3_link": "/products?top_selling=true",
                "deal1_title": "Summer Sale",
                "deal1_subtitle": "Up to 50% Off Electronics",
                "deal1_discount": "Up to 50% Off",
                "deal1_description": "Don't miss our biggest sale of the year! Get amazing discounts on all electronics.",
                "deal1_end_date": datetime.now() + timedelta(days=30),
                "deal2_title": "Back to School",
                "deal2_subtitle": "Student Discounts Available",
                "deal2_discount": "20% Off",
                "deal2_description": "Special discounts for students on laptops, tablets, and accessories.",
                "deal2_end_date": datetime.now() + timedelta(days=45),
                "street_address": "123 Tech Street",
                "city": "San Francisco",
                "postcode": "94105",
                "country": "United States",
                "phone": "+1-555-0123",
                "email": "info@sppix.com"
            }
        )
        
        if created:
            self.stdout.write(" Created website content")
            
            # Add images using anime.jpg
            if anime_path and os.path.exists(anime_path):
                with open(anime_path, 'rb') as f:
                    website_content.logo.save('anime.jpg', File(f), save=True)
                    website_content.banner1_image.save('anime.jpg', File(f), save=True)
                    website_content.banner2_image.save('anime.jpg', File(f), save=True)
                    website_content.banner3_image.save('anime.jpg', File(f), save=True)
                    website_content.deal1_image.save('anime.jpg', File(f), save=True)
                    website_content.deal2_image.save('anime.jpg', File(f), save=True)
                    self.stdout.write("   Added website content images")

    def handle(self, *args, **options):
        self.stdout.write("Starting database seeding...")
        
        anime_path = self.copy_anime_image(options['anime_image'])
        german_path = self.copy_german_image(options['german_image'])
        
        try:
            # Create brands
            self.stdout.write("\nCreating brands...")
            brands = self.create_brands()
            
            # Create categories
            self.stdout.write("\nCreating categories...")
            categories = self.create_categories()
            
            # Create products
            self.stdout.write("\nCreating products...")
            products = self.create_products(brands, categories, anime_path)
            
            # Create service categories
            self.stdout.write("\nCreating service categories...")
            service_categories = self.create_service_categories()
            
            # Create services
            self.stdout.write("\nCreating services...")
            services = self.create_services(service_categories, anime_path, german_path)
            
            # Create reviews
            self.stdout.write("\nCreating reviews...")
            self.create_reviews(products, services)
            
            # Create store settings and website content
            self.stdout.write("\nCreating store settings...")
            self.create_store_settings(anime_path)
            
            self.stdout.write(self.style.SUCCESS("\nDatabase seeding completed successfully!"))
            self.stdout.write(f"Summary:")
            self.stdout.write(f"  - Brands: {len(brands)}")
            self.stdout.write(f"  - Categories: {len(categories)}")
            self.stdout.write(f"  - Products: {len(products)}")
            self.stdout.write(f"  - Service Categories: {len(service_categories)}")
            self.stdout.write(f"  - Services: {len(services)}")
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"❌ Error seeding database: {e}"))
            raise
