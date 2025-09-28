from django.contrib import admin
from .models import (
    Product, Brand, Category, ProductImage,
    Order, OrderItem, Payment,
    Service, ServiceCategory, ServiceImage, ServiceInquiry,
    Review, ServiceReview,
    WebsiteContent, StoreSettings,
    Contact, ServiceQuery
)

# Product Management
@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'brand', 'category', 'price', 'stock', 'created_at')
    list_filter = ('brand', 'category', 'created_at')
    search_fields = ('name', 'description')
    readonly_fields = ('created_at',)

@admin.register(Brand)
class BrandAdmin(admin.ModelAdmin):
    list_display = ('name', 'created_at')
    search_fields = ('name',)

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slogan', 'created_at')
    search_fields = ('name', 'slogan')
    fields = ('name', 'slug', 'slogan', 'parent', 'image')

@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    list_display = ('product', 'image', 'created_at')
    list_filter = ('created_at',)

# Order Management
@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('order_number', 'customer_name', 'customer_email', 'total_price', 'status', 'payment_status', 'shipping_method', 'created_at')
    list_filter = ('status', 'payment_status', 'payment_method', 'created_at')
    search_fields = ('order_number', 'customer_name', 'customer_email', 'tracking_id', 'payment_id')
    readonly_fields = ('order_number', 'created_at', 'updated_at', 'stripe_session_id', 'payment_intent_id')
    ordering = ('-created_at',)
    
    fieldsets = (
        ('Order Information', {
            'fields': ('order_number', 'tracking_id', 'status', 'payment_status', 'payment_method')
        }),
        ('Customer Information', {
            'fields': ('customer_name', 'customer_email', 'customer_phone', 'user')
        }),
        ('Address Information', {
            'fields': ('shipping_address', 'billing_address', 'shipping_name', 'shipping_method')
        }),
        ('Order Details', {
            'fields': ('items', 'subtotal', 'shipping_cost', 'tax_amount', 'total_price')
        }),
        ('Payment Information', {
            'fields': ('stripe_session_id', 'payment_intent_id', 'payment_id')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user')
    
    def has_add_permission(self, request):
        # Prevent manual order creation through admin
        return False

@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ('order', 'product', 'quantity', 'unit_price')
    list_filter = ('order__status',)

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('id', 'order', 'stripe_payment_intent_id', 'amount', 'currency', 'status', 'created_at')
    list_filter = ('status', 'currency', 'created_at')
    search_fields = ('stripe_payment_intent_id', 'order__tracking_id')

# Service Management
@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'price', 'created_at')
    list_filter = ('category', 'created_at')
    search_fields = ('name', 'description')

@admin.register(ServiceCategory)
class ServiceCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'created_at')
    search_fields = ('name',)

@admin.register(ServiceImage)
class ServiceImageAdmin(admin.ModelAdmin):
    list_display = ('service', 'image', 'created_at')
    list_filter = ('created_at',)

@admin.register(ServiceInquiry)
class ServiceInquiryAdmin(admin.ModelAdmin):
    list_display = ('customer_name', 'customer_email', 'service', 'status', 'created_at')
    list_filter = ('status', 'service', 'created_at')
    search_fields = ('customer_name', 'customer_email', 'inquiry_details')

# Review Management
@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('product', 'user', 'rating', 'created_at')
    list_filter = ('rating', 'created_at')
    search_fields = ('product__name', 'user__username', 'comment')

@admin.register(ServiceReview)
class ServiceReviewAdmin(admin.ModelAdmin):
    list_display = ('service', 'user', 'rating', 'created_at')
    list_filter = ('rating', 'created_at')
    search_fields = ('service__name', 'user__username', 'comment')

# Content Management
@admin.register(WebsiteContent)
class WebsiteContentAdmin(admin.ModelAdmin):
    list_display = ('banner1_text', 'banner2_text')
    search_fields = ('banner1_text', 'banner2_text')

@admin.register(StoreSettings)
class StoreSettingsAdmin(admin.ModelAdmin):
    list_display = ('store_name', 'currency', 'tax_rate')
    search_fields = ('store_name',)

# Contact Management
@admin.register(Contact)
class ContactAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'subject', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('name', 'email', 'subject', 'message')

@admin.register(ServiceQuery)
class ServiceQueryAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'service', 'created_at')
    list_filter = ('service', 'created_at')
    search_fields = ('name', 'email', 'message')
