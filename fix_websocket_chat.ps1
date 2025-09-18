# Fix WebSocket Chat Connection Issues
# This script ensures the correct ASGI server is running for WebSocket support

Write-Host "=== Fixing WebSocket Chat Connection ===" -ForegroundColor Green

# Kill any existing Django processes
Write-Host "Stopping any existing Django servers..." -ForegroundColor Yellow
taskkill /F /IM python.exe 2>$null

# Wait a moment
Start-Sleep -Seconds 2

# Navigate to backend
Set-Location Backend

# Run migrations
Write-Host "Running Django migrations..." -ForegroundColor Cyan
python manage.py migrate

# Start ASGI server with WebSocket support
Write-Host "Starting ASGI server with WebSocket support..." -ForegroundColor Green
Write-Host "Server will be available at: http://127.0.0.1:8001" -ForegroundColor White
Write-Host "WebSocket endpoint: ws://127.0.0.1:8001/ws/" -ForegroundColor White
Write-Host "" -ForegroundColor White
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Gray
Write-Host "=" * 50 -ForegroundColor Gray

# Start the ASGI server
uvicorn core.asgi:application --host 127.0.0.1 --port 8001 --reload --log-level info
