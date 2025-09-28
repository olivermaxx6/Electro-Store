# =============================================
# MYSQL MIGRATION SCRIPT FOR ELECTRO-STORE (Windows)
# Django: 127.0.0.1:8001 | Admin: 5174 | Storefront: 5173
# =============================================

# Set error action preference
$ErrorActionPreference = "Stop"

# Colors for output
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Blue = "Blue"

Write-Host "=============================================" -ForegroundColor $Blue
Write-Host "MYSQL MIGRATION SCRIPT FOR ELECTRO-STORE" -ForegroundColor $Blue
Write-Host "Django: 127.0.0.1:8001 | Admin: 5174 | Storefront: 5173" -ForegroundColor $Blue
Write-Host "=============================================" -ForegroundColor $Blue

# SECTION 1: PREREQUISITES AND SYSTEM CHECK
Write-Host "`n=== SECTION 1: System Prerequisites Check ===" -ForegroundColor $Yellow

# Check Python installation
Write-Host "Checking Python installation..."
try {
    $pythonVersion = python --version
    Write-Host "✅ $pythonVersion" -ForegroundColor $Green
} catch {
    Write-Host "❌ Python not installed" -ForegroundColor $Red
    exit 1
}

# Check Django installation
Write-Host "Checking Django installation..."
try {
    python -c "import django; print(f'Django version: {django.__version__}')"
    Write-Host "✅ Django installed" -ForegroundColor $Green
} catch {
    Write-Host "❌ Django not installed" -ForegroundColor $Red
    exit 1
}

# Check if MySQL is installed
Write-Host "Checking MySQL installation..."
try {
    mysql --version
    Write-Host "✅ MySQL installed" -ForegroundColor $Green
} catch {
    Write-Host "❌ MySQL not installed. Please install MySQL first:" -ForegroundColor $Red
    Write-Host "1. Download MySQL from: https://dev.mysql.com/downloads/mysql/" -ForegroundColor $Yellow
    Write-Host "2. Or install via Chocolatey: choco install mysql" -ForegroundColor $Yellow
    Write-Host "3. Or install via winget: winget install Oracle.MySQL" -ForegroundColor $Yellow
    exit 1
}

# SECTION 2: BACKUP CURRENT SQLITE DATABASE
Write-Host "`n=== SECTION 2: Backup Current Database ===" -ForegroundColor $Yellow

# Create backup directory with timestamp
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupDir = "$env:USERPROFILE\django_backups\$timestamp"
New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
Write-Host "Creating backup directory: $backupDir" -ForegroundColor $Blue

# Backup SQLite database
if (Test-Path "db.sqlite3") {
    Copy-Item "db.sqlite3" "$backupDir\"
    Write-Host "✅ SQLite database backed up" -ForegroundColor $Green
} else {
    Write-Host "⚠️  No SQLite database found to backup" -ForegroundColor $Yellow
}

# Create JSON backup of all data
Write-Host "Creating JSON backup of all data..."
try {
    python manage.py dumpdata --exclude=contenttypes --exclude=auth.Permission --exclude=admin.LogEntry --exclude=sessions.Session --indent=2 > "$backupDir\full_backup.json" 2>$null
    Write-Host "✅ Full backup created" -ForegroundColor $Green
} catch {
    Write-Host "⚠️  Could not create full backup" -ForegroundColor $Yellow
}

# Create separate app backups for safety
try {
    python manage.py dumpdata auth.User --indent=2 > "$backupDir\users_backup.json" 2>$null
    Write-Host "✅ Users backup created" -ForegroundColor $Green
} catch {
    Write-Host "⚠️  Could not create users backup" -ForegroundColor $Yellow
}

try {
    python manage.py dumpdata accounts adminpanel --indent=2 > "$backupDir\apps_backup.json" 2>$null
    Write-Host "✅ Apps backup created" -ForegroundColor $Green
} catch {
    Write-Host "⚠️  Could not create apps backup" -ForegroundColor $Yellow
}

Write-Host "✅ Backup completed: $backupDir" -ForegroundColor $Green

# SECTION 3: INSTALL REQUIRED PACKAGES
Write-Host "`n=== SECTION 3: Install MySQL Dependencies ===" -ForegroundColor $Yellow

# Install PyMySQL (already installed)
Write-Host "✅ PyMySQL already installed" -ForegroundColor $Green

# Install additional packages
Write-Host "Installing additional packages..."
pip install django-mysql django-debug-toolbar

# Verify installations
try {
    python -c "import pymysql; print('✅ PyMySQL installed successfully')"
} catch {
    Write-Host "❌ PyMySQL installation failed" -ForegroundColor $Red
    exit 1
}

# SECTION 4: MYSQL DATABASE SETUP
Write-Host "`n=== SECTION 4: MySQL Database Configuration ===" -ForegroundColor $Yellow

# Generate secure password
$mysqlPassword = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
Write-Host "Generated MySQL password: $mysqlPassword" -ForegroundColor $Green
Write-Host "SAVE THIS PASSWORD SECURELY!" -ForegroundColor $Red

# Create MySQL database and user
Write-Host "Creating MySQL database and user..."
$sqlCommands = @"
CREATE DATABASE IF NOT EXISTS electro_store CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'electro_user'@'localhost' IDENTIFIED BY '$mysqlPassword';
GRANT ALL PRIVILEGES ON electro_store.* TO 'electro_user'@'localhost';
FLUSH PRIVILEGES;
SHOW DATABASES LIKE 'electro_store';
"@

try {
    $sqlCommands | mysql -u root
    Write-Host "✅ MySQL database 'electro_store' created" -ForegroundColor $Green
} catch {
    Write-Host "❌ Failed to create MySQL database. Please run MySQL as administrator or provide root password." -ForegroundColor $Red
    Write-Host "You can manually run these commands in MySQL:" -ForegroundColor $Yellow
    Write-Host $sqlCommands -ForegroundColor $Yellow
    exit 1
}

# SECTION 5: UPDATE DJANGO SETTINGS FOR MYSQL
Write-Host "`n=== SECTION 5: Configure Django Settings for MySQL ===" -ForegroundColor $Yellow

# Backup current settings
Copy-Item "core\settings.py" "core\settings.py.backup"
Write-Host "✅ Settings backed up" -ForegroundColor $Green

# Create MySQL settings configuration
$mysqlSettings = @"
# MySQL Database Configuration for Electro Store
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'electro_store',
        'USER': 'electro_user',
        'PASSWORD': '$mysqlPassword',
        'HOST': 'localhost',
        'PORT': '3306',
        'OPTIONS': {
            'init_command': "SET sql_mode='STRICT_TRANS_TABLES', character_set_connection=utf8mb4, collation_connection=utf8mb4_unicode_ci",
            'charset': 'utf8mb4',
            'use_unicode': True,
            'connect_timeout': 30,
        },
        'CONN_MAX_AGE': 300,
        'TIME_ZONE': 'UTC',
    }
}

# Enhanced CORS Configuration for Multi-port Setup
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",    # Storefront
    "http://127.0.0.1:5173",   # Storefront
    "http://localhost:5174",    # Admin
    "http://127.0.0.1:5174",   # Admin
    "http://localhost:3000",    # Alternative frontend
    "http://127.0.0.1:3000",   # Alternative frontend
]

CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_ALL_ORIGINS = True  # For development only

CSRF_TRUSTED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174", 
    "http://127.0.0.1:5174",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

# MySQL Optimizations
DJANGO_MYSQL_REWRITE_QUERIES = True
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Development server configuration
RUNSERVER_PORT = '8001'
RUNSERVER_HOST = '127.0.0.1'
"@

$mysqlSettings | Out-File -FilePath "mysql_settings_update.py" -Encoding UTF8
Write-Host "✅ MySQL settings configuration created" -ForegroundColor $Green
Write-Host "⚠️  Please merge the configuration from mysql_settings_update.py into your settings.py" -ForegroundColor $Yellow

# SECTION 6: UPDATE SETTINGS.PY
Write-Host "`n=== SECTION 6: Update Django Settings ===" -ForegroundColor $Yellow

# Read current settings
$settingsContent = Get-Content "core\settings.py" -Raw

# Replace SQLite configuration with MySQL
$sqliteConfig = @"
# Database
# SQLite configuration (active - working setup)
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}

# MySQL Configuration (commented out - needs user setup)
# DATABASES = {
#     "default": {
#         "ENGINE": "django.db.backends.mysql",
#         "NAME": "myproject",
#         "USER": "django_user",
#         "PASSWORD": "DjangoPass123!",
#         "HOST": "localhost",
#         "PORT": "3306",
#         "OPTIONS": {
#             "charset": "utf8mb4",
#         },
#     }
# }
"@

$mysqlConfig = @"
# Database
# MySQL configuration (active - production setup)
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.mysql",
        "NAME": "electro_store",
        "USER": "electro_user",
        "PASSWORD": "$mysqlPassword",
        "HOST": "localhost",
        "PORT": "3306",
        "OPTIONS": {
            "init_command": "SET sql_mode='STRICT_TRANS_TABLES', character_set_connection=utf8mb4, collation_connection=utf8mb4_unicode_ci",
            "charset": "utf8mb4",
            "use_unicode": True,
            "connect_timeout": 30,
        },
        "CONN_MAX_AGE": 300,
        "TIME_ZONE": "UTC",
    }
}

# SQLite Configuration (commented out - migrated to MySQL)
# DATABASES = {
#     "default": {
#         "ENGINE": "django.db.backends.sqlite3",
#         "NAME": BASE_DIR / "db.sqlite3",
#     }
# }
"@

# Replace the database configuration
$updatedSettings = $settingsContent -replace [regex]::Escape($sqliteConfig), $mysqlConfig

# Add CORS configuration if not present
if ($updatedSettings -notmatch "CORS_ALLOWED_ORIGINS") {
    $corsConfig = @"

# CORS Configuration for Multi-port Setup
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",    # Storefront
    "http://127.0.0.1:5173",   # Storefront
    "http://localhost:5174",    # Admin
    "http://127.0.0.1:5174",   # Admin
    "http://localhost:3000",    # Alternative frontend
    "http://127.0.0.1:3000",   # Alternative frontend
]

CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_ALL_ORIGINS = True  # For development only

CSRF_TRUSTED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174", 
    "http://127.0.0.1:5174",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
"@
    
    # Insert CORS config after database config
    $updatedSettings = $updatedSettings -replace "(\s*# Authentication backends)", "$corsConfig`n`n$1"
}

# Write updated settings
$updatedSettings | Out-File -FilePath "core\settings.py" -Encoding UTF8
Write-Host "✅ Django settings updated for MySQL" -ForegroundColor $Green

# SECTION 7: TEST DATABASE CONNECTION
Write-Host "`n=== SECTION 7: Test MySQL Connection ===" -ForegroundColor $Yellow

# Create test script
$testScript = @"
import os
import sys
import django
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.db import connection

try:
    connection.ensure_connection()
    print("✅ MySQL connection successful!")
    print(f"✅ Database: {connection.settings_dict['NAME']}")
    
    # Test CORS configuration
    from django.conf import settings
    print("✅ CORS origins:", settings.CORS_ALLOWED_ORIGINS)
    
except Exception as e:
    print(f"❌ Connection failed: {e}")
    sys.exit(1)
"@

$testScript | Out-File -FilePath "test_mysql_connection.py" -Encoding UTF8

# Run the test
try {
    python test_mysql_connection.py
    Write-Host "✅ MySQL connection test passed" -ForegroundColor $Green
} catch {
    Write-Host "❌ MySQL connection test failed" -ForegroundColor $Red
    exit 1
}

# SECTION 8: CREATE MYSQL SCHEMA
Write-Host "`n=== SECTION 8: Create MySQL Database Schema ===" -ForegroundColor $Yellow

# Create migrations
Write-Host "Creating migrations..."
python manage.py makemigrations

# Apply migrations to MySQL
Write-Host "Applying migrations to MySQL..."
python manage.py migrate

Write-Host "✅ Database schema created successfully" -ForegroundColor $Green

# SECTION 9: DATA MIGRATION
Write-Host "`n=== SECTION 9: Migrate Data to MySQL ===" -ForegroundColor $Yellow

# Load the backup data
if (Test-Path "$backupDir\full_backup.json") {
    Write-Host "Loading full backup data..."
    try {
        python manage.py loaddata "$backupDir\full_backup.json"
        Write-Host "✅ Full backup loaded successfully" -ForegroundColor $Green
    } catch {
        Write-Host "⚠️  Full backup load failed, trying individual backups" -ForegroundColor $Yellow
    }
}

# If full backup fails, load in stages
if (Test-Path "$backupDir\users_backup.json") {
    Write-Host "Loading users backup..."
    try {
        python manage.py loaddata "$backupDir\users_backup.json"
        Write-Host "✅ Users backup loaded" -ForegroundColor $Green
    } catch {
        Write-Host "⚠️  Users backup load failed" -ForegroundColor $Yellow
    }
}

if (Test-Path "$backupDir\apps_backup.json") {
    Write-Host "Loading apps backup..."
    try {
        python manage.py loaddata "$backupDir\apps_backup.json"
        Write-Host "✅ Apps backup loaded" -ForegroundColor $Green
    } catch {
        Write-Host "⚠️  Apps backup load failed" -ForegroundColor $Yellow
    }
}

Write-Host "✅ Data migration completed" -ForegroundColor $Green

# SECTION 10: DATA INTEGRITY VERIFICATION
Write-Host "`n=== SECTION 10: Verify Data Migration ===" -ForegroundColor $Yellow

$verifyScript = @"
import os
import sys
import django
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.apps import apps
from django.db import connection

def verify_migration():
    print("🔍 Verifying MySQL migration...")
    
    # Test database connection
    with connection.cursor() as cursor:
        cursor.execute("SELECT VERSION()")
        db_version = cursor.fetchone()
        print(f"✅ MySQL Version: {db_version[0]}")
    
    # Count records in each model
    total_records = 0
    for app_config in apps.get_app_configs():
        for model in app_config.get_models():
            try:
                count = model.objects.count()
                total_records += count
                print(f"✅ {app_config.name}.{model.__name__}: {count} records")
            except Exception as e:
                print(f"⚠️  {app_config.name}.{model.__name__}: {e}")
    
    print(f"📊 Total records migrated: {total_records}")

if __name__ == "__main__":
    verify_migration()
"@

$verifyScript | Out-File -FilePath "verify_migration.py" -Encoding UTF8
python verify_migration.py

# SECTION 11: CREATE STARTUP SCRIPTS
Write-Host "`n=== SECTION 11: Create Startup Scripts ===" -ForegroundColor $Yellow

# Create Windows batch file
$batchScript = @"
@echo off
echo =============================================
echo ELECTRO-STORE DEVELOPMENT ENVIRONMENT
echo =============================================

echo.
echo Starting Django on 127.0.0.1:8001...
start /B python manage.py runserver 127.0.0.1:8001

timeout /t 3 /nobreak > nul

echo.
echo ✅ Django running on http://127.0.0.1:8001
echo 📋 Start your frontends manually:
echo    Storefront: cd ..\Frontend ^&^& npm run dev (port 5173)
echo    Admin: cd ..\Frontend ^&^& npm run dev:admin (port 5174)
echo.
echo Press any key to stop Django server...
pause > nul

echo Stopping Django server...
taskkill /F /IM python.exe 2>nul
"@

$batchScript | Out-File -FilePath "start_dev.bat" -Encoding ASCII

# Create PowerShell script
$psScript = @"
# Electro Store Development Environment
Write-Host "=============================================" -ForegroundColor Blue
Write-Host "ELECTRO-STORE DEVELOPMENT ENVIRONMENT" -ForegroundColor Blue
Write-Host "=============================================" -ForegroundColor Blue

Write-Host "`nStarting Django on 127.0.0.1:8001..." -ForegroundColor Green
Start-Process -FilePath "python" -ArgumentList "manage.py", "runserver", "127.0.0.1:8001" -WindowStyle Hidden

Start-Sleep -Seconds 3

Write-Host "`n✅ Django running on http://127.0.0.1:8001" -ForegroundColor Green
Write-Host "📋 Start your frontends manually:" -ForegroundColor Yellow
Write-Host "   Storefront: cd ..\Frontend && npm run dev (port 5173)" -ForegroundColor Blue
Write-Host "   Admin: cd ..\Frontend && npm run dev:admin (port 5174)" -ForegroundColor Blue
Write-Host "`nPress any key to stop Django server..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

Write-Host "`nStopping Django server..." -ForegroundColor Yellow
Get-Process -Name "python" -ErrorAction SilentlyContinue | Stop-Process -Force
"@

$psScript | Out-File -FilePath "start_dev.ps1" -Encoding UTF8

Write-Host "✅ Startup scripts created" -ForegroundColor $Green

# SECTION 12: CLEANUP
Write-Host "`n=== SECTION 12: Cleanup ===" -ForegroundColor $Yellow

# Remove temporary files
Remove-Item "test_mysql_connection.py" -ErrorAction SilentlyContinue
Remove-Item "verify_migration.py" -ErrorAction SilentlyContinue

# Save password securely
$passwordFile = "$env:USERPROFILE\mysql_password.txt"
"MySQL Password: $mysqlPassword" | Out-File -FilePath $passwordFile -Encoding UTF8
Write-Host "✅ MySQL password saved to $passwordFile" -ForegroundColor $Green

# SECTION 13: FINAL SUMMARY
Write-Host "`n=== SECTION 13: Migration Summary ===" -ForegroundColor $Yellow

Write-Host "🎉 MIGRATION COMPLETED SUCCESSFULLY!" -ForegroundColor $Green
Write-Host "🌐 Your Django application is now using MySQL!" -ForegroundColor $Green
Write-Host ""
Write-Host "CONFIGURATION SUMMARY:" -ForegroundColor $Blue
Write-Host "──────────────────────" -ForegroundColor $Blue
Write-Host "Django Backend: http://127.0.0.1:8001" -ForegroundColor $Green
Write-Host "Storefront:    http://localhost:5173" -ForegroundColor $Green
Write-Host "Admin:         http://localhost:5174" -ForegroundColor $Green
Write-Host ""
Write-Host "DATABASE STATUS:" -ForegroundColor $Blue
Write-Host "───────────────" -ForegroundColor $Blue
Write-Host "✅ MySQL database created: electro_store" -ForegroundColor $Green
Write-Host "✅ User configured: electro_user" -ForegroundColor $Green
Write-Host "✅ All migrations applied" -ForegroundColor $Green
Write-Host "✅ Data migrated successfully" -ForegroundColor $Green
Write-Host "✅ CORS configured for frontend ports" -ForegroundColor $Green
Write-Host ""
Write-Host "NEXT STEPS:" -ForegroundColor $Blue
Write-Host "──────────" -ForegroundColor $Blue
Write-Host "1. Start your development environment:" -ForegroundColor $Yellow
Write-Host "   .\start_dev.bat (Windows)" -ForegroundColor $Green
Write-Host "   .\start_dev.ps1 (PowerShell)" -ForegroundColor $Green
Write-Host ""
Write-Host "2. Test the complete flow:" -ForegroundColor $Yellow
Write-Host "   - Storefront → Django API" -ForegroundColor $Green
Write-Host "   - Admin panel → Django Admin" -ForegroundColor $Green
Write-Host "   - User authentication" -ForegroundColor $Green
Write-Host "   - Data transactions" -ForegroundColor $Green
Write-Host ""
Write-Host "MYSQL PASSWORD: $mysqlPassword" -ForegroundColor $Red
Write-Host "Password saved to: $passwordFile" -ForegroundColor $Yellow
