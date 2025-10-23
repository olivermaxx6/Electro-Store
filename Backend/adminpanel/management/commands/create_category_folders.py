"""
Django management command to create production-safe media folders.
This command creates organized folders for reliable media management.
"""
from django.core.management.base import BaseCommand
from django.conf import settings
from adminpanel.upload_paths import create_production_folders, get_media_stats
import os


class Command(BaseCommand):
    help = 'Create production-safe media folders for reliable image management'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what folders would be created without actually creating them',
        )
        parser.add_argument(
            '--stats',
            action='store_true',
            help='Show current media folder statistics',
        )

    def handle(self, *args, **options):
        if options['stats']:
            self.show_stats()
            return

        if options['dry_run']:
            self.stdout.write(
                self.style.WARNING('DRY RUN - No folders will be created')
            )
            self.show_planned_folders()
        else:
            self.create_folders()

    def show_stats(self):
        """Show current media folder statistics"""
        self.stdout.write(
            self.style.SUCCESS('📊 Media Folder Statistics')
        )
        
        stats = get_media_stats()
        
        self.stdout.write(f"Total Files: {stats['total_files']}")
        self.stdout.write(f"Total Size: {self.format_size(stats['total_size'])}")
        self.stdout.write("")
        
        for folder, data in stats['folders'].items():
            self.stdout.write(f"📁 {folder}:")
            self.stdout.write(f"   Files: {data['file_count']}")
            if data['files']:
                self.stdout.write(f"   Sample files: {', '.join(data['files'][:3])}")
            self.stdout.write("")

    def show_planned_folders(self):
        """Show what folders would be created"""
        self.stdout.write(
            self.style.SUCCESS('📁 Planned Production Folders:')
        )
        
        folders = [
            "store",
            "categories", 
            "products",
            "services",
            "service_categories",
            "brands",
            "reviews",
            "website_content",
            "website_content/banners",
            "website_content/deals", 
            "website_content/logos"
        ]
        
        for folder in folders:
            folder_path = os.path.join(settings.MEDIA_ROOT, folder)
            exists = "✅ EXISTS" if os.path.exists(folder_path) else "❌ MISSING"
            self.stdout.write(f"   {folder} - {exists}")

    def create_folders(self):
        """Create production folders"""
        self.stdout.write(
            self.style.SUCCESS('🚀 Creating Production-Safe Media Folders...')
        )
        
        try:
            created_folders = create_production_folders()
            
            self.stdout.write(
                self.style.SUCCESS(f'✅ Successfully created {len(created_folders)} folders')
            )
            
            for folder in created_folders:
                self.stdout.write(f"   📁 {folder}")
            
            self.stdout.write("")
            self.stdout.write(
                self.style.SUCCESS('🎉 Production folders are ready!')
            )
            self.stdout.write("")
            self.stdout.write("📋 Folder Structure:")
            self.stdout.write("   store/                    - Store logos, favicon, about us")
            self.stdout.write("   categories/               - Product category images")
            self.stdout.write("   products/                 - Product images")
            self.stdout.write("   services/                 - Service images")
            self.stdout.write("   service_categories/       - Service category images")
            self.stdout.write("   brands/                   - Brand logos and images")
            self.stdout.write("   reviews/                  - Review images")
            self.stdout.write("   website_content/          - Website content images")
            self.stdout.write("   website_content/banners/  - Banner images")
            self.stdout.write("   website_content/deals/    - Deal images")
            self.stdout.write("   website_content/logos/    - Logo images")
            
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'❌ Error creating folders: {e}')
            )

    def format_size(self, size_bytes):
        """Format file size in human readable format"""
        if size_bytes == 0:
            return "0 B"
        
        size_names = ["B", "KB", "MB", "GB", "TB"]
        i = 0
        while size_bytes >= 1024 and i < len(size_names) - 1:
            size_bytes /= 1024.0
            i += 1
        
        return f"{size_bytes:.1f} {size_names[i]}"