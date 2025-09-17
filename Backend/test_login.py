#!/usr/bin/env python
"""
Test admin login functionality
"""
import os
import sys
import django
from django.test import Client

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

def test_admin_login():
    """Test admin login with correct credentials"""
    client = Client()
    
    print("Testing admin login...")
    
    # Test login with correct credentials
    response = client.post('/api/auth/login/', {
        'username': 'admin',
        'password': 'admin123'
    })
    
    print(f"Login status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print("✅ Login successful!")
        print(f"Response: {data}")
    else:
        print("❌ Login failed!")
        try:
            data = response.json()
            print(f"Error: {data}")
        except:
            print(f"Raw response: {response.content}")

if __name__ == '__main__':
    test_admin_login()
