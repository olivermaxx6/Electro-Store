#!/usr/bin/env python3
"""
Test script to verify WebSocket authentication and connection handling.
Run this after starting the Django server to test the WebSocket endpoints.
"""

import asyncio
import websockets
import json
import sys
from urllib.parse import urlencode

async def test_admin_websocket_with_valid_token():
    """Test admin WebSocket with a valid JWT token"""
    print("Testing admin WebSocket with valid token...")
    
    # You'll need to replace this with a real token from your login
    # For testing, you can get one by logging into the admin panel
    # and checking localStorage.getItem('access_token')
    token = "your_access_token_here"  # Replace with actual token
    
    if token == "your_access_token_here":
        print("⚠️  Please replace 'your_access_token_here' with a real token from admin login")
        return False
    
    try:
        uri = f"ws://127.0.0.1:8001/ws/admin/chat/?token={token}"
        async with websockets.connect(uri) as websocket:
            print("✅ Admin WebSocket connected successfully")
            
            # Wait for initial message
            message = await asyncio.wait_for(websocket.recv(), timeout=5.0)
            data = json.loads(message)
            print(f"📨 Received: {data.get('type', 'unknown')}")
            
            return True
            
    except websockets.exceptions.ConnectionClosed as e:
        print(f"❌ Admin WebSocket closed with code {e.code}: {e.reason}")
        if e.code == 4401:
            print("   → This indicates invalid/expired token")
        elif e.code == 4403:
            print("   → This indicates user is not staff")
        return False
    except Exception as e:
        print(f"❌ Admin WebSocket error: {e}")
        return False

async def test_admin_websocket_without_token():
    """Test admin WebSocket without token (should get 4401)"""
    print("\nTesting admin WebSocket without token...")
    
    try:
        uri = "ws://127.0.0.1:8001/ws/admin/chat/"
        async with websockets.connect(uri) as websocket:
            print("❌ Unexpected: Admin WebSocket connected without token")
            return False
            
    except websockets.exceptions.ConnectionClosed as e:
        print(f"✅ Admin WebSocket correctly closed with code {e.code}: {e.reason}")
        if e.code == 4401:
            print("   → Correctly rejected unauthorized connection")
            return True
        else:
            print(f"   → Unexpected close code: {e.code}")
            return False
    except Exception as e:
        print(f"❌ Admin WebSocket error: {e}")
        return False

async def test_customer_websocket():
    """Test customer WebSocket (should work without token)"""
    print("\nTesting customer WebSocket (anonymous)...")
    
    try:
        # Use a test room ID
        room_id = "test-room-123"
        uri = f"ws://127.0.0.1:8001/ws/chat/{room_id}/"
        async with websockets.connect(uri) as websocket:
            print("✅ Customer WebSocket connected successfully")
            
            # Wait for initial message
            try:
                message = await asyncio.wait_for(websocket.recv(), timeout=5.0)
                data = json.loads(message)
                print(f"📨 Received: {data.get('type', 'unknown')}")
            except asyncio.TimeoutError:
                print("⏰ No initial message received (this might be normal)")
            
            # Send a test message
            test_message = {
                "type": "chat_message",
                "content": "Hello from test script"
            }
            await websocket.send(json.dumps(test_message))
            print("📤 Sent test message")
            
            return True
            
    except websockets.exceptions.ConnectionClosed as e:
        print(f"❌ Customer WebSocket closed with code {e.code}: {e.reason}")
        return False
    except Exception as e:
        print(f"❌ Customer WebSocket error: {e}")
        return False

async def main():
    """Run all WebSocket tests"""
    print("🧪 WebSocket Authentication Test Suite")
    print("=" * 50)
    
    # Test 1: Admin with valid token
    admin_valid = await test_admin_websocket_with_valid_token()
    
    # Test 2: Admin without token
    admin_no_token = await test_admin_websocket_without_token()
    
    # Test 3: Customer WebSocket
    customer_ws = await test_customer_websocket()
    
    print("\n" + "=" * 50)
    print("📊 Test Results:")
    print(f"  Admin with valid token: {'✅ PASS' if admin_valid else '❌ FAIL'}")
    print(f"  Admin without token:   {'✅ PASS' if admin_no_token else '❌ FAIL'}")
    print(f"  Customer WebSocket:    {'✅ PASS' if customer_ws else '❌ FAIL'}")
    
    if all([admin_valid, admin_no_token, customer_ws]):
        print("\n🎉 All tests passed!")
        return 0
    else:
        print("\n⚠️  Some tests failed. Check the output above.")
        return 1

if __name__ == "__main__":
    try:
        exit_code = asyncio.run(main())
        sys.exit(exit_code)
    except KeyboardInterrupt:
        print("\n⏹️  Test interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n💥 Test suite error: {e}")
        sys.exit(1)
