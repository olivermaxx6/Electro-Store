#!/usr/bin/env python3
"""
Simple WebSocket test to check if WebSocket routing works at all
"""
import asyncio
import websockets
import json

async def test_simple_websocket():
    """Test simple WebSocket connection"""
    print("🧪 Simple WebSocket Test")
    print("=" * 30)
    
    # Test the customer chat WebSocket (should work without auth)
    ws_url = "ws://127.0.0.1:8001/ws/chat/test-room/"
    print(f"🔗 Testing URL: {ws_url}")
    
    try:
        async with websockets.connect(ws_url) as websocket:
            print("✅ WebSocket connected successfully!")
            
            # Wait for initial message
            try:
                message = await asyncio.wait_for(websocket.recv(), timeout=5.0)
                data = json.loads(message)
                print(f"📨 Received: {data}")
            except asyncio.TimeoutError:
                print("⏰ No initial message received")
            
            return True
            
    except websockets.exceptions.ConnectionClosed as e:
        print(f"❌ WebSocket connection closed: {e}")
        return False
    except Exception as e:
        print(f"❌ WebSocket error: {e}")
        return False

if __name__ == "__main__":
    success = asyncio.run(test_simple_websocket())
    if success:
        print("\n🎉 Simple WebSocket test passed!")
    else:
        print("\n💥 Simple WebSocket test failed!")
