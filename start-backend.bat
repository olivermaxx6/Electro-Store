@echo off
echo Starting Django Backend Server...
cd /d "%~dp0Backend"

REM Check if virtual environment exists
if exist "venv" (
    echo Activating virtual environment...
    call venv\Scripts\activate.bat
) else (
    echo Virtual environment not found. Creating one...
    python -m venv venv
    call venv\Scripts\activate.bat
    echo Installing dependencies...
    pip install -r requirements.txt
)

REM Run migrations
echo Running database migrations...
python manage.py migrate

REM Start the Django development server
echo Starting Django server on 127.0.0.1:8001...
echo Backend API will be available at: http://127.0.0.1:8001
echo Django Admin will be available at: http://127.0.0.1:8001/admin/
echo.
echo Default admin credentials:
echo Email: admin@example.com
echo Password: admin123
echo.
echo Press Ctrl+C to stop the server

REM Use the existing Python script to start Django
python scripts/run_django_dev.py
pause
