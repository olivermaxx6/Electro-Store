import logging
from django.db import transaction
from django.db.models import Q
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import viewsets, mixins, permissions, status, serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from rest_framework.parsers import MultiPartParser, FormParser
from django_filters.rest_framework import DjangoFilterBackend
from django.contrib.auth.models import User
from .models import (
    Brand, Category, Product, ProductImage,
    Service, ServiceImage, ServiceInquiry,
    Order, Review, WebsiteContent, StoreSettings,
    ChatRoom, ChatMessage
)
from .serializers import (
    BrandSerializer, CategorySerializer, ProductSerializer, ProductImageSerializer,
    ServiceSerializer, ServiceImageSerializer, ServiceInquirySerializer,
    OrderSerializer, ReviewSerializer, WebsiteContentSerializer, StoreSettingsSerializer,
    AdminUserSerializer, ChatRoomSerializer, ChatRoomListSerializer, ChatMessageSerializer
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

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all().select_related("parent").order_by("name")
    serializer_class = CategorySerializer
    permission_classes = [IsAdmin]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["parent"]

    def get_queryset(self):
        qs = super().get_queryset()
        top = self.request.query_params.get("top")
        parent = self.request.query_params.get("parent")
        if top and top.lower() in ("1", "true", "yes"):
            qs = qs.filter(parent__isnull=True)
        elif parent:
            qs = qs.filter(parent_id=parent)
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
        return Response(ser.data, status=201)

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all().select_related("brand", "category").prefetch_related("images").order_by("-created_at")
    serializer_class = ProductSerializer
    permission_classes = [IsAdmin]

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
        if not files:
            return Response({"detail": "No images provided."}, status=400)
        created = []
        try:
            with transaction.atomic():
                for f in files:
                    img = ProductImage(product=product, image=f)
                    # Validate extension; if invalid, return 400 (not 500)
                    try:
                        img.full_clean()
                    except DjangoValidationError as e:
                        raise serializers.ValidationError({"detail": e.message_dict.get("image", ["Invalid image"])[0]})
                    img.save()
                    created.append(img)
        except Exception as e:
            log.error("Upload images failed: %s", e, exc_info=True)
            return Response({"detail": "Failed to upload images."}, status=400)
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

class ProductImageDestroyView(mixins.DestroyModelMixin, viewsets.GenericViewSet):
    queryset = ProductImage.objects.all()
    serializer_class = ProductImageSerializer
    permission_classes = [IsAdmin]

# --- Services ---
class ServiceViewSet(viewsets.ModelViewSet):
    queryset = Service.objects.all().order_by("-created_at")
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
        img = ServiceImage.objects.create(service=service, image=file)
        return Response(ServiceImageSerializer(img).data, status=201)

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
    http_method_names = ["get","patch","put","head","options","trace"]

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
    http_method_names = ['get', 'put', 'head', 'options']
    parser_classes = [MultiPartParser, FormParser]

    def _get_singleton(self):
        obj, _ = WebsiteContent.objects.get_or_create(id=1)
        return obj

    def list(self, request):
        obj = self._get_singleton()
        return Response(WebsiteContentSerializer(obj).data)

    def retrieve(self, request, pk=None):
        obj = self._get_singleton()
        return Response(WebsiteContentSerializer(obj).data)

    def update(self, request, pk=None):
        obj = self._get_singleton()
        ser = WebsiteContentSerializer(obj, data=request.data, partial=True)
        ser.is_valid(raise_exception=True)
        ser.save()
        return Response(ser.data)

class StoreSettingsViewSet(viewsets.ViewSet):
    permission_classes = [IsAdmin]

    def _get_singleton(self):
        obj, _ = StoreSettings.objects.get_or_create(id=1)
        return obj

    def list(self, request):
        obj = self._get_singleton()
        return Response(StoreSettingsSerializer(obj).data)

    def retrieve(self, request, pk=None):
        obj = self._get_singleton()
        return Response(StoreSettingsSerializer(obj).data)

    def update(self, request, pk=None):
        obj = self._get_singleton()
        ser = StoreSettingsSerializer(obj, data=request.data, partial=True)
        ser.is_valid(raise_exception=True)
        ser.save()
        return Response(ser.data)



    @action(detail=True, methods=["delete"], url_path=r"images/(?P<img_id>\d+)")

    def delete_image(self, request, pk=None, img_id=None):

        product = self.get_object()

        try:

            img = product.images.get(id=img_id)

        except ProductImage.DoesNotExist:

            return Response({"detail": "Image not found."}, status=404)

        img.delete()

        return Response(status=204)



class ProductImageDestroyView(mixins.DestroyModelMixin, viewsets.GenericViewSet):

    queryset = ProductImage.objects.all()

    serializer_class = ProductImageSerializer

    permission_classes = [IsAdmin]



# --- Services ---

class ServiceViewSet(viewsets.ModelViewSet):

    queryset = Service.objects.all().order_by("-created_at")

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

        img = ServiceImage.objects.create(service=service, image=file)

        return Response(ServiceImageSerializer(img).data, status=201)



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

    http_method_names = ["get","patch","put","head","options","trace"]



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

# --- Chat System ---
class ChatRoomViewSet(viewsets.ModelViewSet):
    """Admin viewset for managing chat rooms"""
    queryset = ChatRoom.objects.all()
    serializer_class = ChatRoomSerializer
    permission_classes = [IsAdmin]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return ChatRoomListSerializer
        return ChatRoomSerializer
    
    @action(detail=True, methods=['post'])
    def send_message(self, request, pk=None):
        """Send a message to a chat room"""
        room = self.get_object()
        content = request.data.get('content', '').strip()
        
        if not content:
            return Response({'error': 'Message content is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        message = ChatMessage.objects.create(
            room=room,
            sender_type='admin',
            sender_name=request.user.username,
            content=content,
            is_read=True  # Admin messages are auto-read
        )
        
        # Update room status and last message time
        room.status = 'active'
        room.save()
        
        serializer = ChatMessageSerializer(message)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        """Mark all customer messages in a room as read"""
        room = self.get_object()
        room.messages.filter(sender_type='customer', is_read=False).update(is_read=True)
        return Response({'status': 'marked as read'})

class ChatMessageViewSet(viewsets.ReadOnlyModelViewSet):
    """Admin viewset for reading chat messages"""
    serializer_class = ChatMessageSerializer
    permission_classes = [IsAdmin]
    
    def get_queryset(self):
        room_id = self.request.query_params.get('room_id')
        if room_id:
            return ChatMessage.objects.filter(room_id=room_id).order_by('created_at')
        return ChatMessage.objects.none()

