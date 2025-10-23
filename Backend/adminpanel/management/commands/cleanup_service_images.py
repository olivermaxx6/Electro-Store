#!/usr/bin/env python
"""
Management command to clean up duplicate service images and generate hashes
"""
import os
import django
from django.conf import settings
from django.core.management.base import BaseCommand
from django.db import transaction
import hashlib

# Configure Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from adminpanel.models import ServiceImage

class Command(BaseCommand):
    help = 'Clean up duplicate service images and generate hashes for existing images'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be done without actually doing it',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        
        self.stdout.write("Starting service image cleanup and hash generation...")
        
        # First, generate hashes for existing images that don't have them
        self.generate_hashes_for_existing_images(dry_run)
        
        # Then, find and remove duplicates
        self.remove_duplicate_images(dry_run)
        
        self.stdout.write(
            self.style.SUCCESS('Service image cleanup completed!')
        )

    def generate_hashes_for_existing_images(self, dry_run=False):
        """Generate hashes for existing images that don't have them"""
        self.stdout.write("\nGenerating hashes for existing images...")
        
        images_without_hash = ServiceImage.objects.filter(image_hash='')
        count = images_without_hash.count()
        
        if count == 0:
            self.stdout.write("No images found without hashes.")
            return
        
        self.stdout.write(f"Found {count} images without hashes.")
        
        for img in images_without_hash:
            try:
                if img.image and hasattr(img.image, 'path'):
                    # Generate hash from file content
                    hash_md5 = self._generate_file_hash(img.image.path)
                    
                    if not dry_run:
                        img.image_hash = hash_md5
                        img.save(update_fields=['image_hash'])
                    
                    self.stdout.write(f"  Generated hash for image {img.id}: {hash_md5[:8]}...")
                else:
                    self.stdout.write(f"  Skipping image {img.id}: No file path")
            except Exception as e:
                self.stdout.write(f"  Error processing image {img.id}: {e}")

    def remove_duplicate_images(self, dry_run=False):
        """Find and remove duplicate images based on hash"""
        self.stdout.write("\nLooking for duplicate images...")
        
        # Group images by service and hash
        duplicates_found = 0
        
        # Get all images with hashes
        images_with_hash = ServiceImage.objects.exclude(image_hash='').order_by('service', 'image_hash', 'created_at')
        
        current_service = None
        current_hash = None
        images_to_keep = None
        
        for img in images_with_hash:
            if img.service != current_service or img.image_hash != current_hash:
                # Process previous group if it had duplicates
                if current_service and current_hash and images_to_keep and len(images_to_keep) > 1:
                    duplicates_found += self._process_duplicate_group(images_to_keep, dry_run)
                
                # Start new group
                current_service = img.service
                current_hash = img.image_hash
                images_to_keep = [img]
            else:
                # Add to current group
                images_to_keep.append(img)
        
        # Process last group
        if current_service and current_hash and images_to_keep and len(images_to_keep) > 1:
            duplicates_found += self._process_duplicate_group(images_to_keep, dry_run)
        
        if duplicates_found == 0:
            self.stdout.write("No duplicate images found.")
        else:
            self.stdout.write(f"Processed {duplicates_found} duplicate image groups.")

    def _process_duplicate_group(self, images, dry_run=False):
        """Process a group of duplicate images, keeping the oldest one"""
        service_name = images[0].service.name
        hash_short = images[0].image_hash[:8]
        
        self.stdout.write(f"  Found {len(images)} duplicate images for service '{service_name}' (hash: {hash_short}...)")
        
        # Keep the oldest image (first in the list due to ordering)
        image_to_keep = images[0]
        images_to_remove = images[1:]
        
        self.stdout.write(f"    Keeping image {image_to_keep.id} (created: {image_to_keep.created_at})")
        
        for img in images_to_remove:
            self.stdout.write(f"    {'Would remove' if dry_run else 'Removing'} image {img.id} (created: {img.created_at})")
            
            if not dry_run:
                try:
                    # Delete the file if it exists
                    if img.image and hasattr(img.image, 'path') and os.path.exists(img.image.path):
                        os.remove(img.image.path)
                    
                    # Delete the database record
                    img.delete()
                except Exception as e:
                    self.stdout.write(f"      Error removing image {img.id}: {e}")
        
        return 1

    def _generate_file_hash(self, file_path):
        """Generate MD5 hash of a file"""
        hash_md5 = hashlib.md5()
        try:
            with open(file_path, "rb") as f:
                for chunk in iter(lambda: f.read(4096), b""):
                    hash_md5.update(chunk)
            return hash_md5.hexdigest()
        except Exception as e:
            self.stdout.write(f"Error generating hash for {file_path}: {e}")
            return ""
