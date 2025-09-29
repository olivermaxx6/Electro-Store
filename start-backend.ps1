# Electro Store - Start Backend Only
# This script starts only the Django backend server

Write-Host "📡 Starting Electro Store Backend Server..." -ForegroundColor Green
Write-Host ""

# Change to backend directory
Set-Location "D:\Electro-Store\Backend"

# Activate virtual environment
Write-Host "Activating Python virtual environment..." -ForegroundColor Yellow
.\venv\Scripts\Activate.ps1

# Start Django server
Write-Host "Starting Django development server..." -ForegroundColor Yellow
Write-Host "Backend will be available at: http://127.0.0.1:8001" -ForegroundColor Cyan
Write-Host "Django Admin will be available at: http://127.0.0.1:8001/admin/" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Gray
Write-Host ""

python manage.py runserver 127.0.0.1:8001
