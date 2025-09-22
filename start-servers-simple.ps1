# Simple server startup script
Write-Host "Starting Ecommerce Project Servers..." -ForegroundColor Green

# Start Backend
Write-Host "Starting Backend Server..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd Backend; .\venv\Scripts\Activate.ps1; python manage.py runserver 127.0.0.1:8001"

Start-Sleep -Seconds 3

# Start Storefront
Write-Host "Starting Storefront Server..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd Frontend; npm run dev:storefront"

Start-Sleep -Seconds 2

# Start Admin Panel
Write-Host "Starting Admin Panel Server..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd Frontend; npm run dev:admin"

Write-Host ""
Write-Host "Servers starting in separate windows..." -ForegroundColor Green
Write-Host "Backend: http://127.0.0.1:8001" -ForegroundColor Yellow
Write-Host "Storefront: http://localhost:5173" -ForegroundColor Yellow
Write-Host "Admin Panel: http://localhost:5174" -ForegroundColor Yellow
Write-Host ""
Write-Host "Wait a few moments for servers to fully start..." -ForegroundColor Magenta

Read-Host "Press Enter to exit"
