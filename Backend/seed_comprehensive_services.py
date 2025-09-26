#!/usr/bin/env python3
"""
Comprehensive Service Seeding Script
Creates a hierarchical structure of service categories, subcategories, and services
with German.png images for all services.
"""

import os
import sys
import django
from decimal import Decimal
from django.core.files import File

# Add the project root to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from adminpanel.models import ServiceCategory, Service, ServiceImage

def copy_german_image():
    """Copy German.png to media directory for use as service images"""
    german_source = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'German.png')
    media_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'media')
    services_dir = os.path.join(media_dir, 'services')
    
    # Create services directory if it doesn't exist
    os.makedirs(services_dir, exist_ok=True)
    
    german_dest = os.path.join(services_dir, 'German.png')
    
    if os.path.exists(german_source):
        import shutil
        shutil.copy2(german_source, german_dest)
        print(f"✅ Copied German.png to {german_dest}")
        return german_dest
    else:
        print(f"⚠️  German.png not found at {german_source}")
        return None

def create_service_categories_hierarchy():
    """Create comprehensive service categories and subcategories"""
    
    # Parent categories (5 main categories)
    parent_categories_data = [
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
    
    # Subcategories (child categories) - at least 10 total
    subcategories_data = [
        # Technical Support subcategories
        {
            "name": "Computer Support",
            "description": "Desktop and laptop computer technical support",
            "parent": "Technical Support",
            "ordering": 1
        },
        {
            "name": "Mobile Device Support",
            "description": "Smartphone and tablet technical support",
            "parent": "Technical Support",
            "ordering": 2
        },
        
        # Installation & Setup subcategories
        {
            "name": "Network Installation",
            "description": "Home and office network setup and configuration",
            "parent": "Installation & Setup",
            "ordering": 1
        },
        {
            "name": "Smart Home Setup",
            "description": "Smart home devices installation and configuration",
            "parent": "Installation & Setup",
            "ordering": 2
        },
        {
            "name": "Software Installation",
            "description": "Software installation and configuration services",
            "parent": "Installation & Setup",
            "ordering": 3
        },
        
        # Repair & Maintenance subcategories
        {
            "name": "Hardware Repair",
            "description": "Computer and device hardware repair services",
            "parent": "Repair & Maintenance",
            "ordering": 1
        },
        {
            "name": "Screen Replacement",
            "description": "Mobile device and laptop screen replacement",
            "parent": "Repair & Maintenance",
            "ordering": 2
        },
        
        # Consulting Services subcategories
        {
            "name": "IT Strategy Consulting",
            "description": "Strategic IT planning and technology consulting",
            "parent": "Consulting Services",
            "ordering": 1
        },
        {
            "name": "Security Consulting",
            "description": "Cybersecurity and data protection consulting",
            "parent": "Consulting Services",
            "ordering": 2
        },
        
        # Training & Education subcategories
        {
            "name": "Technical Training",
            "description": "Technical skills training and workshops",
            "parent": "Training & Education",
            "ordering": 1
        },
        {
            "name": "Software Training",
            "description": "Software usage and productivity training",
            "parent": "Training & Education",
            "ordering": 2
        }
    ]
    
    # Create parent categories
    parent_categories = []
    for cat_data in parent_categories_data:
        category, created = ServiceCategory.objects.get_or_create(
            name=cat_data["name"],
            parent=None,
            defaults={
                "description": cat_data["description"],
                "ordering": cat_data["ordering"]
            }
        )
        parent_categories.append(category)
        if created:
            print(f"✅ Created parent category: {category.name}")
    
    # Create subcategories
    subcategories = []
    for subcat_data in subcategories_data:
        parent = next((c for c in parent_categories if c.name == subcat_data["parent"]), None)
        if not parent:
            print(f"⚠️  Parent category '{subcat_data['parent']}' not found for subcategory '{subcat_data['name']}'")
            continue
            
        subcategory, created = ServiceCategory.objects.get_or_create(
            name=subcat_data["name"],
            parent=parent,
            defaults={
                "description": subcat_data["description"],
                "ordering": subcat_data["ordering"]
            }
        )
        subcategories.append(subcategory)
        if created:
            print(f"✅ Created subcategory: {subcategory.name} (under {parent.name})")
    
    return parent_categories, subcategories

def create_comprehensive_services(subcategories):
    """Create services for each subcategory with detailed information"""
    
    # Services data organized by subcategory
    services_data = {
        "Computer Support": [
            {
                "name": "Desktop Computer Diagnostics",
                "description": "Comprehensive diagnostic testing for desktop computers including hardware and software analysis.",
                "price": Decimal("79.99"),
                "rating": Decimal("4.8"),
                "review_count": 124,
                "overview": "Our expert technicians perform thorough diagnostic testing on desktop computers to identify hardware failures, software issues, and performance problems.",
                "included_features": [
                    "Hardware component testing",
                    "Software diagnostics",
                    "Performance analysis",
                    "Detailed diagnostic report",
                    "Repair recommendations",
                    "Cost estimates"
                ],
                "process_steps": [
                    {"step": "Initial Assessment", "duration": "15 minutes"},
                    {"step": "Hardware Testing", "duration": "45 minutes"},
                    {"step": "Software Analysis", "duration": "30 minutes"},
                    {"step": "Report Generation", "duration": "15 minutes"}
                ],
                "key_features": [
                    "Same-day diagnostics",
                    "Detailed written report",
                    "Free repair estimates",
                    "Expert certified technicians",
                    "Transparent pricing"
                ],
                "contact_info": {
                    "phone": "+1-555-0101",
                    "email": "desktop-support@sppix.com"
                },
                "availability": "Monday-Friday: 9AM-6PM, Saturday: 10AM-4PM"
            },
            {
                "name": "Laptop Performance Optimization",
                "description": "Professional laptop optimization service to improve speed, battery life, and overall performance.",
                "price": Decimal("99.99"),
                "rating": Decimal("4.7"),
                "review_count": 89,
                "overview": "Transform your slow laptop into a high-performance machine with our comprehensive optimization service.",
                "included_features": [
                    "System cleanup and optimization",
                    "Registry cleaning",
                    "Startup optimization",
                    "Driver updates",
                    "Battery calibration",
                    "Performance monitoring setup"
                ],
                "process_steps": [
                    {"step": "Performance Assessment", "duration": "20 minutes"},
                    {"step": "System Cleanup", "duration": "1 hour"},
                    {"step": "Optimization", "duration": "45 minutes"},
                    {"step": "Testing & Verification", "duration": "15 minutes"}
                ],
                "key_features": [
                    "30-day performance guarantee",
                    "Free follow-up support",
                    "Data backup included",
                    "Expert technicians",
                    "Same-day service"
                ],
                "contact_info": {
                    "phone": "+1-555-0102",
                    "email": "laptop-optimization@sppix.com"
                },
                "availability": "Monday-Friday: 8AM-7PM, Saturday: 9AM-5PM"
            }
        ],
        
        "Mobile Device Support": [
            {
                "name": "iPhone Troubleshooting",
                "description": "Comprehensive iPhone support including software issues, connectivity problems, and performance optimization.",
                "price": Decimal("69.99"),
                "rating": Decimal("4.9"),
                "review_count": 156,
                "overview": "Expert iPhone support for all models including software troubleshooting, connectivity issues, and performance optimization.",
                "included_features": [
                    "Software troubleshooting",
                    "Connectivity diagnostics",
                    "Performance optimization",
                    "Data backup assistance",
                    "App management",
                    "iOS update support"
                ],
                "process_steps": [
                    {"step": "Device Assessment", "duration": "15 minutes"},
                    {"step": "Diagnostic Testing", "duration": "30 minutes"},
                    {"step": "Issue Resolution", "duration": "45 minutes"},
                    {"step": "Testing & Verification", "duration": "10 minutes"}
                ],
                "key_features": [
                    "All iPhone models supported",
                    "Same-day service",
                    "Data protection guaranteed",
                    "Expert Apple technicians",
                    "Warranty on work performed"
                ],
                "contact_info": {
                    "phone": "+1-555-0103",
                    "email": "iphone-support@sppix.com"
                },
                "availability": "Monday-Sunday: 9AM-8PM"
            },
            {
                "name": "Android Device Support",
                "description": "Professional Android smartphone and tablet support for all major brands.",
                "price": Decimal("59.99"),
                "rating": Decimal("4.6"),
                "review_count": 98,
                "overview": "Comprehensive Android device support including Samsung, Google Pixel, OnePlus, and other major brands.",
                "included_features": [
                    "Software troubleshooting",
                    "Performance optimization",
                    "Connectivity issues",
                    "App management",
                    "System updates",
                    "Data recovery assistance"
                ],
                "process_steps": [
                    {"step": "Device Analysis", "duration": "15 minutes"},
                    {"step": "Problem Diagnosis", "duration": "25 minutes"},
                    {"step": "Solution Implementation", "duration": "40 minutes"},
                    {"step": "Quality Testing", "duration": "10 minutes"}
                ],
                "key_features": [
                    "All Android brands supported",
                    "Expert Android technicians",
                    "Same-day service available",
                    "Data safety guaranteed",
                    "Follow-up support included"
                ],
                "contact_info": {
                    "phone": "+1-555-0104",
                    "email": "android-support@sppix.com"
                },
                "availability": "Monday-Friday: 9AM-7PM, Saturday: 10AM-6PM"
            }
        ],
        
        "Network Installation": [
            {
                "name": "Home WiFi Setup",
                "description": "Complete home WiFi network installation with optimal coverage and security configuration.",
                "price": Decimal("149.99"),
                "rating": Decimal("4.8"),
                "review_count": 67,
                "overview": "Professional home WiFi setup ensuring optimal coverage, security, and performance throughout your home.",
                "included_features": [
                    "Router installation and configuration",
                    "WiFi coverage optimization",
                    "Security setup (WPA3)",
                    "Guest network creation",
                    "Device connectivity testing",
                    "Network documentation"
                ],
                "process_steps": [
                    {"step": "Site Survey", "duration": "30 minutes"},
                    {"step": "Equipment Installation", "duration": "45 minutes"},
                    {"step": "Network Configuration", "duration": "30 minutes"},
                    {"step": "Testing & Optimization", "duration": "15 minutes"}
                ],
                "key_features": [
                    "Custom network design",
                    "Professional installation",
                    "Security optimization",
                    "Performance tuning",
                    "Ongoing support"
                ],
                "contact_info": {
                    "phone": "+1-555-0105",
                    "email": "wifi-setup@sppix.com"
                },
                "availability": "Monday-Friday: 8AM-6PM, Saturday: 9AM-5PM"
            },
            {
                "name": "Office Network Setup",
                "description": "Professional office network installation with advanced security and management features.",
                "price": Decimal("299.99"),
                "rating": Decimal("4.7"),
                "review_count": 34,
                "overview": "Complete office network infrastructure setup with enterprise-grade security and management capabilities.",
                "included_features": [
                    "Enterprise router configuration",
                    "Managed switch setup",
                    "Advanced security implementation",
                    "VPN configuration",
                    "Network monitoring setup",
                    "Staff training"
                ],
                "process_steps": [
                    {"step": "Network Planning", "duration": "1 hour"},
                    {"step": "Equipment Installation", "duration": "2 hours"},
                    {"step": "Configuration & Security", "duration": "1.5 hours"},
                    {"step": "Testing & Training", "duration": "30 minutes"}
                ],
                "key_features": [
                    "Enterprise-grade equipment",
                    "Advanced security features",
                    "Professional installation",
                    "Staff training included",
                    "Ongoing support"
                ],
                "contact_info": {
                    "phone": "+1-555-0106",
                    "email": "office-network@sppix.com"
                },
                "availability": "Monday-Friday: 8AM-5PM"
            }
        ],
        
        "Smart Home Setup": [
            {
                "name": "Smart Lighting Installation",
                "description": "Complete smart lighting system installation with automation and voice control.",
                "price": Decimal("199.99"),
                "rating": Decimal("4.6"),
                "review_count": 43,
                "overview": "Transform your home with smart lighting including dimmers, color-changing bulbs, and automated schedules.",
                "included_features": [
                    "Smart bulb installation",
                    "Smart switch setup",
                    "Hub configuration",
                    "Voice control setup",
                    "Automation programming",
                    "Mobile app configuration"
                ],
                "process_steps": [
                    {"step": "Home Assessment", "duration": "30 minutes"},
                    {"step": "Device Installation", "duration": "1.5 hours"},
                    {"step": "System Configuration", "duration": "45 minutes"},
                    {"step": "Testing & Training", "duration": "15 minutes"}
                ],
                "key_features": [
                    "Custom lighting design",
                    "Professional installation",
                    "Voice control integration",
                    "Energy efficiency optimization",
                    "User training included"
                ],
                "contact_info": {
                    "phone": "+1-555-0107",
                    "email": "smart-lighting@sppix.com"
                },
                "availability": "Monday-Friday: 9AM-5PM, Saturday: 10AM-4PM"
            },
            {
                "name": "Smart Security System Setup",
                "description": "Complete smart security system installation with cameras, sensors, and monitoring.",
                "price": Decimal("399.99"),
                "rating": Decimal("4.8"),
                "review_count": 28,
                "overview": "Professional smart security system installation including cameras, door sensors, and mobile monitoring.",
                "included_features": [
                    "Security camera installation",
                    "Door/window sensor setup",
                    "Motion detector configuration",
                    "Mobile app setup",
                    "Remote monitoring setup",
                    "System testing and training"
                ],
                "process_steps": [
                    {"step": "Security Assessment", "duration": "45 minutes"},
                    {"step": "Equipment Installation", "duration": "2 hours"},
                    {"step": "System Configuration", "duration": "1 hour"},
                    {"step": "Testing & Training", "duration": "30 minutes"}
                ],
                "key_features": [
                    "Professional installation",
                    "Mobile monitoring",
                    "24/7 system support",
                    "Custom security design",
                    "User training included"
                ],
                "contact_info": {
                    "phone": "+1-555-0108",
                    "email": "smart-security@sppix.com"
                },
                "availability": "Monday-Friday: 8AM-6PM"
            }
        ],
        
        "Software Installation": [
            {
                "name": "Operating System Installation",
                "description": "Professional operating system installation and configuration for Windows, macOS, and Linux.",
                "price": Decimal("129.99"),
                "rating": Decimal("4.7"),
                "review_count": 56,
                "overview": "Expert operating system installation including Windows, macOS, and Linux with driver installation and optimization.",
                "included_features": [
                    "OS installation and setup",
                    "Driver installation",
                    "System optimization",
                    "Security configuration",
                    "Software installation",
                    "Data migration assistance"
                ],
                "process_steps": [
                    {"step": "System Backup", "duration": "30 minutes"},
                    {"step": "OS Installation", "duration": "1 hour"},
                    {"step": "Driver Installation", "duration": "45 minutes"},
                    {"step": "Configuration & Testing", "duration": "30 minutes"}
                ],
                "key_features": [
                    "All major operating systems",
                    "Data backup included",
                    "Expert technicians",
                    "System optimization",
                    "Warranty on installation"
                ],
                "contact_info": {
                    "phone": "+1-555-0109",
                    "email": "os-installation@sppix.com"
                },
                "availability": "Monday-Friday: 9AM-6PM, Saturday: 10AM-4PM"
            },
            {
                "name": "Business Software Setup",
                "description": "Professional installation and configuration of business software including Office suites and productivity tools.",
                "price": Decimal("89.99"),
                "rating": Decimal("4.5"),
                "review_count": 42,
                "overview": "Complete business software installation including Microsoft Office, Google Workspace, and other productivity suites.",
                "included_features": [
                    "Office suite installation",
                    "Email client configuration",
                    "Cloud service setup",
                    "User account creation",
                    "Data migration",
                    "Training and support"
                ],
                "process_steps": [
                    {"step": "Software Planning", "duration": "20 minutes"},
                    {"step": "Installation", "duration": "45 minutes"},
                    {"step": "Configuration", "duration": "30 minutes"},
                    {"step": "Testing & Training", "duration": "25 minutes"}
                ],
                "key_features": [
                    "Professional software installation",
                    "User training included",
                    "Data migration support",
                    "Ongoing technical support",
                    "Licensing assistance"
                ],
                "contact_info": {
                    "phone": "+1-555-0110",
                    "email": "business-software@sppix.com"
                },
                "availability": "Monday-Friday: 8AM-6PM"
            }
        ],
        
        "Hardware Repair": [
            {
                "name": "Desktop Computer Repair",
                "description": "Comprehensive desktop computer repair service for all hardware components.",
                "price": Decimal("119.99"),
                "rating": Decimal("4.8"),
                "review_count": 78,
                "overview": "Expert desktop computer repair including motherboard, CPU, RAM, storage, and power supply repairs.",
                "included_features": [
                    "Component diagnostics",
                    "Hardware replacement",
                    "System assembly",
                    "Performance testing",
                    "Warranty on repairs",
                    "Data protection"
                ],
                "process_steps": [
                    {"step": "Hardware Assessment", "duration": "30 minutes"},
                    {"step": "Component Repair/Replacement", "duration": "1-2 hours"},
                    {"step": "System Assembly", "duration": "30 minutes"},
                    {"step": "Testing & Quality Check", "duration": "20 minutes"}
                ],
                "key_features": [
                    "All hardware components",
                    "Genuine parts guarantee",
                    "90-day warranty",
                    "Expert technicians",
                    "Data safety guaranteed"
                ],
                "contact_info": {
                    "phone": "+1-555-0111",
                    "email": "desktop-repair@sppix.com"
                },
                "availability": "Monday-Friday: 9AM-6PM, Saturday: 10AM-4PM"
            },
            {
                "name": "Laptop Hardware Repair",
                "description": "Professional laptop repair service for all internal and external components.",
                "price": Decimal("149.99"),
                "rating": Decimal("4.7"),
                "review_count": 65,
                "overview": "Expert laptop repair including keyboard, trackpad, motherboard, battery, and screen repairs.",
                "included_features": [
                    "Laptop disassembly",
                    "Component replacement",
                    "System reassembly",
                    "Performance testing",
                    "Battery calibration",
                    "Warranty on repairs"
                ],
                "process_steps": [
                    {"step": "Laptop Assessment", "duration": "20 minutes"},
                    {"step": "Disassembly", "duration": "30 minutes"},
                    {"step": "Component Repair", "duration": "1-1.5 hours"},
                    {"step": "Reassembly & Testing", "duration": "40 minutes"}
                ],
                "key_features": [
                    "All laptop brands supported",
                    "Professional repair techniques",
                    "90-day warranty",
                    "Data protection guaranteed",
                    "Expert certified technicians"
                ],
                "contact_info": {
                    "phone": "+1-555-0112",
                    "email": "laptop-repair@sppix.com"
                },
                "availability": "Monday-Friday: 9AM-6PM, Saturday: 10AM-4PM"
            }
        ],
        
        "Screen Replacement": [
            {
                "name": "iPhone Screen Replacement",
                "description": "Professional iPhone screen replacement with genuine parts and warranty.",
                "price": Decimal("139.99"),
                "rating": Decimal("4.9"),
                "review_count": 112,
                "overview": "Expert iPhone screen replacement using genuine Apple parts with professional installation and warranty.",
                "included_features": [
                    "Genuine Apple parts",
                    "Professional installation",
                    "Touch calibration",
                    "Water resistance testing",
                    "6-month warranty",
                    "Data protection"
                ],
                "process_steps": [
                    {"step": "Device Assessment", "duration": "10 minutes"},
                    {"step": "Screen Removal", "duration": "20 minutes"},
                    {"step": "New Screen Installation", "duration": "30 minutes"},
                    {"step": "Testing & Calibration", "duration": "15 minutes"}
                ],
                "key_features": [
                    "All iPhone models",
                    "Genuine parts guarantee",
                    "Same-day service",
                    "Professional installation",
                    "6-month warranty"
                ],
                "contact_info": {
                    "phone": "+1-555-0113",
                    "email": "iphone-screen@sppix.com"
                },
                "availability": "Monday-Sunday: 9AM-8PM"
            },
            {
                "name": "Samsung Galaxy Screen Replacement",
                "description": "Professional Samsung Galaxy screen replacement with OEM parts and warranty.",
                "price": Decimal("129.99"),
                "rating": Decimal("4.8"),
                "review_count": 87,
                "overview": "Expert Samsung Galaxy screen replacement using original equipment manufacturer parts.",
                "included_features": [
                    "OEM Samsung parts",
                    "Professional installation",
                    "Touch sensitivity testing",
                    "Display calibration",
                    "6-month warranty",
                    "Data protection"
                ],
                "process_steps": [
                    {"step": "Device Assessment", "duration": "10 minutes"},
                    {"step": "Screen Removal", "duration": "25 minutes"},
                    {"step": "New Screen Installation", "duration": "35 minutes"},
                    {"step": "Testing & Calibration", "duration": "15 minutes"}
                ],
                "key_features": [
                    "All Samsung Galaxy models",
                    "OEM parts guarantee",
                    "Same-day service",
                    "Professional installation",
                    "6-month warranty"
                ],
                "contact_info": {
                    "phone": "+1-555-0114",
                    "email": "samsung-screen@sppix.com"
                },
                "availability": "Monday-Sunday: 9AM-8PM"
            }
        ],
        
        "IT Strategy Consulting": [
            {
                "name": "Technology Roadmap Planning",
                "description": "Strategic technology planning and roadmap development for businesses.",
                "price": Decimal("199.99"),
                "rating": Decimal("4.8"),
                "review_count": 23,
                "overview": "Comprehensive technology strategy development including infrastructure planning and digital transformation roadmaps.",
                "included_features": [
                    "Technology assessment",
                    "Strategic planning",
                    "Roadmap development",
                    "Cost analysis",
                    "Implementation planning",
                    "Ongoing consultation"
                ],
                "process_steps": [
                    {"step": "Initial Consultation", "duration": "1 hour"},
                    {"step": "Technology Assessment", "duration": "2-3 hours"},
                    {"step": "Strategy Development", "duration": "2 hours"},
                    {"step": "Presentation & Planning", "duration": "1 hour"}
                ],
                "key_features": [
                    "Certified consultants",
                    "Custom strategy development",
                    "ROI analysis",
                    "Implementation support",
                    "Ongoing consultation"
                ],
                "contact_info": {
                    "phone": "+1-555-0115",
                    "email": "tech-roadmap@sppix.com"
                },
                "availability": "Monday-Friday: 9AM-6PM"
            },
            {
                "name": "Digital Transformation Consulting",
                "description": "Expert guidance on digital transformation initiatives and technology adoption.",
                "price": Decimal("249.99"),
                "rating": Decimal("4.7"),
                "review_count": 18,
                "overview": "Strategic digital transformation consulting to help businesses modernize their technology infrastructure and processes.",
                "included_features": [
                    "Digital readiness assessment",
                    "Transformation planning",
                    "Technology selection",
                    "Change management",
                    "Implementation support",
                    "Success metrics"
                ],
                "process_steps": [
                    {"step": "Readiness Assessment", "duration": "1.5 hours"},
                    {"step": "Transformation Planning", "duration": "2-3 hours"},
                    {"step": "Strategy Development", "duration": "2 hours"},
                    {"step": "Implementation Planning", "duration": "1.5 hours"}
                ],
                "key_features": [
                    "Expert digital consultants",
                    "Comprehensive assessment",
                    "Custom transformation plan",
                    "Change management support",
                    "Ongoing guidance"
                ],
                "contact_info": {
                    "phone": "+1-555-0116",
                    "email": "digital-transformation@sppix.com"
                },
                "availability": "Monday-Friday: 9AM-6PM"
            }
        ],
        
        "Security Consulting": [
            {
                "name": "Cybersecurity Assessment",
                "description": "Comprehensive cybersecurity assessment and vulnerability analysis for businesses.",
                "price": Decimal("299.99"),
                "rating": Decimal("4.9"),
                "review_count": 31,
                "overview": "Professional cybersecurity assessment including vulnerability scanning, penetration testing, and security recommendations.",
                "included_features": [
                    "Vulnerability assessment",
                    "Penetration testing",
                    "Security audit",
                    "Risk analysis",
                    "Recommendations report",
                    "Implementation guidance"
                ],
                "process_steps": [
                    {"step": "Security Assessment", "duration": "2 hours"},
                    {"step": "Vulnerability Testing", "duration": "3-4 hours"},
                    {"step": "Risk Analysis", "duration": "1 hour"},
                    {"step": "Report Generation", "duration": "1 hour"}
                ],
                "key_features": [
                    "Certified security experts",
                    "Comprehensive assessment",
                    "Detailed risk analysis",
                    "Actionable recommendations",
                    "Follow-up support"
                ],
                "contact_info": {
                    "phone": "+1-555-0117",
                    "email": "cybersecurity@sppix.com"
                },
                "availability": "Monday-Friday: 8AM-6PM"
            },
            {
                "name": "Data Protection Consulting",
                "description": "Expert data protection and privacy compliance consulting for GDPR and other regulations.",
                "price": Decimal("199.99"),
                "rating": Decimal("4.6"),
                "review_count": 25,
                "overview": "Professional data protection consulting including GDPR compliance, privacy policies, and data security implementation.",
                "included_features": [
                    "Compliance assessment",
                    "Privacy policy development",
                    "Data security implementation",
                    "Staff training",
                    "Audit preparation",
                    "Ongoing compliance support"
                ],
                "process_steps": [
                    {"step": "Compliance Assessment", "duration": "1.5 hours"},
                    {"step": "Policy Development", "duration": "2 hours"},
                    {"step": "Implementation Planning", "duration": "1.5 hours"},
                    {"step": "Training & Documentation", "duration": "1 hour"}
                ],
                "key_features": [
                    "GDPR compliance expertise",
                    "Privacy policy development",
                    "Staff training included",
                    "Audit preparation",
                    "Ongoing support"
                ],
                "contact_info": {
                    "phone": "+1-555-0118",
                    "email": "data-protection@sppix.com"
                },
                "availability": "Monday-Friday: 9AM-6PM"
            }
        ],
        
        "Technical Training": [
            {
                "name": "Computer Basics Training",
                "description": "Comprehensive computer basics training for beginners and non-technical users.",
                "price": Decimal("99.99"),
                "rating": Decimal("4.7"),
                "review_count": 45,
                "overview": "Beginner-friendly computer training covering basic operations, file management, internet usage, and common software.",
                "included_features": [
                    "Basic computer operations",
                    "File and folder management",
                    "Internet and email basics",
                    "Software introduction",
                    "Troubleshooting basics",
                    "Hands-on practice"
                ],
                "process_steps": [
                    {"step": "Skill Assessment", "duration": "15 minutes"},
                    {"step": "Basic Operations", "duration": "1 hour"},
                    {"step": "Software Training", "duration": "1.5 hours"},
                    {"step": "Practice & Q&A", "duration": "45 minutes"}
                ],
                "key_features": [
                    "Beginner-friendly approach",
                    "Hands-on learning",
                    "Small class sizes",
                    "Take-home materials",
                    "Follow-up support"
                ],
                "contact_info": {
                    "phone": "+1-555-0119",
                    "email": "computer-basics@sppix.com"
                },
                "availability": "Monday-Friday: 10AM-4PM, Saturday: 9AM-3PM"
            },
            {
                "name": "Network Administration Training",
                "description": "Professional network administration training for IT professionals and system administrators.",
                "price": Decimal("199.99"),
                "rating": Decimal("4.8"),
                "review_count": 32,
                "overview": "Advanced network administration training covering routing, switching, security, and network management.",
                "included_features": [
                    "Network fundamentals",
                    "Router and switch configuration",
                    "Network security",
                    "Troubleshooting techniques",
                    "Performance monitoring",
                    "Certification preparation"
                ],
                "process_steps": [
                    {"step": "Theory & Concepts", "duration": "1 hour"},
                    {"step": "Hands-on Lab Work", "duration": "2 hours"},
                    {"step": "Advanced Topics", "duration": "1.5 hours"},
                    {"step": "Practice & Assessment", "duration": "30 minutes"}
                ],
                "key_features": [
                    "Professional-level training",
                    "Hands-on lab environment",
                    "Certification preparation",
                    "Expert instructors",
                    "Course materials included"
                ],
                "contact_info": {
                    "phone": "+1-555-0120",
                    "email": "network-admin@sppix.com"
                },
                "availability": "Monday-Friday: 9AM-5PM"
            }
        ],
        
        "Software Training": [
            {
                "name": "Microsoft Office Training",
                "description": "Comprehensive Microsoft Office training covering Word, Excel, PowerPoint, and Outlook.",
                "price": Decimal("149.99"),
                "rating": Decimal("4.6"),
                "review_count": 67,
                "overview": "Professional Microsoft Office training for individuals and businesses covering all major applications.",
                "included_features": [
                    "Word advanced features",
                    "Excel formulas and functions",
                    "PowerPoint presentation design",
                    "Outlook email management",
                    "Integration techniques",
                    "Productivity tips"
                ],
                "process_steps": [
                    {"step": "Skill Assessment", "duration": "20 minutes"},
                    {"step": "Word Training", "duration": "1 hour"},
                    {"step": "Excel Training", "duration": "1.5 hours"},
                    {"step": "PowerPoint & Outlook", "duration": "1 hour"}
                ],
                "key_features": [
                    "All Office applications",
                    "Hands-on practice",
                    "Real-world examples",
                    "Certification preparation",
                    "Course materials included"
                ],
                "contact_info": {
                    "phone": "+1-555-0121",
                    "email": "office-training@sppix.com"
                },
                "availability": "Monday-Friday: 9AM-5PM, Saturday: 10AM-4PM"
            },
            {
                "name": "Adobe Creative Suite Training",
                "description": "Professional Adobe Creative Suite training covering Photoshop, Illustrator, and InDesign.",
                "price": Decimal("199.99"),
                "rating": Decimal("4.8"),
                "review_count": 38,
                "overview": "Expert Adobe Creative Suite training for graphic designers, photographers, and creative professionals.",
                "included_features": [
                    "Photoshop image editing",
                    "Illustrator vector graphics",
                    "InDesign page layout",
                    "Workflow optimization",
                    "Creative techniques",
                    "Project-based learning"
                ],
                "process_steps": [
                    {"step": "Software Overview", "duration": "30 minutes"},
                    {"step": "Photoshop Training", "duration": "1.5 hours"},
                    {"step": "Illustrator Training", "duration": "1.5 hours"},
                    {"step": "InDesign & Integration", "duration": "1 hour"}
                ],
                "key_features": [
                    "Professional-level training",
                    "Hands-on projects",
                    "Creative techniques",
                    "Workflow optimization",
                    "Portfolio development"
                ],
                "contact_info": {
                    "phone": "+1-555-0122",
                    "email": "adobe-training@sppix.com"
                },
                "availability": "Monday-Friday: 9AM-5PM"
            }
        ]
    }
    
    # Copy German.png for service images
    german_path = copy_german_image()
    
    services = []
    
    # Create services for each subcategory
    for subcategory in subcategories:
        subcategory_services = services_data.get(subcategory.name, [])
        
        for service_data in subcategory_services:
            service, created = Service.objects.get_or_create(
                name=service_data["name"],
                defaults={
                    "description": service_data["description"],
                    "price": service_data["price"],
                    "category": subcategory,
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
                print(f"✅ Created service: {service.name} (in {subcategory.name})")
                
                # Add German.png image to the service
                if german_path and os.path.exists(german_path):
                    try:
                        with open(german_path, 'rb') as f:
                            service_image = ServiceImage.objects.create(service=service)
                            service_image.image.save('German.png', File(f), save=True)
                            print(f"  📸 Added German.png image to {service.name}")
                    except Exception as e:
                        print(f"  ⚠️  Failed to add image to {service.name}: {e}")
            
            services.append(service)
    
    return services

def main():
    """Main function to seed comprehensive services"""
    print("🚀 Starting comprehensive service seeding...")
    
    try:
        # Create service categories hierarchy
        print("\n📂 Creating service categories hierarchy...")
        parent_categories, subcategories = create_service_categories_hierarchy()
        
        # Create comprehensive services
        print("\n⚙️ Creating comprehensive services...")
        services = create_comprehensive_services(subcategories)
        
        print("\n🎉 Comprehensive service seeding completed successfully!")
        print(f"📊 Summary:")
        print(f"  • Parent Categories: {len(parent_categories)}")
        print(f"  • Subcategories: {len(subcategories)}")
        print(f"  • Services: {len(services)}")
        
        # Print detailed breakdown
        print(f"\n📋 Detailed Breakdown:")
        for parent in parent_categories:
            children = parent.children.all()
            print(f"  • {parent.name}: {children.count()} subcategories")
            for child in children:
                child_services = child.services.all()
                print(f"    - {child.name}: {child_services.count()} services")
        
    except Exception as e:
        print(f"❌ Error seeding comprehensive services: {e}")
        raise

if __name__ == "__main__":
    main()
