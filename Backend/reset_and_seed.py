#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Convenience script to clear the database and seed it with fresh data.
This script runs both clear_database and seed_database Django management commands.
"""

import os
import sys
import subprocess

def run_django_command(command):
    """Run a Django management command and return success status"""
    try:
        print(f"\n🚀 Running: python manage.py {command}")
        result = subprocess.run([sys.executable, "manage.py", command], 
                              capture_output=True, text=True, cwd=os.path.dirname(__file__))
        
        if result.returncode == 0:
            print(result.stdout)
            return True
        else:
            print(f"❌ Error running {command}:")
            print(result.stderr)
            return False
            
    except Exception as e:
        print(f"❌ Exception running {command}: {e}")
        return False

def main():
    """Main function to reset and seed the database"""
    print("🔄 Starting database reset and seed process...")
    
    # Step 1: Clear database
    if not run_django_command("clear_database"):
        print("❌ Failed to clear database. Aborting.")
        sys.exit(1)
    
    # Step 2: Seed database
    if not run_django_command("seed_database"):
        print("❌ Failed to seed database.")
        sys.exit(1)
    
    print("\n🎉 Database reset and seed completed successfully!")
    print("🌐 Your ecommerce store is now ready with:")
    print("  • Products with categories and brands")
    print("  • Services with detailed information")
    print("  • Store settings and contact information")
    print("  • Reviews and ratings")
    print("  • Website content and banners")
    print("  • All images using anime.jpg")

if __name__ == "__main__":
    main()