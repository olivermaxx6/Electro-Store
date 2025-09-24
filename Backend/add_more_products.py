#!/usr/bin/env python
"""
Additional Product Seeding Script
This script adds more products to various grandchild categories to make the system more comprehensive.
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

def add_more_products():
    """Add more products to various grandchild categories"""
    
    # Get German image path
    german_image_path = os.path.join(os.path.dirname(__file__), 'media', 'German.png')
    
    # Get brands and grandchild categories
    brands = {brand.name: brand for brand in Brand.objects.all()}
    grandchild_categories = {cat.name.lower(): cat for cat in Category.objects.filter(parent__parent__isnull=False)}
    
    # Additional products data
    additional_products = [
        # More audio products
        {
            "name": "Professional Studio Headphones",
            "description": "High-fidelity studio headphones for professional audio production and mixing.",
            "price": Decimal("199.99"),
            "discount_rate": Decimal("15.00"),
            "stock": 50,
            "brand": "Sennheiser",
            "category_key": "audio cables & adaptors",
            "isNew": True,
            "is_top_selling": True,
            "technical_specs": {
                "driver_type": "Dynamic",
                "frequency_response": "8Hz-30kHz",
                "impedance": "32 ohms",
                "sensitivity": "106 dB",
                "weight": "280g",
                "cable_length": "3m"
            }
        },
        
        # More lighting products
        {
            "name": "LED Strip Lights RGB",
            "description": "Color-changing LED strip lights with remote control and smartphone app.",
            "price": Decimal("34.99"),
            "discount_rate": Decimal("20.00"),
            "stock": 100,
            "brand": "Philips",
            "category_key": "ceiling lights",
            "isNew": True,
            "is_top_selling": False,
            "technical_specs": {
                "length": "16.4 feet",
                "colors": "16.7 million colors",
                "brightness": "1500 lumens",
                "power": "24W",
                "control": "Remote + App",
                "installation": "Self-adhesive"
            }
        },
        
        # More cable products
        {
            "name": "HDMI Cable 4K Ultra HD",
            "description": "High-speed HDMI cable supporting 4K Ultra HD and HDR content.",
            "price": Decimal("29.99"),
            "discount_rate": Decimal("10.00"),
            "stock": 150,
            "brand": "Sony",
            "category_key": "cable",
            "isNew": False,
            "is_top_selling": True,
            "technical_specs": {
                "length": "6 feet",
                "resolution": "4K Ultra HD",
                "hdr": "HDR10, Dolby Vision",
                "bandwidth": "18 Gbps",
                "ethernet": "Yes",
                "audio_return": "Yes"
            }
        },
        
        # More networking products
        {
            "name": "WiFi 6 Router",
            "description": "High-speed WiFi 6 router with advanced security features and mesh capability.",
            "price": Decimal("149.99"),
            "discount_rate": Decimal("25.00"),
            "stock": 30,
            "brand": "TP-Link",
            "category_key": "ethernet cable",
            "isNew": True,
            "is_top_selling": True,
            "technical_specs": {
                "wifi_standard": "WiFi 6 (802.11ax)",
                "speed": "AX3000",
                "bands": "Dual-band",
                "ports": "4x Gigabit Ethernet",
                "security": "WPA3",
                "mesh": "Yes"
            }
        },
        
        # More extension products
        {
            "name": "Surge Protector Power Strip",
            "description": "Heavy-duty surge protector with 8 outlets and USB charging ports.",
            "price": Decimal("39.99"),
            "discount_rate": Decimal("15.00"),
            "stock": 75,
            "brand": "Bosch",
            "category_key": "extension leads",
            "isNew": False,
            "is_top_selling": True,
            "technical_specs": {
                "outlets": "8 outlets",
                "usb_ports": "2 USB-A",
                "surge_protection": "2700 Joules",
                "cord_length": "6 feet",
                "max_current": "15A",
                "warranty": "Lifetime"
            }
        },
        
        # More chandelier products
        {
            "name": "Modern LED Chandelier",
            "description": "Contemporary LED chandelier with dimmable lights and remote control.",
            "price": Decimal("189.99"),
            "discount_rate": Decimal("20.00"),
            "stock": 20,
            "brand": "Samsung",
            "category_key": "chandeliers",
            "isNew": True,
            "is_top_selling": False,
            "technical_specs": {
                "lights": "6 LED lights",
                "brightness": "1200 lumens",
                "dimmable": "Yes",
                "control": "Remote control",
                "material": "Metal and glass",
                "style": "Modern"
            }
        },
        
        # More outdoor lighting
        {
            "name": "Motion Sensor Security Light",
            "description": "LED security light with motion sensor and dusk-to-dawn operation.",
            "price": Decimal("49.99"),
            "discount_rate": Decimal("18.00"),
            "stock": 60,
            "brand": "Philips",
            "category_key": "decking lights",
            "isNew": True,
            "is_top_selling": True,
            "technical_specs": {
                "brightness": "800 lumens",
                "motion_sensor": "Yes",
                "range": "30 feet",
                "timer": "Dusk-to-dawn",
                "power": "Solar + Battery",
                "weather_rating": "IP65"
            }
        },
        
        # More doorbell products
        {
            "name": "Wireless Doorbell Kit",
            "description": "Wireless doorbell system with multiple chimes and customizable melodies.",
            "price": Decimal("79.99"),
            "discount_rate": Decimal("12.00"),
            "stock": 40,
            "brand": "Ring",
            "category_key": "door bells",
            "isNew": False,
            "is_top_selling": True,
            "technical_specs": {
                "range": "1000 feet",
                "chimes": "2 chimes included",
                "melodies": "52 melodies",
                "volume": "Adjustable",
                "battery_life": "2 years",
                "installation": "Wireless"
            }
        },
        
        # More security products
        {
            "name": "Smart Lock with Keypad",
            "description": "Keyless smart lock with keypad entry and smartphone control.",
            "price": Decimal("179.99"),
            "discount_rate": Decimal("20.00"),
            "stock": 25,
            "brand": "Ring",
            "category_key": "door locks",
            "isNew": True,
            "is_top_selling": False,
            "technical_specs": {
                "entry_methods": "Keypad, smartphone, key",
                "connectivity": "WiFi, Bluetooth",
                "battery_life": "12 months",
                "auto_lock": "Yes",
                "guest_access": "Yes",
                "installation": "Easy DIY"
            }
        },
        
        # More alarm products
        {
            "name": "Wireless Door/Window Sensor",
            "description": "Wireless magnetic sensor for doors and windows with instant alerts.",
            "price": Decimal("24.99"),
            "discount_rate": Decimal("15.00"),
            "stock": 80,
            "brand": "Ring",
            "category_key": "burglar alarms",
            "isNew": True,
            "is_top_selling": True,
            "technical_specs": {
                "type": "Magnetic sensor",
                "range": "1000 feet",
                "battery_life": "3 years",
                "alerts": "Instant notifications",
                "installation": "Wireless",
                "compatibility": "Ring Alarm"
            }
        },
        
        # More safety products
        {
            "name": "Smoke and Heat Detector",
            "description": "Dual-sensor smoke and heat detector with WiFi connectivity.",
            "price": Decimal("69.99"),
            "discount_rate": Decimal("10.00"),
            "stock": 45,
            "brand": "Nest",
            "category_key": "carbon monoxide alarms",
            "isNew": True,
            "is_top_selling": False,
            "technical_specs": {
                "sensors": "Smoke + Heat",
                "connectivity": "WiFi",
                "battery_life": "5 years",
                "alerts": "Mobile notifications",
                "installation": "Easy mount",
                "certification": "UL Listed"
            }
        },
        
        # More bike security
        {
            "name": "Cable Lock with Combination",
            "description": "Flexible cable lock with combination lock for bicycles and motorcycles.",
            "price": Decimal("29.99"),
            "discount_rate": Decimal("25.00"),
            "stock": 90,
            "brand": "Bosch",
            "category_key": "bicycle locks",
            "isNew": False,
            "is_top_selling": True,
            "technical_specs": {
                "length": "6 feet",
                "diameter": "8mm",
                "lock_type": "Combination",
                "material": "Steel cable",
                "weight": "0.8 kg",
                "security_rating": "Sold Secure Silver"
            }
        },
        
        # More electrical components
        {
            "name": "Electrical Junction Box",
            "description": "Weatherproof electrical junction box for outdoor installations.",
            "price": Decimal("15.99"),
            "discount_rate": Decimal("8.00"),
            "stock": 120,
            "brand": "Bosch",
            "category_key": "back boxes",
            "isNew": False,
            "is_top_selling": False,
            "technical_specs": {
                "material": "UV-resistant plastic",
                "weather_rating": "IP65",
                "capacity": "4 cables",
                "installation": "Wall mount",
                "color": "White",
                "standards": "BS EN 60670"
            }
        },
        
        # More connectors
        {
            "name": "Coaxial Cable Connector",
            "description": "Professional coaxial cable connector for TV and satellite installations.",
            "price": Decimal("8.99"),
            "discount_rate": Decimal("10.00"),
            "stock": 200,
            "brand": "TP-Link",
            "category_key": "cable connectors",
            "isNew": False,
            "is_top_selling": True,
            "technical_specs": {
                "type": "F-type connector",
                "impedance": "75 ohms",
                "frequency": "Up to 3 GHz",
                "material": "Gold-plated brass",
                "compatibility": "RG6, RG59",
                "pack_quantity": "10 pieces"
            }
        },
        
        # More cable management
        {
            "name": "Cable Raceway Kit",
            "description": "Complete cable raceway system for organizing cables along walls and baseboards.",
            "price": Decimal("19.99"),
            "discount_rate": Decimal("20.00"),
            "stock": 60,
            "brand": "Bosch",
            "category_key": "cable management",
            "isNew": True,
            "is_top_selling": False,
            "technical_specs": {
                "length": "10 feet",
                "channels": "2 channels",
                "material": "PVC",
                "colors": "White, beige",
                "installation": "Self-adhesive",
                "capacity": "Multiple cables"
            }
        },
        
        # More cable reels
        {
            "name": "Industrial Extension Cord Reel",
            "description": "Heavy-duty industrial extension cord reel with automatic retraction.",
            "price": Decimal("129.99"),
            "discount_rate": Decimal("15.00"),
            "stock": 20,
            "brand": "Bosch",
            "category_key": "cable reels",
            "isNew": True,
            "is_top_selling": True,
            "technical_specs": {
                "cord_length": "100 feet",
                "gauge": "10 AWG",
                "outlets": "4 outlets",
                "retraction": "Automatic",
                "material": "Steel housing",
                "max_current": "20A"
            }
        },
    ]
    
    created_count = 0
    
    for product_data in additional_products:
        # Find brand and category
        brand = brands.get(product_data["brand"])
        category = grandchild_categories.get(product_data["category_key"])
        
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
            if os.path.exists(german_image_path):
                try:
                    with open(german_image_path, 'rb') as f:
                        product_image = ProductImage.objects.create(product=product)
                        product_image.image.save('German.png', File(f), save=True)
                        print(f"  ✓ Added image to {product.name}")
                except Exception as e:
                    print(f"  ⚠ Failed to add image to {product.name}: {e}")
        else:
            print(f"  - Product {product_data['name']} already exists")
    
    return created_count

def main():
    """Main function"""
    print("🚀 Adding more products to the database...")
    print("=" * 50)
    
    try:
        created_count = add_more_products()
        
        print("\n" + "=" * 50)
        print(f"🎉 Successfully added {created_count} more products!")
        
        # Show final counts
        from adminpanel.models import Product
        total_products = Product.objects.count()
        products_with_images = Product.objects.filter(images__isnull=False).distinct().count()
        
        print(f"📊 Final Summary:")
        print(f"   - Total Products: {total_products}")
        print(f"   - Products with Images: {products_with_images}")
        
    except Exception as e:
        print(f"❌ Error adding products: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
