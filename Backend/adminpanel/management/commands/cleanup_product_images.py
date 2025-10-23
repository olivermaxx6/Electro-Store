# -*- coding: utf-8 -*-
"""
Management command to clean up duplicate product images and generate hashes
"""
from django.core.management.base import BaseCommand
from django.db import transaction
from adminpanel.models import ProductImage, Product
import hashlib
import os


class Command(BaseCommand):
    help = 'Clean up duplicate product images and generate hashes for existing images'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be done without making changes',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        
        if dry_run:
            self.stdout.write(self.style.WARNING("DRY RUN MODE - No changes will be made"))
        
        self.stdout.write("Starting product image cleanup and hash generation...")
        
        # Generate hashes for existing images
        self.generate_hashes_for_existing_images(dry_run)
        
        # Remove duplicate images
        self.remove_duplicate_images(dry_run)
        
        self.stdout.write(self.style.SUCCESS("Product image cleanup completed!"))

    def generate_hashes_for_existing_images(self, dry_run=False):
        """Generate hashes for existing product images that don't have them"""
        self.stdout.write("\nGenerating hashes for existing images...")
        
        images_without_hash = ProductImage.objects.filter(image_hash__isnull=True) | ProductImage.objects.filter(image_hash='')
        count = images_without_hash.count()
        
        if count == 0:
            self.stdout.write("All images already have hashes.")
            return
        
        self.stdout.write(f"Found {count} images without hashes.")
        
        processed = 0
        for image in images_without_hash:
            try:
                if image.image and hasattr(image.image, 'path') and os.path.exists(image.image.path):
                    with open(image.image.path, 'rb') as f:
                        content = f.read()
                        hash_md5 = hashlib.md5(content).hexdigest()
                    
                    if not dry_run:
                        image.image_hash = hash_md5
                        image.save()
                    
                    processed += 1
                    self.stdout.write(f"  Generated hash for {image.product.name} image")
                else:
                    self.stdout.write(f"  Skipping {image.product.name} - image file not found")
            except Exception as e:
                self.stdout.write(f"  Error processing {image.product.name}: {e}")
        
        self.stdout.write(f"Processed {processed} images.")

    def remove_duplicate_images(self, dry_run=False):
        """Find and remove duplicate images based on hash"""
        self.stdout.write("\nLooking for duplicate images...")
        
        # Group images by product and hash
        from django.db.models import Count
        duplicate_groups = ProductImage.objects.values('product', 'image_hash').annotate(
            count=Count('id')
        ).filter(count__gt=1, image_hash__isnull=False).exclude(image_hash='')
        
        if not duplicate_groups.exists():
            self.stdout.write("No duplicate images found.")
            return
        
        duplicates_found = 0
        
        for group in duplicate_groups:
            product_id = group['product']
            image_hash = group['image_hash']
            count = group['count']
            
            # Get all images in this duplicate group
            images_to_keep = ProductImage.objects.filter(
                product_id=product_id,
                image_hash=image_hash
            ).order_by('created_at')  # Keep the oldest one
            
            if count > 1:
                duplicates_found += self._process_duplicate_group(images_to_keep, dry_run)
        
        if duplicates_found > 0:
            self.stdout.write(f"Processed {duplicates_found} duplicate image groups.")
        else:
            self.stdout.write("No duplicate images found.")

    def _process_duplicate_group(self, images, dry_run=False):
        """Process a group of duplicate images, keeping the oldest one"""
        images_list = list(images)
        if len(images_list) <= 1:
            return 0
        
        product_name = images_list[0].product.name
        hash_short = images_list[0].image_hash[:8] if images_list[0].image_hash else "no-hash"
        
        self.stdout.write(f"  Found {len(images_list)} duplicate images for product '{product_name}' (hash: {hash_short}...)")
        
        # Keep the first (oldest) image, delete the rest
        image_to_keep = images_list[0]
        images_to_delete = images_list[1:]
        
        self.stdout.write(f"    Keeping: {image_to_keep.id} (created: {image_to_keep.created_at})")
        
        for img in images_to_delete:
            self.stdout.write(f"    Deleting: {img.id} (created: {img.created_at})")
            if not dry_run:
                img.delete()
        
        return 1
