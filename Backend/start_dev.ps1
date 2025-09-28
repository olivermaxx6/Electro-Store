# =============================================
# ELECTRO-STORE DEVELOPMENT ENVIRONMENT
# Django: 127.0.0.1:8001 | Admin: 5174 | Storefront: 5173
# =============================================

# Colors for output
$Green = "Green"
$Blue = "Blue"
$Yellow = "Yellow"
$Red = "Red"

Write-Host "=============================================" -ForegroundColor $Blue
Write-Host "ELECTRO-STORE DEVELOPMENT ENVIRONMENT" -ForegroundColor $Blue
Write-Host "=============================================" -ForegroundColor $Blue

# Get the directory where this script is located
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$BackendDir = $ScriptDir
$FrontendDir = Join-Path $ScriptDir "..\Frontend"

# Check if we're in the Backend directory
if (-not (Test-Path (Join-Path $BackendDir "manage.py"))) {
    Write-Host "Error: This script must be run from the Backend directory" -ForegroundColor $Red
    Write-Host "Current directory: $(Get-Location)" -ForegroundColor $Yellow
    Write-Host "Expected manage.py at: $(Join-Path $BackendDir 'manage.py')" -ForegroundColor $Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if Frontend directory exists
if (-not (Test-Path $FrontendDir)) {
    Write-Host "Warning: Frontend directory not found at $FrontendDir" -ForegroundColor $Yellow
    Write-Host "You'll need to start your frontend manually" -ForegroundColor $Yellow
}

Write-Host ""
Write-Host "Checking port availability..." -ForegroundColor $Yellow

# Function to check if a port is in use
function Test-Port {
    param([int]$Port)
    $connection = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    return $connection -ne $null
}

# Check port availability
if (Test-Port 8001) {
    Write-Host "❌ Port 8001 is already in use" -ForegroundColor $Red
    Write-Host "Please stop the service using port 8001 and try again" -ForegroundColor $Yellow
    Read-Host "Press Enter to exit"
    exit 1
} else {
    Write-Host "✅ Port 8001 is available" -ForegroundColor $Green
}

if (Test-Port 5173) {
    Write-Host "⚠️  Port 5173 (storefront) is in use" -ForegroundColor $Yellow
}

if (Test-Port 5174) {
    Write-Host "⚠️  Port 5174 (admin) is in use" -ForegroundColor $Yellow
}

# Start Django backend
Write-Host ""
Write-Host "Starting Django on 127.0.0.1:8001..." -ForegroundColor $Green

# Change to backend directory
Set-Location $BackendDir

# Check if virtual environment exists and activate it
$VenvPath = Join-Path $BackendDir "venv\Scripts\Activate.ps1"
$ParentVenvPath = Join-Path (Split-Path $BackendDir) "venv\Scripts\Activate.ps1"

if (Test-Path $VenvPath) {
    Write-Host "Activating virtual environment..." -ForegroundColor $Blue
    & $VenvPath
} elseif (Test-Path $ParentVenvPath) {
    Write-Host "Activating virtual environment..." -ForegroundColor $Blue
    & $ParentVenvPath
}

# Start Django server
Write-Host "Starting Django server..." -ForegroundColor $Blue
$DjangoProcess = Start-Process -FilePath "python" -ArgumentList "manage.py", "runserver", "127.0.0.1:8001" -PassThru -WindowStyle Hidden

# Wait for Django to start
Write-Host "Waiting for Django to start..." -ForegroundColor $Blue
Start-Sleep -Seconds 5

# Check if Django started successfully
if (-not $DjangoProcess.HasExited) {
    Write-Host "✅ Django running on http://127.0.0.1:8001" -ForegroundColor $Green
} else {
    Write-Host "❌ Django failed to start" -ForegroundColor $Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Display connection information
Write-Host ""
Write-Host "=============================================" -ForegroundColor $Blue
Write-Host "DEVELOPMENT ENVIRONMENT READY" -ForegroundColor $Blue
Write-Host "=============================================" -ForegroundColor $Blue
Write-Host "Backend API: http://127.0.0.1:8001/api/" -ForegroundColor $Green
Write-Host "Django Admin: http://127.0.0.1:8001/admin/" -ForegroundColor $Green
Write-Host "Health Check: http://127.0.0.1:8001/health/" -ForegroundColor $Green

Write-Host ""
Write-Host "📋 Start your frontends manually:" -ForegroundColor $Yellow
if (Test-Path $FrontendDir) {
    Write-Host "   Storefront: cd '$FrontendDir' && npm run dev (port 5173)" -ForegroundColor $Blue
    Write-Host "   Admin: cd '$FrontendDir' && npm run dev:admin (port 5174)" -ForegroundColor $Blue
} else {
    Write-Host "   Frontend directory not found at: $FrontendDir" -ForegroundColor $Yellow
    Write-Host "   Please start your frontend manually" -ForegroundColor $Yellow
}

Write-Host ""
Write-Host "🔧 Useful commands:" -ForegroundColor $Yellow
Write-Host "   Create superuser: python manage.py createsuperuser" -ForegroundColor $Blue
Write-Host "   Run migrations: python manage.py migrate" -ForegroundColor $Blue
Write-Host "   Collect static: python manage.py collectstatic" -ForegroundColor $Blue

Write-Host ""
Write-Host "Press Ctrl+C to stop all services" -ForegroundColor $Yellow

# Wait for user input
try {
    Read-Host "Press Enter to stop Django server"
} catch {
    # Handle Ctrl+C
}

# Cleanup
Write-Host ""
Write-Host "Stopping Django server..." -ForegroundColor $Yellow
Stop-Process -Id $DjangoProcess.Id -Force -ErrorAction SilentlyContinue
Write-Host "✅ Django server stopped" -ForegroundColor $Green
