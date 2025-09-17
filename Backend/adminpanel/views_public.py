"""
Public API views for storefront consumption.
These endpoints don't require authentication and are meant for the customer-facing storefront.
"""
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from .models import (
    Brand, Category, Product, ProductImage,
    Service, ServiceImage, WebsiteContent, StoreSettings
)
from .serializers import (
    BrandSerializer, CategorySerializer, ProductSerializer, ProductImageSerializer,
    ServiceSerializer, ServiceImageSerializer, WebsiteContentSerializer, StoreSettingsSerializer
)

class PublicBrandViewSet(viewsets.ReadOnlyModelViewSet):
    """Public read-only access to brands"""
    queryset = Brand.objects.all().order_by("name")
    serializer_class = BrandSerializer
    permission_classes = [permissions.AllowAny]

class PublicCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """Public read-only access to categories"""
    queryset = Category.objects.all().select_related("parent").order_by("name")
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = super().get_queryset()
        # Filter for top-level categories only
        top_only = self.request.query_params.get("top", "true").lower() in ("true", "1", "yes")
        if top_only:
            qs = qs.filter(parent__isnull=True)
        return qs

class PublicProductViewSet(viewsets.ReadOnlyModelViewSet):
    """Public read-only access to products"""
    queryset = Product.objects.all().select_related("brand", "category").prefetch_related("images").order_by("-created_at")
    serializer_class = ProductSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = super().get_queryset()
        
        # Search functionality
        search = self.request.query_params.get("search")
        if search:
            qs = qs.filter(
                Q(name__icontains=search) | 
                Q(description__icontains=search) |
                Q(brand__name__icontains=search)
            )
        
        # Filter by category
        category = self.request.query_params.get("category")
        if category:
            qs = qs.filter(category_id=category)
        
        # Filter by brand
        brand = self.request.query_params.get("brand")
        if brand:
            qs = qs.filter(brand_id=brand)
        
        # Featured products (products with discount > 0)
        featured = self.request.query_params.get("featured")
        if featured and featured.lower() in ("true", "1", "yes"):
            qs = qs.filter(discount_rate__gt=0)
        
        # New products (recently created)
        new = self.request.query_params.get("new")
        if new and new.lower() in ("true", "1", "yes"):
            from django.utils import timezone
            from datetime import timedelta
            week_ago = timezone.now() - timedelta(days=7)
            qs = qs.filter(created_at__gte=week_ago)
        
        return qs

    @action(detail=False, methods=["get"])
    def featured(self, request):
        """Get featured products (products with discounts)"""
        featured_products = self.get_queryset().filter(discount_rate__gt=0)[:8]
        serializer = self.get_serializer(featured_products, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def new(self, request):
        """Get new products (recently created)"""
        from django.utils import timezone
        from datetime import timedelta
        week_ago = timezone.now() - timedelta(days=7)
        new_products = self.get_queryset().filter(created_at__gte=week_ago)[:8]
        serializer = self.get_serializer(new_products, many=True)
        return Response(serializer.data)

class PublicServiceViewSet(viewsets.ReadOnlyModelViewSet):
    """Public read-only access to services"""
    queryset = Service.objects.all().order_by("-created_at")
    serializer_class = ServiceSerializer
    permission_classes = [permissions.AllowAny]

class PublicWebsiteContentViewSet(viewsets.ViewSet):
    """Public access to website content (contact info, etc.)"""
    permission_classes = [permissions.AllowAny]

    def _get_singleton(self):
        obj, _ = WebsiteContent.objects.get_or_create(id=1)
        return obj

    def retrieve(self, request, pk=None):
        obj = self._get_singleton()
        return Response(WebsiteContentSerializer(obj).data)

class PublicStoreSettingsViewSet(viewsets.ViewSet):
    """Public access to store settings (currency, etc.)"""
    permission_classes = [permissions.AllowAny]

    def _get_singleton(self):
        obj, _ = StoreSettings.objects.get_or_create(id=1)
        return obj

    def retrieve(self, request, pk=None):
        obj = self._get_singleton()
        return Response(StoreSettingsSerializer(obj).data)
