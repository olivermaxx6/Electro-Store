# PowerShell script to start the dedicated chat server
# This ensures WebSocket chat functionality works properly

Write-Host "🚀 Starting Dedicated Chat Server..." -ForegroundColor Green
Write-Host "=" * 50 -ForegroundColor Cyan

# Stop any existing processes on port 8001
Write-Host "🔍 Checking for existing processes on port 8001..." -ForegroundColor Yellow
try {
    $processes = Get-NetTCPConnection -LocalPort 8001 -ErrorAction SilentlyContinue
    if ($processes) {
        Write-Host "🛑 Found existing processes on port 8001, stopping them..." -ForegroundColor Yellow
        $processes | ForEach-Object {
            if ($_.OwningProcess) {
                Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue
                Write-Host "✅ Stopped process $($_.OwningProcess)" -ForegroundColor Green
            }
        }
        Start-Sleep -Seconds 2
    }
} catch {
    Write-Host "ℹ️ No existing processes found on port 8001" -ForegroundColor Gray
}

# Check Python version
Write-Host "🐍 Checking Python version..." -ForegroundColor Cyan
python --version

# Run Django migrations
Write-Host "📊 Running Django migrations..." -ForegroundColor Cyan
python manage.py migrate

# Check if uvicorn is installed
Write-Host "📦 Checking uvicorn installation..." -ForegroundColor Cyan
try {
    python -c "import uvicorn" 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "📥 Installing uvicorn..." -ForegroundColor Yellow
        pip install uvicorn
    } else {
        Write-Host "✅ uvicorn is available" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Error checking uvicorn installation" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎯 Starting Chat Server..." -ForegroundColor Green
Write-Host "🌐 Server: http://127.0.0.1:8001" -ForegroundColor White
Write-Host "🔌 WebSocket: ws://127.0.0.1:8001/ws/" -ForegroundColor White
Write-Host "💬 Admin Chat: ws://127.0.0.1:8001/ws/admin/chat/" -ForegroundColor White
Write-Host "👤 Customer Chat: ws://127.0.0.1:8001/ws/chat/{room_id}/" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Gray
Write-Host "=" * 50 -ForegroundColor Cyan

# Start the dedicated chat server
python chat_server.py
