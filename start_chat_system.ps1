# WebSocket Chat System Startup Script
# This script starts both the backend and frontend for the chat system

Write-Host "🚀 Starting WebSocket Chat System..." -ForegroundColor Green

# Kill any existing Python processes
Write-Host "🛑 Stopping existing servers..." -ForegroundColor Yellow
taskkill /F /IM python.exe 2>$null

# Start Backend Server
Write-Host "🔧 Starting Django backend server..." -ForegroundColor Cyan
Start-Process -FilePath "python" -ArgumentList "manage.py", "runserver", "8001" -WorkingDirectory "Backend" -WindowStyle Minimized

# Wait a moment for the server to start
Start-Sleep -Seconds 3

# Check if backend is running
try {
    $response = Invoke-WebRequest -Uri "http://127.0.0.1:8001/api/" -TimeoutSec 5
    Write-Host "✅ Backend server is running!" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend server failed to start. Please check the logs." -ForegroundColor Red
    exit 1
}

# Start Frontend Admin Panel
Write-Host "🎨 Starting Admin Panel..." -ForegroundColor Cyan
Start-Process -FilePath "npm" -ArgumentList "run", "dev:admin" -WorkingDirectory "Frontend" -WindowStyle Minimized

# Start Frontend Storefront
Write-Host "🛍️ Starting Storefront..." -ForegroundColor Cyan
Start-Process -FilePath "npm" -ArgumentList "run", "dev:storefront" -WorkingDirectory "Frontend" -WindowStyle Minimized

Write-Host ""
Write-Host "🎉 Chat System Started Successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Access URLs:" -ForegroundColor Yellow
Write-Host "   Admin Panel:    http://localhost:5174" -ForegroundColor White
Write-Host "   Storefront:     http://localhost:5173" -ForegroundColor White
Write-Host "   Backend API:    http://localhost:8001/api/" -ForegroundColor White
Write-Host ""
Write-Host "🔑 Admin Login:" -ForegroundColor Yellow
Write-Host "   Email:    admin@example.com" -ForegroundColor White
Write-Host "   Password: admin123" -ForegroundColor White
Write-Host ""
Write-Host "💬 To test the chat system:" -ForegroundColor Yellow
Write-Host "   1. Open Admin Panel and sign in" -ForegroundColor White
Write-Host "   2. Go to Chat page" -ForegroundColor White
Write-Host "   3. Open Storefront in another tab" -ForegroundColor White
Write-Host "   4. Click the chat/support button" -ForegroundColor White
Write-Host "   5. Start chatting!" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to stop all servers..." -ForegroundColor Red
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Stop all processes
Write-Host "🛑 Stopping all servers..." -ForegroundColor Yellow
taskkill /F /IM python.exe 2>$null
taskkill /F /IM node.exe 2>$null
Write-Host "✅ All servers stopped." -ForegroundColor Green
