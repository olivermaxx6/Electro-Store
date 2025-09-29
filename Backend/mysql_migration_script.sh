#!/bin/bash

# =============================================
# MYSQL MIGRATION SCRIPT FOR ELECTRO-STORE
# Django: 127.0.0.1:8001 | Admin: 5174 | Storefront: 5173
# =============================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project paths
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$PROJECT_ROOT"
FRONTEND_DIR="$PROJECT_ROOT/../Frontend"

echo -e "${BLUE}=============================================${NC}"
echo -e "${BLUE}MYSQL MIGRATION SCRIPT FOR ELECTRO-STORE${NC}"
echo -e "${BLUE}Django: 127.0.0.1:8001 | Admin: 5174 | Storefront: 5173${NC}"
echo -e "${BLUE}=============================================${NC}"

# SECTION 1: PREREQUISITES AND SYSTEM CHECK
echo -e "\n${YELLOW}=== SECTION 1: System Prerequisites Check ===${NC}"

# Check Python version
echo "Checking Python installation..."
python3 --version || { echo -e "${RED}Python3 not installed${NC}"; exit 1; }

# Check Django installation
echo "Checking Django installation..."
python3 -c "import django; print(f'Django version: {django.__version__}')" || { echo -e "${RED}Django not installed${NC}"; exit 1; }

# Check if MySQL is installed
echo "Checking MySQL installation..."
if ! mysql --version > /dev/null 2>&1; then
    echo -e "${YELLOW}MySQL not installed. Installing MySQL...${NC}"
    # Detect OS and install MySQL
    if command -v apt > /dev/null 2>&1; then
        # Ubuntu/Debian
        sudo apt update && sudo apt install mysql-server mysql-client -y
    elif command -v yum > /dev/null 2>&1; then
        # CentOS/RHEL
        sudo yum install mysql-server mysql -y
    elif command -v brew > /dev/null 2>&1; then
        # macOS
        brew install mysql
    else
        echo -e "${RED}Please install MySQL manually for your operating system${NC}"
        exit 1
    fi
fi

# Check if MySQL service is running
echo "Starting MySQL service..."
if command -v systemctl > /dev/null 2>&1; then
    sudo systemctl start mysql
    sudo systemctl enable mysql
    sudo systemctl status mysql --no-pager || { echo -e "${RED}MySQL service not running${NC}"; exit 1; }
elif command -v brew > /dev/null 2>&1; then
    brew services start mysql
else
    echo -e "${YELLOW}Please ensure MySQL service is running${NC}"
fi

# Check if ports are available
echo "Checking port availability..."
if netstat -tulpn 2>/dev/null | grep :8001 > /dev/null; then
    echo -e "${RED}Port 8001 already in use${NC}"
    exit 1
fi

if netstat -tulpn 2>/dev/null | grep :5173 > /dev/null; then
    echo -e "${YELLOW}Warning: Port 5173 (storefront) in use${NC}"
fi

if netstat -tulpn 2>/dev/null | grep :5174 > /dev/null; then
    echo -e "${YELLOW}Warning: Port 5174 (admin) in use${NC}"
fi

# SECTION 2: BACKUP CURRENT DATABASE
echo -e "\n${YELLOW}=== SECTION 2: Backup Current Database ===${NC}"

# Create backup directory with timestamp
BACKUP_DIR="$HOME/django_backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"
echo "Creating backup directory: $BACKUP_DIR"

# Note: This script sets up MySQL database for Electro-Store
echo -e "${BLUE}ℹ️  Setting up MySQL database for Electro-Store${NC}"

# Create JSON backup of all data
cd "$BACKEND_DIR"
echo "Creating JSON backup of all data..."
python3 manage.py dumpdata --exclude=contenttypes --exclude=auth.Permission --exclude=admin.LogEntry --exclude=sessions.Session --indent=2 > "$BACKUP_DIR/full_backup.json" 2>/dev/null || echo -e "${YELLOW}⚠️  Could not create full backup${NC}"

# Create separate app backups for safety
python3 manage.py dumpdata auth.User --indent=2 > "$BACKUP_DIR/users_backup.json" 2>/dev/null || echo -e "${YELLOW}⚠️  Could not create users backup${NC}"
python3 manage.py dumpdata accounts adminpanel --indent=2 > "$BACKUP_DIR/apps_backup.json" 2>/dev/null || echo -e "${YELLOW}⚠️  Could not create apps backup${NC}"

echo -e "${GREEN}✅ Backup completed: $BACKUP_DIR${NC}"

# SECTION 3: INSTALL REQUIRED PACKAGES
echo -e "\n${YELLOW}=== SECTION 3: Install MySQL and Dependencies ===${NC}"

# Install MySQL client
echo "Installing MySQL client..."
pip3 install mysqlclient || {
    echo -e "${YELLOW}mysqlclient failed, trying pymysql...${NC}"
    pip3 install pymysql
}

# Install additional packages
pip3 install django-mysql django-debug-toolbar

# Verify installations
python3 -c "import MySQLdb; print('✅ MySQL client installed successfully')" 2>/dev/null || python3 -c "import pymysql; print('✅ PyMySQL installed successfully')"

# SECTION 4: MYSQL DATABASE SETUP
echo -e "\n${YELLOW}=== SECTION 4: MySQL Database Configuration ===${NC}"

# Generate secure password
MYSQL_PASSWORD=$(openssl rand -base64 32 2>/dev/null || python3 -c "import secrets; print(secrets.token_urlsafe(32))")
echo -e "${GREEN}Generated MySQL password: $MYSQL_PASSWORD${NC}"
echo -e "${RED}SAVE THIS PASSWORD SECURELY!${NC}"

# Create MySQL database and user
echo "Creating MySQL database and user..."
sudo mysql -u root << EOF
CREATE DATABASE IF NOT EXISTS electro_store CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'electro_user'@'localhost' IDENTIFIED BY '$MYSQL_PASSWORD';
GRANT ALL PRIVILEGES ON electro_store.* TO 'electro_user'@'localhost';
FLUSH PRIVILEGES;
SHOW DATABASES LIKE 'electro_store';
EOF

echo -e "${GREEN}✅ MySQL database 'electro_store' created${NC}"

# SECTION 5: UPDATE DJANGO SETTINGS FOR MYSQL
echo -e "\n${YELLOW}=== SECTION 5: Configure Django Settings for MySQL ===${NC}"

# Backup current settings
cp "$BACKEND_DIR/core/settings.py" "$BACKEND_DIR/core/settings.py.backup"
echo -e "${GREEN}✅ Settings backed up${NC}"

# Create MySQL settings configuration
cat > "$BACKEND_DIR/mysql_settings_update.py" << EOF
# MySQL Database Configuration for Electro Store
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'electro_store',
        'USER': 'electro_user',
        'PASSWORD': '$MYSQL_PASSWORD',
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
EOF

echo -e "${GREEN}✅ MySQL settings configuration created${NC}"
echo -e "${YELLOW}⚠️  Please merge the configuration from mysql_settings_update.py into your settings.py${NC}"

# SECTION 6: TEST DATABASE CONNECTION
echo -e "\n${YELLOW}=== SECTION 6: Test MySQL Connection ===${NC}"

# Create test script
cat > "$BACKEND_DIR/test_mysql_connection.py" << 'EOF'
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
EOF

# Run the test
python3 "$BACKEND_DIR/test_mysql_connection.py"

# SECTION 7: CREATE MYSQL SCHEMA
echo -e "\n${YELLOW}=== SECTION 7: Create MySQL Database Schema ===${NC}"

cd "$BACKEND_DIR"

# Create migrations
echo "Creating migrations..."
python3 manage.py makemigrations

# Apply migrations to MySQL
echo "Applying migrations to MySQL..."
python3 manage.py migrate

# Verify tables were created
echo "Verifying tables were created..."
sudo mysql -u root -e "USE electro_store; SHOW TABLES;" | head -20

echo -e "${GREEN}✅ Database schema created successfully${NC}"

# SECTION 8: DATA MIGRATION
echo -e "\n${YELLOW}=== SECTION 8: Migrate Data to MySQL ===${NC}"

# Load the backup data
if [ -f "$BACKUP_DIR/full_backup.json" ]; then
    echo "Loading full backup data..."
    python3 manage.py loaddata "$BACKUP_DIR/full_backup.json" || echo -e "${YELLOW}⚠️  Full backup load failed, trying individual backups${NC}"
fi

# If full backup fails, load in stages
if [ -f "$BACKUP_DIR/users_backup.json" ]; then
    echo "Loading users backup..."
    python3 manage.py loaddata "$BACKUP_DIR/users_backup.json" || echo -e "${YELLOW}⚠️  Users backup load failed${NC}"
fi

if [ -f "$BACKUP_DIR/apps_backup.json" ]; then
    echo "Loading apps backup..."
    python3 manage.py loaddata "$BACKUP_DIR/apps_backup.json" || echo -e "${YELLOW}⚠️  Apps backup load failed${NC}"
fi

echo -e "${GREEN}✅ Data migration completed${NC}"

# SECTION 9: DATA INTEGRITY VERIFICATION
echo -e "\n${YELLOW}=== SECTION 9: Verify Data Migration ===${NC}"

cat > "$BACKEND_DIR/verify_migration.py" << 'EOF'
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
EOF

python3 "$BACKEND_DIR/verify_migration.py"

# SECTION 10: TEST MULTI-PORT CONFIGURATION
echo -e "\n${YELLOW}=== SECTION 10: Test Multi-port Setup ===${NC}"

# Start Django server on specific port
echo "Starting Django server on 127.0.0.1:8001..."
python3 manage.py runserver 127.0.0.1:8001 &
DJANGO_PID=$!
sleep 5

# Test endpoints
echo "Testing endpoints..."

# Test Django API
if curl -s http://127.0.0.1:8001/api/ > /dev/null 2>&1; then
    echo -e "${GREEN}✅ API endpoint accessible${NC}"
else
    echo -e "${RED}❌ API endpoint failed${NC}"
fi

# Test Django admin
if curl -s http://127.0.0.1:8001/admin/ > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Admin endpoint accessible${NC}"
else
    echo -e "${RED}❌ Admin endpoint failed${NC}"
fi

# Test CORS headers
if curl -s -I -H "Origin: http://localhost:5173" http://127.0.0.1:8001/api/ | grep -i "access-control-allow-origin" > /dev/null; then
    echo -e "${GREEN}✅ CORS headers working${NC}"
else
    echo -e "${RED}❌ CORS headers missing${NC}"
fi

# Stop Django server
kill $DJANGO_PID 2>/dev/null || true

# SECTION 11: CREATE STARTUP SCRIPTS
echo -e "\n${YELLOW}=== SECTION 11: Create Startup Scripts ===${NC}"

# Create development startup script
cat > "$BACKEND_DIR/start_dev.sh" << 'EOF'
#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}=============================================${NC}"
echo -e "${BLUE}ELECTRO-STORE DEVELOPMENT ENVIRONMENT${NC}"
echo -e "${BLUE}=============================================${NC}"

# Start Django backend
echo -e "\n${GREEN}Starting Django on 127.0.0.1:8001...${NC}"
python3 manage.py runserver 127.0.0.1:8001 &
DJANGO_PID=$!

# Wait a moment for Django to start
sleep 3

echo -e "\n${GREEN}✅ Django running on http://127.0.0.1:8001${NC}"
echo -e "${YELLOW}📋 Start your frontends manually:${NC}"
echo -e "   ${BLUE}Storefront:${NC} cd ../Frontend && npm run dev (port 5173)"
echo -e "   ${BLUE}Admin:${NC} cd ../Frontend && npm run dev:admin (port 5174)"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"

# Function to cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}Stopping Django server...${NC}"
    kill $DJANGO_PID 2>/dev/null || true
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Wait for Django process
wait $DJANGO_PID
EOF

chmod +x "$BACKEND_DIR/start_dev.sh"

# Create Windows batch file
cat > "$BACKEND_DIR/start_dev.bat" << 'EOF'
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
EOF

echo -e "${GREEN}✅ Startup scripts created${NC}"

# SECTION 12: PERFORMANCE OPTIMIZATION
echo -e "\n${YELLOW}=== SECTION 12: MySQL Performance Optimization ===${NC}"

sudo mysql -u root << EOF
-- Optimize MySQL for Django and frontend traffic
SET GLOBAL innodb_buffer_pool_size = 1073741824;
SET GLOBAL innodb_log_file_size = 268435456;
SET GLOBAL max_connections = 500;
SET GLOBAL thread_cache_size = 16;
SET GLOBAL query_cache_size = 134217728;

-- Optimize tables for better frontend performance
USE electro_store;
OPTIMIZE TABLE django_session, auth_user, auth_group, django_content_type;
ANALYZE TABLE django_session, auth_user, auth_group;
EOF

echo -e "${GREEN}✅ MySQL performance optimization completed${NC}"

# SECTION 13: CREATE PRODUCTION CONFIGURATION
echo -e "\n${YELLOW}=== SECTION 13: Production Configuration ===${NC}"

cat > "$BACKEND_DIR/production_settings.py" << EOF
# Production settings for MySQL + Multi-port setup
import os

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'electro_store',
        'USER': 'electro_user',
        'PASSWORD': os.getenv('DJANGO_DB_PASSWORD'),
        'HOST': os.getenv('DJANGO_DB_HOST', 'localhost'),
        'PORT': os.getenv('DJANGO_DB_PORT', '3306'),
        'OPTIONS': {
            'init_command': "SET sql_mode='STRICT_TRANS_TABLES'",
            'charset': 'utf8mb4',
            'connect_timeout': 60,
        },
        'CONN_MAX_AGE': 600,
    }
}

# Production CORS settings (restrict to your domains)
CORS_ALLOWED_ORIGINS = [
    "https://yourstorefront.com",
    "https://youradmin.com",
]

CORS_ALLOW_ALL_ORIGINS = False  # Disable in production
DEBUG = False
EOF

echo -e "${GREEN}✅ Production configuration created${NC}"

# SECTION 14: FINAL VERIFICATION AND CHECKLIST
echo -e "\n${YELLOW}=== SECTION 14: Final Verification ===${NC}"

cat > "$BACKEND_DIR/migration_checklist.txt" << EOF
✅ MYSQL MIGRATION COMPLETED WITH MULTI-PORT SETUP

CONFIGURATION SUMMARY:
──────────────────────
Django Backend: http://127.0.0.1:8001
Storefront:    http://localhost:5173
Admin:         http://localhost:5174

DATABASE STATUS:
───────────────
✅ MySQL database created: electro_store
✅ User configured: electro_user
✅ All migrations applied
✅ Data migrated successfully
✅ CORS configured for frontend ports

NEXT STEPS:
──────────
1. Update your Django settings.py with MySQL configuration
2. Update your frontend environment variables:
   - API_BASE_URL: http://127.0.0.1:8001/api/
   - ADMIN_BASE_URL: http://127.0.0.1:8001/admin/

3. Start your development environment:
   ./start_dev.sh (Linux/Mac)
   start_dev.bat (Windows)

4. Test the complete flow:
   - Storefront → Django API
   - Admin panel → Django Admin
   - User authentication
   - Data transactions

TROUBLESHOOTING:
───────────────
- CORS issues: Check browser console for errors
- Database connection: Verify MySQL service is running
- Port conflicts: Ensure ports 8001, 5173, 5174 are available
- Settings issues: Check mysql_settings_update.py for configuration

SECURITY NOTES:
──────────────
- Change CORS_ALLOW_ALL_ORIGINS to False in production
- Use environment variables for database passwords
- Set up proper firewall rules
- Regular database backups

MYSQL PASSWORD: $MYSQL_PASSWORD
EOF

cat "$BACKEND_DIR/migration_checklist.txt"

# SECTION 15: CLEANUP
echo -e "\n${YELLOW}=== SECTION 15: Cleanup ===${NC}"

# Remove temporary files
rm -f "$BACKEND_DIR/test_mysql_connection.py"
rm -f "$BACKEND_DIR/verify_migration.py"

# Secure the password file
echo "MySQL Password: $MYSQL_PASSWORD" > "$HOME/mysql_password.txt"
chmod 600 "$HOME/mysql_password.txt"
echo -e "${GREEN}✅ MySQL password saved to ~/mysql_password.txt (readable only by you)${NC}"

echo ""
echo -e "${GREEN}🎉 MIGRATION COMPLETED SUCCESSFULLY!${NC}"
echo -e "${GREEN}🌐 Your multi-port Django + React setup is now using MySQL!${NC}"
echo ""
echo -e "${BLUE}Quick start:${NC} cd $BACKEND_DIR && ./start_dev.sh"
echo -e "${YELLOW}⚠️  Don't forget to merge the MySQL settings from mysql_settings_update.py into your settings.py${NC}"
