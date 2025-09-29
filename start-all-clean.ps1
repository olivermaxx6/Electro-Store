# Electro Store - Complete External PowerShell Setup
# This script kills existing processes and starts all services in separate windows

Write-Host "🚀 Electro Store - Complete External PowerShell Setup" -ForegroundColor Green
Write-Host "=====================================================" -ForegroundColor Green
Write-Host ""

# Function to kill processes on specific ports
function Kill-PortProcesses {
    param([int[]]$Ports)
    
    foreach ($port in $Ports) {
        Write-Host "Checking port $port..." -ForegroundColor Yellow
        $output = netstat -ano | findstr ":$port"
        if ($output) {
            $pids = $output | ForEach-Object { ($_ -split '\s+')[-1] } | Where-Object { $_ -ne "0" -and $_ -match '^\d+$' }
            foreach ($processId in $pids) {
                if ($processId) {
                    taskkill /PID $processId /F 2>$null
                    Write-Host "Killed process $processId on port $port" -ForegroundColor Red
                }
            }
        }
    }
}

# Step 1: Kill existing processes
Write-Host "🛑 Killing existing processes on ports 8001, 5173, 5174..." -ForegroundColor Red
Kill-PortProcesses -Ports @(8001, 5173, 5174)
Start-Sleep -Seconds 3

# Step 2: Start Backend
Write-Host ""
Write-Host "📡 Starting Backend Server..." -ForegroundColor Yellow
$backendScript = @"
Write-Host "📡 Electro Store Backend Server" -ForegroundColor Yellow
Write-Host "=================================" -ForegroundColor Yellow
Write-Host ""
cd 'D:\Electro-Store\Backend'
Write-Host "Activating Python virtual environment..." -ForegroundColor Gray
.\venv\Scripts\Activate.ps1
Write-Host ""
Write-Host "Backend Server running on: http://127.0.0.1:8001" -ForegroundColor Cyan
Write-Host "Django Admin: http://127.0.0.1:8001/admin/" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop" -ForegroundColor Gray
Write-Host ""
python manage.py runserver 127.0.0.1:8001
"@

$tempFile1 = [System.IO.Path]::GetTempFileName() + ".ps1"
Set-Content -Path $tempFile1 -Value $backendScript
Start-Process powershell -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-File", "`"$tempFile1`""
Write-Host "✅ Backend started in new window" -ForegroundColor Green

Start-Sleep -Seconds 5

# Step 3: Start Storefront
Write-Host ""
Write-Host "🛒 Starting Storefront..." -ForegroundColor Green
$storefrontScript = @"
Write-Host "🛒 Electro Store Storefront" -ForegroundColor Green
Write-Host "===========================" -ForegroundColor Green
Write-Host ""
cd 'D:\Electro-Store\Frontend'
Write-Host "Storefront running on: http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop" -ForegroundColor Gray
Write-Host ""
npm run dev:storefront
"@

$tempFile2 = [System.IO.Path]::GetTempFileName() + ".ps1"
Set-Content -Path $tempFile2 -Value $storefrontScript
Start-Process powershell -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-File", "`"$tempFile2`""
Write-Host "✅ Storefront started in new window" -ForegroundColor Green

Start-Sleep -Seconds 5

# Step 4: Start Admin Panel
Write-Host ""
Write-Host "⚙️ Starting Admin Panel..." -ForegroundColor Blue
$adminScript = @"
Write-Host "⚙️ Electro Store Admin Panel" -ForegroundColor Blue
Write-Host "============================" -ForegroundColor Blue
Write-Host ""
cd 'D:\Electro-Store\Frontend'
Write-Host "Admin Panel running on: http://localhost:5174" -ForegroundColor Cyan
Write-Host ""
Write-Host "Default Admin Credentials:" -ForegroundColor Yellow
Write-Host "  Email: admin@example.com" -ForegroundColor White
Write-Host "  Password: admin123" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C to stop" -ForegroundColor Gray
Write-Host ""
npm run dev:admin
"@

$tempFile3 = [System.IO.Path]::GetTempFileName() + ".ps1"
Set-Content -Path $tempFile3 -Value $adminScript
Start-Process powershell -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-File", "`"$tempFile3`""
Write-Host "✅ Admin Panel started in new window" -ForegroundColor Green

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
