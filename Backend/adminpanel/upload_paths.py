"""
Production-safe upload path functions for reliable media management.
This module provides organized upload paths optimized for live production environments.
Enhanced for zero conflicts and reliable image handling.
"""
import os
import uuid
import time
from uuid import uuid4
from django.conf import settings
import logging

logger = logging.getLogger(__name__)


def generate_safe_filename(original_filename, prefix=""):
    """Generate a production-safe filename with timestamp and UUID"""
    try:
        # Get file extension
        ext = os.path.splitext(original_filename)[1].lower()
        if not ext:
            ext = '.jpg'  # Default extension
        
        # Generate timestamp-based filename for better organization
        timestamp = int(time.time())
        unique_id = str(uuid4())[:8]  # Short UUID for readability
        
        if prefix:
            safe_name = f"{prefix}_{timestamp}_{unique_id}{ext}"
        else:
            safe_name = f"{timestamp}_{unique_id}{ext}"
        
        return safe_name
    except Exception as e:
        logger.error(f"Failed to generate safe filename: {e}")
        # Fallback to simple UUID
        return f"{uuid4()}{os.path.splitext(original_filename)[1].lower()}"


def ensure_folder_exists(folder_path):
    """Ensure the folder exists, create if it doesn't (production-safe)"""
    try:
        full_path = os.path.join(settings.MEDIA_ROOT, folder_path)
        os.makedirs(full_path, exist_ok=True)
        logger.info(f"Ensured folder exists: {folder_path}")
        return folder_path
    except Exception as e:
        logger.error(f"Failed to create folder {folder_path}: {e}")
        # Fallback to default media folder
        return ""


# =============================================================================
# PRODUCTION-SAFE UPLOAD PATHS - ORGANIZED BY CONTENT TYPE
# =============================================================================

def store_image_path(instance, filename):
    """Upload path for store-related images (logos, favicon, about us)"""
    safe_name = generate_safe_filename(filename, "store")
    folder_path = ensure_folder_exists("store")
    return f"{folder_path}/{safe_name}"


def category_image_path(instance, filename):
    """Upload path for product category images"""
    safe_name = generate_safe_filename(filename, "category")
    folder_path = ensure_folder_exists("categories")
    return f"{folder_path}/{safe_name}"


def product_image_path(instance, filename):
    """Upload path for product images"""
    safe_name = generate_safe_filename(filename, "product")
    folder_path = ensure_folder_exists("products")
    return f"{folder_path}/{safe_name}"


def service_image_path(instance, filename):
    """Upload path for service images with service ID and date"""
    try:
        # Get file extension
        ext = os.path.splitext(filename)[1].lower()
        if not ext:
            ext = '.jpg'
        
        # Get current date in YYYYMMDD format
        from datetime import datetime
        date_str = datetime.now().strftime("%Y%m%d")
        
        # Get service ID - handle both cases where service exists or is being created
        service_id = 'unknown'
        if hasattr(instance, 'service') and instance.service:
            if hasattr(instance.service, 'id') and instance.service.id:
                service_id = instance.service.id
            elif hasattr(instance.service, 'pk') and instance.service.pk:
                service_id = instance.service.pk
        
        # Generate unique identifier
        unique_id = str(uuid4())[:6]  # Shorter UUID for readability
        
        # Create filename: date_service_image_service_id_uniqueid.ext
        safe_name = f"{date_str}_service_image_{service_id}_{unique_id}{ext}"
        
        folder_path = ensure_folder_exists("services")
        return f"{folder_path}/{safe_name}"
    except Exception as e:
        logger.error(f"Failed to generate service image path: {e}")
        # Fallback to original method
        safe_name = generate_safe_filename(filename, "service")
        folder_path = ensure_folder_exists("services")
        return f"{folder_path}/{safe_name}"


def service_category_image_path(instance, filename):
    """Upload path for service category images with category ID and date"""
    try:
        # Get file extension
        ext = os.path.splitext(filename)[1].lower()
        if not ext:
            ext = '.jpg'
        
        # Get current date in YYYYMMDD format
        from datetime import datetime
        date_str = datetime.now().strftime("%Y%m%d")
        
        # Get category ID
        category_id = 'unknown'
        if hasattr(instance, 'id') and instance.id:
            category_id = instance.id
        elif hasattr(instance, 'pk') and instance.pk:
            category_id = instance.pk
        
        # Generate unique identifier
        unique_id = str(uuid4())[:6]  # Shorter UUID for readability
        
        # Create filename: date_service_category_image_category_id_uniqueid.ext
        safe_name = f"{date_str}_service_category_image_{category_id}_{unique_id}{ext}"
        
        folder_path = ensure_folder_exists("service_categories")
        return f"{folder_path}/{safe_name}"
    except Exception as e:
        logger.error(f"Failed to generate service category image path: {e}")
        # Fallback to original method
        safe_name = generate_safe_filename(filename, "service_category")
        folder_path = ensure_folder_exists("service_categories")
        return f"{folder_path}/{safe_name}"


def brand_image_path(instance, filename):
    """Upload path for brand images"""
    safe_name = generate_safe_filename(filename, "brand")
    folder_path = ensure_folder_exists("brands")
    return f"{folder_path}/{safe_name}"


def review_image_path(instance, filename):
    """Upload path for review images"""
    safe_name = generate_safe_filename(filename, "review")
    folder_path = ensure_folder_exists("reviews")
    return f"{folder_path}/{safe_name}"


def website_content_image_path(instance, filename):
    """Upload path for general website content images"""
    safe_name = generate_safe_filename(filename, "website")
    folder_path = ensure_folder_exists("website_content")
    return f"{folder_path}/{safe_name}"


def banner_image_path(instance, filename):
    """Upload path for banner images"""
    safe_name = generate_safe_filename(filename, "banner")
    folder_path = ensure_folder_exists("website_content/banners")
    return f"{folder_path}/{safe_name}"


def deal_image_path(instance, filename):
    """Upload path for deal images"""
    safe_name = generate_safe_filename(filename, "deal")
    folder_path = ensure_folder_exists("website_content/deals")
    return f"{folder_path}/{safe_name}"


def logo_image_path(instance, filename):
    """Upload path for logo images"""
    safe_name = generate_safe_filename(filename, "logo")
    folder_path = ensure_folder_exists("website_content/logos")
    return f"{folder_path}/{safe_name}"


# =============================================================================
# PRODUCTION UTILITIES - SAFE AND RELIABLE
# =============================================================================

def create_production_folders():
    """Create all production folders for reliable media management"""
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
    
    created_folders = []
    for folder in folders:
        try:
            folder_path = ensure_folder_exists(folder)
            if folder_path:
                created_folders.append(folder_path)
                logger.info(f"Created production folder: {folder_path}")
        except Exception as e:
            logger.error(f"Failed to create folder {folder}: {e}")
    
    return created_folders


def get_media_stats():
    """Get statistics about the media folder structure"""
    stats = {
        'total_files': 0,
        'folders': {},
        'total_size': 0
    }
    
    try:
        for folder in ['store', 'categories', 'products', 'services', 'service_categories', 'brands', 'reviews', 'website_content']:
            folder_path = os.path.join(settings.MEDIA_ROOT, folder)
            if os.path.exists(folder_path):
                files = []
                for root, dirs, filenames in os.walk(folder_path):
                    for filename in filenames:
                        file_path = os.path.join(root, filename)
                        if os.path.isfile(file_path):
                            files.append(filename)
                            stats['total_size'] += os.path.getsize(file_path)
                
                stats['folders'][folder] = {
                    'file_count': len(files),
                    'files': files[:10]  # First 10 files for preview
                }
                stats['total_files'] += len(files)
    except Exception as e:
        logger.error(f"Failed to get media stats: {e}")
    
    return stats


def cleanup_orphaned_files():
    """Clean up any orphaned files in the media directory"""
    try:
        # This would be implemented based on your specific needs
        # For now, just log that cleanup was requested
        logger.info("Cleanup orphaned files requested")
        return True
    except Exception as e:
        logger.error(f"Failed to cleanup orphaned files: {e}")
        return False
