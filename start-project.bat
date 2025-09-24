@echo off
echo 🚀 Starting Electro E-commerce Platform...
echo ================================================

REM Start Backend Server
echo 📡 Starting Backend Server (Django)...
start "Backend Server" powershell -NoExit -ExecutionPolicy Bypass -File "%~dp0start-backend.ps1"

REM Wait a moment for backend to initialize
timeout /t 3 /nobreak > nul

REM Start Storefront
echo 🛍️  Starting Storefront (React)...
start "Storefront" powershell -NoExit -ExecutionPolicy Bypass -File "%~dp0start-frontend.ps1"

REM Wait a moment for storefront to initialize
timeout /t 2 /nobreak > nul

REM Start Admin Panel
echo ⚙️  Starting Admin Panel (React)...
start "Admin Panel" powershell -NoExit -ExecutionPolicy Bypass -File "%~dp0start-admin.ps1"

echo.
echo ✅ All services are starting up!
echo ================================================
echo.
echo 🌐 Access URLs:
echo • Storefront:     http://localhost:5173
echo • Admin Panel:    http://localhost:5174
echo • Backend API:    http://127.0.0.1:8001
echo • Django Admin:   http://127.0.0.1:8001/admin/
echo.
echo 👤 Default Admin Credentials:
echo • Email:    admin@example.com
echo • Password: admin123
echo.
echo ⏱️  Please wait 10-15 seconds for all services to fully start.
echo 💡 Each service runs in its own window for easy monitoring.
echo.
pause
