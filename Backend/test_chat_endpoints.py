#!/usr/bin/env python3
"""
Test script to verify chat endpoints are working
"""

import os
import sys
import django
import requests
import json

def setup_django():
    """Setup Django environment"""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
    django.setup()

def test_server_health():
    """Test if the server is running and responding"""
    print("🔍 Testing server health...")
    
    try:
        response = requests.get('http://127.0.0.1:8001/api/admin/health/ping/', timeout=5)
        if response.status_code == 200:
            print("✅ Server is running and responding")
            return True
        else:
            print(f"❌ Server responded with status {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Server is not running or not accessible")
        print("💡 Start the server with: python run_asgi_server.py")
        return False
    except Exception as e:
        print(f"❌ Error testing server: {e}")
        return False

def test_public_chat_endpoints():
    """Test public chat endpoints"""
    print("\n🔍 Testing public chat endpoints...")
    
    try:
        # Test public chat rooms endpoint
        response = requests.get('http://127.0.0.1:8001/api/public/chat-rooms/', timeout=5)
        if response.status_code == 200:
            print("✅ Public chat rooms endpoint is working")
            data = response.json()
            print(f"📊 Found {len(data)} chat rooms")
            return True
        else:
            print(f"❌ Public chat rooms endpoint failed with status {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error testing public endpoints: {e}")
        return False

def test_admin_chat_endpoints():
    """Test admin chat endpoints (without auth for now)"""
    print("\n🔍 Testing admin chat endpoints...")
    
    try:
        # Test admin chat rooms endpoint (should return 401 without auth)
        response = requests.get('http://127.0.0.1:8001/api/admin/chat-rooms/', timeout=5)
        if response.status_code == 401:
            print("✅ Admin chat rooms endpoint is working (requires authentication)")
            return True
        elif response.status_code == 200:
            print("✅ Admin chat rooms endpoint is working")
            return True
        else:
            print(f"❌ Admin chat rooms endpoint failed with status {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error testing admin endpoints: {e}")
        return False

def create_test_chat_room():
    """Create a test chat room"""
    print("\n🔍 Creating test chat room...")
    
    try:
        response = requests.post('http://127.0.0.1:8001/api/public/chat-rooms/', 
                               json={
                                   'customer_name': 'Test Customer',
                                   'customer_email': 'test@example.com',
                                   'customer_phone': '123-456-7890'
                               }, timeout=5)
        
        if response.status_code == 201:
            data = response.json()
            print(f"✅ Test chat room created with ID: {data['id']}")
            return data['id']
        else:
            print(f"❌ Failed to create test chat room: {response.status_code}")
            print(f"Response: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Error creating test chat room: {e}")
        return None

def test_websocket_endpoint():
    """Test WebSocket endpoint availability"""
    print("\n🔍 Testing WebSocket endpoint...")
    
    try:
        # Test if WebSocket endpoint is accessible (this will fail but should give us info)
        response = requests.get('http://127.0.0.1:8001/ws/admin/chat/', timeout=5)
        print(f"WebSocket endpoint response: {response.status_code}")
    except requests.exceptions.ConnectionError:
        print("❌ WebSocket endpoint not accessible via HTTP (this is expected)")
    except Exception as e:
        print(f"WebSocket endpoint test: {e}")

def main():
    """Main test function"""
    print("🚀 Chat System Endpoint Test")
    print("=" * 50)
    
    # Setup Django
    setup_django()
    
    # Test server health
    if not test_server_health():
        print("\n❌ Server is not running. Please start it first:")
        print("   python run_asgi_server.py")
        return
    
    # Test endpoints
    public_ok = test_public_chat_endpoints()
    admin_ok = test_admin_chat_endpoints()
    
    # Create test data
    room_id = create_test_chat_room()
    
    # Test WebSocket
    test_websocket_endpoint()
    
    # Summary
    print("\n📋 Test Summary")
    print("=" * 50)
    print(f"Server Health: {'✅ OK' if True else '❌ FAILED'}")
    print(f"Public Endpoints: {'✅ OK' if public_ok else '❌ FAILED'}")
    print(f"Admin Endpoints: {'✅ OK' if admin_ok else '❌ FAILED'}")
    print(f"Test Chat Room: {'✅ Created' if room_id else '❌ FAILED'}")
    
    if public_ok and admin_ok:
        print("\n🎉 All endpoints are working correctly!")
        print("💬 Your chat system should be functional now.")
        print("\nNext steps:")
        print("1. Open the admin panel in your browser")
        print("2. Navigate to /admin/chat")
        print("3. Check if the chat interface loads without errors")
    else:
        print("\n❌ Some endpoints are not working correctly.")
        print("Please check the server logs for more details.")

if __name__ == '__main__':
    main()
