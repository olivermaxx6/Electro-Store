# Quick Start Script for E-commerce Project
# This script quickly starts both backend and frontend in separate windows

Write-Host "Starting E-commerce Project..." -ForegroundColor Green

# Start Backend in new window with ASGI support for WebSockets
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\Backend'; Write-Host '=== Django Backend with ASGI/WebSocket Support ===' -ForegroundColor Yellow; python manage.py migrate; .\start_asgi_server.ps1"

# Wait a moment
Start-Sleep -Seconds 2

# Start Frontend in new window  
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\Frontend'; Write-Host '=== React Frontend ===' -ForegroundColor Yellow; npm run dev:both"

Write-Host "Project started! Check the new windows:" -ForegroundColor Cyan
Write-Host "Backend: http://127.0.0.1:8001" -ForegroundColor White
Write-Host "Frontend: http://localhost:5173 (Storefront) and http://localhost:5174 (Admin)" -ForegroundColor White
