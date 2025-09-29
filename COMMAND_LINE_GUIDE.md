# 🚀 Electro Store - Command Line Guide

This guide provides step-by-step instructions for running the Electro Store e-commerce platform using command-line tools.

## 📋 Prerequisites

Before running the project, ensure you have the following installed:

- **Python 3.8+** - [Download here](https://www.python.org/downloads/)
- **Node.js 16+** - [Download here](https://nodejs.org/)
- **Git** - [Download here](https://git-scm.com/)

## 🏗️ Project Structure

```
Electro-Store/
├── Backend/          # Django REST API
├── Frontend/         # React applications (Storefront + Admin)
├── start-*.ps1       # PowerShell startup scripts
├── start-*.bat       # Batch startup scripts
└── requirements.txt  # Python dependencies
```

## 🚀 Quick Start (Recommended)

### Option 1: Use PowerShell Scripts (Windows)

```powershell
# Navigate to project directory
cd "D:\Electro-Store"

# Start all services at once
.\start-project.ps1
```

This will open 3 separate PowerShell windows:
- Backend server (Django) on port 8001
- Storefront (React) on port 5173  
- Admin panel (React) on port 5174

### Option 2: Use Batch Scripts (Windows)

```cmd
# Navigate to project directory
cd "D:\Electro-Store"

# Start all services at once
start-project.bat
```

## 🔧 Manual Setup & Run

### Step 1: Backend Setup (Django)

```powershell
# Navigate to backend directory
cd Backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows PowerShell:
.\venv\Scripts\Activate.ps1
# Windows Command Prompt:
venv\Scripts\activate.bat
# Linux/Mac:
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Run database migrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser

# Start Django development server
python manage.py runserver 127.0.0.1:8001
```

### Step 2: Frontend Setup (React)

Open a new terminal window:

```powershell
# Navigate to frontend directory
cd Frontend

# Install Node.js dependencies
npm install

# Start storefront development server
npm run dev:storefront
# OR start admin panel
npm run dev:admin
# OR start both simultaneously
npm run dev:both
```

## 🎯 Individual Service Commands

### Backend Only

```powershell
# Using PowerShell script
.\start-backend.ps1

# Or manually:
cd Backend
.\venv\Scripts\Activate.ps1
python manage.py runserver 127.0.0.1:8001
```

### Storefront Only

```powershell
# Using PowerShell script
.\start-frontend.ps1

# Or manually:
cd Frontend
npm run dev:storefront
```

### Admin Panel Only

```powershell
# Using PowerShell script
.\start-admin.ps1

# Or manually:
cd Frontend
npm run dev:admin
```

## 🌐 Access URLs

Once all services are running:

- **Storefront**: http://localhost:5173
- **Admin Panel**: http://localhost:5174
- **Backend API**: http://127.0.0.1:8001
- **Django Admin**: http://127.0.0.1:8001/admin/

## 🔐 Default Admin Credentials

- **Email**: admin@example.com
- **Password**: admin123

## 🛠️ Development Commands

### Backend Commands

```powershell
# Navigate to backend
cd Backend
.\venv\Scripts\Activate.ps1

# Database operations
python manage.py makemigrations
python manage.py migrate
python manage.py migrate --fake-initial

# Create test data
python create_test_data.py
python seed_database.py

# Run tests
python manage.py test

# Django shell
python manage.py shell

# Collect static files
python manage.py collectstatic

# Check for issues
python manage.py check
```

### Frontend Commands

```powershell
# Navigate to frontend
cd Frontend

# Development servers
npm run dev:storefront    # Storefront only
npm run dev:admin         # Admin panel only
npm run dev:both          # Both applications

# Build for production
npm run build:storefront  # Build storefront
npm run build:admin       # Build admin panel
npm run build:both        # Build both

# Preview production builds
npm run preview:storefront
npm run preview:admin

# Code quality
npm run lint              # Run ESLint
```

## 🔧 Troubleshooting

### Port Already in Use

```powershell
# Find process using port 8001 (Backend)
netstat -ano | findstr :8001
taskkill /PID <PID_NUMBER> /F

# Find process using port 5173 (Storefront)
netstat -ano | findstr :5173
taskkill /PID <PID_NUMBER> /F

# Find process using port 5174 (Admin Panel)
netstat -ano | findstr :5174
taskkill /PID <PID_NUMBER> /F
```

### Reset Everything

```powershell
# Stop all services (Ctrl+C in each terminal)

# Remove virtual environment
Remove-Item -Recurse -Force Backend\venv

# Remove node modules
Remove-Item -Recurse -Force Frontend\node_modules

# Remove Python cache
Remove-Item -Recurse -Force Backend\__pycache__
Remove-Item -Recurse -Force Backend\*\__pycache__

# Start fresh
.\start-project.ps1
```

### Common Issues

#### 1. PowerShell Execution Policy Error
```powershell
# Allow script execution
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

#### 2. Python Virtual Environment Issues
```powershell
# Recreate virtual environment
cd Backend
Remove-Item -Recurse -Force venv
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

#### 3. Node.js Dependencies Issues
```powershell
# Clear npm cache and reinstall
cd Frontend
npm cache clean --force
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

#### 4. Database Issues
```powershell
# Reset database
cd Backend
.\venv\Scripts\Activate.ps1
python manage.py migrate
python manage.py createsuperuser
```

## 📊 Monitoring & Logs

### Backend Logs
```powershell
# Django logs are in Backend/logs/django.log
Get-Content Backend\logs\django.log -Tail 50 -Wait
```

### Check Service Status
```powershell
# Check if ports are listening
netstat -an | findstr "8001\|5173\|5174"

# Test API endpoints
curl http://127.0.0.1:8001/api/
curl http://localhost:5173
curl http://localhost:5174
```

## 🚀 Production Deployment

### Backend Production
```powershell
cd Backend
.\venv\Scripts\Activate.ps1

# Install production dependencies
pip install gunicorn

# Collect static files
python manage.py collectstatic --noinput

# Run with Gunicorn
gunicorn core.wsgi:application --bind 0.0.0.0:8001
```

### Frontend Production
```powershell
cd Frontend

# Build for production
npm run build:both

# Serve with a web server (nginx, Apache, etc.)
# Files are in dist/ directory
```

## 📝 Environment Variables

Create `.env` file in Backend directory:

```env
# Django Settings
DEBUG=True
SECRET_KEY=your-secret-key-here
ALLOWED_HOSTS=localhost,127.0.0.1

# Database (optional - defaults to MySQL)
# DATABASE_URL=postgresql://user:password@localhost/dbname

# Stripe (for payments)
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# Redis (for WebSocket)
REDIS_URL=redis://localhost:6379/0
```

## 🎉 Success!

Once everything is running, you should see:

1. **Backend**: Django server running on http://127.0.0.1:8001
2. **Storefront**: React app running on http://localhost:5173
3. **Admin Panel**: React app running on http://localhost:5174

The application includes:
- ✅ Product catalog and browsing
- ✅ Shopping cart and checkout
- ✅ User authentication
- ✅ Order management
- ✅ Admin dashboard
- ✅ Real-time chat system
- ✅ Payment processing (Stripe)
- ✅ WebSocket support

---

**Need help?** Check the logs in each terminal window or refer to the troubleshooting section above.
