#!/usr/bin/env python3
"""
Test script for WebSocket chat functionality
"""
import asyncio
import websockets
import json
import requests
import sys

# Configuration
BASE_URL = "http://127.0.0.1:8001"
WS_URL = "ws://127.0.0.1:8001"
ADMIN_EMAIL = "admin@example.com"
ADMIN_PASSWORD = "admin123"

def get_auth_token():
    """Get admin authentication token"""
    try:
        response = requests.post(f"{BASE_URL}/api/auth/login/", {
            "username": "admin",
            "password": ADMIN_PASSWORD
        })
        
        if response.status_code == 200:
            data = response.json()
            return data.get('access')
        else:
            print(f"Login failed: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print(f"Error getting auth token: {e}")
        return None

def create_test_chat_room():
    """Create a test chat room"""
    try:
        response = requests.post(f"{BASE_URL}/api/public/chat-rooms/", {
            "customer_name": "Test Customer",
            "customer_email": "test@example.com",
            "customer_phone": "+1234567890"
        })
        
        if response.status_code == 201:
            return response.json()
        else:
            print(f"Failed to create chat room: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print(f"Error creating chat room: {e}")
        return None

async def test_customer_websocket(room_id):
    """Test customer WebSocket connection"""
    print(f"\n🔗 Testing customer WebSocket connection to room {room_id}")
    
    try:
        uri = f"{WS_URL}/ws/chat/{room_id}/"
        print(f"Connecting to: {uri}")
        
        async with websockets.connect(uri) as websocket:
            print("✅ Customer WebSocket connected successfully!")
            
            # Wait for room info
            message = await websocket.recv()
            data = json.loads(message)
            print(f"📨 Received room info: {data}")
            
            # Send a test message
            test_message = {
                "type": "chat_message",
                "content": "Hello from customer test!"
            }
            await websocket.send(json.dumps(test_message))
            print("📤 Sent test message")
            
            # Wait for response
            response = await websocket.recv()
            data = json.loads(response)
            print(f"📨 Received response: {data}")
            
            return True
            
    except Exception as e:
        print(f"❌ Customer WebSocket test failed: {e}")
        return False

async def test_admin_websocket(token):
    """Test admin WebSocket connection"""
    print(f"\n🔗 Testing admin WebSocket connection")
    
    try:
        uri = f"{WS_URL}/ws/admin/chat/?token={token}"
        print(f"Connecting to: {uri}")
        
        async with websockets.connect(uri) as websocket:
            print("✅ Admin WebSocket connected successfully!")
            
            # Wait for room list
            message = await websocket.recv()
            data = json.loads(message)
            print(f"📨 Received room list: {len(data.get('rooms', []))} rooms")
            
            return True
            
    except Exception as e:
        print(f"❌ Admin WebSocket test failed: {e}")
        return False

async def main():
    """Main test function"""
    print("🚀 Starting WebSocket Chat Tests")
    print("=" * 50)
    
    # Test 1: Get authentication token
    print("\n1️⃣ Testing authentication...")
    token = get_auth_token()
    if not token:
        print("❌ Failed to get auth token")
        return
    print("✅ Authentication successful")
    
    # Test 2: Create test chat room
    print("\n2️⃣ Creating test chat room...")
    room = create_test_chat_room()
    if not room:
        print("❌ Failed to create chat room")
        return
    print(f"✅ Chat room created: {room['id']}")
    
    # Test 3: Test customer WebSocket
    customer_success = await test_customer_websocket(room['id'])
    
    # Test 4: Test admin WebSocket
    admin_success = await test_admin_websocket(token)
    
    # Results
    print("\n" + "=" * 50)
    print("📊 Test Results:")
    print(f"Customer WebSocket: {'✅ PASS' if customer_success else '❌ FAIL'}")
    print(f"Admin WebSocket: {'✅ PASS' if admin_success else '❌ FAIL'}")
    
    if customer_success and admin_success:
        print("\n🎉 All tests passed! WebSocket chat is working correctly.")
    else:
        print("\n⚠️ Some tests failed. Check the logs above for details.")

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n🛑 Tests interrupted by user")
    except Exception as e:
        print(f"\n💥 Unexpected error: {e}")
        sys.exit(1)
