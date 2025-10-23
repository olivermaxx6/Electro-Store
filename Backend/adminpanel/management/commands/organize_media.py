"""
Migration script to organize existing media files into the new folder structure.
This script moves existing media files to their appropriate organized folders.
"""
import os
import shutil
from pathlib import Path
from django.core.management.base import BaseCommand
from django.conf import settings


class Command(BaseCommand):
    help = 'Organize existing media files into the new folder structure'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be moved without actually moving files',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        media_root = Path(settings.MEDIA_ROOT)
        
        if dry_run:
            self.stdout.write(self.style.WARNING('DRY RUN MODE - No files will be moved'))
        
        # Create the new folder structure
        new_folders = [
            '01_store',
            '02_categories',
            '03_products', 
            '04_services',
            '05_service_categories',
            '06_brands',
            '07_reviews',
            '08_website_content',
            '08_website_content/banners',
            '08_website_content/deals',
            '08_website_content/logos',
        ]
        
        for folder in new_folders:
            folder_path = media_root / folder
            if not dry_run:
                folder_path.mkdir(parents=True, exist_ok=True)
            self.stdout.write(f'Created folder: {folder}')
        
        # Move store files
        self.move_files(media_root, 'store', '01_store', dry_run)
        
        # Move category files
        self.move_files(media_root, 'categories', '02_categories', dry_run)
        
        # Move service category files
        self.move_files(media_root, 'service_categories', '05_service_categories', dry_run)
        
        # Move service files
        self.move_files(media_root, 'services', '04_services', dry_run)
        
        # Move product files from Assets/images/products/Selling products
        self.move_files(media_root, 'Assets/images/products/Selling products', '03_products', dry_run)
        
        self.stdout.write(self.style.SUCCESS('Media organization completed!'))

    def move_files(self, media_root, source_folder, dest_folder, dry_run):
        """Move files from source folder to destination folder"""
        source_path = media_root / source_folder
        dest_path = media_root / dest_folder
        
        if not source_path.exists():
            self.stdout.write(f'Source folder does not exist: {source_folder}')
            return
        
        files_moved = 0
        for file_path in source_path.rglob('*'):
            if file_path.is_file():
                relative_path = file_path.relative_to(source_path)
                dest_file_path = dest_path / relative_path
                
                # Create destination directory if it doesn't exist
                if not dry_run:
                    dest_file_path.parent.mkdir(parents=True, exist_ok=True)
                
                if dry_run:
                    self.stdout.write(f'Would move: {file_path} -> {dest_file_path}')
                else:
                    try:
                        shutil.move(str(file_path), str(dest_file_path))
                        self.stdout.write(f'Moved: {file_path} -> {dest_file_path}')
                        files_moved += 1
                    except Exception as e:
                        self.stdout.write(self.style.ERROR(f'Error moving {file_path}: {e}'))
        
        if not dry_run:
            # Remove empty source directories
            try:
                if source_path.exists() and not any(source_path.iterdir()):
                    source_path.rmdir()
                    self.stdout.write(f'Removed empty directory: {source_path}')
            except Exception as e:
                self.stdout.write(self.style.WARNING(f'Could not remove {source_path}: {e}'))
        
        self.stdout.write(f'Moved {files_moved} files from {source_folder} to {dest_folder}')
