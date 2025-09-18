# Stop anything on :8001
$pid = (Get-NetTCPConnection -LocalPort 8001 -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1).OwningProcess
if ($pid) { Write-Host "Killing PID $pid on :8001"; Stop-Process -Id $pid -Force }

# Check Python
python --version

# Migrate
python manage.py check
python manage.py migrate

# Check if uvicorn is installed
try {
    python -c "import uvicorn" 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Installing uvicorn..." -ForegroundColor Yellow
        pip install uvicorn
    }
} catch {
    Write-Host "Error checking uvicorn installation" -ForegroundColor Red
}

# Start ASGI server with WebSocket support
# This is REQUIRED for WebSocket chat functionality
Write-Host "Starting Django ASGI Server with WebSocket Support..." -ForegroundColor Green
Write-Host "Server will be available at: http://127.0.0.1:8001" -ForegroundColor Green
Write-Host "WebSocket endpoint: ws://127.0.0.1:8001/ws/" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Gray

uvicorn core.asgi:application --host 127.0.0.1 --port 8001 --reload --log-level info
