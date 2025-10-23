import logging
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import Category, Product, Service, ServiceCategory, Brand

logger = logging.getLogger(__name__)

def broadcast_update(resource_type, action, data):
    """Broadcast data update to all connected admin clients"""
    try:
        channel_layer = get_channel_layer()
        if channel_layer:
            async_to_sync(channel_layer.group_send)(
                'admin_realtime',
                {
                    'type': 'data_update',
                    'resource': resource_type,
                    'action': action,
                    'data': data,
                    'timestamp': data.get('created_at') or data.get('updated_at')
                }
            )
            logger.info(f"Broadcasted {resource_type} {action} update")
    except Exception as e:
        logger.error(f"Error broadcasting {resource_type} {action} update: {e}")

# Category signals
@receiver(post_save, sender=Category)
def category_saved(sender, instance, created, **kwargs):
    """Broadcast category creation/update"""
    from .serializers import CategoryListSerializer
    try:
        serializer = CategoryListSerializer(instance)
        action = 'created' if created else 'updated'
        broadcast_update('categories', action, serializer.data)
    except Exception as e:
        logger.error(f"Error broadcasting category {action}: {e}")

@receiver(post_delete, sender=Category)
def category_deleted(sender, instance, **kwargs):
    """Broadcast category deletion"""
    try:
        broadcast_update('categories', 'deleted', {'id': instance.id})
    except Exception as e:
        logger.error(f"Error broadcasting category deletion: {e}")

# Product signals
@receiver(post_save, sender=Product)
def product_saved(sender, instance, created, **kwargs):
    """Broadcast product creation/update"""
    from .serializers import ProductSerializer
    try:
        serializer = ProductSerializer(instance)
        action = 'created' if created else 'updated'
        broadcast_update('products', action, serializer.data)
    except Exception as e:
        logger.error(f"Error broadcasting product {action}: {e}")

@receiver(post_delete, sender=Product)
def product_deleted(sender, instance, **kwargs):
    """Broadcast product deletion"""
    try:
        broadcast_update('products', 'deleted', {'id': instance.id})
    except Exception as e:
        logger.error(f"Error broadcasting product deletion: {e}")

# Service signals
@receiver(post_save, sender=Service)
def service_saved(sender, instance, created, **kwargs):
    """Broadcast service creation/update"""
    from .serializers import ServiceSerializer
    try:
        serializer = ServiceSerializer(instance)
        action = 'created' if created else 'updated'
        broadcast_update('services', action, serializer.data)
    except Exception as e:
        logger.error(f"Error broadcasting service {action}: {e}")

@receiver(post_delete, sender=Service)
def service_deleted(sender, instance, **kwargs):
    """Broadcast service deletion"""
    try:
        broadcast_update('services', 'deleted', {'id': instance.id})
    except Exception as e:
        logger.error(f"Error broadcasting service deletion: {e}")

# Service Category signals
@receiver(post_save, sender=ServiceCategory)
def service_category_saved(sender, instance, created, **kwargs):
    """Broadcast service category creation/update"""
    from .serializers import ServiceCategorySerializer
    try:
        serializer = ServiceCategorySerializer(instance)
        action = 'created' if created else 'updated'
        broadcast_update('service_categories', action, serializer.data)
    except Exception as e:
        logger.error(f"Error broadcasting service category {action}: {e}")

@receiver(post_delete, sender=ServiceCategory)
def service_category_deleted(sender, instance, **kwargs):
    """Broadcast service category deletion"""
    try:
        broadcast_update('service_categories', 'deleted', {'id': instance.id})
    except Exception as e:
        logger.error(f"Error broadcasting service category deletion: {e}")

# Brand signals
@receiver(post_save, sender=Brand)
def brand_saved(sender, instance, created, **kwargs):
    """Broadcast brand creation/update"""
    from .serializers import BrandSerializer
    try:
        serializer = BrandSerializer(instance)
        action = 'created' if created else 'updated'
        broadcast_update('brands', action, serializer.data)
    except Exception as e:
        logger.error(f"Error broadcasting brand {action}: {e}")

@receiver(post_delete, sender=Brand)
def brand_deleted(sender, instance, **kwargs):
    """Broadcast brand deletion"""
    try:
        broadcast_update('brands', 'deleted', {'id': instance.id})
    except Exception as e:
        logger.error(f"Error broadcasting brand deletion: {e}")
