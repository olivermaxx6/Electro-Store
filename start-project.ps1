# PowerShell script to start both backend and frontend servers
# Run this script from the project root directory

# Set execution policy for this session
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force

Write-Host "Starting Ecommerce Project..." -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green

# Check if we're in the right directory
if (-not (Test-Path "Backend/manage.py") -or -not (Test-Path "Frontend/package.json")) {
    Write-Host "Error: Please run this script from the project root directory" -ForegroundColor Red
    Write-Host "   Expected to find: Backend/manage.py and Frontend/package.json" -ForegroundColor Yellow
    Write-Host "   Current directory: $PWD" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Function to start backend
function Start-Backend {
    Write-Host "Starting Backend Server..." -ForegroundColor Cyan
    
    $backendPath = Join-Path $PWD "Backend"
    Set-Location $backendPath
    
    # Check if virtual environment exists
    if (-not (Test-Path "venv")) {
        Write-Host "   Virtual environment not found. Creating one..." -ForegroundColor Yellow
        try {
            python -m venv venv
            Write-Host "   Virtual environment created" -ForegroundColor Green
        } catch {
            Write-Host "   Failed to create virtual environment" -ForegroundColor Red
            Set-Location ".."
            return $false
        }
    }
    
    # Install/update dependencies
    Write-Host "   Installing/updating dependencies..." -ForegroundColor Yellow
    try {
        & ".\venv\Scripts\Activate.ps1"
        pip install --upgrade pip
        pip install -r requirements.txt
        pip install setuptools django-filter
        Write-Host "   Dependencies installed successfully" -ForegroundColor Green
    } catch {
        Write-Host "   Warning: Some dependencies may not have installed properly" -ForegroundColor Yellow
    }
    
    # Start backend in new PowerShell window
    $command = "cd '$backendPath'; & '.\venv\Scripts\Activate.ps1'; python manage.py runserver 8001"
    try {
        Start-Process powershell -ArgumentList "-NoExit", "-Command", $command
        Write-Host "   Backend server starting in new window" -ForegroundColor Green
        Set-Location ".."
        return $true
    } catch {
        Write-Host "   Failed to start backend server" -ForegroundColor Red
        Set-Location ".."
        return $false
    }
}

# Function to start storefront
function Start-Storefront {
    Write-Host "Starting Storefront Server..." -ForegroundColor Cyan
    
    $frontendPath = Join-Path $PWD "Frontend"
    Set-Location $frontendPath
    
    # Check if node_modules exists
    if (-not (Test-Path "node_modules")) {
        Write-Host "   Node modules not found. Installing..." -ForegroundColor Yellow
        try {
            npm install
            Write-Host "   Dependencies installed" -ForegroundColor Green
        } catch {
            Write-Host "   Failed to install dependencies" -ForegroundColor Red
            Set-Location ".."
            return $false
        }
    }
    
    # Start storefront in new PowerShell window
    $command = "cd '$frontendPath'; npm run dev:storefront"
    try {
        Start-Process powershell -ArgumentList "-NoExit", "-Command", $command
        Write-Host "   Storefront server starting in new window" -ForegroundColor Green
        Set-Location ".."
        return $true
    } catch {
        Write-Host "   Failed to start storefront server" -ForegroundColor Red
        Set-Location ".."
        return $false
    }
}

# Function to start admin panel
function Start-AdminPanel {
    Write-Host "Starting Admin Panel Server..." -ForegroundColor Cyan
    
    $frontendPath = Join-Path $PWD "Frontend"
    Set-Location $frontendPath
    
    # Check if node_modules exists
    if (-not (Test-Path "node_modules")) {
        Write-Host "   Node modules not found. Installing..." -ForegroundColor Yellow
        try {
            npm install
            Write-Host "   Dependencies installed" -ForegroundColor Green
        } catch {
            Write-Host "   Failed to install dependencies" -ForegroundColor Red
            Set-Location ".."
            return $false
        }
    }
    
    # Start admin panel in new PowerShell window
    $command = "cd '$frontendPath'; npm run dev:admin"
    try {
        Start-Process powershell -ArgumentList "-NoExit", "-Command", $command
        Write-Host "   Admin panel server starting in new window" -ForegroundColor Green
        Set-Location ".."
        return $true
    } catch {
        Write-Host "   Failed to start admin panel server" -ForegroundColor Red
        Set-Location ".."
        return $false
    }
}

# Start all servers
Write-Host ""
Write-Host "Initializing servers..." -ForegroundColor Magenta

$backendStarted = Start-Backend
Start-Sleep -Seconds 3

$storefrontStarted = Start-Storefront
Start-Sleep -Seconds 2

$adminStarted = Start-AdminPanel

Write-Host ""
Write-Host "Servers are starting..." -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green
Write-Host "Backend:     http://127.0.0.1:8001" -ForegroundColor Yellow
Write-Host "Storefront:  http://localhost:5173" -ForegroundColor Yellow
Write-Host "Admin Panel: http://localhost:5174" -ForegroundColor Yellow
Write-Host "Admin Login: admin@example.com / admin123" -ForegroundColor Cyan
Write-Host ""
Write-Host "Note: Three PowerShell windows will open for each server" -ForegroundColor White
Write-Host "   Close those windows to stop the servers" -ForegroundColor White
Write-Host ""
Write-Host "Waiting for servers to fully initialize..." -ForegroundColor Magenta
Start-Sleep -Seconds 5

if (-not $backendStarted) {
    Write-Host "Backend server failed to start" -ForegroundColor Yellow
}
if (-not $storefrontStarted) {
    Write-Host "Storefront server failed to start" -ForegroundColor Yellow
}
if (-not $adminStarted) {
    Write-Host "Admin panel server failed to start" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Setup complete! Check the individual PowerShell windows for any errors." -ForegroundColor Green
Write-Host "If you see any issues, please check the console output in those windows." -ForegroundColor White

Read-Host "Press Enter to exit"