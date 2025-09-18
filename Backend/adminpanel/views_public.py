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
    Service, ServiceImage, WebsiteContent, StoreSettings,
    ChatRoom, ChatMessage, Contact
)
from .serializers import (
    BrandSerializer, CategorySerializer, ProductSerializer, ProductImageSerializer,
    ServiceSerializer, ServiceImageSerializer, WebsiteContentSerializer, StoreSettingsSerializer,
    ChatRoomSerializer, ChatMessageSerializer, ContactSerializer
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

# --- Public Chat System ---
class PublicChatRoomViewSet(viewsets.ModelViewSet):
    """Public chat endpoints for customers"""
    serializer_class = ChatRoomSerializer
    permission_classes = [permissions.AllowAny]
    http_method_names = ['get', 'post', 'put', 'patch']
    
    def get_queryset(self):
        # For now, allow access to all chat rooms (in production, you'd use session-based filtering)
        # This is a simplified version for testing
        return ChatRoom.objects.all()
    
    def perform_create(self, serializer):
        # Create a new chat room for the customer
        session_key = self.request.session.session_key
        if not session_key:
            self.request.session.create()
            session_key = self.request.session.session_key
        
        # If user is authenticated, associate the chat room with the user
        user = self.request.user if self.request.user.is_authenticated else None
        
        serializer.save(
            customer_session=session_key,
            user=user
        )
    
    @action(detail=True, methods=['post'])
    def send_message(self, request, pk=None):
        """Send a message from customer to admin"""
        room = self.get_object()
        content = request.data.get('content', '').strip()
        
        if not content:
            return Response({'error': 'Message content is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        message = ChatMessage.objects.create(
            room=room,
            sender_type='customer',
            sender_name=room.customer_name or 'Anonymous',
            content=content,
            is_read=False  # Customer messages need to be read by admin
        )
        
        # Update room status and last message time
        room.status = 'waiting'
        room.last_message_at = message.created_at
        room.save()
        
        # Broadcast message via WebSocket
        from channels.layers import get_channel_layer
        from asgiref.sync import async_to_sync
        
        channel_layer = get_channel_layer()
        if channel_layer:
            # Send to room group
            async_to_sync(channel_layer.group_send)(
                f'chat_{room.id}',
                {
                    'type': 'chat_message',
                    'message': {
                        'id': message.id,
                        'content': message.content,
                        'sender_type': message.sender_type,
                        'sender_name': message.sender_name,
                        'created_at': message.created_at.isoformat(),
                        'is_read': message.is_read
                    }
                }
            )
            
            # Notify admin group of new customer message
            async_to_sync(channel_layer.group_send)(
                'admin_chat',
                {
                    'type': 'new_customer_message',
                    'room_id': str(room.id),
                    'message': {
                        'id': message.id,
                        'content': message.content,
                        'sender_type': message.sender_type,
                        'sender_name': message.sender_name,
                        'created_at': message.created_at.isoformat(),
                        'is_read': message.is_read
                    }
                }
            )
        
        serializer = ChatMessageSerializer(message)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['get'])
    def get_messages(self, request, pk=None):
        """Get all messages for a chat room"""
        room = self.get_object()
        messages = room.messages.all().order_by('created_at')
        serializer = ChatMessageSerializer(messages, many=True)
        return Response(serializer.data)

class PublicChatMessageViewSet(viewsets.ReadOnlyModelViewSet):
    """Public read-only access to chat messages"""
    serializer_class = ChatMessageSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        room_id = self.request.query_params.get('room_id')
        if room_id:
            # For now, allow access to all messages (in production, you'd use session-based filtering)
            return ChatMessage.objects.filter(room_id=room_id).order_by('created_at')
        return ChatMessage.objects.none()

class PublicContactViewSet(viewsets.ModelViewSet):
    """Public contact form submission endpoint"""
    serializer_class = ContactSerializer
    permission_classes = [permissions.AllowAny]
    http_method_names = ['post']  # Only allow POST for form submission
    
    def get_queryset(self):
        # Return empty queryset since we only allow creation
        return Contact.objects.none()
    
    def create(self, request, *args, **kwargs):
        """Create a new contact form submission"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({
            'message': 'Thank you for your message. We will get back to you soon!',
            'status': 'success'
        }, status=status.HTTP_201_CREATED)

class PublicStoreSettingsViewSet(viewsets.ViewSet):
    """Public read-only access to store settings"""
    permission_classes = [permissions.AllowAny]

    def _get_singleton(self):
        obj, _ = StoreSettings.objects.get_or_create(id=1)
        return obj

    def list(self, request):
        obj = self._get_singleton()
        return Response(StoreSettingsSerializer(obj).data)