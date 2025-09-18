#!/usr/bin/env python3
"""
Simple WebSocket test script to verify admin chat connection
"""

import asyncio
import websockets
import json
import requests
import time

async def test_admin_websocket():
    """Test admin WebSocket connection"""
    
    # First, test HTTP endpoint
    print("Testing HTTP endpoint...")
    try:
        response = requests.get('http://127.0.0.1:8001/api/admin/health/ping/')
        print(f"HTTP Status: {response.status_code}, Response: {response.text}")
    except Exception as e:
        print(f"HTTP Error: {e}")
        return
    
    # Test WebSocket connection
    print("\nTesting WebSocket connection...")
    
    # Admin WebSocket URL (without auth token for now)
    ws_url = "ws://127.0.0.1:8001/ws/admin/chat/"
    
    try:
        async with websockets.connect(ws_url) as websocket:
            print("WebSocket connected successfully!")
            
            # Wait for messages
            try:
                message = await asyncio.wait_for(websocket.recv(), timeout=5.0)
                data = json.loads(message)
                print(f"Received message: {data}")
            except asyncio.TimeoutError:
                print("No message received within 5 seconds")
            except Exception as e:
                print(f"Error receiving message: {e}")
                
    except Exception as e:
        print(f"WebSocket connection failed: {e}")

if __name__ == "__main__":
    print("Starting WebSocket test...")
    print("Make sure the Django server is running on port 8001")
    print("=" * 50)
    
    # Wait a moment for server to start
    time.sleep(2)
    
    asyncio.run(test_admin_websocket())
