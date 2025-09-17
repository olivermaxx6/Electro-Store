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
    banner1_link = models.URLField(blank=True)
    
    # Banner 2
    banner2_image = models.ImageField(upload_to="banner/", null=True, blank=True)
    banner2_text = models.CharField(max_length=200, blank=True)
    banner2_link = models.URLField(blank=True)
    
    # Banner 3
    banner3_image = models.ImageField(upload_to="banner/", null=True, blank=True)
    banner3_text = models.CharField(max_length=200, blank=True)
    banner3_link = models.URLField(blank=True)
    
    # Contact information
    logo = models.ImageField(upload_to="logo/", null=True, blank=True)
    phone_number = models.CharField(max_length=50, blank=True)
    email = models.EmailField(blank=True)
    address = models.TextField(blank=True)

class StoreSettings(models.Model):
    currency = models.CharField(max_length=10, default="USD")
    tax_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0)      # percent
    shipping_rate = models.DecimalField(max_digits=6, decimal_places=2, default=0) # flat