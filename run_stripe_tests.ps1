# Stripe Integration Test Runner Script
# This script runs both Django backend and React frontend Stripe integration tests

Write-Host "🚀 Stripe Integration Test Suite" -ForegroundColor Green
Write-Host "=" * 50 -ForegroundColor Green

# Configuration
$BackendPath = "Backend"
$FrontendPath = "Frontend"
$TestResults = @()

function Test-Command {
    param($Command)
    try {
        Get-Command $Command -ErrorAction Stop
        return $true
    }
    catch {
        return $false
    }
}

function Run-BackendTests {
    Write-Host "`n🧪 Running Django Backend Stripe Tests..." -ForegroundColor Yellow
    
    if (-not (Test-Path $BackendPath)) {
        Write-Host "❌ Backend directory not found: $BackendPath" -ForegroundColor Red
        return $false
    }
    
    Push-Location $BackendPath
    
    try {
        # Check if Python is available
        if (-not (Test-Command "python")) {
            Write-Host "❌ Python not found. Please install Python to run backend tests." -ForegroundColor Red
            return $false
        }
        
        # Check if Django is available
        try {
            python -c "import django; print('Django available')" 2>$null
            if ($LASTEXITCODE -ne 0) {
                Write-Host "❌ Django not available. Please install requirements." -ForegroundColor Red
                return $false
            }
        }
        catch {
            Write-Host "❌ Django not available. Please install requirements." -ForegroundColor Red
            return $false
        }
        
        # Run Stripe integration tests
        Write-Host "Running Stripe integration tests..." -ForegroundColor Cyan
        python test_runner.py
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Backend tests passed!" -ForegroundColor Green
            $script:TestResults += "Backend: PASSED"
            return $true
        }
        else {
            Write-Host "❌ Backend tests failed!" -ForegroundColor Red
            $script:TestResults += "Backend: FAILED"
            return $false
        }
    }
    catch {
        Write-Host "❌ Error running backend tests: $_" -ForegroundColor Red
        $script:TestResults += "Backend: ERROR"
        return $false
    }
    finally {
        Pop-Location
    }
}

function Run-FrontendTests {
    Write-Host "`n🧪 Running React Frontend Stripe Tests..." -ForegroundColor Yellow
    
    if (-not (Test-Path $FrontendPath)) {
        Write-Host "❌ Frontend directory not found: $FrontendPath" -ForegroundColor Red
        return $false
    }
    
    Push-Location $FrontendPath
    
    try {
        # Check if Node.js is available
        if (-not (Test-Command "node")) {
            Write-Host "❌ Node.js not found. Please install Node.js to run frontend tests." -ForegroundColor Red
            return $false
        }
        
        # Check if npm is available
        if (-not (Test-Command "npm")) {
            Write-Host "❌ npm not found. Please install npm to run frontend tests." -ForegroundColor Red
            return $false
        }
        
        # Install dependencies if needed
        if (-not (Test-Path "node_modules")) {
            Write-Host "Installing dependencies..." -ForegroundColor Cyan
            npm install
            if ($LASTEXITCODE -ne 0) {
                Write-Host "❌ Failed to install dependencies." -ForegroundColor Red
                return $false
            }
        }
        
        # Install test dependencies if needed
        $packageJson = Get-Content "package.json" | ConvertFrom-Json
        $hasTestDeps = $packageJson.devDependencies -and (
            $packageJson.devDependencies.'@testing-library/react' -or
            $packageJson.devDependencies.'jest' -or
            $packageJson.devDependencies.'msw'
        )
        
        if (-not $hasTestDeps) {
            Write-Host "Installing test dependencies..." -ForegroundColor Cyan
            npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event jest jest-environment-jsdom msw @types/jest
        }
        
        # Run Stripe integration tests
        Write-Host "Running Stripe integration tests..." -ForegroundColor Cyan
        
        # Check if Jest is configured
        if (Test-Path "jest.config.js" -or (Test-Content "package.json" | Select-String "jest")) {
            npm run test:stripe
        }
        else {
            # Run with Jest directly
            npx jest --testPathPattern=PaymentForm.integration.test.tsx --verbose
        }
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Frontend tests passed!" -ForegroundColor Green
            $script:TestResults += "Frontend: PASSED"
            return $true
        }
        else {
            Write-Host "❌ Frontend tests failed!" -ForegroundColor Red
            $script:TestResults += "Frontend: FAILED"
            return $false
        }
    }
    catch {
        Write-Host "❌ Error running frontend tests: $_" -ForegroundColor Red
        $script:TestResults += "Frontend: ERROR"
        return $false
    }
    finally {
        Pop-Location
    }
}

function Show-TestSummary {
    Write-Host "`n📊 Test Summary" -ForegroundColor Green
    Write-Host "=" * 30 -ForegroundColor Green
    
    foreach ($result in $TestResults) {
        if ($result.EndsWith("PASSED")) {
            Write-Host "✅ $result" -ForegroundColor Green
        }
        elseif ($result.EndsWith("FAILED")) {
            Write-Host "❌ $result" -ForegroundColor Red
        }
        else {
            Write-Host "⚠️ $result" -ForegroundColor Yellow
        }
    }
    
    $passedCount = ($TestResults | Where-Object { $_.EndsWith("PASSED") }).Count
    $totalCount = $TestResults.Count
    
    Write-Host "`nResults: $passedCount/$totalCount test suites passed" -ForegroundColor $(if ($passedCount -eq $totalCount) { "Green" } else { "Red" })
    
    if ($passedCount -eq $totalCount) {
        Write-Host "`n🎉 All Stripe integration tests passed!" -ForegroundColor Green
        Write-Host "Your Stripe integration is working correctly!" -ForegroundColor Green
        exit 0
    }
    else {
        Write-Host "`n💥 Some tests failed. Please check the output above." -ForegroundColor Red
        exit 1
    }
}

function Show-Help {
    Write-Host "Stripe Integration Test Runner" -ForegroundColor Green
    Write-Host ""
    Write-Host "Usage: .\run_stripe_tests.ps1 [options]" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Options:" -ForegroundColor Yellow
    Write-Host "  --backend-only    Run only backend tests" -ForegroundColor White
    Write-Host "  --frontend-only   Run only frontend tests" -ForegroundColor White
    Write-Host "  --help           Show this help message" -ForegroundColor White
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor Yellow
    Write-Host "  .\run_stripe_tests.ps1                # Run all tests" -ForegroundColor White
    Write-Host "  .\run_stripe_tests.ps1 --backend-only # Run only Django tests" -ForegroundColor White
    Write-Host "  .\run_stripe_tests.ps1 --frontend-only # Run only React tests" -ForegroundColor White
}

# Main execution
if ($args -contains "--help" -or $args -contains "-h") {
    Show-Help
    exit 0
}

# Check for specific test options
$runBackendOnly = $args -contains "--backend-only"
$runFrontendOnly = $args -contains "--frontend-only"

# Run tests based on options
$backendSuccess = $true
$frontendSuccess = $true

if ($runFrontendOnly) {
    Write-Host "Running frontend tests only..." -ForegroundColor Cyan
    $frontendSuccess = Run-FrontendTests
}
elseif ($runBackendOnly) {
    Write-Host "Running backend tests only..." -ForegroundColor Cyan
    $backendSuccess = Run-BackendTests
}
else {
    # Run both tests
    $backendSuccess = Run-BackendTests
    $frontendSuccess = Run-FrontendTests
}

# Show summary
Show-TestSummary
