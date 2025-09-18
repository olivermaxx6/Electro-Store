from django.core.management.base import BaseCommand
from adminpanel.models import Category

class Command(BaseCommand):
    help = 'Seed initial categories'

    def handle(self, *args, **options):
        # Define initial categories
        categories_data = [
            {
                'name': 'Laptops',
                'children': [
                    'Gaming Laptops',
                    'Business Laptops',
                    'Ultrabooks'
                ]
            },
            {
                'name': 'Smartphones',
                'children': [
                    'iPhone',
                    'Android Phones',
                    'Budget Phones'
                ]
            },
            {
                'name': 'Cameras',
                'children': [
                    'DSLR Cameras',
                    'Mirrorless Cameras',
                    'Action Cameras'
                ]
            },
            {
                'name': 'Accessories',
                'children': [
                    'Headphones',
                    'Keyboards',
                    'Mice',
                    'Office Furniture'
                ]
            },
            {
                'name': 'Tablets',
                'children': [
                    'iPad',
                    'Android Tablets'
                ]
            },
            {
                'name': 'Audio',
                'children': [
                    'Speakers',
                    'Earbuds',
                    'Headsets'
                ]
            }
        ]

        created_count = 0
        
        for category_data in categories_data:
            # Create main category
            main_category, created = Category.objects.get_or_create(
                name=category_data['name'],
                parent=None
            )
            
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'Created category: {main_category.name}')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'Category already exists: {main_category.name}')
                )
            
            # Create subcategories
            for child_name in category_data['children']:
                child_category, created = Category.objects.get_or_create(
                    name=child_name,
                    parent=main_category
                )
                
                if created:
                    created_count += 1
                    self.stdout.write(
                        self.style.SUCCESS(f'Created subcategory: {child_category.name}')
                    )
                else:
                    self.stdout.write(
                        self.style.WARNING(f'Subcategory already exists: {child_category.name}')
                    )

        self.stdout.write(
            self.style.SUCCESS(f'Successfully created {created_count} categories')
        )
