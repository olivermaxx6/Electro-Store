from django.core.management.base import BaseCommand
from django.core.files.base import ContentFile
from adminpanel.models import Service, ServiceImage
from PIL import Image, ImageDraw, ImageFont
import io

class Command(BaseCommand):
    help = 'Add sample images to existing services'

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
        # Color scheme for different categories
        category_colors = {
            'Development': (59, 130, 246),      # Blue
            'E-commerce': (16, 185, 129),       # Green
            'Marketing': (245, 101, 101),       # Red
            'Design': (139, 92, 246),           # Purple
            'Infrastructure': (251, 146, 60),   # Orange
            'Analytics': (6, 182, 212),         # Cyan
            'Consulting': (168, 85, 247),       # Indigo
            'Mobile Repair': (236, 72, 153),    # Pink
            'Security': (239, 68, 68),          # Red
            'Support': (34, 197, 94),           # Green
        }
        
        services = Service.objects.all()
        images_created = 0
        
        for service in services:
            # Check if service already has images
            if service.images.exists():
                self.stdout.write(
                    self.style.WARNING(f'Service {service.name} already has images, skipping...')
                )
                continue
            
            # Get color for the category
            category_name = service.category.name if service.category else 'Development'
            bg_color = category_colors.get(category_name, (59, 130, 246))
            
            try:
                # Create sample image
                sample_image = self.create_sample_image(
                    service.name,
                    bg_color=bg_color,
                    text_color=(255, 255, 255)
                )
                
                # Create ServiceImage instance
                service_image = ServiceImage.objects.create(
                    service=service,
                    image=sample_image
                )
                
                images_created += 1
                self.stdout.write(
                    self.style.SUCCESS(f'Created image for service: {service.name}')
                )
                
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f'Error creating image for {service.name}: {str(e)}')
                )

        self.stdout.write(
            self.style.SUCCESS(f'Successfully created {images_created} service images')
        )
