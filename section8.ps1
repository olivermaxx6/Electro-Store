# Section 8: Test Multi-Port Setup (Windows PowerShell)
Write-Host "=== SECTION 8: Test Multi-Port Setup ===" -ForegroundColor Green

# Start Django on port 8001
$job = Start-Job -ScriptBlock { 
    Set-Location "D:\Electro-Store\Backend"
    python manage.py runserver 127.0.0.1:8001 
}

# Wait for server to start
Start-Sleep -Seconds 5

# Test endpoints
try {
    $adminResponse = Invoke-WebRequest -Uri "http://127.0.0.1:8001/admin/" -UseBasicParsing -TimeoutSec 10
    Write-Host "✅ Admin accessible - Status: $($adminResponse.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ Admin failed - $($_.Exception.Message)" -ForegroundColor Red
}

try {
    $apiResponse = Invoke-WebRequest -Uri "http://127.0.0.1:8001/api/" -UseBasicParsing -TimeoutSec 10
    Write-Host "✅ API accessible - Status: $($apiResponse.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ API failed - $($_.Exception.Message)" -ForegroundColor Red
}

# Stop the background job
Stop-Job $job
Remove-Job $job

Write-Host "✅ Section 8 Complete - Multi-port setup tested" -ForegroundColor Green
Write-Host "🎉 Migration Complete! Start with: python manage.py runserver 127.0.0.1:8001" -ForegroundColor Cyan
