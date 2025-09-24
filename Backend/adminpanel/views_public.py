"""
Public API views for storefront consumption.
These endpoints don't require authentication and are meant for the customer-facing storefront.
"""
import uuid
import time
import stripe
import logging
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.http import Http404
from django.db.models import Q
from django.conf import settings

logger = logging.getLogger(__name__)


class AllowAnyOrAuthenticated(permissions.BasePermission):
    """
    Allow access to all users (authenticated and anonymous).
    """
    def has_permission(self, request, view):
        return True
from .models import (
    Brand, Category, Product, ProductImage, Order, OrderItem,
    Service, ServiceImage, ServiceCategory, ServiceReview, Review, WebsiteContent, StoreSettings,
    Contact, ServiceQuery
)
from .serializers import (
    BrandSerializer, CategorySerializer, ProductSerializer, ProductImageSerializer,
    ServiceSerializer, ServiceImageSerializer, ServiceCategorySerializer, ServiceReviewSerializer, ReviewSerializer, WebsiteContentSerializer, StoreSettingsSerializer,
    ContactSerializer, ServiceQuerySerializer, OrderSerializer
)

class PublicBrandViewSet(viewsets.ReadOnlyModelViewSet):
    """Public read-only access to brands"""
    queryset = Brand.objects.all().order_by("name")
    serializer_class = BrandSerializer
    permission_classes = [permissions.AllowAny]

class PublicCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """Public read-only access to categories"""
    queryset = Category.objects.all().select_related("parent").prefetch_related("children__children").order_by("name")
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = super().get_queryset()
        # Filter for top-level categories only if explicitly requested
        # Handle both DRF Request and WSGIRequest objects
        if hasattr(self.request, 'query_params'):
            top_only = self.request.query_params.get("top", "false").lower() in ("true", "1", "yes")
        else:
            # Fallback for WSGIRequest
            top_only = self.request.GET.get("top", "false").lower() in ("true", "1", "yes")
        
        if top_only:
            qs = qs.filter(parent__isnull=True)
        return qs
    
    @action(detail=False, methods=["get"], url_path="with-hierarchy")
    def with_hierarchy(self, request):
        """Get categories with full hierarchy (children and grandchildren) for hover menus"""
        # Get top-level categories only
        top_categories = Category.objects.filter(parent__isnull=True).prefetch_related(
            "children__children"
        ).order_by("name")
        
        # Serialize with full hierarchy
        serializer = self.get_serializer(top_categories, many=True)
        return Response(serializer.data)

class PublicProductViewSet(viewsets.ReadOnlyModelViewSet):
    """Public read-only access to products"""
    queryset = Product.objects.all().select_related("brand", "category").prefetch_related("images").order_by("-created_at")
    serializer_class = ProductSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None  # Disable pagination for public products API

    def get_queryset(self):
        qs = super().get_queryset()
        
        # Handle both DRF Request and WSGIRequest objects
        if hasattr(self.request, 'query_params'):
            params = self.request.query_params
        else:
            params = self.request.GET
        
        # Search functionality
        search = params.get("search")
        if search:
            qs = qs.filter(
                Q(name__icontains=search) | 
                Q(description__icontains=search) |
                Q(brand__name__icontains=search)
            )
        
        # Filter by category
        category = params.get("category")
        if category:
            qs = qs.filter(category_id=category)
        
        # Filter by brand
        brand = params.get("brand")
        if brand:
            qs = qs.filter(brand_id=brand)
        
        # Featured products (products with discount > 0)
        featured = params.get("featured")
        if featured and featured.lower() in ("true", "1", "yes"):
            qs = qs.filter(discount_rate__gt=0)
        
        # New products (recently created)
        new = params.get("new")
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
        # Handle both DRF Request and WSGIRequest objects
        if hasattr(self.request, 'query_params'):
            service_id = self.request.query_params.get('service')
        else:
            service_id = self.request.GET.get('service')
        
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
        # Handle both DRF Request and WSGIRequest objects
        if hasattr(request, 'query_params'):
            service_id = request.query_params.get('service')
        else:
            service_id = request.GET.get('service')
        
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

# --- Public Chat System --- COMMENTED OUT (Chat functionality disabled)

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
            
            # Determine payment status based on payment_id
            payment_id = order_data.get('payment_id', '')
            payment_status = 'paid' if payment_id and payment_id.strip() else 'unpaid'
            
            # Create order
            from .id_generators import generate_unique_tracking_id
            order = Order.objects.create(
                user=None,  # Guest order
                tracking_id=generate_unique_tracking_id(),
                payment_id=payment_id,
                customer_email=order_data.get('customer_email', ''),
                customer_phone=order_data.get('customer_phone', ''),
                shipping_address=order_data.get('shipping_address', {}),
                subtotal=subtotal,
                shipping_cost=shipping_cost,
                tax_amount=tax_amount,
                total_price=total_price,
                payment_method=order_data.get('payment_method', 'credit_card'),
                shipping_name=order_data.get('shipping_name', 'Standard Shipping'),
                status='pending',  # Order status for fulfillment
                payment_status=payment_status  # Payment status separate
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


class StripeCheckoutViewSet(viewsets.ViewSet):
    """Public endpoint for creating Stripe Checkout sessions"""
    permission_classes = [permissions.AllowAny]
    
    def create(self, request):
        """Create a Stripe Checkout session with pre-created order"""
        import time
        try:
            # Extract checkout data from request
            checkout_data = request.data
            
            # Get cart items
            cart_items = checkout_data.get('cart_items', [])
            if not cart_items:
                return Response({'error': 'No items in cart'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Get customer and shipping info
            customer_email = checkout_data.get('customer_email', '')
            shipping_address = checkout_data.get('shipping_address', {})
            shipping_name = checkout_data.get('shipping_name', 'Standard Shipping')
            user_id = checkout_data.get('user_id', 'guest')
            
            # Calculate totals
            subtotal = checkout_data.get('subtotal', 0)
            shipping_cost = checkout_data.get('shipping_cost', 0)
            tax_amount = checkout_data.get('tax_amount', 0)
            total_price = checkout_data.get('total_price', 0)
            
            # Create order FIRST (before checkout session)
            from django.contrib.auth.models import User
            from .models import Order, OrderItem
            
            user = None
            if user_id and user_id != 'guest':
                try:
                    user = User.objects.get(id=user_id)
                except User.DoesNotExist:
                    pass
            
            # Create order with temporary tracking ID (will be updated with session ID)
            temp_tracking_id = f"temp_{request.session.session_key}_{int(time.time())}"
            order = Order.objects.create(
                user=user,
                tracking_id=temp_tracking_id,
                customer_email=customer_email,
                customer_phone=shipping_address.get('phone', ''),  # Use phone from shipping address if available
                shipping_address=shipping_address,
                subtotal=subtotal,
                shipping_cost=shipping_cost,
                tax_amount=tax_amount,
                total_price=total_price,
                payment_method='card',
                shipping_name=shipping_name,
                status='pending',
                payment_status='unpaid'
            )
            
            # Create order items
            for item in cart_items:
                try:
                    product = Product.objects.get(id=item['product_id'])
                    OrderItem.objects.create(
                        order=order,
                        product=product,
                        quantity=item['quantity'],
                        unit_price=item['unit_price']
                    )
                except Product.DoesNotExist:
                    continue
            
            # Prepare line items for Stripe
            line_items = []
            for item in cart_items:
                try:
                    product = Product.objects.get(id=item['product_id'])
                    line_items.append({
                        'price_data': {
                            'currency': 'gbp',
                            'product_data': {
                                'name': product.name,
                                'description': product.description[:500] if product.description else None,
                                'metadata': {
                                    'product_id': str(product.id),
                                    'order_id': str(order.id)
                                }
                            },
                            'unit_amount': int(float(item['unit_price']) * 100),  # Convert to pence
                        },
                        'quantity': item['quantity'],
                    })
                except Product.DoesNotExist:
                    continue
            
            if not line_items:
                # Clean up the order if no valid products
                order.delete()
                return Response({'error': 'No valid products found'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Create Stripe Checkout session with comprehensive metadata
            try:
                checkout_session = stripe.checkout.Session.create(
                    payment_method_types=['card'],
                    line_items=line_items,
                    mode='payment',
                    customer_email=customer_email,
                    shipping_address_collection={
                        'allowed_countries': ['GB', 'US', 'CA', 'AU', 'DE', 'FR', 'IT', 'ES', 'NL', 'BE'],
                    },
                    shipping_options=[
                        {
                            'shipping_rate_data': {
                                'type': 'fixed_amount',
                                'fixed_amount': {
                                    'amount': int(float(shipping_cost) * 100),
                                    'currency': 'gbp',
                                },
                                'display_name': shipping_name,
                            },
                        }
                    ],
                    success_url=f'http://127.0.0.1:5173/order-confirmation/{{CHECKOUT_SESSION_ID}}',
                    cancel_url=f'http://127.0.0.1:5173/checkout?cancelled=true',
                    metadata={
                        'order_id': str(order.id),  # Database order ID
                        'user_id': str(user_id),
                        'customer_email': customer_email,
                        'customer_phone': shipping_address.get('phone', ''),  # Include phone from shipping address
                        'cart_id': f"cart_{order.id}",
                        'tracking_id': temp_tracking_id,  # Temporary tracking ID
                        'order_type': 'checkout',
                        'subtotal': str(subtotal),
                        'shipping_cost': str(shipping_cost),
                        'tax_amount': str(tax_amount),
                        'total_price': str(total_price),
                    }
                )
                
                # Update order with the actual session ID
                order.tracking_id = checkout_session.id
                order.save()
                
                print(f"✅ Created order {order.id} with checkout session {checkout_session.id}")
                
                return Response({
                    'checkout_session_id': checkout_session.id,
                    'checkout_url': checkout_session.url,
                    'order_id': order.id,
                    'message': 'Checkout session created successfully'
                }, status=status.HTTP_201_CREATED)
                
            except stripe.error.StripeError as e:
                # Clean up the order if Stripe fails
                order.delete()
                print(f"Stripe error: {e}")
                return Response(
                    {'error': f'Stripe error: {str(e)}'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
                
        except Exception as e:
            print(f"Checkout session creation error: {e}")
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class StripeCheckoutSessionViewSet(viewsets.ViewSet):
    """Public endpoint for retrieving Stripe checkout session data"""
    permission_classes = [permissions.AllowAny]
    http_method_names = ['get', 'patch', 'head', 'options']
    
    def partial_update(self, request, pk=None):
        """Update order payment status"""
        try:
            session_id = pk
            if not session_id:
                return Response({'error': 'Session ID is required'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Find order by tracking_id (session ID)
            try:
                order = Order.objects.get(tracking_id=session_id)
            except Order.DoesNotExist:
                return Response({'error': 'Order not found for this checkout session'}, status=status.HTTP_404_NOT_FOUND)
            
            # Update payment status if provided
            payment_status = request.data.get('payment_status')
            if payment_status:
                order.payment_status = payment_status
                order.save()
                print(f"✅ Updated payment status to {payment_status} for order {order.id}")
            
            return Response({
                'message': 'Order updated successfully',
                'order_id': order.id,
                'payment_status': order.payment_status
            })
            
        except Exception as e:
            print(f"Error updating checkout session: {e}")
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    def _create_order_from_stripe_session(self, session_id):
        """Fallback method to create order from Stripe session data"""
        try:
            import stripe
            from .models import Order, OrderItem, Payment, Product
            
            print(f"Creating fallback order for session: {session_id}")
            
            # Retrieve the actual Stripe session data
            try:
                session = stripe.checkout.Session.retrieve(session_id)
                print(f"Retrieved Stripe session: {session.id}")
            except stripe.error.StripeError as e:
                print(f"Failed to retrieve Stripe session: {str(e)}")
                return None
            
            # Extract customer details from session
            customer_email = session.customer_details.email if session.customer_details else "customer@example.com"
            customer_name = session.customer_details.name if session.customer_details else "Customer"
            
            # Extract shipping address from session
            shipping_address = {
                "firstName": customer_name.split()[0] if customer_name else "Customer",
                "lastName": " ".join(customer_name.split()[1:]) if customer_name and len(customer_name.split()) > 1 else "",
                "address1": session.shipping_details.address.line1 if session.shipping_details and session.shipping_details.address else "Address",
                "address2": session.shipping_details.address.line2 if session.shipping_details and session.shipping_details.address else "",
                "city": session.shipping_details.address.city if session.shipping_details and session.shipping_details.address else "City",
                "state": session.shipping_details.address.state if session.shipping_details and session.shipping_details.address else "State",
                "postcode": session.shipping_details.address.postal_code if session.shipping_details and session.shipping_details.address else "12345",
                "country": session.shipping_details.address.country if session.shipping_details and session.shipping_details.address else "GB"
            }
            
            # Calculate amounts from session
            total_amount = session.amount_total / 100 if session.amount_total else 10.00  # Convert from cents
            currency = session.currency.upper() if session.currency else "GBP"
            
            # Create order with real session data
            order = Order.objects.create(
                user=None,  # Guest order
                tracking_id=session_id,
                payment_id=session.payment_intent,
                customer_email=customer_email,
                customer_phone=session.customer_details.phone if session.customer_details else "",
                shipping_address=shipping_address,
                subtotal=total_amount,  # Use actual amount
                shipping_cost=0,
                tax_amount=0,
                total_price=total_amount,
                payment_method="card",
                shipping_name="Standard Shipping",
                status="pending",
                payment_status="paid" if session.payment_status == "paid" else "pending"
            )
            
            # Create payment record
            Payment.objects.create(
                order=order,
                stripe_payment_intent_id=session.payment_intent,
                amount=total_amount,
                currency=currency,
                status="completed" if session.payment_status == "paid" else "pending"
            )
            
            # Add line items from session
            if hasattr(session, 'line_items') and session.line_items:
                try:
                    line_items = stripe.checkout.Session.list_line_items(session_id)
                    for line_item in line_items.data:
                        # Try to find the product by name or create a generic entry
                        product_name = line_item.description or "Product"
                        product_price = line_item.price.unit_amount / 100 if line_item.price else 10.00
                        quantity = line_item.quantity
                        
                        # Find matching product or create a generic one
                        product = Product.objects.filter(name__icontains=product_name).first()
                        if not product:
                            # Use first available product as fallback
                            product = Product.objects.first()
                        
                        if product:
                            OrderItem.objects.create(
                                order=order,
                                product=product,
                                quantity=quantity,
                                unit_price=product_price
                            )
                            print(f"Added product {product.name} to fallback order")
                except Exception as e:
                    print(f"Failed to process line items: {str(e)}")
                    # Fallback: add a default product
                    products = Product.objects.all()
                    if products.exists():
                        product = products.first()
                        OrderItem.objects.create(
                            order=order,
                            product=product,
                            quantity=1,
                            unit_price=total_amount
                        )
                        print(f"Added default product {product.name} to fallback order")
            
            print(f"✅ Fallback order created: {order.id}")
            return order
            
        except Exception as e:
            print(f"❌ Failed to create fallback order: {str(e)}")
            return None
    
    def retrieve(self, request, pk=None):
        """Get checkout session details by session ID - Enhanced for confirmation page"""
        try:
            session_id = pk
            if not session_id:
                return Response({'error': 'Session ID is required'}, status=status.HTTP_400_BAD_REQUEST)
            
            print(f"🔍 Looking up order for session: {session_id}")
            
            # Find order by tracking_id (session ID) - this is the primary lookup
            try:
                order = Order.objects.get(tracking_id=session_id)
                print(f"✅ Found order {order.id} with tracking_id {session_id}")
            except Order.DoesNotExist:
                print(f"❌ Order not found for session {session_id}")
                
                # Check if this is a test session or if webhook hasn't processed yet
                if session_id.startswith('cs_test_'):
                    return Response({
                        'error': 'Test session detected - order not found',
                        'session_id': session_id,
                        'order': None,
                        'processing': True
                    }, status=status.HTTP_404_NOT_FOUND)
                
                # For real sessions, return a processing status to allow frontend polling
                return Response({
                    'error': 'Order not found - webhook may still be processing',
                    'session_id': session_id,
                    'order': None,
                    'processing': True
                }, status=status.HTTP_404_NOT_FOUND)
            
            # Get order items
            order_items = OrderItem.objects.filter(order=order)
            
            # Prepare response data
            order_data = {
                'id': order.id,
                'tracking_id': order.tracking_id,
                'payment_id': order.payment_id,
                'status': order.status,
                'status_display': order.get_status_display(),
                'payment_status': order.payment_status,
                'payment_status_display': order.get_payment_status_display(),
                'customer_email': order.customer_email,
                'customer_phone': order.customer_phone,
                'shipping_address': order.shipping_address,
                'subtotal': float(order.subtotal),
                'shipping_cost': float(order.shipping_cost),
                'tax_amount': float(order.tax_amount),
                'total_price': float(order.total_price),
                'payment_method': order.payment_method,
                'shipping_name': order.shipping_name,
                'created_at': order.created_at.isoformat(),
                'items': [
                    {
                        'id': item.id,
                        'product_name': item.product.name if item.product else 'Deleted Product',
                        'quantity': item.quantity,
                        'unit_price': float(item.unit_price),
                        'total_price': float(item.unit_price * item.quantity)
                    }
                    for item in order_items
                ]
            }
            
            # Prepare checkout session data (only for real sessions)
            checkout_session_data = None
            if not session_id.startswith('cs_test_'):
                try:
                    checkout_session = stripe.checkout.Session.retrieve(session_id)
                    checkout_session_data = {
                        'id': checkout_session.id,
                        'payment_status': checkout_session.payment_status,
                        'amount_total': checkout_session.amount_total,
                        'currency': checkout_session.currency
                    }
                except stripe.error.StripeError as e:
                    print(f"Failed to retrieve Stripe session: {e}")
            
            response_data = {
                'session_id': session_id,
                'order': order_data,
                'processing': False  # Order found, not processing
            }
            
            if checkout_session_data:
                response_data['checkout_session'] = checkout_session_data
            
            print(f"✅ Returning order data for session {session_id}: Order #{order.id}")
            return Response(response_data)
            
        except Exception as e:
            print(f"Error retrieving checkout session: {e}")
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class PublicOrderTrackingViewSet(viewsets.ViewSet):
    """Public order tracking by tracking ID"""
    permission_classes = [permissions.AllowAny]
    http_method_names = ['get', 'patch', 'head', 'options']
    
    def retrieve(self, request, pk=None):
        """Get order details by tracking ID or order number"""
        try:
            search_param = pk
            if not search_param:
                return Response({'error': 'Tracking ID or Order Number is required'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Try to find order by tracking ID first, then by order ID
            try:
                # Check if it's a numeric order ID
                if search_param.isdigit():
                    order = Order.objects.get(id=int(search_param))
                else:
                    # Try tracking ID
                    order = Order.objects.get(tracking_id=search_param)
            except Order.DoesNotExist:
                return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)
            
            # Get order items
            order_items = OrderItem.objects.filter(order=order)
            
            # Prepare response data
            order_data = {
                'id': order.id,
                'tracking_id': order.tracking_id,
                'payment_id': order.payment_id,
                'status': order.status,
                'status_display': order.get_status_display(),
                'payment_status': order.payment_status,
                'payment_status_display': order.get_payment_status_display(),
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
    
    def partial_update(self, request, pk=None):
        """Update order payment status"""
        try:
            search_param = pk
            if not search_param:
                return Response({'error': 'Tracking ID or Order Number is required'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Try to find order by tracking ID first, then by order ID
            try:
                # Check if it's a numeric order ID
                if search_param.isdigit():
                    order = Order.objects.get(id=int(search_param))
                else:
                    # Try tracking ID
                    order = Order.objects.get(tracking_id=search_param)
            except Order.DoesNotExist:
                return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)
            
            # Update payment status if provided
            payment_status = request.data.get('payment_status')
            if payment_status:
                order.payment_status = payment_status
                order.save()
                print(f"✅ Updated payment status to {payment_status} for order {order.id}")
            
            return Response({
                'message': 'Order updated successfully',
                'order_id': order.id,
                'payment_status': order.payment_status
            })
            
        except Exception as e:
            print(f"Error updating order tracking: {e}")
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


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
        # Handle both DRF Request and WSGIRequest objects
        if hasattr(self.request, 'query_params'):
            product_id = self.request.query_params.get('product')
        else:
            product_id = self.request.GET.get('product')
        
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
        # Handle both DRF Request and WSGIRequest objects
        if hasattr(request, 'query_params'):
            product_id = request.query_params.get('product')
        else:
            product_id = request.GET.get('product')
        
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


class PaymentIntentViewSet(viewsets.ViewSet):
    """Create Stripe payment intent for checkout"""
    permission_classes = [permissions.AllowAny]
    
    def create(self, request):
        """Create a payment intent for the checkout amount"""
        try:
            # Set Stripe API key
            stripe.api_key = settings.STRIPE_SECRET_KEY
            
            # Get amount and currency from request
            amount = request.data.get('amount')
            currency = request.data.get('currency', 'usd')
            metadata = request.data.get('metadata', {})
            
            if not amount:
                return Response(
                    {'error': 'Amount is required'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Create payment intent
            intent = stripe.PaymentIntent.create(
                amount=amount,  # Amount in cents
                currency=currency,
                metadata=metadata,
                automatic_payment_methods={
                    'enabled': True,
                },
            )
            
            return Response({
                'client_secret': intent.client_secret,
                'payment_intent_id': intent.id
            }, status=status.HTTP_201_CREATED)
            
        except stripe.error.StripeError as e:
            # If Stripe API key is invalid or not configured, provide a fallback for development
            if "Invalid API Key" in str(e) or "your_stripe_secret_key_here" in settings.STRIPE_SECRET_KEY:
                print("⚠️ Stripe not properly configured, using development fallback")
                # Create a mock payment intent for development/testing
                mock_client_secret = f"pi_mock_{request.data.get('amount', 1000)}_secret_{int(time.time())}"
                mock_payment_intent_id = f"pi_mock_{int(time.time())}"
                
                return Response({
                    'client_secret': mock_client_secret,
                    'payment_intent_id': mock_payment_intent_id,
                    'is_mock': True  # Flag to indicate this is a mock response
                }, status=status.HTTP_201_CREATED)
            else:
                return Response(
                    {'error': f'Stripe error: {str(e)}'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        except Exception as e:
            return Response(
                {'error': f'Server error: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )