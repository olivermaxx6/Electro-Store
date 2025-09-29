@echo off
echo 🚀 Starting Electro Store E-commerce Platform...
echo.

echo 📡 Starting Backend Server (Django)...
start "Backend Server" powershell -NoExit -Command "cd 'D:\Electro-Store\Backend'; .\venv\Scripts\Activate.ps1; python manage.py runserver 127.0.0.1:8001"

timeout /t 3 /nobreak >nul

echo 🛒 Starting Storefront (React)...
start "Storefront" powershell -NoExit -Command "cd 'D:\Electro-Store\Frontend'; npm run dev:storefront"

timeout /t 3 /nobreak >nul

echo ⚙️ Starting Admin Panel (React)...
start "Admin Panel" powershell -NoExit -Command "cd 'D:\Electro-Store\Frontend'; npm run dev:admin"

echo.
echo ✅ All services are starting up!
echo.
echo 🌐 Access URLs:
echo    Storefront:  http://localhost:5173
echo    Admin Panel: http://localhost:5174
echo    Backend API: http://127.0.0.1:8001
echo    Django Admin: http://127.0.0.1:8001/admin/
echo.
echo 👤 Default Admin Credentials:
echo    Email: admin@example.com
echo    Password: admin123
echo.
pause
