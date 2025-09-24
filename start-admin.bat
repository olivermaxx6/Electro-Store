@echo off
echo Starting React Admin Panel...
cd /d "%~dp0Frontend"

REM Check if node_modules exists
if not exist "node_modules" (
    echo Node modules not found. Installing dependencies...
    npm install
)

echo Starting admin panel development server on port 5174...
echo Admin panel will be available at: http://localhost:5174
echo.
echo Admin features available:
echo - Product management
echo - Order management
echo - User management
echo - Category & brand management
echo - Real-time chat system
echo - Analytics dashboard
echo.
echo Default admin credentials:
echo Email: admin@example.com
echo Password: admin123
echo.
echo Press Ctrl+C to stop the server

REM Start the admin panel development server
npm run dev:admin
pause
