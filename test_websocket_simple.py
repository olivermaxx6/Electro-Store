#!/usr/bin/env python3
"""
Simple WebSocket connection test
"""
import asyncio
import websockets
import json

async def test_websocket():
    try:
        print("Testing WebSocket connection...")
        
        # Test customer WebSocket
        uri = "ws://127.0.0.1:8001/ws/chat/test-room/"
        print(f"Connecting to: {uri}")
        
        async with websockets.connect(uri) as websocket:
            print("✅ WebSocket connected successfully!")
            
            # Send a test message
            message = {"type": "test", "content": "Hello"}
            await websocket.send(json.dumps(message))
            print("📤 Sent test message")
            
            # Wait for response
            response = await websocket.recv()
            print(f"📨 Received: {response}")
            
    except Exception as e:
        print(f"❌ WebSocket test failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_websocket())
