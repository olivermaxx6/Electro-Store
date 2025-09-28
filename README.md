# 🛒 SPPIX Ecommerce Platform

A modern, full-stack ecommerce platform built with Django REST API and React frontend.

## 🚀 Quick Start

### Prerequisites
- **Python 3.8+** - [Download Python](https://www.python.org/downloads/)
- **Node.js 16+** - [Download Node.js](https://nodejs.org/)
- **Git** - [Download Git](https://git-scm.com/)

### One-Command Setup (Windows)

```powershell
# Clone the repository
git clone <your-repo-url>
cd sppix-ecommerce

# Run the setup script
.\setup-project.ps1
```

### Manual Setup

#### 1. Backend Setup (Django)

```bash
# Navigate to backend directory
cd Backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Create admin user
python manage.py seed_admin

# Start backend server
python manage.py runserver 127.0.0.1:8001
```

#### 2. Frontend Setup (React)

```bash
# Navigate to frontend directory (in a new terminal)
cd Frontend

# Install dependencies
npm install

# Start storefront server
npm run dev:storefront

# Start admin panel server (in another terminal)
npm run dev:admin
```

## 🎯 Easy Commands

### PowerShell Scripts (Windows)

| Command | Description |
|---------|-------------|
| `.\setup-project.ps1` | Complete project setup from scratch |
| `.\start-project.ps1` | Start both backend and frontend servers |
| `.\start-backend.ps1` | Start only the Django backend |
| `.\start-frontend.ps1` | Start only the React storefront |
| `.\start-admin.ps1` | Start only the React admin panel |

### Batch Files (Windows)

| Command | Description |
|---------|-------------|
| `start-project.bat` | Start both servers |
| `start-backend.bat` | Start only backend |
| `start-frontend.bat` | Start only storefront |
| `start-admin.bat` | Start only admin panel |

## 🌐 Access URLs

- **Storefront**: http://localhost:5173
- **Admin Panel**: http://localhost:5174
- **Backend API**: http://127.0.0.1:8001
- **Django Admin**: http://127.0.0.1:8001/admin/

## 👤 Default Admin Credentials

- **Email**: admin@example.com
- **Password**: admin123

## 📁 Project Structure

```
sppix-ecommerce/
├── Backend/                 # Django REST API
│   ├── core/               # Django settings
│   ├── adminpanel/         # Main app models & views
│   ├── accounts/           # User authentication
│   ├── requirements.txt    # Python dependencies
│   ├── env.example         # Environment template
│   └── manage.py           # Django management
├── Frontend/               # React frontend
│   ├── src/
│   │   ├── admin/          # Admin panel
│   │   └── storefront/     # Customer-facing store
│   ├── package.json        # Node.js dependencies
│   ├── env.example         # Environment template
│   └── vite.config.js      # Vite configuration
├── *.ps1                   # PowerShell scripts (Windows)
├── *.bat                   # Batch files (Windows)
├── package.json            # Root package.json with npm scripts
├── README.md               # This documentation
├── QUICK_START.md          # Quick start guide
└── SETUP_COMPLETE.md       # Setup completion summary
```

## 🔧 Configuration

### Environment Variables

Copy the example environment files and customize:

```bash
# Backend
cp Backend/env.example Backend/.env

# Frontend  
cp Frontend/env.example Frontend/.env
```

### Key Settings

- **Backend Port**: 8001 (configurable in `Backend/core/settings.py`)
- **Storefront Port**: 5173 (configurable in `Frontend/vite.storefront.config.js`)
- **Admin Port**: 5174 (configurable in `Frontend/vite.admin.config.js`)
- **Database**: SQLite (default), PostgreSQL (production)
- **Authentication**: JWT tokens

## 🛠️ Development

### Backend Development

```bash
cd Backend
venv\Scripts\activate  # Windows
# source venv/bin/activate  # macOS/Linux

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Run tests
python manage.py test

# Start development server
python manage.py runserver 127.0.0.1:8001
```

### Frontend Development

```bash
cd Frontend

# Install dependencies
npm install

# Start storefront development server
npm run dev:storefront

# Start admin panel development server (in another terminal)
npm run dev:admin

# Build for production
npm run build

# Run tests
npm test
```

## 📦 Features

### Admin Panel
- ✅ Product management
- ✅ Order management
- ✅ User management
- ✅ Category & brand management
- ✅ Real-time chat system
- ✅ Analytics dashboard
- ✅ Content management

### Storefront
- ✅ Product catalog
- ✅ Shopping cart
- ✅ Checkout process
- ✅ User authentication
- ✅ Order tracking
- ✅ Product reviews
- ✅ Wishlist
- ✅ Search & filters

### Technical Features
- ✅ RESTful API
- ✅ JWT Authentication
- ✅ WebSocket chat
- ✅ Payment integration (Stripe)
- ✅ Image uploads
- ✅ Responsive design
- ✅ Dark/Light theme

## 🚀 Deployment

### Production Setup

1. **Backend Deployment**:
   ```bash
   # Install production dependencies
   pip install gunicorn whitenoise

   # Collect static files
   python manage.py collectstatic

   # Run with Gunicorn
   gunicorn core.wsgi:application
   ```

2. **Frontend Deployment**:
   ```bash
   # Build for production
   npm run build

   # Serve with nginx or similar
   ```

### Environment Variables for Production

Set these environment variables:

```bash
DEBUG=False
SECRET_KEY=your-production-secret-key
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
DATABASE_URL=postgresql://user:password@localhost/dbname
```

## 🐛 Troubleshooting

### Common Issues

1. **Port Already in Use**:
   ```bash
# Kill process on port 8001
netstat -ano | findstr :8001
taskkill /PID <PID> /F
   ```

2. **Python Virtual Environment Issues**:
   ```bash
   # Recreate virtual environment
   rmdir /s venv
   python -m venv venv
   venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Node Modules Issues**:
   ```bash
   # Clear and reinstall
   rmdir /s node_modules
   del package-lock.json
   npm install
   ```

4. **Database Issues**:
   ```bash
   # Reset database
   del Backend\db.sqlite3
   python manage.py migrate
   python manage.py seed_admin
   ```

### Getting Help

- Check the console output for error messages
- Ensure both servers are running on correct ports
- Verify admin credentials: admin@example.com / admin123
- Check browser developer tools for network errors

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

**Happy Coding! 🎉**