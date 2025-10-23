"""
Production-safe Django signals for automatic folder management.
This module handles automatic folder creation when new content is added.
"""
from django.db.models.signals import post_save
from django.dispatch import receiver
from adminpanel.models import Category, ServiceCategory
from adminpanel.upload_paths import create_production_folders
import logging

logger = logging.getLogger(__name__)


@receiver(post_save, sender=Category)
def create_category_folders_signal(sender, instance, created, **kwargs):
    """
    Automatically create production folders when a new category is added.
    This ensures the folder structure is ready for image uploads.
    """
    if created:
        try:
            # Ensure production folders exist
            create_production_folders()
            logger.info(f"Production folders ensured for new category: {instance.name}")
        except Exception as e:
            logger.error(f"Failed to ensure folders for category {instance.name}: {e}")


@receiver(post_save, sender=ServiceCategory)
def create_service_category_folders_signal(sender, instance, created, **kwargs):
    """
    Automatically create production folders when a new service category is added.
    This ensures the folder structure is ready for image uploads.
    """
    if created:
        try:
            # Ensure production folders exist
            create_production_folders()
            logger.info(f"Production folders ensured for new service category: {instance.name}")
        except Exception as e:
            logger.error(f"Failed to ensure folders for service category {instance.name}: {e}")