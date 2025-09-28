#!/usr/bin/env python3
"""
MySQL Database Setup Script for Electro Store
This script creates the database and user required for the Django application.
"""

import pymysql
import sys

def create_database_and_user():
    """Create the electro_store database and electro_user"""
    
    # MySQL root connection details
    root_host = 'localhost'
    root_user = 'root'
    root_password = input("Enter MySQL root password: ")
    
    try:
        # Connect as root
        connection = pymysql.connect(
            host=root_host,
            user=root_user,
            password=root_password,
            charset='utf8mb4'
        )
        
        with connection.cursor() as cursor:
            # Create database
            print("Creating database 'electro_store'...")
            cursor.execute("CREATE DATABASE IF NOT EXISTS electro_store CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
            
            # Create user
            print("Creating user 'electro_user'...")
            cursor.execute("CREATE USER IF NOT EXISTS 'electro_user'@'localhost' IDENTIFIED BY 'ElectroStore2024!'")
            
            # Grant privileges
            print("Granting privileges...")
            cursor.execute("GRANT ALL PRIVILEGES ON electro_store.* TO 'electro_user'@'localhost'")
            cursor.execute("FLUSH PRIVILEGES")
            
            # Verify creation
            cursor.execute("SHOW DATABASES LIKE 'electro_store'")
            db_exists = cursor.fetchone()
            
            cursor.execute("SELECT User, Host FROM mysql.user WHERE User = 'electro_user'")
            user_exists = cursor.fetchone()
            
            if db_exists and user_exists:
                print("✅ Database and user created successfully!")
                print(f"Database: {db_exists[0]}")
                print(f"User: {user_exists[0]}@{user_exists[1]}")
                return True
            else:
                print("❌ Failed to create database or user")
                return False
                
    except pymysql.Error as e:
        print(f"❌ MySQL Error: {e}")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False
    finally:
        if 'connection' in locals():
            connection.close()

if __name__ == "__main__":
    print("MySQL Database Setup for Electro Store")
    print("=" * 40)
    
    success = create_database_and_user()
    
    if success:
        print("\n🎉 Setup completed successfully!")
        print("You can now run Django migrations with: python manage.py migrate")
    else:
        print("\n💥 Setup failed!")
        sys.exit(1)
