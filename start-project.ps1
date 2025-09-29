# Electro Store - Start All Services
# This script starts the backend, storefront, and admin panel

Write-Host "🚀 Starting Electro Store E-commerce Platform..." -ForegroundColor Green
Write-Host ""

# Start Backend (Django)
Write-Host "📡 Starting Backend Server (Django)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'D:\Electro-Store\Backend'; .\venv\Scripts\Activate.ps1; python manage.py runserver 127.0.0.1:8001"

# Wait a moment for backend to start
Start-Sleep -Seconds 3

# Start Storefront (React)
Write-Host "🛒 Starting Storefront (React)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'D:\Electro-Store\Frontend'; npm run dev:storefront"

# Wait a moment for storefront to start
Start-Sleep -Seconds 3

# Start Admin Panel (React)
Write-Host "⚙️ Starting Admin Panel (React)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'D:\Electro-Store\Frontend'; npm run dev:admin"

Write-Host ""
Write-Host "✅ All services are starting up!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Access URLs:" -ForegroundColor Cyan
Write-Host "   Storefront:  http://localhost:5173" -ForegroundColor White
Write-Host "   Admin Panel: http://localhost:5174" -ForegroundColor White
Write-Host "   Backend API: http://127.0.0.1:8001" -ForegroundColor White
Write-Host "   Django Admin: http://127.0.0.1:8001/admin/" -ForegroundColor White
Write-Host ""
Write-Host "👤 Default Admin Credentials:" -ForegroundColor Cyan
Write-Host "   Email: admin@example.com" -ForegroundColor White
Write-Host "   Password: admin123" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to exit this script..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
