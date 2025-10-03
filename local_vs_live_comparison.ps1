# =============================================================================
# LOCAL VS LIVE COMPARISON SCRIPT (Windows PowerShell)
# =============================================================================
# This script compares your working localhost setup with the live deployment
# Run this from your local machine to gather comparison data
# =============================================================================

Write-Host "🔍 LOCAL VS LIVE DEPLOYMENT COMPARISON" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host "Timestamp: $(Get-Date)" -ForegroundColor Gray
Write-Host ""

# Create report file
$reportFile = "local_vs_live_comparison_$(Get-Date -Format 'yyyyMMdd_HHmmss').txt"
Write-Host "📋 Report will be saved to: $reportFile" -ForegroundColor Yellow
Write-Host ""

function Write-Section($title) {
    $line = "=== $title ==="
    Write-Host $line -ForegroundColor Green
    Add-Content -Path $reportFile -Value $line
    Add-Content -Path $reportFile -Value ""
}

function Write-Info($text) {
    Write-Host $text
    Add-Content -Path $reportFile -Value $text
}

Write-Section "LOCAL ENVIRONMENT STATUS"
Write-Info "Current Directory: $(Get-Location)"
Write-Info "PowerShell Version: $($PSVersionTable.PSVersion)"
Write-Info "OS: $(Get-CimInstance Win32_OperatingSystem | Select-Object -ExpandProperty Caption)"
Write-Info ""

Write-Section "LOCAL PROJECT STRUCTURE"
if (Test-Path "Frontend") {
    Write-Info "✅ Frontend directory exists"
    Write-Info "Frontend contents:"
    Get-ChildItem Frontend | Select-Object Name, LastWriteTime | Format-Table -AutoSize | Out-String | Add-Content -Path $reportFile
} else {
    Write-Info "❌ Frontend directory not found"
}

if (Test-Path "Backend") {
    Write-Info "✅ Backend directory exists"
    Write-Info "Backend contents:"
    Get-ChildItem Backend | Select-Object Name, LastWriteTime | Format-Table -AutoSize | Out-String | Add-Content -Path $reportFile
} else {
    Write-Info "❌ Backend directory not found"
}
Write-Info ""

Write-Section "LOCAL ENVIRONMENT FILES"
if (Test-Path "Frontend\.env") {
    Write-Info "Frontend .env file:"
    Get-Content "Frontend\.env" | Add-Content -Path $reportFile
} else {
    Write-Info "❌ Frontend .env file not found"
}

if (Test-Path "Backend\.env") {
    Write-Info "Backend .env file:"
    Get-Content "Backend\.env" | Add-Content -Path $reportFile
} else {
    Write-Info "❌ Backend .env file not found"
}
Write-Info ""

Write-Section "LOCAL PACKAGE.JSON ANALYSIS"
if (Test-Path "Frontend\package.json") {
    Write-Info "Frontend package.json scripts:"
    $packageJson = Get-Content "Frontend\package.json" | ConvertFrom-Json
    $packageJson.scripts | ConvertTo-Json | Add-Content -Path $reportFile
} else {
    Write-Info "❌ Frontend package.json not found"
}
Write-Info ""

Write-Section "LOCAL API TESTING (Localhost)"
Write-Info "Testing localhost API endpoints..."

# Test localhost Django backend
try {
    $response = Invoke-WebRequest -Uri "http://127.0.0.1:8001/api/public/store-settings/" -TimeoutSec 5
    Write-Info "✅ Localhost Django API: HTTP $($response.StatusCode)"
    Write-Info "Response sample: $($response.Content.Substring(0, [Math]::Min(200, $response.Content.Length)))"
} catch {
    Write-Info "❌ Localhost Django API: $($_.Exception.Message)"
}

try {
    $response = Invoke-WebRequest -Uri "http://127.0.0.1:8001/api/public/categories/?top=true" -TimeoutSec 5
    Write-Info "✅ Localhost Categories API: HTTP $($response.StatusCode)"
} catch {
    Write-Info "❌ Localhost Categories API: $($_.Exception.Message)"
}

# Test localhost React storefront
try {
    $response = Invoke-WebRequest -Uri "http://127.0.0.1:5173/" -TimeoutSec 5
    Write-Info "✅ Localhost React Storefront: HTTP $($response.StatusCode)"
} catch {
    Write-Info "❌ Localhost React Storefront: $($_.Exception.Message)"
}

# Test localhost React admin
try {
    $response = Invoke-WebRequest -Uri "http://127.0.0.1:5174/" -TimeoutSec 5
    Write-Info "✅ Localhost React Admin: HTTP $($response.StatusCode)"
} catch {
    Write-Info "❌ Localhost React Admin: $($_.Exception.Message)"
}
Write-Info ""

Write-Section "LIVE DEPLOYMENT TESTING"
Write-Info "Testing live deployment at sppix.com..."

# Test live website
try {
    $response = Invoke-WebRequest -Uri "https://sppix.com/" -TimeoutSec 10
    Write-Info "✅ Live Website: HTTP $($response.StatusCode)"
    Write-Info "Content-Type: $($response.Headers.'Content-Type')"
    Write-Info "Response sample: $($response.Content.Substring(0, [Math]::Min(300, $response.Content.Length)))"
} catch {
    Write-Info "❌ Live Website: $($_.Exception.Message)"
}

# Test live API endpoints
try {
    $response = Invoke-WebRequest -Uri "https://sppix.com/api/public/store-settings/" -TimeoutSec 10
    Write-Info "✅ Live Store Settings API: HTTP $($response.StatusCode)"
    Write-Info "Response: $($response.Content)"
} catch {
    Write-Info "❌ Live Store Settings API: $($_.Exception.Message)"
}

try {
    $response = Invoke-WebRequest -Uri "https://sppix.com/api/public/categories/?top=true" -TimeoutSec 10
    Write-Info "✅ Live Categories API: HTTP $($response.StatusCode)"
    Write-Info "Response sample: $($response.Content.Substring(0, [Math]::Min(200, $response.Content.Length)))"
} catch {
    Write-Info "❌ Live Categories API: $($_.Exception.Message)"
}

try {
    $response = Invoke-WebRequest -Uri "https://sppix.com/admin/" -TimeoutSec 10
    Write-Info "✅ Live Admin Panel: HTTP $($response.StatusCode)"
} catch {
    Write-Info "❌ Live Admin Panel: $($_.Exception.Message)"
}
Write-Info ""

Write-Section "FRONTEND BUILD ANALYSIS"
if (Test-Path "Frontend\dist") {
    Write-Info "✅ Frontend dist directory exists"
    Write-Info "Build contents:"
    Get-ChildItem "Frontend\dist" -Recurse | Select-Object Name, Length, LastWriteTime | Format-Table -AutoSize | Out-String | Add-Content -Path $reportFile
    
    # Check for hardcoded localhost URLs in build
    Write-Info "Checking for localhost URLs in build files..."
    $jsFiles = Get-ChildItem "Frontend\dist" -Recurse -Filter "*.js"
    foreach ($file in $jsFiles) {
        $content = Get-Content $file.FullName -Raw
        if ($content -match "127\.0\.0\.1|localhost") {
            Write-Info "⚠️  Found localhost reference in: $($file.Name)"
        }
    }
} else {
    Write-Info "❌ Frontend dist directory not found - build may be missing"
}
Write-Info ""

Write-Section "PROCESS STATUS (Local)"
Write-Info "Local running processes:"
Get-Process | Where-Object {$_.ProcessName -match "node|python|django"} | Select-Object ProcessName, Id, CPU | Format-Table -AutoSize | Out-String | Add-Content -Path $reportFile
Write-Info ""

Write-Section "NETWORK CONNECTIVITY"
Write-Info "Testing network connectivity to live server..."

# Test DNS resolution
try {
    $dns = Resolve-DnsName "sppix.com" -Type A
    Write-Info "✅ DNS Resolution: $($dns.IPAddress -join ', ')"
} catch {
    Write-Info "❌ DNS Resolution failed: $($_.Exception.Message)"
}

# Test ping
try {
    $ping = Test-Connection "sppix.com" -Count 2 -Quiet
    if ($ping) {
        Write-Info "✅ Ping to sppix.com: Success"
    } else {
        Write-Info "❌ Ping to sppix.com: Failed"
    }
} catch {
    Write-Info "❌ Ping test failed: $($_.Exception.Message)"
}
Write-Info ""

Write-Section "COMPARISON SUMMARY"
Write-Info "🎯 KEY DIFFERENCES TO INVESTIGATE:"
Write-Info ""
Write-Info "1. 🔍 API BASE URLS:"
Write-Info "   Local:  http://127.0.0.1:8001"
Write-Info "   Live:   https://sppix.com"
Write-Info "   ➤ Check if frontend build uses correct live API URLs"
Write-Info ""
Write-Info "2. 🔍 ENVIRONMENT VARIABLES:"
Write-Info "   ➤ Compare .env files between local and live"
Write-Info "   ➤ Ensure VITE_API_BASE_URL is set correctly for production"
Write-Info ""
Write-Info "3. 🔍 BUILD PROCESS:"
Write-Info "   ➤ Verify frontend is built for production (not development)"
Write-Info "   ➤ Check if all assets are properly deployed"
Write-Info ""
Write-Info "4. 🔍 SERVER CONFIGURATION:"
Write-Info "   ➤ Nginx routing and proxy configuration"
Write-Info "   ➤ Django CORS and ALLOWED_HOSTS settings"
Write-Info ""
Write-Info "5. 🔍 SSL/HTTPS:"
Write-Info "   ➤ Mixed content issues (HTTP vs HTTPS)"
Write-Info "   ➤ Certificate configuration"
Write-Info ""

Write-Host ""
Write-Host "📋 COMPARISON COMPLETE!" -ForegroundColor Green
Write-Host "📄 Full report saved to: $reportFile" -ForegroundColor Yellow
Write-Host ""
Write-Host "🔧 RECOMMENDED NEXT STEPS:" -ForegroundColor Cyan
Write-Host "1. Run the Linux diagnosis script on your server" -ForegroundColor White
Write-Host "2. Compare API responses between local and live" -ForegroundColor White
Write-Host "3. Check frontend build configuration" -ForegroundColor White
Write-Host "4. Verify environment variables in production" -ForegroundColor White
Write-Host "5. Test individual components step by step" -ForegroundColor White
Write-Host ""
