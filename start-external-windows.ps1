# Electro Store - Start All Services in External PowerShell Windows
# This script opens separate PowerShell windows for each service

Write-Host "🚀 Starting Electro Store E-commerce Platform in External Windows..." -ForegroundColor Green
Write-Host ""

# Function to start service in new PowerShell window
function Start-ServiceInNewWindow {
    param(
        [string]$ServiceName,
        [string]$Command,
        [string]$Color
    )
    
    Write-Host "Starting $ServiceName..." -ForegroundColor $Color
    
    # Create a temporary script file
    $tempScript = [System.IO.Path]::GetTempFileName() + ".ps1"
    $scriptContent = @"
Write-Host "$ServiceName Starting..." -ForegroundColor $Color
Write-Host "=========================================" -ForegroundColor $Color
$Command
"@
    
    Set-Content -Path $tempScript -Value $scriptContent
    
    # Start new PowerShell window with the script
    Start-Process powershell -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-File", "`"$tempScript`""
    
    # Clean up temp file after a delay
    Start-Job -ScriptBlock {
        param($file)
        Start-Sleep -Seconds 5
        Remove-Item $file -Force -ErrorAction SilentlyContinue
    } -ArgumentList $tempScript | Out-Null
}

# Start Backend (Django)
Start-ServiceInNewWindow -ServiceName "Backend Server (Django)" -Command "cd 'D:\Electro-Store\Backend'; .\venv\Scripts\Activate.ps1; Write-Host 'Backend Server running on: http://127.0.0.1:8001' -ForegroundColor Cyan; Write-Host 'Django Admin: http://127.0.0.1:8001/admin/' -ForegroundColor Cyan; Write-Host ''; Write-Host 'Press Ctrl+C to stop' -ForegroundColor Gray; Write-Host ''; python manage.py runserver 127.0.0.1:8001" -Color "Yellow"

# Wait a moment
Start-Sleep -Seconds 3

# Start Storefront (React)
Start-ServiceInNewWindow -ServiceName "Storefront (React)" -Command "cd 'D:\Electro-Store\Frontend'; Write-Host 'Storefront running on: http://localhost:5173' -ForegroundColor Cyan; Write-Host ''; Write-Host 'Press Ctrl+C to stop' -ForegroundColor Gray; Write-Host ''; npm run dev:storefront" -Color "Green"

# Wait a moment
Start-Sleep -Seconds 3

# Start Admin Panel (React)
Start-ServiceInNewWindow -ServiceName "Admin Panel (React)" -Command "cd 'D:\Electro-Store\Frontend'; Write-Host 'Admin Panel running on: http://localhost:5174' -ForegroundColor Cyan; Write-Host 'Default Admin Credentials:' -ForegroundColor Yellow; Write-Host '  Email: admin@example.com' -ForegroundColor White; Write-Host '  Password: admin123' -ForegroundColor White; Write-Host ''; Write-Host 'Press Ctrl+C to stop' -ForegroundColor Gray; Write-Host ''; npm run dev:admin" -Color "Blue"

Write-Host ""
Write-Host "✅ All services are starting in separate PowerShell windows!" -ForegroundColor Green
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
Write-Host "Each service is running in its own PowerShell window." -ForegroundColor Gray
Write-Host "You can close individual services by closing their respective windows." -ForegroundColor Gray
Write-Host ""
Write-Host "Press any key to exit this launcher..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
