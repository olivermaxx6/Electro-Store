#!/usr/bin/env python3
"""
Simple MySQL Database Setup for Electro Store
This script creates the database and user required for the Django application.
"""

import pymysql
import sys
import os

def setup_mysql_database():
    """Create the electro_store database and electro_user"""
    
    print("Setting up MySQL database for Electro Store...")
    print("=" * 50)
    
    # Try to connect as root (you may need to enter password)
    try:
        print("Connecting to MySQL as root...")
        root_password = input("Enter MySQL root password (or press Enter for empty): ")
        
        connection = pymysql.connect(
            host='localhost',
            user='root',
            password=root_password,
            charset='utf8mb4'
        )
        
        with connection.cursor() as cursor:
            print("Connected to MySQL successfully!")
            
            # Check if database already exists
            cursor.execute("SHOW DATABASES LIKE 'electro_store'")
            db_exists = cursor.fetchone()
            
            if db_exists:
                print("Database 'electro_store' already exists")
            else:
                print("Creating database 'electro_store'...")
                cursor.execute("CREATE DATABASE electro_store CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
                print("Database created successfully!")
            
            # Check if user already exists
            cursor.execute("SELECT User, Host FROM mysql.user WHERE User = 'electro_user'")
            user_exists = cursor.fetchone()
            
            if user_exists:
                print("User 'electro_user' already exists")
                # Update password to ensure it's correct
                cursor.execute("ALTER USER 'electro_user'@'localhost' IDENTIFIED BY 'ElectroStore2024!'")
                print("Updated user password")
            else:
                print("Creating user 'electro_user'...")
                cursor.execute("CREATE USER 'electro_user'@'localhost' IDENTIFIED BY 'ElectroStore2024!'")
                print("User created successfully!")
            
            # Grant privileges
            print("Granting privileges...")
            cursor.execute("GRANT ALL PRIVILEGES ON electro_store.* TO 'electro_user'@'localhost'")
            cursor.execute("FLUSH PRIVILEGES")
            print("Privileges granted successfully!")
            
            # Verify setup
            cursor.execute("SHOW DATABASES LIKE 'electro_store'")
            db_verify = cursor.fetchone()
            
            cursor.execute("SELECT User, Host FROM mysql.user WHERE User = 'electro_user'")
            user_verify = cursor.fetchone()
            
            if db_verify and user_verify:
                print("\nMySQL Setup Completed Successfully!")
                print(f"Database: {db_verify[0]}")
                print(f"User: {user_verify[0]}@{user_verify[1]}")
                print("Password: ElectroStore2024!")
                return True
            else:
                print("Setup verification failed")
                return False
                
    except pymysql.Error as e:
        print(f"MySQL Error: {e}")
        return False
    except KeyboardInterrupt:
        print("\nSetup cancelled by user")
        return False
    except Exception as e:
        print(f"Unexpected Error: {e}")
        return False
    finally:
        if 'connection' in locals():
            connection.close()
            print("Database connection closed")

if __name__ == "__main__":
    print("Electro Store MySQL Setup")
    print("=" * 30)
    
    # Setup MySQL database and user
    success = setup_mysql_database()
    
    if success:
        print("\nAll setup completed successfully!")
        print("Next steps:")
        print("   1. Run migrations: python manage.py migrate")
        print("   2. Create superuser: python manage.py createsuperuser")
        print("   3. Start server: python manage.py runserver")
    else:
        print("\nSetup failed!")
        print("Please check your MySQL root password and try again")
        sys.exit(1)
