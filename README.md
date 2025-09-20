# Electro E-commerce Platform

A modern, full-featured e-commerce platform built with Django REST Framework (backend) and React with TypeScript (frontend). This platform provides a complete online shopping experience with both customer-facing storefront and administrative panel.

## 🚀 Live Demo

- **Storefront**: Customer-facing e-commerce site
- **Admin Panel**: Complete management system for store operations
- **Real-time Chat**: Customer support system with WebSocket integration

## ✨ Key Features

### 🛍️ Customer Storefront
- **Product Catalog**: Browse products with advanced filtering and search
- **Shopping Cart**: Add/remove items with persistent storage
- **Wishlist**: Save products for later purchase
- **Checkout Flow**: Multi-step checkout process with order tracking
- **User Accounts**: Registration, login, and order history
- **Reviews & Ratings**: Product reviews and rating system
- **Responsive Design**: Mobile-first approach with modern UI

### 🔧 Admin Panel
- **Product Management**: Add, edit, delete products with image uploads
- **Order Processing**: View and manage customer orders
- **User Management**: Customer and admin account management
- **Category Management**: Organize products with hierarchical categories
- **Content Management**: Manage static pages and website content
- **Analytics Dashboard**: Sales metrics and performance analytics
- **Real-time Chat**: Customer support chat system
- **Settings**: Store configuration and preferences

### 💬 Real-time Chat System
- **Customer Support**: Live chat between customers and admins
- **WebSocket Integration**: Real-time bidirectional communication
- **Message History**: Persistent chat history
- **Admin Interface**: Centralized chat management

## 🛠️ Technology Stack

### Backend
- **Framework**: Django 4.2+ with Django REST Framework
- **Database**: SQLite (development), PostgreSQL (production ready)
- **Authentication**: JWT tokens with refresh mechanism
- **WebSocket**: Django Channels with ASGI support
- **File Storage**: Local media files with image optimization
- **API**: RESTful API with comprehensive endpoints

### Frontend
- **Framework**: React 18+ with TypeScript
- **State Management**: Redux Toolkit with Redux Persist
- **Routing**: React Router v6 with protected routes
- **Styling**: Tailwind CSS with custom Electro theme
- **Build Tool**: Vite with hot module replacement
- **HTTP Client**: Fetch API with custom hooks

### Development Tools
- **Package Manager**: npm/yarn
- **Version Control**: Git with GitHub integration
- **Code Quality**: ESLint, Prettier, TypeScript
- **Testing**: Jest, React Testing Library

## 📁 Project Structure

```
Electro-Store/
├── Backend/                          # Django Backend
│   ├── adminpanel/                   # Main app with models, views, serializers
│   ├── accounts/                     # User authentication app
│   ├── core/                         # Django project settings
│   ├── media/                        # Uploaded files
│   ├── manage.py                     # Django management script
│   └── requirements.txt              # Python dependencies
├── Frontend/                         # React Frontend
│   ├── src/
│   │   ├── storefront/               # Customer-facing app
│   │   ├── admin/                    # Admin panel app
│   │   ├── components/               # Shared components
│   │   ├── store/                    # Redux store and slices
│   │   └── lib/                      # Utility functions
│   ├── package.json                  # Node.js dependencies
│   └── vite.config.js               # Vite configuration
├── scripts/                          # Utility scripts
├── PROJECT_DOCUMENTATION.md          # Detailed project documentation
├── RUN_PROJECT.md                    # Quick start guide
└── README.md                         # This file
```

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- Git

### Backend Setup
```bash
# Navigate to backend directory
cd Backend

# Create and activate virtual environment
python -m venv .venv
.venv\Scripts\activate  # Windows
# source .venv/bin/activate  # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Create admin user
python manage.py createsuperuser

# Start development server
python manage.py runserver 127.0.0.1:8001
```

### Frontend Setup
```bash
# Navigate to frontend directory
cd Frontend

# Install dependencies
npm install

# Start development servers
npm run dev:storefront  # Customer storefront (port 5173)
npm run dev:admin       # Admin panel (port 5174)
```

### Quick Start Scripts
```bash
# Windows PowerShell - Start everything
.\start_project.ps1

# Or start individual components
.\run_project.ps1
```

## 🌐 Access Points

- **Storefront**: http://localhost:5173
- **Admin Panel**: http://localhost:5174
- **Backend API**: http://127.0.0.1:8001
- **Django Admin**: http://127.0.0.1:8001/admin

## 🔐 Default Credentials

- **Admin Panel**: `admin` / `admin123`
- **Django Admin**: Use the superuser you created

## 📚 API Documentation

### Base URLs
- **Admin API**: `http://127.0.0.1:8001/api/`
- **Public API**: `http://127.0.0.1:8001/api/public/`
- **Authentication**: `http://127.0.0.1:8001/api/auth/`

### Key Endpoints
```bash
# Public endpoints (no authentication required)
GET  /api/public/products/            # List all products
GET  /api/public/categories/          # List all categories
POST /api/public/orders/              # Create new order
POST /api/public/reviews/             # Create product review

# Admin endpoints (authentication required)
GET  /api/admin/products/             # Manage products
GET  /api/admin/orders/               # Manage orders
GET  /api/admin/dashboard/stats/      # Dashboard statistics
```

## 🎨 Design System

### Color Palette
- **Primary**: Red (#e62e2e) - Brand color for CTAs and accents
- **Accent Dark**: Dark gray (#0f0f14) - Top utility bar
- **Surface**: Light gray (#f5f6f8) - Background surfaces
- **Ink**: Dark gray (#22242a) - Primary text
- **Muted**: Medium gray (#6b7280) - Secondary text
- **Star**: Yellow (#ffcc00) - Rating stars

### Typography
- **Font Family**: Poppins (primary), Inter (fallback)
- **Base Size**: 16px
- **Responsive**: Scales appropriately across devices

## 📱 Responsive Design

The platform is fully responsive across all device sizes:
- **Mobile**: < 768px - Single column layout
- **Tablet**: 768px - 1199px - Two column layout
- **Desktop**: ≥ 1200px - Four column layout

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Client-side and server-side validation
- **XSS Protection**: Sanitized user inputs
- **CSRF Protection**: Token-based request validation
- **Secure Storage**: Encrypted localStorage for sensitive data

## 🚀 Performance Optimizations

- **Code Splitting**: Lazy loading of components and routes
- **Bundle Optimization**: Tree shaking and minification
- **State Persistence**: Efficient localStorage usage
- **Image Optimization**: Placeholder system for fast loading
- **Caching**: Redux state persistence and API caching

## 🧪 Testing

```bash
# Backend testing
cd Backend
python manage.py test

# Frontend testing
cd Frontend
npm test
```

## 📦 Deployment

### Production Environment Variables

#### Backend (.env)
```env
DEBUG=False
SECRET_KEY=your_production_secret_key
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
DATABASE_URL=postgresql://user:password@localhost:5432/ecommerce_db
```

#### Frontend (.env)
```env
VITE_API_BASE_URL=https://api.yourdomain.com
```

### Production Build
```bash
# Backend
cd Backend
python manage.py collectstatic
python manage.py migrate

# Frontend
cd Frontend
npm run build:storefront
npm run build:admin
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- **Documentation**: Check the [PROJECT_DOCUMENTATION.md](PROJECT_DOCUMENTATION.md) file
- **Issues**: Open an issue on GitHub
- **Contact**: Reach out to the development team

## 🎯 Roadmap

### Upcoming Features
- **Multi-language Support**: Internationalization
- **Advanced Analytics**: Enhanced reporting and insights
- **Mobile App**: React Native mobile application
- **PWA Support**: Progressive Web App features
- **Advanced Search**: Elasticsearch integration
- **Payment Integration**: Multiple payment gateways
- **Inventory Management**: Real-time stock tracking

### Performance Improvements
- **Server-Side Rendering**: Next.js integration
- **Image Optimization**: Advanced image processing
- **Caching Strategy**: Redis caching layer
- **CDN Integration**: Global content delivery

## 📊 Project Statistics

- **Languages**: TypeScript (41.9%), JavaScript (32.0%), Python (20.0%)
- **Components**: 100+ React components
- **API Endpoints**: 50+ RESTful endpoints
- **Database Models**: 15+ Django models
- **Pages**: 30+ customer and admin pages

---

**Built with ❤️ by the Electro development team**

This platform represents modern e-commerce best practices with a focus on user experience, performance, and maintainability. The codebase is well-documented, follows industry standards, and is ready for production deployment.

## 🔗 Links

- **GitHub Repository**: [https://github.com/olivermaxx6/Electro-Store](https://github.com/olivermaxx6/Electro-Store)
- **Project Documentation**: [PROJECT_DOCUMENTATION.md](PROJECT_DOCUMENTATION.md)
- **Quick Start Guide**: [RUN_PROJECT.md](RUN_PROJECT.md)
