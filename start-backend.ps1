# PowerShell script to start Django backend server
# This script will open in a new PowerShell window

Write-Host "Starting Django Backend Server..." -ForegroundColor Green

# Change to the Backend directory
$backendPath = Join-Path $PSScriptRoot "Backend"
Set-Location $backendPath

# Check if virtual environment exists
if (Test-Path "venv") {
    Write-Host "Activating virtual environment..." -ForegroundColor Yellow
    & ".\venv\Scripts\Activate.ps1"
} else {
    Write-Host "Virtual environment not found. Creating one..." -ForegroundColor Yellow
    python -m venv venv
    & ".\venv\Scripts\Activate.ps1"
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    pip install -r requirements.txt
}

# Run migrations
Write-Host "Running database migrations..." -ForegroundColor Yellow
python manage.py migrate

# Start the Django development server
Write-Host "Starting Django server on 127.0.0.1:8001..." -ForegroundColor Green
Write-Host "Backend API will be available at: http://127.0.0.1:8001" -ForegroundColor Cyan
Write-Host "Django Admin will be available at: http://127.0.0.1:8001/admin/" -ForegroundColor Cyan
Write-Host ""
Write-Host "Default admin credentials:" -ForegroundColor Yellow
Write-Host "Email: admin@example.com" -ForegroundColor Yellow
Write-Host "Password: admin123" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Red

# Use the existing Python script to start Django
python scripts/run_django_dev.py
