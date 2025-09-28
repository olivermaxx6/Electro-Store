# Master Setup Script for Electro-Store (Windows PowerShell)
Write-Host "🚀 Electro-Store Setup Script" -ForegroundColor Magenta
Write-Host "================================" -ForegroundColor Magenta

# Change to Backend directory
Set-Location "D:\Electro-Store\Backend"

# Run sections in order
Write-Host "`n📦 Running Section 1: Install Python Packages..." -ForegroundColor Yellow
& ".\section1.ps1"

Write-Host "`n📦 Running Section 2: Install MySQL Packages..." -ForegroundColor Yellow
& ".\section2.ps1"

Write-Host "`n📦 Running Section 3: MySQL Database Setup..." -ForegroundColor Yellow
& ".\section3.ps1"

Write-Host "`n📦 Running Section 4: Update Django Settings..." -ForegroundColor Yellow
& ".\section4.ps1"

Write-Host "`n📦 Running Section 5: Test MySQL Connection..." -ForegroundColor Yellow
& ".\section5.ps1"

Write-Host "`n📦 Running Section 6: Create Database Tables..." -ForegroundColor Yellow
& ".\section6.ps1"

Write-Host "`n📦 Running Section 7: Import Data..." -ForegroundColor Yellow
& ".\section7.ps1"

Write-Host "`n📦 Running Section 8: Test Multi-Port Setup..." -ForegroundColor Yellow
& ".\section8.ps1"

Write-Host "`n🎉 Setup Complete!" -ForegroundColor Green
Write-Host "Your Electro-Store is ready to use!" -ForegroundColor Green
Write-Host "`nTo start the server, run:" -ForegroundColor Cyan
Write-Host "python manage.py runserver 127.0.0.1:8001" -ForegroundColor White
