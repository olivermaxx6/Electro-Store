# Dev Smoke Check Script
# Validates the development stack configuration

Write-Host "=== Dev Stack Smoke Check ===" -ForegroundColor Green
Write-Host ""

Write-Host "Checking 8001 listen..." -ForegroundColor Yellow
netstat -ano | findstr :8001

Write-Host "`nDirect API:" -ForegroundColor Yellow
try { 
    $response = Invoke-WebRequest -UseBasicParsing http://127.0.0.1:8001/api/public/health/
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response: $($response.Content)" -ForegroundColor Green
} catch { 
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red 
}

Write-Host "`nAdmin proxy:" -ForegroundColor Yellow
try { 
    $response = Invoke-WebRequest -UseBasicParsing http://localhost:5174/api/public/health/
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response: $($response.Content)" -ForegroundColor Green
} catch { 
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red 
}

Write-Host "`nStorefront proxy:" -ForegroundColor Yellow
try { 
    $response = Invoke-WebRequest -UseBasicParsing http://localhost:5173/api/public/health/
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response: $($response.Content)" -ForegroundColor Green
} catch { 
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red 
}

Write-Host "`n=== Smoke Check Complete ===" -ForegroundColor Green
Write-Host "Expected: All endpoints should return `{"status":"ok"}`" -ForegroundColor Cyan
