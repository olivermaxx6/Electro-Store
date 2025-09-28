@echo off
setlocal enabledelayedexpansion

REM =============================================
REM ELECTRO-STORE DEVELOPMENT ENVIRONMENT
REM Django: 127.0.0.1:8001 | Admin: 5174 | Storefront: 5173
REM =============================================

echo =============================================
echo ELECTRO-STORE DEVELOPMENT ENVIRONMENT
echo =============================================

REM Get the directory where this script is located
set "SCRIPT_DIR=%~dp0"
set "BACKEND_DIR=%SCRIPT_DIR%"
set "FRONTEND_DIR=%SCRIPT_DIR%..\Frontend"

REM Check if we're in the Backend directory
if not exist "%BACKEND_DIR%manage.py" (
    echo Error: This script must be run from the Backend directory
    echo Current directory: %CD%
    echo Expected manage.py at: %BACKEND_DIR%manage.py
    pause
    exit /b 1
)

REM Check if Frontend directory exists
if not exist "%FRONTEND_DIR%" (
    echo Warning: Frontend directory not found at %FRONTEND_DIR%
    echo You'll need to start your frontend manually
)

echo.
echo Checking port availability...

REM Check if port 8001 is in use
netstat -an | findstr ":8001 " >nul
if %errorlevel% == 0 (
    echo ❌ Port 8001 is already in use
    echo Please stop the service using port 8001 and try again
    pause
    exit /b 1
) else (
    echo ✅ Port 8001 is available
)

REM Check other ports
netstat -an | findstr ":5173 " >nul
if %errorlevel% == 0 (
    echo ⚠️  Port 5173 (storefront) is in use
)

netstat -an | findstr ":5174 " >nul
if %errorlevel% == 0 (
    echo ⚠️  Port 5174 (admin) is in use
)

echo.
echo Starting Django on 127.0.0.1:8001...

REM Change to backend directory
cd /d "%BACKEND_DIR%"

REM Check if virtual environment exists and activate it
if exist "venv\Scripts\activate.bat" (
    echo Activating virtual environment...
    call venv\Scripts\activate.bat
) else if exist "..\venv\Scripts\activate.bat" (
    echo Activating virtual environment...
    call ..\venv\Scripts\activate.bat
)

REM Start Django server
start /B python manage.py runserver 127.0.0.1:8001

REM Wait for Django to start
echo Waiting for Django to start...
timeout /t 5 /nobreak > nul

echo.
echo =============================================
echo DEVELOPMENT ENVIRONMENT READY
echo =============================================
echo Backend API: http://127.0.0.1:8001/api/
echo Django Admin: http://127.0.0.1:8001/admin/
echo Health Check: http://127.0.0.1:8001/health/

echo.
echo 📋 Start your frontends manually:
if exist "%FRONTEND_DIR%" (
    echo    Storefront: cd "%FRONTEND_DIR%" ^&^& npm run dev (port 5173)
    echo    Admin: cd "%FRONTEND_DIR%" ^&^& npm run dev:admin (port 5174)
) else (
    echo    Frontend directory not found at: %FRONTEND_DIR%
    echo    Please start your frontend manually
)

echo.
echo 🔧 Useful commands:
echo    Create superuser: python manage.py createsuperuser
echo    Run migrations: python manage.py migrate
echo    Collect static: python manage.py collectstatic

echo.
echo Press any key to stop Django server...
pause > nul

echo.
echo Stopping Django server...
taskkill /F /IM python.exe 2>nul
echo ✅ Django server stopped
