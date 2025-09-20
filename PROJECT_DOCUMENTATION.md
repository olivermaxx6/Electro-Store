# E-commerce Platform - Complete Project Documentation

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Project Structure](#project-structure)
5. [Backend API Documentation](#backend-api-documentation)
6. [Frontend Routes](#frontend-routes)
7. [Database Models](#database-models)
8. [Authentication System](#authentication-system)
9. [Chat System](#chat-system)
10. [Deployment Guide](#deployment-guide)
11. [Development Setup](#development-setup)
12. [API Testing](#api-testing)

---

## 🎯 Project Overview

This is a comprehensive e-commerce platform built with Django REST Framework (backend) and React with TypeScript (frontend). The platform includes:

- **Customer Storefront**: Complete shopping experience with cart, wishlist, checkout
- **Admin Panel**: Full management system for products, orders, users, and content
- **Real-time Chat**: Customer support system with WebSocket integration
- **Payment Integration**: Ready for Stripe integration
- **Responsive Design**: Mobile-first approach with dark/light themes

---

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Storefront   │    │   Admin Panel   │    │   Backend API   │
│   (React)      │◄──►│   (React)       │◄──►│   (Django)      │
│   Port: 5173   │    │   Port: 5174    │    │   Port: 8001    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Database      │
                    │   (SQLite)      │
                    └─────────────────┘
```

---

## 🛠️ Technology Stack

### Backend
- **Framework**: Django 4.2+ with Django REST Framework
- **Database**: SQLite (development), PostgreSQL (production ready)
- **Authentication**: JWT tokens
- **WebSocket**: Django Channels with ASGI
- **File Storage**: Local media files
- **API**: RESTful API with ViewSets

### Frontend
- **Framework**: React 18+ with TypeScript
- **State Management**: Redux Toolkit with Redux Persist
- **Routing**: React Router v6
- **Styling**: Tailwind CSS with custom theme
- **Build Tool**: Vite
- **HTTP Client**: Fetch API with custom hooks

### Development Tools
- **Package Manager**: npm/yarn
- **Version Control**: Git
- **Code Quality**: ESLint, Prettier
- **Testing**: Jest, React Testing Library

---

## 📁 Project Structure

```
Ecommerce/
├── Backend/                          # Django Backend
│   ├── adminpanel/                   # Main app with models, views, serializers
│   │   ├── models.py                 # Database models
│   │   ├── views.py                  # Admin API views
│   │   ├── views_public.py           # Public API views
│   │   ├── views_auth.py             # Authentication views
│   │   ├── views_dashboard.py        # Dashboard views
│   │   ├── serializers.py            # Data serializers
│   │   ├── urls.py                   # Admin API URLs
│   │   ├── urls_public.py            # Public API URLs
│   │   ├── consumers.py              # WebSocket consumers
│   │   ├── routing.py                # WebSocket routing
│   │   └── management/               # Django management commands
│   ├── accounts/                     # User authentication app
│   │   ├── authentication.py        # JWT authentication
│   │   ├── views.py                  # User views
│   │   └── serializers.py            # User serializers
│   ├── core/                         # Django project settings
│   │   ├── settings.py               # Main settings
│   │   ├── urls.py                   # Root URL configuration
│   │   ├── asgi.py                   # ASGI configuration
│   │   └── wsgi.py                   # WSGI configuration
│   ├── media/                        # Uploaded files
│   ├── manage.py                     # Django management script
│   └── requirements.txt              # Python dependencies
├── Frontend/                         # React Frontend
│   ├── src/
│   │   ├── storefront/               # Customer-facing app
│   │   │   ├── components/           # Reusable components
│   │   │   │   ├── common/           # Basic UI components
│   │   │   │   ├── header/           # Header components
│   │   │   │   ├── footer/           # Footer components
│   │   │   │   ├── products/         # Product components
│   │   │   │   └── hero/             # Hero section components
│   │   │   ├── pages/                # Page components
│   │   │   │   ├── static/           # Static pages
│   │   │   │   ├── auth/             # Authentication pages
│   │   │   │   └── user/             # User dashboard pages
│   │   │   ├── layouts/              # Layout components
│   │   │   ├── store/                # Redux store and slices
│   │   │   ├── lib/                  # Utility functions
│   │   │   ├── routes/                # React Router configuration
│   │   │   └── hooks/                # Custom React hooks
│   │   ├── admin/                    # Admin panel app
│   │   │   ├── components/           # Admin components
│   │   │   ├── pages/                # Admin pages
│   │   │   ├── store/                # Admin Redux store
│   │   │   └── routes/               # Admin routes
│   │   └── App.jsx                   # Main app component
│   ├── public/                       # Static assets
│   ├── package.json                  # Node.js dependencies
│   └── vite.config.js               # Vite configuration
└── README.md                         # Project documentation
```

---

## 🔌 Backend API Documentation

### Base URLs
- **Admin API**: `http://127.0.0.1:8001/api/`
- **Public API**: `http://127.0.0.1:8001/api/public/`
- **User Auth**: `http://127.0.0.1:8001/api/auth/`

### Authentication Endpoints

#### Admin Authentication
```
POST /api/auth/login/                 # Admin login
POST /api/auth/refresh/               # Refresh JWT token
GET  /api/auth/me/                    # Get current admin user
PUT  /api/auth/profile/               # Update admin profile
POST /api/auth/password/              # Change admin password
```

#### User Authentication
```
POST /api/auth/register/              # User registration
POST /api/auth/login/                 # User login
POST /api/auth/refresh/               # Refresh user token
GET  /api/auth/me/                    # Get current user
PUT  /api/auth/profile/               # Update user profile
```

### Public API Endpoints (No Authentication Required)

#### Products & Catalog
```
GET  /api/public/products/            # List all products
GET  /api/public/products/{id}/      # Get product details
GET  /api/public/categories/          # List all categories
GET  /api/public/categories/{id}/     # Get category details
GET  /api/public/brands/              # List all brands
GET  /api/public/brands/{id}/         # Get brand details
```

#### Services
```
GET  /api/public/services/            # List all services
GET  /api/public/services/{id}/      # Get service details
GET  /api/public/service-categories/ # List service categories
GET  /api/public/service-reviews/    # List service reviews
```

#### Orders & Checkout
```
POST /api/public/orders/              # Create new order
GET  /api/public/track-order/{id}/    # Track order status
```

#### Reviews & Content
```
GET  /api/public/reviews/             # List product reviews
POST /api/public/reviews/             # Create product review
GET  /api/public/website-content/     # Get website content
GET  /api/public/store-settings/      # Get store settings
```

#### Contact & Support
```
POST /api/public/contacts/            # Submit contact form
POST /api/public/service-queries/     # Submit service inquiry
```

#### Chat System
```
GET  /api/public/chat-rooms/          # List chat rooms
POST /api/public/chat-rooms/          # Create chat room
GET  /api/public/chat-rooms/{id}/     # Get chat room
POST /api/public/chat-rooms/{id}/send_message/  # Send message
GET  /api/public/chat-rooms/{id}/get_messages/  # Get messages
```

### Admin API Endpoints (Authentication Required)

#### Product Management
```
GET    /api/admin/products/           # List products
POST   /api/admin/products/           # Create product
GET    /api/admin/products/{id}/      # Get product
PUT    /api/admin/products/{id}/      # Update product
DELETE /api/admin/products/{id}/      # Delete product
GET    /api/admin/categories/         # List categories
POST   /api/admin/categories/         # Create category
GET    /api/admin/brands/             # List brands
POST   /api/admin/brands/             # Create brand
```

#### Order Management
```
GET    /api/admin/orders/             # List orders
GET    /api/admin/orders/{id}/        # Get order details
PUT    /api/admin/orders/{id}/        # Update order status
```

#### User Management
```
GET    /api/admin/users/              # List users
GET    /api/admin/users/{id}/         # Get user details
PUT    /api/admin/users/{id}/         # Update user
```

#### Content Management
```
GET    /api/admin/website-content/    # Get website content
PUT    /api/admin/website-content/    # Update website content
GET    /api/admin/store-settings/     # Get store settings
PUT    /api/admin/store-settings/     # Update store settings
```

#### Chat Management
```
GET    /api/admin/chat-rooms/         # List chat rooms (admin view)
GET    /api/admin/chat-rooms/{id}/    # Get chat room
POST   /api/admin/chat-rooms/{id}/send_message/  # Send admin message
POST   /api/admin/chat-rooms/{id}/mark_as_read/  # Mark as read
```

#### Dashboard
```
GET    /api/admin/dashboard/stats/    # Get dashboard statistics
GET    /api/admin/profile/            # Get admin profile
PUT    /api/admin/profile/            # Update admin profile
```

### WebSocket Endpoints

#### Chat WebSockets
```
ws://127.0.0.1:8001/ws/admin/chat/?token=JWT_TOKEN  # Admin chat
ws://127.0.0.1:8001/ws/chat/{room_id}/              # Customer chat
```

---

## 🛣️ Frontend Routes

### Storefront Routes (Customer-facing)

#### Main Layout Routes (`/`)
```
/                                   # Home page
/shop                              # Shop page (all products)
/deals                             # Deals page
/category/:slug                    # Category page
/product/:id                       # Product detail page
/cart                              # Shopping cart
/wishlist                          # Wishlist
/checkout                          # Checkout process
/order-confirmation/:trackingId    # Order confirmation
/search                            # Search results
/services                          # Services page
/service/:id                       # Service detail page
/categories                        # All categories
/allsubcategories                  # All subcategories
```

#### Static Pages
```
/about                             # About page
/contact                           # Contact page
/privacy                           # Privacy policy
/terms                             # Terms of service
/help                              # Help center
/track-order                       # Order tracking
/careers                           # Careers page
/findus                            # Find us page
/shipping                          # Shipping information
/returns                           # Returns policy
/warranty                          # Warranty information
/support                           # Support page
```

#### User Account Routes
```
/account                           # Account page
/account/orders                    # Order history
```

#### Authentication Routes (Outside Layout)
```
/user/sign-in                      # Sign in page
/user/sign-up                      # Sign up page
/user/dashboard                    # User dashboard
/user/settings                     # User settings
```

### Admin Panel Routes

#### Admin Layout Routes (`/admin`)
```
/admin/dashboard                   # Admin dashboard
/admin/products                    # Product management
/admin/manage-categories           # Category management
/admin/services                    # Service management
/admin/orders                      # Order management
/admin/users                       # User management
/admin/content                     # Website content
/admin/reviews                     # Product reviews
/admin/service-reviews             # Service reviews
/admin/chat                        # Customer chat
/admin/contact                     # Contact messages
/admin/settings                    # Store settings
```

#### Admin Authentication
```
/admin/sign-in                     # Admin sign in
```

---

## 🗄️ Database Models

### Core Models

#### Brand
```python
class Brand(models.Model):
    name = models.CharField(max_length=120, unique=True)
    slug = models.SlugField(max_length=120, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
```

#### Category
```python
class Category(models.Model):
    name = models.CharField(max_length=120)
    slug = models.SlugField(max_length=120)
    parent = models.ForeignKey('self', null=True, blank=True, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
```

#### Product
```python
class Product(models.Model):
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    old_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    stock = models.PositiveIntegerField(default=0)
    image = models.ImageField(upload_to='products/')
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    brand = models.ForeignKey(Brand, on_delete=models.CASCADE)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

#### Order
```python
class Order(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    email = models.EmailField()
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    address = models.TextField()
    city = models.CharField(max_length=100)
    postal_code = models.CharField(max_length=20)
    country = models.CharField(max_length=100)
    phone = models.CharField(max_length=20)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    total = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

#### OrderItem
```python
class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
```

#### Service
```python
class Service(models.Model):
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    image = models.ImageField(upload_to='services/')
    category = models.ForeignKey('ServiceCategory', on_delete=models.CASCADE)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
```

#### ChatRoom
```python
class ChatRoom(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    customer_name = models.CharField(max_length=100)
    customer_email = models.EmailField()
    subject = models.CharField(max_length=200)
    status = models.CharField(max_length=20, default='open')
    created_at = models.DateTimeField(auto_now_add=True)
```

#### ChatMessage
```python
class ChatMessage(models.Model):
    room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE, related_name='messages')
    sender_type = models.CharField(max_length=10, choices=[('customer', 'Customer'), ('admin', 'Admin')])
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
```

---

## 🔐 Authentication System

### JWT Token Structure
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

### Token Expiration
- **Access Token**: 1 hour
- **Refresh Token**: 7 days

### Authentication Flow
1. User submits credentials
2. Server validates credentials
3. Server returns JWT tokens
4. Client stores tokens in localStorage
5. Client includes token in API requests
6. Server validates token on each request

### Protected Routes
- All admin routes require authentication
- User-specific routes require authentication
- Public routes are accessible without authentication

---

## 💬 Chat System

### Architecture
- **WebSocket Connection**: Real-time bidirectional communication
- **Room-based**: Each customer conversation is a separate room
- **Admin Interface**: Admins can view and respond to all rooms
- **Message Persistence**: All messages stored in database

### WebSocket Events
```javascript
// Customer events
{
  "type": "chat.message",
  "room_id": "uuid",
  "message": "Hello, I need help"
}

// Admin events
{
  "type": "admin.message",
  "room_id": "uuid",
  "message": "How can I help you?"
}
```

### Chat Flow
1. Customer creates chat room via API
2. Customer connects to WebSocket
3. Admin views room in admin panel
4. Admin connects to WebSocket
5. Real-time message exchange
6. Messages persisted to database

---

## 🚀 Deployment Guide

### Production Environment Variables

#### Backend (.env)
```env
DEBUG=False
SECRET_KEY=your_production_secret_key
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
DATABASE_URL=postgresql://user:password@localhost:5432/ecommerce_db
STRIPE_PUBLISHABLE_KEY=pk_live_your_live_key
STRIPE_SECRET_KEY=sk_live_your_live_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

#### Frontend (.env)
```env
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_key
```

### Database Migration
```bash
cd Backend
python manage.py migrate
python manage.py collectstatic
python manage.py createsuperuser
```

### Production Server Setup
```bash
# Install production dependencies
pip install gunicorn psycopg2-binary

# Run with Gunicorn
gunicorn core.wsgi:application --bind 0.0.0.0:8000

# Run ASGI server for WebSocket support
gunicorn core.asgi:application --bind 0.0.0.0:8000 -k uvicorn.workers.UvicornWorker
```

---

## 🛠️ Development Setup

### Prerequisites
- Python 3.8+
- Node.js 16+
- Git

### Backend Setup
```bash
# Clone repository
git clone <repository-url>
cd Ecommerce/Backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Start development server
python manage.py runserver 8001
```

### Frontend Setup
```bash
cd Frontend

# Install dependencies
npm install

# Start development server
npm run dev                    # Storefront (port 5173)
npm run dev:admin             # Admin panel (port 5174)
```

### Database Seeding
```bash
cd Backend
python manage.py loaddata fixtures/initial_data.json
```

---

## 🧪 API Testing

### Using curl
```bash
# Test public API
curl -X GET "http://127.0.0.1:8001/api/public/products/"

# Test authenticated API
curl -X GET "http://127.0.0.1:8001/api/admin/products/" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Create order
curl -X POST "http://127.0.0.1:8001/api/public/orders/" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "address": "123 Main St",
    "city": "New York",
    "postal_code": "10001",
    "country": "USA",
    "phone": "+1234567890",
    "items": [
      {
        "product": 1,
        "quantity": 2,
        "price": "29.99"
      }
    ]
  }'
```

### Using Postman
1. Import the API collection
2. Set base URL: `http://127.0.0.1:8001`
3. Configure authentication headers
4. Test all endpoints

---

## 📊 Performance Considerations

### Backend Optimization
- Database indexing on frequently queried fields
- Pagination for large datasets
- Caching for static content
- Image optimization and compression
- Database query optimization

### Frontend Optimization
- Code splitting and lazy loading
- Image optimization
- Redux state normalization
- Memoization for expensive calculations
- Service worker for caching

---

## 🔧 Maintenance

### Regular Tasks
- Database backups
- Security updates
- Performance monitoring
- Log analysis
- User feedback review

### Monitoring
- Application logs
- Error tracking
- Performance metrics
- User analytics
- Payment processing logs

---

## 📞 Support

For technical support or questions:
- Check the troubleshooting guides
- Review the API documentation
- Test with the provided examples
- Check server logs for errors

---

**Last Updated**: January 2025
**Version**: 1.0.0
**Maintainer**: Development Team
