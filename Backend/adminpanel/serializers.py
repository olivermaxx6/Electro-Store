from rest_framework import serializers
from django.db import IntegrityError, transaction
from django.contrib.auth.models import User
from .models import (
    Brand, Category, Product, ProductImage,
    Service, ServiceImage, ServiceInquiry, ServiceQuery, ServiceCategory,
    Order, OrderItem, Review, ServiceReview, WebsiteContent, StoreSettings,
    ChatRoom, ChatMessage, Contact
)

class SafeModelSerializer(serializers.ModelSerializer):
    """
    Wraps create/update in an atomic block and converts DB integrity errors
    into DRF ValidationError (HTTP 400 instead of 500).
    """
    def create(self, validated_data):
        try:
            with transaction.atomic():
                return super().create(validated_data)
        except IntegrityError as e:
            raise serializers.ValidationError({"detail": str(e).splitlines()[-1]})

    def update(self, instance, validated_data):
        try:
            with transaction.atomic():
                return super().update(instance, validated_data)
        except IntegrityError as e:
            raise serializers.ValidationError({"detail": str(e).splitlines()[-1]})

# --- Attributes ---
class BrandSerializer(SafeModelSerializer):
    name = serializers.CharField(max_length=120)

    class Meta:
        model = Brand
        fields = ["id", "name", "slug", "created_at"]
        read_only_fields = ["id", "slug", "created_at"]

    def validate_name(self, value):
        v = value.strip()
        if not v:
            raise serializers.ValidationError("Brand name is required.")
        return v

class CategorySerializer(SafeModelSerializer):
    parent = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        allow_null=True,
        required=False,
    )
    name = serializers.CharField(max_length=120)

    class Meta:
        model = Category
        fields = ["id", "name", "slug", "parent", "created_at"]
        read_only_fields = ["id", "slug", "created_at"]

    def validate_name(self, v):
        v = (v or "").strip()
        if not v:
            raise serializers.ValidationError("Category name is required.")
        return v

class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ["id", "image", "created_at"]
        read_only_fields = ["id", "created_at"]

class ProductSerializer(SafeModelSerializer):
    # Accept brand & category by PK (strings will be coerced to ints by DRF)
    brand = serializers.PrimaryKeyRelatedField(queryset=Brand.objects.all())
    category = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all())
    # Read-only images list
    images = ProductImageSerializer(many=True, read_only=True)
    technical_specs = serializers.JSONField(required=False)
    # Make discount_rate optional and allow empty values
    discount_rate = serializers.DecimalField(max_digits=5, decimal_places=2, required=False, allow_null=True)
    
    # Add nested serializers for read-only brand and category data
    brand_data = BrandSerializer(source='brand', read_only=True)
    category_data = CategorySerializer(source='category', read_only=True)

    class Meta:
        model = Product
        fields = [
            "id", "name", "description",
            "price", "discount_rate", "stock",
            "brand", "category",
            "brand_data", "category_data",
            "technical_specs", "view_count",
            "isNew", "is_top_selling", "images", "created_at",
        ]
        read_only_fields = ["id", "created_at"]

    def validate_name(self, v):
        v = (v or "").strip()
        if not v:
            raise serializers.ValidationError("Name is required.")
        return v

    def validate_price(self, v):
        # Handle empty string or None values
        if v is None or v == "":
            raise serializers.ValidationError("Price is required.")
        # Convert to float if it's a string
        try:
            v = float(v)
        except (ValueError, TypeError):
            raise serializers.ValidationError("Price must be a valid number.")
        if v < 0:
            raise serializers.ValidationError("Price must be >= 0.")
        return v

    def validate_stock(self, v):
        # Handle empty string or None values
        if v is None or v == "":
            raise serializers.ValidationError("Stock is required.")
        # Convert to int if it's a string
        try:
            v = int(v)
        except (ValueError, TypeError):
            raise serializers.ValidationError("Stock must be a valid number.")
        if v < 0:
            raise serializers.ValidationError("Stock must be >= 0.")
        return v

    def validate_discount_rate(self, v):
        # Handle empty string or None values
        if v is None or v == "" or v == 0:
            return 0
        # Convert to float if it's a string
        try:
            v = float(v)
        except (ValueError, TypeError):
            raise serializers.ValidationError("Discount rate must be a valid number.")
        if v < 0:
            raise serializers.ValidationError("Discount rate must be >= 0.")
        if v > 100:
            raise serializers.ValidationError("Discount rate cannot exceed 100%.")
        return v

    def validate_technical_specs(self, v):
        if v in (None, ""):
            return {}
        if not isinstance(v, dict):
            raise serializers.ValidationError("technical_specs must be an object (key/value).")
        # Normalize all values to strings for consistency
        return {str(k): ("" if v[k] is None else str(v[k])) for k in v}

# --- Orders ---
class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = OrderItem
        fields = ["id","product","product_name","quantity","unit_price"]
    
    def get_product_name(self, obj):
        """Safely get product name, handling deleted products"""
        try:
            return obj.product.name if obj.product else "Deleted Product"
        except:
            return "Deleted Product"

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            "id", "user", "tracking_id", "payment_id", "customer_email", "customer_phone",
            "shipping_address", "subtotal", "shipping_cost", "tax_amount", "total_price",
            "status", "payment_status", "payment_method", "shipping_name", "created_at", "updated_at", "items"
        ]
        read_only_fields = ["id", "tracking_id", "payment_id", "customer_email", "customer_phone",
                           "shipping_address", "subtotal", "shipping_cost", "tax_amount", "total_price",
                           "payment_method", "shipping_name", "created_at", "updated_at", "items"]

    def validate_status(self, value):
        """Validate status field"""
        valid_statuses = [choice[0] for choice in Order.ORDER_STATUS_CHOICES]
        if value not in valid_statuses:
            raise serializers.ValidationError(f"Invalid status. Must be one of: {valid_statuses}")
        return value

    def validate_payment_status(self, value):
        """Validate payment_status field"""
        valid_statuses = [choice[0] for choice in Order.PAYMENT_STATUS_CHOICES]
        if value not in valid_statuses:
            raise serializers.ValidationError(f"Invalid payment_status. Must be one of: {valid_statuses}")
        return value

# --- Services ---
class ServiceCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceCategory
        fields = ["id","name","description","ordering","is_active","created_at"]

class ServiceImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceImage
        fields = ["id","image","created_at"]

class ServiceSerializer(serializers.ModelSerializer):
    images = ServiceImageSerializer(many=True, read_only=True)
    category = ServiceCategorySerializer(read_only=True)
    category_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    
    # Custom serialization methods for JSON fields
    def to_representation(self, instance):
        data = super().to_representation(instance)
        
        # Generate random view count that's always higher than review count
        import random
        review_count = instance.review_count or 0
        # Generate random view count between review_count + 10 and review_count + 100
        min_views = review_count + 10
        max_views = review_count + 100
        # Ensure minimum of 50 views if review_count is very low
        min_views = max(min_views, 50)
        data['view_count'] = random.randint(min_views, max_views)
        
        # Parse JSON string fields to proper objects/arrays
        import json
        try:
            if isinstance(data.get('included_features'), str):
                data['included_features'] = json.loads(data['included_features'])
        except (json.JSONDecodeError, TypeError):
            data['included_features'] = []
            
        try:
            if isinstance(data.get('process_steps'), str):
                data['process_steps'] = json.loads(data['process_steps'])
        except (json.JSONDecodeError, TypeError):
            data['process_steps'] = []
            
        try:
            if isinstance(data.get('key_features'), str):
                data['key_features'] = json.loads(data['key_features'])
        except (json.JSONDecodeError, TypeError):
            data['key_features'] = []
            
        try:
            if isinstance(data.get('contact_info'), str):
                data['contact_info'] = json.loads(data['contact_info'])
        except (json.JSONDecodeError, TypeError):
            data['contact_info'] = {}
            
        try:
            if isinstance(data.get('form_fields'), str):
                data['form_fields'] = json.loads(data['form_fields'])
        except (json.JSONDecodeError, TypeError):
            data['form_fields'] = []
            
        return data

    class Meta:
        model = Service
        fields = [
            "id","name","description","price","form_fields","created_at","images",
            "rating","review_count","view_count","overview","included_features","process_steps",
            "key_features","contact_info","availability","category","category_id"
        ]

class ServiceInquirySerializer(serializers.ModelSerializer):
    service_name = serializers.CharField(source="service.name", read_only=True)
    class Meta:
        model = ServiceInquiry
        fields = [
            "id","service","service_name","customer_name","customer_email","customer_phone",
            "inquiry_details","status","created_at"
        ]

# --- Reviews ---
class ReviewSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)
    user_name = serializers.CharField(source="user.username", read_only=True)
    
    class Meta:
        model = Review
        fields = ["id","product","product_name","user","user_name","author_name","rating","comment","created_at"]
        read_only_fields = ["created_at", "user"]  # Make user read-only since it's set in perform_create
    
    def validate(self, data):
        """Validate that user hasn't already reviewed this product"""
        product = data.get('product')
        user = data.get('user')
        
        if product and user:
            # Check if user already reviewed this product
            existing_review = Review.objects.filter(
                product=product, 
                user=user
            ).first()
            
            if existing_review:
                raise serializers.ValidationError({
                    'product': 'You have already reviewed this product.'
                })
        
        return data

class ServiceReviewSerializer(serializers.ModelSerializer):
    service_name = serializers.CharField(source="service.name", read_only=True)
    user_name = serializers.CharField(source="user.username", read_only=True)
    
    class Meta:
        model = ServiceReview
        fields = [
            "id", "service", "service_name", "user", "user_name", "author_name",
            "rating", "comment", "service_quality", "communication", "timeliness",
            "value_for_money", "verified", "created_at", "updated_at"
        ]
        read_only_fields = ["created_at", "updated_at", "user"]  # Make user read-only since it's set in perform_create
    
    def validate(self, data):
        """Validate that user hasn't already reviewed this service"""
        service = data.get('service')
        user = data.get('user')
        
        if service and user:
            # Check if user already reviewed this service
            existing_review = ServiceReview.objects.filter(
                service=service, 
                user=user
            ).first()
            
            if existing_review:
                raise serializers.ValidationError({
                    'service': 'You have already reviewed this service.'
                })
        
        return data

# --- Content & Settings ---
class WebsiteContentSerializer(serializers.ModelSerializer):
    class Meta:
        model = WebsiteContent
        fields = [
            "id",
            "banner1_image", "banner1_text", "banner1_link",
            "banner2_image", "banner2_text", "banner2_link", 
            "banner3_image", "banner3_text", "banner3_link",
            "logo", 
            "deal1_title", "deal1_subtitle", "deal1_discount", "deal1_description", "deal1_image", "deal1_end_date",
            "deal2_title", "deal2_subtitle", "deal2_discount", "deal2_description", "deal2_image", "deal2_end_date",
            "street_address", "city", "postcode", "country",
            "phone", "email"
        ]

class StoreSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = StoreSettings
        fields = ["id","store_name","store_logo","about_us_picture","favicon","currency","tax_rate","shipping_rate","standard_shipping_rate","express_shipping_rate","street_address","city","postcode","country","phone","email","monday_friday_hours","saturday_hours","sunday_hours"]

# --- Users (admin-facing) ---
class AdminUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id","username","email","first_name","last_name","is_active","is_staff","is_superuser"]

# --- Dashboard ---
class RecentOrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ["id","tracking_id","payment_id","total_price","status","created_at","shipping_name","customer_email"]

# --- Chat System ---
class ChatMessageSerializer(serializers.ModelSerializer):
    sender_email = serializers.SerializerMethodField()
    
    class Meta:
        model = ChatMessage
        fields = ["id", "sender_type", "sender_name", "sender_user", "sender_email", "content", "is_read", "created_at"]
        read_only_fields = ["id", "created_at"]
    
    def get_sender_email(self, obj):
        """Get sender email if available"""
        if obj.sender_user and obj.sender_user.email:
            return obj.sender_user.email
        return None

class ChatRoomSerializer(serializers.ModelSerializer):
    messages = ChatMessageSerializer(many=True, read_only=True)
    unread_count = serializers.SerializerMethodField()
    
    class Meta:
        model = ChatRoom
        fields = ["id", "customer_name", "customer_email", "customer_phone", "customer_session",
                 "user", "status", "created_at", "updated_at", "last_message_at", 
                 "messages", "unread_count"]
        read_only_fields = ["id", "created_at", "updated_at", "last_message_at"]
    
    def get_unread_count(self, obj):
        return obj.messages.filter(is_read=False, sender_type='customer').count()

class ChatRoomListSerializer(serializers.ModelSerializer):
    """Simplified serializer for chat room lists"""
    unread_count = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()
    
    class Meta:
        model = ChatRoom
        fields = ["id", "customer_name", "customer_email", "customer_session", "user", "status", 
                 "created_at", "updated_at", "last_message_at", 
                 "unread_count", "last_message"]
    
    def get_unread_count(self, obj):
        return obj.messages.filter(is_read=False, sender_type='customer').count()
    
    def get_last_message(self, obj):
        last_msg = obj.messages.last()
        if last_msg:
            return {
                "content": last_msg.content,
                "sender_type": last_msg.sender_type,
                "created_at": last_msg.created_at
            }
        return None

# --- Contact Form ---
class ContactSerializer(SafeModelSerializer):
    """Serializer for contact form submissions"""
    
    class Meta:
        model = Contact
        fields = ["id", "name", "email", "subject", "message", "status", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]

class ServiceQuerySerializer(SafeModelSerializer):
    """Serializer for service query submissions"""
    service_name = serializers.CharField(source='service.name', read_only=True)
    query_type_display = serializers.CharField(source='get_query_type_display', read_only=True)
    
    class Meta:
        model = ServiceQuery
        fields = [
            "id", "query_type", "query_type_display", "service", "service_name",
            "name", "email", "phone", "company", "message",
            "project_type", "timeline", "budget", "requirements",
            "preferred_date", "budget_range",
            "status", "created_at", "updated_at"
        ]
        read_only_fields = ["id", "created_at", "updated_at"]