#!/usr/bin/env python
"""
Comprehensive Database Seeding Script for Electro-Store
This script populates the database with brands and products, ensuring products are only placed in grandchild categories (Level 2).
"""

import os
import sys
import django
from decimal import Decimal
from django.core.files import File

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from adminpanel.models import Brand, Category, Product, ProductImage

def copy_german_image():
    """Copy German.png to media directory for use in seeding"""
    german_source = os.path.join(os.path.dirname(__file__), '..', 'German.png')
    german_dest = os.path.join(os.path.dirname(__file__), 'media', 'German.png')
    
    # Create media directory if it doesn't exist
    os.makedirs(os.path.dirname(german_dest), exist_ok=True)
    
    if os.path.exists(german_source):
        import shutil
        shutil.copy2(german_source, german_dest)
        print(f"✓ Copied German.png to {german_dest}")
        return german_dest
    else:
        print(f"⚠ German.png not found at {german_source}")
        return None

def create_brands():
    """Create comprehensive list of brands"""
    brands_data = [
        # Electronics & Technology
        {"name": "Apple", "slug": "apple"},
        {"name": "Samsung", "slug": "samsung"},
        {"name": "Sony", "slug": "sony"},
        {"name": "LG", "slug": "lg"},
        {"name": "Panasonic", "slug": "panasonic"},
        {"name": "Philips", "slug": "philips"},
        {"name": "Sharp", "slug": "sharp"},
        {"name": "Toshiba", "slug": "toshiba"},
        {"name": "Hitachi", "slug": "hitachi"},
        {"name": "Mitsubishi", "slug": "mitsubishi"},
        
        # Computer & IT
        {"name": "Dell", "slug": "dell"},
        {"name": "HP", "slug": "hp"},
        {"name": "Lenovo", "slug": "lenovo"},
        {"name": "ASUS", "slug": "asus"},
        {"name": "Acer", "slug": "acer"},
        {"name": "MSI", "slug": "msi"},
        {"name": "Microsoft", "slug": "microsoft"},
        {"name": "Intel", "slug": "intel"},
        {"name": "AMD", "slug": "amd"},
        {"name": "NVIDIA", "slug": "nvidia"},
        
        # Audio & Video
        {"name": "Bose", "slug": "bose"},
        {"name": "JBL", "slug": "jbl"},
        {"name": "Sennheiser", "slug": "sennheiser"},
        {"name": "Audio-Technica", "slug": "audio-technica"},
        {"name": "Shure", "slug": "shure"},
        {"name": "Canon", "slug": "canon"},
        {"name": "Nikon", "slug": "nikon"},
        {"name": "GoPro", "slug": "gopro"},
        {"name": "DJI", "slug": "dji"},
        
        # Gaming & Entertainment
        {"name": "Nintendo", "slug": "nintendo"},
        {"name": "Xbox", "slug": "xbox"},
        {"name": "PlayStation", "slug": "playstation"},
        {"name": "Steam", "slug": "steam"},
        {"name": "Razer", "slug": "razer"},
        {"name": "Logitech", "slug": "logitech"},
        {"name": "Corsair", "slug": "corsair"},
        {"name": "SteelSeries", "slug": "steelseries"},
        
        # Home & Kitchen
        {"name": "KitchenAid", "slug": "kitchenaid"},
        {"name": "Cuisinart", "slug": "cuisinart"},
        {"name": "Breville", "slug": "breville"},
        {"name": "Ninja", "slug": "ninja"},
        {"name": "Instant Pot", "slug": "instant-pot"},
        {"name": "Vitamix", "slug": "vitamix"},
        {"name": "Dyson", "slug": "dyson"},
        {"name": "iRobot", "slug": "irobot"},
        
        # Fitness & Sports
        {"name": "Peloton", "slug": "peloton"},
        {"name": "NordicTrack", "slug": "nordictrack"},
        {"name": "Bowflex", "slug": "bowflex"},
        {"name": "Nautilus", "slug": "nautilus"},
        {"name": "ProForm", "slug": "proform"},
        
        # Automotive
        {"name": "Bosch", "slug": "bosch"},
        {"name": "Makita", "slug": "makita"},
        {"name": "DeWalt", "slug": "dewalt"},
        {"name": "Milwaukee", "slug": "milwaukee"},
        {"name": "Ryobi", "slug": "ryobi"},
        {"name": "Black+Decker", "slug": "black-decker"},
        {"name": "Craftsman", "slug": "craftsman"},
        {"name": "Snap-on", "slug": "snap-on"},
        
        # Fashion & Lifestyle
        {"name": "Nike", "slug": "nike"},
        {"name": "Adidas", "slug": "adidas"},
        {"name": "Puma", "slug": "puma"},
        {"name": "Under Armour", "slug": "under-armour"},
        {"name": "New Balance", "slug": "new-balance"},
        {"name": "Converse", "slug": "converse"},
        {"name": "Vans", "slug": "vans"},
        {"name": "Reebok", "slug": "reebok"},
        
        # Smart Home & IoT
        {"name": "Nest", "slug": "nest"},
        {"name": "Ring", "slug": "ring"},
        {"name": "Arlo", "slug": "arlo"},
        {"name": "Eufy", "slug": "eufy"},
        {"name": "Wyze", "slug": "wyze"},
        {"name": "TP-Link", "slug": "tp-link"},
        {"name": "Netgear", "slug": "netgear"},
        {"name": "Linksys", "slug": "linksys"},
        
        # Health & Wellness
        {"name": "Fitbit", "slug": "fitbit"},
        {"name": "Garmin", "slug": "garmin"},
        {"name": "Apple Watch", "slug": "apple-watch"},
        {"name": "Samsung Galaxy Watch", "slug": "samsung-galaxy-watch"},
        {"name": "Withings", "slug": "withings"},
        {"name": "Oura", "slug": "oura"},
    ]
    
    brands = []
    for brand_data in brands_data:
        brand, created = Brand.objects.get_or_create(
            name=brand_data["name"],
            defaults={"slug": brand_data["slug"]}
        )
        brands.append(brand)
        if created:
            print(f"✓ Created brand: {brand.name}")
    
    return brands

def get_grandchild_categories():
    """Get all grandchild categories (Level 2) where products can be placed"""
    return Category.objects.filter(parent__parent__isnull=False).order_by('name')

def create_comprehensive_products(brands, grandchild_categories, german_image_path):
    """Create comprehensive product catalog"""
    
    # Get some specific grandchild categories for better product placement
    category_mapping = {}
    for cat in grandchild_categories:
        category_mapping[cat.name.lower()] = cat
    
    # Comprehensive product data organized by category
    products_data = [
        # Audio cables & adaptors
        {
            "name": "Premium Audio Cable 3.5mm to RCA",
            "description": "High-quality audio cable with gold-plated connectors for crystal clear sound transmission.",
            "price": Decimal("24.99"),
            "discount_rate": Decimal("15.00"),
            "stock": 150,
            "brand": "Audio-Technica",
            "category_key": "audio cables & adaptors",
            "isNew": False,
            "is_top_selling": True,
            "technical_specs": {
                "length": "6 feet",
                "connectors": "3.5mm to RCA",
                "material": "Oxygen-free copper",
                "shielding": "Double-shielded",
                "impedance": "75 ohms",
                "frequency_response": "20Hz-20kHz"
            }
        },
        {
            "name": "Bluetooth Audio Adapter",
            "description": "Wireless audio adapter that converts any speaker with 3.5mm input to Bluetooth.",
            "price": Decimal("19.99"),
            "discount_rate": Decimal("20.00"),
            "stock": 200,
            "brand": "JBL",
            "category_key": "audio cables & adaptors",
            "isNew": True,
            "is_top_selling": False,
            "technical_specs": {
                "bluetooth_version": "5.0",
                "range": "33 feet",
                "battery_life": "8 hours",
                "charging": "USB-C",
                "compatibility": "All devices with 3.5mm jack"
            }
        },
        
        # Ceiling lights
        {
            "name": "Smart LED Ceiling Light",
            "description": "WiFi-enabled smart ceiling light with dimming, color changing, and voice control.",
            "price": Decimal("89.99"),
            "discount_rate": Decimal("25.00"),
            "stock": 75,
            "brand": "Philips",
            "category_key": "ceiling lights",
            "isNew": True,
            "is_top_selling": True,
            "technical_specs": {
                "brightness": "800 lumens",
                "color_temperature": "2700K-6500K",
                "wifi": "802.11 b/g/n",
                "voice_control": "Alexa, Google Assistant",
                "dimming": "1-100%",
                "lifespan": "25,000 hours"
            }
        },
        {
            "name": "Modern Flush Mount Ceiling Light",
            "description": "Sleek flush mount ceiling light perfect for modern homes and apartments.",
            "price": Decimal("45.99"),
            "discount_rate": Decimal("10.00"),
            "stock": 120,
            "brand": "Samsung",
            "category_key": "ceiling lights",
            "isNew": False,
            "is_top_selling": False,
            "technical_specs": {
                "brightness": "600 lumens",
                "color_temperature": "3000K",
                "material": "Aluminum and glass",
                "installation": "Flush mount",
                "lifespan": "15,000 hours"
            }
        },
        
        # Cable
        {
            "name": "Heavy Duty Extension Cable 50ft",
            "description": "Weather-resistant outdoor extension cable with multiple outlets and surge protection.",
            "price": Decimal("39.99"),
            "discount_rate": Decimal("12.00"),
            "stock": 100,
            "brand": "Bosch",
            "category_key": "cable",
            "isNew": False,
            "is_top_selling": True,
            "technical_specs": {
                "length": "50 feet",
                "gauge": "12 AWG",
                "outlets": "3 outlets",
                "surge_protection": "Yes",
                "weather_rating": "IP65",
                "max_current": "15A"
            }
        },
        {
            "name": "USB-C to Lightning Cable",
            "description": "Fast charging cable compatible with iPhone and iPad devices.",
            "price": Decimal("29.99"),
            "discount_rate": Decimal("20.00"),
            "stock": 300,
            "brand": "Apple",
            "category_key": "cable",
            "isNew": True,
            "is_top_selling": True,
            "technical_specs": {
                "length": "6 feet",
                "connectors": "USB-C to Lightning",
                "charging_speed": "Fast charging",
                "data_transfer": "USB 2.0",
                "compatibility": "iPhone, iPad"
            }
        },
        
        # Ethernet cable
        {
            "name": "Cat6 Ethernet Cable 100ft",
            "description": "High-speed Cat6 ethernet cable for reliable network connections.",
            "price": Decimal("24.99"),
            "discount_rate": Decimal("15.00"),
            "stock": 200,
            "brand": "TP-Link",
            "category_key": "ethernet cable",
            "isNew": False,
            "is_top_selling": True,
            "technical_specs": {
                "length": "100 feet",
                "category": "Cat6",
                "speed": "Up to 1 Gbps",
                "frequency": "250 MHz",
                "shielding": "UTP",
                "connectors": "RJ45"
            }
        },
        
        # Extension leads
        {
            "name": "Smart Power Strip with USB",
            "description": "Smart power strip with 6 outlets and 3 USB ports, controllable via app.",
            "price": Decimal("49.99"),
            "discount_rate": Decimal("18.00"),
            "stock": 80,
            "brand": "TP-Link",
            "category_key": "extension leads",
            "isNew": True,
            "is_top_selling": False,
            "technical_specs": {
                "outlets": "6 AC outlets",
                "usb_ports": "3 USB-A ports",
                "smart_control": "WiFi app control",
                "surge_protection": "Yes",
                "max_power": "1875W",
                "cord_length": "6 feet"
            }
        },
        
        # Chandeliers
        {
            "name": "Crystal Chandelier 8-Light",
            "description": "Elegant crystal chandelier with 8 lights, perfect for dining rooms and foyers.",
            "price": Decimal("299.99"),
            "discount_rate": Decimal("30.00"),
            "stock": 25,
            "brand": "Philips",
            "category_key": "chandeliers",
            "isNew": False,
            "is_top_selling": True,
            "technical_specs": {
                "lights": "8 lights",
                "bulb_type": "E12 candelabra",
                "material": "Crystal and metal",
                "dimensions": "24 inches diameter",
                "height": "18 inches",
                "style": "Traditional"
            }
        },
        
        # Decking lights
        {
            "name": "Solar Decking Lights Set of 8",
            "description": "Waterproof solar decking lights for outdoor illumination and safety.",
            "price": Decimal("79.99"),
            "discount_rate": Decimal("25.00"),
            "stock": 60,
            "brand": "Philips",
            "category_key": "decking lights",
            "isNew": True,
            "is_top_selling": False,
            "technical_specs": {
                "quantity": "8 lights",
                "power": "Solar powered",
                "brightness": "20 lumens each",
                "runtime": "8-10 hours",
                "weather_rating": "IP65",
                "installation": "Easy clip-on"
            }
        },
        
        # Door bells
        {
            "name": "Smart Video Doorbell",
            "description": "WiFi-enabled video doorbell with HD camera, motion detection, and two-way audio.",
            "price": Decimal("199.99"),
            "discount_rate": Decimal("20.00"),
            "stock": 40,
            "brand": "Ring",
            "category_key": "door bells",
            "isNew": True,
            "is_top_selling": True,
            "technical_specs": {
                "camera": "1080p HD",
                "field_of_view": "160 degrees",
                "night_vision": "Yes",
                "motion_detection": "Yes",
                "two_way_audio": "Yes",
                "power": "Battery or hardwired"
            }
        },
        
        # Door locks
        {
            "name": "Smart Deadbolt Lock",
            "description": "WiFi-enabled smart deadbolt lock with keyless entry and remote access.",
            "price": Decimal("249.99"),
            "discount_rate": Decimal("15.00"),
            "stock": 30,
            "brand": "Ring",
            "category_key": "door locks",
            "isNew": True,
            "is_top_selling": False,
            "technical_specs": {
                "lock_type": "Deadbolt",
                "power": "4 AA batteries",
                "connectivity": "WiFi",
                "keyless_entry": "Yes",
                "remote_access": "Yes",
                "auto_lock": "Yes"
            }
        },
        
        # Burglar alarms
        {
            "name": "Wireless Home Security System",
            "description": "Complete wireless home security system with sensors, cameras, and mobile app.",
            "price": Decimal("399.99"),
            "discount_rate": Decimal("20.00"),
            "stock": 20,
            "brand": "Ring",
            "category_key": "burglar alarms",
            "isNew": True,
            "is_top_selling": True,
            "technical_specs": {
                "components": "Base station, door/window sensors, motion detector",
                "connectivity": "WiFi",
                "mobile_app": "Yes",
                "professional_monitoring": "Optional",
                "battery_life": "2 years",
                "range": "1000 feet"
            }
        },
        
        # Carbon monoxide alarms
        {
            "name": "Smart Carbon Monoxide Detector",
            "description": "WiFi-enabled carbon monoxide detector with mobile alerts and voice warnings.",
            "price": Decimal("89.99"),
            "discount_rate": Decimal("10.00"),
            "stock": 50,
            "brand": "Nest",
            "category_key": "carbon monoxide alarms",
            "isNew": True,
            "is_top_selling": False,
            "technical_specs": {
                "sensor_type": "Electrochemical",
                "connectivity": "WiFi",
                "mobile_alerts": "Yes",
                "voice_warnings": "Yes",
                "battery_life": "5 years",
                "installation": "Easy mount"
            }
        },
        
        # Bicycle locks
        {
            "name": "Heavy Duty U-Lock",
            "description": "Ultra-secure U-lock with hardened steel construction and anti-theft protection.",
            "price": Decimal("49.99"),
            "discount_rate": Decimal("20.00"),
            "stock": 100,
            "brand": "Bosch",
            "category_key": "bicycle locks",
            "isNew": False,
            "is_top_selling": True,
            "technical_specs": {
                "material": "Hardened steel",
                "lock_type": "U-lock",
                "key_type": "Disc detainer",
                "weight": "1.2 kg",
                "shackle_diameter": "14mm",
                "security_rating": "Sold Secure Gold"
            }
        },
        
        # Back boxes
        {
            "name": "Electrical Back Box 2-Gang",
            "description": "Heavy-duty electrical back box for flush mounting electrical accessories.",
            "price": Decimal("12.99"),
            "discount_rate": Decimal("5.00"),
            "stock": 200,
            "brand": "Bosch",
            "category_key": "back boxes",
            "isNew": False,
            "is_top_selling": False,
            "technical_specs": {
                "gangs": "2-gang",
                "material": "Galvanized steel",
                "depth": "47mm",
                "mounting": "Flush mount",
                "standards": "BS 4662",
                "finish": "Galvanized"
            }
        },
        
        # Cable connectors
        {
            "name": "RJ45 Network Connector Pack of 100",
            "description": "Professional-grade RJ45 connectors for ethernet cable termination.",
            "price": Decimal("19.99"),
            "discount_rate": Decimal("15.00"),
            "stock": 150,
            "brand": "TP-Link",
            "category_key": "cable connectors",
            "isNew": False,
            "is_top_selling": True,
            "technical_specs": {
                "quantity": "100 pieces",
                "connector_type": "RJ45",
                "compatibility": "Cat5e, Cat6",
                "material": "Gold-plated copper",
                "standards": "TIA/EIA 568",
                "color": "Clear"
            }
        },
        
        # Cable management
        {
            "name": "Cable Management Kit",
            "description": "Complete cable management solution with clips, ties, and organizers.",
            "price": Decimal("24.99"),
            "discount_rate": Decimal("20.00"),
            "stock": 80,
            "brand": "Bosch",
            "category_key": "cable management",
            "isNew": True,
            "is_top_selling": False,
            "technical_specs": {
                "components": "Cable clips, zip ties, cable sleeves",
                "material": "Plastic and nylon",
                "colors": "Black, white",
                "cable_capacity": "Various sizes",
                "installation": "Self-adhesive",
                "weather_resistant": "Yes"
            }
        },
        
        # Cable reels
        {
            "name": "Heavy Duty Extension Cord Reel",
            "description": "Portable extension cord reel with automatic retraction and multiple outlets.",
            "price": Decimal("79.99"),
            "discount_rate": Decimal("25.00"),
            "stock": 40,
            "brand": "Bosch",
            "category_key": "cable reels",
            "isNew": True,
            "is_top_selling": True,
            "technical_specs": {
                "cord_length": "50 feet",
                "gauge": "12 AWG",
                "outlets": "3 outlets",
                "retraction": "Automatic",
                "material": "Heavy-duty plastic",
                "max_current": "15A"
            }
        },
    ]
    
    products = []
    created_count = 0
    
    for product_data in products_data:
        # Find brand and category
        brand = next((b for b in brands if b.name == product_data["brand"]), None)
        category = category_mapping.get(product_data["category_key"])
        
        if not brand:
            print(f"⚠ Skipping product {product_data['name']} - brand '{product_data['brand']}' not found")
            continue
            
        if not category:
            print(f"⚠ Skipping product {product_data['name']} - category '{product_data['category_key']}' not found")
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
            created_count += 1
            print(f"✓ Created product: {product.name} in {category.get_full_path()}")
            
            # Add product image using German.png
            if german_image_path and os.path.exists(german_image_path):
                try:
                    with open(german_image_path, 'rb') as f:
                        product_image = ProductImage.objects.create(product=product)
                        product_image.image.save('German.png', File(f), save=True)
                        print(f"  ✓ Added image to {product.name}")
                except Exception as e:
                    print(f"  ⚠ Failed to add image to {product.name}: {e}")
        else:
            print(f"  - Product {product_data['name']} already exists")
        
        products.append(product)
    
    print(f"\n✓ Created {created_count} new products")
    return products

def main():
    """Main seeding function"""
    print("🚀 Starting comprehensive database seeding...")
    print("=" * 60)
    
    # Copy German.png image
    german_image_path = copy_german_image()
    
    try:
        # Create brands
        print("\n📦 Creating brands...")
        brands = create_brands()
        print(f"✓ Created {len(brands)} brands")
        
        # Get grandchild categories
        print("\n📂 Getting grandchild categories...")
        grandchild_categories = get_grandchild_categories()
        print(f"✓ Found {grandchild_categories.count()} grandchild categories")
        
        # Create products
        print("\n🛍️ Creating products...")
        products = create_comprehensive_products(brands, grandchild_categories, german_image_path)
        
        print("\n" + "=" * 60)
        print("🎉 Database seeding completed successfully!")
        print(f"📊 Summary:")
        print(f"   - Brands: {len(brands)}")
        print(f"   - Grandchild Categories: {grandchild_categories.count()}")
        print(f"   - Products Created: {len(products)}")
        print(f"   - Products with Images: {len([p for p in products if p.images.exists()])}")
        
        # Show some sample products
        print(f"\n📋 Sample Products Created:")
        for product in products[:5]:
            print(f"   - {product.name} ({product.brand.name}) - £{product.price}")
        
        if len(products) > 5:
            print(f"   ... and {len(products) - 5} more products")
            
    except Exception as e:
        print(f"❌ Error during seeding: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
