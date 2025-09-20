import random
import json
from datetime import timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.contrib.auth.models import User
from adminpanel.models import Product, Brand, Category, Review, ProductImage

class Command(BaseCommand):
    help = "Seed comprehensive product data with realistic information"

    def handle(self, *args, **opts):
        self.stdout.write("Starting comprehensive product seeding...")
        
        # Create brands if they don't exist
        brands_data = [
            "Apple",
            "Samsung", 
            "Sony",
            "Dell",
            "HP",
            "Logitech",
            "Canon",
            "Nikon",
            "Steelcase",
            "Google",
        ]
        
        brands = {}
        for brand_name in brands_data:
            brand, created = Brand.objects.get_or_create(name=brand_name)
            brands[brand_name] = brand
            if created:
                self.stdout.write(f"Created brand: {brand_name}")

        # Create categories if they don't exist
        categories_data = [
            "Electronics",
            "Audio", 
            "Camera",
            "Computing",
            "Accessories",
            "Office",
        ]
        
        categories = {}
        for cat_name in categories_data:
            category, created = Category.objects.get_or_create(name=cat_name)
            categories[cat_name] = category
            if created:
                self.stdout.write(f"Created category: {cat_name}")

        # Comprehensive product data
        products_data = [
            {
                "name": "AirPods Pro (2nd generation)",
                "description": "Premium wireless earbuds with active noise cancellation and spatial audio. Experience immersive sound with adaptive transparency and personalized spatial audio.",
                "price": 249.00,
                "discount_rate": 11.0,
                "stock": 50,
                "brand": "Apple",
                "category": "Audio",
                "technical_specs": {
                    "Driver": "Custom high-excursion driver",
                    "Noise Cancellation": "Active",
                    "Battery": "Up to 6 hours",
                    "Case": "MagSafe charging",
                    "Connectivity": "Bluetooth 5.3",
                    "Weight": "5.3g per earbud",
                    "Water Resistance": "IPX4",
                    "Chip": "H2 chip"
                }
            },
            {
                "name": "iPhone 15 Pro Max",
                "description": "The most advanced iPhone with titanium design, A17 Pro chip, and advanced camera system. Features Action Button and USB-C connectivity.",
                "price": 1199.00,
                "discount_rate": 8.0,
                "stock": 25,
                "brand": "Apple",
                "category": "Electronics",
                "technical_specs": {
                    "Display": "6.7-inch Super Retina XDR",
                    "Chip": "A17 Pro",
                    "Storage": "256GB, 512GB, 1TB",
                    "Camera": "48MP Main, 12MP Ultra Wide, 12MP Telephoto",
                    "Battery": "Up to 29 hours video playback",
                    "Connectivity": "USB-C, 5G",
                    "Material": "Titanium",
                    "Water Resistance": "IP68"
                }
            },
            {
                "name": "Logitech MX Master 3S",
                "description": "Advanced wireless mouse with precision tracking, customizable buttons, and ergonomic design. Perfect for productivity and creative work.",
                "price": 99.00,
                "discount_rate": 17.0,
                "stock": 75,
                "brand": "Logitech",
                "category": "Accessories",
                "technical_specs": {
                    "Sensor": "Darkfield 8000 DPI",
                    "Battery": "Up to 70 days",
                    "Connectivity": "Bluetooth, USB receiver",
                    "Buttons": "7 programmable buttons",
                    "Scroll": "MagSpeed electromagnetic",
                    "Compatibility": "Windows, macOS, Linux",
                    "Weight": "141g"
                }
            },
            {
                "name": "Samsung Galaxy S24 Ultra",
                "description": "Flagship Android smartphone with S Pen, advanced AI features, and professional-grade camera system. Built for productivity and creativity.",
                "price": 1299.00,
                "discount_rate": 7.0,
                "stock": 30,
                "brand": "Samsung",
                "category": "Electronics",
                "technical_specs": {
                    "Display": "6.8-inch Dynamic AMOLED 2X",
                    "Processor": "Snapdragon 8 Gen 3",
                    "Storage": "256GB, 512GB, 1TB",
                    "Camera": "200MP Main, 50MP Periscope, 10MP Telephoto",
                    "S Pen": "Included",
                    "Battery": "5000mAh",
                    "Connectivity": "5G, Wi-Fi 7",
                    "Water Resistance": "IP68"
                }
            },
            {
                "name": "MacBook Pro 16-inch M3",
                "description": "Professional laptop with M3 chip, stunning Liquid Retina XDR display, and all-day battery life. Built for creators and professionals.",
                "price": 2499.00,
                "discount_rate": 11.0,
                "stock": 15,
                "brand": "Apple",
                "category": "Computing",
                "technical_specs": {
                    "Chip": "Apple M3",
                    "Display": "16.2-inch Liquid Retina XDR",
                    "Memory": "18GB unified memory",
                    "Storage": "512GB SSD",
                    "Battery": "Up to 22 hours",
                    "Ports": "3x Thunderbolt 4, HDMI, SDXC, MagSafe 3",
                    "Weight": "2.16kg",
                    "Graphics": "10-core GPU"
                }
            },
            {
                "name": "Google Pixel 8 Pro",
                "description": "AI-powered smartphone with advanced computational photography, Google Tensor G3 chip, and seamless Google ecosystem integration.",
                "price": 999.00,
                "discount_rate": 9.0,
                "stock": 40,
                "brand": "Google",
                "category": "Electronics",
                "technical_specs": {
                    "Display": "6.7-inch LTPO OLED",
                    "Chip": "Google Tensor G3",
                    "Storage": "128GB, 256GB, 512GB, 1TB",
                    "Camera": "50MP Main, 48MP Ultra Wide, 48MP Telephoto",
                    "Battery": "5050mAh",
                    "Connectivity": "5G, Wi-Fi 7",
                    "Water Resistance": "IP68",
                    "AI Features": "Magic Eraser, Call Screen, Live Translate"
                }
            },
            {
                "name": "Sony A7 IV Camera",
                "description": "Full-frame mirrorless camera with 33MP sensor, advanced autofocus, and professional video capabilities. Perfect for photographers and videographers.",
                "price": 2498.00,
                "discount_rate": 7.0,
                "stock": 20,
                "brand": "Sony",
                "category": "Camera",
                "technical_specs": {
                    "Sensor": "33MP Full-frame Exmor R CMOS",
                    "Image Processor": "BIONZ XR",
                    "ISO": "100-51200 (expandable to 50-204800)",
                    "Autofocus": "759 phase-detection points",
                    "Video": "4K 60p, 10-bit 4:2:2",
                    "Battery": "NP-FZ100",
                    "Weight": "658g",
                    "Stabilization": "5-axis in-body"
                }
            },
            {
                "name": "Steelcase Gesture Office Chair",
                "description": "Ergonomic office chair designed for modern work styles. Features adaptive support, intuitive controls, and premium materials for all-day comfort.",
                "price": 899.00,
                "discount_rate": 10.0,
                "stock": 35,
                "brand": "Steelcase",
                "category": "Office",
                "technical_specs": {
                    "Seat Height": "38-50cm adjustable",
                    "Weight Capacity": "136kg",
                    "Materials": "Recycled polyester, aluminum",
                    "Armrests": "4D adjustable",
                    "Lumbar Support": "Adjustable",
                    "Warranty": "12 years",
                    "Weight": "22kg",
                    "Dimensions": "66cm W x 66cm D x 119-130cm H"
                }
            },
            {
                "name": "Dell XPS 13 Plus",
                "description": "Ultrabook with 13th Gen Intel processors, stunning OLED display, and premium build quality. Designed for professionals on the go.",
                "price": 1299.00,
                "discount_rate": 13.0,
                "stock": 25,
                "brand": "Dell",
                "category": "Computing",
                "technical_specs": {
                    "Processor": "Intel Core i7-1360P",
                    "Display": "13.4-inch OLED 3.5K",
                    "Memory": "16GB LPDDR5",
                    "Storage": "512GB SSD",
                    "Graphics": "Intel Iris Xe",
                    "Battery": "55Wh",
                    "Weight": "1.26kg",
                    "Ports": "2x Thunderbolt 4, microSD"
                }
            },
            {
                "name": "HP Spectre x360 14",
                "description": "Convertible 2-in-1 laptop with 13th Gen Intel processors, vibrant display, and premium design. Perfect for work and creativity.",
                "price": 1399.00,
                "discount_rate": 13.0,
                "stock": 30,
                "brand": "HP",
                "category": "Computing",
                "technical_specs": {
                    "Processor": "Intel Core i7-1355U",
                    "Display": "14-inch 3K2K OLED touch",
                    "Memory": "16GB LPDDR5",
                    "Storage": "1TB SSD",
                    "Graphics": "Intel Iris Xe",
                    "Battery": "Up to 17 hours",
                    "Weight": "1.37kg",
                    "Convertible": "360-degree hinge"
                }
            },
            {
                "name": "Canon EOS R5 Camera",
                "description": "Professional mirrorless camera with 45MP sensor, 8K video recording, and advanced autofocus. Built for professional photographers and videographers.",
                "price": 3899.00,
                "discount_rate": 7.0,
                "stock": 10,
                "brand": "Canon",
                "category": "Camera",
                "technical_specs": {
                    "Sensor": "45MP Full-frame CMOS",
                    "Image Processor": "DIGIC X",
                    "ISO": "100-51200 (expandable to 50-102400)",
                    "Autofocus": "1053 AF points",
                    "Video": "8K 30p, 4K 120p",
                    "Battery": "LP-E6NH",
                    "Weight": "738g",
                    "Stabilization": "5-axis in-body"
                }
            },
            {
                "name": "Nikon Z6 III Camera",
                "description": "Full-frame mirrorless camera with 24.5MP sensor, advanced video capabilities, and professional autofocus system. Ideal for hybrid shooters.",
                "price": 2499.00,
                "discount_rate": 7.0,
                "stock": 18,
                "brand": "Nikon",
                "category": "Camera",
                "technical_specs": {
                    "Sensor": "24.5MP Full-frame CMOS",
                    "Image Processor": "EXPEED 7",
                    "ISO": "100-51200 (expandable to 50-204800)",
                    "Autofocus": "273-point hybrid AF",
                    "Video": "4K 60p, 10-bit N-Log",
                    "Battery": "EN-EL15c",
                    "Weight": "675g",
                    "Stabilization": "5-axis VR"
                }
            },
            {
                "name": "Sony WH-1000XM5 Headphones",
                "description": "Premium noise-canceling headphones with industry-leading noise cancellation, exceptional sound quality, and all-day comfort.",
                "price": 399.00,
                "discount_rate": 15.0,
                "stock": 45,
                "brand": "Sony",
                "category": "Audio",
                "technical_specs": {
                    "Driver": "30mm dynamic",
                    "Noise Cancellation": "Industry-leading",
                    "Battery": "Up to 30 hours",
                    "Connectivity": "Bluetooth 5.2, NFC",
                    "Weight": "250g",
                    "Frequency Response": "4Hz-40kHz",
                    "Charging": "USB-C, Quick Charge",
                    "Microphones": "8 microphones"
                }
            },
            {
                "name": "Apple Watch Series 9",
                "description": "Advanced smartwatch with S9 chip, health monitoring, and seamless iPhone integration. Features Always-On Retina display and crash detection.",
                "price": 399.00,
                "discount_rate": 12.0,
                "stock": 60,
                "brand": "Apple",
                "category": "Electronics",
                "technical_specs": {
                    "Chip": "S9 SiP",
                    "Display": "Always-On Retina",
                    "Storage": "64GB",
                    "Battery": "Up to 18 hours",
                    "Connectivity": "GPS, Cellular",
                    "Water Resistance": "WR50",
                    "Sensors": "Heart rate, ECG, Blood oxygen",
                    "Materials": "Aluminum, Stainless steel"
                }
            },
            {
                "name": "Samsung Galaxy Buds2 Pro",
                "description": "Premium wireless earbuds with intelligent active noise cancellation, 360 Audio, and seamless Galaxy ecosystem integration.",
                "price": 229.00,
                "discount_rate": 18.0,
                "stock": 55,
                "brand": "Samsung",
                "category": "Audio",
                "technical_specs": {
                    "Driver": "10mm + 5.3mm dual driver",
                    "Noise Cancellation": "Intelligent ANC",
                    "Battery": "Up to 5 hours + 18 hours case",
                    "Connectivity": "Bluetooth 5.3",
                    "Weight": "5.5g per earbud",
                    "Water Resistance": "IPX7",
                    "Audio Codec": "Samsung Seamless Codec",
                    "Features": "360 Audio, Voice Detect"
                }
            },
            {
                "name": "Logitech MX Keys Mini",
                "description": "Compact wireless keyboard with perfect typing feel, backlit keys, and multi-device connectivity. Designed for productivity and portability.",
                "price": 79.00,
                "discount_rate": 20.0,
                "stock": 80,
                "brand": "Logitech",
                "category": "Accessories",
                "technical_specs": {
                    "Layout": "Compact 75-key",
                    "Backlighting": "Smart backlighting",
                    "Battery": "Up to 5 months",
                    "Connectivity": "Bluetooth, USB receiver",
                    "Compatibility": "Windows, macOS, Linux, iOS, Android",
                    "Weight": "506g",
                    "Dimensions": "295mm x 124mm x 16mm",
                    "Switches": "Tactile, quiet"
                }
            },
            {
                "name": "Dell UltraSharp 27 4K Monitor",
                "description": "Professional 27-inch 4K monitor with 99% sRGB color accuracy, USB-C connectivity, and ergonomic design. Perfect for creative professionals.",
                "price": 599.00,
                "discount_rate": 14.0,
                "stock": 25,
                "brand": "Dell",
                "category": "Accessories",
                "technical_specs": {
                    "Display": "27-inch 4K UHD",
                    "Resolution": "3840 x 2160",
                    "Panel": "IPS",
                    "Color Gamut": "99% sRGB",
                    "Connectivity": "USB-C, HDMI, DisplayPort",
                    "Stand": "Height, tilt, swivel adjustable",
                    "Weight": "6.8kg",
                    "Power": "90W USB-C power delivery"
                }
            },
            {
                "name": "Sony PlayStation 5",
                "description": "Next-generation gaming console with ultra-fast SSD, ray tracing, and immersive 3D audio. Experience gaming like never before.",
                "price": 499.00,
                "discount_rate": 5.0,
                "stock": 12,
                "brand": "Sony",
                "category": "Electronics",
                "technical_specs": {
                    "CPU": "AMD Zen 2-based",
                    "GPU": "AMD RDNA 2-based",
                    "Memory": "16GB GDDR6",
                    "Storage": "825GB SSD",
                    "Optical Drive": "4K UHD Blu-ray",
                    "Audio": "Tempest 3D AudioTech",
                    "Connectivity": "Wi-Fi 6, Bluetooth 5.1",
                    "Power": "350W"
                }
            },
            {
                "name": "Google Nest Hub Max",
                "description": "Smart display with Google Assistant, 10-inch screen, and built-in camera. Control your smart home and enjoy entertainment hands-free.",
                "price": 229.00,
                "discount_rate": 16.0,
                "stock": 35,
                "brand": "Google",
                "category": "Electronics",
                "technical_specs": {
                    "Display": "10-inch HD touchscreen",
                    "Camera": "6.5MP with privacy shutter",
                    "Audio": "Stereo speakers",
                    "Connectivity": "Wi-Fi, Bluetooth",
                    "Assistant": "Google Assistant",
                    "Weight": "1.2kg",
                    "Dimensions": "246mm x 175mm x 103mm",
                    "Power": "15W adapter"
                }
            },
            {
                "name": "Steelcase Series 1 Office Chair",
                "description": "Affordable ergonomic office chair with adjustable features and sustainable materials. Designed for comfort and productivity in any workspace.",
                "price": 399.00,
                "discount_rate": 22.0,
                "stock": 50,
                "brand": "Steelcase",
                "category": "Office",
                "technical_specs": {
                    "Seat Height": "40-52cm adjustable",
                    "Weight Capacity": "113kg",
                    "Materials": "Recycled polyester",
                    "Armrests": "Height adjustable",
                    "Lumbar Support": "Built-in",
                    "Warranty": "12 years",
                    "Weight": "18kg",
                    "Dimensions": "61cm W x 61cm D x 100-112cm H"
                }
            }
        ]

        # Create products
        created_count = 0
        for product_data in products_data:
            # Check if product already exists
            if Product.objects.filter(name=product_data["name"]).exists():
                continue
                
            product = Product.objects.create(
                name=product_data["name"],
                description=product_data["description"],
                price=product_data["price"],
                discount_rate=product_data["discount_rate"],
                stock=product_data["stock"],
                brand=brands[product_data["brand"]],
                category=categories[product_data["category"]],
                technical_specs=product_data["technical_specs"]
            )
            created_count += 1
            self.stdout.write(f"Created product: {product_data['name']}")

        self.stdout.write(self.style.SUCCESS(f"Created {created_count} new products"))

        # Create a demo user for reviews
        demo_user, created = User.objects.get_or_create(
            username="demo_customer",
            defaults={
                "email": "demo@example.com",
                "first_name": "Demo",
                "last_name": "Customer"
            }
        )
        if created:
            demo_user.set_password("demo12345")
            demo_user.save()
            self.stdout.write("Created demo customer user")

        # Create some sample reviews
        if Review.objects.count() < 50:
            products = list(Product.objects.all())
            review_comments = [
                "Excellent product! Highly recommend.",
                "Great quality and fast shipping.",
                "Perfect for my needs. Very satisfied.",
                "Outstanding performance and build quality.",
                "Love this product! Worth every penny.",
                "Amazing features and great value.",
                "Top-notch quality. Exceeded expectations.",
                "Fantastic product with excellent support.",
                "Very happy with this purchase.",
                "Great product, would buy again.",
                "Excellent build quality and performance.",
                "Perfect for professional use.",
                "Outstanding value for money.",
                "Highly recommend this product.",
                "Great customer service and product quality.",
                "Love the design and functionality.",
                "Excellent product with great features.",
                "Perfect fit for my requirements.",
                "Great product, fast delivery.",
                "Outstanding quality and performance."
            ]
            
            for i in range(50):
                product = random.choice(products)
                rating = random.randint(3, 5)
                comment = random.choice(review_comments)
                
                Review.objects.create(
                    product=product,
                    user=demo_user,
                    rating=rating,
                    comment=comment
                )
            
            self.stdout.write(self.style.SUCCESS("Created 50 sample reviews"))

        self.stdout.write(self.style.SUCCESS("Comprehensive product seeding completed!"))
        self.stdout.write(f"Total products: {Product.objects.count()}")
        self.stdout.write(f"Total brands: {Brand.objects.count()}")
        self.stdout.write(f"Total categories: {Category.objects.count()}")
        self.stdout.write(f"Total reviews: {Review.objects.count()}")
