import random
import json
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.utils import timezone
from adminpanel.models import Product, Brand, Category

class Command(BaseCommand):
    help = "Seed comprehensive product data covering all categories and brands with various discounts"

    def handle(self, *args, **opts):
        self.stdout.write("Starting comprehensive product seeding for all categories...")
        
        # Get all existing brands and categories
        brands = {brand.name: brand for brand in Brand.objects.all()}
        categories = {cat.name: cat for cat in Category.objects.all()}
        
        # Comprehensive product data covering all categories and brands
        products_data = [
            # AUTOMOTIVE PRODUCTS
            {
                "name": "BMW X5 Premium Car Cover",
                "description": "Premium waterproof car cover designed specifically for BMW X5. Protects your vehicle from weather elements and UV damage.",
                "price": 89.99,
                "discount_rate": 15.0,
                "stock": 25,
                "brand": "BMW",
                "category": "Accessories",
                "technical_specs": {
                    "Material": "Waterproof polyester",
                    "Size": "Fits BMW X5 (2019-2024)",
                    "Features": "UV protection, breathable",
                    "Weight": "2.5kg",
                    "Warranty": "2 years"
                }
            },
            {
                "name": "Tesla Model 3 Floor Mats Set",
                "description": "Premium all-weather floor mats designed for Tesla Model 3. Easy to clean and maintain.",
                "price": 129.99,
                "discount_rate": 20.0,
                "stock": 30,
                "brand": "Tesla",
                "category": "Accessories",
                "technical_specs": {
                    "Material": "Premium rubber",
                    "Fit": "Tesla Model 3 (2017-2024)",
                    "Set": "Front and rear mats",
                    "Features": "Non-slip, easy clean",
                    "Color": "Black"
                }
            },
            {
                "name": "BMW Engine Oil Filter",
                "description": "High-quality engine oil filter for BMW vehicles. Ensures optimal engine performance and protection.",
                "price": 24.99,
                "discount_rate": 10.0,
                "stock": 50,
                "brand": "BMW",
                "category": "Car Parts",
                "technical_specs": {
                    "Type": "Oil filter",
                    "Compatibility": "BMW 3 Series, 5 Series",
                    "Material": "Premium paper element",
                    "Service Life": "10,000 miles",
                    "Thread Size": "M20x1.5"
                }
            },
            {
                "name": "Tesla Supercharger Adapter",
                "description": "Universal charging adapter for Tesla vehicles. Compatible with various charging stations.",
                "price": 199.99,
                "discount_rate": 25.0,
                "stock": 20,
                "brand": "Tesla",
                "category": "Car Parts",
                "technical_specs": {
                    "Type": "Charging adapter",
                    "Compatibility": "All Tesla models",
                    "Power": "Up to 150kW",
                    "Connector": "Type 2 to CCS",
                    "Material": "Aluminum housing"
                }
            },
            {
                "name": "Premium Car Wash Kit",
                "description": "Complete car washing kit with premium microfiber towels, wash mitt, and car shampoo.",
                "price": 49.99,
                "discount_rate": 30.0,
                "stock": 40,
                "brand": "Amazon",
                "category": "Car Care",
                "technical_specs": {
                    "Contents": "Wash mitt, microfiber towels, shampoo",
                    "Towels": "4x premium microfiber",
                    "Capacity": "500ml shampoo",
                    "Material": "Microfiber blend",
                    "Suitable For": "All vehicle types"
                }
            },
            {
                "name": "Motorcycle Helmet - Full Face",
                "description": "Premium full-face motorcycle helmet with DOT certification. Advanced ventilation and comfort features.",
                "price": 299.99,
                "discount_rate": 18.0,
                "stock": 15,
                "brand": "BMW",
                "category": "Motorcycle Gear",
                "technical_specs": {
                    "Type": "Full-face helmet",
                    "Certification": "DOT approved",
                    "Shell": "Polycarbonate",
                    "Liner": "Removable, washable",
                    "Weight": "1.4kg",
                    "Sizes": "XS-XXL"
                }
            },
            {
                "name": "Professional Car Diagnostic Tool",
                "description": "Advanced OBD2 diagnostic scanner for professional automotive troubleshooting and maintenance.",
                "price": 159.99,
                "discount_rate": 22.0,
                "stock": 25,
                "brand": "Amazon",
                "category": "Tools",
                "technical_specs": {
                    "Type": "OBD2 scanner",
                    "Compatibility": "All 1996+ vehicles",
                    "Display": "2.8-inch color screen",
                    "Connectivity": "USB, Bluetooth",
                    "Languages": "English, Spanish, French",
                    "Updates": "Free lifetime updates"
                }
            },

            # BOOKS & MEDIA PRODUCTS
            {
                "name": "The Great Gatsby - Classic Edition",
                "description": "F. Scott Fitzgerald's masterpiece in a beautiful hardcover edition with original illustrations.",
                "price": 19.99,
                "discount_rate": 20.0,
                "stock": 60,
                "brand": "Amazon",
                "category": "Fiction",
                "technical_specs": {
                    "Author": "F. Scott Fitzgerald",
                    "Pages": "180",
                    "Format": "Hardcover",
                    "Language": "English",
                    "Publisher": "Classic Publishers",
                    "ISBN": "978-0-7432-7356-5"
                }
            },
            {
                "name": "Python Programming Guide",
                "description": "Comprehensive guide to Python programming for beginners and intermediate developers.",
                "price": 34.99,
                "discount_rate": 15.0,
                "stock": 45,
                "brand": "Microsoft",
                "category": "Books & Media / Educational",
                "technical_specs": {
                    "Author": "Tech Education Team",
                    "Pages": "450",
                    "Format": "Paperback",
                    "Language": "English",
                    "Level": "Beginner to Intermediate",
                    "Includes": "Code examples, exercises"
                }
            },
            {
                "name": "Marvel Cinematic Universe Collection",
                "description": "Complete collection of Marvel movies on Blu-ray with exclusive bonus content and collectible packaging.",
                "price": 199.99,
                "discount_rate": 35.0,
                "stock": 20,
                "brand": "Sony",
                "category": "Books & Media / Movies",
                "technical_specs": {
                    "Format": "Blu-ray",
                    "Movies": "25 films",
                    "Runtime": "50+ hours",
                    "Audio": "Dolby Atmos",
                    "Subtitles": "Multiple languages",
                    "Bonus": "Behind-the-scenes content"
                }
            },
            {
                "name": "Classical Music Collection",
                "description": "Premium classical music collection featuring the greatest composers and orchestras.",
                "price": 49.99,
                "discount_rate": 25.0,
                "stock": 35,
                "brand": "Sony",
                "category": "Books & Media / Music",
                "technical_specs": {
                    "Format": "CD Box Set",
                    "Discs": "10 CDs",
                    "Composers": "Mozart, Beethoven, Bach",
                    "Audio Quality": "High-resolution",
                    "Booklet": "64-page booklet",
                    "Duration": "12+ hours"
                }
            },
            {
                "name": "Business Strategy Handbook",
                "description": "Essential guide to modern business strategy and management practices for entrepreneurs and executives.",
                "price": 29.99,
                "discount_rate": 18.0,
                "stock": 40,
                "brand": "Microsoft",
                "category": "Books & Media / Non-Fiction",
                "technical_specs": {
                    "Author": "Business Experts",
                    "Pages": "320",
                    "Format": "Paperback",
                    "Language": "English",
                    "Topics": "Strategy, Management, Leadership",
                    "Case Studies": "50+ real examples"
                }
            },

            # ELECTRONICS PRODUCTS
            {
                "name": "Samsung Galaxy S24 Ultra",
                "description": "Flagship Android smartphone with S Pen, advanced AI features, and professional-grade camera system.",
                "price": 1299.99,
                "discount_rate": 8.0,
                "stock": 25,
                "brand": "Samsung",
                "category": "Electronics / Smartphones",
                "technical_specs": {
                    "Display": "6.8-inch Dynamic AMOLED 2X",
                    "Processor": "Snapdragon 8 Gen 3",
                    "Storage": "256GB, 512GB, 1TB",
                    "Camera": "200MP Main, 50MP Periscope",
                    "Battery": "5000mAh",
                    "Connectivity": "5G, Wi-Fi 7"
                }
            },
            {
                "name": "Apple iPhone 15 Pro",
                "description": "The most advanced iPhone with titanium design, A17 Pro chip, and advanced camera system.",
                "price": 999.99,
                "discount_rate": 5.0,
                "stock": 30,
                "brand": "Apple",
                "category": "Electronics / Smartphones",
                "technical_specs": {
                    "Display": "6.1-inch Super Retina XDR",
                    "Chip": "A17 Pro",
                    "Storage": "128GB, 256GB, 512GB, 1TB",
                    "Camera": "48MP Main, 12MP Ultra Wide",
                    "Battery": "Up to 23 hours video playback",
                    "Material": "Titanium"
                }
            },
            {
                "name": "Sony WH-1000XM5 Headphones",
                "description": "Premium noise-canceling headphones with industry-leading noise cancellation and exceptional sound quality.",
                "price": 399.99,
                "discount_rate": 20.0,
                "stock": 40,
                "brand": "Sony",
                "category": "Electronics / Headphones",
                "technical_specs": {
                    "Driver": "30mm dynamic",
                    "Noise Cancellation": "Industry-leading",
                    "Battery": "Up to 30 hours",
                    "Connectivity": "Bluetooth 5.2, NFC",
                    "Weight": "250g",
                    "Frequency Response": "4Hz-40kHz"
                }
            },
            {
                "name": "MacBook Pro 16-inch M3",
                "description": "Professional laptop with M3 chip, stunning Liquid Retina XDR display, and all-day battery life.",
                "price": 2499.99,
                "discount_rate": 12.0,
                "stock": 15,
                "brand": "Apple",
                "category": "Electronics / Laptops",
                "technical_specs": {
                    "Chip": "Apple M3",
                    "Display": "16.2-inch Liquid Retina XDR",
                    "Memory": "18GB unified memory",
                    "Storage": "512GB SSD",
                    "Battery": "Up to 22 hours",
                    "Graphics": "10-core GPU"
                }
            },
            {
                "name": "Samsung Galaxy Tab S9",
                "description": "Premium Android tablet with S Pen, stunning AMOLED display, and powerful performance for productivity and creativity.",
                "price": 799.99,
                "discount_rate": 15.0,
                "stock": 20,
                "brand": "Samsung",
                "category": "Electronics / Tablets",
                "technical_specs": {
                    "Display": "11-inch Dynamic AMOLED 2X",
                    "Processor": "Snapdragon 8 Gen 2",
                    "Storage": "128GB, 256GB",
                    "S Pen": "Included",
                    "Battery": "8400mAh",
                    "Connectivity": "5G, Wi-Fi 6E"
                }
            },
            {
                "name": "Sony A7 IV Camera",
                "description": "Full-frame mirrorless camera with 33MP sensor, advanced autofocus, and professional video capabilities.",
                "price": 2498.99,
                "discount_rate": 10.0,
                "stock": 12,
                "brand": "Sony",
                "category": "Electronics / Cameras",
                "technical_specs": {
                    "Sensor": "33MP Full-frame Exmor R CMOS",
                    "Image Processor": "BIONZ XR",
                    "ISO": "100-51200 (expandable to 50-204800)",
                    "Autofocus": "759 phase-detection points",
                    "Video": "4K 60p, 10-bit 4:2:2",
                    "Stabilization": "5-axis in-body"
                }
            },

            # FASHION PRODUCTS
            {
                "name": "Nike Air Max 270",
                "description": "Comfortable running shoes with Max Air cushioning and modern design. Perfect for daily wear and workouts.",
                "price": 129.99,
                "discount_rate": 25.0,
                "stock": 50,
                "brand": "Nike",
                "category": "Fashion / Shoes",
                "technical_specs": {
                    "Type": "Running shoes",
                    "Cushioning": "Max Air 270",
                    "Upper": "Mesh and synthetic",
                    "Sole": "Rubber outsole",
                    "Sizes": "US 6-13",
                    "Colors": "Multiple available"
                }
            },
            {
                "name": "Adidas Ultraboost 22",
                "description": "Premium running shoes with Boost midsole technology and Primeknit upper for ultimate comfort and performance.",
                "price": 179.99,
                "discount_rate": 20.0,
                "stock": 45,
                "brand": "Adidas",
                "category": "Fashion / Shoes",
                "technical_specs": {
                    "Type": "Running shoes",
                    "Midsole": "Boost technology",
                    "Upper": "Primeknit",
                    "Sole": "Continental rubber",
                    "Sizes": "US 6-14",
                    "Weight": "310g (size 9)"
                }
            },
            {
                "name": "Premium Leather Jacket",
                "description": "Classic leather jacket made from genuine leather with modern fit and timeless style.",
                "price": 299.99,
                "discount_rate": 30.0,
                "stock": 25,
                "brand": "Amazon",
                "category": "Fashion / Men's Clothing",
                "technical_specs": {
                    "Material": "Genuine leather",
                    "Lining": "Polyester",
                    "Closure": "Zipper",
                    "Pockets": "4 pockets",
                    "Sizes": "S-XXL",
                    "Care": "Professional cleaning recommended"
                }
            },
            {
                "name": "Designer Handbag",
                "description": "Elegant designer handbag with premium materials and sophisticated design. Perfect for any occasion.",
                "price": 199.99,
                "discount_rate": 35.0,
                "stock": 30,
                "brand": "Amazon",
                "category": "Fashion / Women's Clothing",
                "technical_specs": {
                    "Material": "Premium leather",
                    "Dimensions": "30cm x 20cm x 10cm",
                    "Handle": "Adjustable shoulder strap",
                    "Closure": "Magnetic snap",
                    "Compartments": "Main compartment, zippered pocket",
                    "Color": "Black, Brown, Navy"
                }
            },
            {
                "name": "Gold Chain Necklace",
                "description": "Elegant gold chain necklace with classic design. Perfect gift for special occasions.",
                "price": 149.99,
                "discount_rate": 40.0,
                "stock": 35,
                "brand": "Amazon",
                "category": "Fashion / Jewelry",
                "technical_specs": {
                    "Material": "14K gold plated",
                    "Length": "18 inches",
                    "Chain Type": "Curb chain",
                    "Clasp": "Spring ring",
                    "Weight": "8g",
                    "Packaging": "Gift box included"
                }
            },
            {
                "name": "Smart Watch Band",
                "description": "Premium silicone watch band compatible with Apple Watch and other smartwatches.",
                "price": 29.99,
                "discount_rate": 15.0,
                "stock": 60,
                "brand": "Apple",
                "category": "Fashion / Accessories",
                "technical_specs": {
                    "Compatibility": "Apple Watch Series 4-9",
                    "Material": "Premium silicone",
                    "Sizes": "38mm, 40mm, 42mm, 44mm, 45mm, 49mm",
                    "Colors": "Multiple colors",
                    "Features": "Sweat resistant, easy to clean",
                    "Installation": "Tool-free installation"
                }
            },

            # FOOD & BEVERAGES PRODUCTS
            {
                "name": "Organic Green Tea",
                "description": "Premium organic green tea leaves sourced from high-altitude gardens. Rich in antioxidants and natural flavor.",
                "price": 24.99,
                "discount_rate": 20.0,
                "stock": 80,
                "brand": "Amazon",
                "category": "Food & Beverages / Beverages",
                "technical_specs": {
                    "Type": "Green tea",
                    "Origin": "High-altitude gardens",
                    "Weight": "100g",
                    "Packaging": "Resealable bag",
                    "Caffeine": "Low caffeine",
                    "Antioxidants": "High"
                }
            },
            {
                "name": "Premium Coffee Beans",
                "description": "Single-origin coffee beans roasted to perfection. Rich flavor profile with notes of chocolate and caramel.",
                "price": 19.99,
                "discount_rate": 25.0,
                "stock": 70,
                "brand": "Amazon",
                "category": "Food & Beverages / Beverages",
                "technical_specs": {
                    "Type": "Arabica beans",
                    "Roast": "Medium roast",
                    "Weight": "500g",
                    "Origin": "Colombia",
                    "Flavor": "Chocolate, caramel notes",
                    "Grind": "Whole bean"
                }
            },
            {
                "name": "Organic Olive Oil",
                "description": "Extra virgin organic olive oil cold-pressed from premium olives. Perfect for cooking and dressing.",
                "price": 34.99,
                "discount_rate": 18.0,
                "stock": 45,
                "brand": "Amazon",
                "category": "Food & Beverages / Cooking Ingredients",
                "technical_specs": {
                    "Type": "Extra virgin olive oil",
                    "Volume": "500ml",
                    "Origin": "Mediterranean",
                    "Processing": "Cold-pressed",
                    "Acidity": "Less than 0.3%",
                    "Packaging": "Dark glass bottle"
                }
            },
            {
                "name": "Protein Powder",
                "description": "High-quality whey protein powder for muscle building and recovery. Unflavored for versatility.",
                "price": 49.99,
                "discount_rate": 30.0,
                "stock": 55,
                "brand": "Amazon",
                "category": "Food & Beverages / Supplements",
                "technical_specs": {
                    "Type": "Whey protein isolate",
                    "Protein": "90% protein content",
                    "Weight": "2kg",
                    "Flavor": "Unflavored",
                    "Servings": "66 servings",
                    "Mixability": "Easy mixing"
                }
            },
            {
                "name": "Organic Snack Mix",
                "description": "Healthy organic snack mix with nuts, dried fruits, and seeds. Perfect for on-the-go nutrition.",
                "price": 14.99,
                "discount_rate": 22.0,
                "stock": 90,
                "brand": "Amazon",
                "category": "Food & Beverages / Snacks",
                "technical_specs": {
                    "Ingredients": "Nuts, dried fruits, seeds",
                    "Weight": "200g",
                    "Organic": "100% organic",
                    "Allergens": "Contains nuts",
                    "Shelf Life": "12 months",
                    "Packaging": "Resealable pouch"
                }
            },
            {
                "name": "Organic Honey",
                "description": "Pure organic honey from wildflower sources. Natural sweetness with health benefits.",
                "price": 16.99,
                "discount_rate": 15.0,
                "stock": 65,
                "brand": "Amazon",
                "category": "Food & Beverages / Organic Food",
                "technical_specs": {
                    "Type": "Wildflower honey",
                    "Volume": "340g",
                    "Origin": "Organic farms",
                    "Processing": "Raw, unfiltered",
                    "Color": "Light amber",
                    "Packaging": "Glass jar"
                }
            },

            # HEALTH & BEAUTY PRODUCTS
            {
                "name": "Anti-Aging Serum",
                "description": "Advanced anti-aging serum with hyaluronic acid and vitamin C. Reduces fine lines and improves skin texture.",
                "price": 79.99,
                "discount_rate": 25.0,
                "stock": 40,
                "brand": "Amazon",
                "category": "Health & Beauty / Skincare",
                "technical_specs": {
                    "Active Ingredients": "Hyaluronic acid, Vitamin C",
                    "Volume": "30ml",
                    "Skin Type": "All skin types",
                    "Application": "Morning and evening",
                    "Results": "Visible in 4 weeks",
                    "Packaging": "Airless pump bottle"
                }
            },
            {
                "name": "Premium Makeup Kit",
                "description": "Complete makeup kit with eyeshadows, lipsticks, and foundation. Professional quality for everyday use.",
                "price": 89.99,
                "discount_rate": 35.0,
                "stock": 35,
                "brand": "Amazon",
                "category": "Health & Beauty / Makeup",
                "technical_specs": {
                    "Contents": "Eyeshadow palette, lipsticks, foundation",
                    "Colors": "Neutral and bold shades",
                    "Skin Type": "All skin types",
                    "Application": "Brush included",
                    "Longevity": "12-hour wear",
                    "Packaging": "Gift box"
                }
            },
            {
                "name": "Hair Growth Shampoo",
                "description": "Professional hair growth shampoo with biotin and keratin. Strengthens hair and promotes healthy growth.",
                "price": 29.99,
                "discount_rate": 20.0,
                "stock": 50,
                "brand": "Amazon",
                "category": "Health & Beauty / Hair Care",
                "technical_specs": {
                    "Active Ingredients": "Biotin, Keratin",
                    "Volume": "300ml",
                    "Hair Type": "All hair types",
                    "Usage": "Daily use",
                    "Results": "Visible in 4-6 weeks",
                    "Sulfate-Free": "Yes"
                }
            },
            {
                "name": "Multivitamin Supplements",
                "description": "Comprehensive multivitamin supplement with essential vitamins and minerals for overall health and wellness.",
                "price": 39.99,
                "discount_rate": 30.0,
                "stock": 60,
                "brand": "Amazon",
                "category": "Health & Beauty / Health Supplements",
                "technical_specs": {
                    "Vitamins": "13 essential vitamins",
                    "Minerals": "11 essential minerals",
                    "Count": "60 tablets",
                    "Dosage": "1 tablet daily",
                    "Age": "Adults 18+",
                    "Packaging": "Bottle with child-resistant cap"
                }
            },
            {
                "name": "Electric Toothbrush",
                "description": "Advanced electric toothbrush with sonic technology and multiple cleaning modes for optimal oral hygiene.",
                "price": 99.99,
                "discount_rate": 15.0,
                "stock": 45,
                "brand": "Amazon",
                "category": "Health & Beauty / Personal Care",
                "technical_specs": {
                    "Technology": "Sonic technology",
                    "Modes": "5 cleaning modes",
                    "Battery": "2-week battery life",
                    "Charging": "USB-C charging",
                    "Timer": "2-minute timer",
                    "Included": "2 brush heads"
                }
            },

            # HOME & GARDEN PRODUCTS
            {
                "name": "Smart LED Light Bulbs",
                "description": "WiFi-enabled smart LED light bulbs with color changing capabilities and voice control integration.",
                "price": 49.99,
                "discount_rate": 40.0,
                "stock": 30,
                "brand": "Google",
                "category": "Home & Garden / Lighting",
                "technical_specs": {
                    "Type": "Smart LED bulbs",
                    "Wattage": "9W (60W equivalent)",
                    "Colors": "16 million colors",
                    "Control": "Voice, app, switch",
                    "Compatibility": "Google Home, Alexa",
                    "Pack": "4 bulbs"
                }
            },
            {
                "name": "Modern Coffee Table",
                "description": "Contemporary coffee table with clean lines and premium materials. Perfect centerpiece for any living room.",
                "price": 399.99,
                "discount_rate": 25.0,
                "stock": 15,
                "brand": "Amazon",
                "category": "Home & Garden / Furniture",
                "technical_specs": {
                    "Material": "Solid wood and metal",
                    "Dimensions": "120cm x 60cm x 45cm",
                    "Weight": "25kg",
                    "Assembly": "Required",
                    "Finish": "Natural wood",
                    "Style": "Modern"
                }
            },
            {
                "name": "Indoor Plant Set",
                "description": "Collection of easy-care indoor plants perfect for beginners. Includes various species for home decoration.",
                "price": 79.99,
                "discount_rate": 20.0,
                "stock": 25,
                "brand": "Amazon",
                "category": "Home & Garden / Home Decor",
                "technical_specs": {
                    "Plants": "5 different species",
                    "Pot Size": "Various sizes",
                    "Care Level": "Easy",
                    "Light": "Low to medium light",
                    "Watering": "Weekly",
                    "Included": "Care instructions"
                }
            },
            {
                "name": "Professional Garden Tools Set",
                "description": "Complete set of professional garden tools for all your gardening needs. Durable and ergonomic design.",
                "price": 129.99,
                "discount_rate": 30.0,
                "stock": 20,
                "brand": "Amazon",
                "category": "Home & Garden / Garden Tools",
                "technical_specs": {
                    "Tools": "8-piece set",
                    "Materials": "Stainless steel heads",
                    "Handles": "Ergonomic wooden handles",
                    "Storage": "Canvas tool bag",
                    "Warranty": "2 years",
                    "Weight": "3.5kg"
                }
            },
            {
                "name": "Smart Kitchen Scale",
                "description": "Digital kitchen scale with precision weighing and smart features. Perfect for cooking and baking.",
                "price": 39.99,
                "discount_rate": 22.0,
                "stock": 40,
                "brand": "Amazon",
                "category": "Home & Garden / Kitchen Appliances",
                "technical_specs": {
                    "Capacity": "5kg",
                    "Precision": "1g accuracy",
                    "Display": "LCD display",
                    "Units": "g, oz, lb, ml",
                    "Features": "Tare function, auto-off",
                    "Power": "Battery powered"
                }
            },

            # OFFICE SUPPLIES PRODUCTS
            {
                "name": "Ergonomic Office Chair",
                "description": "Professional ergonomic office chair with lumbar support and adjustable features for all-day comfort.",
                "price": 299.99,
                "discount_rate": 20.0,
                "stock": 20,
                "brand": "Microsoft",
                "category": "Office Supplies / Furniture",
                "technical_specs": {
                    "Seat Height": "Adjustable 40-52cm",
                    "Weight Capacity": "120kg",
                    "Materials": "Mesh back, foam seat",
                    "Armrests": "Adjustable",
                    "Warranty": "5 years",
                    "Assembly": "Required"
                }
            },
            {
                "name": "Wireless Mechanical Keyboard",
                "description": "Premium wireless mechanical keyboard with RGB lighting and customizable keys. Perfect for productivity and gaming.",
                "price": 149.99,
                "discount_rate": 15.0,
                "stock": 35,
                "brand": "Microsoft",
                "category": "Office Supplies / Computers",
                "technical_specs": {
                    "Type": "Mechanical keyboard",
                    "Switches": "Cherry MX Blue",
                    "Connectivity": "Bluetooth, USB",
                    "Battery": "Up to 6 months",
                    "Lighting": "RGB backlighting",
                    "Compatibility": "Windows, macOS"
                }
            },
            {
                "name": "Professional Printer",
                "description": "High-quality laser printer for home and office use. Fast printing with excellent quality and reliability.",
                "price": 199.99,
                "discount_rate": 25.0,
                "stock": 25,
                "brand": "Microsoft",
                "category": "Office Supplies / Printers",
                "technical_specs": {
                    "Type": "Laser printer",
                    "Speed": "25 pages per minute",
                    "Resolution": "1200 x 1200 dpi",
                    "Connectivity": "USB, Wi-Fi",
                    "Paper Size": "A4, Letter",
                    "Duplex": "Automatic"
                }
            },
            {
                "name": "Premium Stationery Set",
                "description": "Complete stationery set with pens, notebooks, and accessories. Professional quality for office and home use.",
                "price": 49.99,
                "discount_rate": 30.0,
                "stock": 50,
                "brand": "Amazon",
                "category": "Office Supplies / Stationery",
                "technical_specs": {
                    "Contents": "Pens, notebooks, sticky notes",
                    "Pens": "5 gel pens",
                    "Notebooks": "3 spiral notebooks",
                    "Colors": "Various colors",
                    "Packaging": "Gift box",
                    "Quality": "Professional grade"
                }
            },
            {
                "name": "Office Productivity Software",
                "description": "Complete office productivity suite with word processing, spreadsheet, and presentation software.",
                "price": 99.99,
                "discount_rate": 40.0,
                "stock": 100,
                "brand": "Microsoft",
                "category": "Office Supplies / Software",
                "technical_specs": {
                    "Applications": "Word, Excel, PowerPoint",
                    "License": "1-year subscription",
                    "Users": "1 user",
                    "Storage": "1TB cloud storage",
                    "Platforms": "Windows, macOS, mobile",
                    "Support": "24/7 support"
                }
            },

            # SPORTS & OUTDOORS PRODUCTS
            {
                "name": "Nike Dri-FIT Training T-Shirt",
                "description": "Performance training t-shirt with moisture-wicking technology. Perfect for workouts and sports activities.",
                "price": 34.99,
                "discount_rate": 20.0,
                "stock": 60,
                "brand": "Nike",
                "category": "Sports & Outdoors / Sports Apparel",
                "technical_specs": {
                    "Material": "Dri-FIT polyester",
                    "Technology": "Moisture-wicking",
                    "Fit": "Regular fit",
                    "Sizes": "XS-XXL",
                    "Colors": "Multiple colors",
                    "Care": "Machine washable"
                }
            },
            {
                "name": "Adidas Running Shorts",
                "description": "Comfortable running shorts with built-in liner and moisture-wicking fabric. Ideal for running and training.",
                "price": 29.99,
                "discount_rate": 25.0,
                "stock": 55,
                "brand": "Adidas",
                "category": "Sports & Outdoors / Sports Apparel",
                "technical_specs": {
                    "Material": "Climalite polyester",
                    "Features": "Built-in liner, moisture-wicking",
                    "Length": "7-inch inseam",
                    "Sizes": "XS-XXL",
                    "Pockets": "Side pockets",
                    "Elastic": "Elastic waistband"
                }
            },
            {
                "name": "Camping Tent 4-Person",
                "description": "Durable 4-person camping tent with easy setup and weather protection. Perfect for family camping trips.",
                "price": 199.99,
                "discount_rate": 30.0,
                "stock": 20,
                "brand": "Amazon",
                "category": "Sports & Outdoors / Camping",
                "technical_specs": {
                    "Capacity": "4 people",
                    "Dimensions": "240cm x 240cm x 150cm",
                    "Weight": "3.2kg",
                    "Material": "Polyester with PU coating",
                    "Setup": "Quick setup",
                    "Weather": "Waterproof"
                }
            },
            {
                "name": "Adjustable Dumbbells Set",
                "description": "Space-saving adjustable dumbbells with multiple weight options. Perfect for home gym and strength training.",
                "price": 299.99,
                "discount_rate": 15.0,
                "stock": 15,
                "brand": "Amazon",
                "category": "Sports & Outdoors / Fitness Equipment",
                "technical_specs": {
                    "Weight Range": "5-25kg per dumbbell",
                    "Adjustment": "Quick-adjust system",
                    "Material": "Cast iron plates",
                    "Storage": "Compact design",
                    "Grip": "Ergonomic handles",
                    "Warranty": "2 years"
                }
            },
            {
                "name": "Waterproof Hiking Backpack",
                "description": "Professional hiking backpack with waterproof technology and multiple compartments. Ideal for outdoor adventures.",
                "price": 149.99,
                "discount_rate": 25.0,
                "stock": 30,
                "brand": "Amazon",
                "category": "Sports & Outdoors / Outdoor Gear",
                "technical_specs": {
                    "Capacity": "40 liters",
                    "Material": "Ripstop nylon",
                    "Waterproof": "TPU coating",
                    "Compartments": "Multiple pockets",
                    "Weight": "1.2kg",
                    "Features": "Rain cover included"
                }
            },
            {
                "name": "Inflatable Kayak",
                "description": "Portable inflatable kayak perfect for water sports and outdoor adventures. Easy to transport and store.",
                "price": 399.99,
                "discount_rate": 20.0,
                "stock": 10,
                "brand": "Amazon",
                "category": "Sports & Outdoors / Water Sports",
                "technical_specs": {
                    "Capacity": "2 people",
                    "Length": "3.2 meters",
                    "Weight": "15kg",
                    "Material": "PVC",
                    "Inflation": "Hand pump included",
                    "Storage": "Compact when deflated"
                }
            },

            # TOYS & GAMES PRODUCTS
            {
                "name": "LEGO Creator Set",
                "description": "Creative LEGO building set with multiple build options. Encourages creativity and problem-solving skills.",
                "price": 79.99,
                "discount_rate": 30.0,
                "stock": 40,
                "brand": "Amazon",
                "category": "Toys & Games / Educational Toys",
                "technical_specs": {
                    "Pieces": "500+ pieces",
                    "Age": "8+ years",
                    "Builds": "3 different models",
                    "Instructions": "Step-by-step guide",
                    "Storage": "Storage box included",
                    "Skills": "Creativity, problem-solving"
                }
            },
            {
                "name": "Action Figure Collection",
                "description": "Premium action figure collection with detailed sculpting and articulation. Perfect for collectors and kids.",
                "price": 24.99,
                "discount_rate": 25.0,
                "stock": 50,
                "brand": "Amazon",
                "category": "Toys & Games / Action Figures",
                "technical_specs": {
                    "Height": "15cm",
                    "Articulation": "Multiple points",
                    "Accessories": "Weapons and accessories",
                    "Material": "PVC plastic",
                    "Packaging": "Collector packaging",
                    "Age": "6+ years"
                }
            },
            {
                "name": "Board Game Collection",
                "description": "Family board game collection with multiple games for all ages. Perfect for family game nights.",
                "price": 59.99,
                "discount_rate": 35.0,
                "stock": 35,
                "brand": "Amazon",
                "category": "Toys & Games / Board Games",
                "technical_specs": {
                    "Games": "4 different games",
                    "Players": "2-6 players",
                    "Age": "8+ years",
                    "Duration": "30-60 minutes",
                    "Components": "Cards, tokens, board",
                    "Storage": "Box with compartments"
                }
            },
            {
                "name": "Outdoor Play Set",
                "description": "Complete outdoor play set with slides, swings, and climbing features. Perfect for backyard fun.",
                "price": 499.99,
                "discount_rate": 20.0,
                "stock": 8,
                "brand": "Amazon",
                "category": "Toys & Games / Outdoor Toys",
                "technical_specs": {
                    "Components": "Slide, swing, climbing wall",
                    "Age": "3-10 years",
                    "Weight Limit": "100kg",
                    "Material": "Steel and plastic",
                    "Assembly": "Required",
                    "Safety": "Safety tested"
                }
            },
            {
                "name": "Video Game Console",
                "description": "Latest gaming console with advanced graphics and exclusive games. Perfect for gaming enthusiasts.",
                "price": 499.99,
                "discount_rate": 10.0,
                "stock": 12,
                "brand": "Sony",
                "category": "Toys & Games / Video Games",
                "technical_specs": {
                    "Type": "Gaming console",
                    "Storage": "1TB SSD",
                    "Graphics": "4K gaming",
                    "Controller": "Wireless controller included",
                    "Games": "Exclusive titles",
                    "Online": "Online multiplayer"
                }
            }
        ]

        # Create products
        created_count = 0
        skipped_count = 0
        
        for product_data in products_data:
            # Check if product already exists
            if Product.objects.filter(name=product_data["name"]).exists():
                skipped_count += 1
                continue
                
            try:
                product = Product.objects.create(
                    name=product_data["name"],
                    description=product_data["description"],
                    price=product_data["price"],
                    discount_rate=product_data["discount_rate"],
                    stock=product_data["stock"],
                    brand=brands.get(product_data["brand"]),
                    category=categories.get(product_data["category"]),
                    technical_specs=product_data["technical_specs"]
                )
                created_count += 1
                self.stdout.write(f"Created product: {product_data['name']}")
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Error creating {product_data['name']}: {str(e)}"))
                skipped_count += 1

        self.stdout.write(self.style.SUCCESS(f"Product seeding completed!"))
        self.stdout.write(f"Created: {created_count} new products")
        self.stdout.write(f"Skipped: {skipped_count} products (already exist)")
        self.stdout.write(f"Total products in database: {Product.objects.count()}")
        
        # Show category distribution
        self.stdout.write("\nCategory distribution:")
        for category in Category.objects.all():
            count = Product.objects.filter(category=category).count()
            if count > 0:
                self.stdout.write(f"  {category}: {count} products")
        
        # Show brand distribution
        self.stdout.write("\nBrand distribution:")
        for brand in Brand.objects.all():
            count = Product.objects.filter(brand=brand).count()
            if count > 0:
                self.stdout.write(f"  {brand}: {count} products")
