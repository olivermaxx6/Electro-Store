# PowerShell script to start both backend and frontend servers
# Run this script from the project root directory
# Updated with WebSocket support and improved error handling

# Set execution policy for this session
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force

Write-Host ""
Write-Host "🚀 ECOMMERCE PROJECT STARTUP SCRIPT" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green
Write-Host "📡 Backend: Django + ASGI with WebSocket support" -ForegroundColor Cyan
Write-Host "🛒 Frontend: React + Vite (Storefront & Admin Panel)" -ForegroundColor Cyan
Write-Host "💬 Real-time Chat: WebSocket-enabled admin communication" -ForegroundColor Magenta
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "Backend/manage.py") -or -not (Test-Path "Frontend/package.json")) {
    Write-Host "❌ ERROR: Please run this script from the project root directory" -ForegroundColor Red
    Write-Host "   Expected to find: Backend/manage.py and Frontend/package.json" -ForegroundColor Yellow
    Write-Host "   Current directory: $PWD" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "✅ Project structure verified" -ForegroundColor Green
Write-Host ""

# Function to start backend
function Start-Backend {
    Write-Host "🔧 Starting Backend Server (Django + ASGI)..." -ForegroundColor Cyan
    
    $backendPath = Join-Path $PWD "Backend"
    Set-Location $backendPath
    
    # Check if virtual environment exists
    if (-not (Test-Path "venv")) {
        Write-Host "   📦 Virtual environment not found. Creating one..." -ForegroundColor Yellow
        try {
            python -m venv venv
            Write-Host "   ✅ Virtual environment created successfully" -ForegroundColor Green
        } catch {
            Write-Host "   ❌ Failed to create virtual environment" -ForegroundColor Red
            Set-Location ".."
            return $false
        }
    } else {
        Write-Host "   ✅ Virtual environment found" -ForegroundColor Green
    }
    
    # Install/update dependencies
    Write-Host "   📦 Installing/updating dependencies..." -ForegroundColor Yellow
    try {
        & ".\venv\Scripts\Activate.ps1"
        pip install --upgrade pip
        pip install -r requirements.txt
        Write-Host "   ✅ Dependencies installed successfully" -ForegroundColor Green
        Write-Host "   🔌 WebSocket libraries: uvicorn, websockets, wsproto" -ForegroundColor Cyan
        Write-Host "   🔐 Encryption: cryptography" -ForegroundColor Cyan
    } catch {
        Write-Host "   ⚠️  Warning: Some dependencies may not have installed properly" -ForegroundColor Yellow
        Write-Host "   💡 Try running: pip install -r requirements.txt manually" -ForegroundColor White
    }
    
    # Start backend in new PowerShell window with ASGI server for WebSocket support
    $command = "cd '$backendPath'; & '.\venv\Scripts\Activate.ps1'; python run_asgi_server.py"
    try {
        Start-Process powershell -ArgumentList "-NoExit", "-Command", $command
        Write-Host "   🚀 Backend ASGI server starting in new window" -ForegroundColor Green
        Write-Host "   📡 WebSocket endpoints will be available" -ForegroundColor Magenta
        Set-Location ".."
        return $true
    } catch {
        Write-Host "   ❌ Failed to start backend server" -ForegroundColor Red
        Set-Location ".."
        return $false
    }
}

# Function to start storefront
function Start-Storefront {
    Write-Host "🛒 Starting Storefront Server (React + Vite)..." -ForegroundColor Cyan
    
    $frontendPath = Join-Path $PWD "Frontend"
    Set-Location $frontendPath
    
    # Check if node_modules exists
    if (-not (Test-Path "node_modules")) {
        Write-Host "   📦 Node modules not found. Installing..." -ForegroundColor Yellow
        try {
            npm install
            Write-Host "   ✅ Dependencies installed successfully" -ForegroundColor Green
        } catch {
            Write-Host "   ❌ Failed to install dependencies" -ForegroundColor Red
            Write-Host "   💡 Try running: npm install manually" -ForegroundColor White
            Set-Location ".."
            return $false
        }
    } else {
        Write-Host "   ✅ Node modules found" -ForegroundColor Green
    }
    
    # Start storefront in new PowerShell window
    $command = "cd '$frontendPath'; npm run dev:storefront"
    try {
        Start-Process powershell -ArgumentList "-NoExit", "-Command", $command
        Write-Host "   🚀 Storefront server starting in new window" -ForegroundColor Green
        Set-Location ".."
        return $true
    } catch {
        Write-Host "   ❌ Failed to start storefront server" -ForegroundColor Red
        Set-Location ".."
        return $false
    }
}

# Function to start admin panel
function Start-AdminPanel {
    Write-Host "👨‍💼 Starting Admin Panel Server (React + Vite)..." -ForegroundColor Cyan
    
    $frontendPath = Join-Path $PWD "Frontend"
    Set-Location $frontendPath
    
    # Check if node_modules exists (should already be installed from storefront)
    if (-not (Test-Path "node_modules")) {
        Write-Host "   📦 Node modules not found. Installing..." -ForegroundColor Yellow
        try {
            npm install
            Write-Host "   ✅ Dependencies installed successfully" -ForegroundColor Green
        } catch {
            Write-Host "   ❌ Failed to install dependencies" -ForegroundColor Red
            Write-Host "   💡 Try running: npm install manually" -ForegroundColor White
            Set-Location ".."
            return $false
        }
    } else {
        Write-Host "   ✅ Node modules found (reusing from storefront)" -ForegroundColor Green
    }
    
    # Start admin panel in new PowerShell window
    $command = "cd '$frontendPath'; npm run dev:admin"
    try {
        Start-Process powershell -ArgumentList "-NoExit", "-Command", $command
        Write-Host "   🚀 Admin panel server starting in new window" -ForegroundColor Green
        Write-Host "   💬 WebSocket chat will be available for admin communication" -ForegroundColor Magenta
        Set-Location ".."
        return $true
    } catch {
        Write-Host "   ❌ Failed to start admin panel server" -ForegroundColor Red
        Set-Location ".."
        return $false
    }
}

# Start all servers
Write-Host ""
Write-Host "🚀 Initializing all servers..." -ForegroundColor Magenta
Write-Host "=================================" -ForegroundColor Magenta

$backendStarted = Start-Backend
Start-Sleep -Seconds 3

$storefrontStarted = Start-Storefront
Start-Sleep -Seconds 2

$adminStarted = Start-AdminPanel

Write-Host ""
Write-Host "🎉 SERVERS STARTING SUCCESSFULLY!" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 AVAILABLE SERVICES:" -ForegroundColor White
Write-Host "   🔧 Backend API:     http://127.0.0.1:8001" -ForegroundColor Yellow
Write-Host "      📡 ASGI Server with WebSocket support" -ForegroundColor Gray
Write-Host "      🔌 WebSocket:     ws://127.0.0.1:8001/ws/admin/chat/" -ForegroundColor Magenta
Write-Host ""
Write-Host "   🛒 Storefront:      http://localhost:5173" -ForegroundColor Yellow
Write-Host "      🛍️  Customer-facing ecommerce website" -ForegroundColor Gray
Write-Host ""
Write-Host "   👨‍💼 Admin Panel:     http://localhost:5174" -ForegroundColor Yellow
Write-Host "      🔐 Login:         admin@example.com / admin123" -ForegroundColor Cyan
Write-Host "      💬 Real-time chat with customers" -ForegroundColor Gray
Write-Host ""
Write-Host "📝 NOTES:" -ForegroundColor White
Write-Host "   • Three PowerShell windows will open for each server" -ForegroundColor Gray
Write-Host "   • Close those windows to stop the servers" -ForegroundColor Gray
Write-Host "   • WebSocket chat requires valid JWT authentication" -ForegroundColor Gray
Write-Host "   • All servers support hot-reload during development" -ForegroundColor Gray
Write-Host ""
Write-Host "⏳ Waiting for servers to fully initialize..." -ForegroundColor Magenta
Start-Sleep -Seconds 5

# Status summary
Write-Host ""
Write-Host "📊 STARTUP STATUS:" -ForegroundColor White
Write-Host "==================" -ForegroundColor White

if ($backendStarted) {
    Write-Host "   ✅ Backend Server:     RUNNING" -ForegroundColor Green
} else {
    Write-Host "   ❌ Backend Server:     FAILED" -ForegroundColor Red
}

if ($storefrontStarted) {
    Write-Host "   ✅ Storefront Server:  RUNNING" -ForegroundColor Green
} else {
    Write-Host "   ❌ Storefront Server:  FAILED" -ForegroundColor Red
}

if ($adminStarted) {
    Write-Host "   ✅ Admin Panel Server: RUNNING" -ForegroundColor Green
} else {
    Write-Host "   ❌ Admin Panel Server: FAILED" -ForegroundColor Red
}

Write-Host ""
if ($backendStarted -and $storefrontStarted -and $adminStarted) {
    Write-Host "🎊 ALL SYSTEMS OPERATIONAL!" -ForegroundColor Green
    Write-Host "Your ecommerce platform is ready for development!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Some servers failed to start. Check the individual PowerShell windows for errors." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "💡 TROUBLESHOOTING:" -ForegroundColor White
Write-Host "   • Check individual PowerShell windows for detailed error messages" -ForegroundColor Gray
Write-Host "   • Ensure all dependencies are installed correctly" -ForegroundColor Gray
Write-Host "   • Verify ports 8001, 5173, and 5174 are not in use" -ForegroundColor Gray
Write-Host "   • For WebSocket issues, ensure ASGI server is running (not regular Django)" -ForegroundColor Gray
Write-Host ""

Read-Host "Press Enter to exit"
