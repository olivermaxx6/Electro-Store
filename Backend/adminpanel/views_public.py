"""
Public API views for storefront consumption.
These endpoints don't require authentication and are meant for the customer-facing storefront.
"""
import uuid
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.http import Http404
from django.db.models import Q


class AllowAnyOrAuthenticated(permissions.BasePermission):
    """
    Allow access to all users (authenticated and anonymous).
    """
    def has_permission(self, request, view):
        return True
from .models import (
    Brand, Category, Product, ProductImage, Order, OrderItem,
    Service, ServiceImage, ServiceCategory, ServiceReview, Review, WebsiteContent, StoreSettings,
    ChatRoom, ChatMessage, Contact, ServiceQuery
)
from .serializers import (
    BrandSerializer, CategorySerializer, ProductSerializer, ProductImageSerializer,
    ServiceSerializer, ServiceImageSerializer, ServiceCategorySerializer, ServiceReviewSerializer, ReviewSerializer, WebsiteContentSerializer, StoreSettingsSerializer,
    ChatRoomSerializer, ChatMessageSerializer, ContactSerializer, ServiceQuerySerializer, OrderSerializer
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
        # Filter for top-level categories only if explicitly requested
        top_only = self.request.query_params.get("top", "false").lower() in ("true", "1", "yes")
        if top_only:
            qs = qs.filter(parent__isnull=True)
        return qs

class PublicProductViewSet(viewsets.ReadOnlyModelViewSet):
    """Public read-only access to products"""
    queryset = Product.objects.all().select_related("brand", "category").prefetch_related("images").order_by("-created_at")
    serializer_class = ProductSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None  # Disable pagination for public products API

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

    @action(detail=False, methods=["get"])
    def top_selling(self, request):
        """Get top selling products"""
        top_selling_products = self.get_queryset().filter(is_top_selling=True)[:8]
        serializer = self.get_serializer(top_selling_products, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["post"])
    def increment_view(self, request, pk=None):
        """Increment view count for a product"""
        product = self.get_object()
        product.view_count += 1
        product.save(update_fields=['view_count'])
        return Response({'view_count': product.view_count})

class PublicServiceCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """Public read-only access to service categories"""
    queryset = ServiceCategory.objects.filter(is_active=True).order_by('ordering', 'name')
    serializer_class = ServiceCategorySerializer
    permission_classes = [permissions.AllowAny]

class PublicServiceViewSet(viewsets.ReadOnlyModelViewSet):
    """Public read-only access to services"""
    queryset = Service.objects.all().order_by("-created_at")
    serializer_class = ServiceSerializer
    permission_classes = [permissions.AllowAny]

    @action(detail=True, methods=["post"])
    def increment_view(self, request, pk=None):
        """Increment view count for a service"""
        service = self.get_object()
        service.view_count += 1
        service.save(update_fields=['view_count'])
        return Response({'view_count': service.view_count})

class PublicServiceReviewViewSet(viewsets.ModelViewSet):
    """Public access to service reviews - read and create"""
    serializer_class = ServiceReviewSerializer
    permission_classes = [permissions.AllowAny]  # Temporarily allow unauthenticated access for testing
    http_method_names = ['get', 'post', 'head', 'options']
    
    def get_queryset(self):
        """Filter reviews by service ID if provided"""
        service_id = self.request.query_params.get('service')
        if service_id:
            return ServiceReview.objects.filter(service_id=service_id).order_by("-created_at")
        return ServiceReview.objects.all().order_by("-created_at")
    
    def perform_create(self, serializer):
        """Create a new service review"""
        # Allow unauthenticated users for testing
        serializer.save(user=self.request.user if self.request.user.is_authenticated else None)
    
    @action(detail=False, methods=['get'], url_path='check-user-review')
    def check_user_review(self, request):
        """Check if the current user has already reviewed a specific service"""
        service_id = request.query_params.get('service')
        if not service_id:
            return Response(
                {'error': 'Service ID is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not request.user.is_authenticated:
            return Response({'has_reviewed': False, 'message': 'User not authenticated'})
        
        try:
            existing_review = ServiceReview.objects.filter(
                service_id=service_id,
                user=request.user
            ).first()
            
            return Response({
                'has_reviewed': existing_review is not None,
                'review_id': existing_review.id if existing_review else None,
                'message': 'Already reviewed this service' if existing_review else 'No review found'
            })
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

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

    def list(self, request):
        obj = self._get_singleton()
        return Response(StoreSettingsSerializer(obj).data)

    def retrieve(self, request, pk=None):
        obj = self._get_singleton()
        return Response(StoreSettingsSerializer(obj).data)

# --- Public Chat System ---
class PublicChatRoomViewSet(viewsets.ModelViewSet):
    """Public chat endpoints for customers"""
    serializer_class = ChatRoomSerializer
    permission_classes = [AllowAnyOrAuthenticated]
    http_method_names = ['get', 'post', 'put', 'patch']
    
    def get_queryset(self):
        # For one-to-many chat system, allow users to access their own chat rooms
        if self.request.user.is_authenticated:
            # Authenticated users see only their own chat rooms
            return ChatRoom.objects.filter(user=self.request.user)
        else:
            # Anonymous users see only their session-based chat rooms
            session_key = self.request.session.session_key
            if session_key:
                return ChatRoom.objects.filter(customer_session=session_key)
            else:
                # No session, return empty queryset
                return ChatRoom.objects.none()
    
    def get_object(self):
        """Override get_object to handle chat room access more gracefully"""
        try:
            return super().get_object()
        except Http404:
            # If chat room doesn't exist or user doesn't have access, create a new one
            if self.request.user.is_authenticated:
                # Create a new chat room for authenticated user
                session_key = self.request.session.session_key
                if not session_key:
                    self.request.session.create()
                    session_key = self.request.session.session_key
                
                # Auto-populate customer info from authenticated user
                user = self.request.user
                customer_name = ''
                if user.first_name and user.last_name:
                    customer_name = f"{user.first_name} {user.last_name}"
                elif user.first_name:
                    customer_name = user.first_name
                elif user.username:
                    customer_name = user.username
                else:
                    customer_name = user.username  # Fallback to username
                
                room = ChatRoom.objects.create(
                    customer_name=customer_name,
                    customer_email=user.email,
                    customer_session=session_key,
                    user=user,
                    status='active'
                )
                return room
            else:
                # For anonymous users, create a new room
                session_key = self.request.session.session_key
                if not session_key:
                    self.request.session.create()
                    session_key = self.request.session.session_key
                
                room = ChatRoom.objects.create(
                    customer_name='Anonymous User',
                    customer_email='user@example.com',
                    customer_session=session_key,
                    status='active'
                )
                return room
    
    def perform_create(self, serializer):
        # Create a new chat room for the customer
        session_key = self.request.session.session_key
        if not session_key:
            self.request.session.create()
            session_key = self.request.session.session_key
        
        # If user is authenticated, associate the chat room with the user
        user = self.request.user if self.request.user.is_authenticated else None
        
        # Auto-populate customer info from authenticated user if not provided
        customer_data = {}
        if user and user.is_authenticated:
            # Use user's name if customer_name is not provided or is default
            customer_name = serializer.validated_data.get('customer_name', '')
            if not customer_name or customer_name == 'Anonymous User':
                if user.first_name and user.last_name:
                    customer_data['customer_name'] = f"{user.first_name} {user.last_name}"
                elif user.first_name:
                    customer_data['customer_name'] = user.first_name
                elif user.username:
                    customer_data['customer_name'] = user.username
            
            # Use user's email if customer_email is not provided or is default
            customer_email = serializer.validated_data.get('customer_email', '')
            if not customer_email or customer_email == 'user@example.com':
                customer_data['customer_email'] = user.email
        
        serializer.save(
            customer_session=session_key,
            user=user,
            **customer_data
        )
    
    @action(detail=True, methods=['patch'])
    def update_customer_info(self, request, pk=None):
        """Update customer information for an existing chat room"""
        print(f"Update customer info called for room {pk}")
        print(f"Request user: {request.user}")
        print(f"User authenticated: {request.user.is_authenticated}")
        
        room = self.get_object()
        print(f"Room found: {room}")
        print(f"Current room customer_name: {room.customer_name}")
        
        # Only allow the room owner to update their info
        if request.user.is_authenticated and room.user != request.user:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        # Update customer info from authenticated user
        if request.user.is_authenticated:
            print(f"User details - first_name: {request.user.first_name}, last_name: {request.user.last_name}, username: {request.user.username}")
            
            if request.user.first_name and request.user.last_name:
                room.customer_name = f"{request.user.first_name} {request.user.last_name}"
            elif request.user.first_name:
                room.customer_name = request.user.first_name
            elif request.user.username:
                room.customer_name = request.user.username
            
            room.customer_email = request.user.email
            room.user = request.user
            room.save()
            
            print(f"Updated room customer_name to: {room.customer_name}")
            
            return Response({
                'message': 'Customer information updated successfully',
                'customer_name': room.customer_name,
                'customer_email': room.customer_email
            })
        
        return Response({'error': 'User not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)
    
    @action(detail=True, methods=['post'])
    def send_message(self, request, pk=None):
        """Send a message from customer to admin"""
        room = self.get_object()
        content = request.data.get('content', '').strip()
        
        if not content:
            return Response({'error': 'Message content is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Use the room's customer name, or fall back to user info if available
        sender_name = room.customer_name or 'Anonymous'
        if not sender_name or sender_name == 'Anonymous':
            if room.user:
                if room.user.first_name and room.user.last_name:
                    sender_name = f"{room.user.first_name} {room.user.last_name}"
                elif room.user.first_name:
                    sender_name = room.user.first_name
                elif room.user.username:
                    sender_name = room.user.username
        
        message = ChatMessage.objects.create(
            room=room,
            sender_type='customer',
            sender_name=sender_name,
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


class PublicOrderCreateViewSet(viewsets.ModelViewSet):
    """Public endpoint for creating orders"""
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [permissions.AllowAny]
    http_method_names = ["post", "head", "options"]

    def create(self, request):
        """Create a new order from checkout"""
        try:
            # Extract order data from request
            order_data = request.data
            
            # Create order items from cart data
            cart_items = order_data.get('cart_items', [])
            if not cart_items:
                return Response({'error': 'No items in cart'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Calculate totals
            subtotal = order_data.get('subtotal', 0)
            shipping_cost = order_data.get('shipping_cost', 0)
            tax_amount = order_data.get('tax_amount', 0)
            total_price = order_data.get('total_price', 0)
            
            # Create order
            order = Order.objects.create(
                user=None,  # Guest order
                tracking_id=str(uuid.uuid4()),
                payment_id=order_data.get('payment_id', ''),
                customer_email=order_data.get('customer_email', ''),
                customer_phone=order_data.get('customer_phone', ''),
                shipping_address=order_data.get('shipping_address', {}),
                subtotal=subtotal,
                shipping_cost=shipping_cost,
                tax_amount=tax_amount,
                total_price=total_price,
                payment_method=order_data.get('payment_method', 'credit_card'),
                shipping_name=order_data.get('shipping_name', 'Standard Shipping')
            )
            
            # Create order items
            for item_data in cart_items:
                try:
                    product = Product.objects.get(id=item_data['product_id'])
                    OrderItem.objects.create(
                        order=order,
                        product=product,
                        quantity=item_data['quantity'],
                        unit_price=item_data['unit_price']
                    )
                except Product.DoesNotExist:
                    continue
            
            return Response({
                'order_id': order.id,
                'tracking_id': order.tracking_id,
                'payment_id': order.payment_id,
                'message': 'Order created successfully'
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class PublicOrderTrackingViewSet(viewsets.ViewSet):
    """Public order tracking by tracking ID"""
    permission_classes = [permissions.AllowAny]
    
    def retrieve(self, request, pk=None):
        """Get order details by tracking ID"""
        try:
            tracking_id = pk
            if not tracking_id:
                return Response({'error': 'Tracking ID is required'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Find order by tracking ID
            try:
                order = Order.objects.get(tracking_id=tracking_id)
            except Order.DoesNotExist:
                return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)
            
            # Get order items
            order_items = OrderItem.objects.filter(order=order)
            
            # Prepare response data
            order_data = {
                'id': order.id,
                'tracking_id': order.tracking_id,
                'status': order.status,
                'status_display': order.get_status_display(),
                'customer_email': order.customer_email,
                'customer_phone': order.customer_phone,
                'shipping_address': order.shipping_address,
                'subtotal': float(order.subtotal),
                'shipping_cost': float(order.shipping_cost),
                'tax_amount': float(order.tax_amount),
                'total_price': float(order.total_price),
                'payment_method': order.payment_method,
                'shipping_name': order.shipping_name,
                'created_at': order.created_at,
                'items': [
                    {
                        'id': item.id,
                        'product_name': item.product.name if item.product else 'Unknown Product',
                        'quantity': item.quantity,
                        'unit_price': float(item.unit_price),
                        'total_price': float(item.quantity * item.unit_price)
                    }
                    for item in order_items
                ]
            }
            
            return Response(order_data)
            
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PublicServiceQueryViewSet(viewsets.ModelViewSet):
    """Public endpoint for submitting service queries"""
    serializer_class = ServiceQuerySerializer
    permission_classes = [permissions.AllowAny]
    http_method_names = ['post', 'head', 'options']
    
    def get_queryset(self):
        # This viewset only allows POST, so queryset is not used
        return ServiceQuery.objects.none()
    
    def create(self, request):
        """Create a new service query submission"""
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': 'Service query submitted successfully! We will contact you within 24 hours.',
                'data': serializer.data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PublicReviewViewSet(viewsets.ModelViewSet):
    """Public access to product reviews - read and create"""
    serializer_class = ReviewSerializer
    permission_classes = [permissions.AllowAny]  # Temporarily allow unauthenticated access for testing
    http_method_names = ['get', 'post', 'head', 'options']
    
    def get_queryset(self):
        """Filter reviews by product ID if provided"""
        product_id = self.request.query_params.get('product')
        if product_id:
            return Review.objects.filter(product_id=product_id).order_by("-created_at")
        return Review.objects.all().order_by("-created_at")
    
    def perform_create(self, serializer):
        """Create a new product review"""
        # Allow unauthenticated users for testing
        serializer.save(user=self.request.user if self.request.user.is_authenticated else None)
    
    @action(detail=False, methods=['get'], url_path='check-user-review')
    def check_user_review(self, request):
        """Check if the current user has already reviewed a specific product"""
        product_id = request.query_params.get('product')
        if not product_id:
            return Response(
                {'error': 'Product ID is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not request.user.is_authenticated:
            return Response({'has_reviewed': False, 'message': 'User not authenticated'})
        
        try:
            existing_review = Review.objects.filter(
                product_id=product_id,
                user=request.user
            ).first()
            
            return Response({
                'has_reviewed': existing_review is not None,
                'review_id': existing_review.id if existing_review else None
            })
        except Exception as e:
            return Response(
                {'error': 'Failed to check review status'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )