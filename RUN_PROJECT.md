# 🚀 How to Run the E-commerce Project

This guide will help you get the entire e-commerce platform running on your local machine.

## 📋 Prerequisites

Before starting, ensure you have the following installed:

- **Python 3.8+** ([Download Python](https://www.python.org/downloads/))
- **Node.js 16+** ([Download Node.js](https://nodejs.org/))
- **Git** ([Download Git](https://git-scm.com/))
- **Code Editor** (VS Code recommended)

## 🏗️ Project Structure Overview

```
Ecommerce/
├── Backend/          # Django API Server (Port 8001)
├── Frontend/         # React Applications
│   ├── Storefront   # Customer-facing app (Port 5173)
│   └── Admin Panel  # Admin management app (Port 5174)
└── Documentation    # Project docs and guides
```

---

## ⚡ Quick Start (Automated)

### Option 1: PowerShell Script (Windows)
```powershell
# Navigate to project root
cd C:\Users\Junaid\Desktop\Ecommerce

# Run the automated setup script
.\run_project.ps1
```

### Option 2: Manual Setup
Follow the detailed steps below for complete control over the setup process.

---

## 🔧 Detailed Setup Instructions

### Step 1: Clone and Navigate to Project

```bash
# If cloning from repository
git clone <your-repository-url>
cd Ecommerce

# Or if already downloaded
cd C:\Users\Junaid\Desktop\Ecommerce
```

### Step 2: Backend Setup (Django API)

#### 2.1 Navigate to Backend Directory
```bash
cd Backend
```

#### 2.2 Create Virtual Environment
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

#### 2.3 Install Python Dependencies
```bash
pip install -r requirements.txt
```

#### 2.4 Database Setup
```bash
# Run migrations
python manage.py migrate

# Create superuser (admin account)
python manage.py createsuperuser
# Username: admin
# Email: admin@example.com
# Password: admin123
```

#### 2.5 Load Sample Data (Optional)
```bash
# Load initial data
python manage.py loaddata fixtures/initial_data.json

# Or create test data
python create_test_data.py
```

#### 2.6 Start Backend Server
```bash
# Development server
python manage.py runserver 8001

# Or use ASGI server (for WebSocket support)
python run_asgi_server.py
```

**✅ Backend is now running at: http://127.0.0.1:8001**

---

### Step 3: Frontend Setup (React Applications)

#### 3.1 Navigate to Frontend Directory
```bash
cd Frontend
```

#### 3.2 Install Node.js Dependencies
```bash
npm install
```

#### 3.3 Start Storefront (Customer-facing)
```bash
# In one terminal
npm run dev
```

**✅ Storefront is now running at: http://localhost:5173**

#### 3.4 Start Admin Panel (Management)
```bash
# In another terminal
npm run dev:admin
```

**✅ Admin Panel is now running at: http://localhost:5174**

---

## 🌐 Access Points

Once everything is running, you can access:

### 🛒 Storefront (Customer Experience)
- **URL**: http://localhost:5173
- **Features**: 
  - Browse products
  - Add to cart/wishlist
  - Checkout process
  - User account
  - Contact forms

### ⚙️ Admin Panel (Management)
- **URL**: http://localhost:5174
- **Login**: 
  - Username: `admin`
  - Password: `admin123`
- **Features**:
  - Product management
  - Order management
  - User management
  - Chat system
  - Analytics dashboard

### 🔌 API Endpoints
- **Public API**: http://127.0.0.1:8001/api/public/
- **Admin API**: http://127.0.0.1:8001/api/
- **Django Admin**: http://127.0.0.1:8001/admin/

---

## 🗄️ Database Management

### View Database
```bash
cd Backend
python manage.py shell
```

### Reset Database
```bash
# Clear all data
python manage.py flush

# Recreate database
rm db.sqlite3
python manage.py migrate
python manage.py createsuperuser
```

### Backup Database
```bash
# Create backup
python manage.py dumpdata > backup.json

# Restore backup
python manage.py loaddata backup.json
```

---

## 🔧 Development Commands

### Backend Commands
```bash
cd Backend

# Run server
python manage.py runserver 8001

# Run with ASGI (WebSocket support)
python run_asgi_server.py

# Run migrations
python manage.py migrate

# Create migrations
python manage.py makemigrations

# Create superuser
python manage.py createsuperuser

# Run tests
python manage.py test

# Check project health
python manage.py check
```

### Frontend Commands
```bash
cd Frontend

# Install dependencies
npm install

# Start storefront
npm run dev

# Start admin panel
npm run dev:admin

# Build for production
npm run build

# Build admin for production
npm run build:admin

# Run tests
npm test

# Lint code
npm run lint
```

---

## 🐛 Troubleshooting

### Common Issues and Solutions

#### Backend Issues

**❌ Port 8001 already in use**
```bash
# Find process using port 8001
netstat -ano | findstr :8001

# Kill the process (Windows)
taskkill /PID <process_id> /F

# Or use different port
python manage.py runserver 8002
```

**❌ Module not found errors**
```bash
# Ensure virtual environment is activated
venv\Scripts\activate  # Windows
source venv/bin/activate  # macOS/Linux

# Reinstall requirements
pip install -r requirements.txt
```

**❌ Database errors**
```bash
# Reset database
rm db.sqlite3
python manage.py migrate
python manage.py createsuperuser
```

#### Frontend Issues

**❌ Port 5173/5174 already in use**
```bash
# Kill Node.js processes
taskkill /f /im node.exe

# Or use different ports
npm run dev -- --port 5175
```

**❌ npm install fails**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules
npm install
```

**❌ Build errors**
```bash
# Check for TypeScript errors
npm run type-check

# Fix linting issues
npm run lint -- --fix
```

### WebSocket Issues

**❌ Chat not working**
```bash
# Ensure ASGI server is running
python run_asgi_server.py

# Check WebSocket health
curl http://127.0.0.1:8001/health/ws/
```

---

## 🔄 Development Workflow

### Daily Development
1. **Start Backend**: `python manage.py runserver 8001`
2. **Start Storefront**: `npm run dev` (Terminal 1)
3. **Start Admin**: `npm run dev:admin` (Terminal 2)
4. **Open Browser**: Navigate to http://localhost:5173

### Making Changes
1. **Backend Changes**: Server auto-reloads
2. **Frontend Changes**: Hot reload enabled
3. **Database Changes**: Run migrations
4. **New Dependencies**: Update requirements.txt

### Testing Changes
1. **Test Storefront**: http://localhost:5173
2. **Test Admin**: http://localhost:5174
3. **Test API**: http://127.0.0.1:8001/api/public/
4. **Test Chat**: Use admin chat feature

---

## 📊 Performance Monitoring

### Check Server Status
```bash
# Backend health
curl http://127.0.0.1:8001/api/public/store-settings/

# Frontend status
curl http://localhost:5173
```

### Monitor Resources
- **CPU Usage**: Task Manager / Activity Monitor
- **Memory Usage**: Check Python and Node.js processes
- **Network**: Monitor API calls in browser dev tools

---

## 🚀 Production Deployment

### Environment Variables
Create `.env` files:

**Backend/.env**
```env
DEBUG=False
SECRET_KEY=your_production_secret_key
ALLOWED_HOSTS=yourdomain.com
DATABASE_URL=postgresql://user:pass@localhost:5432/db
```

**Frontend/.env**
```env
VITE_API_BASE_URL=https://api.yourdomain.com
```

### Build for Production
```bash
# Backend
pip install gunicorn
gunicorn core.wsgi:application --bind 0.0.0.0:8000

# Frontend
npm run build
npm run build:admin
```

---

## 📞 Getting Help

### Debug Information
If you encounter issues, collect this information:

```bash
# System info
python --version
node --version
npm --version

# Project status
cd Backend && python manage.py check
cd Frontend && npm run type-check
```

### Log Files
- **Backend logs**: Check console output
- **Frontend logs**: Browser developer console
- **Database logs**: Django admin interface

### Support Resources
- Check `PROJECT_DOCUMENTATION.md` for detailed API docs
- Check `STRIPE_SETUP.md` for payment integration
- Review error messages in browser console
- Check Django server output for backend errors

---

## ✅ Success Checklist

After following this guide, you should have:

- ✅ Backend API running on http://127.0.0.1:8001
- ✅ Storefront running on http://localhost:5173
- ✅ Admin panel running on http://localhost:5174
- ✅ Database with sample data
- ✅ Admin account (admin/admin123)
- ✅ All features working (cart, wishlist, chat, etc.)

---

## 🎯 Next Steps

Once everything is running:

1. **Explore the Storefront**: Add products to cart, test checkout
2. **Use Admin Panel**: Manage products, view orders, chat with customers
3. **Test API**: Use Postman or curl to test endpoints
4. **Customize**: Modify products, categories, and content
5. **Deploy**: Follow production deployment guide when ready

---

**Happy Coding! 🚀**

*Last Updated: January 2025*