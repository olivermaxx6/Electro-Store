# PowerShell script to start React storefront
# This script will open in a new PowerShell window

Write-Host "Starting React Storefront..." -ForegroundColor Green

# Change to the Frontend directory
$frontendPath = Join-Path $PSScriptRoot "Frontend"
Set-Location $frontendPath

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "Node modules not found. Installing dependencies..." -ForegroundColor Yellow
    npm install
}

Write-Host "Starting storefront development server on port 5173..." -ForegroundColor Green
Write-Host "Storefront will be available at: http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "Features available:" -ForegroundColor Yellow
Write-Host "- Product catalog and browsing" -ForegroundColor White
Write-Host "- Shopping cart and checkout" -ForegroundColor White
Write-Host "- User authentication" -ForegroundColor White
Write-Host "- Order tracking" -ForegroundColor White
Write-Host "- Wishlist functionality" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Red

# Start the storefront development server
npm run dev:storefront
