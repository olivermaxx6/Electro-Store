from django.core.management.base import BaseCommand
from django.core.files.base import ContentFile
from adminpanel.models import ServiceCategory, Service, ServiceImage
import os
from PIL import Image, ImageDraw, ImageFont
import io

class Command(BaseCommand):
    help = 'Seed comprehensive service categories and services with sample images'

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
        # Enhanced service categories
        categories_data = [
            {
                'name': 'Development',
                'description': 'Software development and programming services',
                'ordering': 1
            },
            {
                'name': 'E-commerce',
                'description': 'E-commerce platform development and solutions',
                'ordering': 2
            },
            {
                'name': 'Marketing',
                'description': 'Digital marketing and promotion services',
                'ordering': 3
            },
            {
                'name': 'Design',
                'description': 'UI/UX design and creative services',
                'ordering': 4
            },
            {
                'name': 'Infrastructure',
                'description': 'Cloud and infrastructure services',
                'ordering': 5
            },
            {
                'name': 'Analytics',
                'description': 'Data analytics and business intelligence',
                'ordering': 6
            },
            {
                'name': 'Consulting',
                'description': 'Technical consulting and advisory services',
                'ordering': 7
            },
            {
                'name': 'Mobile Repair',
                'description': 'Mobile device repair and maintenance services',
                'ordering': 8
            },
            {
                'name': 'Security',
                'description': 'Cybersecurity and data protection services',
                'ordering': 9
            },
            {
                'name': 'Support',
                'description': 'Technical support and maintenance services',
                'ordering': 10
            }
        ]

        created_categories = 0
        
        for category_data in categories_data:
            category, created = ServiceCategory.objects.get_or_create(
                name=category_data['name'],
                defaults={
                    'description': category_data['description'],
                    'ordering': category_data['ordering']
                }
            )
            
            if created:
                created_categories += 1
                self.stdout.write(
                    self.style.SUCCESS(f'Created service category: {category.name}')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'Service category already exists: {category.name}')
                )

        # Comprehensive services data
        services_data = [
            {
                'name': 'Website Development',
                'category_name': 'Development',
                'description': 'Professional website development using modern technologies like React, Node.js, and more.',
                'price': 299.00,
                'rating': 4.8,
                'review_count': 124,
                'overview': 'Complete website development from concept to deployment. We create responsive, fast-loading websites that help your business stand out online.',
                'included_features': [
                    'Custom website design and development',
                    'Responsive design for all devices',
                    'SEO optimization and meta tags',
                    'Content management system',
                    'Contact forms and integrations',
                    'SSL certificate setup',
                    'Website hosting setup',
                    '3 months of free support'
                ],
                'key_features': ['Responsive Design', 'SEO Optimized', 'Fast Loading', 'Mobile Friendly'],
                'availability': '2-3 weeks',
                'process_steps': [
                    {'step': 1, 'title': 'Discovery & Planning', 'description': 'Understanding your requirements and goals', 'duration': '2-3 days'},
                    {'step': 2, 'title': 'Design & Prototyping', 'description': 'Creating wireframes and visual designs', 'duration': '1 week'},
                    {'step': 3, 'title': 'Development', 'description': 'Building the website with modern technologies', 'duration': '1-2 weeks'},
                    {'step': 4, 'title': 'Testing & Launch', 'description': 'Quality assurance and deployment', 'duration': '2-3 days'}
                ]
            },
            {
                'name': 'Mobile App Development',
                'category_name': 'Development',
                'description': 'Native and cross-platform mobile app development for iOS and Android.',
                'price': 599.00,
                'rating': 4.9,
                'review_count': 89,
                'overview': 'Full-stack mobile application development for iOS and Android platforms.',
                'included_features': [
                    'Cross-platform mobile app development',
                    'iOS and Android compatibility',
                    'User interface and experience design',
                    'Backend API integration',
                    'Push notification setup',
                    'App store submission assistance',
                    'Beta testing and quality assurance',
                    '6 months of free maintenance'
                ],
                'key_features': ['Cross-Platform', 'Native Performance', 'App Store Ready', 'Push Notifications'],
                'availability': '4-6 weeks',
                'process_steps': [
                    {'step': 1, 'title': 'Requirements Analysis', 'description': 'Deep dive into your app requirements', 'duration': '3-5 days'},
                    {'step': 2, 'title': 'UI/UX Design', 'description': 'Create intuitive user interface designs', 'duration': '1-2 weeks'},
                    {'step': 3, 'title': 'Development & Integration', 'description': 'Build the app with backend integration', 'duration': '3-4 weeks'},
                    {'step': 4, 'title': 'Testing & Deployment', 'description': 'Comprehensive testing and app store deployment', 'duration': '1 week'}
                ]
            },
            {
                'name': 'E-commerce Solutions',
                'category_name': 'E-commerce',
                'description': 'Complete e-commerce platform development with payment integration and inventory management.',
                'price': 799.00,
                'rating': 4.7,
                'review_count': 156,
                'overview': 'End-to-end e-commerce platform development with advanced features.',
                'included_features': [
                    'Custom e-commerce platform development',
                    'Payment gateway integration',
                    'Inventory management system',
                    'Order tracking and management',
                    'Customer account system',
                    'Analytics dashboard',
                    'Mobile-responsive design',
                    '6 months of free support'
                ],
                'key_features': ['Payment Gateway', 'Inventory Management', 'Order Tracking', 'Analytics Dashboard'],
                'availability': '6-8 weeks',
                'process_steps': [
                    {'step': 1, 'title': 'Business Analysis', 'description': 'Understanding your business model and requirements', 'duration': '1 week'},
                    {'step': 2, 'title': 'Platform Design', 'description': 'Designing the e-commerce architecture', 'duration': '1-2 weeks'},
                    {'step': 3, 'title': 'Development', 'description': 'Building the platform with all features', 'duration': '4-5 weeks'},
                    {'step': 4, 'title': 'Testing & Launch', 'description': 'Quality assurance and deployment', 'duration': '1 week'}
                ]
            },
            {
                'name': 'Digital Marketing',
                'category_name': 'Marketing',
                'description': 'Comprehensive digital marketing strategies including SEO, social media, and PPC campaigns.',
                'price': 199.00,
                'rating': 4.6,
                'review_count': 203,
                'overview': 'Complete digital marketing strategy and execution to grow your business.',
                'included_features': [
                    'SEO optimization and strategy',
                    'Social media management',
                    'PPC campaign management',
                    'Content marketing',
                    'Email marketing campaigns',
                    'Analytics and reporting',
                    'Brand awareness strategies',
                    'Monthly performance reports'
                ],
                'key_features': ['SEO Optimization', 'Social Media', 'PPC Campaigns', 'Analytics Reports'],
                'availability': 'Ongoing',
                'process_steps': [
                    {'step': 1, 'title': 'Strategy Development', 'description': 'Creating comprehensive marketing strategy', 'duration': '1 week'},
                    {'step': 2, 'title': 'Campaign Setup', 'description': 'Setting up all marketing campaigns', 'duration': '1-2 weeks'},
                    {'step': 3, 'title': 'Execution', 'description': 'Running and optimizing campaigns', 'duration': 'Ongoing'},
                    {'step': 4, 'title': 'Monitoring', 'description': 'Continuous monitoring and optimization', 'duration': 'Ongoing'}
                ]
            },
            {
                'name': 'UI/UX Design',
                'category_name': 'Design',
                'description': 'Beautiful and intuitive user interface and user experience design for web and mobile.',
                'price': 399.00,
                'rating': 4.9,
                'review_count': 98,
                'overview': 'User-centered design process for optimal user experience.',
                'included_features': [
                    'User research and analysis',
                    'Wireframing and prototyping',
                    'Visual design and branding',
                    'Design system creation',
                    'Usability testing',
                    'Responsive design',
                    'Interactive prototypes',
                    'Design handoff to developers'
                ],
                'key_features': ['User Research', 'Wireframing', 'Prototyping', 'Design System'],
                'availability': '3-4 weeks',
                'process_steps': [
                    {'step': 1, 'title': 'Research & Discovery', 'description': 'Understanding users and business goals', 'duration': '1 week'},
                    {'step': 2, 'title': 'Wireframing', 'description': 'Creating wireframes and user flows', 'duration': '1 week'},
                    {'step': 3, 'title': 'Visual Design', 'description': 'Creating beautiful visual designs', 'duration': '1-2 weeks'},
                    {'step': 4, 'title': 'Prototyping', 'description': 'Building interactive prototypes', 'duration': '3-5 days'}
                ]
            },
            {
                'name': 'Cloud Migration',
                'category_name': 'Infrastructure',
                'description': 'Seamless migration of your applications and data to cloud platforms like AWS, Azure, or GCP.',
                'price': 899.00,
                'rating': 4.8,
                'review_count': 67,
                'overview': 'Secure and efficient cloud migration services with zero downtime.',
                'included_features': [
                    'Cloud infrastructure assessment',
                    'Migration planning and strategy',
                    'Data migration services',
                    'Application migration',
                    'Security configuration',
                    'Performance optimization',
                    'Cost optimization',
                    '24/7 support during migration'
                ],
                'key_features': ['Zero Downtime', 'Security Assessment', 'Cost Optimization', '24/7 Support'],
                'availability': '4-8 weeks',
                'process_steps': [
                    {'step': 1, 'title': 'Assessment', 'description': 'Analyzing current infrastructure', 'duration': '1-2 weeks'},
                    {'step': 2, 'title': 'Planning', 'description': 'Creating migration strategy', 'duration': '1 week'},
                    {'step': 3, 'title': 'Migration', 'description': 'Migrating applications and data', 'duration': '2-4 weeks'},
                    {'step': 4, 'title': 'Optimization', 'description': 'Optimizing performance and costs', 'duration': '1 week'}
                ]
            },
            {
                'name': 'Data Analytics',
                'category_name': 'Analytics',
                'description': 'Advanced data analytics and business intelligence solutions to drive informed decisions.',
                'price': 499.00,
                'rating': 4.7,
                'review_count': 145,
                'overview': 'Transform your data into actionable business insights.',
                'included_features': [
                    'Data collection and integration',
                    'Advanced analytics and reporting',
                    'Custom dashboard creation',
                    'Predictive analytics',
                    'Data visualization',
                    'Business intelligence setup',
                    'Real-time monitoring',
                    'Monthly insights reports'
                ],
                'key_features': ['Data Visualization', 'Predictive Analytics', 'Custom Dashboards', 'Real-time Reports'],
                'availability': '2-4 weeks',
                'process_steps': [
                    {'step': 1, 'title': 'Data Audit', 'description': 'Analyzing your data sources', 'duration': '3-5 days'},
                    {'step': 2, 'title': 'Integration', 'description': 'Connecting and cleaning data', 'duration': '1-2 weeks'},
                    {'step': 3, 'title': 'Analytics Setup', 'description': 'Building analytics infrastructure', 'duration': '1-2 weeks'},
                    {'step': 4, 'title': 'Dashboard Creation', 'description': 'Creating custom dashboards', 'duration': '3-5 days'}
                ]
            },
            {
                'name': 'Technical Consulting',
                'category_name': 'Consulting',
                'description': 'Expert technical consultation to help you make informed technology decisions.',
                'price': 149.00,
                'rating': 4.8,
                'review_count': 178,
                'overview': 'Strategic technology consulting and advisory services.',
                'included_features': [
                    'Technology audit and assessment',
                    'Architecture review and recommendations',
                    'Best practices implementation',
                    'Implementation planning',
                    'Technology selection guidance',
                    'Performance optimization',
                    'Security assessment',
                    'Follow-up consultation'
                ],
                'key_features': ['Technology Audit', 'Architecture Review', 'Best Practices', 'Implementation Plan'],
                'availability': '1-2 days',
                'process_steps': [
                    {'step': 1, 'title': 'Initial Assessment', 'description': 'Understanding current technology stack', 'duration': '4-6 hours'},
                    {'step': 2, 'title': 'Analysis', 'description': 'Analyzing and identifying issues', 'duration': '4-6 hours'},
                    {'step': 3, 'title': 'Recommendations', 'description': 'Providing detailed recommendations', 'duration': '2-4 hours'},
                    {'step': 4, 'title': 'Implementation Plan', 'description': 'Creating actionable implementation plan', 'duration': '2-4 hours'}
                ]
            },
            {
                'name': 'iPhone Screen Repair',
                'category_name': 'Mobile Repair',
                'description': 'Professional iPhone screen repair services using high-quality parts and expert technicians.',
                'price': 129.00,
                'rating': 4.9,
                'review_count': 234,
                'overview': 'Fast and reliable iPhone screen repair with warranty.',
                'included_features': [
                    'High-quality screen replacement',
                    'Professional installation',
                    'Warranty included',
                    'Same-day service available',
                    'Data protection guaranteed',
                    'Free diagnostic',
                    'Quality parts guarantee',
                    'Post-repair testing'
                ],
                'key_features': ['Same Day Service', 'Warranty Included', 'Quality Parts', 'Expert Technicians'],
                'availability': 'Same day',
                'process_steps': [
                    {'step': 1, 'title': 'Diagnostic', 'description': 'Assessing the damage', 'duration': '15 minutes'},
                    {'step': 2, 'title': 'Quote', 'description': 'Providing repair quote', 'duration': '5 minutes'},
                    {'step': 3, 'title': 'Repair', 'description': 'Performing the repair', 'duration': '1-2 hours'},
                    {'step': 4, 'title': 'Testing', 'description': 'Quality testing and delivery', 'duration': '15 minutes'}
                ]
            },
            {
                'name': 'Cybersecurity Audit',
                'category_name': 'Security',
                'description': 'Comprehensive cybersecurity audit to identify vulnerabilities and strengthen your security posture.',
                'price': 699.00,
                'rating': 4.8,
                'review_count': 87,
                'overview': 'Complete security assessment and recommendations.',
                'included_features': [
                    'Security vulnerability assessment',
                    'Penetration testing',
                    'Security policy review',
                    'Compliance audit',
                    'Security recommendations',
                    'Implementation roadmap',
                    'Staff security training',
                    'Follow-up security monitoring'
                ],
                'key_features': ['Vulnerability Assessment', 'Penetration Testing', 'Compliance Audit', 'Security Training'],
                'availability': '2-3 weeks',
                'process_steps': [
                    {'step': 1, 'title': 'Initial Assessment', 'description': 'Understanding security landscape', 'duration': '2-3 days'},
                    {'step': 2, 'title': 'Testing', 'description': 'Performing security tests', 'duration': '1-2 weeks'},
                    {'step': 3, 'title': 'Analysis', 'description': 'Analyzing results and vulnerabilities', 'duration': '2-3 days'},
                    {'step': 4, 'title': 'Reporting', 'description': 'Creating detailed security report', 'duration': '2-3 days'}
                ]
            },
            {
                'name': 'IT Support Services',
                'category_name': 'Support',
                'description': 'Comprehensive IT support services for businesses of all sizes.',
                'price': 99.00,
                'rating': 4.7,
                'review_count': 312,
                'overview': 'Professional IT support to keep your business running smoothly.',
                'included_features': [
                    '24/7 technical support',
                    'Remote and on-site assistance',
                    'Hardware and software support',
                    'Network troubleshooting',
                    'Data backup solutions',
                    'System maintenance',
                    'User training',
                    'Monthly health checks'
                ],
                'key_features': ['24/7 Support', 'Remote Assistance', 'System Maintenance', 'Data Backup'],
                'availability': '24/7',
                'process_steps': [
                    {'step': 1, 'title': 'Onboarding', 'description': 'Setting up support infrastructure', 'duration': '1-2 days'},
                    {'step': 2, 'title': 'Monitoring', 'description': 'Continuous system monitoring', 'duration': 'Ongoing'},
                    {'step': 3, 'title': 'Support', 'description': 'Providing technical support', 'duration': '24/7'},
                    {'step': 4, 'title': 'Maintenance', 'description': 'Regular system maintenance', 'duration': 'Monthly'}
                ]
            }
        ]

        created_services = 0
        
        for service_data in services_data:
            category = ServiceCategory.objects.get(name=service_data['category_name'])
            
            service, created = Service.objects.get_or_create(
                name=service_data['name'],
                defaults={
                    'description': service_data['description'],
                    'price': service_data['price'],
                    'rating': service_data['rating'],
                    'review_count': service_data['review_count'],
                    'overview': service_data['overview'],
                    'included_features': service_data['included_features'],
                    'key_features': service_data['key_features'],
                    'availability': service_data['availability'],
                    'process_steps': service_data['process_steps'],
                    'category': category
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
                        bg_color=(59, 130, 246) if service_data['category_name'] == 'Development' else
                                (16, 185, 129) if service_data['category_name'] == 'Design' else
                                (245, 101, 101) if service_data['category_name'] == 'Marketing' else
                                (139, 92, 246) if service_data['category_name'] == 'Security' else
                                (236, 72, 153) if service_data['category_name'] == 'Mobile Repair' else
                                (251, 146, 60) if service_data['category_name'] == 'Support' else
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

        self.stdout.write(
            self.style.SUCCESS(f'Successfully created {created_categories} categories and {created_services} services')
        )
