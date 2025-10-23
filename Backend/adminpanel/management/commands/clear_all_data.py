import os
import shutil
from django.core.management.base import BaseCommand
from django.conf import settings
from django.db import transaction
from adminpanel.models import (
    Product, ProductImage, Service, ServiceImage, ServiceCategory,
    Category, Brand, Review, ServiceReview, ServiceInquiry, ServiceQuery,
    Order, OrderItem, Payment
)


class Command(BaseCommand):
    help = 'Clear all products, services, and media files from the system'

    def add_arguments(self, parser):
        parser.add_argument(
            '--confirm',
            action='store_true',
            help='Confirm that you want to delete all data (required for safety)',
        )
        parser.add_argument(
            '--keep-media-structure',
            action='store_true',
            help='Keep the media directory structure but remove all files',
        )

    def handle(self, *args, **options):
        if not options['confirm']:
            self.stdout.write(
                self.style.ERROR(
                    'This command will delete ALL products, services, and media files!\n'
                    'Use --confirm flag to proceed.'
                )
            )
            return

        self.stdout.write(
            self.style.WARNING('Starting cleanup of all products, services, and media files...')
        )

        try:
            with transaction.atomic():
                # Clear database records
                self.clear_database_records()
                
                # Clear media files
                self.clear_media_files(options['keep_media_structure'])
                
            self.stdout.write(
                self.style.SUCCESS('Successfully cleared all products, services, and media files!')
            )
            
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error during cleanup: {str(e)}')
            )
            raise

    def clear_database_records(self):
        """Clear all database records related to products and services"""
        
        # Count records before deletion
        product_count = Product.objects.count()
        service_count = Service.objects.count()
        category_count = Category.objects.count()
        service_category_count = ServiceCategory.objects.count()
        brand_count = Brand.objects.count()
        review_count = Review.objects.count()
        service_review_count = ServiceReview.objects.count()
        order_count = Order.objects.count()
        
        self.stdout.write(f'Found {product_count} products to delete')
        self.stdout.write(f'Found {service_count} services to delete')
        self.stdout.write(f'Found {category_count} categories to delete')
        self.stdout.write(f'Found {service_category_count} service categories to delete')
        self.stdout.write(f'Found {brand_count} brands to delete')
        self.stdout.write(f'Found {review_count} product reviews to delete')
        self.stdout.write(f'Found {service_review_count} service reviews to delete')
        self.stdout.write(f'Found {order_count} orders to delete')
        
        # Delete in order to respect foreign key constraints
        
        # 1. Delete reviews first (they reference products/services)
        deleted_reviews = Review.objects.all().delete()
        deleted_service_reviews = ServiceReview.objects.all().delete()
        self.stdout.write(f'Deleted {deleted_reviews[0]} product reviews')
        self.stdout.write(f'Deleted {deleted_service_reviews[0]} service reviews')
        
        # 2. Delete service inquiries and queries
        deleted_inquiries = ServiceInquiry.objects.all().delete()
        deleted_queries = ServiceQuery.objects.all().delete()
        self.stdout.write(f'Deleted {deleted_inquiries[0]} service inquiries')
        self.stdout.write(f'Deleted {deleted_queries[0]} service queries')
        
        # 3. Delete orders and payments
        deleted_payments = Payment.objects.all().delete()
        deleted_order_items = OrderItem.objects.all().delete()
        deleted_orders = Order.objects.all().delete()
        self.stdout.write(f'Deleted {deleted_payments[0]} payments')
        self.stdout.write(f'Deleted {deleted_order_items[0]} order items')
        self.stdout.write(f'Deleted {deleted_orders[0]} orders')
        
        # 4. Delete product images
        deleted_product_images = ProductImage.objects.all().delete()
        self.stdout.write(f'Deleted {deleted_product_images[0]} product images')
        
        # 5. Delete service images
        deleted_service_images = ServiceImage.objects.all().delete()
        self.stdout.write(f'Deleted {deleted_service_images[0]} service images')
        
        # 6. Delete products
        deleted_products = Product.objects.all().delete()
        self.stdout.write(f'Deleted {deleted_products[0]} products')
        
        # 7. Delete services
        deleted_services = Service.objects.all().delete()
        self.stdout.write(f'Deleted {deleted_services[0]} services')
        
        # 8. Delete categories (children first, then parents)
        # Delete all categories (Django will handle the cascade)
        deleted_categories = Category.objects.all().delete()
        self.stdout.write(f'Deleted {deleted_categories[0]} categories')
        
        # 9. Delete service categories
        deleted_service_categories = ServiceCategory.objects.all().delete()
        self.stdout.write(f'Deleted {deleted_service_categories[0]} service categories')
        
        # 10. Delete brands
        deleted_brands = Brand.objects.all().delete()
        self.stdout.write(f'Deleted {deleted_brands[0]} brands')

    def clear_media_files(self, keep_structure=False):
        """Clear all media files"""
        
        media_root = settings.MEDIA_ROOT
        
        # Directories to clear
        directories_to_clear = [
            'products',
            'services', 
            'categories',
            'service_categories',
            'brands',
            'reviews'
        ]
        
        total_files_deleted = 0
        
        for directory in directories_to_clear:
            dir_path = os.path.join(media_root, directory)
            
            if os.path.exists(dir_path):
                files_in_dir = []
                for root, dirs, files in os.walk(dir_path):
                    files_in_dir.extend(files)
                
                if files_in_dir:
                    self.stdout.write(f'Found {len(files_in_dir)} files in {directory}/')
                    
                    if keep_structure:
                        # Remove files but keep directory structure
                        for root, dirs, files in os.walk(dir_path):
                            for file in files:
                                file_path = os.path.join(root, file)
                                try:
                                    os.remove(file_path)
                                    total_files_deleted += 1
                                except OSError as e:
                                    self.stdout.write(
                                        self.style.WARNING(f'Could not delete {file_path}: {e}')
                                    )
                    else:
                        # Remove entire directory and recreate if needed
                        try:
                            shutil.rmtree(dir_path)
                            os.makedirs(dir_path, exist_ok=True)
                            total_files_deleted += len(files_in_dir)
                        except OSError as e:
                            self.stdout.write(
                                self.style.WARNING(f'Could not delete directory {dir_path}: {e}')
                            )
                else:
                    self.stdout.write(f'No files found in {directory}/')
            else:
                self.stdout.write(f'Directory {directory}/ does not exist')
        
        self.stdout.write(f'Total media files deleted: {total_files_deleted}')
        
        # Also clear any other media files that might exist
        self.clear_orphaned_media_files()

    def clear_orphaned_media_files(self):
        """Clear any orphaned media files that might not be in the standard directories"""
        
        media_root = settings.MEDIA_ROOT
        
        # Look for any image files in the root media directory
        orphaned_files = []
        
        if os.path.exists(media_root):
            for item in os.listdir(media_root):
                item_path = os.path.join(media_root, item)
                
                # Skip directories we've already handled
                if os.path.isdir(item_path) and item in ['products', 'services', 'categories', 'service_categories', 'brands', 'reviews']:
                    continue
                
                # If it's a file, add to orphaned list
                if os.path.isfile(item_path):
                    orphaned_files.append(item_path)
        
        if orphaned_files:
            self.stdout.write(f'Found {len(orphaned_files)} orphaned media files')
            for file_path in orphaned_files:
                try:
                    os.remove(file_path)
                    self.stdout.write(f'Deleted orphaned file: {os.path.basename(file_path)}')
                except OSError as e:
                    self.stdout.write(
                        self.style.WARNING(f'Could not delete {file_path}: {e}')
                    )
