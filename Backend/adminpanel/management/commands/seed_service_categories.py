from django.core.management.base import BaseCommand
from adminpanel.models import ServiceCategory, Service

class Command(BaseCommand):
    help = 'Seed service categories and assign them to existing services'

    def handle(self, *args, **options):
        # Create service categories
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
            }
        ]

        created_count = 0
        
        for category_data in categories_data:
            category, created = ServiceCategory.objects.get_or_create(
                name=category_data['name'],
                defaults={
                    'description': category_data['description'],
                    'ordering': category_data['ordering']
                }
            )
            
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'Created service category: {category.name}')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'Service category already exists: {category.name}')
                )

        # Update existing services with categories and additional data
        services_to_update = [
            {
                'name': 'Laptop Repair',
                'category_name': 'Consulting',
                'rating': 4.8,
                'review_count': 124,
                'overview': 'Professional laptop repair services including diagnostics, parts replacement, and optimization.',
                'key_features': ['Hardware Diagnostics', 'Parts Replacement', 'Performance Optimization', 'Data Recovery'],
                'availability': '2-3 business days',
                'price': 49
            },
            {
                'name': 'Phone Screen Replacement',
                'category_name': 'Consulting',
                'rating': 4.9,
                'review_count': 89,
                'overview': 'High-quality phone screen replacement using OEM parts.',
                'key_features': ['OEM Quality Parts', 'Professional Installation', 'Warranty Included', 'Same Day Service'],
                'availability': 'Same day',
                'price': 89
            }
        ]

        # Create additional services to match the original hardcoded data
        additional_services = [
            {
                'name': 'Website Development',
                'category_name': 'Development',
                'description': 'Professional website development using modern technologies like React, Node.js, and more.',
                'price': 299,
                'rating': 4.8,
                'review_count': 124,
                'overview': 'Complete website development from concept to deployment.',
                'key_features': ['Responsive Design', 'SEO Optimized', 'Fast Loading', 'Mobile Friendly'],
                'availability': '2-3 weeks'
            },
            {
                'name': 'Mobile App Development',
                'category_name': 'Development',
                'description': 'Native and cross-platform mobile app development for iOS and Android.',
                'price': 599,
                'rating': 4.9,
                'review_count': 89,
                'overview': 'Full-stack mobile application development.',
                'key_features': ['Cross-Platform', 'Native Performance', 'App Store Ready', 'Push Notifications'],
                'availability': '4-6 weeks'
            },
            {
                'name': 'E-commerce Solutions',
                'category_name': 'E-commerce',
                'description': 'Complete e-commerce platform development with payment integration and inventory management.',
                'price': 799,
                'rating': 4.7,
                'review_count': 156,
                'overview': 'End-to-end e-commerce platform development.',
                'key_features': ['Payment Gateway', 'Inventory Management', 'Order Tracking', 'Analytics Dashboard'],
                'availability': '6-8 weeks'
            },
            {
                'name': 'Digital Marketing',
                'category_name': 'Marketing',
                'description': 'Comprehensive digital marketing strategies including SEO, social media, and PPC campaigns.',
                'price': 199,
                'rating': 4.6,
                'review_count': 203,
                'overview': 'Complete digital marketing strategy and execution.',
                'key_features': ['SEO Optimization', 'Social Media', 'PPC Campaigns', 'Analytics Reports'],
                'availability': 'Ongoing'
            },
            {
                'name': 'UI/UX Design',
                'category_name': 'Design',
                'description': 'Beautiful and intuitive user interface and user experience design for web and mobile.',
                'price': 399,
                'rating': 4.9,
                'review_count': 98,
                'overview': 'User-centered design process for optimal user experience.',
                'key_features': ['User Research', 'Wireframing', 'Prototyping', 'Design System'],
                'availability': '3-4 weeks'
            },
            {
                'name': 'Cloud Migration',
                'category_name': 'Infrastructure',
                'description': 'Seamless migration of your applications and data to cloud platforms like AWS, Azure, or GCP.',
                'price': 899,
                'rating': 4.8,
                'review_count': 67,
                'overview': 'Secure and efficient cloud migration services.',
                'key_features': ['Zero Downtime', 'Security Assessment', 'Cost Optimization', '24/7 Support'],
                'availability': '4-8 weeks'
            },
            {
                'name': 'Data Analytics',
                'category_name': 'Analytics',
                'description': 'Advanced data analytics and business intelligence solutions to drive informed decisions.',
                'price': 499,
                'rating': 4.7,
                'review_count': 145,
                'overview': 'Transform your data into actionable business insights.',
                'key_features': ['Data Visualization', 'Predictive Analytics', 'Custom Dashboards', 'Real-time Reports'],
                'availability': '2-4 weeks'
            },
            {
                'name': 'Technical Consulting',
                'category_name': 'Consulting',
                'description': 'Expert technical consultation to help you make informed technology decisions.',
                'price': 149,
                'rating': 4.8,
                'review_count': 178,
                'overview': 'Strategic technology consulting and advisory services.',
                'key_features': ['Technology Audit', 'Architecture Review', 'Best Practices', 'Implementation Plan'],
                'availability': '1-2 days'
            }
        ]

        # Update existing services
        for service_data in services_to_update:
            try:
                service = Service.objects.get(name=service_data['name'])
                category = ServiceCategory.objects.get(name=service_data['category_name'])
                
                service.category = category
                service.rating = service_data['rating']
                service.review_count = service_data['review_count']
                service.overview = service_data['overview']
                service.key_features = service_data['key_features']
                service.availability = service_data['availability']
                service.price = service_data['price']
                service.save()
                
                self.stdout.write(
                    self.style.SUCCESS(f'Updated service: {service.name}')
                )
            except Service.DoesNotExist:
                self.stdout.write(
                    self.style.WARNING(f'Service not found: {service_data["name"]}')
                )

        # Create additional services
        for service_data in additional_services:
            service, created = Service.objects.get_or_create(
                name=service_data['name'],
                defaults={
                    'description': service_data['description'],
                    'price': service_data['price'],
                    'rating': service_data['rating'],
                    'review_count': service_data['review_count'],
                    'overview': service_data['overview'],
                    'key_features': service_data['key_features'],
                    'availability': service_data['availability'],
                    'category': ServiceCategory.objects.get(name=service_data['category_name'])
                }
            )
            
            if created:
                self.stdout.write(
                    self.style.SUCCESS(f'Created service: {service.name}')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'Service already exists: {service.name}')
                )

        self.stdout.write(
            self.style.SUCCESS(f'Successfully created {created_count} service categories and updated services')
        )
