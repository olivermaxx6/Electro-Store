#!/usr/bin/env python3
"""
Stripe Integration Test Runner

This script runs all Stripe integration tests with proper setup and configuration.
It ensures the environment is properly configured and provides detailed test results.
"""

import os
import sys
import django
from django.conf import settings
from django.test.utils import get_runner
from django.core.management import execute_from_command_line

def setup_django():
    """Setup Django environment"""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
    django.setup()

def check_stripe_configuration():
    """Verify Stripe configuration is correct"""
    print("🔍 Checking Stripe configuration...")
    
    # Check if Stripe keys are set
    if not hasattr(settings, 'STRIPE_SECRET_KEY'):
        print("❌ STRIPE_SECRET_KEY not found in settings")
        return False
    
    if not hasattr(settings, 'STRIPE_PUBLISHABLE_KEY'):
        print("❌ STRIPE_PUBLISHABLE_KEY not found in settings")
        return False
    
    # Check if using test keys
    if not settings.STRIPE_SECRET_KEY.startswith('sk_test_'):
        print("❌ WARNING: Not using Stripe test keys!")
        print("   This is required for safe testing.")
        return False
    
    if not settings.STRIPE_PUBLISHABLE_KEY.startswith('pk_test_'):
        print("❌ WARNING: Not using Stripe test publishable key!")
        return False
    
    print("✅ Stripe configuration verified")
    print(f"   Secret Key: {settings.STRIPE_SECRET_KEY[:20]}...")
    print(f"   Publishable Key: {settings.STRIPE_PUBLISHABLE_KEY[:20]}...")
    return True

def run_migrations():
    """Run database migrations"""
    print("🔄 Running database migrations...")
    try:
        execute_from_command_line(['manage.py', 'migrate', '--verbosity=0'])
        print("✅ Migrations completed")
        return True
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        return False

def run_stripe_tests():
    """Run all Stripe integration tests"""
    print("🧪 Running Stripe integration tests...")
    
    test_modules = [
        'test_stripe_integration',
        'test_stripe_webhook'
    ]
    
    TestRunner = get_runner(settings)
    test_runner = TestRunner(verbosity=2, interactive=False)
    
    try:
        failures = test_runner.run_tests(test_modules)
        
        if failures:
            print(f"\n❌ {failures} test(s) failed")
            return False
        else:
            print("\n✅ All Stripe integration tests passed!")
            return True
            
    except Exception as e:
        print(f"❌ Test execution failed: {e}")
        return False

def run_specific_test(test_name):
    """Run a specific test module"""
    print(f"🧪 Running specific test: {test_name}")
    
    TestRunner = get_runner(settings)
    test_runner = TestRunner(verbosity=2, interactive=False)
    
    try:
        failures = test_runner.run_tests([test_name])
        
        if failures:
            print(f"\n❌ {failures} test(s) failed in {test_name}")
            return False
        else:
            print(f"\n✅ All tests passed in {test_name}!")
            return True
            
    except Exception as e:
        print(f"❌ Test execution failed: {e}")
        return False

def main():
    """Main test runner function"""
    print("🚀 Stripe Integration Test Runner")
    print("=" * 50)
    
    # Setup Django
    setup_django()
    
    # Check configuration
    if not check_stripe_configuration():
        print("\n❌ Configuration check failed. Exiting.")
        sys.exit(1)
    
    # Run migrations
    if not run_migrations():
        print("\n❌ Migration failed. Exiting.")
        sys.exit(1)
    
    # Check command line arguments
    if len(sys.argv) > 1:
        test_name = sys.argv[1]
        if test_name in ['test_stripe_integration', 'test_stripe_webhook']:
            success = run_specific_test(test_name)
        else:
            print(f"❌ Unknown test module: {test_name}")
            print("Available tests: test_stripe_integration, test_stripe_webhook")
            sys.exit(1)
    else:
        # Run all tests
        success = run_stripe_tests()
    
    if success:
        print("\n🎉 All tests completed successfully!")
        sys.exit(0)
    else:
        print("\n💥 Some tests failed!")
        sys.exit(1)

if __name__ == '__main__':
    main()
