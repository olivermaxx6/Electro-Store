# Electro Store - Start Storefront Only
# This script starts only the React storefront

Write-Host "🛒 Starting Electro Store Storefront..." -ForegroundColor Green
Write-Host ""

# Change to frontend directory
Set-Location "D:\Electro-Store\Frontend"

# Start storefront development server
Write-Host "Starting React storefront development server..." -ForegroundColor Yellow
Write-Host "Storefront will be available at: http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Gray
Write-Host ""

npm run dev:storefront
