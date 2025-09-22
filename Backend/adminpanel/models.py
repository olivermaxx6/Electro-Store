import os
import uuid
from uuid import uuid4
from django.db import models
from django.db.models.functions import Lower
from django.contrib.auth.models import User
from django.utils import timezone
from django.core.exceptions import ValidationError

# --- Attributes ---
class Brand(models.Model):
    name = models.CharField(max_length=120, unique=True)
    slug = models.SlugField(max_length=120, unique=True, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = self.generate_slug()
        super().save(*args, **kwargs)

    def generate_slug(self):
        from django.utils.text import slugify
        base_slug = slugify(self.name)
        slug = base_slug
        counter = 1
        while Brand.objects.filter(slug=slug).exclude(pk=self.pk).exists():
            slug = f"{base_slug}-{counter}"
            counter += 1
        return slug

    def __str__(self):
        return self.name

class Category(models.Model):
    name = models.CharField(max_length=120)
    slug = models.SlugField(max_length=120, null=True, blank=True)
    # self-referential FK for subcategories
    parent = models.ForeignKey(
        "self",
        null=True, blank=True,
        on_delete=models.CASCADE,
        related_name="children",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]
        # Unique name within same parent (case-insensitive)
        constraints = [
            models.UniqueConstraint(
                Lower("name"), "parent",
                name="uniq_category_name_per_parent_ci",
            ),
            models.UniqueConstraint(
                "slug", "parent",
                name="uniq_category_slug_per_parent",
            ),
        ]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = self.generate_slug()
        super().save(*args, **kwargs)

    def generate_slug(self):
        from django.utils.text import slugify
        base_slug = slugify(self.name)
        slug = base_slug
        counter = 1
        while Category.objects.filter(slug=slug, parent=self.parent).exclude(pk=self.pk).exists():
            slug = f"{base_slug}-{counter}"
            counter += 1
        return slug

    def __str__(self):
        return f"{self.parent.name + ' / ' if self.parent else ''}{self.name}"

class Product(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True, default="")
    price = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    discount_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0, help_text="Discount percentage (0-100)")
    stock = models.PositiveIntegerField(default=0)
    brand = models.ForeignKey(Brand, on_delete=models.SET_NULL, null=True, blank=True, related_name="products")
    # IMPORTANT: category is the final selection (subcategory id if chosen; otherwise top-level)
    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name="products")
    # IMPORTANT: JSONField default=dict so it's never None (avoids KeyErrors/TypeErrors)
    technical_specs = models.JSONField(blank=True, default=dict)
    view_count = models.PositiveIntegerField(default=0, help_text="Number of times this product has been viewed")
    isNew = models.BooleanField(default=False, help_text="Mark this product as new arrival to display in new products section")
    is_top_selling = models.BooleanField(default=False, help_text="Mark this product as top selling to display on home page")
    created_at = models.DateTimeField(auto_now_add=True)
    class Meta: ordering = ["-created_at"]
    def __str__(self): return self.name

def validate_image_ext(file):
    name = (file.name or "").lower()
    if not (name.endswith(".jpg") or name.endswith(".jpeg") or name.endswith(".png")):
        raise ValidationError("Only .jpg and .png images are allowed.")

def product_image_path(instance, filename):
    ext = os.path.splitext(filename)[1].lower()
    new_name = f"{uuid4()}{ext}"
    
    # Save all product images in the "Selling products" folder
    # Assets/images/products/Selling products/<uuid>.<ext>
    return f"Assets/images/products/Selling products/{new_name}"

class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="images")
    image = models.ImageField(upload_to=product_image_path, validators=[validate_image_ext])
    created_at = models.DateTimeField(auto_now_add=True)
    class Meta: ordering = ["-created_at"]
    def __str__(self): return f"Image for {self.product_id}"

# --- Orders ---
class Order(models.Model):
    # Order fulfillment status (for shipping/delivery)
    ORDER_STATUS_CHOICES = [
        ("pending", "Pending"),
        ("processing", "Processing"),
        ("shipped", "Shipped"),
        ("delivered", "Delivered"),
        ("cancelled", "Cancelled"),
    ]
    
    # Payment status (separate from order status)
    PAYMENT_STATUS_CHOICES = [
        ("unpaid", "Unpaid"),
        ("paid", "Paid"),
        ("failed", "Payment Failed"),
        ("refunded", "Refunded"),
    ]
    
    user = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL)
    tracking_id = models.CharField(max_length=100, unique=True)
    payment_id = models.CharField(max_length=200, blank=True)
    
    # Customer Information
    customer_email = models.EmailField(blank=True)
    customer_phone = models.CharField(max_length=20, blank=True)
    shipping_address = models.JSONField(default=dict)  # Store complete address info
    
    # Pricing Information
    subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    shipping_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    tax_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_price = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    # Order Details
    status = models.CharField(max_length=20, choices=ORDER_STATUS_CHOICES, default="pending")
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default="unpaid")
    payment_method = models.CharField(max_length=50, default="credit_card")
    shipping_name = models.CharField(max_length=200, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self): return f"Order #{self.pk} - {self.tracking_id}"

class Payment(models.Model):
    """Model to track Stripe payment details"""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
        ('refunded', 'Refunded'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='payments')
    stripe_payment_intent_id = models.CharField(max_length=255, unique=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='GBP')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Payment {self.id} - {self.status}"

class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name="items", on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)

# --- Services ---
class ServiceCategory(models.Model):
    name = models.CharField(max_length=200, unique=True)
    description = models.TextField(blank=True)
    ordering = models.PositiveIntegerField(default=0, help_text="Order in which categories appear")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Service Category"
        verbose_name_plural = "Service Categories"
        ordering = ['ordering', 'name']

    def __str__(self):
        return self.name

class Service(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    form_fields = models.JSONField(default=list, blank=True)  # [{label,type}]
    category = models.ForeignKey(ServiceCategory, on_delete=models.SET_NULL, null=True, blank=True, related_name="services")
    
    # Additional service details
    rating = models.DecimalField(max_digits=2, decimal_places=1, default=0.0, help_text="Service rating (0.0-5.0)")
    review_count = models.PositiveIntegerField(default=0, help_text="Number of reviews")
    view_count = models.PositiveIntegerField(default=0, help_text="Number of times this service has been viewed")
    overview = models.TextField(blank=True, help_text="Detailed service overview")
    included_features = models.JSONField(default=list, blank=True, help_text="List of included features")
    process_steps = models.JSONField(default=list, blank=True, help_text="Service process steps with durations")
    key_features = models.JSONField(default=list, blank=True, help_text="Key service features")
    contact_info = models.JSONField(default=dict, blank=True, help_text="Contact information (phone, email)")
    availability = models.CharField(max_length=200, blank=True, help_text="Service availability information")
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self): return self.name

class ServiceImage(models.Model):
    service = models.ForeignKey(Service, related_name="images", on_delete=models.CASCADE)
    image = models.ImageField(upload_to="services/")
    created_at = models.DateTimeField(auto_now_add=True)

class ServiceInquiry(models.Model):
    STATUS_CHOICES = [("pending","Pending"), ("contacted","Contacted"), ("resolved","Resolved")]
    service = models.ForeignKey(Service, on_delete=models.CASCADE)
    customer_name = models.CharField(max_length=200)
    customer_email = models.EmailField()
    customer_phone = models.CharField(max_length=50, blank=True)
    inquiry_details = models.JSONField(default=dict, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    created_at = models.DateTimeField(auto_now_add=True)

# --- Reviews ---
class Review(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="reviews")
    user = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL)
    author_name = models.CharField(max_length=200, help_text="Name of the reviewer", default="Anonymous")
    rating = models.PositiveSmallIntegerField()  # 1-5
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        unique_together = ['product', 'user']  # Prevent duplicate reviews from same user
        
    def __str__(self):
        return f"{self.author_name} - {self.product.name} ({self.rating}★)"

class ServiceReview(models.Model):
    service = models.ForeignKey(Service, on_delete=models.CASCADE, related_name="reviews")
    user = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL)
    author_name = models.CharField(max_length=200, help_text="Name of the reviewer")
    rating = models.PositiveSmallIntegerField(help_text="Overall rating (1-5)")
    comment = models.TextField(blank=True)
    
    # Detailed ratings
    service_quality = models.PositiveSmallIntegerField(default=0, help_text="Service quality rating (1-5)")
    communication = models.PositiveSmallIntegerField(default=0, help_text="Communication rating (1-5)")
    timeliness = models.PositiveSmallIntegerField(default=0, help_text="Timeliness rating (1-5)")
    value_for_money = models.PositiveSmallIntegerField(default=0, help_text="Value for money rating (1-5)")
    
    verified = models.BooleanField(default=False, help_text="Whether this is a verified purchase/service")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        unique_together = ['service', 'user']  # Prevent duplicate reviews from same user
        
    def __str__(self):
        return f"{self.author_name} - {self.service.name} ({self.rating}★)"

# --- Website Content & Settings ---
class WebsiteContent(models.Model):
    # Banner 1
    banner1_image = models.ImageField(upload_to="banner/", null=True, blank=True)
    banner1_text = models.CharField(max_length=200, blank=True)
    banner1_link = models.CharField(max_length=500, blank=True)
    
    # Banner 2
    banner2_image = models.ImageField(upload_to="banner/", null=True, blank=True)
    banner2_text = models.CharField(max_length=200, blank=True)
    banner2_link = models.CharField(max_length=500, blank=True)
    
    # Banner 3
    banner3_image = models.ImageField(upload_to="banner/", null=True, blank=True)
    banner3_text = models.CharField(max_length=200, blank=True)
    banner3_link = models.CharField(max_length=500, blank=True)
    
    # Store logo
    logo = models.ImageField(upload_to="logo/", null=True, blank=True)
    
    # Deal Product 1
    deal1_title = models.CharField(max_length=200, blank=True, help_text="Deal product 1 title")
    deal1_subtitle = models.CharField(max_length=200, blank=True, help_text="Deal product 1 subtitle")
    deal1_discount = models.CharField(max_length=50, blank=True, help_text="Deal product 1 discount (e.g., 'Up to 50% Off')")
    deal1_description = models.TextField(blank=True, help_text="Deal product 1 description")
    deal1_image = models.ImageField(upload_to="deals/", null=True, blank=True, help_text="Deal product 1 image")
    deal1_end_date = models.DateTimeField(null=True, blank=True, help_text="Deal product 1 end date")
    
    # Deal Product 2
    deal2_title = models.CharField(max_length=200, blank=True, help_text="Deal product 2 title")
    deal2_subtitle = models.CharField(max_length=200, blank=True, help_text="Deal product 2 subtitle")
    deal2_discount = models.CharField(max_length=50, blank=True, help_text="Deal product 2 discount (e.g., 'Up to 50% Off')")
    deal2_description = models.TextField(blank=True, help_text="Deal product 2 description")
    deal2_image = models.ImageField(upload_to="deals/", null=True, blank=True, help_text="Deal product 2 image")
    deal2_end_date = models.DateTimeField(null=True, blank=True, help_text="Deal product 2 end date")
    
    # Store Location (for Find Us page and map integration)
    street_address = models.CharField(max_length=200, blank=True, help_text="Street address")
    city = models.CharField(max_length=100, blank=True, help_text="City")
    postcode = models.CharField(max_length=20, blank=True, help_text="Postal/ZIP code")
    country = models.CharField(max_length=100, blank=True, help_text="Country")
    
    # Contact Information
    phone = models.CharField(max_length=50, blank=True, help_text="Store phone number")
    email = models.EmailField(blank=True, help_text="Store email address")

class StoreSettings(models.Model):
    store_name = models.CharField(max_length=200, default="sppix")
    store_logo = models.ImageField(upload_to="store/", null=True, blank=True)
    about_us_picture = models.ImageField(upload_to="store/", null=True, blank=True)
    favicon = models.ImageField(upload_to="store/", null=True, blank=True, help_text="Favicon for the website (recommended size: 32x32 or 16x16 pixels)")
    currency = models.CharField(max_length=10, default="GBP")
    tax_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0)      # percent
    shipping_rate = models.DecimalField(max_digits=6, decimal_places=2, default=0) # flat (legacy field)
    
    # Individual shipping options
    standard_shipping_rate = models.DecimalField(max_digits=6, decimal_places=2, default=0, help_text="Standard Shipping rate (5-7 business days)")
    express_shipping_rate = models.DecimalField(max_digits=6, decimal_places=2, default=0, help_text="Express Shipping rate (2-3 business days)")
    
    # Store address fields for Find Us page
    street_address = models.CharField(max_length=200, blank=True, help_text="Street address")
    city = models.CharField(max_length=100, blank=True, help_text="City")
    postcode = models.CharField(max_length=20, blank=True, help_text="Postal/ZIP code")
    country = models.CharField(max_length=100, blank=True, help_text="Country")
    
    # Contact information
    phone = models.CharField(max_length=50, blank=True, help_text="Store phone number")
    email = models.EmailField(blank=True, help_text="Store email address")
    
    # Business hours
    monday_friday_hours = models.CharField(max_length=100, blank=True, help_text="Monday - Friday hours (e.g., '9:00 AM - 6:00 PM')")
    saturday_hours = models.CharField(max_length=100, blank=True, help_text="Saturday hours (e.g., '10:00 AM - 4:00 PM')")
    sunday_hours = models.CharField(max_length=100, blank=True, help_text="Sunday hours (e.g., 'Closed')")

# --- Chat System ---
class ChatRoom(models.Model):
    """Represents a chat conversation between a customer and admin"""
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    customer_name = models.CharField(max_length=200, blank=True)
    customer_email = models.EmailField(blank=True)
    customer_phone = models.CharField(max_length=50, blank=True)
    customer_session = models.CharField(max_length=40, blank=True, help_text="Django session key for anonymous customers")
    user = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL, related_name='chat_rooms', help_text="Authenticated user (optional)")
    status = models.CharField(max_length=20, choices=[
        ('active', 'Active'),
        ('closed', 'Closed'),
        ('waiting', 'Waiting for Response')
    ], default='active')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_message_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-last_message_at']
    
    def __str__(self):
        return f"Chat {self.id} - {self.customer_name or 'Anonymous'}"

class ChatMessage(models.Model):
    """Individual messages within a chat room"""
    SENDER_CHOICES = [
        ('customer', 'Customer'),
        ('admin', 'Admin'),
        ('system', 'System')
    ]
    
    room = models.ForeignKey(ChatRoom, related_name='messages', on_delete=models.CASCADE)
    sender_type = models.CharField(max_length=10, choices=SENDER_CHOICES)
    sender_name = models.CharField(max_length=200, blank=True)  # For display purposes
    sender_user = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL, related_name='sent_messages', help_text="User who sent the message (if authenticated)")
    content = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['created_at']
    
    def __str__(self):
        return f"{self.sender_type}: {self.content[:50]}..."

# --- Contact Form ---
class Contact(models.Model):
    """Contact form submissions from the website"""
    STATUS_CHOICES = [
        ('new', 'New'),
        ('read', 'Read'),
        ('replied', 'Replied'),
        ('closed', 'Closed')
    ]
    
    name = models.CharField(max_length=200)
    email = models.EmailField()
    subject = models.CharField(max_length=300)
    message = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='new')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.name} - {self.subject}"

class ServiceQuery(models.Model):
    """Service query submissions from service pages"""
    QUERY_TYPE_CHOICES = [
        ('avail_service', 'Avail This Service'),
        ('free_quote', 'Get Free Quote')
    ]
    
    STATUS_CHOICES = [
        ('new', 'New'),
        ('read', 'Read'),
        ('replied', 'Replied'),
        ('closed', 'Closed')
    ]
    
    query_type = models.CharField(max_length=20, choices=QUERY_TYPE_CHOICES)
    service = models.ForeignKey(Service, on_delete=models.CASCADE, related_name='queries')
    name = models.CharField(max_length=200)
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True)
    company = models.CharField(max_length=200, blank=True)
    message = models.TextField(blank=True)
    
    # Additional fields for quote requests
    project_type = models.CharField(max_length=100, blank=True)
    timeline = models.CharField(max_length=100, blank=True)
    budget = models.CharField(max_length=100, blank=True)
    requirements = models.TextField(blank=True)
    
    # Additional fields for service requests
    preferred_date = models.DateField(null=True, blank=True)
    budget_range = models.CharField(max_length=100, blank=True)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='new')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.name} - {self.get_query_type_display()} for {self.service.name}"