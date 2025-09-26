from django.core.management.base import BaseCommand
from django.core.files.base import ContentFile
from adminpanel.models import ServiceCategory, Service, ServiceImage
import os
from PIL import Image, ImageDraw, ImageFont
import io

class Command(BaseCommand):
    help = 'Seed hierarchical service categories with subcategories and services'

    def create_sample_image(self, text, width=400, height=300, bg_color=(59, 130, 246), text_color=(255, 255, 255)):
        """Create a sample image with text"""
        # Create image
        img = Image.new('RGB', (width, height), bg_color)
        draw = ImageDraw.Draw(img)
        
        # Try to use a font, fallback to default if not available
        try:
            font = ImageFont.truetype("arial.ttf", 24)
        except:
            font = ImageFont.load_default()
        
        # Get text size and center it
        bbox = draw.textbbox((0, 0), text, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
        
        x = (width - text_width) // 2
        y = (height - text_height) // 2
        
        # Draw text
        draw.text((x, y), text, fill=text_color, font=font)
        
        # Save to bytes
        img_io = io.BytesIO()
        img.save(img_io, format='PNG')
        img_io.seek(0)
        
        return ContentFile(img_io.getvalue(), name=f"{text.replace(' ', '_').lower()}.png")

    def handle(self, *args, **options):
        # Clear existing service categories and services
        ServiceCategory.objects.all().delete()
        Service.objects.all().delete()
        
        # Hierarchical service categories data
        categories_data = [
            {
                "name": "Electrical Components",
                "description": "Essential electrical items to complete your home or commercial projects.",
                "ordering": 1,
                "subcategories": [
                    "Back boxes",
                    "Cables", 
                    "Cable connectors",
                    "Switches & sockets",
                    "Wiring"
                ]
            },
            {
                "name": "Home Security & Safety",
                "description": "Complete security solutions to protect your home and family.",
                "ordering": 2,
                "subcategories": [
                    "Security cameras",
                    "Alarm systems",
                    "Door locks",
                    "Motion sensors",
                    "Fire safety"
                ]
            },
            {
                "name": "Indoor Lighting",
                "description": "Beautiful and functional lighting solutions for every room in your home.",
                "ordering": 3,
                "subcategories": [
                    "Ceiling lights",
                    "Wall sconces",
                    "Table lamps",
                    "LED strips",
                    "Smart lighting"
                ]
            },
            {
                "name": "Outdoor Lighting",
                "description": "Illuminate your outdoor spaces with durable and energy-efficient lighting.",
                "ordering": 4,
                "subcategories": [
                    "Garden lights",
                    "Security lights",
                    "Pathway lighting",
                    "Deck lighting",
                    "Solar lights"
                ]
            },
            {
                "name": "Smart Home",
                "description": "Transform your home into a connected, intelligent living space.",
                "ordering": 5,
                "subcategories": [
                    "Smart switches",
                    "Smart outlets",
                    "Home automation",
                    "Voice control",
                    "Smart sensors"
                ]
            },
            {
                "name": "TV, Audio & Networking",
                "description": "Professional installation and setup of entertainment and networking systems.",
                "ordering": 6,
                "subcategories": [
                    "TV installation",
                    "Audio systems",
                    "Home theater",
                    "Network setup",
                    "Cable management"
                ]
            }
        ]

        created_categories = 0
        created_subcategories = 0
        created_services = 0
        
        for category_data in categories_data:
            # Create parent category
            parent_category, created = ServiceCategory.objects.get_or_create(
                name=category_data["name"],
                parent=None,
                defaults={
                    "description": category_data["description"],
                    "ordering": category_data["ordering"]
                }
            )
            
            if created:
                created_categories += 1
                self.stdout.write(
                    self.style.SUCCESS(f'Created parent category: {parent_category.name}')
                )
            
            # Create subcategories
            for subcategory_name in category_data["subcategories"]:
                subcategory, created = ServiceCategory.objects.get_or_create(
                    name=subcategory_name,
                    parent=parent_category,
                    defaults={
                        "description": f"Professional {subcategory_name.lower()} services",
                        "ordering": 0
                    }
                )
                
                if created:
                    created_subcategories += 1
                    self.stdout.write(
                        self.style.SUCCESS(f'Created subcategory: {parent_category.name} / {subcategory.name}')
                    )
        
        # Create sample services for each subcategory
        services_data = [
            # Electrical Components
            {
                "name": "Professional Back Box Installation",
                "category_name": "Back boxes",
                "parent_category": "Electrical Components",
                "description": "Expert installation of electrical back boxes for switches and sockets.",
                "price": 45.00,
                "rating": 4.8,
                "review_count": 24,
                "availability": "Same day"
            },
            {
                "name": "Electrical Cable Installation",
                "category_name": "Cables",
                "parent_category": "Electrical Components", 
                "description": "Professional electrical cable installation and routing services.",
                "price": 85.00,
                "rating": 4.7,
                "review_count": 18,
                "availability": "1-2 days"
            },
            {
                "name": "Cable Connector Installation",
                "category_name": "Cable connectors",
                "parent_category": "Electrical Components",
                "description": "Secure installation of cable connectors and junction boxes.",
                "price": 35.00,
                "rating": 4.9,
                "review_count": 31,
                "availability": "Same day"
            },
            {
                "name": "Switch & Socket Installation",
                "category_name": "Switches & sockets",
                "parent_category": "Electrical Components",
                "description": "Professional installation of switches and electrical sockets.",
                "price": 65.00,
                "rating": 4.8,
                "review_count": 42,
                "availability": "Same day"
            },
            {
                "name": "Electrical Wiring Service",
                "category_name": "Wiring",
                "parent_category": "Electrical Components",
                "description": "Complete electrical wiring solutions for homes and businesses.",
                "price": 120.00,
                "rating": 4.7,
                "review_count": 28,
                "availability": "2-3 days"
            },
            
            # Home Security & Safety
            {
                "name": "Security Camera Installation",
                "category_name": "Security cameras",
                "parent_category": "Home Security & Safety",
                "description": "Professional installation of security camera systems.",
                "price": 150.00,
                "rating": 4.9,
                "review_count": 67,
                "availability": "1-2 days"
            },
            {
                "name": "Alarm System Setup",
                "category_name": "Alarm systems",
                "parent_category": "Home Security & Safety",
                "description": "Complete alarm system installation and configuration.",
                "price": 200.00,
                "rating": 4.8,
                "review_count": 45,
                "availability": "2-3 days"
            },
            {
                "name": "Smart Door Lock Installation",
                "category_name": "Door locks",
                "parent_category": "Home Security & Safety",
                "description": "Installation of smart door locks and access control systems.",
                "price": 95.00,
                "rating": 4.7,
                "review_count": 33,
                "availability": "Same day"
            },
            {
                "name": "Motion Sensor Installation",
                "category_name": "Motion sensors",
                "parent_category": "Home Security & Safety",
                "description": "Professional installation of motion detection sensors.",
                "price": 75.00,
                "rating": 4.6,
                "review_count": 19,
                "availability": "Same day"
            },
            {
                "name": "Fire Safety System Installation",
                "category_name": "Fire safety",
                "parent_category": "Home Security & Safety",
                "description": "Complete fire safety system installation and testing.",
                "price": 180.00,
                "rating": 4.9,
                "review_count": 52,
                "availability": "1-2 days"
            },
            
            # Indoor Lighting
            {
                "name": "Ceiling Light Installation",
                "category_name": "Ceiling lights",
                "parent_category": "Indoor Lighting",
                "description": "Professional installation of ceiling lights and fixtures.",
                "price": 55.00,
                "rating": 4.8,
                "review_count": 38,
                "availability": "Same day"
            },
            {
                "name": "Wall Sconce Installation",
                "category_name": "Wall sconces",
                "parent_category": "Indoor Lighting",
                "description": "Expert installation of wall sconces and decorative lighting.",
                "price": 45.00,
                "rating": 4.7,
                "review_count": 25,
                "availability": "Same day"
            },
            {
                "name": "Table Lamp Setup",
                "category_name": "Table lamps",
                "parent_category": "Indoor Lighting",
                "description": "Professional setup and wiring for table lamps.",
                "price": 25.00,
                "rating": 4.6,
                "review_count": 17,
                "availability": "Same day"
            },
            {
                "name": "LED Strip Installation",
                "category_name": "LED strips",
                "parent_category": "Indoor Lighting",
                "description": "Installation of LED strip lighting for accent and ambient lighting.",
                "price": 65.00,
                "rating": 4.8,
                "review_count": 41,
                "availability": "Same day"
            },
            {
                "name": "Smart Lighting Setup",
                "category_name": "Smart lighting",
                "parent_category": "Indoor Lighting",
                "description": "Complete smart lighting system installation and configuration.",
                "price": 125.00,
                "rating": 4.9,
                "review_count": 58,
                "availability": "1-2 days"
            },
            
            # Outdoor Lighting
            {
                "name": "Garden Light Installation",
                "category_name": "Garden lights",
                "parent_category": "Outdoor Lighting",
                "description": "Professional installation of garden and landscape lighting.",
                "price": 85.00,
                "rating": 4.7,
                "review_count": 29,
                "availability": "1-2 days"
            },
            {
                "name": "Security Light Installation",
                "category_name": "Security lights",
                "parent_category": "Outdoor Lighting",
                "description": "Installation of outdoor security lighting systems.",
                "price": 95.00,
                "rating": 4.8,
                "review_count": 36,
                "availability": "Same day"
            },
            {
                "name": "Pathway Lighting Setup",
                "category_name": "Pathway lighting",
                "parent_category": "Outdoor Lighting",
                "description": "Professional installation of pathway and walkway lighting.",
                "price": 75.00,
                "rating": 4.6,
                "review_count": 22,
                "availability": "Same day"
            },
            {
                "name": "Deck Lighting Installation",
                "category_name": "Deck lighting",
                "parent_category": "Outdoor Lighting",
                "description": "Expert installation of deck and patio lighting systems.",
                "price": 110.00,
                "rating": 4.7,
                "review_count": 34,
                "availability": "1-2 days"
            },
            {
                "name": "Solar Light Installation",
                "category_name": "Solar lights",
                "parent_category": "Outdoor Lighting",
                "description": "Installation of solar-powered outdoor lighting solutions.",
                "price": 65.00,
                "rating": 4.5,
                "review_count": 27,
                "availability": "Same day"
            },
            
            # Smart Home
            {
                "name": "Smart Switch Installation",
                "category_name": "Smart switches",
                "parent_category": "Smart Home",
                "description": "Professional installation of smart light switches.",
                "price": 75.00,
                "rating": 4.8,
                "review_count": 43,
                "availability": "Same day"
            },
            {
                "name": "Smart Outlet Setup",
                "category_name": "Smart outlets",
                "parent_category": "Smart Home",
                "description": "Installation and configuration of smart electrical outlets.",
                "price": 55.00,
                "rating": 4.7,
                "review_count": 31,
                "availability": "Same day"
            },
            {
                "name": "Home Automation Setup",
                "category_name": "Home automation",
                "parent_category": "Smart Home",
                "description": "Complete home automation system installation and setup.",
                "price": 250.00,
                "rating": 4.9,
                "review_count": 67,
                "availability": "2-3 days"
            },
            {
                "name": "Voice Control Setup",
                "category_name": "Voice control",
                "parent_category": "Smart Home",
                "description": "Installation and configuration of voice control systems.",
                "price": 125.00,
                "rating": 4.8,
                "review_count": 52,
                "availability": "1-2 days"
            },
            {
                "name": "Smart Sensor Installation",
                "category_name": "Smart sensors",
                "parent_category": "Smart Home",
                "description": "Professional installation of smart home sensors.",
                "price": 85.00,
                "rating": 4.6,
                "review_count": 28,
                "availability": "Same day"
            },
            
            # TV, Audio & Networking
            {
                "name": "TV Installation Service",
                "category_name": "TV installation",
                "parent_category": "TV, Audio & Networking",
                "description": "Professional TV mounting and installation services.",
                "price": 95.00,
                "rating": 4.8,
                "review_count": 89,
                "availability": "Same day"
            },
            {
                "name": "Audio System Setup",
                "category_name": "Audio systems",
                "parent_category": "TV, Audio & Networking",
                "description": "Complete audio system installation and configuration.",
                "price": 150.00,
                "rating": 4.7,
                "review_count": 45,
                "availability": "1-2 days"
            },
            {
                "name": "Home Theater Installation",
                "category_name": "Home theater",
                "parent_category": "TV, Audio & Networking",
                "description": "Professional home theater system installation.",
                "price": 300.00,
                "rating": 4.9,
                "review_count": 73,
                "availability": "2-3 days"
            },
            {
                "name": "Network Setup Service",
                "category_name": "Network setup",
                "parent_category": "TV, Audio & Networking",
                "description": "Complete home network installation and configuration.",
                "price": 125.00,
                "rating": 4.8,
                "review_count": 56,
                "availability": "1-2 days"
            },
            {
                "name": "Cable Management Service",
                "category_name": "Cable management",
                "parent_category": "TV, Audio & Networking",
                "description": "Professional cable management and organization services.",
                "price": 65.00,
                "rating": 4.6,
                "review_count": 34,
                "availability": "Same day"
            }
        ]

        for service_data in services_data:
            try:
                # Find the subcategory
                subcategory = ServiceCategory.objects.get(
                    name=service_data["category_name"],
                    parent__name=service_data["parent_category"]
                )
                
                service, created = Service.objects.get_or_create(
                    name=service_data["name"],
                    defaults={
                        "description": service_data["description"],
                        "price": service_data["price"],
                        "rating": service_data["rating"],
                        "review_count": service_data["review_count"],
                        "availability": service_data["availability"],
                        "category": subcategory,
                        "key_features": ["Professional Installation", "Quality Service", "Warranty Included"],
                        "included_features": ["Expert installation", "Quality materials", "Warranty coverage", "Customer support"]
                    }
                )
                
                if created:
                    created_services += 1
                    self.stdout.write(
                        self.style.SUCCESS(f'Created service: {service.name}')
                    )
                    
                    # Create sample image for the service
                    try:
                        sample_image = self.create_sample_image(
                            service.name,
                            bg_color=(59, 130, 246) if service_data["parent_category"] == "Electrical Components" else
                                    (16, 185, 129) if service_data["parent_category"] == "Home Security & Safety" else
                                    (245, 101, 101) if service_data["parent_category"] == "Indoor Lighting" else
                                    (139, 92, 246) if service_data["parent_category"] == "Outdoor Lighting" else
                                    (236, 72, 153) if service_data["parent_category"] == "Smart Home" else
                                    (251, 146, 60) if service_data["parent_category"] == "TV, Audio & Networking" else
                                    (59, 130, 246)
                        )
                        
                        service_image = ServiceImage.objects.create(
                            service=service,
                            image=sample_image
                        )
                        
                        self.stdout.write(
                            self.style.SUCCESS(f'Created sample image for: {service.name}')
                        )
                        
                    except Exception as e:
                        self.stdout.write(
                            self.style.WARNING(f'Could not create image for {service.name}: {str(e)}')
                        )
                else:
                    self.stdout.write(
                        self.style.WARNING(f'Service already exists: {service.name}')
                    )
                    
            except ServiceCategory.DoesNotExist:
                self.stdout.write(
                    self.style.ERROR(f'Category not found: {service_data["category_name"]} under {service_data["parent_category"]}')
                )

        self.stdout.write(
            self.style.SUCCESS(f'Successfully created {created_categories} parent categories, {created_subcategories} subcategories, and {created_services} services')
        )
