# Electro Store - External PowerShell Windows Setup
Write-Host "🚀 Electro Store - External PowerShell Windows Setup" -ForegroundColor Green
Write-Host "=====================================================" -ForegroundColor Green
Write-Host ""

# Stop existing services
Write-Host "🛑 Stopping existing services..." -ForegroundColor Yellow
try {
    $processes8001 = Get-NetTCPConnection -LocalPort 8001 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess
    if ($processes8001) {
        foreach ($pid in $processes8001) {
            Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
            Write-Host "Stopped process $pid on port 8001" -ForegroundColor Red
        }
    }
    
    $processes5173 = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess
    if ($processes5173) {
        foreach ($pid in $processes5173) {
            Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
            Write-Host "Stopped process $pid on port 5173" -ForegroundColor Red
        }
    }
    
    $processes5174 = Get-NetTCPConnection -LocalPort 5174 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess
    if ($processes5174) {
        foreach ($pid in $processes5174) {
            Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
            Write-Host "Stopped process $pid on port 5174" -ForegroundColor Red
        }
    }
}
catch {
    Write-Host "Some processes could not be stopped" -ForegroundColor Yellow
}

Start-Sleep -Seconds 3

# Start Backend
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

# Start Storefront
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

# Start Admin Panel
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
