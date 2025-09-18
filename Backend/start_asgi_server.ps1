# PowerShell script to start Django with ASGI support for WebSocket connections

Write-Host "Starting Django ASGI Server with WebSocket Support..." -ForegroundColor Green

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

# Kill any existing processes on port 8001
Write-Host "Checking for existing processes on port 8001..." -ForegroundColor Yellow
try {
    $processes = Get-NetTCPConnection -LocalPort 8001 -ErrorAction SilentlyContinue
    if ($processes) {
        Write-Host "Found existing processes on port 8001, stopping them..." -ForegroundColor Yellow
        $processes | ForEach-Object {
            if ($_.OwningProcess) {
                Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue
                Write-Host "Stopped process $($_.OwningProcess)" -ForegroundColor Yellow
            }
        }
        Start-Sleep -Seconds 2
    }
} catch {
    Write-Host "No existing processes found on port 8001" -ForegroundColor Gray
}

# Run Django migrations
Write-Host "Running Django migrations..." -ForegroundColor Cyan
python manage.py migrate

# Start ASGI server
Write-Host "Starting ASGI server on http://127.0.0.1:8001..." -ForegroundColor Green
Write-Host "WebSocket endpoint: ws://127.0.0.1:8001/ws/" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Gray

uvicorn core.asgi:application --host 127.0.0.1 --port 8001 --reload --log-level info
