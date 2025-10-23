"""
Performance optimizations for admin management sections.
This module contains optimizations to fix excessive loading and message issues.
"""

from django.db.models import Prefetch, Count
from django.core.cache import cache
from django.db import connection
from django.conf import settings
import logging
import time
from functools import wraps

logger = logging.getLogger(__name__)

def get_optimized_category_queryset():
    """
    Optimizes the Category queryset by prefetching children and parents,
    and annotating with children count.
    """
    from .models import Category
    return (
        Category.objects.all()
        .select_related("parent")
        .prefetch_related(
            Prefetch(
                "children",
                queryset=Category.objects.select_related("parent").order_by("name"),
                to_attr="prefetched_children"
            )
        )
        .annotate(children_count=Count('children'))
        .order_by("name")
    )

def get_optimized_product_queryset():
    """
    Optimizes the Product queryset by selecting related brand and category,
    and prefetching images.
    """
    from .models import Product
    return (
        Product.objects.all()
        .select_related("brand", "category")
        .prefetch_related("images")
        .order_by("-created_at")
    )

def get_optimized_service_category_queryset():
    """
    Optimizes the ServiceCategory queryset by selecting related parent,
    and prefetching children and services.
    """
    from .models import ServiceCategory, Service
    return (
        ServiceCategory.objects.all()
        .select_related('parent')
        .prefetch_related(
            Prefetch(
                "children",
                queryset=ServiceCategory.objects.select_related("parent").order_by("ordering", "name"),
                to_attr="prefetched_children"
            ),
            Prefetch(
                "services",
                queryset=Service.objects.select_related("category").prefetch_related("images").order_by("name"),
                to_attr="prefetched_services"
            )
        )
        .order_by('ordering', 'name')
    )

def get_optimized_service_queryset():
    """
    Optimizes the Service queryset by selecting related category and prefetching images.
    """
    from .models import Service
    return (
        Service.objects.all()
        .select_related("category")
        .prefetch_related("images")
        .order_by("-created_at")
    )

def cache_queryset_result(cache_key, queryset_func, timeout=300):
    """
    Caches the result of a queryset function.
    """
    data = cache.get(cache_key)
    if data is not None:
        logger.debug(f"Cache hit for {cache_key}")
        return data
    
    logger.debug(f"Cache miss for {cache_key}, fetching data...")
    data = list(queryset_func())  # Evaluate queryset to cache results
    cache.set(cache_key, data, timeout)
    logger.debug(f"Cached {len(data)} items for {cache_key}")
    return data

def cache_api_response(cache_key, timeout=300):
    """
    Decorator to cache API responses for better performance.
    
    Args:
        cache_key: The cache key to use
        timeout: Cache timeout in seconds (default: 5 minutes)
    """
    def decorator(func):
        @wraps(func)
        def wrapper(self, request, *args, **kwargs):
            # Create cache key with request parameters
            params = request.query_params.dict()
            param_str = '_'.join([f"{k}_{v}" for k, v in sorted(params.items())])
            full_cache_key = f"{cache_key}_{param_str}"
            
            # Try to get from cache first
            cached_data = cache.get(full_cache_key)
            if cached_data is not None:
                logger.info(f"Cache hit for {full_cache_key}")
                return cached_data
            
            # Execute the function
            start_time = time.time()
            response = func(self, request, *args, **kwargs)
            execution_time = time.time() - start_time
            
            logger.info(f"API call {func.__name__} took {execution_time:.3f}s")
            
            # Cache the response
            cache.set(full_cache_key, response, timeout)
            logger.info(f"Cached response for {full_cache_key}")
            
            return response
        return wrapper
    return decorator

def optimize_queryset_performance(queryset, max_items=1000):
    """
    Optimize queryset for better performance by limiting items and adding select_related/prefetch_related.
    
    Args:
        queryset: The queryset to optimize
        max_items: Maximum number of items to return
    """
    # Limit the number of items to prevent memory issues
    if hasattr(queryset, 'count') and queryset.count() > max_items:
        logger.warning(f"Queryset has {queryset.count()} items, limiting to {max_items}")
        queryset = queryset[:max_items]
    
    return queryset

def log_query_performance(func):
    """
    Decorator to log database query performance.
    """
    @wraps(func)
    def wrapper(self, request, *args, **kwargs):
        # Reset query count
        initial_queries = len(connection.queries)
        
        start_time = time.time()
        response = func(self, request, *args, **kwargs)
        execution_time = time.time() - start_time
        
        # Count queries
        final_queries = len(connection.queries)
        query_count = final_queries - initial_queries
        
        logger.info(f"API {func.__name__}: {execution_time:.3f}s, {query_count} queries")
        
        # Log slow queries
        if execution_time > 1.0:
            logger.warning(f"Slow API call: {func.__name__} took {execution_time:.3f}s")
        
        # Log excessive queries
        if query_count > 10:
            logger.warning(f"Excessive queries: {func.__name__} made {query_count} queries")
        
        return response
    return wrapper

class PerformanceOptimizedViewSetMixin:
    """
    Mixin to add performance optimizations to ViewSets.
    """
    
    def get_queryset(self):
        """
        Override get_queryset to add performance optimizations.
        """
        queryset = super().get_queryset()
        
        # Add performance optimizations
        queryset = self._optimize_queryset(queryset)
        
        return queryset
    
    def _optimize_queryset(self, queryset):
        """
        Apply performance optimizations to queryset.
        """
        # Add select_related for foreign keys
        if hasattr(queryset.model, '_meta'):
            for field in queryset.model._meta.get_fields():
                if field.is_relation and field.many_to_one:
                    queryset = queryset.select_related(field.name)
        
        # Add prefetch_related for many-to-many and reverse foreign keys
        if hasattr(queryset.model, '_meta'):
            for field in queryset.model._meta.get_fields():
                if field.is_relation and (field.many_to_many or field.one_to_many):
                    queryset = queryset.prefetch_related(field.name)
        
        return queryset
    
    def list(self, request, *args, **kwargs):
        """
        Override list method to add performance optimizations.
        """
        # Apply query performance logging
        return log_query_performance(super().list)(self, request, *args, **kwargs)

class CachedCategoryViewSetMixin:
    """
    Mixin to add caching to Category ViewSets.
    """
    
    @cache_api_response('categories_list', timeout=300)
    def list(self, request, *args, **kwargs):
        """
        Cached list method for categories.
        """
        return super().list(request, *args, **kwargs)
    
    @cache_api_response('categories_tree', timeout=300)
    def tree(self, request, *args, **kwargs):
        """
        Cached tree method for categories.
        """
        return super().tree(request, *args, **kwargs)

class CachedProductViewSetMixin:
    """
    Mixin to add caching to Product ViewSets.
    """
    
    @cache_api_response('products_list', timeout=180)
    def list(self, request, *args, **kwargs):
        """
        Cached list method for products.
        """
        return super().list(request, *args, **kwargs)

class CachedServiceViewSetMixin:
    """
    Mixin to add caching to Service ViewSets.
    """
    
    @cache_api_response('services_list', timeout=180)
    def list(self, request, *args, **kwargs):
        """
        Cached list method for services.
        """
        return super().list(request, *args, **kwargs)
    
    @cache_api_response('service_categories_list', timeout=300)
    def list(self, request, *args, **kwargs):
        """
        Cached list method for service categories.
        """
        return super().list(request, *args, **kwargs)

def clear_management_cache():
    """
    Clear all management-related cache entries.
    """
    from adminpanel.cache_utils import safe_delete_pattern
    
    cache_patterns_to_clear = [
        'categories_list*',
        'categories_tree*',
        'admin_categories_list*',
        'admin_category_detail*',
        'admin_category_tree*',
        'admin_category_subcategories*',
        'products_list*',
        'services_list*',
        'service_categories_list*',
        'brands_list*'
    ]
    
    for pattern in cache_patterns_to_clear:
        safe_delete_pattern(pattern)
    
    logger.info("Cleared management cache entries")

def get_performance_stats():
    """
    Get performance statistics for monitoring.
    """
    stats = {
        'cache_size': len(cache._cache) if hasattr(cache, '_cache') else 0,
        'database_connections': len(connection.queries) if hasattr(connection, 'queries') else 0,
        'cache_hit_ratio': getattr(cache, '_hit_ratio', 0),
    }
    
    return stats

# Performance monitoring decorator
def monitor_performance(threshold=1.0):
    """
    Decorator to monitor API performance and log warnings for slow requests.
    
    Args:
        threshold: Time threshold in seconds to consider a request slow
    """
    def decorator(func):
        @wraps(func)
        def wrapper(self, request, *args, **kwargs):
            start_time = time.time()
            response = func(self, request, *args, **kwargs)
            execution_time = time.time() - start_time
            
            if execution_time > threshold:
                logger.warning(
                    f"Slow API request: {func.__name__} took {execution_time:.3f}s "
                    f"(threshold: {threshold}s)"
                )
            
            return response
        return wrapper
    return decorator
