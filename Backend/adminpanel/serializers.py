from rest_framework import serializers
from django.db import IntegrityError, transaction
from django.contrib.auth.models import User
from .models import (
    Brand, Category, Product, ProductImage,
    Service, ServiceImage, ServiceInquiry,
    Order, OrderItem, Review, WebsiteContent, StoreSettings,
    ChatRoom, ChatMessage
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
        fields = ["id", "name", "created_at"]
        read_only_fields = ["id", "created_at"]

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
    slug = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ["id", "name", "slug", "parent", "created_at"]
        read_only_fields = ["id", "slug", "created_at"]

    def get_slug(self, obj):
        """Generate slug from category name"""
        import re
        slug = re.sub(r'[^\w\s-]', '', obj.name.lower())
        slug = re.sub(r'[-\s]+', '-', slug)
        return slug.strip('-')

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

    class Meta:
        model = Product
        fields = [
            "id", "name", "description",
            "price", "discount_rate", "stock",
            "brand", "category",
            "technical_specs",
            "images", "created_at",
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
    product_name = serializers.CharField(source="product.name", read_only=True)

    class Meta:
        model = OrderItem
        fields = ["id","product","product_name","quantity","unit_price"]

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = ["id","user","total_price","status","created_at","shipping_name","items"]

# --- Services ---
class ServiceImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceImage
        fields = ["id","image","created_at"]

class ServiceSerializer(serializers.ModelSerializer):
    images = ServiceImageSerializer(many=True, read_only=True)

    class Meta:
        model = Service
        fields = ["id","name","description","price","form_fields","created_at","images"]

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
        fields = ["id","product","product_name","user","user_name","rating","comment","created_at"]

# --- Content & Settings ---
class WebsiteContentSerializer(serializers.ModelSerializer):
    class Meta:
        model = WebsiteContent
        fields = [
            "id",
            "banner1_image", "banner1_text", "banner1_link",
            "banner2_image", "banner2_text", "banner2_link", 
            "banner3_image", "banner3_text", "banner3_link",
            "logo", "phone_number", "email", "address"
        ]

class StoreSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = StoreSettings
        fields = ["id","currency","tax_rate","shipping_rate"]

# --- Users (admin-facing) ---
class AdminUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id","username","email","first_name","last_name","is_active","is_staff","is_superuser"]

# --- Dashboard ---
class RecentOrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ["id","total_price","status","created_at","shipping_name"]

# --- Chat System ---
class ChatMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatMessage
        fields = ["id", "sender_type", "sender_name", "content", "is_read", "created_at"]
        read_only_fields = ["id", "created_at"]

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