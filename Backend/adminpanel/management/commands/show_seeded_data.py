from django.core.management.base import BaseCommand
from adminpanel.models import ServiceCategory, Service

class Command(BaseCommand):
    help = 'Display all seeded service categories and services'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('=== SEEDED SERVICE DATA ===\n'))
        
        # Display categories
        self.stdout.write(self.style.HTTP_INFO('SERVICE CATEGORIES:'))
        categories = ServiceCategory.objects.all().order_by('ordering')
        for category in categories:
            service_count = category.services.count()
            self.stdout.write(f"  • {category.name} ({service_count} services)")
            self.stdout.write(f"    Description: {category.description}")
            self.stdout.write("")
        
        # Display services
        self.stdout.write(self.style.HTTP_INFO('SERVICES:'))
        services = Service.objects.all().order_by('category__ordering', 'name')
        current_category = None
        
        for service in services:
            if service.category != current_category:
                current_category = service.category
                category_name = current_category.name if current_category else 'Uncategorized'
                self.stdout.write(f"\n{self.style.HTTP_INFO(f'=== {category_name.upper()} ===')}")
            
            self.stdout.write(f"  • {service.name}")
            self.stdout.write(f"    Price: ${service.price}")
            self.stdout.write(f"    Rating: {service.rating} ({service.review_count} reviews)")
            self.stdout.write(f"    Availability: {service.availability}")
            self.stdout.write(f"    Description: {service.description[:100]}...")
            self.stdout.write(f"    Images: {service.images.count()} image(s)")
            self.stdout.write("")
        
        self.stdout.write(self.style.SUCCESS(f'Total: {categories.count()} categories, {services.count()} services'))
