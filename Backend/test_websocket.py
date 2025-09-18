#!/usr/bin/env python3
"""
Test WebSocket connection to verify ASGI setup is working
"""

import asyncio
import websockets
import json
import sys

async def test_websocket():
    """Test WebSocket connection to the Django server"""
    
    # Test admin WebSocket endpoint
    admin_url = "ws://127.0.0.1:8001/ws/admin/chat/"
    print(f"Testing admin WebSocket connection to: {admin_url}")
    
    try:
        async with websockets.connect(admin_url) as websocket:
            print("✅ Admin WebSocket connection successful!")
            
            # Send a test message
            test_message = {
                "type": "test",
                "message": "Hello from test client"
            }
            await websocket.send(json.dumps(test_message))
            print("✅ Test message sent successfully!")
            
            # Wait for response (with timeout)
            try:
                response = await asyncio.wait_for(websocket.recv(), timeout=5.0)
                print(f"✅ Received response: {response}")
            except asyncio.TimeoutError:
                print("⚠️ No response received (timeout)")
                
    except websockets.exceptions.ConnectionRefused:
        print("❌ WebSocket connection refused - server not running or not ASGI")
        return False
    except Exception as e:
        print(f"❌ WebSocket connection failed: {e}")
        return False
    
    # Test customer WebSocket endpoint
    customer_url = "ws://127.0.0.1:8001/ws/chat/test-room/"
    print(f"\nTesting customer WebSocket connection to: {customer_url}")
    
    try:
        async with websockets.connect(customer_url) as websocket:
            print("✅ Customer WebSocket connection successful!")
            
            # Send a test message
            test_message = {
                "type": "chat_message",
                "content": "Hello from test customer"
            }
            await websocket.send(json.dumps(test_message))
            print("✅ Test message sent successfully!")
            
            # Wait for response (with timeout)
            try:
                response = await asyncio.wait_for(websocket.recv(), timeout=5.0)
                print(f"✅ Received response: {response}")
            except asyncio.TimeoutError:
                print("⚠️ No response received (timeout)")
                
    except websockets.exceptions.ConnectionRefused:
        print("❌ Customer WebSocket connection refused - server not running or not ASGI")
        return False
    except Exception as e:
        print(f"❌ Customer WebSocket connection failed: {e}")
        return False
    
    return True

async def main():
    print("=== WebSocket Connection Test ===")
    print("Make sure the Django ASGI server is running on port 8001")
    print("Run: uvicorn core.asgi:application --host 127.0.0.1 --port 8001")
    print()
    
    success = await test_websocket()
    
    if success:
        print("\n🎉 All WebSocket tests passed! The chat system should work correctly.")
    else:
        print("\n❌ WebSocket tests failed. Please check:")
        print("1. Django server is running with ASGI (uvicorn)")
        print("2. Server is accessible on port 8001")
        print("3. WebSocket endpoints are properly configured")

if __name__ == "__main__":
    asyncio.run(main())