# Django Development Server Launcher (PowerShell)
# Forces Django to run on 127.0.0.1:8001 in development

param(
    [string]$Host = "127.0.0.1",
    [string]$Port = "8001"
)

# Get the backend directory (parent of scripts)
$BackendDir = Split-Path -Parent $PSScriptRoot
Set-Location $BackendDir

# Set environment variables
$env:DJANGO_DEV_HOST = $Host
$env:DJANGO_DEV_PORT = $Port

Write-Host "Starting Django development server on ${Host}:${Port}..." -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ("-" * 50)

try {
    python manage.py runserver "${Host}:${Port}"
}
catch {
    Write-Host "Error starting server: $_" -ForegroundColor Red
    exit 1
}
