# 🚀 Quick Start Guide

## One-Command Setup

### Windows (PowerShell)
```powershell
.\setup-project.ps1
```

### Windows (Command Prompt)
```cmd
setup-project.bat
```

## Start the Project

### Windows (PowerShell)
```powershell
.\start-project.ps1
```

### Windows (Command Prompt)
```cmd
start-project.bat
```

## Access the Application

- **Storefront**: http://localhost:5173
- **Admin Panel**: http://localhost:5174
- **Backend API**: http://127.0.0.1:8001

## Admin Login

- **Email**: admin@example.com
- **Password**: admin123

## Individual Servers

### Backend Only
```powershell
.\start-backend.ps1
```

### Storefront Only
```powershell
.\start-frontend.ps1
```

### Admin Panel Only
```powershell
.\start-admin.ps1
```

## Troubleshooting

### Port Already in Use
```powershell
# Kill process on port 8001
netstat -ano | findstr :8001
taskkill /PID <PID> /F

# Kill process on port 5173
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Kill process on port 5174
netstat -ano | findstr :5174
taskkill /PID <PID> /F
```

### Reset Everything
```powershell
# Delete virtual environment
Remove-Item -Recurse -Force Backend\venv

# Delete node modules
Remove-Item -Recurse -Force Frontend\node_modules

# Run setup again
.\setup-project.ps1
```

---

**That's it! Your ecommerce platform is ready to go! 🎉**
