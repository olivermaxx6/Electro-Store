# Electro Store - Start Backend in External PowerShell Window
# This script opens a new PowerShell window for the Django backend

Write-Host "📡 Starting Backend Server in External PowerShell Window..." -ForegroundColor Green

# Create a temporary script file for the backend
$tempScript = [System.IO.Path]::GetTempFileName() + ".ps1"
$scriptContent = @"
Write-Host "📡 Electro Store Backend Server" -ForegroundColor Yellow
Write-Host "=================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "Activating Python virtual environment..." -ForegroundColor Gray
cd 'D:\Electro-Store\Backend'
.\venv\Scripts\Activate.ps1
Write-Host ""
Write-Host "Backend Server will be available at:" -ForegroundColor Cyan
Write-Host "  API: http://127.0.0.1:8001" -ForegroundColor White
Write-Host "  Django Admin: http://127.0.0.1:8001/admin/" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Gray
Write-Host ""
python manage.py runserver 127.0.0.1:8001
"@

Set-Content -Path $tempScript -Value $scriptContent

# Start new PowerShell window with the backend script
Start-Process powershell -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-File", "`"$tempScript`""

Write-Host "✅ Backend server starting in new PowerShell window!" -ForegroundColor Green
Write-Host "The backend will be available at: http://127.0.0.1:8001" -ForegroundColor Cyan

# Clean up temp file after a delay
Start-Job -ScriptBlock {
    param($file)
    Start-Sleep -Seconds 5
    Remove-Item $file -Force -ErrorAction SilentlyContinue
} -ArgumentList $tempScript | Out-Null

Write-Host ""
Write-Host "Press any key to exit this launcher..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
