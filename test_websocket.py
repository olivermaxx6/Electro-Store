#!/usr/bin/env python3
"""
Simple WebSocket test script to verify chat functionality
"""
import asyncio
import websockets
import json
import uuid

async def test_customer_websocket():
    """Test customer WebSocket connection"""
    room_id = str(uuid.uuid4())
    uri = f"ws://127.0.0.1:8001/ws/chat/{room_id}/"
    
    try:
        async with websockets.connect(uri) as websocket:
            print(f"✅ Connected to customer WebSocket: {uri}")
            
            # Wait for room_info message
            message = await websocket.recv()
            data = json.loads(message)
            print(f"📨 Received: {data['type']}")
            
            # Send a test message
            test_message = {
                "type": "chat_message",
                "content": "Hello from test customer!"
            }
            await websocket.send(json.dumps(test_message))
            print("📤 Sent test message")
            
            # Wait for response
            response = await websocket.recv()
            response_data = json.loads(response)
            print(f"📨 Received response: {response_data}")
            
    except Exception as e:
        print(f"❌ Customer WebSocket test failed: {e}")

async def test_admin_websocket():
    """Test admin WebSocket connection"""
    uri = "ws://127.0.0.1:8001/ws/admin/chat/"
    
    try:
        async with websockets.connect(uri) as websocket:
            print(f"✅ Connected to admin WebSocket: {uri}")
            
            # Wait for room_list message
            message = await websocket.recv()
            data = json.loads(message)
            print(f"📨 Received: {data['type']}")
            
    except Exception as e:
        print(f"❌ Admin WebSocket test failed: {e}")

async def main():
    """Run all WebSocket tests"""
    print("🧪 Testing WebSocket connections...")
    print("=" * 50)
    
    print("\n1. Testing Customer WebSocket:")
    await test_customer_websocket()
    
    print("\n2. Testing Admin WebSocket:")
    await test_admin_websocket()
    
    print("\n✅ WebSocket tests completed!")

if __name__ == "__main__":
    asyncio.run(main())
