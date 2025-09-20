import os
from django.core.management.base import BaseCommand
from django.core.files.base import ContentFile
from adminpanel.models import Product, ProductImage
from PIL import Image
import io

class Command(BaseCommand):
    help = "Add placeholder images to products"

    def handle(self, *args, **opts):
        self.stdout.write("Adding placeholder images to products...")
        
        # Create a simple placeholder image
        def create_placeholder_image(width=400, height=300, color=(240, 240, 240), text="Product Image"):
            img = Image.new('RGB', (width, height), color)
            
            # Add some basic styling
            from PIL import ImageDraw, ImageFont
            draw = ImageDraw.Draw(img)
            
            # Try to use a default font, fallback to basic if not available
            try:
                font = ImageFont.truetype("arial.ttf", 24)
            except:
                font = ImageFont.load_default()
            
            # Calculate text position
            bbox = draw.textbbox((0, 0), text, font=font)
            text_width = bbox[2] - bbox[0]
            text_height = bbox[3] - bbox[1]
            x = (width - text_width) // 2
            y = (height - text_height) // 2
            
            # Draw text
            draw.text((x, y), text, fill=(100, 100, 100), font=font)
            
            # Save to bytes
            img_io = io.BytesIO()
            img.save(img_io, format='JPEG', quality=85)
            img_io.seek(0)
            return ContentFile(img_io.getvalue(), name=f"{text.replace(' ', '_').lower()}.jpg")

        # Add images to products that don't have any
        products_without_images = Product.objects.filter(images__isnull=True).distinct()
        
        for product in products_without_images:
            # Create placeholder image with product name
            placeholder_img = create_placeholder_image(
                text=product.name[:20] + "..." if len(product.name) > 20 else product.name
            )
            
            # Create ProductImage instance
            product_image = ProductImage.objects.create(
                product=product,
                image=placeholder_img
            )
            
            self.stdout.write(f"Added image for: {product.name}")

        self.stdout.write(self.style.SUCCESS("Product images added successfully!"))
