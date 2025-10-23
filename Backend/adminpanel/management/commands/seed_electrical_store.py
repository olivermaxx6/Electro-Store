#!/usr/bin/env python3
"""
Comprehensive electrical store data seeding script.
Creates electrical categories, brands, products, and services with realistic data for an electrical store.
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
    help = 'Seed the database with electrical store categories, brands, products, and services'

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
        
        self.stdout.write(self.style.SUCCESS('Starting electrical store data seeding...'))
        
        with transaction.atomic():
            # Create electrical categories with 3-level hierarchy
            categories = self.create_electrical_categories()
            
            # Create electrical brands
            brands = self.create_electrical_brands()
            
            # Create products in grandchild categories
            products = self.create_electrical_products(categories, brands)
            
            # Create electrical service categories and services
            service_categories = self.create_electrical_service_categories()
            services = self.create_electrical_services(service_categories)
            
        self.stdout.write(self.style.SUCCESS('Electrical store data seeding completed successfully!'))
        self.print_summary(categories, brands, products, service_categories, services)

    def clear_data(self):
        """Clear existing data"""
        ServiceImage.objects.all().delete()
        Service.objects.all().delete()
        ServiceCategory.objects.all().delete()
        ProductImage.objects.all().delete()
        Product.objects.all().delete()
        Brand.objects.all().delete()
        Category.objects.all().delete()

    def create_electrical_categories(self):
        """Create electrical categories with 3-level hierarchy (parent -> child -> grandchild)"""
        self.stdout.write('Creating electrical categories with 3-level hierarchy...')
        
        categories_data = [
            {
                'name': 'Lighting',
                'slogan': 'Illuminate your space with premium lighting solutions',
                'children': [
                    {
                        'name': 'LED Lighting',
                        'children': [
                            'LED Bulbs',
                            'LED Strips',
                            'LED Panels',
                            'LED Downlights',
                            'LED Floodlights'
                        ]
                    },
                    {
                        'name': 'Traditional Lighting',
                        'children': [
                            'Incandescent Bulbs',
                            'Halogen Bulbs',
                            'Fluorescent Tubes',
                            'CFL Bulbs',
                            'Chandeliers'
                        ]
                    },
                    {
                        'name': 'Smart Lighting',
                        'children': [
                            'Smart Bulbs',
                            'Smart Switches',
                            'Motion Sensors',
                            'Dimmers',
                            'Smart Controllers'
                        ]
                    }
                ]
            },
            {
                'name': 'Electrical Components',
                'slogan': 'Essential electrical components for every project',
                'children': [
                    {
                        'name': 'Switches & Sockets',
                        'children': [
                            'Single Switches',
                            'Double Switches',
                            'Socket Outlets',
                            'USB Sockets',
                            'Switch Sockets'
                        ]
                    },
                    {
                        'name': 'Cables & Wires',
                        'children': [
                            'Power Cables',
                            'Data Cables',
                            'Coaxial Cables',
                            'Fiber Optic Cables',
                            'Control Cables'
                        ]
                    },
                    {
                        'name': 'Circuit Protection',
                        'children': [
                            'Circuit Breakers',
                            'Fuses',
                            'RCDs',
                            'Surge Protectors',
                            'Isolators'
                        ]
                    }
                ]
            },
            {
                'name': 'Industrial Equipment',
                'slogan': 'Professional industrial electrical solutions',
                'children': [
                    {
                        'name': 'Motors & Drives',
                        'children': [
                            'AC Motors',
                            'DC Motors',
                            'Servo Motors',
                            'Variable Frequency Drives',
                            'Motor Starters'
                        ]
                    },
                    {
                        'name': 'Control Systems',
                        'children': [
                            'PLC Systems',
                            'HMI Panels',
                            'Control Panels',
                            'Relays',
                            'Contactors'
                        ]
                    },
                    {
                        'name': 'Power Distribution',
                        'children': [
                            'Distribution Boards',
                            'Busbars',
                            'Power Meters',
                            'Transformers',
                            'UPS Systems'
                        ]
                    }
                ]
            },
            {
                'name': 'Home Automation',
                'slogan': 'Transform your home with smart automation',
                'children': [
                    {
                        'name': 'Smart Home Hub',
                        'children': [
                            'Central Controllers',
                            'Gateway Devices',
                            'Bridge Modules',
                            'Protocol Converters',
                            'Network Extenders'
                        ]
                    },
                    {
                        'name': 'Security Systems',
                        'children': [
                            'Security Cameras',
                            'Door Sensors',
                            'Motion Detectors',
                            'Alarm Systems',
                            'Access Control'
                        ]
                    },
                    {
                        'name': 'Climate Control',
                        'children': [
                            'Smart Thermostats',
                            'HVAC Controllers',
                            'Temperature Sensors',
                            'Humidity Controllers',
                            'Air Quality Monitors'
                        ]
                    }
                ]
            },
            {
                'name': 'Renewable Energy',
                'slogan': 'Sustainable energy solutions for the future',
                'children': [
                    {
                        'name': 'Solar Power',
                        'children': [
                            'Solar Panels',
                            'Solar Inverters',
                            'Solar Batteries',
                            'Solar Controllers',
                            'Solar Mounting'
                        ]
                    },
                    {
                        'name': 'Wind Power',
                        'children': [
                            'Wind Turbines',
                            'Wind Controllers',
                            'Wind Batteries',
                            'Wind Monitoring',
                            'Wind Accessories'
                        ]
                    },
                    {
                        'name': 'Energy Storage',
                        'children': [
                            'Lithium Batteries',
                            'Lead Acid Batteries',
                            'Battery Management',
                            'Energy Monitors',
                            'Backup Systems'
                        ]
                    }
                ]
            },
            {
                'name': 'Tools & Equipment',
                'slogan': 'Professional tools for electrical work',
                'children': [
                    {
                        'name': 'Hand Tools',
                        'children': [
                            'Wire Strippers',
                            'Crimping Tools',
                            'Multimeters',
                            'Voltage Testers',
                            'Screwdrivers'
                        ]
                    },
                    {
                        'name': 'Power Tools',
                        'children': [
                            'Drills',
                            'Saws',
                            'Grinders',
                            'Impact Drivers',
                            'Rotary Tools'
                        ]
                    },
                    {
                        'name': 'Safety Equipment',
                        'children': [
                            'Safety Helmets',
                            'Insulated Gloves',
                            'Safety Glasses',
                            'Protective Clothing',
                            'First Aid Kits'
                        ]
                    }
                ]
            }
        ]
        
        categories = []
        for parent_data in categories_data:
            # Create parent category
            parent_category = Category.objects.create(
                name=parent_data['name'],
                slogan=parent_data['slogan']
            )
            categories.append(parent_category)
            
            # Create child categories
            for child_data in parent_data['children']:
                child_category = Category.objects.create(
                    name=child_data['name'],
                    parent=parent_category
                )
                categories.append(child_category)
                
                # Create grandchild categories
                for grandchild_name in child_data['children']:
                    grandchild_category = Category.objects.create(
                        name=grandchild_name,
                        parent=child_category
                    )
                    categories.append(grandchild_category)
        
        self.stdout.write(f'Created {len(categories)} categories (including subcategories)')
        return categories

    def create_electrical_brands(self):
        """Create electrical industry brands"""
        self.stdout.write('Creating electrical brands...')
        
        brands_data = [
            {'name': 'Siemens', 'description': 'German multinational technology company'},
            {'name': 'Schneider Electric', 'description': 'French multinational energy management company'},
            {'name': 'ABB', 'description': 'Swiss-Swedish multinational corporation'},
            {'name': 'Eaton', 'description': 'American multinational power management company'},
            {'name': 'Legrand', 'description': 'French multinational electrical equipment manufacturer'},
            {'name': 'Philips', 'description': 'Dutch multinational technology company'},
            {'name': 'Osram', 'description': 'German multinational lighting manufacturer'},
            {'name': 'Cree', 'description': 'American LED lighting manufacturer'},
            {'name': 'Honeywell', 'description': 'American multinational conglomerate'},
            {'name': 'Schneider', 'description': 'Global specialist in energy management'},
            {'name': 'GE', 'description': 'American multinational conglomerate'},
            {'name': 'Panasonic', 'description': 'Japanese multinational electronics corporation'},
            {'name': 'Mitsubishi Electric', 'description': 'Japanese multinational electronics company'},
            {'name': 'Rockwell Automation', 'description': 'American industrial automation company'},
            {'name': 'Emerson', 'description': 'American multinational technology company'}
        ]
        
        brands = []
        for brand_data in brands_data:
            brand = Brand.objects.create(name=brand_data['name'])
            brands.append(brand)
        
        self.stdout.write(f'Created {len(brands)} electrical brands')
        return brands

    def create_electrical_products(self, categories, brands):
        """Create electrical products in grandchild categories"""
        self.stdout.write('Creating electrical products...')
        
        products_data = [
            # LED Lighting Products
            {'name': 'Siemens LED Bulb 9W E27', 'price': 12.99, 'brand': 'Siemens', 'category': 'LED Bulbs', 
             'description': 'Energy-efficient LED bulb with 806 lumens output', 'stock': 150,
             'technical_specs': {'wattage': '9W', 'lumen': '806', 'color_temp': '2700K', 'life_hours': '25000', 'base': 'E27'}},
            {'name': 'Philips LED Strip 5m RGB', 'price': 45.99, 'brand': 'Philips', 'category': 'LED Strips',
             'description': 'Flexible RGB LED strip with remote control', 'stock': 80,
             'technical_specs': {'length': '5m', 'power': '24W', 'color': 'RGB', 'ip_rating': 'IP65', 'voltage': '12V'}},
            {'name': 'Osram LED Panel 600x600', 'price': 89.99, 'brand': 'Osram', 'category': 'LED Panels',
             'description': 'Commercial LED panel for office lighting', 'stock': 60,
             'technical_specs': {'size': '600x600mm', 'wattage': '36W', 'lumen': '3600', 'color_temp': '4000K', 'dimming': 'Yes'}},
            {'name': 'Cree LED Downlight 12W', 'price': 35.99, 'brand': 'Cree', 'category': 'LED Downlights',
             'description': 'Recessed LED downlight with adjustable beam angle', 'stock': 120,
             'technical_specs': {'wattage': '12W', 'lumen': '1200', 'beam_angle': '120°', 'dimmable': 'Yes', 'cutout': '150mm'}},
            {'name': 'Schneider LED Floodlight 50W', 'price': 125.99, 'brand': 'Schneider Electric', 'category': 'LED Floodlights',
             'description': 'High-power LED floodlight for outdoor use', 'stock': 40,
             'technical_specs': {'wattage': '50W', 'lumen': '5000', 'ip_rating': 'IP65', 'color_temp': '5000K', 'beam_angle': '120°'}},
            
            # Smart Lighting Products
            {'name': 'Philips Hue Smart Bulb', 'price': 29.99, 'brand': 'Philips', 'category': 'Smart Bulbs',
             'description': 'WiFi-enabled smart bulb with color changing', 'stock': 200,
             'technical_specs': {'wattage': '9W', 'lumen': '800', 'wifi': 'Yes', 'app_control': 'Yes', 'voice_control': 'Yes'}},
            {'name': 'Legrand Smart Switch', 'price': 45.99, 'brand': 'Legrand', 'category': 'Smart Switches',
             'description': 'WiFi smart switch with scheduling', 'stock': 100,
             'technical_specs': {'wifi': 'Yes', 'scheduling': 'Yes', 'remote_control': 'Yes', 'load': '16A', 'voltage': '230V'}},
            {'name': 'Honeywell Motion Sensor', 'price': 25.99, 'brand': 'Honeywell', 'category': 'Motion Sensors',
             'description': 'PIR motion sensor for automatic lighting', 'stock': 150,
             'technical_specs': {'detection_range': '12m', 'angle': '180°', 'time_delay': '30s-15min', 'voltage': '12V', 'ip_rating': 'IP44'}},
            
            # Electrical Components
            {'name': 'Schneider Single Switch', 'price': 8.99, 'brand': 'Schneider Electric', 'category': 'Single Switches',
             'description': 'High-quality single pole switch', 'stock': 300,
             'technical_specs': {'poles': '1', 'current': '16A', 'voltage': '250V', 'material': 'Thermoplastic', 'certification': 'CE'}},
            {'name': 'Legrand USB Socket', 'price': 35.99, 'brand': 'Legrand', 'category': 'USB Sockets',
             'description': 'Socket outlet with integrated USB charging', 'stock': 120,
             'technical_specs': {'usb_ports': '2', 'usb_power': '3.1A', 'socket_type': 'Type G', 'current': '13A', 'voltage': '230V'}},
            {'name': 'Siemens Circuit Breaker 16A', 'price': 45.99, 'brand': 'Siemens', 'category': 'Circuit Breakers',
             'description': 'Type B circuit breaker for residential use', 'stock': 200,
             'technical_specs': {'current': '16A', 'type': 'Type B', 'voltage': '230V', 'breaking_capacity': '6kA', 'poles': '1'}},
            {'name': 'ABB RCD 30mA', 'price': 65.99, 'brand': 'ABB', 'category': 'RCDs',
             'description': 'Residual Current Device for safety protection', 'stock': 150,
             'technical_specs': {'sensitivity': '30mA', 'current': '63A', 'voltage': '230V', 'type': 'Type AC', 'poles': '2'}},
            
            # Industrial Equipment
            {'name': 'Siemens AC Motor 1.5kW', 'price': 450.99, 'brand': 'Siemens', 'category': 'AC Motors',
             'description': 'Three-phase induction motor for industrial use', 'stock': 25,
             'technical_specs': {'power': '1.5kW', 'voltage': '400V', 'frequency': '50Hz', 'speed': '1440rpm', 'efficiency': 'IE3'}},
            {'name': 'ABB VFD 2.2kW', 'price': 350.99, 'brand': 'ABB', 'category': 'Variable Frequency Drives',
             'description': 'Variable frequency drive for motor control', 'stock': 30,
             'technical_specs': {'power': '2.2kW', 'voltage': '400V', 'frequency': '0-400Hz', 'control': 'Vector', 'display': 'LCD'}},
            {'name': 'Schneider PLC Controller', 'price': 850.99, 'brand': 'Schneider Electric', 'category': 'PLC Systems',
             'description': 'Programmable Logic Controller for automation', 'stock': 15,
             'technical_specs': {'inputs': '24', 'outputs': '16', 'memory': '32KB', 'communication': 'Ethernet', 'programming': 'Ladder'}},
            
            # Home Automation
            {'name': 'Honeywell Smart Thermostat', 'price': 199.99, 'brand': 'Honeywell', 'category': 'Smart Thermostats',
             'description': 'WiFi-enabled smart thermostat with app control', 'stock': 50,
             'technical_specs': {'wifi': 'Yes', 'app_control': 'Yes', 'scheduling': 'Yes', 'display': 'Touch', 'compatibility': 'Multi'}},
            {'name': 'Philips Security Camera', 'price': 125.99, 'brand': 'Philips', 'category': 'Security Cameras',
             'description': 'HD security camera with night vision', 'stock': 80,
             'technical_specs': {'resolution': '1080p', 'night_vision': 'Yes', 'wifi': 'Yes', 'storage': 'SD Card', 'viewing_angle': '110°'}},
            
            # Renewable Energy
            {'name': 'Panasonic Solar Panel 330W', 'price': 299.99, 'brand': 'Panasonic', 'category': 'Solar Panels',
             'description': 'High-efficiency monocrystalline solar panel', 'stock': 40,
             'technical_specs': {'power': '330W', 'efficiency': '19.7%', 'voltage': '37V', 'current': '8.9A', 'warranty': '25 years'}},
            {'name': 'SMA Solar Inverter 3kW', 'price': 850.99, 'brand': 'Siemens', 'category': 'Solar Inverters',
             'description': 'String inverter for residential solar systems', 'stock': 20,
             'technical_specs': {'power': '3kW', 'efficiency': '97.5%', 'voltage': '230V', 'frequency': '50Hz', 'warranty': '10 years'}},
            {'name': 'Tesla Powerwall Battery', 'price': 7500.99, 'brand': 'Tesla', 'category': 'Lithium Batteries',
             'description': 'Home energy storage battery system', 'stock': 5,
             'technical_specs': {'capacity': '13.5kWh', 'power': '7kW', 'voltage': '400V', 'cycles': '6000', 'warranty': '10 years'}},
            
            # Tools & Equipment
            {'name': 'Fluke Multimeter 87V', 'price': 450.99, 'brand': 'Fluke', 'category': 'Multimeters',
             'description': 'Professional digital multimeter for electrical work', 'stock': 30,
             'technical_specs': {'accuracy': '0.025%', 'voltage': '1000V', 'current': '10A', 'resistance': '50MΩ', 'display': 'Digital'}},
            {'name': 'Klein Wire Strippers', 'price': 25.99, 'brand': 'Klein Tools', 'category': 'Wire Strippers',
             'description': 'Professional wire stripping tool', 'stock': 100,
             'technical_specs': {'wire_range': '10-24 AWG', 'material': 'Steel', 'grip': 'Ergonomic', 'length': '7 inch', 'weight': '200g'}},
            {'name': 'DeWalt Cordless Drill', 'price': 199.99, 'brand': 'DeWalt', 'category': 'Drills',
             'description': 'Heavy-duty cordless drill for electrical work', 'stock': 40,
             'technical_specs': {'voltage': '18V', 'torque': '65Nm', 'speed': '2000rpm', 'battery': 'Lithium', 'weight': '1.5kg'}},
            
            # Additional products for variety
            {'name': 'Eaton Surge Protector', 'price': 35.99, 'brand': 'Eaton', 'category': 'Surge Protectors',
             'description': 'Whole house surge protection device', 'stock': 60,
             'technical_specs': {'protection': '40kA', 'voltage': '230V', 'response_time': '<1ns', 'warranty': '5 years', 'mounting': 'DIN rail'}},
            {'name': 'Legrand Distribution Board', 'price': 125.99, 'brand': 'Legrand', 'category': 'Distribution Boards',
             'description': '12-way consumer unit with RCD protection', 'stock': 25,
             'technical_specs': {'ways': '12', 'rcd': '30mA', 'current': '100A', 'material': 'Steel', 'ip_rating': 'IP40'}},
            {'name': 'Schneider UPS 1kVA', 'price': 450.99, 'brand': 'Schneider Electric', 'category': 'UPS Systems',
             'description': 'Uninterruptible power supply for critical loads', 'stock': 20,
             'technical_specs': {'power': '1kVA', 'voltage': '230V', 'backup_time': '15min', 'efficiency': '95%', 'type': 'Online'}},
        ]
        
        products = []
        for product_data in products_data:
            # Find brand and category
            brand = next((b for b in brands if b.name == product_data['brand']), None)
            category = next((c for c in categories if c.name == product_data['category']), None)
            
            if brand and category:
                # Mark some products as new or top-selling
                is_new = random.choice([True, False])
                is_top_selling = random.choice([True, False])
                
                product = Product.objects.create(
                    name=product_data['name'],
                    description=product_data['description'],
                    price=Decimal(str(product_data['price'])),
                    brand=brand,
                    category=category,
                    stock=product_data['stock'],
                    technical_specs=product_data['technical_specs'],
                    isNew=is_new,
                    is_top_selling=is_top_selling,
                    view_count=random.randint(0, 1000),
                    discount_rate=Decimal(str(random.choice([0, 5, 10, 15, 20])))  # Random discount
                )
                products.append(product)
        
        self.stdout.write(f'Created {len(products)} electrical products')
        return products

    def create_electrical_service_categories(self):
        """Create electrical service categories with hierarchy"""
        self.stdout.write('Creating electrical service categories...')
        
        service_categories_data = [
            {
                'name': 'Electrical Installation',
                'description': 'Professional electrical installation services',
                'ordering': 1,
                'children': [
                    {
                        'name': 'Residential Installation',
                        'description': 'Home electrical installation and wiring',
                        'ordering': 1,
                        'children': [
                            'New Home Wiring',
                            'Rewiring Services',
                            'Outdoor Lighting',
                            'EV Charging Points',
                            'Smart Home Setup'
                        ]
                    },
                    {
                        'name': 'Commercial Installation',
                        'description': 'Business electrical installation services',
                        'ordering': 2,
                        'children': [
                            'Office Wiring',
                            'Retail Installation',
                            'Industrial Wiring',
                            'Data Center Power',
                            'Emergency Lighting'
                        ]
                    }
                ]
            },
            {
                'name': 'Maintenance & Repair',
                'description': 'Electrical maintenance and repair services',
                'ordering': 2,
                'children': [
                    {
                        'name': 'Preventive Maintenance',
                        'description': 'Regular maintenance to prevent issues',
                        'ordering': 1,
                        'children': [
                            'Electrical Testing',
                            'Safety Inspections',
                            'Load Testing',
                            'Thermal Imaging',
                            'Power Quality Analysis'
                        ]
                    },
                    {
                        'name': 'Emergency Repairs',
                        'description': '24/7 emergency electrical repair services',
                        'ordering': 2,
                        'children': [
                            'Power Outages',
                            'Fault Finding',
                            'Circuit Repairs',
                            'Panel Replacements',
                            'Emergency Lighting'
                        ]
                    }
                ]
            },
            {
                'name': 'Renewable Energy',
                'description': 'Solar and renewable energy installation services',
                'ordering': 3,
                'children': [
                    {
                        'name': 'Solar Installation',
                        'description': 'Complete solar power system installation',
                        'ordering': 1,
                        'children': [
                            'Residential Solar',
                            'Commercial Solar',
                            'Solar Maintenance',
                            'Battery Storage',
                            'Solar Monitoring'
                        ]
                    },
                    {
                        'name': 'Energy Storage',
                        'description': 'Battery storage and backup power solutions',
                        'ordering': 2,
                        'children': [
                            'Home Battery Systems',
                            'Commercial Storage',
                            'Backup Power',
                            'Grid-Tie Systems',
                            'Off-Grid Solutions'
                        ]
                    }
                ]
            },
            {
                'name': 'Smart Home Solutions',
                'description': 'Home automation and smart electrical solutions',
                'ordering': 4,
                'children': [
                    {
                        'name': 'Home Automation',
                        'description': 'Complete smart home automation systems',
                        'ordering': 1,
                        'children': [
                            'Smart Lighting Control',
                            'HVAC Automation',
                            'Security Integration',
                            'Voice Control Setup',
                            'Mobile App Configuration'
                        ]
                    },
                    {
                        'name': 'IoT Integration',
                        'description': 'Internet of Things device integration',
                        'ordering': 2,
                        'children': [
                            'Sensor Networks',
                            'Smart Appliances',
                            'Energy Monitoring',
                            'Remote Control',
                            'Data Analytics'
                        ]
                    }
                ]
            },
            {
                'name': 'Industrial Services',
                'description': 'Industrial electrical and automation services',
                'ordering': 5,
                'children': [
                    {
                        'name': 'Motor Control',
                        'description': 'Industrial motor control and automation',
                        'ordering': 1,
                        'children': [
                            'VFD Installation',
                            'Motor Rewinding',
                            'Control Panel Design',
                            'PLC Programming',
                            'HMI Development'
                        ]
                    },
                    {
                        'name': 'Power Systems',
                        'description': 'Industrial power distribution and control',
                        'ordering': 2,
                        'children': [
                            'Power Distribution',
                            'Load Balancing',
                            'Power Factor Correction',
                            'Harmonic Filtering',
                            'Energy Management'
                        ]
                    }
                ]
            }
        ]
        
        service_categories = []
        for parent_data in service_categories_data:
            # Create parent service category
            parent_category = ServiceCategory.objects.create(
                name=parent_data['name'],
                description=parent_data['description'],
                ordering=parent_data['ordering']
            )
            service_categories.append(parent_category)
            
            # Create child service categories
            for child_data in parent_data['children']:
                child_category = ServiceCategory.objects.create(
                    name=child_data['name'],
                    description=child_data['description'],
                    ordering=child_data['ordering'],
                    parent=parent_category
                )
                service_categories.append(child_category)
                
                # Create grandchild service categories
                for grandchild_name in child_data['children']:
                    grandchild_category = ServiceCategory.objects.create(
                        name=grandchild_name,
                        parent=child_category,
                        ordering=len(service_categories) + 1
                    )
                    service_categories.append(grandchild_category)
        
        self.stdout.write(f'Created {len(service_categories)} service categories')
        return service_categories

    def create_electrical_services(self, service_categories):
        """Create electrical services"""
        self.stdout.write('Creating electrical services...')
        
        services_data = [
            # Electrical Installation Services
            {
                'name': 'Complete Home Rewiring',
                'description': 'Full electrical rewiring for residential properties',
                'price': 2500.00,
                'category': 'New Home Wiring',
                'overview': 'Complete electrical rewiring service including all circuits, outlets, and fixtures',
                'included_features': ['Full Circuit Installation', 'New Consumer Unit', 'Socket Outlets', 'Lighting Circuits', 'Safety Testing'],
                'process_steps': [
                    {'step': 'Site Survey', 'duration': '2 hours'},
                    {'step': 'Planning & Design', 'duration': '1 day'},
                    {'step': 'Installation', 'duration': '3-5 days'},
                    {'step': 'Testing & Certification', 'duration': '1 day'}
                ],
                'key_features': ['Certified Electricians', 'Part P Compliance', '10 Year Warranty', 'Insurance Backed', 'Free Quote'],
                'contact_info': {'phone': '+44-20-7123-4567', 'email': 'installations@electrostore.com'},
                'availability': 'Monday-Friday, 8AM-6PM'
            },
            {
                'name': 'EV Charging Point Installation',
                'description': 'Electric vehicle charging point installation service',
                'price': 800.00,
                'category': 'EV Charging Points',
                'overview': 'Professional installation of electric vehicle charging points',
                'included_features': ['Charging Point Supply', 'Professional Installation', 'Electrical Connection', 'Testing & Commissioning', 'User Training'],
                'process_steps': [
                    {'step': 'Site Assessment', 'duration': '1 hour'},
                    {'step': 'Installation', 'duration': '4-6 hours'},
                    {'step': 'Testing', 'duration': '1 hour'},
                    {'step': 'Handover', 'duration': '30 minutes'}
                ],
                'key_features': ['OZEV Approved', 'Smart Charging', 'Weatherproof Design', '5 Year Warranty', 'Remote Monitoring'],
                'contact_info': {'phone': '+44-20-7123-4568', 'email': 'evcharging@electrostore.com'},
                'availability': 'Monday-Saturday, 8AM-6PM'
            },
            {
                'name': 'Smart Home Installation',
                'description': 'Complete smart home automation system installation',
                'price': 1500.00,
                'category': 'Smart Home Setup',
                'overview': 'Full smart home automation including lighting, heating, and security',
                'included_features': ['Smart Lighting', 'Thermostat Control', 'Security System', 'Voice Control', 'Mobile App Setup'],
                'process_steps': [
                    {'step': 'Consultation', 'duration': '2 hours'},
                    {'step': 'System Design', 'duration': '1 day'},
                    {'step': 'Installation', 'duration': '2-3 days'},
                    {'step': 'Configuration', 'duration': '1 day'},
                    {'step': 'Training', 'duration': '2 hours'}
                ],
                'key_features': ['Custom Design', 'Professional Installation', 'User Training', 'Remote Support', 'Future Upgrades'],
                'contact_info': {'phone': '+44-20-7123-4569', 'email': 'smarthome@electrostore.com'},
                'availability': 'Monday-Friday, 9AM-5PM'
            },
            
            # Maintenance & Repair Services
            {
                'name': 'Electrical Safety Inspection',
                'description': 'Comprehensive electrical safety inspection and testing',
                'price': 150.00,
                'category': 'Safety Inspections',
                'overview': 'Complete electrical safety inspection with detailed report',
                'included_features': ['Visual Inspection', 'Electrical Testing', 'Safety Report', 'Recommendations', 'Compliance Check'],
                'process_steps': [
                    {'step': 'Visual Inspection', 'duration': '1 hour'},
                    {'step': 'Electrical Testing', 'duration': '2 hours'},
                    {'step': 'Report Generation', 'duration': '30 minutes'}
                ],
                'key_features': ['Certified Inspectors', 'Detailed Reports', 'Compliance Certification', 'Priority Recommendations', 'Follow-up Support'],
                'contact_info': {'phone': '+44-20-7123-4570', 'email': 'inspections@electrostore.com'},
                'availability': 'Monday-Friday, 8AM-6PM'
            },
            {
                'name': '24/7 Emergency Electrical Service',
                'description': 'Round-the-clock emergency electrical repair service',
                'price': 200.00,
                'category': 'Power Outages',
                'overview': 'Emergency electrical repair service available 24/7',
                'included_features': ['Emergency Response', 'Fault Diagnosis', 'Temporary Fixes', 'Permanent Repairs', 'Safety Checks'],
                'process_steps': [
                    {'step': 'Emergency Call', 'duration': 'Immediate'},
                    {'step': 'Response', 'duration': '1-2 hours'},
                    {'step': 'Diagnosis', 'duration': '30 minutes'},
                    {'step': 'Repair', 'duration': '1-3 hours'}
                ],
                'key_features': ['24/7 Availability', 'Rapid Response', 'Experienced Technicians', 'Emergency Equipment', 'Insurance Claims'],
                'contact_info': {'phone': '+44-20-7123-4571', 'email': 'emergency@electrostore.com'},
                'availability': '24/7 Emergency Service'
            },
            
            # Renewable Energy Services
            {
                'name': 'Solar Panel Installation',
                'description': 'Complete solar panel system installation and setup',
                'price': 5000.00,
                'category': 'Residential Solar',
                'overview': 'Professional solar panel installation for residential properties',
                'included_features': ['Solar Panels', 'Inverter Installation', 'Mounting System', 'Electrical Connection', 'Monitoring Setup'],
                'process_steps': [
                    {'step': 'Site Survey', 'duration': '2 hours'},
                    {'step': 'System Design', 'duration': '1 day'},
                    {'step': 'Installation', 'duration': '2-3 days'},
                    {'step': 'Testing & Commissioning', 'duration': '1 day'},
                    {'step': 'Handover', 'duration': '2 hours'}
                ],
                'key_features': ['MCS Certified', '25 Year Warranty', 'Performance Monitoring', 'Grid Connection', 'Feed-in Tariff'],
                'contact_info': {'phone': '+44-20-7123-4572', 'email': 'solar@electrostore.com'},
                'availability': 'Monday-Friday, 8AM-6PM'
            },
            {
                'name': 'Battery Storage Installation',
                'description': 'Home battery storage system installation',
                'price': 3000.00,
                'category': 'Home Battery Systems',
                'overview': 'Installation of home battery storage for energy independence',
                'included_features': ['Battery System', 'Inverter', 'Monitoring System', 'Installation', 'Commissioning'],
                'process_steps': [
                    {'step': 'Assessment', 'duration': '2 hours'},
                    {'step': 'Installation', 'duration': '1 day'},
                    {'step': 'Configuration', 'duration': '4 hours'},
                    {'step': 'Testing', 'duration': '2 hours'}
                ],
                'key_features': ['High Capacity', 'Smart Management', 'Remote Monitoring', '10 Year Warranty', 'Grid Independence'],
                'contact_info': {'phone': '+44-20-7123-4573', 'email': 'batteries@electrostore.com'},
                'availability': 'Monday-Friday, 8AM-6PM'
            },
            
            # Industrial Services
            {
                'name': 'VFD Installation & Programming',
                'description': 'Variable frequency drive installation and programming service',
                'price': 800.00,
                'category': 'VFD Installation',
                'overview': 'Professional VFD installation with custom programming',
                'included_features': ['VFD Supply', 'Installation', 'Programming', 'Testing', 'Commissioning'],
                'process_steps': [
                    {'step': 'Site Survey', 'duration': '1 hour'},
                    {'step': 'Installation', 'duration': '4 hours'},
                    {'step': 'Programming', 'duration': '2 hours'},
                    {'step': 'Testing', 'duration': '1 hour'}
                ],
                'key_features': ['Energy Savings', 'Custom Programming', 'Remote Monitoring', 'Maintenance Support', 'Performance Optimization'],
                'contact_info': {'phone': '+44-20-7123-4574', 'email': 'industrial@electrostore.com'},
                'availability': 'Monday-Friday, 8AM-6PM'
            },
            {
                'name': 'PLC Programming Service',
                'description': 'Programmable Logic Controller programming and development',
                'price': 1200.00,
                'category': 'PLC Programming',
                'overview': 'Custom PLC programming for industrial automation',
                'included_features': ['System Design', 'PLC Programming', 'HMI Development', 'Testing', 'Documentation'],
                'process_steps': [
                    {'step': 'Requirements Analysis', 'duration': '1 day'},
                    {'step': 'Programming', 'duration': '3-5 days'},
                    {'step': 'Testing', 'duration': '1 day'},
                    {'step': 'Commissioning', 'duration': '1 day'}
                ],
                'key_features': ['Custom Solutions', 'Multiple Platforms', 'HMI Integration', 'Documentation', 'Training'],
                'contact_info': {'phone': '+44-20-7123-4575', 'email': 'automation@electrostore.com'},
                'availability': 'Monday-Friday, 9AM-5PM'
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
                    rating=Decimal(str(random.uniform(4.2, 5.0))),
                    review_count=random.randint(15, 150),
                    view_count=random.randint(100, 800),
                    form_fields=[
                        {'label': 'Full Name', 'type': 'text', 'required': True},
                        {'label': 'Email Address', 'type': 'email', 'required': True},
                        {'label': 'Phone Number', 'type': 'tel', 'required': True},
                        {'label': 'Property Address', 'type': 'textarea', 'required': True},
                        {'label': 'Service Requirements', 'type': 'textarea', 'required': True},
                        {'label': 'Preferred Date', 'type': 'date', 'required': False},
                        {'label': 'Budget Range', 'type': 'select', 'required': False, 'options': ['Under £1000', '£1000-£5000', '£5000-£10000', 'Over £10000']}
                    ]
                )
                services.append(service)
        
        self.stdout.write(f'Created {len(services)} electrical services')
        return services

    def print_summary(self, categories, brands, products, service_categories, services):
        """Print summary of created data"""
        self.stdout.write(self.style.SUCCESS('\n=== ELECTRICAL STORE SEEDING SUMMARY ==='))
        self.stdout.write(f'Categories (3-level hierarchy): {len(categories)}')
        self.stdout.write(f'Electrical Brands: {len(brands)}')
        self.stdout.write(f'Electrical Products: {len(products)}')
        self.stdout.write(f'Service Categories (3-level hierarchy): {len(service_categories)}')
        self.stdout.write(f'Electrical Services: {len(services)}')
        
        # Show category hierarchy
        self.stdout.write(self.style.SUCCESS('\n=== CATEGORY HIERARCHY ==='))
        parent_categories = [c for c in categories if c.parent is None]
        for parent in parent_categories:
            self.stdout.write(f'[PARENT] {parent.name}')
            for child in parent.children.all():
                self.stdout.write(f'  [CHILD] {child.name}')
                for grandchild in child.children.all():
                    self.stdout.write(f'    [GRANDCHILD] {grandchild.name}')
        
        # Show service category hierarchy
        self.stdout.write(self.style.SUCCESS('\n=== SERVICE CATEGORY HIERARCHY ==='))
        parent_service_categories = [sc for sc in service_categories if sc.parent is None]
        for parent in parent_service_categories:
            self.stdout.write(f'[SERVICE PARENT] {parent.name}')
            for child in parent.children.all():
                self.stdout.write(f'  [SERVICE CHILD] {child.name}')
                for grandchild in child.children.all():
                    self.stdout.write(f'    [SERVICE GRANDCHILD] {grandchild.name}')
        
        # Show brands
        self.stdout.write(self.style.SUCCESS('\n=== ELECTRICAL BRANDS ==='))
        for brand in brands:
            self.stdout.write(f'[BRAND] {brand.name}')
        
        # Show sample products
        self.stdout.write(self.style.SUCCESS('\n=== SAMPLE PRODUCTS ==='))
        for product in products[:10]:
            discount_text = f" ({product.discount_rate}% off)" if product.discount_rate > 0 else ""
            new_text = " [NEW]" if product.isNew else ""
            top_text = " [TOP SELLING]" if product.is_top_selling else ""
            self.stdout.write(f'[PRODUCT] {product.name} - £{product.price}{discount_text}{new_text}{top_text}')
        
        # Show sample services
        self.stdout.write(self.style.SUCCESS('\n=== SAMPLE SERVICES ==='))
        for service in services:
            self.stdout.write(f'[SERVICE] {service.name} - £{service.price}')
        
        self.stdout.write(self.style.SUCCESS('\n[SUCCESS] Electrical store data seeding completed successfully!'))
        self.stdout.write('You can now test the complete functionality of your electrical store.')
