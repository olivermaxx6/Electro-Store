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
            {"name": "Google", "slug": "google"},
            {"name": "ASUS", "slug": "asus"},
            {"name": "Ninja", "slug": "ninja"},
            {"name": "Bowflex", "slug": "bowflex"},
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
        """Create comprehensive product categories with subcategories and grandchild categories"""
        categories_data = [
            {
                "name": "Electronics",
                "slogan": "Cutting-edge technology for modern living",
                "children": [
                    {
                        "name": "Smartphones",
                        "children": ["iPhone", "Samsung Galaxy", "Google Pixel", "OnePlus", "Xiaomi"]
                    },
                    {
                        "name": "Laptops",
                        "children": ["MacBook", "Windows Laptops", "Gaming Laptops", "Ultrabooks", "Chromebooks"]
                    },
                    {
                        "name": "Tablets",
                        "children": ["iPad", "Android Tablets", "Windows Tablets", "E-readers"]
                    },
                    {
                        "name": "Headphones",
                        "children": ["Wireless Headphones", "Wired Headphones", "Gaming Headsets", "Earbuds"]
                    },
                    {
                        "name": "Speakers",
                        "children": ["Bluetooth Speakers", "Smart Speakers", "Home Theater", "Portable Speakers"]
                    },
                    {
                        "name": "Cameras",
                        "children": ["DSLR Cameras", "Mirrorless Cameras", "Action Cameras", "Instant Cameras"]
                    },
                    {
                        "name": "Gaming Consoles",
                        "children": ["PlayStation", "Xbox", "Nintendo Switch", "Gaming Accessories"]
                    },
                    {
                        "name": "Smart Watches",
                        "children": ["Apple Watch", "Samsung Galaxy Watch", "Fitness Trackers", "Smart Bands"]
                    },
                    {
                        "name": "Accessories",
                        "children": ["Phone Cases", "Chargers", "Cables", "Screen Protectors"]
                    }
                ]
            },
            {
                "name": "Computers",
                "slogan": "Powerful computing solutions for work and play",
                "children": [
                    {
                        "name": "Desktop PCs",
                        "children": ["Gaming PCs", "Workstations", "All-in-One PCs", "Mini PCs"]
                    },
                    {
                        "name": "Laptops",
                        "children": ["Business Laptops", "Gaming Laptops", "Student Laptops", "Convertible Laptops"]
                    },
                    {
                        "name": "Monitors",
                        "children": ["4K Monitors", "Gaming Monitors", "Ultrawide Monitors", "Touchscreen Monitors"]
                    },
                    {
                        "name": "Keyboards",
                        "children": ["Mechanical Keyboards", "Wireless Keyboards", "Gaming Keyboards", "Ergonomic Keyboards"]
                    },
                    {
                        "name": "Mice",
                        "children": ["Gaming Mice", "Wireless Mice", "Ergonomic Mice", "Trackballs"]
                    },
                    {
                        "name": "Webcams",
                        "children": ["HD Webcams", "4K Webcams", "Streaming Cameras", "Conference Cameras"]
                    },
                    {
                        "name": "Printers",
                        "children": ["Inkjet Printers", "Laser Printers", "3D Printers", "Photo Printers"]
                    },
                    {
                        "name": "Storage Devices",
                        "children": ["External Hard Drives", "SSDs", "USB Drives", "Memory Cards"]
                    },
                    {
                        "name": "Networking",
                        "children": ["Routers", "WiFi Extenders", "Network Switches", "Modems"]
                    }
                ]
            },
            {
                "name": "Fashion",
                "slogan": "Style meets comfort in every piece",
                "children": [
                    {
                        "name": "Men's Clothing",
                        "children": ["Shirts", "T-Shirts", "Jeans", "Suits", "Jackets"]
                    },
                    {
                        "name": "Women's Clothing",
                        "children": ["Dresses", "Tops", "Jeans", "Skirts", "Blouses"]
                    },
                    {
                        "name": "Shoes",
                        "children": ["Sneakers", "Boots", "Dress Shoes", "Sandals", "Athletic Shoes"]
                    },
                    {
                        "name": "Bags",
                        "children": ["Handbags", "Backpacks", "Laptop Bags", "Travel Bags", "Wallets"]
                    },
                    {
                        "name": "Jewelry",
                        "children": ["Necklaces", "Earrings", "Rings", "Bracelets", "Watches"]
                    },
                    {
                        "name": "Watches",
                        "children": ["Digital Watches", "Analog Watches", "Smart Watches", "Luxury Watches"]
                    },
                    {
                        "name": "Sunglasses",
                        "children": ["Aviator Sunglasses", "Wayfarer Sunglasses", "Sport Sunglasses", "Designer Sunglasses"]
                    },
                    {
                        "name": "Accessories",
                        "children": ["Belts", "Hats", "Scarves", "Gloves", "Phone Accessories"]
                    }
                ]
            },
            {
                "name": "Home & Garden",
                "slogan": "Transform your space into a haven",
                "children": [
                    {
                        "name": "Furniture",
                        "children": ["Living Room", "Bedroom", "Dining Room", "Office Furniture", "Outdoor Furniture"]
                    },
                    {
                        "name": "Kitchen Appliances",
                        "children": ["Refrigerators", "Microwaves", "Coffee Makers", "Blenders", "Toasters"]
                    },
                    {
                        "name": "Home Decor",
                        "children": ["Wall Art", "Candles", "Vases", "Mirrors", "Clocks"]
                    },
                    {
                        "name": "Garden Tools",
                        "children": ["Lawn Mowers", "Garden Hoses", "Planters", "Garden Tools", "Outdoor Lighting"]
                    },
                    {
                        "name": "Lighting",
                        "children": ["Ceiling Lights", "Table Lamps", "Floor Lamps", "LED Strips", "Outdoor Lighting"]
                    },
                    {
                        "name": "Bedding",
                        "children": ["Bed Sheets", "Pillows", "Comforters", "Mattress Toppers", "Blankets"]
                    },
                    {
                        "name": "Bathroom",
                        "children": ["Towels", "Bath Mats", "Shower Curtains", "Bathroom Accessories", "Toiletries"]
                    },
                    {
                        "name": "Storage",
                        "children": ["Storage Boxes", "Shelving Units", "Closet Organizers", "Kitchen Storage", "Garage Storage"]
                    }
                ]
            },
            {
                "name": "Sports & Outdoors",
                "slogan": "Gear up for your next adventure",
                "children": [
                    {
                        "name": "Fitness Equipment",
                        "children": ["Treadmills", "Exercise Bikes", "Weights", "Yoga Mats", "Resistance Bands"]
                    },
                    {
                        "name": "Outdoor Gear",
                        "children": ["Hiking Boots", "Backpacks", "Tents", "Sleeping Bags", "Camping Chairs"]
                    },
                    {
                        "name": "Sports Clothing",
                        "children": ["Athletic Wear", "Running Shoes", "Sports Bras", "Compression Wear", "Team Jerseys"]
                    },
                    {
                        "name": "Team Sports",
                        "children": ["Soccer", "Basketball", "Tennis", "Baseball", "Football"]
                    },
                    {
                        "name": "Water Sports",
                        "children": ["Swimming", "Surfing", "Kayaking", "Scuba Diving", "Water Polo"]
                    },
                    {
                        "name": "Winter Sports",
                        "children": ["Skiing", "Snowboarding", "Ice Skating", "Hockey", "Winter Clothing"]
                    },
                    {
                        "name": "Camping",
                        "children": ["Tents", "Sleeping Bags", "Camping Stoves", "Coolers", "Camping Chairs"]
                    }
                ]
            },
            {
                "name": "Books & Media",
                "slogan": "Stories, knowledge, and entertainment await",
                "children": [
                    {
                        "name": "Books",
                        "children": ["Fiction", "Non-Fiction", "Textbooks", "Children's Books", "E-books"]
                    },
                    {
                        "name": "Movies",
                        "children": ["Action Movies", "Comedy Movies", "Drama Movies", "Horror Movies", "Documentaries"]
                    },
                    {
                        "name": "Music",
                        "children": ["CDs", "Vinyl Records", "Digital Music", "Instruments", "Music Accessories"]
                    },
                    {
                        "name": "Video Games",
                        "children": ["Console Games", "PC Games", "Mobile Games", "Gaming Accessories", "Gaming Chairs"]
                    },
                    {
                        "name": "Magazines",
                        "children": ["Fashion Magazines", "Tech Magazines", "Sports Magazines", "News Magazines", "Lifestyle Magazines"]
                    },
                    {
                        "name": "Educational Materials",
                        "children": ["Online Courses", "Textbooks", "Study Guides", "Educational Toys", "Language Learning"]
                    },
                    {
                        "name": "Audiobooks",
                        "children": ["Fiction Audiobooks", "Non-Fiction Audiobooks", "Educational Audiobooks", "Children's Audiobooks"]
                    },
                    {
                        "name": "E-books",
                        "children": ["Kindle Books", "PDF Books", "Interactive Books", "Textbooks", "Comics"]
                    }
                ]
            }
        ]
        
        categories = []
        for cat_data in categories_data:
            # Create parent category
            parent, created = Category.objects.get_or_create(
                name=cat_data["name"],
                parent=None,
                defaults={"slogan": cat_data.get("slogan", "")}
            )
            categories.append(parent)
            if created:
                self.stdout.write(f"Created category: {parent.name}")
            
            # Create subcategories and grandchild categories
            for child_data in cat_data["children"]:
                if isinstance(child_data, dict):
                    # Create subcategory
                    child, created = Category.objects.get_or_create(
                        name=child_data["name"],
                        parent=parent
                    )
                    categories.append(child)
                    if created:
                        self.stdout.write(f"Created subcategory: {parent.name} / {child.name}")
                    
                    # Create grandchild categories
                    for grandchild_name in child_data.get("children", []):
                        grandchild, created = Category.objects.get_or_create(
                            name=grandchild_name,
                            parent=child
                        )
                        categories.append(grandchild)
                        if created:
                            self.stdout.write(f"Created grandchild category: {parent.name} / {child.name} / {grandchild.name}")
                else:
                    # Handle simple string children (backward compatibility)
                    child, created = Category.objects.get_or_create(
                        name=child_data,
                        parent=parent
                    )
                    categories.append(child)
                    if created:
                        self.stdout.write(f"Created subcategory: {parent.name} / {child.name}")
        
        return categories

    def create_products(self, brands, categories, anime_path):
        """Create comprehensive products with detailed information across all categories"""
        products_data = [
            # Electronics - Smartphones
            {
                "name": "iPhone 15 Pro Max",
                "description": "The most advanced iPhone with titanium design, A17 Pro chip, and professional camera system.",
                "price": Decimal("1199.99"),
                "discount_rate": Decimal("5.00"),
                "stock": 50,
                "brand": "Apple",
                "category": "iPhone",
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
                "category": "Samsung Galaxy",
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
                "name": "Google Pixel 8 Pro",
                "description": "AI-powered smartphone with exceptional camera capabilities and Google's latest features.",
                "price": Decimal("999.99"),
                "discount_rate": Decimal("10.00"),
                "stock": 35,
                "brand": "Google",
                "category": "Google Pixel",
                "isNew": True,
                "is_top_selling": False,
                "technical_specs": {
                    "display": "6.7-inch LTPO OLED",
                    "processor": "Google Tensor G3",
                    "storage": "128GB",
                    "camera": "50MP Main, 48MP Ultra Wide, 48MP Telephoto",
                    "battery": "5050mAh",
                    "colors": ["Obsidian", "Porcelain", "Bay"]
                }
            },
            # Electronics - Laptops
            {
                "name": "MacBook Pro 16-inch M3 Max",
                "description": "Professional laptop with M3 Max chip, Liquid Retina XDR display, and all-day battery life.",
                "price": Decimal("2499.99"),
                "discount_rate": Decimal("3.00"),
                "stock": 25,
                "brand": "Apple",
                "category": "MacBook",
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
                "category": "Windows Laptops",
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
            {
                "name": "ASUS ROG Strix G15",
                "description": "High-performance gaming laptop with AMD Ryzen 9 and NVIDIA RTX 4070 graphics.",
                "price": Decimal("1599.99"),
                "discount_rate": Decimal("15.00"),
                "stock": 20,
                "brand": "ASUS",
                "category": "Gaming Laptops",
                "isNew": False,
                "is_top_selling": True,
                "technical_specs": {
                    "processor": "AMD Ryzen 9 7940HS",
                    "memory": "16GB DDR5",
                    "storage": "1TB NVMe SSD",
                    "display": "15.6-inch FHD 165Hz",
                    "graphics": "NVIDIA GeForce RTX 4070",
                    "battery": "90Wh"
                }
            },
            # Electronics - Headphones
            {
                "name": "Sony WH-1000XM5",
                "description": "Industry-leading noise canceling headphones with exceptional sound quality and comfort.",
                "price": Decimal("399.99"),
                "discount_rate": Decimal("10.00"),
                "stock": 30,
                "brand": "Sony",
                "category": "Wireless Headphones",
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
            {
                "name": "Apple AirPods Pro 2nd Gen",
                "description": "Premium wireless earbuds with active noise cancellation and spatial audio.",
                "price": Decimal("249.99"),
                "discount_rate": Decimal("5.00"),
                "stock": 100,
                "brand": "Apple",
                "category": "Earbuds",
                "isNew": True,
                "is_top_selling": True,
                "technical_specs": {
                    "driver": "Custom high-excursion Apple driver",
                    "noise_cancellation": "Active Noise Cancellation",
                    "battery": "6 hours listening time",
                    "connectivity": "Bluetooth 5.3",
                    "case_battery": "30 hours total",
                    "colors": ["White"]
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
                "category": "Sneakers",
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
                "category": "Athletic Shoes",
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
                "category": "Blenders",
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
            {
                "name": "Ninja Food Processor",
                "description": "Powerful food processor with multiple blades and bowls for versatile food preparation.",
                "price": Decimal("199.99"),
                "discount_rate": Decimal("20.00"),
                "stock": 30,
                "brand": "Ninja",
                "category": "Blenders",
                "isNew": True,
                "is_top_selling": False,
                "technical_specs": {
                    "capacity": "8-cup processing bowl",
                    "power": "1000W motor",
                    "blades": "Dough blade, chopping blade, slicing disc",
                    "features": "Auto-iQ technology",
                    "colors": ["Black", "Silver"],
                    "warranty": "1 year"
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
                "category": "Exercise Bikes",
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
            {
                "name": "Bowflex SelectTech 552 Adjustable Dumbbells",
                "description": "Space-saving adjustable dumbbells that replace 15 sets of traditional dumbbells.",
                "price": Decimal("549.99"),
                "discount_rate": Decimal("10.00"),
                "stock": 25,
                "brand": "Bowflex",
                "category": "Weights",
                "isNew": False,
                "is_top_selling": True,
                "technical_specs": {
                    "weight_range": "5-52.5 lbs per dumbbell",
                    "increments": "2.5 lb increments",
                    "space_saved": "Replaces 15 sets",
                    "warranty": "2 years",
                    "dimensions": "15.75 x 8.5 x 9 inches",
                    "colors": ["Black"]
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
                "category": "PlayStation",
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
            },
            {
                "name": "Xbox Series X",
                "description": "Most powerful Xbox console with 4K gaming and backward compatibility.",
                "price": Decimal("499.99"),
                "discount_rate": Decimal("0.00"),
                "stock": 12,
                "brand": "Microsoft",
                "category": "Xbox",
                "isNew": False,
                "is_top_selling": True,
                "technical_specs": {
                    "cpu": "Custom AMD Zen 2 CPU",
                    "gpu": "Custom AMD RDNA 2 GPU",
                    "memory": "16GB GDDR6",
                    "storage": "1TB NVMe SSD",
                    "resolution": "4K at 60fps",
                    "connectivity": "WiFi 6, Bluetooth 5.1"
                }
            },
            # Additional Electronics - Cameras
            {
                "name": "Canon EOS R5",
                "description": "Professional mirrorless camera with 45MP sensor and 8K video recording capabilities.",
                "price": Decimal("3899.99"),
                "discount_rate": Decimal("8.00"),
                "stock": 8,
                "brand": "Canon",
                "category": "Mirrorless Cameras",
                "isNew": False,
                "is_top_selling": False,
                "technical_specs": {
                    "sensor": "45MP Full-Frame CMOS",
                    "video": "8K RAW, 4K 120p",
                    "iso": "100-51200 (expandable to 102400)",
                    "autofocus": "Dual Pixel CMOS AF II",
                    "stabilization": "5-axis in-body stabilization",
                    "connectivity": "WiFi, Bluetooth, USB-C"
                }
            },
            {
                "name": "Sony Alpha A7 IV",
                "description": "Versatile full-frame mirrorless camera with 33MP sensor and advanced autofocus.",
                "price": Decimal("2498.99"),
                "discount_rate": Decimal("5.00"),
                "stock": 15,
                "brand": "Sony",
                "category": "Mirrorless Cameras",
                "isNew": True,
                "is_top_selling": True,
                "technical_specs": {
                    "sensor": "33MP Full-Frame Exmor R CMOS",
                    "video": "4K 60p, 10-bit recording",
                    "iso": "100-51200 (expandable to 204800)",
                    "autofocus": "759-point phase-detection AF",
                    "stabilization": "5-axis in-body stabilization",
                    "battery": "Up to 580 shots"
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
        """Create comprehensive service categories with subcategories"""
        service_categories_data = [
            {
                "name": "Technical Support",
                "description": "Professional technical assistance and troubleshooting services",
                "ordering": 1,
                "children": [
                    {
                        "name": "Hardware Support",
                        "description": "Computer hardware diagnostics and repair",
                        "ordering": 1
                    },
                    {
                        "name": "Software Support",
                        "description": "Software installation, configuration, and troubleshooting",
                        "ordering": 2
                    },
                    {
                        "name": "Network Support",
                        "description": "Network connectivity and configuration assistance",
                        "ordering": 3
                    }
                ]
            },
            {
                "name": "Installation & Setup",
                "description": "Product installation, configuration, and setup services",
                "ordering": 2,
                "children": [
                    {
                        "name": "Home Theater Setup",
                        "description": "Complete home theater system installation and calibration",
                        "ordering": 1
                    },
                    {
                        "name": "Smart Home Installation",
                        "description": "Smart home device installation and automation setup",
                        "ordering": 2
                    },
                    {
                        "name": "Computer Setup",
                        "description": "New computer setup, software installation, and data migration",
                        "ordering": 3
                    },
                    {
                        "name": "Network Installation",
                        "description": "Home and office network infrastructure installation",
                        "ordering": 4
                    }
                ]
            },
            {
                "name": "Repair & Maintenance",
                "description": "Device repair, maintenance, and upgrade services",
                "ordering": 3,
                "children": [
                    {
                        "name": "Computer Repair",
                        "description": "Desktop and laptop repair services",
                        "ordering": 1
                    },
                    {
                        "name": "Mobile Device Repair",
                        "description": "Smartphone and tablet screen replacement and repair",
                        "ordering": 2
                    },
                    {
                        "name": "Appliance Repair",
                        "description": "Home appliance repair and maintenance",
                        "ordering": 3
                    },
                    {
                        "name": "Gaming Console Repair",
                        "description": "Gaming console repair and maintenance services",
                        "ordering": 4
                    }
                ]
            },
            {
                "name": "Consulting Services",
                "description": "Expert consultation for technology decisions and implementations",
                "ordering": 4,
                "children": [
                    {
                        "name": "IT Strategy Consulting",
                        "description": "Business IT strategy and technology roadmap development",
                        "ordering": 1
                    },
                    {
                        "name": "Data & Analytics",
                        "description": "Data analysis, business intelligence, and analytics consulting",
                        "ordering": 2
                    },
                    {
                        "name": "Cybersecurity Consulting",
                        "description": "Security assessment and cybersecurity strategy development",
                        "ordering": 3
                    },
                    {
                        "name": "Cloud Migration",
                        "description": "Cloud infrastructure planning and migration services",
                        "ordering": 4
                    }
                ]
            },
            {
                "name": "Training & Education",
                "description": "Training programs and educational workshops",
                "ordering": 5,
                "children": [
                    {
                        "name": "Software Training",
                        "description": "Microsoft Office, Adobe Creative Suite, and other software training",
                        "ordering": 1
                    },
                    {
                        "name": "Digital Literacy",
                        "description": "Basic computer skills and internet safety training",
                        "ordering": 2
                    },
                    {
                        "name": "Technical Workshops",
                        "description": "Advanced technical workshops and certification preparation",
                        "ordering": 3
                    },
                    {
                        "name": "Online Learning Setup",
                        "description": "Setting up online learning environments and tools",
                        "ordering": 4
                    }
                ]
            }
        ]
        
        service_categories = []
        for cat_data in service_categories_data:
            # Create parent service category
            category, created = ServiceCategory.objects.get_or_create(
                name=cat_data["name"],
                parent=None,
                defaults={
                    "description": cat_data["description"],
                    "ordering": cat_data["ordering"]
                }
            )
            service_categories.append(category)
            if created:
                self.stdout.write(f"Created service category: {category.name}")
            
            # Create subcategories
            for child_data in cat_data.get("children", []):
                subcategory, created = ServiceCategory.objects.get_or_create(
                    name=child_data["name"],
                    parent=category,
                    defaults={
                        "description": child_data["description"],
                        "ordering": child_data["ordering"]
                    }
                )
                service_categories.append(subcategory)
                if created:
                    self.stdout.write(f"Created service subcategory: {category.name} / {subcategory.name}")
        
        return service_categories

    def create_services(self, service_categories, anime_path, german_path):
        """Create comprehensive services with detailed information across all categories"""
        services_data = [
            # Technical Support Services
            {
                "name": "Computer Hardware Diagnostics",
                "description": "Comprehensive hardware testing and diagnostics for desktop and laptop computers.",
                "price": Decimal("79.99"),
                "category": "Hardware Support",
                "rating": Decimal("4.8"),
                "review_count": 156,
                "overview": "Our certified technicians perform thorough hardware diagnostics to identify and resolve computer issues. We test all components including CPU, RAM, storage, graphics, and motherboard.",
                "included_features": [
                    "Complete hardware testing",
                    "Component performance analysis",
                    "Temperature monitoring",
                    "Power supply testing",
                    "Detailed diagnostic report",
                    "Repair recommendations"
                ],
                "process_steps": [
                    {"step": "Initial Assessment", "duration": "15 minutes"},
                    {"step": "Hardware Testing", "duration": "45 minutes"},
                    {"step": "Performance Analysis", "duration": "30 minutes"},
                    {"step": "Report Generation", "duration": "15 minutes"}
                ],
                "key_features": [
                    "Certified technicians",
                    "Advanced diagnostic tools",
                    "Same-day service",
                    "Detailed reports",
                    "Repair recommendations"
                ],
                "contact_info": {
                    "phone": "+1-555-0123",
                    "email": "hardware@sppix.com"
                },
                "availability": "Monday-Friday: 9AM-6PM, Saturday: 10AM-4PM"
            },
            {
                "name": "Software Installation & Configuration",
                "description": "Professional software installation, configuration, and optimization services.",
                "price": Decimal("59.99"),
                "category": "Software Support",
                "rating": Decimal("4.7"),
                "review_count": 89,
                "overview": "Expert software installation and configuration services for all major software applications. We ensure optimal performance and proper integration with your existing system.",
                "included_features": [
                    "Software installation",
                    "Configuration optimization",
                    "License activation",
                    "Integration setup",
                    "Performance tuning",
                    "User training"
                ],
                "process_steps": [
                    {"step": "Software Selection", "duration": "20 minutes"},
                    {"step": "Installation Process", "duration": "30 minutes"},
                    {"step": "Configuration Setup", "duration": "25 minutes"},
                    {"step": "Testing & Training", "duration": "15 minutes"}
                ],
                "key_features": [
                    "All major software supported",
                    "Performance optimization",
                    "License management",
                    "User training included",
                    "Ongoing support"
                ],
                "contact_info": {
                    "phone": "+1-555-0124",
                    "email": "software@sppix.com"
                },
                "availability": "Monday-Friday: 9AM-6PM"
            },
            # Installation & Setup Services
            {
                "name": "Home Theater System Installation",
                "description": "Complete home theater system installation with professional calibration and setup.",
                "price": Decimal("299.99"),
                "category": "Home Theater Setup",
                "rating": Decimal("4.9"),
                "review_count": 67,
                "overview": "Transform your living space into a premium home theater experience. Our experts handle everything from equipment installation to audio/video calibration.",
                "included_features": [
                    "Equipment installation",
                    "Cable management",
                    "Audio calibration",
                    "Video calibration",
                    "Remote programming",
                    "User training"
                ],
                "process_steps": [
                    {"step": "Site Assessment", "duration": "30 minutes"},
                    {"step": "Equipment Installation", "duration": "2 hours"},
                    {"step": "Calibration Process", "duration": "1 hour"},
                    {"step": "Testing & Training", "duration": "30 minutes"}
                ],
                "key_features": [
                    "Professional installation",
                    "Audio/video calibration",
                    "Cable management",
                    "Remote programming",
                    "Warranty on work"
                ],
                "contact_info": {
                    "phone": "+1-555-0125",
                    "email": "hometheater@sppix.com"
                },
                "availability": "Monday-Friday: 9AM-5PM"
            },
            {
                "name": "Smart Home Device Installation",
                "description": "Complete smart home setup including smart lights, thermostats, security systems, and voice assistants.",
                "price": Decimal("399.99"),
                "category": "Smart Home Installation",
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
            # Repair & Maintenance Services
            {
                "name": "Laptop Screen Replacement",
                "description": "Professional laptop screen replacement service with genuine parts and warranty.",
                "price": Decimal("149.99"),
                "category": "Computer Repair",
                "rating": Decimal("4.8"),
                "review_count": 124,
                "overview": "Expert laptop screen replacement using genuine parts. We support all major brands and provide warranty on our work.",
                "included_features": [
                    "Genuine OEM parts",
                    "Professional installation",
                    "Screen calibration",
                    "Touch sensitivity testing",
                    "Quality assurance testing",
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
                    "phone": "+1-555-0127",
                    "email": "laptop@sppix.com"
                },
                "availability": "Monday-Sunday: 9AM-8PM"
            },
            {
                "name": "iPhone Screen Repair",
                "description": "Professional iPhone screen repair service with genuine Apple parts and warranty.",
                "price": Decimal("129.99"),
                "category": "Mobile Device Repair",
                "rating": Decimal("4.9"),
                "review_count": 89,
                "overview": "Get your iPhone screen repaired by our certified technicians using genuine Apple parts. We support all iPhone models and provide warranty on our work.",
                "included_features": [
                    "Genuine Apple parts",
                    "Professional installation",
                    "Touch ID calibration",
                    "Water resistance testing",
                    "Quality assurance testing",
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
                    "Genuine Apple parts",
                    "6-month warranty",
                    "All iPhone models supported",
                    "Professional installation"
                ],
                "contact_info": {
                    "phone": "+1-555-0128",
                    "email": "iphone@sppix.com"
                },
                "availability": "Monday-Sunday: 9AM-8PM"
            },
            # Consulting Services
            {
                "name": "IT Strategy Consulting",
                "description": "Expert IT consulting for businesses looking to optimize their technology infrastructure.",
                "price": Decimal("150.00"),
                "category": "IT Strategy Consulting",
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
                    "phone": "+1-555-0129",
                    "email": "strategy@sppix.com"
                },
                "availability": "Monday-Friday: 9AM-6PM"
            },
            {
                "name": "Data Analytics Consulting",
                "description": "Expert data analysis and business intelligence consulting to help you make data-driven decisions.",
                "price": Decimal("200.00"),
                "category": "Data & Analytics",
                "rating": Decimal("4.7"),
                "review_count": 28,
                "overview": "Transform your data into actionable insights with our comprehensive analytics consulting services. We help businesses implement data-driven strategies and build custom analytics solutions.",
                "included_features": [
                    "Data analysis and visualization",
                    "Custom dashboard development",
                    "Predictive analytics models",
                    "Business intelligence setup",
                    "Data governance planning",
                    "Training and support"
                ],
                "process_steps": [
                    {"step": "Data Discovery", "duration": "3-5 days"},
                    {"step": "Analysis & Modeling", "duration": "1-2 weeks"},
                    {"step": "Dashboard Development", "duration": "1 week"},
                    {"step": "Training & Handover", "duration": "2 days"}
                ],
                "key_features": [
                    "Advanced analytics tools",
                    "Custom dashboard development",
                    "Predictive modeling",
                    "Data visualization",
                    "Ongoing support"
                ],
                "contact_info": {
                    "phone": "+1-555-0130",
                    "email": "analytics@sppix.com"
                },
                "availability": "Monday-Friday: 9AM-6PM"
            },
            # Training & Education Services
            {
                "name": "Microsoft Office Training",
                "description": "Comprehensive Microsoft Office training for individuals and businesses.",
                "price": Decimal("99.99"),
                "category": "Software Training",
                "rating": Decimal("4.6"),
                "review_count": 45,
                "overview": "Master Microsoft Office applications with our comprehensive training program. We cover Word, Excel, PowerPoint, Outlook, and more with hands-on practice and real-world examples.",
                "included_features": [
                    "Hands-on training sessions",
                    "Customized curriculum",
                    "Practice exercises",
                    "Certification preparation",
                    "Training materials",
                    "Follow-up support"
                ],
                "process_steps": [
                    {"step": "Skill Assessment", "duration": "30 minutes"},
                    {"step": "Training Sessions", "duration": "4-8 hours"},
                    {"step": "Practice Exercises", "duration": "2 hours"},
                    {"step": "Assessment & Certification", "duration": "1 hour"}
                ],
                "key_features": [
                    "Experienced instructors",
                    "Customized curriculum",
                    "Hands-on practice",
                    "Certification preparation",
                    "Flexible scheduling"
                ],
                "contact_info": {
                    "phone": "+1-555-0131",
                    "email": "training@sppix.com"
                },
                "availability": "Monday-Friday: 9AM-5PM, Saturday: 10AM-2PM"
            },
            {
                "name": "Digital Literacy Workshop",
                "description": "Basic computer skills and internet safety training for beginners.",
                "price": Decimal("49.99"),
                "category": "Digital Literacy",
                "rating": Decimal("4.5"),
                "review_count": 67,
                "overview": "Learn essential computer skills and internet safety in our beginner-friendly workshop. Perfect for those new to computers or looking to improve their digital skills.",
                "included_features": [
                    "Basic computer operation",
                    "Internet navigation",
                    "Email setup and management",
                    "Online safety and security",
                    "Social media basics",
                    "Troubleshooting common issues"
                ],
                "process_steps": [
                    {"step": "Skill Assessment", "duration": "15 minutes"},
                    {"step": "Basic Computer Skills", "duration": "2 hours"},
                    {"step": "Internet & Email", "duration": "1.5 hours"},
                    {"step": "Safety & Security", "duration": "1 hour"}
                ],
                "key_features": [
                    "Beginner-friendly approach",
                    "Small class sizes",
                    "Patient instructors",
                    "Take-home materials",
                    "Ongoing support"
                ],
                "contact_info": {
                    "phone": "+1-555-0132",
                    "email": "literacy@sppix.com"
                },
                "availability": "Monday-Friday: 10AM-4PM"
            }
        ]
        
        services = []
        
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
                
                # Add service image using available image files
                # Use proper Django file handling to ensure correct upload paths and filenames
                if german_path and os.path.exists(german_path):
                    with open(german_path, 'rb') as f:
                        django_file = File(f, name=os.path.basename(german_path))
                        service_image = ServiceImage.objects.create(service=service, image=django_file)
                        self.stdout.write(f"   Added service image to {service.name}")
                elif anime_path and os.path.exists(anime_path):
                    with open(anime_path, 'rb') as f:
                        django_file = File(f, name=os.path.basename(anime_path))
                        service_image = ServiceImage.objects.create(service=service, image=django_file)
                        self.stdout.write(f"   Added service image to {service.name}")
            
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
                "email": "info@sppix.com",
                "services_page_title": "Professional Electrical Services",
                "services_page_description": "Expert electrical solutions for your home and business. From installations to repairs, we deliver quality service you can trust."
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
