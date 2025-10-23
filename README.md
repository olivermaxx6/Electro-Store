# Electro-Store 🛍️

A comprehensive, full-stack e-commerce platform built with modern technologies. Electro-Store features a Django REST API backend with real-time WebSocket support, a React/TypeScript storefront for customers, and an admin panel for store management.

## 🏗️ Architecture Overview

Electro-Store is built with a microservices-inspired architecture:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Frontend      │    │   Backend       │
│   Storefront    │    │   Admin Panel   │    │   Django API    │
│   (React/TS)    │◄──►│   (React/TS)    │◄──►│   + WebSockets  │
│   Port: 5173    │    │   Port: 5174    │    │   Port: 8001    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## ✨ Key Features

### 🛒 E-commerce Storefront
- **Complete Shopping Experience**: Product browsing, cart management, wishlist, and checkout
- **Advanced Product Catalog**: Categories, brands, filtering, search, and product reviews
- **Multi-step Checkout**: Address → Shipping → Payment → Review flow
- **User Accounts**: Registration, authentication, order history, and profile management
- **Order Tracking**: Real-time order status updates
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices

### 🔧 Admin Panel
- **Product Management**: CRUD operations for products, categories, and brands
- **Order Management**: Process orders, update statuses, and track fulfillment
- **User Management**: Admin accounts and customer management
- **Analytics Dashboard**: Sales metrics, performance analytics, and insights
- **Content Management**: Website content, banners, and static pages
- **Service Management**: Digital services with custom forms and pricing

### 🚀 Backend API
- **Django REST Framework**: Comprehensive API with authentication and permissions
- **Real-time Features**: WebSocket support for live chat and notifications
- **Payment Integration**: Stripe payment processing with webhooks
- **Database Support**: MySQL with optimized queries and caching
- **File Management**: Image uploads with validation and optimization
- **Security**: JWT authentication, CORS, and input validation

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript for type safety
- **Vite** for fast development and building
- **Tailwind CSS** for modern, responsive styling
- **Redux Toolkit** for state management
- **React Router v6** for client-side routing
- **Socket.io** for real-time communication
- **Stripe React** for payment processing

### Backend
- **Django 5.2** with Django REST Framework
- **MySQL** database with PyMySQL driver
- **Django Channels** for WebSocket support
- **Redis** for caching and session storage
- **Stripe** for payment processing
- **Pillow** for image processing
- **JWT** for authentication

### Development Tools
- **ESLint** and **TypeScript** for code quality
- **Black** and **Flake8** for Python code formatting
- **Concurrently** for running multiple dev servers
- **Docker** support for containerization

## 📁 Project Structure

```
Electro-Store/
├── Backend/                    # Django API Server
│   ├── adminpanel/            # Main Django app
│   │   ├── models.py         # Database models
│   │   ├── views.py          # Admin API views
│   │   ├── views_public.py   # Public API views
│   │   ├── serializers.py    # API serializers
│   │   ├── urls.py           # Admin API routes
│   │   ├── urls_public.py    # Public API routes
│   │   ├── consumers.py      # WebSocket consumers
│   │   └── management/       # Django management commands
│   ├── accounts/             # User authentication
│   ├── core/                 # Django settings and config
│   ├── media/                # File uploads
│   ├── static/               # Static files
│   └── requirements.txt      # Python dependencies
├── Frontend/                  # React Applications
│   ├── src/
│   │   ├── storefront/       # Customer-facing store
│   │   │   ├── components/   # Reusable UI components
│   │   │   ├── pages/        # Page components
│   │   │   ├── store/        # Redux store and slices
│   │   │   └── routes/       # React Router config
│   │   ├── admin/            # Admin panel
│   │   │   ├── components/   # Admin UI components
│   │   │   ├── pages/        # Admin pages
│   │   │   └── store/        # Admin state management
│   │   └── shared/           # Shared utilities and types
│   ├── package.json          # Frontend dependencies
│   └── vite.config.js        # Vite configuration
└── README.md                 # This file
```

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+** and npm
- **Python 3.11+** and pip
- **MySQL 8.0+** database
- **Redis** (for WebSocket support)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Electro-Store
```

### 2. Backend Setup
```bash
cd Backend

# Create and activate virtual environment
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp env.example .env
# Edit .env with your database and Stripe credentials

# Run database migrations
python manage.py migrate

# Create admin user
python manage.py seed_admin

# Start Django development server
python manage.py runserver 127.0.0.1:8001
```

### 3. Frontend Setup
```bash
cd Frontend

# Install dependencies
npm install

# Start development servers
npm run dev:both
# This starts both storefront (5173) and admin (5174)
```

### 4. Access the Applications
- **Storefront**: http://localhost:5173
- **Admin Panel**: http://localhost:5174
- **API**: http://127.0.0.1:8001/api/
- **Django Admin**: http://127.0.0.1:8001/admin/

## 🔧 Development

### Backend Development
```bash
cd Backend

# Run Django server
python manage.py runserver 127.0.0.1:8001

# Run with specific settings
python manage.py runserver --settings=core.settings_clean

# Run management commands
python manage.py seed_data          # Seed sample data
python manage.py seed_services      # Seed service categories
python manage.py collectstatic      # Collect static files
```

### Frontend Development
```bash
cd Frontend

# Start individual applications
npm run dev:storefront    # Storefront only (port 5173)
npm run dev:admin         # Admin panel only (port 5174)

# Build for production
npm run build:storefront
npm run build:admin
npm run build:both

# Lint and format
npm run lint
```

### Database Management
```bash
# Create migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Reset database (development only)
python manage.py flush

# Load sample data
python manage.py seed_data
python manage.py seed_services_comprehensive
```

## 📊 API Documentation

### Public API Endpoints (Storefront)
- `GET /api/public/products/` - List products with filtering
- `GET /api/public/categories/` - List categories
- `GET /api/public/brands/` - List brands
- `POST /api/public/orders/` - Create new order
- `GET /api/public/orders/{id}/` - Get order details
- `POST /api/public/create-checkout-session/` - Create Stripe checkout
- `GET /api/public/chat-rooms/` - Chat system endpoints

### Admin API Endpoints
- `GET /api/admin/products/` - Manage products
- `GET /api/admin/orders/` - Manage orders
- `GET /api/admin/users/` - Manage users
- `GET /api/admin/dashboard/stats/` - Dashboard analytics
- `POST /api/auth/login/` - Admin authentication

### WebSocket Endpoints
- `ws://localhost:8001/ws/chat/{room_id}/` - Real-time chat
- `ws://localhost:8001/ws/notifications/` - Admin notifications

## 🎨 Design System

### Color Palette
- **Primary Red**: `#e62e2e` - Brand color for CTAs
- **Dark Gray**: `#0f0f14` - Utility bar background
- **Light Gray**: `#f5f6f8` - Surface backgrounds
- **Text Dark**: `#22242a` - Primary text
- **Text Muted**: `#6b7280` - Secondary text
- **Star Yellow**: `#ffcc00` - Rating stars

### Typography
- **Font Family**: Poppins (primary), Inter (fallback)
- **Responsive Scaling**: 16px base, scales with viewport

### Responsive Breakpoints
- **Mobile**: < 768px (single column)
- **Tablet**: 768px - 1199px (2-up grids)
- **Desktop**: ≥ 1200px (4-up grids)

## 🔒 Security Features

- **JWT Authentication** for secure API access
- **CORS Configuration** for cross-origin requests
- **Input Validation** on both client and server
- **SQL Injection Protection** via Django ORM
- **XSS Protection** with sanitized inputs
- **CSRF Protection** for form submissions
- **File Upload Validation** with type checking
- **Rate Limiting** on sensitive endpoints

## 💳 Payment Integration

Electro-Store integrates with Stripe for secure payment processing:

- **Stripe Checkout** for hosted payment pages
- **Payment Intents** for custom payment flows
- **Webhook Handling** for payment confirmations
- **Order Status Updates** based on payment events
- **Refund Processing** through admin panel

## 📱 Real-time Features

- **Live Chat System** between customers and support
- **Order Status Updates** via WebSocket
- **Admin Notifications** for new orders and inquiries
- **Real-time Inventory** updates (planned)

## 🚀 Deployment

### Production Environment Variables
```bash
# Backend (.env)
DJANGO_SECRET_KEY=your-secret-key
DEBUG=False
DATABASE_URL=mysql://user:pass@host:port/db
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
REDIS_URL=redis://host:port

# Frontend (.env.production)
VITE_API_URL=https://your-api-domain.com/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up -d

# Or build individual containers
docker build -t electro-store-backend ./Backend
docker build -t electro-store-frontend ./Frontend
```

### Static File Serving
```bash
# Collect static files
python manage.py collectstatic

# Serve with nginx or CDN
# Configure nginx to serve /static/ and /media/ files
```

## 🧪 Testing

### Backend Testing
```bash
cd Backend
python manage.py test
pytest
```

### Frontend Testing
```bash
cd Frontend
npm test
npm run test:coverage
```

## 📈 Performance Optimizations

- **Database Query Optimization** with select_related and prefetch_related
- **Redis Caching** for frequently accessed data
- **Image Optimization** with Pillow and responsive images
- **Code Splitting** in React for smaller bundle sizes
- **Lazy Loading** for components and routes
- **CDN Integration** for static assets
- **Database Indexing** on frequently queried fields

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow the existing code style and conventions
- Write tests for new features
- Update documentation for API changes
- Use meaningful commit messages
- Ensure all tests pass before submitting

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check the individual README files in Backend/ and Frontend/
- **Issues**: Open an issue on GitHub
- **API Health**: Check http://127.0.0.1:8001/api/public/health/
- **WebSocket Health**: Check ws://127.0.0.1:8001/ws/health/

## 🎯 Roadmap

### Upcoming Features
- **Multi-language Support** (i18n)
- **Advanced Analytics** with detailed reporting
- **Mobile App** (React Native)
- **PWA Support** for offline functionality
- **Advanced Search** with Elasticsearch
- **Inventory Management** with real-time tracking
- **Multi-vendor Support** for marketplace functionality

### Performance Improvements
- **Server-Side Rendering** (Next.js)
- **Advanced Caching** strategies
- **Image CDN** integration
- **Database Sharding** for scalability

---

Built with ❤️ by the Electro-Store development team. This platform represents modern e-commerce best practices with a focus on user experience, performance, and maintainability.
