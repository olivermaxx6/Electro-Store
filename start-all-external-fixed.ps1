# Electro Store - Complete External PowerShell Windows Setup
# This script handles port conflicts and starts all services in separate windows

Write-Host "🚀 Electro Store - External PowerShell Windows Setup" -ForegroundColor Green
Write-Host "=====================================================" -ForegroundColor Green
Write-Host ""

# Function to kill processes on specific ports
function Stop-PortProcesses {
    param([int[]]$Ports)
    
    foreach ($port in $Ports) {
        try {
            $connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
            if ($connections) {
                foreach ($connection in $connections) {
                    $processId = $connection.OwningProcess
                    if ($processId) {
                        Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
                        Write-Host "✅ Stopped process $processId on port $port" -ForegroundColor Red
                    }
                }
            }
        }
        catch {
            Write-Host "⚠️  Could not check port $port" -ForegroundColor Yellow
        }
    }
}

# Function to start service in new PowerShell window
function Start-ServiceWindow {
    param(
        [string]$ServiceName,
        [string]$Command,
        [string]$Color,
        [string]$Url
    )
    
    Write-Host "Starting $ServiceName..." -ForegroundColor $Color
    
    $scriptContent = @"
Write-Host "$ServiceName" -ForegroundColor $Color
Write-Host "=========================================" -ForegroundColor $Color
Write-Host ""
$Command
Write-Host ""
Write-Host "Service running at: $Url" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop" -ForegroundColor Gray
"@
    
    $tempFile = [System.IO.Path]::GetTempFileName() + ".ps1"
    Set-Content -Path $tempFile -Value $scriptContent
    
    # Start new PowerShell window
    Start-Process powershell -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-File", "`"$tempFile`""
    
    # Clean up temp file after delay
    Start-Job -ScriptBlock {
        param($file)
        Start-Sleep -Seconds 10
        Remove-Item $file -Force -ErrorAction SilentlyContinue
    } -ArgumentList $tempFile | Out-Null
    
    Write-Host "✅ $ServiceName started in new window" -ForegroundColor Green
}

# Step 1: Stop existing services
Write-Host "🛑 Stopping existing services..." -ForegroundColor Yellow
Stop-PortProcesses -Ports @(8001, 5173, 5174)
Start-Sleep -Seconds 3

# Step 2: Start Backend
Write-Host ""
Write-Host "📡 Starting Backend Server..." -ForegroundColor Yellow
$backendCmd = @"
cd 'D:\Electro-Store\Backend'
.\venv\Scripts\Activate.ps1
python manage.py runserver 127.0.0.1:8001
"@
Start-ServiceWindow -ServiceName "Backend Server (Django)" -Command $backendCmd -Color "Yellow" -Url "http://127.0.0.1:8001"

Start-Sleep -Seconds 5

# Step 3: Start Storefront
Write-Host ""
Write-Host "🛒 Starting Storefront..." -ForegroundColor Green
$storefrontCmd = @"
cd 'D:\Electro-Store\Frontend'
npm run dev:storefront
"@
Start-ServiceWindow -ServiceName "Storefront (React)" -Command $storefrontCmd -Color "Green" -Url "http://localhost:5173"

Start-Sleep -Seconds 5

# Step 4: Start Admin Panel
Write-Host ""
Write-Host "⚙️ Starting Admin Panel..." -ForegroundColor Blue
$adminCmd = @"
cd 'D:\Electro-Store\Frontend'
npm run dev:admin
"@
Start-ServiceWindow -ServiceName "Admin Panel (React)" -Command $adminCmd -Color "Blue" -Url "http://localhost:5174"

# Final status
Write-Host ""
Write-Host "🎉 All services started in external PowerShell windows!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Access URLs:" -ForegroundColor Cyan
Write-Host "   Storefront:  http://localhost:5173" -ForegroundColor White
Write-Host "   Admin Panel: http://localhost:5174" -ForegroundColor White
Write-Host "   Backend API: http://127.0.0.1:8001" -ForegroundColor White
Write-Host "   Django Admin: http://127.0.0.1:8001/admin/" -ForegroundColor White
Write-Host ""
Write-Host "👤 Default Admin Credentials:" -ForegroundColor Cyan
Write-Host "   Email: admin@example.com" -ForegroundColor White
Write-Host "   Password: admin123" -ForegroundColor White
Write-Host ""
Write-Host "💡 Tip: Consider upgrading to PowerShell Core 7+" -ForegroundColor Yellow
Write-Host "   Download from: https://aka.ms/pscore6" -ForegroundColor Yellow
Write-Host ""
Write-Host "Each service runs in its own PowerShell window." -ForegroundColor Gray
Write-Host "Close individual windows to stop specific services." -ForegroundColor Gray
Write-Host ""
Write-Host "Press any key to exit this launcher..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
