"""
Cache utility functions that work with different cache backends
"""
from django.core.cache import cache
from django.core.cache.utils import make_template_fragment_key
import logging

logger = logging.getLogger(__name__)

def safe_delete_pattern(pattern):
    """
    Safely delete cache keys matching a pattern.
    Works with both Redis and local memory cache backends.
    """
    try:
        # Try Redis-specific delete_pattern method first
        if hasattr(cache, 'delete_pattern'):
            cache.delete_pattern(pattern)
            logger.debug(f"Deleted cache pattern: {pattern}")
        else:
            # Fallback for local memory cache - clear all cache
            logger.warning(f"Cache backend doesn't support delete_pattern, clearing all cache instead of pattern: {pattern}")
            cache.clear()
    except Exception as e:
        logger.error(f"Error deleting cache pattern {pattern}: {e}")
        # Fallback to clearing all cache
        try:
            cache.clear()
        except Exception as clear_error:
            logger.error(f"Error clearing cache: {clear_error}")

def safe_delete(key):
    """
    Safely delete a single cache key
    """
    try:
        cache.delete(key)
        logger.debug(f"Deleted cache key: {key}")
    except Exception as e:
        logger.error(f"Error deleting cache key {key}: {e}")

def invalidate_product_caches(product_id=None):
    """
    Invalidate product-related caches
    """
    if product_id:
        safe_delete(f"admin_product_detail:{product_id}")
    
    # Clear product list caches
    safe_delete_pattern("admin_products_list:*")

def invalidate_category_caches(category_id=None):
    """
    Invalidate category-related caches
    """
    if category_id:
        safe_delete(f"admin_category_detail:{category_id}")
    
    # Clear category list caches
    safe_delete_pattern("admin_categories_list:*")

def invalidate_service_caches(service_id=None):
    """
    Invalidate service-related caches
    """
    if service_id:
        safe_delete(f"admin_service_detail:{service_id}")
    
    # Clear service list caches
    safe_delete_pattern("admin_services_list:*")
