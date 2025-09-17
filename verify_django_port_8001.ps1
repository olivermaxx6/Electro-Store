# Django Port 8001 Verification Script
# This script verifies that Django is configured to run on port 8001

Write-Host "=== Django Port 8001 Verification ===" -ForegroundColor Cyan

# Check if any processes are running on port 8000 (should be none)
Write-Host "`n1. Checking for processes on port 8000 (should be empty):" -ForegroundColor Yellow
$port8000 = netstat -ano | findstr :8000
if ($port8000) {
    Write-Host "WARNING: Found processes on port 8000:" -ForegroundColor Red
    Write-Host $port8000 -ForegroundColor Red
} else {
    Write-Host "No processes found on port 8000" -ForegroundColor Green
}

# Check if any processes are running on port 8001
Write-Host "`n2. Checking for processes on port 8001:" -ForegroundColor Yellow
$port8001 = netstat -ano | findstr :8001
if ($port8001) {
    Write-Host "Found processes on port 8001:" -ForegroundColor Green
    Write-Host $port8001 -ForegroundColor Green
} else {
    Write-Host "No processes currently on port 8001 (Django not running)" -ForegroundColor Gray
}

# Test Django configuration
Write-Host "`n3. Testing Django configuration:" -ForegroundColor Yellow
Set-Location "Backend"
try {
    $checkResult = python manage.py check 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Django system check passed" -ForegroundColor Green
    } else {
        Write-Host "Django system check failed:" -ForegroundColor Red
        Write-Host $checkResult -ForegroundColor Red
    }
} catch {
    Write-Host "Error running Django check: $_" -ForegroundColor Red
}

# Test custom devserver command
Write-Host "`n4. Testing custom devserver command:" -ForegroundColor Yellow
try {
    $helpResult = python manage.py devserver --help 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Custom devserver command available" -ForegroundColor Green
    } else {
        Write-Host "Custom devserver command failed:" -ForegroundColor Red
        Write-Host $helpResult -ForegroundColor Red
    }
} catch {
    Write-Host "Error testing devserver command: $_" -ForegroundColor Red
}

# Check Vite configuration files
Write-Host "`n5. Checking Vite proxy configurations:" -ForegroundColor Yellow
Set-Location "..\Frontend"

$viteFiles = @("vite.config.js", "vite.admin.config.js", "vite.storefront.config.js")
$allCorrect = $true

foreach ($file in $viteFiles) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        if ($content -match "127\.0\.0\.1:8001") {
            Write-Host "$file - Correctly configured for port 8001" -ForegroundColor Green
        } elseif ($content -match "127\.0\.0\.1:8000") {
            Write-Host "$file - Still configured for port 8000" -ForegroundColor Red
            $allCorrect = $false
        } else {
            Write-Host "$file - No proxy configuration found" -ForegroundColor Yellow
        }
    } else {
        Write-Host "$file - File not found" -ForegroundColor Red
        $allCorrect = $false
    }
}

# Summary
Write-Host "`n=== SUMMARY ===" -ForegroundColor Cyan
if ($allCorrect) {
    Write-Host "All configurations verified for port 8001" -ForegroundColor Green
    Write-Host "`nTo start Django on port 8001:" -ForegroundColor Yellow
    Write-Host "  cd Backend" -ForegroundColor White
    Write-Host "  python manage.py devserver" -ForegroundColor White
    Write-Host "`nOr use the project launcher:" -ForegroundColor Yellow
    Write-Host "  .\run_project.ps1" -ForegroundColor White
} else {
    Write-Host "Some configurations need attention" -ForegroundColor Red
}

Set-Location ".."
Write-Host "`nVerification complete!" -ForegroundColor Cyan