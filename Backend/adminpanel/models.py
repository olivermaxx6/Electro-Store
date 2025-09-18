import os
from uuid import uuid4
from django.db import models
from django.db.models.functions import Lower
from django.contrib.auth.models import User
from django.utils import timezone
from django.core.exceptions import ValidationError

# --- Attributes ---
class Brand(models.Model):
    name = models.CharField(max_length=120, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name

class Category(models.Model):
    name = models.CharField(max_length=120)
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
        ]

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
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("processing", "Processing"),
        ("shipped", "Shipped"),
        ("delivered", "Delivered"),
        ("cancelled", "Cancelled"),
    ]
    user = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL)
    total_price = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    created_at = models.DateTimeField(auto_now_add=True)
    shipping_name = models.CharField(max_length=200, blank=True)

    def __str__(self): return f"Order #{self.pk}"

class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name="items", on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)

# --- Services ---
class Service(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    form_fields = models.JSONField(default=list, blank=True)  # [{label,type}]
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
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    user = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL)
    rating = models.PositiveSmallIntegerField()  # 1-5
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

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
    store_name = models.CharField(max_length=200, default="Electro")
    store_logo = models.ImageField(upload_to="store/", null=True, blank=True)
    about_us_picture = models.ImageField(upload_to="store/", null=True, blank=True)
    favicon = models.ImageField(upload_to="store/", null=True, blank=True, help_text="Favicon for the website (recommended size: 32x32 or 16x16 pixels)")
    currency = models.CharField(max_length=10, default="USD")
    tax_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0)      # percent
    shipping_rate = models.DecimalField(max_digits=6, decimal_places=2, default=0) # flat
    
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