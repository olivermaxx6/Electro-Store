@echo off
echo Starting React Storefront...
cd /d "%~dp0Frontend"

REM Check if node_modules exists
if not exist "node_modules" (
    echo Node modules not found. Installing dependencies...
    npm install
)

echo Starting storefront development server on port 5173...
echo Storefront will be available at: http://localhost:5173
echo.
echo Features available:
echo - Product catalog and browsing
echo - Shopping cart and checkout
echo - User authentication
echo - Order tracking
echo - Wishlist functionality
echo.
echo Press Ctrl+C to stop the server

REM Start the storefront development server
npm run dev:storefront
pause
