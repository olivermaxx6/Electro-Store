# Electro Store - Start Storefront in External PowerShell Window
# This script opens a new PowerShell window for the React storefront

Write-Host "🛒 Starting Storefront in External PowerShell Window..." -ForegroundColor Green

# Create a temporary script file for the storefront
$tempScript = [System.IO.Path]::GetTempFileName() + ".ps1"
$scriptContent = @"
Write-Host "🛒 Electro Store Storefront" -ForegroundColor Green
Write-Host "===========================" -ForegroundColor Green
Write-Host ""
Write-Host "Starting React storefront development server..." -ForegroundColor Gray
cd 'D:\Electro-Store\Frontend'
Write-Host ""
Write-Host "Storefront will be available at:" -ForegroundColor Cyan
Write-Host "  http://localhost:5173" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Gray
Write-Host ""
npm run dev:storefront
"@

Set-Content -Path $tempScript -Value $scriptContent

# Start new PowerShell window with the storefront script
Start-Process powershell -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-File", "`"$tempScript`""

Write-Host "✅ Storefront starting in new PowerShell window!" -ForegroundColor Green
Write-Host "The storefront will be available at: http://localhost:5173" -ForegroundColor Cyan

# Clean up temp file after a delay
Start-Job -ScriptBlock {
    param($file)
    Start-Sleep -Seconds 5
    Remove-Item $file -Force -ErrorAction SilentlyContinue
} -ArgumentList $tempScript | Out-Null

Write-Host ""
Write-Host "Press any key to exit this launcher..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
