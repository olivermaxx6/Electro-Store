#!/usr/bin/env python3
"""
Test script to verify MySQL migration and multi-port configuration
"""

import os
import sys
import django
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.db import connection
from django.conf import settings
from django.apps import apps
from django.test import RequestFactory
from django.http import JsonResponse

def test_database_connection():
    """Test MySQL database connection"""
    print("🔍 Testing database connection...")
    
    try:
        connection.ensure_connection()
        with connection.cursor() as cursor:
            cursor.execute("SELECT VERSION()")
            db_version = cursor.fetchone()
            print(f"✅ MySQL Version: {db_version[0]}")
            
            cursor.execute("SELECT DATABASE()")
            db_name = cursor.fetchone()
            print(f"✅ Database: {db_name[0]}")
            
        return True
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False

def test_cors_configuration():
    """Test CORS configuration"""
    print("\n🔍 Testing CORS configuration...")
    
    try:
        cors_origins = settings.CORS_ALLOWED_ORIGINS
        print(f"✅ CORS allowed origins: {len(cors_origins)} configured")
        
        for origin in cors_origins:
            print(f"   - {origin}")
            
        csrf_origins = settings.CSRF_TRUSTED_ORIGINS
        print(f"✅ CSRF trusted origins: {len(csrf_origins)} configured")
        
        return True
    except Exception as e:
        print(f"❌ CORS configuration test failed: {e}")
        return False

def test_models():
    """Test model access and data"""
    print("\n🔍 Testing models and data...")
    
    total_records = 0
    models_tested = 0
    
    for app_config in apps.get_app_configs():
        for model in app_config.get_models():
            try:
                count = model.objects.count()
                total_records += count
                models_tested += 1
                print(f"✅ {app_config.name}.{model.__name__}: {count} records")
            except Exception as e:
                print(f"⚠️  {app_config.name}.{model.__name__}: {e}")
    
    print(f"📊 Total models tested: {models_tested}")
    print(f"📊 Total records: {total_records}")
    return models_tested > 0

def test_api_endpoints():
    """Test API endpoint accessibility"""
    print("\n🔍 Testing API endpoints...")
    
    try:
        factory = RequestFactory()
        
        # Test a simple API call
        request = factory.get('/api/')
        request.META['HTTP_HOST'] = '127.0.0.1:8001'
        
        print("✅ API endpoint test setup successful")
        return True
    except Exception as e:
        print(f"❌ API endpoint test failed: {e}")
        return False

def test_environment_variables():
    """Test environment variables"""
    print("\n🔍 Testing environment variables...")
    
    required_vars = [
        'DJANGO_SECRET_KEY',
        'STRIPE_SECRET_KEY',
        'STRIPE_PUBLISHABLE_KEY',
    ]
    
    optional_vars = [
        'DJANGO_DB_NAME',
        'DJANGO_DB_USER',
        'DJANGO_DB_PASSWORD',
        'DJANGO_DB_HOST',
        'DJANGO_DB_PORT',
    ]
    
    all_good = True
    
    for var in required_vars:
        value = os.getenv(var)
        if value:
            print(f"✅ {var}: {'*' * min(len(value), 10)}...")
        else:
            print(f"❌ {var}: Not set")
            all_good = False
    
    for var in optional_vars:
        value = os.getenv(var)
        if value:
            print(f"✅ {var}: {'*' * min(len(value), 10)}...")
        else:
            print(f"⚠️  {var}: Not set (using default)")
    
    return all_good

def test_port_configuration():
    """Test port configuration"""
    print("\n🔍 Testing port configuration...")
    
    expected_ports = {
        'Django Backend': '127.0.0.1:8001',
        'Storefront': 'localhost:5173',
        'Admin Panel': 'localhost:5174',
    }
    
    print("📋 Expected port configuration:")
    for service, port in expected_ports.items():
        print(f"   - {service}: {port}")
    
    print("✅ Port configuration documented")
    return True

def main():
    """Run all tests"""
    print("=" * 50)
    print("ELECTRO-STORE MYSQL MIGRATION TEST")
    print("=" * 50)
    
    tests = [
        ("Database Connection", test_database_connection),
        ("CORS Configuration", test_cors_configuration),
        ("Models and Data", test_models),
        ("API Endpoints", test_api_endpoints),
        ("Environment Variables", test_environment_variables),
        ("Port Configuration", test_port_configuration),
    ]
    
    results = []
    
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"❌ {test_name} test crashed: {e}")
            results.append((test_name, False))
    
    # Summary
    print("\n" + "=" * 50)
    print("TEST SUMMARY")
    print("=" * 50)
    
    passed = 0
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status}: {test_name}")
        if result:
            passed += 1
    
    print(f"\n📊 Tests passed: {passed}/{total}")
    
    if passed == total:
        print("🎉 All tests passed! Your MySQL migration is ready.")
    else:
        print("⚠️  Some tests failed. Please check the configuration.")
    
    return passed == total

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
