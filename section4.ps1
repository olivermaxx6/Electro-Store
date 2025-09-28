# Section 4: Update Django Settings (Windows PowerShell)
Write-Host "=== SECTION 4: Update Django Settings ===" -ForegroundColor Green

# Read password
$MYSQL_PASSWORD = (Get-Content "$env:USERPROFILE\mysql_pass.txt" | ForEach-Object { $_.Split(' ')[1] })
Write-Host "Retrieved password: $MYSQL_PASSWORD" -ForegroundColor Yellow

# Create settings patch
$settingsPatch = @"
# MySQL Configuration
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'myproject',
        'USER': 'django_user',
        'PASSWORD': '$MYSQL_PASSWORD',
        'HOST': 'localhost',
        'PORT': '3306',
        'OPTIONS': {'charset': 'utf8mb4'},
    }
}

# CORS for React frontends
INSTALLED_APPS = [
    ...,
    'corsheaders',  # Add this
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # Add first
    ...,
]

CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173", 
    "http://localhost:5174",
    "http://127.0.0.1:5174",
]
ALLOWED_HOSTS = ['localhost', '127.0.0.1']
"@

# Save settings patch
$settingsPatch | Out-File -FilePath "mysql_patch.py" -Encoding ASCII

Write-Host "✅ Section 4 Complete - Copy settings from mysql_patch.py to your settings.py" -ForegroundColor Green
Write-Host "👉 Manually update settings.py, then run Section 5" -ForegroundColor Cyan
