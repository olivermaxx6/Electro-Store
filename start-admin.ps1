# PowerShell script to start React admin panel
# This script will open in a new PowerShell window

Write-Host "Starting React Admin Panel..." -ForegroundColor Green

# Change to the Frontend directory
$frontendPath = Join-Path $PSScriptRoot "Frontend"
Set-Location $frontendPath

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "Node modules not found. Installing dependencies..." -ForegroundColor Yellow
    npm install
}

Write-Host "Starting admin panel development server on port 5174..." -ForegroundColor Green
Write-Host "Admin panel will be available at: http://localhost:5174" -ForegroundColor Cyan
Write-Host ""
Write-Host "Admin features available:" -ForegroundColor Yellow
Write-Host "- Product management" -ForegroundColor White
Write-Host "- Order management" -ForegroundColor White
Write-Host "- User management" -ForegroundColor White
Write-Host "- Category & brand management" -ForegroundColor White
Write-Host "- Real-time chat system" -ForegroundColor White
Write-Host "- Analytics dashboard" -ForegroundColor White
Write-Host ""
Write-Host "Default admin credentials:" -ForegroundColor Yellow
Write-Host "Email: admin@example.com" -ForegroundColor Yellow
Write-Host "Password: admin123" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Red

# Start the admin panel development server
npm run dev:admin
