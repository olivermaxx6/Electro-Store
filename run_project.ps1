# E-commerce Project Launcher
# This script runs both the Django backend and React frontend in separate PowerShell windows

param(
    [switch]$BackendOnly,
    [switch]$FrontendOnly,
    [switch]$InstallDeps
)

$ErrorActionPreference = "Stop"

Write-Host "=== E-commerce Project Launcher ===" -ForegroundColor Cyan
Write-Host "Starting project components..." -ForegroundColor Green

# Function to start a process in a new PowerShell window
function Start-InNewWindow {
    param(
        [string]$Title,
        [string]$WorkingDirectory,
        [string]$Command
    )
    
    $scriptBlock = {
        param($dir, $cmd, $title)
        Set-Location $dir
        $Host.UI.RawUI.WindowTitle = $title
        Write-Host "=== $title ===" -ForegroundColor Yellow
        Write-Host "Working Directory: $dir" -ForegroundColor Gray
        Write-Host "Command: $cmd" -ForegroundColor Gray
        Write-Host "----------------------------------------" -ForegroundColor Gray
        
        # Execute the command
        Invoke-Expression $cmd
    }
    
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "& { $($scriptBlock.ToString()) } $WorkingDirectory '$Command' '$Title'"
}

# Check if we need to install dependencies
if ($InstallDeps) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    
    # Install Python dependencies
    Write-Host "Installing Python dependencies..." -ForegroundColor Cyan
    Set-Location "Backend"
    python -m pip install --upgrade pip
    pip install -r requirements.txt
    Set-Location ".."
    
    # Install Node.js dependencies
    Write-Host "Installing Node.js dependencies..." -ForegroundColor Cyan
    Set-Location "Frontend"
    npm install
    Set-Location ".."
    
    Write-Host "Dependencies installed successfully!" -ForegroundColor Green
}

# Start Backend (Django)
if (-not $FrontendOnly) {
    Write-Host "Starting Django Backend..." -ForegroundColor Cyan
    
    # Check if Python is available
    try {
        $pythonVersion = python --version 2>&1
        Write-Host "Python version: $pythonVersion" -ForegroundColor Gray
    }
    catch {
        Write-Host "Error: Python is not installed or not in PATH" -ForegroundColor Red
        Write-Host "Please install Python 3.8+ and try again" -ForegroundColor Red
        exit 1
    }
    
    # Start Django backend
    $backendCommand = @"
# Stop anything on port 8001
try {
    `$pid = (Get-NetTCPConnection -LocalPort 8001 -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1).OwningProcess
    if (`$pid) { 
        Write-Host "Stopping existing process on port 8001 (PID: `$pid)" -ForegroundColor Yellow
        Stop-Process -Id `$pid -Force 
    }
} catch {
    Write-Host "No existing process found on port 8001" -ForegroundColor Gray
}

# Check Django setup
Write-Host "Checking Django setup..." -ForegroundColor Cyan
python manage.py check

# Run migrations
Write-Host "Running database migrations..." -ForegroundColor Cyan
python manage.py migrate

# Start Django development server
Write-Host "Starting Django server at http://127.0.0.1:8001..." -ForegroundColor Green
Write-Host "Backend API will be available at: http://127.0.0.1:8001" -ForegroundColor Green
python manage.py runserver 127.0.0.1:8001
"@
    
    Start-InNewWindow -Title "E-commerce Backend (Django)" -WorkingDirectory "$PWD\Backend" -Command $backendCommand
    Start-Sleep -Seconds 2
}

# Start Frontend (React)
if (-not $BackendOnly) {
    Write-Host "Starting React Frontend..." -ForegroundColor Cyan
    
    # Check if Node.js is available
    try {
        $nodeVersion = node --version 2>&1
        $npmVersion = npm --version 2>&1
        Write-Host "Node.js version: $nodeVersion" -ForegroundColor Gray
        Write-Host "npm version: $npmVersion" -ForegroundColor Gray
    }
    catch {
        Write-Host "Error: Node.js is not installed or not in PATH" -ForegroundColor Red
        Write-Host "Please install Node.js 16+ and try again" -ForegroundColor Red
        exit 1
    }
    
    # Start React frontend (both storefront and admin)
    $frontendCommand = @"
Write-Host "Starting React Development Server..." -ForegroundColor Cyan
Write-Host "This will start both Storefront and Admin Panel" -ForegroundColor Yellow

# Start both frontend applications
npm run dev:both

# If dev:both doesn't work, start them individually
# npm run dev:storefront
# npm run dev:admin
"@
    
    Start-InNewWindow -Title "E-commerce Frontend (React)" -WorkingDirectory "$PWD\Frontend" -Command $frontendCommand
}

Write-Host "----------------------------------------" -ForegroundColor Cyan
Write-Host "Project startup initiated!" -ForegroundColor Green
Write-Host "" -ForegroundColor White
Write-Host "Backend (Django):" -ForegroundColor Yellow
Write-Host "  - URL: http://127.0.0.1:8001" -ForegroundColor White
Write-Host "  - Admin: http://127.0.0.1:8001/admin" -ForegroundColor White
Write-Host "  - API: http://127.0.0.1:8001/api/" -ForegroundColor White
Write-Host "" -ForegroundColor White
Write-Host "Frontend (React):" -ForegroundColor Yellow
Write-Host "  - Storefront: http://localhost:5173" -ForegroundColor White
Write-Host "  - Admin Panel: http://localhost:5174" -ForegroundColor White
Write-Host "" -ForegroundColor White
Write-Host "Press Ctrl+C in each window to stop the servers" -ForegroundColor Gray
Write-Host "----------------------------------------" -ForegroundColor Cyan
