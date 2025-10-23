import logging
from django.db import transaction
from django.db.models import Q
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db.models.deletion import ProtectedError
from rest_framework import viewsets, mixins, permissions, status, serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from rest_framework.parsers import MultiPartParser, FormParser
from django_filters.rest_framework import DjangoFilterBackend
from django.contrib.auth.models import User
from .models import (
    Brand, Category, Product, ProductImage,
    Service, ServiceImage, ServiceInquiry, ServiceQuery, ServiceCategory,
    Order, Review, ServiceReview, WebsiteContent, StoreSettings,
    Contact
)
from .serializers import (
    BrandSerializer, CategorySerializer, CategoryListSerializer, ProductSerializer, ProductImageSerializer,
    ServiceSerializer, ServiceImageSerializer, ServiceInquirySerializer, ServiceQuerySerializer, ServiceCategorySerializer,
    OrderSerializer, ReviewSerializer, ServiceReviewSerializer, WebsiteContentSerializer, StoreSettingsSerializer,
    AdminUserSerializer, ContactSerializer
)
from .views_dashboard import DashboardStatsView, ProfileView, ChangePasswordView  # re-use from your existing file

log = logging.getLogger("adminpanel")

class IsAdmin(permissions.IsAdminUser):
    pass

# --- Attributes ---
class BrandViewSet(viewsets.ModelViewSet):
    queryset = Brand.objects.all().order_by("name")
    serializer_class = BrandSerializer
    permission_classes = [IsAdmin]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["name"]

    def list(self, request, *args, **kwargs):
        """Cached list view for brands to improve performance"""
        from django.core.cache import cache
        
        # Create cache key based on query parameters
        cache_key = f"admin_brands_{hash(str(request.query_params))}"
        cached_data = cache.get(cache_key)
        
        if cached_data is not None:
            return Response(cached_data)
        
        # Get data and cache it
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        data = serializer.data
        
        # Cache for 2 minutes (shorter than public cache since admin data changes more frequently)
        cache.set(cache_key, data, 120)
        return Response(data)

    def create(self, request, *args, **kwargs):
        """Create brand with cache invalidation"""
        response = super().create(request, *args, **kwargs)
        
        # Clear cache after creating
        from django.core.cache import cache
        cache.clear()
        
        return response

    def update(self, request, *args, **kwargs):
        """Update brand with cache invalidation"""
        response = super().update(request, *args, **kwargs)
        
        # Clear cache after updating
        from django.core.cache import cache
        cache.clear()
        
        return response

    def destroy(self, request, *args, **kwargs):
        """Custom destroy method to handle ProtectedError when brand has products"""
        instance = self.get_object()
        try:
            # Check for products using this brand
            product_count = Product.objects.filter(brand=instance).count()
            
            if product_count > 0:
                return Response(
                    {"detail": f"Cannot delete brand '{instance.name}': {product_count} product(s) are using this brand. Please delete or reassign the products first."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Safe to delete
            self.perform_destroy(instance)
            
            # Clear cache after deleting
            from django.core.cache import cache
            cache.clear()
            
            return Response(status=status.HTTP_204_NO_CONTENT)
            
        except ProtectedError as e:
            # Fallback for any other protection errors
            return Response(
                {"detail": f"Cannot delete brand '{instance.name}': This brand is being used by other objects."},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            log.error(f"Error deleting brand {instance.id}: {e}")
            return Response(
                {"detail": "An error occurred while deleting the brand."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all().select_related("parent").prefetch_related("children__children").order_by("name")
    serializer_class = CategorySerializer
    permission_classes = [IsAdmin]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["parent"]

    def get_serializer_class(self):
        """Use lightweight serializer for list views to improve performance"""
        if self.action == 'list':
            return CategoryListSerializer
        return super().get_serializer_class()

    def list(self, request, *args, **kwargs):
        """Cached list view for categories to improve performance"""
        from django.core.cache import cache
        
        # Create cache key based on query parameters
        cache_key = f"admin_categories_{hash(str(request.query_params))}"
        cached_data = cache.get(cache_key)
        
        if cached_data is not None:
            return Response(cached_data)
        
        # Get data and cache it
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        data = serializer.data
        
        # Cache for 2 minutes (shorter than public cache since admin data changes more frequently)
        cache.set(cache_key, data, 120)
        return Response(data)

    def get_queryset(self):
        qs = super().get_queryset()
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
        return qs

    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        if "parent" in data and data["parent"] in ("", None, "null"):
            data["parent"] = None
        try:
            if data.get("parent") not in (None, "", "null"):
                data["parent"] = int(data["parent"])
        except (TypeError, ValueError):
            raise ValidationError({"parent": "Parent must be a category ID or null."})
        ser = self.get_serializer(data=data)
        ser.is_valid(raise_exception=True)
        self.perform_create(ser)
        
        # Clear cache after creating
        from django.core.cache import cache
        cache.clear()
        
        return Response(ser.data, status=201)

    def update(self, request, *args, **kwargs):
        """Update category with cache invalidation"""
        response = super().update(request, *args, **kwargs)
        
        # Clear cache after updating
        from django.core.cache import cache
        cache.clear()
        
        return response

    def destroy(self, request, *args, **kwargs):
        """Custom destroy method to handle ProtectedError when category has products"""
        instance = self.get_object()
        try:
            # Check for products using this category or its children
            product_count = Product.objects.filter(category=instance).count()
            
            # Check for child categories
            child_categories = instance.children.all()
            child_count = child_categories.count()
            
            if product_count > 0:
                return Response(
                    {"detail": f"Cannot delete category '{instance.name}': {product_count} product(s) are using this category. Please delete or reassign the products first."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            if child_count > 0:
                return Response(
                    {"detail": f"Cannot delete category '{instance.name}': It has {child_count} subcategory(ies). Please delete the subcategories first."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Safe to delete
            self.perform_destroy(instance)
            return Response(status=status.HTTP_204_NO_CONTENT)
            
        except ProtectedError as e:
            # Fallback for any other protection errors
            return Response(
                {"detail": f"Cannot delete category '{instance.name}': This category is being used by other objects."},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            log.error(f"Error deleting category {instance.id}: {e}")
            return Response(
                {"detail": "An error occurred while deleting the category."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all().select_related("brand", "category").prefetch_related("images").order_by("-created_at")
    serializer_class = ProductSerializer
    permission_classes = [IsAdmin]
    pagination_class = None  # Disable pagination for admin products

    # Search & filters via query params: q, brand, category
    def get_queryset(self):
        qs = super().get_queryset()
        q = self.request.query_params.get("q")
        brand = self.request.query_params.get("brand")
        category = self.request.query_params.get("category")
        if q:
            qs = qs.filter(Q(name__icontains=q) | Q(description__icontains=q))
        if brand:
            qs = qs.filter(brand_id=brand)
        if category:
            qs = qs.filter(category_id=category)
        return qs

    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        log.debug("Create Product payload: %s", data)
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        with transaction.atomic():
            product = serializer.save()
        return Response(self.get_serializer(product).data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        data = request.data.copy()
        log.debug("Update Product[%s] payload: %s", instance.id, data)
        serializer = self.get_serializer(instance, data=data, partial=False)
        serializer.is_valid(raise_exception=True)
        with transaction.atomic():
            product = serializer.save()
        return Response(self.get_serializer(product).data, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"], url_path="images", parser_classes=[MultiPartParser, FormParser])
    def upload_images(self, request, pk=None):
        """Upload one or more images (.jpg/.png) for a product"""
        product = self.get_object()
        files = request.FILES.getlist("images")
        log.info(f"Received {len(files)} files for product {pk}")
        log.info(f"Files: {[f.name for f in files]}")
        if not files:
            return Response({"detail": "No images provided."}, status=400)
        created = []
        try:
            with transaction.atomic():
                for f in files:
                    img = ProductImage.objects.create(product=product, image=f, is_main=False)
                    created.append(img)
        except Exception as e:
            log.error("Upload images failed: %s", e, exc_info=True)
            return Response({"detail": f"Failed to upload images: {str(e)}"}, status=400)
        return Response(ProductImageSerializer(created, many=True).data, status=201)

    @action(detail=True, methods=["delete"], url_path=r"images/(?P<img_id>\d+)")
    def delete_image(self, request, pk=None, img_id=None):
        product = self.get_object()
        try:
            img = product.images.get(id=img_id)
        except ProductImage.DoesNotExist:
            return Response({"detail": "Image not found."}, status=404)
        img.delete()
        return Response(status=204)

    @action(detail=True, methods=["post"], url_path="set-main-image")
    def set_main_image(self, request, pk=None):
        """Set a specific image as the main image for a product"""
        product = self.get_object()
        image_id = request.data.get('image_id')
        
        if not image_id:
            return Response({"detail": "image_id is required."}, status=400)
        
        try:
            # Get the image
            image = product.images.get(id=image_id)
        except ProductImage.DoesNotExist:
            return Response({"detail": "Image not found."}, status=404)
        
        # Set all images to not main first
        product.images.update(is_main=False)
        
        # Set the selected image as main
        image.is_main = True
        image.save()
        
        return Response({"detail": "Main image updated successfully."}, status=200)

    @action(detail=False, methods=['get'], permission_classes=[])
    def top_selling(self, request):
        """Get top selling products for public display"""
        top_selling_products = Product.objects.filter(
            is_top_selling=True
        ).select_related("brand", "category").prefetch_related("images").order_by("-created_at")
        
        serializer = self.get_serializer(top_selling_products, many=True)
        return Response(serializer.data)

class ProductImageDestroyView(mixins.DestroyModelMixin, viewsets.GenericViewSet):
    queryset = ProductImage.objects.all()
    serializer_class = ProductImageSerializer
    permission_classes = [IsAdmin]

# --- Services ---
class ServiceCategoryViewSet(viewsets.ModelViewSet):
    queryset = ServiceCategory.objects.all().select_related('parent').prefetch_related('children', 'services').order_by('ordering', 'name')
    serializer_class = ServiceCategorySerializer
    permission_classes = [IsAdmin]

    def get_queryset(self):
        qs = super().get_queryset()
        q = self.request.query_params.get("q")
        parent = self.request.query_params.get("parent")
        depth = self.request.query_params.get("depth")
        
        if q:
            qs = qs.filter(name__icontains=q)
        
        if parent is not None:
            if parent == "null" or parent == "":
                # Get root categories (no parent)
                qs = qs.filter(parent__isnull=True)
            else:
                # Get children of specific parent
                qs = qs.filter(parent_id=parent)
        
        if depth is not None:
            try:
                depth_int = int(depth)
                if depth_int == 0:
                    # Root level categories
                    qs = qs.filter(parent__isnull=True)
                elif depth_int == 1:
                    # First level subcategories
                    qs = qs.filter(parent__isnull=False, parent__parent__isnull=True)
                elif depth_int == 2:
                    # Second level subcategories
                    qs = qs.filter(parent__isnull=False, parent__parent__isnull=False)
            except ValueError:
                pass
        
        return qs
    
    @action(detail=False, methods=["get"])
    def tree(self, request):
        """Get the complete category tree structure"""
        root_categories = self.get_queryset().filter(parent__isnull=True)
        serializer = self.get_serializer(root_categories, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=["get"])
    def children(self, request, pk=None):
        """Get direct children of a category"""
        category = self.get_object()
        children = category.children.all().order_by('ordering', 'name')
        serializer = self.get_serializer(children, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=["get"])
    def descendants(self, request, pk=None):
        """Get all descendants of a category"""
        category = self.get_object()
        descendants = category.get_descendants()
        serializer = self.get_serializer(descendants, many=True)
        return Response(serializer.data)

class ServiceViewSet(viewsets.ModelViewSet):
    queryset = Service.objects.all().select_related('category').prefetch_related('images').order_by("-created_at")
    serializer_class = ServiceSerializer
    permission_classes = [IsAdmin]

    def get_queryset(self):
        qs = super().get_queryset()
        q = self.request.query_params.get("q")
        if q:
            qs = qs.filter(name__icontains=q)
        return qs

    @action(detail=True, methods=["get","post"], url_path="images")
    def images(self, request, pk=None):
        service = self.get_object()
        if request.method.lower() == "get":
            ser = ServiceImageSerializer(service.images.all().order_by("-created_at"), many=True)
            return Response(ser.data)
        file = request.FILES.get("image")
        if not file:
            return Response({"detail":"image file required"}, status=400)
        
        try:
            # Check if this should be the main image (first image for the service)
            is_main = request.data.get('is_main', False)
            if is_main == 'true' or is_main is True:
                # Set all other images to not main
                ServiceImage.objects.filter(service=service).update(is_main=False)
                is_main = True
            elif not service.images.exists():
                # If this is the first image, make it main by default
                is_main = True
            else:
                is_main = False
            
            img = ServiceImage.objects.create(service=service, image=file, is_main=is_main)
            return Response(ServiceImageSerializer(img).data, status=201)
        except Exception as e:
            return Response({"detail": str(e)}, status=400)

    @action(detail=True, methods=["post"], url_path="set-main-image")
    def set_main_image(self, request, pk=None):
        """Set a specific image as the main image for a service"""
        service = self.get_object()
        image_id = request.data.get('image_id')
        
        if not image_id:
            return Response({"detail": "image_id is required."}, status=400)
        
        try:
            # Get the image
            image = service.images.get(id=image_id)
        except ServiceImage.DoesNotExist:
            return Response({"detail": "Image not found."}, status=404)
        
        # Set all images to not main first
        service.images.update(is_main=False)
        
        # Set the selected image as main
        image.is_main = True
        image.save()
        
        return Response({"detail": "Main image updated successfully."}, status=200)

class ServiceImageDestroyView(mixins.DestroyModelMixin, viewsets.GenericViewSet):
    queryset = ServiceImage.objects.all()
    serializer_class = ServiceImageSerializer
    permission_classes = [IsAdmin]

class ServiceInquiryViewSet(viewsets.ModelViewSet):
    queryset = ServiceInquiry.objects.all().order_by("-created_at")
    serializer_class = ServiceInquirySerializer
    permission_classes = [IsAdmin]
    http_method_names = ["get","patch","put","head","options","trace"]  # admin updates status only

# --- Orders ---
class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all().order_by("-created_at")
    serializer_class = OrderSerializer
    permission_classes = [IsAdmin]
    http_method_names = ["get","patch","put","delete","head","options","trace"]

    def get_queryset(self):
        qs = super().get_queryset()
        status_q = self.request.query_params.get("status")
        if status_q:
            qs = qs.filter(status=status_q)
        return qs

# --- Users ---
class AdminUserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by("id")
    serializer_class = AdminUserSerializer
    permission_classes = [IsAdmin]
    http_method_names = ["get","delete","patch","put","head","options","trace"]

    @action(detail=True, methods=["post"])
    def suspend(self, request, pk=None):
        u = self.get_object()
        u.is_active = False; u.save()
        return Response({"ok": True})

    @action(detail=True, methods=["post"])
    def unsuspend(self, request, pk=None):
        u = self.get_object()
        u.is_active = True; u.save()
        return Response({"ok": True})

# --- Reviews ---
class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all().order_by("-created_at")
    serializer_class = ReviewSerializer
    permission_classes = [IsAdmin]
    http_method_names = ["get","delete","head","options","trace"]

# --- Content & Settings ---
class WebsiteContentViewSet(viewsets.ViewSet):
    permission_classes = [IsAdmin]
    http_method_names = ['get', 'put', 'patch', 'head', 'options']
    parser_classes = [MultiPartParser, FormParser]

    def _get_singleton(self):
        obj, _ = WebsiteContent.objects.get_or_create(id=1)
        return obj

    def list(self, request):
        obj = self._get_singleton()
        return Response(WebsiteContentSerializer(obj).data)
    
    def put(self, request):
        """Handle PUT on collection endpoint for singleton"""
        obj = self._get_singleton()
        ser = WebsiteContentSerializer(obj, data=request.data, partial=True)
        ser.is_valid(raise_exception=True)
        ser.save()
        return Response(ser.data)

    def retrieve(self, request, pk=None):
        obj = self._get_singleton()
        return Response(WebsiteContentSerializer(obj).data)

    def update(self, request, pk=None):
        obj = self._get_singleton()
        ser = WebsiteContentSerializer(obj, data=request.data, partial=True)
        ser.is_valid(raise_exception=True)
        ser.save()
        return Response(ser.data)
    
    def partial_update(self, request, pk=None):
        obj = self._get_singleton()
        ser = WebsiteContentSerializer(obj, data=request.data, partial=True)
        ser.is_valid(raise_exception=True)
        ser.save()
        return Response(ser.data)

class StoreSettingsViewSet(viewsets.ViewSet):
    permission_classes = [IsAdmin]
    http_method_names = ['get', 'put', 'patch', 'head', 'options']
    parser_classes = [MultiPartParser, FormParser]

    def _get_singleton(self):
        obj, _ = StoreSettings.objects.get_or_create(id=1)
        return obj

    def list(self, request):
        obj = self._get_singleton()
        return Response(StoreSettingsSerializer(obj).data)
    
    def put(self, request):
        """Handle PUT on collection endpoint for singleton"""
        obj = self._get_singleton()
        ser = StoreSettingsSerializer(obj, data=request.data, partial=True)
        ser.is_valid(raise_exception=True)
        ser.save()
        return Response(ser.data)

    def retrieve(self, request, pk=None):
        obj = self._get_singleton()
        return Response(StoreSettingsSerializer(obj).data)

    def update(self, request, pk=None):
        obj = self._get_singleton()
        ser = StoreSettingsSerializer(obj, data=request.data, partial=True)
        ser.is_valid(raise_exception=True)
        ser.save()
        return Response(ser.data)
    
    def partial_update(self, request, pk=None):
        obj = self._get_singleton()
        ser = StoreSettingsSerializer(obj, data=request.data, partial=True)
        ser.is_valid(raise_exception=True)
        ser.save()
        return Response(ser.data)




# --- Chat System - COMMENTED OUT ---
# class ChatRoomViewSet(viewsets.ModelViewSet):
#     """Admin viewset for managing chat rooms"""
#     queryset = ChatRoom.objects.all()
#     serializer_class = ChatRoomSerializer
#     permission_classes = [IsAdmin]
#     
#     def get_queryset(self):
#         """Get chat rooms with proper filtering and error handling"""
#         try:
#             # Filter to only show rooms with real users (not anonymous/test rooms)
#             return ChatRoom.objects.filter(user__isnull=False).select_related('user').order_by('-last_message_at')
#         except Exception as e:
#             logger.error(f"Error in ChatRoomViewSet.get_queryset: {e}")
#             return ChatRoom.objects.none()
#     
#     def get_serializer_class(self):
#         if self.action == 'list':
#             return ChatRoomListSerializer
#         return ChatRoomSerializer
#     
#     def list(self, request, *args, **kwargs):
#         """Override list to handle empty queryset gracefully"""
#         try:
#             queryset = self.get_queryset()
#             
#             # Handle empty queryset gracefully
#             if not queryset.exists():
#                 return Response({
#                     'results': [],
#                     'count': 0,
#                     'message': 'No chat rooms found. All rooms are properly linked to registered users.'
#                 }, status=status.HTTP_200_OK)
#             
#             serializer = self.get_serializer(queryset, many=True)
#             return Response({
#                 'results': serializer.data,
#                 'count': queryset.count()
#             }, status=status.HTTP_200_OK)
#             
#         except Exception as e:
#             logger.error(f"Error in ChatRoomViewSet.list: {e}")
#             return Response({
#                 'error': 'Failed to fetch chat rooms',
#                 'details': str(e)
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
#     
#     @action(detail=True, methods=['post'])
#     def send_message(self, request, pk=None):
#         """Send a message to a chat room"""
#         room = self.get_object()
#         content = request.data.get('content', '').strip()
#         
#         if not content:
#             return Response({'error': 'Message content is required'}, status=status.HTTP_400_BAD_REQUEST)
#         
#         # Create a more descriptive sender name with user info
#         sender_name = f"{request.user.first_name} {request.user.last_name}".strip() or request.user.username
#         
#         message = ChatMessage.objects.create(
#             room=room,
#             sender_type='admin',
#             sender_name=sender_name,
#             content=content,
#             is_read=True  # Admin messages are auto-read
#         )
#         
#         # Update room status and last message time
#         room.status = 'active'
#         room.last_message_at = message.created_at
#         room.save()
#         
#         # Broadcast message via WebSocket
#         from channels.layers import get_channel_layer
#         from asgiref.sync import async_to_sync
#         
#         channel_layer = get_channel_layer()
#         if channel_layer:
#             # Send to room group
#             async_to_sync(channel_layer.group_send)(
#                 f'chat_{room.id}',
#                 {
#                     'type': 'chat_message',
#                     'message': {
#                         'id': message.id,
#                         'content': message.content,
#                         'sender_type': message.sender_type,
#                         'sender_name': message.sender_name,
#                         'created_at': message.created_at.isoformat(),
#                         'is_read': message.is_read
#                     }
#                 }
#             )
#             
#             # Notify other admins
#             async_to_sync(channel_layer.group_send)(
#                 'admin_chat',
#                 {
#                     'type': 'admin_message_sent',
#                     'room_id': str(room.id),
#                     'message': {
#                         'id': message.id,
#                         'content': message.content,
#                         'sender_type': message.sender_type,
#                         'sender_name': message.sender_name,
#                         'created_at': message.created_at.isoformat(),
#                         'is_read': message.is_read
#                     }
#                 }
#             )
#         
#         serializer = ChatMessageSerializer(message)
#         return Response(serializer.data, status=status.HTTP_201_CREATED)
#     
#     @action(detail=True, methods=['get'])
#     def get_messages(self, request, pk=None):
#         """Get all messages for a chat room"""
#         room = self.get_object()
#         messages = room.messages.all().order_by('created_at')
#         serializer = ChatMessageSerializer(messages, many=True)
#         return Response(serializer.data)
#     
#     @action(detail=True, methods=['post'])
#     def mark_as_read(self, request, pk=None):
#         """Mark all customer messages in a room as read"""
#         room = self.get_object()
#         room.messages.filter(sender_type='customer', is_read=False).update(is_read=True)
#         return Response({'status': 'marked as read'})

# class ChatMessageViewSet(viewsets.ReadOnlyModelViewSet):
#     """Admin viewset for reading chat messages"""
#     serializer_class = ChatMessageSerializer
#     permission_classes = [IsAdmin]
#     
#     def get_queryset(self):
#         room_id = self.request.query_params.get('room_id')
#         if room_id:
#             return ChatMessage.objects.filter(room_id=room_id).order_by('created_at')
#         return ChatMessage.objects.none()

class ContactViewSet(viewsets.ModelViewSet):
    """Admin viewset for managing contact form submissions"""
    serializer_class = ContactSerializer
    permission_classes = [IsAdmin]
    http_method_names = ['get', 'patch', 'put', 'delete', 'head', 'options', 'trace']
    
    def get_queryset(self):
        return Contact.objects.all().order_by('-created_at')
    
    @action(detail=True, methods=['patch'])
    def mark_as_read(self, request, pk=None):
        """Mark a contact submission as read"""
        contact = self.get_object()
        contact.status = 'read'
        contact.save()
        return Response({'status': 'marked as read'})
    
    @action(detail=True, methods=['patch'])
    def mark_as_replied(self, request, pk=None):
        """Mark a contact submission as replied"""
        contact = self.get_object()
        contact.status = 'replied'
        contact.save()
        return Response({'status': 'marked as replied'})
    
    @action(detail=True, methods=['patch'])
    def close(self, request, pk=None):
        """Close a contact submission"""
        contact = self.get_object()
        contact.status = 'closed'
        contact.save()
        return Response({'status': 'closed'})

class ServiceQueryViewSet(viewsets.ModelViewSet):
    """Admin viewset for managing service query submissions"""
    serializer_class = ServiceQuerySerializer
    permission_classes = [IsAdmin]
    http_method_names = ['get', 'patch', 'put', 'delete', 'head', 'options', 'trace']
    
    def get_queryset(self):
        return ServiceQuery.objects.all().order_by('-created_at')
    
    @action(detail=True, methods=['patch'])
    def mark_as_read(self, request, pk=None):
        """Mark a service query as read"""
        query = self.get_object()
        query.status = 'read'
        query.save()
        return Response({'status': 'marked as read'})
    
    @action(detail=True, methods=['patch'])
    def mark_as_replied(self, request, pk=None):
        """Mark a service query as replied"""
        query = self.get_object()
        query.status = 'replied'
        query.save()
        return Response({'status': 'marked as replied'})
    
    @action(detail=True, methods=['patch'])
    def close(self, request, pk=None):
        """Close a service query"""
        query = self.get_object()
        query.status = 'closed'
        query.save()
        return Response({'status': 'closed'})


# --- Service Reviews ---
class ServiceReviewViewSet(viewsets.ModelViewSet):
    queryset = ServiceReview.objects.all().order_by("-created_at")
    serializer_class = ServiceReviewSerializer
    permission_classes = [IsAdmin]
    
    @action(detail=True, methods=['post'])
    def verify(self, request, pk=None):
        """Mark a service review as verified"""
        review = self.get_object()
        review.verified = True
        review.save()
        return Response({'status': 'marked as verified'})
    
    @action(detail=True, methods=['post'])
    def unverify(self, request, pk=None):
        """Mark a service review as unverified"""
        review = self.get_object()
        review.verified = False
        review.save()
        return Response({'status': 'marked as unverified'})
    
    # Keep the old method names for backward compatibility
    @action(detail=True, methods=['patch'])
    def mark_verified(self, request, pk=None):
        """Mark a service review as verified (backward compatibility)"""
        review = self.get_object()
        review.verified = True
        review.save()
        return Response({'status': 'marked as verified'})
    
    @action(detail=True, methods=['patch'])
    def mark_unverified(self, request, pk=None):
        """Mark a service review as unverified (backward compatibility)"""
        review = self.get_object()
        review.verified = False
        review.save()
        return Response({'status': 'marked as unverified'})

