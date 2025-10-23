@echo off
REM Django Development Server Launcher (Windows Batch)
REM Forces Django to run on 127.0.0.1:8001 in development

cd /d "%~dp0.."

set DJANGO_DEV_HOST=127.0.0.1
set DJANGO_DEV_PORT=8001

echo Starting Django development server on 127.0.0.1:8001...
echo Press Ctrl+C to stop the server
echo --------------------------------------------------

python manage.py runserver 127.0.0.1:8001
