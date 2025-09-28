#!/usr/bin/env python
"""
MySQL Connection Test Script for Electro-Store Migration
Run this script after installing MySQL to test the connection
"""

import os
import sys
import django
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

# Set Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

try:
    django.setup()
    print("✅ Django setup successful")
except Exception as e:
    print(f"❌ Django setup failed: {e}")
    sys.exit(1)

from django.db import connection
from django.conf import settings

def test_mysql_connection():
    """Test MySQL database connection"""
    print("🔍 Testing MySQL connection...")
    
    try:
        # Test connection
        connection.ensure_connection()
        print("✅ MySQL connection successful!")
        
        # Get database info
        db_settings = connection.settings_dict
        print(f"✅ Database: {db_settings['NAME']}")
        print(f"✅ Host: {db_settings['HOST']}")
        print(f"✅ Port: {db_settings['PORT']}")
        print(f"✅ User: {db_settings['USER']}")
        
        # Test query
        with connection.cursor() as cursor:
            cursor.execute("SELECT VERSION()")
            version = cursor.fetchone()
            print(f"✅ MySQL Version: {version[0]}")
            
            cursor.execute("SELECT DATABASE()")
            current_db = cursor.fetchone()
            print(f"✅ Current Database: {current_db[0]}")
        
        # Test CORS configuration
        print(f"✅ CORS Origins: {settings.CORS_ALLOWED_ORIGINS}")
        
        return True
        
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        print("\nTroubleshooting steps:")
        print("1. Check if MySQL service is running: net start mysql")
        print("2. Verify database exists: mysql -u root -p")
        print("3. Check credentials in core/settings.py")
        print("4. Test connection: mysql -u electro_user -p electro_store")
        return False

def test_django_models():
    """Test Django models and migrations"""
    print("\n🔍 Testing Django models...")
    
    try:
        from django.apps import apps
        
        # Check if migrations are needed
        from django.core.management import call_command
        from io import StringIO
        
        # Capture makemigrations output
        out = StringIO()
        call_command('makemigrations', '--dry-run', stdout=out)
        output = out.getvalue()
        
        if "No changes detected" in output:
            print("✅ No pending migrations")
        else:
            print("⚠️  Pending migrations detected")
            print("Run: python manage.py makemigrations && python manage.py migrate")
        
        # Count models
        total_models = 0
        for app_config in apps.get_app_configs():
            models = app_config.get_models()
            total_models += len(models)
            print(f"✅ {app_config.name}: {len(models)} models")
        
        print(f"✅ Total models: {total_models}")
        return True
        
    except Exception as e:
        print(f"❌ Model test failed: {e}")
        return False

def main():
    """Main test function"""
    print("=" * 50)
    print("ELECTRO-STORE MYSQL CONNECTION TEST")
    print("=" * 50)
    
    # Test MySQL connection
    connection_ok = test_mysql_connection()
    
    if connection_ok:
        # Test Django models
        models_ok = test_django_models()
        
        if models_ok:
            print("\n🎉 All tests passed! MySQL migration is ready.")
            print("\nNext steps:")
            print("1. Run: python manage.py makemigrations")
            print("2. Run: python manage.py migrate")
            print("3. Run: python manage.py loaddata sqlite_backup.json")
            print("4. Test: python manage.py runserver 127.0.0.1:8001")
        else:
            print("\n⚠️  Connection OK but model issues detected")
    else:
        print("\n❌ Connection failed. Please fix MySQL setup first.")
        sys.exit(1)

if __name__ == "__main__":
    main()
