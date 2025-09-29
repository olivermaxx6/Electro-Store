# Electro Store - Start Admin Panel Only
# This script starts only the React admin panel

Write-Host "⚙️ Starting Electro Store Admin Panel..." -ForegroundColor Green
Write-Host ""

# Change to frontend directory
Set-Location "D:\Electro-Store\Frontend"

# Start admin panel development server
Write-Host "Starting React admin panel development server..." -ForegroundColor Yellow
Write-Host "Admin Panel will be available at: http://localhost:5174" -ForegroundColor Cyan
Write-Host ""
Write-Host "Default Admin Credentials:" -ForegroundColor Yellow
Write-Host "   Email: admin@example.com" -ForegroundColor White
Write-Host "   Password: admin123" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Gray
Write-Host ""

npm run dev:admin
