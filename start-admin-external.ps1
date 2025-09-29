# Electro Store - Start Admin Panel in External PowerShell Window
# This script opens a new PowerShell window for the React admin panel

Write-Host "⚙️ Starting Admin Panel in External PowerShell Window..." -ForegroundColor Green

# Create a temporary script file for the admin panel
$tempScript = [System.IO.Path]::GetTempFileName() + ".ps1"
$scriptContent = @"
Write-Host "⚙️ Electro Store Admin Panel" -ForegroundColor Blue
Write-Host "============================" -ForegroundColor Blue
Write-Host ""
Write-Host "Starting React admin panel development server..." -ForegroundColor Gray
cd 'D:\Electro-Store\Frontend'
Write-Host ""
Write-Host "Admin Panel will be available at:" -ForegroundColor Cyan
Write-Host "  http://localhost:5174" -ForegroundColor White
Write-Host ""
Write-Host "Default Admin Credentials:" -ForegroundColor Yellow
Write-Host "  Email: admin@example.com" -ForegroundColor White
Write-Host "  Password: admin123" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Gray
Write-Host ""
npm run dev:admin
"@

Set-Content -Path $tempScript -Value $scriptContent

# Start new PowerShell window with the admin panel script
Start-Process powershell -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-File", "`"$tempScript`""

Write-Host "✅ Admin Panel starting in new PowerShell window!" -ForegroundColor Green
Write-Host "The admin panel will be available at: http://localhost:5174" -ForegroundColor Cyan

# Clean up temp file after a delay
Start-Job -ScriptBlock {
    param($file)
    Start-Sleep -Seconds 5
    Remove-Item $file -Force -ErrorAction SilentlyContinue
} -ArgumentList $tempScript | Out-Null

Write-Host ""
Write-Host "Press any key to exit this launcher..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
