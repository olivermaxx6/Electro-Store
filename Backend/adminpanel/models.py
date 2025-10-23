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
    image = models.ImageField(upload_to="brands/", null=True, blank=True, help_text="Brand logo/image")
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
    slogan = models.TextField(
        blank=True, 
        null=True,
        help_text="Dynamic slogan for this category. Will be displayed on category pages."
    )
    # self-referential FK for subcategories
    parent = models.ForeignKey(
        "self",
        null=True, blank=True,
        on_delete=models.CASCADE,
        related_name="children",
    )
    image = models.ImageField(upload_to="categories/", null=True, blank=True, help_text="Category image (typically used for grandchild categories)")
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
        # Validate hierarchy depth before saving
        if self.parent and self.get_depth() > 2:
            raise ValueError("Category hierarchy cannot exceed 3 levels (parent -> child -> grandchild)")
        
        # Prevent circular references
        if self.parent and self.parent.pk == self.pk:
            raise ValueError("Category cannot be its own parent")
        
        # Check for duplicate names within the same parent (case-insensitive)
        existing_query = Category.objects.filter(name__iexact=self.name, parent=self.parent)
        if self.pk:  # If updating, exclude current instance
            existing_query = existing_query.exclude(pk=self.pk)
        
        if existing_query.exists():
            parent_name = "root level" if self.parent is None else f"under parent category '{self.parent.name}'"
            raise ValueError(f"A category with the name '{self.name}' already exists {parent_name}. Please choose a different name.")
        
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

    def get_depth(self):
        """Get the depth level of this category in the hierarchy"""
        depth = 0
        current = self.parent
        while current:
            depth += 1
            current = current.parent
        return depth

    def get_level(self):
        """Get the hierarchy level: 0=parent, 1=child, 2=grandchild"""
        return self.get_depth()

    def get_level_name(self):
        """Get a human-readable level name"""
        level = self.get_level()
        level_names = {0: 'Parent Category', 1: 'Child Category', 2: 'Grandchild Category'}
        return level_names.get(level, 'Unknown Level')

    def get_full_path(self):
        """Get the full hierarchical path as a string"""
        path_parts = []
        current = self
        while current:
            path_parts.insert(0, current.name)
            current = current.parent
        return ' / '.join(path_parts)

    def get_all_descendants(self):
        """Get all descendants (children, grandchildren, etc.)"""
        descendants = []
        for child in self.children.all():
            descendants.append(child)
            descendants.extend(child.get_all_descendants())
        return descendants

    def can_have_children(self):
        """Check if this category can have children (not exceeding depth limit)"""
        return self.get_depth() < 2

    def get_ancestors(self):
        """Get all ancestors (parent, grandparent, etc.)"""
        ancestors = []
        current = self.parent
        while current:
            ancestors.append(current)
            current = current.parent
        return ancestors

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
    """Upload path for product images"""
    import adminpanel.upload_paths
    return adminpanel.upload_paths.product_image_path(instance, filename)

class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="images")
    image = models.ImageField(upload_to=product_image_path, validators=[validate_image_ext])
    is_main = models.BooleanField(default=False, help_text="Mark this as the main product image")
    created_at = models.DateTimeField(auto_now_add=True)
    class Meta: 
        ordering = ["-is_main", "-created_at"]
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
    
    # Enhanced order identification
    order_number = models.CharField(max_length=20, null=True, blank=True)
    tracking_id = models.CharField(max_length=100, unique=True, blank=True)
    
    # Customer Information
    customer_email = models.EmailField()
    customer_name = models.CharField(max_length=100, default='Unknown Customer')
    customer_phone = models.CharField(max_length=20, blank=True)
    
    # Address Information
    shipping_address = models.JSONField()  # Store complete address
    billing_address = models.JSONField(blank=True, null=True)
    
    # Order Items (stored as JSON for immediate order creation)
    items = models.JSONField(default=list)  # Store cart items with prices
    
    # Pricing Information
    subtotal = models.DecimalField(max_digits=12, decimal_places=2)
    shipping_cost = models.DecimalField(max_digits=10, decimal_places=2)
    tax_amount = models.DecimalField(max_digits=10, decimal_places=2)
    total_price = models.DecimalField(max_digits=12, decimal_places=2)
    
    # Order Details
    status = models.CharField(max_length=20, choices=ORDER_STATUS_CHOICES, default="pending")
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default="unpaid")
    payment_method = models.CharField(max_length=50, default="credit_card")
    shipping_name = models.CharField(max_length=200, blank=True)
    shipping_method = models.CharField(max_length=50, blank=True, help_text="Selected shipping method (standard, express, etc.)")
    
    # Stripe Integration
    stripe_session_id = models.CharField(max_length=255, blank=True)
    payment_intent_id = models.CharField(max_length=255, blank=True)
    payment_id = models.CharField(max_length=200, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['order_number']),
            models.Index(fields=['customer_email']),
            models.Index(fields=['status']),
            models.Index(fields=['created_at']),
        ]

    def generate_order_number(self):
        """Generate unique order number"""
        from django.utils import timezone
        return f"ORD-{timezone.now().strftime('%Y%m%d')}-{str(self.id).zfill(6)}"

    def save(self, *args, **kwargs):
        if not self.order_number:
            # We'll set this after the object is saved and has an ID
            super().save(*args, **kwargs)
            self.order_number = self.generate_order_number()
            super().save(update_fields=['order_number'])
        else:
            super().save(*args, **kwargs)

    def __str__(self): 
        return f"Order #{self.order_number} - {self.customer_name}"

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
    order = models.ForeignKey(Order, related_name="order_items", on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)

# --- Services ---
class ServiceCategory(models.Model):
    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, null=True, blank=True)
    description = models.TextField(blank=True)
    ordering = models.PositiveIntegerField(default=0, help_text="Order in which categories appear")
    is_active = models.BooleanField(default=True)
    image = models.ImageField(upload_to="service_categories/", null=True, blank=True, help_text="Category image")
    
    # self-referential FK for subcategories
    parent = models.ForeignKey(
        "self",
        null=True, blank=True,
        on_delete=models.CASCADE,
        related_name="children",
    )
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Service Category"
        verbose_name_plural = "Service Categories"
        ordering = ['ordering', 'name']
        # Unique name within same parent (case-insensitive)
        constraints = [
            models.UniqueConstraint(
                Lower("name"), "parent",
                name="uniq_service_category_name_per_parent_ci",
            ),
            models.UniqueConstraint(
                "slug", "parent",
                name="uniq_service_category_slug_per_parent",
            ),
        ]

    def save(self, *args, **kwargs):
        # Validate hierarchy depth before saving
        if self.parent and self.get_depth() > 2:
            raise ValueError("Service category hierarchy cannot exceed 3 levels (parent -> child -> grandchild)")
        
        # Prevent circular references
        if self.parent and self.parent.pk == self.pk:
            raise ValueError("Service category cannot be its own parent")
        
        # Check for duplicate names within the same parent (case-insensitive)
        existing_query = ServiceCategory.objects.filter(name__iexact=self.name, parent=self.parent)
        if self.pk:  # If updating, exclude current instance
            existing_query = existing_query.exclude(pk=self.pk)
        
        if existing_query.exists():
            parent_name = "root level" if self.parent is None else f"parent '{self.parent.name}'"
            raise ValueError(f"A service category with the name '{self.name}' already exists at {parent_name}")
        
        # Generate slug if not provided
        if not self.slug:
            self.slug = self.generate_slug()
        
        super().save(*args, **kwargs)

    def generate_slug(self):
        """Generate a unique slug for the category"""
        from django.utils.text import slugify
        base_slug = slugify(self.name)
        slug = base_slug
        counter = 1
        
        while ServiceCategory.objects.filter(slug=slug, parent=self.parent).exclude(pk=self.pk).exists():
            slug = f"{base_slug}-{counter}"
            counter += 1
        
        return slug

    def get_depth(self):
        """Get the depth of this category in the hierarchy"""
        depth = 0
        parent = self.parent
        while parent:
            depth += 1
            parent = parent.parent
        return depth

    def get_ancestors(self):
        """Get all ancestors of this category"""
        ancestors = []
        parent = self.parent
        while parent:
            ancestors.insert(0, parent)
            parent = parent.parent
        return ancestors

    def get_descendants(self):
        """Get all descendants of this category"""
        descendants = []
        for child in self.children.all():
            descendants.append(child)
            descendants.extend(child.get_descendants())
        return descendants

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
    is_main = models.BooleanField(default=False)
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
    
    # Home Page Content
    home_hero_subtitle = models.TextField(blank=True, help_text="Hero section subtitle text on home page")
    home_services_description = models.TextField(blank=True, help_text="Services section description text on home page")
    home_categories_description = models.TextField(blank=True, help_text="Product categories section description text on home page")
    
    # Services Page Content
    services_page_title = models.CharField(max_length=200, blank=True, help_text="Title text for the services page")
    services_page_description = models.TextField(blank=True, help_text="Description text for the services page")

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
        # Ensure one active room per user/session
        constraints = [
            models.UniqueConstraint(
                fields=['user'],
                condition=models.Q(status__in=['active', 'waiting']),
                name='unique_active_user_room'
            ),
            models.UniqueConstraint(
                fields=['customer_session'],
                condition=models.Q(status__in=['active', 'waiting'], user__isnull=True),
                name='unique_active_session_room'
            )
        ]
    
    def __str__(self):
        return f"Chat {self.id} - {self.customer_name or 'Anonymous'}"
    
    def get_display_name(self):
        """Get display name for the customer"""
        if self.customer_name:
            return self.customer_name
        elif self.user:
            if self.user.first_name and self.user.last_name:
                return f"{self.user.first_name} {self.user.last_name}"
            elif self.user.first_name:
                return self.user.first_name
            elif self.user.username:
                return self.user.username
            else:
                return self.user.email
        else:
            return 'Anonymous'
    
    def get_unread_count(self):
        """Get count of unread messages from customer"""
        return self.messages.filter(sender_type='customer', is_read=False).count()

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