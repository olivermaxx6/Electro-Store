# PowerShell script to start the entire Electro E-commerce project
# This script will open multiple PowerShell windows for different services

Write-Host "Starting Electro E-commerce Platform..." -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green

# Get the current script directory
$scriptPath = $PSScriptRoot

# Start Backend Server
Write-Host "Starting Backend Server (Django)..." -ForegroundColor Yellow
$backendScript = Join-Path $scriptPath "start-backend.ps1"
Start-Process powershell -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-File", $backendScript

# Wait a moment for backend to initialize
Start-Sleep -Seconds 3

# Start Storefront
Write-Host "Starting Storefront (React)..." -ForegroundColor Yellow
$frontendScript = Join-Path $scriptPath "start-frontend.ps1"
Start-Process powershell -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-File", $frontendScript

# Wait a moment for storefront to initialize
Start-Sleep -Seconds 2

# Start Admin Panel
Write-Host "Starting Admin Panel (React)..." -ForegroundColor Yellow
$adminScript = Join-Path $scriptPath "start-admin.ps1"
Start-Process powershell -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-File", $adminScript

# Wait a moment for admin panel to initialize
Start-Sleep -Seconds 2

Write-Host ""
Write-Host "All services are starting up!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Access URLs:" -ForegroundColor Cyan
Write-Host "• Storefront:     http://localhost:5173" -ForegroundColor White
Write-Host "• Admin Panel:    http://localhost:5174" -ForegroundColor White
Write-Host "• Backend API:    http://127.0.0.1:8001" -ForegroundColor White
Write-Host "• Django Admin:   http://127.0.0.1:8001/admin/" -ForegroundColor White
Write-Host ""
Write-Host "Default Admin Credentials:" -ForegroundColor Yellow
Write-Host "• Email:    admin@example.com" -ForegroundColor White
Write-Host "• Password: admin123" -ForegroundColor White
Write-Host ""
Write-Host "Services Status:" -ForegroundColor Cyan
Write-Host "• Backend Server  - Starting in separate window" -ForegroundColor Green
Write-Host "• Storefront      - Starting in separate window" -ForegroundColor Green
Write-Host "• Admin Panel     - Starting in separate window" -ForegroundColor Green
Write-Host ""
Write-Host "Please wait 10-15 seconds for all services to fully start." -ForegroundColor Yellow
Write-Host "Each service runs in its own PowerShell window for easy monitoring." -ForegroundColor Gray
Write-Host ""
Write-Host "Press any key to exit this launcher..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
