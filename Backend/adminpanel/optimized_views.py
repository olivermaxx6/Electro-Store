"""
Optimized ViewSets for admin management sections.
These ViewSets include performance optimizations to fix excessive loading issues.
"""

from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.core.cache import cache
from django.db import transaction
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from django.views.decorators.vary import vary_on_headers
import logging

from .models import Category, Product, ServiceCategory, Service, Brand
from .serializers import (
    CategorySerializer, CategoryListSerializer,
    ProductSerializer, ServiceCategorySerializer, ServiceSerializer,
    BrandSerializer
)
from .performance_optimizations import (
    PerformanceOptimizedViewSetMixin,
    CachedCategoryViewSetMixin,
    CachedProductViewSetMixin,
    CachedServiceViewSetMixin,
    monitor_performance,
    log_query_performance,
    optimize_queryset_performance,
    clear_management_cache
)

logger = logging.getLogger(__name__)

class OptimizedCategoryViewSet(
    PerformanceOptimizedViewSetMixin,
    CachedCategoryViewSetMixin,
    viewsets.ModelViewSet
):
    """
    Optimized Category ViewSet with performance improvements.
    """
    queryset = Category.objects.all().select_related("parent").prefetch_related("children")
    serializer_class = CategoryListSerializer
    permission_classes = [IsAdmin]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["parent"]
    pagination_class = None  # Keep disabled for admin

    @monitor_performance(threshold=0.5)
    @log_query_performance
    def get_queryset(self):
        """
        Optimized queryset with performance improvements.
        """
        qs = super().get_queryset()
        
        # Apply filters efficiently
        top = self.request.query_params.get("top")
        parent = self.request.query_params.get("parent")
        level = self.request.query_params.get("level")
        
        if top and top.lower() in ("1", "true", "yes"):
            qs = qs.filter(parent__isnull=True)
        elif parent:
            qs = qs.filter(parent_id=parent)
        
        # Filter by hierarchy level
        if level is not None:
            try:
                level_int = int(level)
                if level_int == 0:
                    qs = qs.filter(parent__isnull=True)
                elif level_int == 1:
                    qs = qs.filter(parent__isnull=False, parent__parent__isnull=True)
                elif level_int == 2:
                    qs = qs.filter(parent__parent__isnull=False)
            except ValueError:
                pass
        
        q = self.request.query_params.get("q")
        if q:
            qs = qs.filter(name__icontains=q)
        
        # Optimize queryset performance
        qs = optimize_queryset_performance(qs, max_items=500)
        
        return qs.order_by("name")

    @method_decorator(cache_page(300))  # Cache for 5 minutes
    @method_decorator(vary_on_headers('Authorization'))
    @monitor_performance(threshold=0.3)
    def list(self, request, *args, **kwargs):
        """
        Optimized list method with caching.
        """
        return super().list(request, *args, **kwargs)

    @method_decorator(cache_page(300))  # Cache for 5 minutes
    @method_decorator(vary_on_headers('Authorization'))
    @monitor_performance(threshold=0.3)
    @action(detail=False, methods=["get"])
    def tree(self, request):
        """
        Optimized tree method with caching.
        """
        root_categories = self.get_queryset().filter(parent__isnull=True)
        serializer = self.get_serializer(root_categories, many=True)
        return Response(serializer.data)

    @monitor_performance(threshold=1.0)
    def create(self, request, *args, **kwargs):
        """
        Optimized create method with cache invalidation.
        """
        response = super().create(request, *args, **kwargs)
        
        # Clear related cache entries
        clear_management_cache()
        
        return response

    @monitor_performance(threshold=1.0)
    def update(self, request, *args, **kwargs):
        """
        Optimized update method with cache invalidation.
        """
        response = super().update(request, *args, **kwargs)
        
        # Clear related cache entries
        clear_management_cache()
        
        return response

    @monitor_performance(threshold=1.0)
    def destroy(self, request, *args, **kwargs):
        """
        Optimized destroy method with cache invalidation.
        """
        response = super().destroy(request, *args, **kwargs)
        
        # Clear related cache entries
        clear_management_cache()
        
        return response

class OptimizedProductViewSet(
    PerformanceOptimizedViewSetMixin,
    CachedProductViewSetMixin,
    viewsets.ModelViewSet
):
    """
    Optimized Product ViewSet with performance improvements.
    """
    queryset = Product.objects.all().select_related("brand", "category").prefetch_related("images")
    serializer_class = ProductSerializer
    permission_classes = [IsAdmin]
    pagination_class = None  # Keep disabled for admin

    @monitor_performance(threshold=0.8)
    @log_query_performance
    def get_queryset(self):
        """
        Optimized queryset with performance improvements.
        """
        qs = super().get_queryset()
        
        # Apply filters efficiently
        query_params = getattr(self.request, 'query_params', self.request.GET)
        q = query_params.get("q")
        brand = query_params.get("brand")
        category = query_params.get("category")
        
        if q:
            qs = qs.filter(Q(name__icontains=q) | Q(description__icontains=q))
        if brand:
            qs = qs.filter(brand_id=brand)
        if category:
            qs = qs.filter(category_id=category)
        
        # Optimize queryset performance
        qs = optimize_queryset_performance(qs, max_items=1000)
        
        return qs.order_by("-created_at")

    @method_decorator(cache_page(180))  # Cache for 3 minutes
    @method_decorator(vary_on_headers('Authorization'))
    @monitor_performance(threshold=0.5)
    def list(self, request, *args, **kwargs):
        """
        Optimized list method with caching.
        """
        return super().list(request, *args, **kwargs)

    @monitor_performance(threshold=1.5)
    def create(self, request, *args, **kwargs):
        """
        Optimized create method with cache invalidation.
        """
        response = super().create(request, *args, **kwargs)
        
        # Clear related cache entries
        clear_management_cache()
        
        return response

    @monitor_performance(threshold=1.5)
    def update(self, request, *args, **kwargs):
        """
        Optimized update method with cache invalidation.
        """
        response = super().update(request, *args, **kwargs)
        
        # Clear related cache entries
        clear_management_cache()
        
        return response

    @monitor_performance(threshold=1.0)
    def destroy(self, request, *args, **kwargs):
        """
        Optimized destroy method with cache invalidation.
        """
        response = super().destroy(request, *args, **kwargs)
        
        # Clear related cache entries
        clear_management_cache()
        
        return response

class OptimizedServiceCategoryViewSet(
    PerformanceOptimizedViewSetMixin,
    CachedServiceViewSetMixin,
    viewsets.ModelViewSet
):
    """
    Optimized ServiceCategory ViewSet with performance improvements.
    """
    queryset = ServiceCategory.objects.all().select_related('parent').prefetch_related('children', 'services')
    serializer_class = ServiceCategorySerializer
    permission_classes = [IsAdmin]

    @monitor_performance(threshold=0.5)
    @log_query_performance
    def get_queryset(self):
        """
        Optimized queryset with performance improvements.
        """
        qs = super().get_queryset()
        
        # Apply filters efficiently
        q = self.request.query_params.get("q")
        parent = self.request.query_params.get("parent")
        depth = self.request.query_params.get("depth")
        
        if q:
            qs = qs.filter(name__icontains=q)
        
        if parent is not None:
            if parent == "null" or parent == "":
                qs = qs.filter(parent__isnull=True)
            else:
                qs = qs.filter(parent_id=parent)
        
        if depth is not None:
            try:
                depth_int = int(depth)
                if depth_int == 0:
                    qs = qs.filter(parent__isnull=True)
                elif depth_int == 1:
                    qs = qs.filter(parent__isnull=False, parent__parent__isnull=True)
                elif depth_int == 2:
                    qs = qs.filter(parent__parent__isnull=False)
            except ValueError:
                pass
        
        # Optimize queryset performance
        qs = optimize_queryset_performance(qs, max_items=500)
        
        return qs.order_by('ordering', 'name')

    @method_decorator(cache_page(300))  # Cache for 5 minutes
    @method_decorator(vary_on_headers('Authorization'))
    @monitor_performance(threshold=0.3)
    def list(self, request, *args, **kwargs):
        """
        Optimized list method with caching.
        """
        return super().list(request, *args, **kwargs)

    @method_decorator(cache_page(300))  # Cache for 5 minutes
    @method_decorator(vary_on_headers('Authorization'))
    @monitor_performance(threshold=0.3)
    @action(detail=False, methods=["get"])
    def tree(self, request):
        """
        Optimized tree method with caching.
        """
        root_categories = self.get_queryset().filter(parent__isnull=True)
        serializer = self.get_serializer(root_categories, many=True)
        return Response(serializer.data)

    @monitor_performance(threshold=1.0)
    def create(self, request, *args, **kwargs):
        """
        Optimized create method with cache invalidation.
        """
        response = super().create(request, *args, **kwargs)
        
        # Clear related cache entries
        clear_management_cache()
        
        return response

    @monitor_performance(threshold=1.0)
    def update(self, request, *args, **kwargs):
        """
        Optimized update method with cache invalidation.
        """
        response = super().update(request, *args, **kwargs)
        
        # Clear related cache entries
        clear_management_cache()
        
        return response

    @monitor_performance(threshold=1.0)
    def destroy(self, request, *args, **kwargs):
        """
        Optimized destroy method with cache invalidation.
        """
        response = super().destroy(request, *args, **kwargs)
        
        # Clear related cache entries
        clear_management_cache()
        
        return response

class OptimizedServiceViewSet(
    PerformanceOptimizedViewSetMixin,
    CachedServiceViewSetMixin,
    viewsets.ModelViewSet
):
    """
    Optimized Service ViewSet with performance improvements.
    """
    queryset = Service.objects.all().select_related("category")
    serializer_class = ServiceSerializer
    permission_classes = [IsAdmin]
    pagination_class = None  # Keep disabled for admin

    @monitor_performance(threshold=0.8)
    @log_query_performance
    def get_queryset(self):
        """
        Optimized queryset with performance improvements.
        """
        qs = super().get_queryset()
        
        # Apply filters efficiently
        q = self.request.query_params.get("q")
        category = self.request.query_params.get("category")
        
        if q:
            qs = qs.filter(Q(name__icontains=q) | Q(description__icontains=q))
        if category:
            qs = qs.filter(category_id=category)
        
        # Optimize queryset performance
        qs = optimize_queryset_performance(qs, max_items=1000)
        
        return qs.order_by("-created_at")

    @method_decorator(cache_page(180))  # Cache for 3 minutes
    @method_decorator(vary_on_headers('Authorization'))
    @monitor_performance(threshold=0.5)
    def list(self, request, *args, **kwargs):
        """
        Optimized list method with caching.
        """
        return super().list(request, *args, **kwargs)

    @monitor_performance(threshold=1.5)
    def create(self, request, *args, **kwargs):
        """
        Optimized create method with cache invalidation.
        """
        response = super().create(request, *args, **kwargs)
        
        # Clear related cache entries
        clear_management_cache()
        
        return response

    @monitor_performance(threshold=1.5)
    def update(self, request, *args, **kwargs):
        """
        Optimized update method with cache invalidation.
        """
        response = super().update(request, *args, **kwargs)
        
        # Clear related cache entries
        clear_management_cache()
        
        return response

    @monitor_performance(threshold=1.0)
    def destroy(self, request, *args, **kwargs):
        """
        Optimized destroy method with cache invalidation.
        """
        response = super().destroy(request, *args, **kwargs)
        
        # Clear related cache entries
        clear_management_cache()
        
        return response

class OptimizedBrandViewSet(
    PerformanceOptimizedViewSetMixin,
    viewsets.ModelViewSet
):
    """
    Optimized Brand ViewSet with performance improvements.
    """
    queryset = Brand.objects.all()
    serializer_class = BrandSerializer
    permission_classes = [IsAdmin]
    pagination_class = None  # Keep disabled for admin

    @method_decorator(cache_page(300))  # Cache for 5 minutes
    @method_decorator(vary_on_headers('Authorization'))
    @monitor_performance(threshold=0.2)
    def list(self, request, *args, **kwargs):
        """
        Optimized list method with caching.
        """
        return super().list(request, *args, **kwargs)

    @monitor_performance(threshold=1.0)
    def create(self, request, *args, **kwargs):
        """
        Optimized create method with cache invalidation.
        """
        response = super().create(request, *args, **kwargs)
        
        # Clear related cache entries
        clear_management_cache()
        
        return response

    @monitor_performance(threshold=1.0)
    def update(self, request, *args, **kwargs):
        """
        Optimized update method with cache invalidation.
        """
        response = super().update(request, *args, **kwargs)
        
        # Clear related cache entries
        clear_management_cache()
        
        return response

    @monitor_performance(threshold=1.0)
    def destroy(self, request, *args, **kwargs):
        """
        Optimized destroy method with cache invalidation.
        """
        response = super().destroy(request, *args, **kwargs)
        
        # Clear related cache entries
        clear_management_cache()
        
        return response
